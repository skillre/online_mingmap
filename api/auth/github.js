const crypto = require('crypto')

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const clientId = process.env.GITHUB_CLIENT_ID
      const redirectUri = process.env.GITHUB_REDIRECT_URI
      
      if (!clientId || !redirectUri) {
        return res.status(500).json({
          error: 'GitHub OAuth配置缺失'
        })
      }

      // 生成随机state参数防止CSRF攻击
      const state = crypto.randomBytes(16).toString('hex')
      
      // 构建GitHub OAuth授权URL
      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=user repo&` +
        `state=${state}`

      res.status(200).json({
        auth_url: authUrl,
        state: state
      })
    } catch (error) {
      console.error('GitHub授权URL生成失败:', error)
      res.status(500).json({
        error: '生成授权URL失败'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({
      error: '方法不允许'
    })
  }
}