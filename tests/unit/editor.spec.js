import { shallowMount } from '@vue/test-utils'
import Editor from '@/views/Editor.vue'
import { createLocalVue } from '@vue/test-utils'
import ElementUI from 'element-ui'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.use(Vuex)

describe('Editor.vue', () => {
  let store
  let actions
  let getters
  
  beforeEach(() => {
    actions = {
      initAuth: jest.fn(),
      initMindMap: jest.fn(),
      selectNode: jest.fn(),
      addNode: jest.fn(),
      deleteNode: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      saveFile: jest.fn()
    }
    
    getters = {
      isAuthenticated: () => false,
      currentUser: () => null,
      files: () => [],
      currentFile: () => null,
      mindMapData: () => null,
      selectedNode: () => null,
      canUndo: () => false,
      canRedo: () => false,
      onlineUsers: () => []
    }
    
    store = new Vuex.Store({
      actions,
      getters
    })
  })
  
  it('渲染编辑器组件', () => {
    const wrapper = shallowMount(Editor, { store, localVue })
    expect(wrapper.find('.app-container').exists()).toBe(true)
    expect(wrapper.find('.toolbar').exists()).toBe(true)
    expect(wrapper.find('.main-layout').exists()).toBe(true)
  })
  
  it('显示GitHub登录按钮当未认证时', () => {
    const wrapper = shallowMount(Editor, { store, localVue })
    const loginButton = wrapper.find('button[type="success"]')
    expect(loginButton.exists()).toBe(true)
    expect(loginButton.text()).toContain('GitHub登录')
  })
  
  it('显示用户信息当已认证时', () => {
    getters.isAuthenticated = () => true
    getters.currentUser = () => ({
      login: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg'
    })
    
    store = new Vuex.Store({
      actions,
      getters
    })
    
    const wrapper = shallowMount(Editor, { store, localVue })
    expect(wrapper.find('el-avatar').exists()).toBe(true)
  })
  
  it('处理新建文件操作', async () => {
    const wrapper = shallowMount(Editor, { store, localVue })
    await wrapper.vm.createNewFile()
    // 验证是否调用了相应的actions
    expect(actions.initMindMap).toHaveBeenCalled()
  })
  
  it('处理添加节点操作', async () => {
    getters.selectedNode = () => ({ id: 'test-node' })
    store = new Vuex.Store({
      actions,
      getters
    })
    
    const wrapper = shallowMount(Editor, { store, localVue })
    await wrapper.vm.addNode()
    expect(actions.addNode).toHaveBeenCalled()
  })
  
  it('处理删除节点操作', async () => {
    getters.selectedNode = () => ({ id: 'test-node' })
    store = new Vuex.Store({
      actions,
      getters
    })
    
    const wrapper = shallowMount(Editor, { store, localVue })
    await wrapper.vm.deleteNode()
    expect(actions.deleteNode).toHaveBeenCalled()
  })
  
  it('处理撤销操作', async () => {
    const wrapper = shallowMount(Editor, { store, localVue })
    await wrapper.vm.undo()
    expect(actions.undo).toHaveBeenCalled()
  })
  
  it('处理重做操作', async () => {
    const wrapper = shallowMount(Editor, { store, localVue })
    await wrapper.vm.redo()
    expect(actions.redo).toHaveBeenCalled()
  })
})