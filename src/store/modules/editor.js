const state = {
  mindMapData: null,
  currentView: 'edit',
  selectedNode: null,
  clipboard: null,
  history: {
    past: [],
    present: null,
    future: []
  },
  settings: {
    theme: 'default',
    layout: 'logicalStructure',
    nodeStyle: {
      fontSize: 14,
      color: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#409EFF',
      borderWidth: 2
    },
    lineStyle: {
      color: '#409EFF',
      width: 2,
      style: 'curve' // straight, curve, polyline
    }
  }
}

const getters = {
  mindMapData: state => state.mindMapData,
  currentView: state => state.currentView,
  selectedNode: state => state.selectedNode,
  clipboard: state => state.clipboard,
  canUndo: state => state.history.past.length > 0,
  canRedo: state => state.history.future.length > 0,
  settings: state => state.settings,
  nodeStyle: state => state.settings.nodeStyle,
  lineStyle: state => state.settings.lineStyle
}

const mutations = {
  SET_MINDMAP_DATA(state, data) {
    state.mindMapData = data
    // 保存到历史记录
    if (data && data !== state.history.present) {
      state.history.past.push(state.history.present)
      state.history.present = JSON.parse(JSON.stringify(data))
      state.history.future = []
      
      // 限制历史记录数量
      if (state.history.past.length > 50) {
        state.history.past.shift()
      }
    }
  },
  
  SET_CURRENT_VIEW(state, view) {
    state.currentView = view
  },
  
  SET_SELECTED_NODE(state, node) {
    state.selectedNode = node
  },
  
  SET_CLIPBOARD(state, data) {
    state.clipboard = data
  },
  
  UNDO(state) {
    if (state.history.past.length > 0) {
      const previous = state.history.past.pop()
      state.history.future.push(state.history.present)
      state.history.present = previous
      state.mindMapData = JSON.parse(JSON.stringify(previous))
    }
  },
  
  REDO(state) {
    if (state.history.future.length > 0) {
      const next = state.history.future.pop()
      state.history.past.push(state.history.present)
      state.history.present = next
      state.mindMapData = JSON.parse(JSON.stringify(next))
    }
  },
  
  UPDATE_NODE_STYLE(state, style) {
    state.settings.nodeStyle = { ...state.settings.nodeStyle, ...style }
  },
  
  UPDATE_LINE_STYLE(state, style) {
    state.settings.lineStyle = { ...state.settings.lineStyle, ...style }
  },
  
  UPDATE_SETTINGS(state, settings) {
    state.settings = { ...state.settings, ...settings }
  },
  
  CLEAR_HISTORY(state) {
    state.history = {
      past: [],
      present: state.mindMapData,
      future: []
    }
  }
}

const actions = {
  // 初始化思维导图数据
  initMindMap({ commit }, data = null) {
    const defaultData = {
      root: {
        data: {
          text: '中心主题',
          note: '',
          expand: true,
          style: {
            fontSize: 16,
            color: '#000000',
            backgroundColor: '#409EFF',
            borderColor: '#409EFF'
          }
        },
        children: []
      },
      theme: 'default',
      layout: 'logicalStructure',
      root: true
    }
    
    const mindMapData = data || defaultData
    commit('SET_MINDMAP_DATA', mindMapData)
  },
  
  // 更新思维导图数据
  updateMindMapData({ commit }, data) {
    commit('SET_MINDMAP_DATA', data)
  },
  
  // 选择节点
  selectNode({ commit }, node) {
    commit('SET_SELECTED_NODE', node)
  },
  
  // 添加节点
  addNode({ commit, state }, { parentNode, nodeData }) {
    if (!state.mindMapData) return
    
    const newNode = {
      data: {
        text: nodeData.text || '新节点',
        note: '',
        expand: true,
        style: {
          ...state.settings.nodeStyle,
          ...nodeData.style
        }
      },
      children: []
    }
    
    // 递归查找父节点并添加子节点
    const findAndAddNode = (node) => {
      if (node === parentNode) {
        if (!node.children) {
          node.children = []
        }
        node.children.push(newNode)
        return true
      }
      if (node.children) {
        for (let child of node.children) {
          if (findAndAddNode(child)) {
            return true
          }
        }
      }
      return false
    }
    
    if (findAndAddNode(state.mindMapData.root)) {
      commit('SET_MINDMAP_DATA', { ...state.mindMapData })
    }
  },
  
  // 删除节点
  deleteNode({ commit, state }, node) {
    if (!state.mindMapData || !node || node === state.mindMapData.root) return
    
    const findAndDeleteNode = (parentNode, targetNode) => {
      if (parentNode.children) {
        const index = parentNode.children.indexOf(targetNode)
        if (index !== -1) {
          parentNode.children.splice(index, 1)
          return true
        }
        for (let child of parentNode.children) {
          if (findAndDeleteNode(child, targetNode)) {
            return true
          }
        }
      }
      return false
    }
    
    if (findAndDeleteNode(state.mindMapData.root, node)) {
      commit('SET_MINDMAP_DATA', { ...state.mindMapData })
      commit('SET_SELECTED_NODE', null)
    }
  },
  
  // 更新节点文本
  updateNodeText({ commit, state }, { node, text }) {
    if (!node) return
    
    node.data.text = text
    commit('SET_MINDMAP_DATA', { ...state.mindMapData })
  },
  
  // 更新节点样式
  updateNodeStyle({ commit, state }, { node, style }) {
    if (!node) return
    
    node.data.style = { ...node.data.style, ...style }
    commit('SET_MINDMAP_DATA', { ...state.mindMapData })
  },
  
  // 复制节点
  copyNode({ commit }, node) {
    commit('SET_CLIPBOARD', JSON.parse(JSON.stringify(node)))
  },
  
  // 粘贴节点
  pasteNode({ commit, state }, parentNode) {
    if (!state.clipboard || !parentNode) return
    
    const copiedNode = JSON.parse(JSON.stringify(state.clipboard))
    // 修改节点文本以区分
    copiedNode.data.text = copiedNode.data.text + ' (副本)'
    
    // 添加到父节点
    if (!parentNode.children) {
      parentNode.children = []
    }
    parentNode.children.push(copiedNode)
    
    commit('SET_MINDMAP_DATA', { ...state.mindMapData })
  },
  
  // 撤销
  undo({ commit }) {
    commit('UNDO')
  },
  
  // 重做
  redo({ commit }) {
    commit('REDO')
  },
  
  // 更新设置
  updateSettings({ commit }, settings) {
    commit('UPDATE_SETTINGS', settings)
  },
  
  // 更新节点样式设置
  updateNodeStyleSettings({ commit }, style) {
    commit('UPDATE_NODE_STYLE', style)
  },
  
  // 更新线条样式设置
  updateLineStyleSettings({ commit }, style) {
    commit('UPDATE_LINE_STYLE', style)
  },
  
  // 清空历史记录
  clearHistory({ commit }) {
    commit('CLEAR_HISTORY')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}