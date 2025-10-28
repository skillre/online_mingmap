# 在线思维导图产品

基于Vue2.x和ElementUI技术栈的在线思维导图工具，支持GitHub集成、协同编辑和多格式导出。

## 功能特性

### 🎯 核心功能
- ✅ 思维导图创建和编辑
- ✅ 节点增删改操作
- ✅ 多种节点样式和连接线样式
- ✅ 撤销/重做功能
- ✅ 快捷键支持（Ctrl+S保存等）

### 🔐 GitHub集成
- ✅ GitHub OAuth认证
- ✅ 文件存储到GitHub仓库
- ✅ 版本控制和历史记录
- ✅ 文件分享功能

### 📤 导出功能
- ✅ PNG/JPEG图片导出
- ✅ SVG矢量图导出
- ✅ MindMap格式导出
- ✅ FreeMind格式导出
- ✅ Markdown格式导出

### 👥 协同编辑
- ✅ 实时协同编辑
- ✅ 用户在线状态显示
- ✅ 操作冲突检测和解决
- ✅ WebSocket实时通信

### 🎨 用户界面
- ✅ 响应式设计
- ✅ 现代化UI界面
- ✅ 工具栏和菜单
- ✅ 文件管理侧边栏

## 技术栈

- **前端框架**: Vue 2.x
- **UI组件库**: ElementUI
- **思维导图引擎**: Simple Mind Map
- **状态管理**: Vuex
- **路由管理**: Vue Router
- **HTTP客户端**: Axios
- **实时通信**: Socket.IO
- **图片导出**: html2canvas
- **文件处理**: file-saver
- **部署平台**: Vercel

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 配置GitHub OAuth应用：
   - 访问 [GitHub Developer Settings](https://github.com/settings/developers)
   - 创建新的OAuth应用
   - 设置回调URL: `http://localhost:3000/auth/callback`

3. 更新`.env`文件：
```env
VUE_APP_GITHUB_CLIENT_ID=your_github_client_id
VUE_APP_GITHUB_CLIENT_SECRET=your_github_client_secret
VUE_APP_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

## 部署

### Vercel部署

1. 安装Vercel CLI：
```bash
npm i -g vercel
```

2. 部署到Vercel：
```bash
vercel --prod
```

3. 在Vercel控制台配置环境变量：
   - `GITHUB_CLIENT_ID`: GitHub OAuth客户端ID
   - `GITHUB_CLIENT_SECRET`: GitHub OAuth客户端密钥
   - `GITHUB_REDIRECT_URI`: 应用部署URL + `/auth/callback`

### 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth客户端ID | 是 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth客户端密钥 | 是 |
| `GITHUB_REDIRECT_URI` | OAuth回调URL | 是 |
| `VUE_APP_API_URL` | API服务地址 | 否 |
| `VUE_APP_COLLABORATION_URL` | 协同编辑服务地址 | 否 |

## 项目结构

```
online-mindmap/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API服务
│   │   ├── auth.js        # 认证API
│   │   ├── files.js       # 文件管理API
│   │   └── export.js      # 导出API
│   ├── components/        # 公共组件
│   ├── router/           # 路由配置
│   ├── store/            # Vuex状态管理
│   │   ├── modules/      # 模块化store
│   │   └── index.js       # store入口
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── Editor.vue    # 编辑器页面
│   │   ├── AuthCallback.vue # 认证回调页面
│   │   └── Share.vue     # 分享页面
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── .env.example          # 环境变量模板
├── package.json          # 项目配置
├── vue.config.js         # Vue CLI配置
├── vercel.json          # Vercel部署配置
└── README.md            # 项目文档
```

## 使用指南

### 基本操作

1. **创建思维导图**
   - 点击"新建"按钮创建新的思维导图
   - 默认文件名为"Untitled.mmap"

2. **编辑节点**
   - 双击节点进行编辑
   - 选中节点后按Delete键删除
   - 拖拽节点调整位置

3. **添加节点**
   - 选中父节点后点击"添加节点"
   - 或使用快捷键Tab添加子节点

4. **保存文件**
   - 按Ctrl+S保存
   - 或点击工具栏的"保存"按钮

### GitHub集成

1. **登录GitHub**
   - 点击右上角的"GitHub登录"按钮
   - 授权应用访问GitHub账户

2. **文件管理**
   - 登录后可在侧边栏查看GitHub仓库中的文件
   - 支持创建、打开、保存和删除文件

3. **版本历史**
   - GitHub自动保存文件版本历史
   - 可查看和恢复历史版本

### 协同编辑

1. **开启协同编辑**
   - 打开文件后自动连接协同编辑服务
   - 右上角显示在线用户列表

2. **实时同步**
   - 编辑操作实时同步到其他用户
   - 自动检测和解决操作冲突

### 导出功能

支持多种导出格式：
- **PNG/JPEG**: 图片格式，适合分享和打印
- **SVG**: 矢量图格式，可无损缩放
- **MindMap**: 应用原生格式，保留完整信息
- **FreeMind**: 兼容FreeMind软件
- **Markdown**: 文档格式，适合技术文档

## 开发指南

### 添加新功能

1. 在`src/api/`中添加API服务
2. 在`src/store/modules/`中添加状态管理
3. 在`src/views/`中创建页面组件
4. 在`src/router/`中配置路由

### 代码规范

- 使用ESLint进行代码检查
- 遵循Vue.js官方风格指南
- 组件命名使用PascalCase
- 文件命名使用kebab-case

### 调试技巧

1. 使用Vue DevTools调试组件状态
2. 使用浏览器开发者工具调试网络请求
3. 查看控制台日志排查错误

## 常见问题

### Q: GitHub登录失败怎么办？
A: 检查OAuth应用配置和回调URL是否正确，确保环境变量设置正确。

### Q: 文件保存失败？
A: 确保已登录GitHub且有仓库写入权限，检查网络连接。

### Q: 协同编辑不工作？
A: 检查WebSocket服务是否正常运行，确保防火墙允许WebSocket连接。

### Q: 导出功能异常？
A: 确保浏览器支持相关API，检查文件权限设置。

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目地址: [GitHub Repository](https://github.com/your-username/online-mindmap)
- 问题反馈: [Issues](https://github.com/your-username/online-mindmap/issues)
- 功能建议: [Discussions](https://github.com/your-username/online-mindmap/discussions)

## 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- ✨ 基础思维导图编辑功能
- ✨ GitHub集成
- ✨ 多格式导出
- ✨ 协同编辑
- ✨ 响应式设计