#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 启动在线思维导图开发服务器...')

// 启动开发服务器
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
})

devServer.on('close', (code) => {
  console.log(`开发服务器退出，代码: ${code}`)
})

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发服务器...')
  devServer.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭开发服务器...')
  devServer.kill('SIGTERM')
})