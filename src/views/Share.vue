<template>
  <div class="share-container">
    <div class="share-header">
      <h1>思维导图分享</h1>
      <p>查看和导出分享的思维导图</p>
    </div>
    
    <div class="share-content">
      <div v-if="loading" class="loading-container">
        <el-loading-spinner></el-loading-spinner>
        <p>正在加载思维导图...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-alert
          :title="error"
          type="error"
          :closable="false"
          show-icon
        >
        </el-alert>
        <el-button @click="goHome" style="margin-top: 20px;">
          返回首页
        </el-button>
      </div>
      
      <div v-else class="mindmap-container">
        <div class="mindmap-toolbar">
          <div class="toolbar-group">
            <h3>{{ mindMapTitle }}</h3>
          </div>
          
          <div class="toolbar-group">
            <el-button 
              icon="el-icon-download" 
              size="small"
              @click="showExportDialog = true"
            >
              导出
            </el-button>
            <el-button 
              icon="el-icon-copy-document" 
              size="small"
              @click="copyShareLink"
            >
              复制链接
            </el-button>
          </div>
        </div>
        
        <div class="mindmap-viewer" ref="mindmapViewer">
          <!-- 思维导图将在这里渲染 -->
        </div>
      </div>
    </div>
    
    <!-- 导出对话框 -->
    <el-dialog
      title="导出思维导图"
      :visible.sync="showExportDialog"
      width="400px"
    >
      <div class="export-options">
        <el-radio-group v-model="exportFormat">
          <el-radio label="png">PNG图片</el-radio>
          <el-radio label="jpeg">JPEG图片</el-radio>
          <el-radio label="svg">SVG图片</el-radio>
          <el-radio label="mindmap">MindMap文件</el-radio>
          <el-radio label="markdown">Markdown文件</el-radio>
        </el-radio-group>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="exportMindMap" :loading="exporting">
          导出
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MindMap from 'simple-mind-map'
import { exportService } from '@/api/export'

export default {
  name: 'Share',
  data() {
    return {
      loading: true,
      error: null,
      mindMapData: null,
      mindMapTitle: '',
      mindMap: null,
      showExportDialog: false,
      exportFormat: 'png',
      exporting: false
    }
  },
  
  computed: {
    shareId() {
      return this.$route.params.id
    },
    
    shareUrl() {
      return window.location.href
    }
  },
  
  async mounted() {
    await this.loadSharedMindMap()
  },
  
  beforeDestroy() {
    if (this.mindMap) {
      this.mindMap.destroy()
    }
  },
  
  methods: {
    // 加载分享的思维导图
    async loadSharedMindMap() {
      try {
        this.loading = true
        
        // 这里应该从API获取分享的思维导图数据
        // 暂时使用模拟数据
        const mockData = {
          id: this.shareId,
          title: '分享的思维导图',
          data: {
            root: {
              data: {
                text: '中心主题',
                expand: true
              },
              children: [
                {
                  data: {
                    text: '分支1',
                    expand: true
                  },
                  children: [
                    {
                      data: {
                        text: '子分支1.1'
                      }
                    },
                    {
                      data: {
                        text: '子分支1.2'
                      }
                    }
                  ]
                },
                {
                  data: {
                    text: '分支2',
                    expand: true
                  },
                  children: [
                    {
                      data: {
                        text: '子分支2.1'
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
        
        this.mindMapData = mockData.data
        this.mindMapTitle = mockData.title
        
        // 渲染思维导图
        await this.renderMindMap()
        
      } catch (error) {
        console.error('加载分享的思维导图失败:', error)
        this.error = '加载思维导图失败，请检查分享链接是否有效'
      } finally {
        this.loading = false
      }
    },
    
    // 渲染思维导图
    async renderMindMap() {
      const container = this.$refs.mindmapViewer
      if (!container || !this.mindMapData) return
      
      this.mindMap = new MindMap({
        el: container,
        data: this.mindMapData,
        layout: 'logicalStructure',
        theme: 'default',
        enableFreeDrag: false, // 分享模式下禁用拖拽
        enableNodeRichText: true,
        enableCtrlKeyNodeSelection: false, // 分享模式下禁用选择
        enableNodeDrag: false, // 分享模式下禁用节点拖拽
        enableNodeEdit: false, // 分享模式下禁用编辑
        readonly: true // 只读模式
      })
    },
    
    // 导出思维导图
    async exportMindMap() {
      if (!this.mindMap) return
      
      try {
        this.exporting = true
        const container = this.$refs.mindmapViewer
        const fileName = `${this.mindMapTitle}.${this.exportFormat}`
        
        switch (this.exportFormat) {
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
          case 'markdown':
            exportService.exportToMarkdown(this.mindMapData, fileName)
            break
        }
        
        this.$message.success('导出成功')
        this.showExportDialog = false
      } catch (error) {
        this.$message.error('导出失败: ' + error.message)
      } finally {
        this.exporting = false
      }
    },
    
    // 复制分享链接
    async copyShareLink() {
      try {
        await navigator.clipboard.writeText(this.shareUrl)
        this.$message.success('链接已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = this.shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.$message.success('链接已复制到剪贴板')
      }
    },
    
    // 返回首页
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.share-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.share-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    color: #606266;
    font-size: 16px;
  }
}

.share-content {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  
  p {
    margin-top: 20px;
    color: #606266;
  }
}

.mindmap-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.mindmap-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  h3 {
    margin: 0;
    color: #303133;
    font-size: 18px;
  }
}

.mindmap-viewer {
  flex: 1;
  position: relative;
  background: #ffffff;
  overflow: hidden;
}

.export-options {
  padding: 20px 0;
  
  .el-radio {
    display: block;
    margin-bottom: 15px;
    margin-left: 0;
  }
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .share-container {
    padding: 10px;
  }
  
  .mindmap-container {
    height: 70vh;
  }
  
  .mindmap-toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
    
    .toolbar-group {
      justify-content: center;
    }
  }
}
</style>