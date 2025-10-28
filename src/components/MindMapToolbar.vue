<template>
  <div class="mindmap-toolbar">
    <div class="toolbar-group">
      <el-button 
        icon="el-icon-plus" 
        size="mini"
        @click="$emit('add-node')"
        title="添加节点"
      >
      </el-button>
      <el-button 
        icon="el-icon-delete" 
        size="mini"
        :disabled="!selectedNode"
        @click="$emit('delete-node')"
        title="删除节点"
      >
      </el-button>
    </div>
    
    <div class="toolbar-group">
      <el-button 
        icon="el-icon-undo" 
        size="mini"
        :disabled="!canUndo"
        @click="$emit('undo')"
        title="撤销"
      >
      </el-button>
      <el-button 
        icon="el-icon-redo" 
        size="mini"
        :disabled="!canRedo"
        @click="$emit('redo')"
        title="重做"
      >
      </el-button>
    </div>
    
    <div class="toolbar-group">
      <el-color-picker
        v-model="nodeColor"
        size="mini"
        @change="onNodeColorChange"
        title="节点颜色"
      >
      </el-color-picker>
      <el-color-picker
        v-model="lineColor"
        size="mini"
        @change="onLineColorChange"
        title="线条颜色"
      >
      </el-color-picker>
    </div>
    
    <div class="toolbar-group">
      <el-select
        v-model="layout"
        size="mini"
        @change="onLayoutChange"
        style="width: 100px"
      >
        <el-option label="逻辑结构" value="logicalStructure"></el-option>
        <el-option label="思维导图" value="mindMap"></el-option>
        <el-option label="组织结构图" value="organizationStructure"></el-option>
        <el-option label="时间轴" value="timeline"></el-option>
        <el-option label="鱼骨图" value="fishbone"></el-option>
      </el-select>
    </div>
    
    <div class="toolbar-group">
      <el-select
        v-model="theme"
        size="mini"
        @change="onThemeChange"
        style="width: 100px"
      >
        <el-option label="默认" value="default"></el-option>
        <el-option label="经典" value="classic"></el-option>
        <el-option label="简约" value="minimal"></el-option>
        <el-option label="深色" value="dark"></el-option>
        <el-option label="脑图" value="brain"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MindMapToolbar',
  props: {
    selectedNode: {
      type: Object,
      default: null
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    canRedo: {
      type: Boolean,
      default: false
    },
    currentLayout: {
      type: String,
      default: 'logicalStructure'
    },
    currentTheme: {
      type: String,
      default: 'default'
    }
  },
  
  data() {
    return {
      nodeColor: '#409EFF',
      lineColor: '#409EFF',
      layout: this.currentLayout,
      theme: this.currentTheme
    }
  },
  
  watch: {
    selectedNode(node) {
      if (node && node.data && node.data.style) {
        this.nodeColor = node.data.style.color || '#409EFF'
      }
    },
    currentLayout(layout) {
      this.layout = layout
    },
    currentTheme(theme) {
      this.theme = theme
    }
  },
  
  methods: {
    onNodeColorChange(color) {
      this.$emit('node-color-change', { node: this.selectedNode, color })
    },
    
    onLineColorChange(color) {
      this.$emit('line-color-change', color)
    },
    
    onLayoutChange(layout) {
      this.$emit('layout-change', layout)
    },
    
    onThemeChange(theme) {
      this.$emit('theme-change', theme)
    }
  }
}
</script>

<style lang="scss" scoped>
.mindmap-toolbar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:not(:last-child) {
    padding-right: 15px;
    border-right: 1px solid #e4e7ed;
  }
}
</style>