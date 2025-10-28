<template>
  <div class="auth-callback">
    <div class="loading-container">
      <el-loading-spinner></el-loading-spinner>
      <p class="loading-text">{{ loadingText }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AuthCallback',
  data() {
    return {
      loadingText: '正在处理GitHub认证...'
    }
  },
  
  async mounted() {
    await this.handleCallback()
  },
  
  methods: {
    ...mapActions(['handleAuthCallback', 'fetchUserInfo']),
    
    async handleCallback() {
      try {
        // 从URL获取code和state参数
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        
        if (!code) {
          throw new Error('未找到授权码')
        }
        
        this.loadingText = '正在获取访问令牌...'
        
        // 处理OAuth回调
        await this.handleAuthCallback({ code, state })
        
        this.loadingText = '正在获取用户信息...'
        
        // 获取用户信息
        await this.fetchUserInfo()
        
        this.loadingText = '认证成功，正在跳转...'
        
        // 跳转到编辑器
        setTimeout(() => {
          this.$router.push('/editor')
        }, 1000)
        
      } catch (error) {
        console.error('认证回调处理失败:', error)
        this.$message.error('认证失败: ' + error.message)
        
        // 跳转到首页
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-callback {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.loading-container {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: #606266;
}
</style>