import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import files from './modules/files'
import editor from './modules/editor'
import collaboration from './modules/collaboration'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: false,
    error: null
  },
  
  getters: {
    isAuthenticated: state => !!auth.state.user,
    currentUser: state => auth.state.user,
    isLoading: state => state.loading,
    error: state => state.error
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  },
  
  modules: {
    auth,
    files,
    editor,
    collaboration
  }
})