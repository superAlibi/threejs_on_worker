# webgl worker


> 演示如何在web worker上使用three.js的示例项目。


## 依赖
  1. 主要依赖
      - three
      - vitejs
      - vue3
      - tailwindcss
  2. 次要依赖
      - @vueuse/core
      - dat.gui
      - pinia
      - radash
  3. 环境依赖
      - nodejs
      - pnpm
      - 浏览器需要支持web worker

## 功能清单
1. 旋转模型功能
2. 平移模型功能
3. 缩放模型功能 
4. 加载外部模型功能
5. 距离测量功能
6. 角度测量功能


## 项目状态
- 项目开发中


## 项目目录结构
```
├── public
│   └── vite.svg
├── src
│   ├── assets
│   ├── components 渲染组件
│   ├── models 渲染demo模型
│   ├── store pinia状态
│   ├── views 
│   ├── core 核心功能实现
│   ├── helper dom与core交互的辅助对象
│   ├── App.vue 
│   ├── main.ts
│   └── style.css
├── vite.config.js
├── package.json
├── README.md
├── README_en.md
├── index.html
└── LICENSE
