// 格式化文件大小
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export function formatDate(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 深拷贝对象
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 防抖函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 获取文件扩展名
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// 检查是否为思维导图文件
export function isMindMapFile(filename) {
  const extension = getFileExtension(filename).toLowerCase()
  return ['mmap', 'mm', 'xmind'].includes(extension)
}

// 生成随机颜色
export function generateRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 验证GitHub用户名
export function validateGitHubUsername(username) {
  const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/
  return githubUsernameRegex.test(username)
}

// 验证仓库名称
export function validateGitHubRepoName(repoName) {
  const githubRepoRegex = /^[a-zA-Z0-9._-]+$/
  return githubRepoRegex.test(repoName) && repoName.length <= 100
}

// 解析GitHub仓库URL
export function parseGitHubRepoUrl(url) {
  const regex = /github\.com\/([^\/]+)\/([^\/\?#]+)/
  const match = url.match(regex)
  
  if (match) {
    return {
      owner: match[1],
      repo: match[2]
    }
  }
  
  return null
}

// 生成分享链接
export function generateShareUrl(fileId) {
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${fileId}`
}

// 下载文件
export function downloadFile(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 读取文件内容
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = (e) => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file)
  })
}

// 检查浏览器支持
export function checkBrowserSupport() {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    canvas: !!document.createElement('canvas').getContext,
    svg: !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,
    webSocket: typeof WebSocket !== 'undefined'
  }
  
  const unsupported = Object.keys(features).filter(key => !features[key])
  
  if (unsupported.length > 0) {
    console.warn('浏览器不支持以下功能:', unsupported)
  }
  
  return {
    supported: unsupported.length === 0,
    features,
    unsupported
  }
}

// 错误处理
export function handleError(error, context = '') {
  console.error(`错误发生在 ${context}:`, error)
  
  // 这里可以添加错误上报逻辑
  if (process.env.NODE_ENV === 'production') {
    // 上报错误到监控服务
    // reportError(error, context)
  }
  
  return {
    message: error.message || '发生未知错误',
    context,
    timestamp: new Date().toISOString()
  }
}

// 本地存储工具
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('保存到本地存储失败:', error)
      return false
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('从本地存储读取失败:', error)
      return defaultValue
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('从本地存储删除失败:', error)
      return false
    }
  },
  
  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('清空本地存储失败:', error)
      return false
    }
  }
}

// 会话存储工具
export const sessionStorage = {
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('保存到会话存储失败:', error)
      return false
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('从会话存储读取失败:', error)
      return defaultValue
    }
  },
  
  remove(key) {
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('从会话存储删除失败:', error)
      return false
    }
  }
}