<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <el-button 
          type="primary" 
          icon="el-icon-plus" 
          size="small"
          @click="createNewFile"
        >
          新建
        </el-button>
        <el-button 
          icon="el-icon-folder-opened" 
          size="small"
          @click="openFile"
        >
          打开
        </el-button>
        <el-button 
          icon="el-icon-save" 
          size="small"
          :loading="saving"
          @click="saveFile"
        >
          保存
        </el-button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <el-button 
          icon="el-icon-undo" 
          size="small"
          :disabled="!canUndo"
          @click="undo"
        >
          撤销
        </el-button>
        <el-button 
          icon="el-icon-redo" 
          size="small"
          :disabled="!canRedo"
          @click="redo"
        >
          重做
        </el-button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <el-button 
          icon="el-icon-plus" 
          size="small"
          @click="addNode"
        >
          添加节点
        </el-button>
        <el-button 
          icon="el-icon-delete" 
          size="small"
          :disabled="!selectedNode"
          @click="deleteNode"
        >
          删除节点
        </el-button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <el-dropdown @command="handleExport">
          <el-button size="small">
            导出<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="png">PNG图片</el-dropdown-item>
            <el-dropdown-item command="jpeg">JPEG图片</el-dropdown-item>
            <el-dropdown-item command="svg">SVG图片</el-dropdown-item>
            <el-dropdown-item command="mindmap">MindMap文件</el-dropdown-item>
            <el-dropdown-item command="freemind">FreeMind文件</el-dropdown-item>
            <el-dropdown-item command="markdown">Markdown文件</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      
      <div class="toolbar-group">
        <el-button 
          v-if="!isAuthenticated" 
          type="success" 
          size="small"
          @click="login"
        >
          GitHub登录
        </el-button>
        <el-dropdown v-else @command="handleUserMenu">
          <el-button size="small">
            <el-avatar :size="20" :src="currentUser.avatar_url"></el-avatar>
            {{ currentUser.login }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="files">我的文件</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-layout">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <el-button 
            icon="el-icon-menu" 
            size="small"
            @click="toggleSidebar"
          >
          </el-button>
          <span v-if="!sidebarCollapsed">文件列表</span>
        </div>
        
        <div v-if="!sidebarCollapsed" class="file-list">
          <div 
            v-for="file in files" 
            :key="file.path"
            class="file-item"
            :class="{ active: currentFile && currentFile.path === file.path }"
            @click="selectFile(file)"
          >
            <i class="el-icon-document file-icon"></i>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">{{ formatDate(file.updated_at) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 编辑器区域 -->
      <div class="editor-container">
        <div class="canvas-area" ref="canvasArea">
          <div 
            id="mindmap-container" 
            ref="mindmapContainer"
            style="width: 100%; height: 100%;"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 文件选择对话框 -->
    <el-dialog
      title="选择文件"
      :visible.sync="fileDialogVisible"
      width="600px"
    >
      <el-input
        v-model="searchQuery"
        placeholder="搜索文件..."
        prefix-icon="el-icon-search"
        clearable
        @input="searchFiles"
      ></el-input>
      
      <div class="file-selection-list">
        <div 
          v-for="file in filteredFiles" 
          :key="file.path"
          class="file-item"
          @click="selectFileFromDialog(file)"
        >
          <i class="el-icon-document file-icon"></i>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">{{ file.path }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 协同编辑面板 -->
    <div v-if="isCollaborating" class="collaboration-panel">
      <div class="panel-header">
        <span>在线用户</span>
        <el-button 
          icon="el-icon-close" 
          size="mini"
          @click="closeCollaboration"
        >
        </el-button>
      </div>
      <div class="user-list">
        <div 
          v-for="user in onlineUsers" 
          :key="user.id"
          class="user-item"
        >
          <el-avatar :size="32" :src="user.avatar_url"></el-avatar>
          <span>{{ user.name || user.login }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MindMap from 'simple-mind-map'
import { exportService } from '@/api/export'

export default {
  name: 'Editor',
  data() {
    return {
      mindMap: null,
      sidebarCollapsed: false,
      fileDialogVisible: false,
      searchQuery: '',
      filteredFiles: [],
      saving: false,
      isCollaborating: false
    }
  },
  
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'currentUser',
      'files',
      'currentFile',
      'mindMapData',
      'selectedNode',
      'canUndo',
      'canRedo',
      'onlineUsers'
    ])
  },
  
  mounted() {
    this.initMindMap()
    this.initAuth()
    this.setupKeyboardShortcuts()
  },
  
  beforeDestroy() {
    if (this.mindMap) {
      this.mindMap.destroy()
    }
    this.removeKeyboardShortcuts()
  },
  
  methods: {
    ...mapActions([
      'initAuth',
      'loginWithGithub',
      'logout',
      'fetchFiles',
      'getFile',
      'createFile',
      'updateFile',
      'initMindMap',
      'updateMindMapData',
      'selectNode',
      'addNode',
      'deleteNode',
      'undo',
      'redo'
    ]),
    
    // 初始化思维导图
    initMindMap() {
      const container = this.$refs.mindmapContainer
      if (!container) return
      
      this.mindMap = new MindMap({
        el: container,
        data: this.mindMapData || {
          root: {
            data: {
              text: '中心主题',
              expand: true
            },
            children: []
          }
        },
        layout: 'logicalStructure',
        theme: 'default',
        enableFreeDrag: true,
        enableNodeRichText: true,
        enableCtrlKeyNodeSelection: true,
        enableNodeDrag: true,
        enableNodeEdit: true
      })
      
      // 监听事件
      this.mindMap.on('node_click', this.onNodeClick)
      this.mindMap.on('data_change', this.onDataChange)
      this.mindMap.on('node_active', this.onNodeActive)
    },
    
    // 节点点击事件
    onNodeClick(node) {
      this.selectNode(node)
    },
    
    // 数据变化事件
    onDataChange(data) {
      this.updateMindMapData(data)
    },
    
    // 节点激活事件
    onNodeActive(node) {
      this.selectNode(node)
    },
    
    // 创建新文件
    async createNewFile() {
      const fileName = `Untitled.mmap`
      const defaultData = {
        root: {
          data: {
            text: '中心主题',
            expand: true
          },
          children: []
        }
      }
      
      if (this.isAuthenticated) {
        // 保存到GitHub
        try {
          this.saving = true
          const content = JSON.stringify(defaultData, null, 2)
          await this.createFile({
            owner: this.currentUser.login,
            repo: 'mindmaps',
            path: fileName,
            content,
            message: `创建思维导图 ${fileName}`
          })
          this.$message.success('文件创建成功')
        } catch (error) {
          this.$message.error('创建文件失败: ' + error.message)
        } finally {
          this.saving = false
        }
      } else {
        // 本地创建
        this.initMindMap(defaultData)
        this.$message.success('新文件已创建')
      }
    },
    
    // 打开文件
    openFile() {
      if (this.isAuthenticated) {
        this.fetchFiles({
          owner: this.currentUser.login,
          repo: 'mindmaps'
        }).then(() => {
          this.filteredFiles = this.files
          this.fileDialogVisible = true
        })
      } else {
        this.$message.warning('请先登录GitHub')
      }
    },
    
    // 保存文件
    async saveFile() {
      if (!this.currentFile) {
        this.$message.warning('请先选择或创建文件')
        return
      }
      
      try {
        this.saving = true
        const content = JSON.stringify(this.mindMapData, null, 2)
        await this.updateFile({
          owner: this.currentFile.owner,
          repo: this.currentFile.repo,
          path: this.currentFile.path,
          content,
          message: `更新思维导图 ${this.currentFile.name}`,
          sha: this.currentFile.sha
        })
        this.$message.success('文件保存成功')
      } catch (error) {
        this.$message.error('保存文件失败: ' + error.message)
      } finally {
        this.saving = false
      }
    },
    
    // 选择文件
    async selectFile(file) {
      try {
        await this.getFile({
          owner: file.owner,
          repo: file.repo,
          path: file.path
        })
        
        if (this.currentFile && this.currentFile.content) {
          const data = JSON.parse(this.currentFile.content)
          this.initMindMap(data)
        }
      } catch (error) {
        this.$message.error('打开文件失败: ' + error.message)
      }
    },
    
    // 从对话框选择文件
    selectFileFromDialog(file) {
      this.selectFile(file)
      this.fileDialogVisible = false
    },
    
    // 搜索文件
    searchFiles() {
      if (!this.searchQuery) {
        this.filteredFiles = this.files
      } else {
        this.filteredFiles = this.files.filter(file =>
          file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
    },
    
    // 添加节点
    addNode() {
      if (this.selectedNode) {
        this.$store.dispatch('editor/addNode', {
          parentNode: this.selectedNode,
          nodeData: { text: '新节点' }
        })
      } else {
        this.$message.warning('请先选择一个父节点')
      }
    },
    
    // 删除节点
    deleteNode() {
      if (this.selectedNode) {
        this.$store.dispatch('editor/deleteNode', this.selectedNode)
      }
    },
    
    // 导出处理
    async handleExport(format) {
      const container = this.$refs.mindmapContainer
      const fileName = `mindmap.${format}`
      
      try {
        switch (format) {
          case 'png':
            await exportService.exportToPNG(container, fileName)
            break
          case 'jpeg':
            await exportService.exportToJPEG(container, fileName)
            break
          case 'svg':
            const svgElement = container.querySelector('svg')
            exportService.exportToSVG(svgElement, fileName)
            break
          case 'mindmap':
            exportService.exportToMindMap(this.mindMapData, fileName)
            break
          case 'freemind':
            exportService.exportToFreeMind(this.mindMapData, fileName)
            break
          case 'markdown':
            exportService.exportToMarkdown(this.mindMapData, fileName)
            break
        }
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败: ' + error.message)
      }
    },
    
    // 用户菜单处理
    handleUserMenu(command) {
      switch (command) {
        case 'files':
          this.openFile()
          break
        case 'logout':
          this.logout()
          break
      }
    },
    
    // 登录
    login() {
      this.loginWithGithub()
    },
    
    // 切换侧边栏
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    // 关闭协同编辑
    closeCollaboration() {
      this.isCollaborating = false
    },
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
      this.handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 's':
              e.preventDefault()
              this.saveFile()
              break
            case 'z':
              e.preventDefault()
              if (e.shiftKey) {
                this.redo()
              } else {
                this.undo()
              }
              break
            case 'y':
              e.preventDefault()
              this.redo()
              break
          }
        }
      }
      document.addEventListener('keydown', this.handleKeyDown)
    },
    
    // 移除键盘快捷键
    removeKeyboardShortcuts() {
      if (this.handleKeyDown) {
        document.removeEventListener('keydown', this.handleKeyDown)
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 60px;
  }
}

.sidebar-header {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #ecf5ff;
  }
  
  &.active {
    background: #409EFF;
    color: white;
  }
}

.file-icon {
  margin-right: 10px;
  font-size: 16px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.canvas-area {
  flex: 1;
  position: relative;
  background: #fafafa;
}

.file-selection-list {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 15px;
}

.collaboration-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
}

.user-list {
  padding: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  
  span {
    margin-left: 8px;
    font-size: 14px;
  }
}
</style>