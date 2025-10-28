import { githubAuth } from '@/api/auth'

const state = {
  user: null,
  token: null,
  isAuthenticated: false
}

const getters = {
  currentUser: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  token: state => state.token
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('github_token', token)
    } else {
      localStorage.removeItem('github_token')
    }
  },
  
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('github_token')
  },
  
  INIT_AUTH(state) {
    const token = localStorage.getItem('github_token')
    if (token) {
      state.token = token
    }
  }
}

const actions = {
  // 初始化认证状态
  initAuth({ commit }) {
    commit('INIT_AUTH')
  },
  
  // GitHub登录
  async loginWithGithub({ commit }) {
    try {
      const authUrl = await githubAuth.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('GitHub登录失败:', error)
      throw error
    }
  },
  
  // 处理OAuth回调
  async handleAuthCallback({ commit }, { code, state }) {
    try {
      const result = await githubAuth.handleCallback(code, state)
      commit('SET_TOKEN', result.access_token)
      commit('SET_USER', result.user)
      return result
    } catch (error) {
      console.error('处理OAuth回调失败:', error)
      throw error
    }
  },
  
  // 获取用户信息
  async fetchUserInfo({ commit, state }) {
    if (!state.token) {
      throw new Error('未找到访问令牌')
    }
    
    try {
      const user = await githubAuth.getUserInfo(state.token)
      commit('SET_USER', user)
      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },
  
  // 登出
  logout({ commit }) {
    commit('CLEAR_AUTH')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}