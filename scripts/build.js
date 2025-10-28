#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

console.log('🏗️  构建在线思维导图生产版本...')

// 构建生产版本
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
})

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 构建完成！')
    console.log('📦 构建文件位于 dist/ 目录')
    console.log('🚀 可以部署到 Vercel 或其他静态托管服务')
  } else {
    console.log(`❌ 构建失败，退出代码: ${code}`)
    process.exit(code)
  }
})

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 正在取消构建...')
  buildProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 正在取消构建...')
  buildProcess.kill('SIGTERM')
})