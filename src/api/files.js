import axios from 'axios'
import { Base64 } from 'js-base64'

const API_BASE_URL = 'https://api.github.com'

// 创建GitHub API客户端
const createGitHubClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })
}

export const githubFiles = {
  // 获取仓库文件列表
  async getFiles(owner, repo, path = '', token) {
    try {
      const client = createGitHubClient(token)
      const response = await client.get(`/repos/${owner}/${repo}/contents/${path}`)
      
      if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          download_url: item.download_url,
          html_url: item.html_url,
          owner,
          repo
        }))
      } else {
        // 单个文件
        return [{
          name: response.data.name,
          path: response.data.path,
          type: response.data.type,
          size: response.data.size,
          download_url: response.data.download_url,
          html_url: response.data.html_url,
          owner,
          repo
        }]
      }
    } catch (error) {
      console.error('获取文件列表失败:', error)
      throw new Error(`获取文件列表失败: ${error.message}`)
    }
  },
  
  // 获取文件内容
  async getFile(owner, repo, path, token) {
    try {
      const client = createGitHubClient(token)
      const response = await client.get(`/repos/${owner}/${repo}/contents/${path}`)
      
      let content = null
      if (response.data.content) {
        content = Base64.decode(response.data.content)
      }
      
      return {
        name: response.data.name,
        path: response.data.path,
        content: content,
        size: response.data.size,
        sha: response.data.sha,
        html_url: response.data.html_url,
        download_url: response.data.download_url,
        owner,
        repo
      }
    } catch (error) {
      console.error('获取文件内容失败:', error)
      throw new Error(`获取文件内容失败: ${error.message}`)
    }
  },
  
  // 创建文件
  async createFile(owner, repo, path, content, message, token) {
    try {
      const client = createGitHubClient(token)
      const encodedContent = Base64.encode(content)
      
      const response = await client.put(`/repos/${owner}/${repo}/contents/${path}`, {
        message: message || `创建文件 ${path}`,
        content: encodedContent
      })
      
      return {
        name: response.data.content.name,
        path: response.data.content.path,
        content: content,
        size: response.data.content.size,
        sha: response.data.content.sha,
        html_url: response.data.content.html_url,
        download_url: response.data.content.download_url,
        owner,
        repo
      }
    } catch (error) {
      console.error('创建文件失败:', error)
      throw new Error(`创建文件失败: ${error.message}`)
    }
  },
  
  // 更新文件
  async updateFile(owner, repo, path, content, message, sha, token) {
    try {
      const client = createGitHubClient(token)
      const encodedContent = Base64.encode(content)
      
      const response = await client.put(`/repos/${owner}/${repo}/contents/${path}`, {
        message: message || `更新文件 ${path}`,
        content: encodedContent,
        sha: sha
      })
      
      return {
        name: response.data.content.name,
        path: response.data.content.path,
        content: content,
        size: response.data.content.size,
        sha: response.data.content.sha,
        html_url: response.data.content.html_url,
        download_url: response.data.content.download_url,
        owner,
        repo
      }
    } catch (error) {
      console.error('更新文件失败:', error)
      throw new Error(`更新文件失败: ${error.message}`)
    }
  },
  
  // 删除文件
  async deleteFile(owner, repo, path, sha, message, token) {
    try {
      const client = createGitHubClient(token)
      await client.delete(`/repos/${owner}/${repo}/contents/${path}`, {
        message: message || `删除文件 ${path}`,
        sha: sha
      })
      
      return { success: true }
    } catch (error) {
      console.error('删除文件失败:', error)
      throw new Error(`删除文件失败: ${error.message}`)
    }
  },
  
  // 获取文件历史记录
  async getFileHistory(owner, repo, path, token) {
    try {
      const client = createGitHubClient(token)
      const response = await client.get(`/repos/${owner}/${repo}/commits`, {
        params: {
          path: path,
          per_page: 10
        }
      })
      
      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        html_url: commit.html_url
      }))
    } catch (error) {
      console.error('获取文件历史失败:', error)
      throw new Error(`获取文件历史失败: ${error.message}`)
    }
  },
  
  // 获取特定版本的文件内容
  async getFileVersion(owner, repo, path, sha, token) {
    try {
      const client = createGitHubClient(token)
      const response = await client.get(`/repos/${owner}/${repo}/contents/${path}`, {
        params: {
          ref: sha
        }
      })
      
      let content = null
      if (response.data.content) {
        content = Base64.decode(response.data.content)
      }
      
      return {
        name: response.data.name,
        path: response.data.path,
        content: content,
        size: response.data.size,
        sha: response.data.sha,
        html_url: response.data.html_url,
        download_url: response.data.download_url,
        owner,
        repo
      }
    } catch (error) {
      console.error('获取文件版本失败:', error)
      throw new Error(`获取文件版本失败: ${error.message}`)
    }
  },
  
  // 搜索文件
  async searchFiles(owner, repo, query, token) {
    try {
      const client = createGitHubClient(token)
      const response = await client.get(`/search/code`, {
        params: {
          q: `${query} in:file repo:${owner}/${repo}`,
          per_page: 50
        }
      })
      
      return response.data.items.map(item => ({
        name: item.name,
        path: item.path,
        html_url: item.html_url,
        owner,
        repo
      }))
    } catch (error) {
      console.error('搜索文件失败:', error)
      throw new Error(`搜索文件失败: ${error.message}`)
    }
  }
}

export default githubFiles