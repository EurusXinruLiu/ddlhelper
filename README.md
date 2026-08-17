# 日作 · 项目任务助手

一个面向个人项目规划和每日执行的轻量任务助手。支持任务列表、日/周/月甘特图、时间表、拖动排序、拖动调整开始时间与时长、任务编辑、优先级、进度记录和 PWA 离线使用。

## 技术架构

```text
React 18
  └── src/main.jsx       页面、状态、任务交互和本地数据逻辑
  └── src/styles.css     响应式布局、粉紫主题、甘特图和弹窗样式

Vite
  └── index.html         应用入口
  └── vite.config.js     React 构建和 PWA / Service Worker 配置

PWA
  └── public/            应用图标
  └── dist/              npm run build 生成的发布产物
```

## 主要功能

- 左侧任务栏和右侧甘特图严格对齐。
- 日视图显示完整 24 小时；网格按 1 小时显示，拖动最小单位为 30 分钟。
- 周、月视图可切换；时间表支持日、周、月周期。
- 甘特条支持拖动调整位置、拖动两端调整时长。
- 任务支持拖动排序、编辑、完成、删除和优先级设置。
- 中文 / English 界面切换；英文模式支持独立英文任务标题。
- 字号、任务密度、显示网格等设置可调整并保存。
- PWA 支持安装到手机主屏幕和离线启动。

## 数据存储

当前版本使用浏览器 `localStorage`，数据不会写入项目文件或云端数据库：

- `daycraft-projects`：项目和任务数据
- `daycraft-font-scale`：字号设置
- `daycraft-language`：界面语言

清除浏览器站点数据会清除本机任务数据。后续接入 Supabase 时，可以将 `projects`、`tasks` 和用户账号迁移到云端。

## 本地运行

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5174
```

打开 <http://localhost:5174/>。

## 构建和预览

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

构建会生成 `dist/`，其中包含 `manifest.webmanifest`、`sw.js`、打包后的 JavaScript/CSS 和 PWA 图标。

## 发布

当前已部署到 Cloudflare Pages：

<https://ddlhelper.pages.dev/>

部署命令：

```bash
npx wrangler pages deploy dist --project-name ddlhelper
```

## 目录说明

```text
index.html                 HTML 入口和移动端/PWA 元信息
vite.config.js             Vite、PWA 和离线缓存配置
src/main.jsx               React 应用主体
src/styles.css             全部界面样式
public/                    PWA 图标源文件和 PNG 图标
dist/                      构建产物，不提交到 Git
package.json               依赖和脚本
package-lock.json          精确依赖版本
```
