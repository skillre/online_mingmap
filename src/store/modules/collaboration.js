import { io } from 'socket.io-client'

const state = {
  socket: null,
  connected: false,
  roomId: null,
  users: [],
  operations: [],
  conflicts: []
}

const getters = {
  isConnected: state => state.connected,
  currentRoom: state => state.roomId,
  onlineUsers: state => state.users,
  pendingOperations: state => state.operations,
  conflicts: state => state.conflicts
}

const mutations = {
  SET_SOCKET(state, socket) {
    state.socket = socket
  },
  
  SET_CONNECTED(state, connected) {
    state.connected = connected
  },
  
  SET_ROOM_ID(state, roomId) {
    state.roomId = roomId
  },
  
  SET_USERS(state, users) {
    state.users = users
  },
  
  ADD_USER(state, user) {
    const existingIndex = state.users.findIndex(u => u.id === user.id)
    if (existingIndex === -1) {
      state.users.push(user)
    } else {
      state.users.splice(existingIndex, 1, user)
    }
  },
  
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(user => user.id !== userId)
  },
  
  ADD_OPERATION(state, operation) {
    state.operations.push(operation)
  },
  
  REMOVE_OPERATION(state, operationId) {
    state.operations = state.operations.filter(op => op.id !== operationId)
  },
  
  ADD_CONFLICT(state, conflict) {
    state.conflicts.push(conflict)
  },
  
  REMOVE_CONFLICT(state, conflictId) {
    state.conflicts = state.conflicts.filter(c => c.id !== conflictId)
  },
  
  CLEAR_OPERATIONS(state) {
    state.operations = []
  },
  
  CLEAR_CONFLICTS(state) {
    state.conflicts = []
  }
}

const actions = {
  // 连接到协同编辑服务器
  connect({ commit, dispatch, rootGetters }, { roomId, token }) {
    if (state.socket) {
      state.socket.disconnect()
    }
    
    const socket = io(process.env.VUE_APP_COLLABORATION_URL || 'ws://localhost:3001', {
      auth: {
        token
      }
    })
    
    socket.on('connect', () => {
      commit('SET_CONNECTED', true)
      socket.emit('join-room', { roomId })
    })
    
    socket.on('disconnect', () => {
      commit('SET_CONNECTED', false)
    })
    
    socket.on('room-joined', (data) => {
      commit('SET_ROOM_ID', data.roomId)
      commit('SET_USERS', data.users)
    })
    
    socket.on('user-joined', (user) => {
      commit('ADD_USER', user)
    })
    
    socket.on('user-left', (userId) => {
      commit('REMOVE_USER', userId)
    })
    
    socket.on('operation', (operation) => {
      dispatch('handleRemoteOperation', operation)
    })
    
    socket.on('conflict', (conflict) => {
      commit('ADD_CONFLICT', conflict)
    })
    
    socket.on('operation-ack', (operationId) => {
      commit('REMOVE_OPERATION', operationId)
    })
    
    commit('SET_SOCKET', socket)
  },
  
  // 断开连接
  disconnect({ commit }) {
    if (state.socket) {
      state.socket.disconnect()
      commit('SET_SOCKET', null)
      commit('SET_CONNECTED', false)
      commit('SET_ROOM_ID', null)
      commit('SET_USERS', [])
      commit('CLEAR_OPERATIONS')
      commit('CLEAR_CONFLICTS')
    }
  },
  
  // 发送操作
  sendOperation({ state, commit }, operation) {
    if (!state.socket || !state.connected) {
      return false
    }
    
    const operationWithId = {
      ...operation,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      userId: this.getters['auth/currentUser']?.id
    }
    
    commit('ADD_OPERATION', operationWithId)
    state.socket.emit('operation', operationWithId)
    
    return operationWithId.id
  },
  
  // 处理远程操作
  handleRemoteOperation({ commit, dispatch }, operation) {
    // 根据操作类型处理
    switch (operation.type) {
      case 'add-node':
        dispatch('handleAddNode', operation)
        break
      case 'delete-node':
        dispatch('handleDeleteNode', operation)
        break
      case 'update-node':
        dispatch('handleUpdateNode', operation)
        break
      case 'move-node':
        dispatch('handleMoveNode', operation)
        break
      default:
        console.warn('未知的操作类型:', operation.type)
    }
  },
  
  // 处理添加节点操作
  handleAddNode({ dispatch }, operation) {
    dispatch('editor/addNode', {
      parentNode: operation.data.parentNode,
      nodeData: operation.data.nodeData
    }, { root: true })
  },
  
  // 处理删除节点操作
  handleDeleteNode({ dispatch }, operation) {
    dispatch('editor/deleteNode', operation.data.node, { root: true })
  },
  
  // 处理更新节点操作
  handleUpdateNode({ dispatch }, operation) {
    if (operation.data.text) {
      dispatch('editor/updateNodeText', {
        node: operation.data.node,
        text: operation.data.text
      }, { root: true })
    }
    
    if (operation.data.style) {
      dispatch('editor/updateNodeStyle', {
        node: operation.data.node,
        style: operation.data.style
      }, { root: true })
    }
  },
  
  // 处理移动节点操作
  handleMoveNode({ dispatch }, operation) {
    // 这里需要实现节点移动的逻辑
    console.log('移动节点操作:', operation)
  },
  
  // 解决冲突
  resolveConflict({ commit, state }, { conflictId, resolution }) {
    const conflict = state.conflicts.find(c => c.id === conflictId)
    if (!conflict) return
    
    // 根据解决方案处理冲突
    switch (resolution) {
      case 'accept-remote':
        // 接受远程操作
        break
      case 'accept-local':
        // 接受本地操作
        break
      case 'merge':
        // 合并操作
        break
    }
    
    commit('REMOVE_CONFLICT', conflictId)
  },
  
  // 发送光标位置
  sendCursorPosition({ state }, { nodeId, position }) {
    if (!state.socket || !state.connected) {
      return
    }
    
    state.socket.emit('cursor-position', {
      nodeId,
      position,
      userId: this.getters['auth/currentUser']?.id
    })
  },
  
  // 处理光标位置更新
  handleCursorPositionUpdate({ commit }, cursorData) {
    // 更新其他用户的光标位置
    commit('UPDATE_USER_CURSOR', cursorData)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}