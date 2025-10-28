import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || '/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('github_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 未授权，清除本地token
      localStorage.removeItem('github_token')
      window.location.href = '/'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export const githubAuth = {
  // 获取GitHub OAuth授权URL
  async getAuthUrl() {
    try {
      const response = await apiClient.get('/auth/github')
      return response.data.auth_url
    } catch (error) {
      console.error('获取授权URL失败:', error)
      throw new Error('获取GitHub授权链接失败')
    }
  },
  
  // 处理OAuth回调
  async handleCallback(code, state) {
    try {
      const response = await apiClient.post('/auth/github/callback', {
        code,
        state
      })
      
      const { access_token, user } = response.data
      
      // 存储token
      localStorage.setItem('github_token', access_token)
      
      return {
        access_token,
        user
      }
    } catch (error) {
      console.error('处理OAuth回调失败:', error)
      throw new Error('GitHub认证失败')
    }
  },
  
  // 获取用户信息
  async getUserInfo(token) {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`
        }
      })
      
      return {
        id: response.data.id,
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        html_url: response.data.html_url
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw new Error('获取GitHub用户信息失败')
    }
  },
  
  // 获取用户仓库列表
  async getUserRepos(token) {
    try {
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `token ${token}`
        },
        params: {
          type: 'owner',
          sort: 'updated',
          per_page: 100
        }
      })
      
      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        default_branch: repo.default_branch
      }))
    } catch (error) {
      console.error('获取仓库列表失败:', error)
      throw new Error('获取GitHub仓库列表失败')
    }
  },
  
  // 验证token有效性
  async validateToken(token) {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`
        }
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

export default apiClient