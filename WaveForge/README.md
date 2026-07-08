# WaveForge

🎵 封面为中心的沉浸式音乐可视化播放器

## 核心特性

- **封面自适应主题** - 自动提取封面主色调，动态调整界面配色
- **多行歌词律动** - 显示多行歌词，当前行带有呼吸律动效果
- **Spotify 风格过渡** - 歌曲切换时的平滑淡入淡出效果
- **双平台支持** - 网易云音乐 + QQ音乐
- **本地音频** - 支持本地音频文件和 .lrc 歌词
- **优雅的封面展示** - 不加破坏性粒子效果，保留封面原始美感

## 技术栈

- **Electron** - 桌面应用框架
- **React 19 + TypeScript** - 现代化UI开发
- **Vite** - 快速构建工具
- **Framer Motion** - 流畅动画效果
- **Tailwind CSS** - 样式系统
- **Web Audio API** - 音频分析

## 开发

```bash
# 安装依赖
npm install

# 开发模式（浏览器）
npm run dev

# 开发模式（Electron）
npm run dev:electron

# 构建
npm run build

# 打包 Windows 应用
npm run build:electron
```

## 项目结构

```
WaveForge/
├── desktop/          # Electron 主进程
├── src/              # React 前端代码
│   ├── components/   # UI 组件
│   ├── hooks/        # 自定义 Hooks
│   └── App.tsx       # 主应用
├── server/           # API 服务器（音乐平台接入）
└── scripts/          # 构建脚本
```

## 设计理念

WaveForge 的核心是**封面为中心**的设计理念：

1. 封面是视觉焦点，不添加破坏性特效
2. 自动提取封面主色调，打造沉浸式氛围
3. 歌词根据封面配色自适应
4. 多行歌词显示，实用性优先
5. 平滑的歌曲过渡效果

## License

MIT
