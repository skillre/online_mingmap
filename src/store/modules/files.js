import { githubFiles } from '@/api/files'

const state = {
  files: [],
  currentFile: null,
  loading: false,
  error: null
}

const getters = {
  allFiles: state => state.files,
  currentFile: state => state.currentFile,
  isLoading: state => state.loading,
  error: state => state.error,
  filesByRepo: state => (owner, repo) => {
    return state.files.filter(file => 
      file.owner === owner && file.repo === repo
    )
  }
}

const mutations = {
  SET_FILES(state, files) {
    state.files = files
  },
  
  ADD_FILE(state, file) {
    state.files.unshift(file)
  },
  
  UPDATE_FILE(state, updatedFile) {
    const index = state.files.findIndex(file => 
      file.path === updatedFile.path && 
      file.owner === updatedFile.owner && 
      file.repo === updatedFile.repo
    )
    if (index !== -1) {
      state.files.splice(index, 1, updatedFile)
    }
  },
  
  REMOVE_FILE(state, filePath) {
    state.files = state.files.filter(file => file.path !== filePath)
  },
  
  SET_CURRENT_FILE(state, file) {
    state.currentFile = file
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // 获取文件列表
  async fetchFiles({ commit }, { owner, repo, path = '' }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const files = await githubFiles.getFiles(owner, repo, path)
      commit('SET_FILES', files)
      return files
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 创建文件
  async createFile({ commit }, { owner, repo, path, content, message }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const file = await githubFiles.createFile(owner, repo, path, content, message)
      commit('ADD_FILE', file)
      return file
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取文件内容
  async getFile({ commit }, { owner, repo, path }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const file = await githubFiles.getFile(owner, repo, path)
      commit('SET_CURRENT_FILE', file)
      return file
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新文件
  async updateFile({ commit }, { owner, repo, path, content, message, sha }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const file = await githubFiles.updateFile(owner, repo, path, content, message, sha)
      commit('UPDATE_FILE', file)
      commit('SET_CURRENT_FILE', file)
      return file
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 删除文件
  async deleteFile({ commit }, { owner, repo, path, sha, message }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      await githubFiles.deleteFile(owner, repo, path, sha, message)
      commit('REMOVE_FILE', path)
      if (state.currentFile && state.currentFile.path === path) {
        commit('SET_CURRENT_FILE', null)
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取文件历史
  async getFileHistory({ commit }, { owner, repo, path }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const history = await githubFiles.getFileHistory(owner, repo, path)
      return history
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 清空当前文件
  clearCurrentFile({ commit }) {
    commit('SET_CURRENT_FILE', null)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}