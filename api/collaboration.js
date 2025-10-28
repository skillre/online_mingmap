const { Server } = require('socket.io')

// 存储房间和用户信息
const rooms = new Map()
const users = new Map()

// 操作历史记录
const operationHistory = new Map()

module.exports = (req, res) => {
  if (!res.socket.server.io) {
    console.log('初始化Socket.IO服务器...')
    
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    
    res.socket.server.io = io
    
    // 连接处理
    io.on('connection', (socket) => {
      console.log('用户连接:', socket.id)
      
      // 用户认证
      socket.on('authenticate', (data) => {
        const { token, user } = data
        
        if (token && user) {
          users.set(socket.id, {
            id: user.id,
            name: user.name || user.login,
            login: user.login,
            avatar_url: user.avatar_url,
            socketId: socket.id,
            token: token
          })
          
          socket.emit('authenticated', { success: true })
          console.log('用户认证成功:', user.login)
        } else {
          socket.emit('authenticated', { success: false, error: '认证失败' })
        }
      })
      
      // 加入房间
      socket.on('join-room', (data) => {
        const { roomId } = data
        const user = users.get(socket.id)
        
        if (!user) {
          socket.emit('error', { message: '请先进行认证' })
          return
        }
        
        // 离开之前的房间
        if (socket.roomId) {
          socket.leave(socket.roomId)
          leaveRoom(socket, socket.roomId)
        }
        
        // 加入新房间
        socket.join(roomId)
        socket.roomId = roomId
        
        // 更新房间信息
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            id: roomId,
            users: new Map(),
            createdAt: new Date(),
            lastActivity: new Date()
          })
          operationHistory.set(roomId, [])
        }
        
        const room = rooms.get(roomId)
        room.users.set(socket.id, user)
        room.lastActivity = new Date()
        
        // 通知房间内其他用户
        socket.to(roomId).emit('user-joined', user)
        
        // 发送房间信息给新用户
        socket.emit('room-joined', {
          roomId: roomId,
          users: Array.from(room.users.values()),
          history: operationHistory.get(roomId) || []
        })
        
        console.log(`用户 ${user.login} 加入房间 ${roomId}`)
      })
      
      // 处理操作
      socket.on('operation', (data) => {
        const user = users.get(socket.id)
        const roomId = socket.roomId
        
        if (!user || !roomId) {
          socket.emit('error', { message: '未加入房间' })
          return
        }
        
        const room = rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: '房间不存在' })
          return
        }
        
        // 添加时间戳和用户信息
        const operation = {
          ...data,
          id: data.id || Date.now() + Math.random(),
          timestamp: Date.now(),
          userId: user.id,
          userName: user.login
        }
        
        // 检测冲突
        const conflicts = detectConflicts(operation, operationHistory.get(roomId) || [])
        
        if (conflicts.length > 0) {
          // 有冲突，发送冲突信息
          socket.emit('conflict', {
            operation: operation,
            conflicts: conflicts
          })
        } else {
          // 无冲突，广播操作
          operationHistory.get(roomId).push(operation)
          
          // 限制历史记录长度
          const history = operationHistory.get(roomId)
          if (history.length > 1000) {
            history.splice(0, history.length - 1000)
          }
          
          room.lastActivity = new Date()
          
          // 广播给房间内其他用户
          socket.to(roomId).emit('operation', operation)
          
          // 发送确认给发送者
          socket.emit('operation-ack', operation.id)
        }
      })
      
      // 光标位置更新
      socket.on('cursor-position', (data) => {
        const user = users.get(socket.id)
        const roomId = socket.roomId
        
        if (!user || !roomId) return
        
        const cursorData = {
          ...data,
          userId: user.id,
          userName: user.login,
          timestamp: Date.now()
        }
        
        socket.to(roomId).emit('cursor-position', cursorData)
      })
      
      // 断开连接处理
      socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id)
        
        const user = users.get(socket.id)
        if (user && socket.roomId) {
          leaveRoom(socket, socket.roomId)
          
          // 通知房间内其他用户
          socket.to(socket.roomId).emit('user-left', user.id)
        }
        
        users.delete(socket.id)
      })
      
      // 错误处理
      socket.on('error', (error) => {
        console.error('Socket错误:', error)
      })
    })
    
    // 定期清理空房间
    setInterval(() => {
      cleanupEmptyRooms()
    }, 60000) // 每分钟清理一次
  }
  
  res.status(200).json({ status: 'Socket.IO服务器运行中' })
}

// 离开房间
function leaveRoom(socket, roomId) {
  const room = rooms.get(roomId)
  if (room) {
    room.users.delete(socket.id)
    
    // 如果房间为空，删除房间
    if (room.users.size === 0) {
      rooms.delete(roomId)
      operationHistory.delete(roomId)
      console.log(`房间 ${roomId} 已删除`)
    }
  }
  
  socket.leave(roomId)
  delete socket.roomId
}

// 检测操作冲突
function detectConflicts(operation, history) {
  const conflicts = []
  const recentOperations = history.slice(-10) // 只检查最近10个操作
  
  for (const op of recentOperations) {
    if (op.userId === operation.userId) continue // 跳过同一用户的操作
    
    // 检查节点操作冲突
    if (operation.type === 'delete-node' && op.type === 'update-node') {
      if (operation.data.nodeId === op.data.nodeId) {
        conflicts.push({
          type: 'delete-update-conflict',
          operation1: operation,
          operation2: op
        })
      }
    }
    
    if (operation.type === 'update-node' && op.type === 'delete-node') {
      if (operation.data.nodeId === op.data.nodeId) {
        conflicts.push({
          type: 'update-delete-conflict',
          operation1: operation,
          operation2: op
        })
      }
    }
    
    // 检查移动节点冲突
    if (operation.type === 'move-node' && op.type === 'move-node') {
      if (operation.data.nodeId === op.data.nodeId) {
        conflicts.push({
          type: 'move-conflict',
          operation1: operation,
          operation2: op
        })
      }
    }
  }
  
  return conflicts
}

// 清理空房间
function cleanupEmptyRooms() {
  const now = Date.now()
  const timeout = 30 * 60 * 1000 // 30分钟超时
  
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.size === 0 || (now - room.lastActivity.getTime()) > timeout) {
      rooms.delete(roomId)
      operationHistory.delete(roomId)
      console.log(`清理房间 ${roomId}`)
    }
  }
}