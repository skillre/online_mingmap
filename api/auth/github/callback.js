const crypto = require('crypto')
const axios = require('axios')

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const { code, state } = req.body

      if (!code) {
        return res.status(400).json({
          error: '缺少授权码'
        })
      }

      const clientId = process.env.GITHUB_CLIENT_ID
      const clientSecret = process.env.GITHUB_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        return res.status(500).json({
          error: 'GitHub OAuth配置缺失'
        })
      }

      // 交换授权码获取访问令牌
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        state: state
      }, {
        headers: {
          Accept: 'application/json'
        }
      })

      const { access_token, token_type, scope } = tokenResponse.data

      if (!access_token) {
        return res.status(400).json({
          error: '获取访问令牌失败',
          details: tokenResponse.data
        })
      }

      // 获取用户信息
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
          'User-Agent': 'Online-MindMap'
        }
      })

      const userData = userResponse.data

      // 返回用户信息和访问令牌
      res.status(200).json({
        access_token: access_token,
        token_type: token_type,
        scope: scope,
        user: {
          id: userData.id,
          login: userData.login,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
          public_repos: userData.public_repos,
          created_at: userData.created_at
        }
      })

    } catch (error) {
      console.error('GitHub OAuth回调处理失败:', error)
      
      if (error.response) {
        // GitHub API错误
        res.status(error.response.status).json({
          error: 'GitHub API错误',
          details: error.response.data
        })
      } else if (error.request) {
        // 网络错误
        res.status(500).json({
          error: '网络请求失败',
          details: error.message
        })
      } else {
        // 其他错误
        res.status(500).json({
          error: '服务器内部错误',
          details: error.message
        })
      }
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({
      error: '方法不允许'
    })
  }
}