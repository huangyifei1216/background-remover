# 宠物照片抠图网站 MVP 需求文档

## 1. 项目目标

做一个可以最快速度上线的宠物照片抠图网站，核心能力是让用户上传宠物照片，一键去除背景，并下载透明背景图片。

本期目标不是做复杂编辑器，也不是做用户系统或图库，而是优先验证这几个问题：

- 用户是否愿意为“宠物照片专用抠图”买单
- `宠物照片抠图` 这个细分定位是否比通用抠图更容易转化
- 是否能用极简架构稳定跑通上传、抠图、预览、下载全流程

## 2. 产品定位

### 2.1 核心定位

一个面向宠物主人的轻量级在线抠图工具，主打：

- 宠物毛发边缘处理更友好
- 操作简单，3 步完成
- 不保存图片，隐私更清晰
- 打开网页即可使用，无需注册

### 2.2 一句话描述

Upload your pet photo, remove the background instantly, and download a transparent PNG.

### 2.3 目标用户

- 想给宠物做头像、表情包、纪念图的个人用户
- 电商/社媒用户，需要宠物透明图素材
- 宠物博主、自媒体创作者

## 3. MVP 范围

## 3.1 必做功能

- 首页落地页
- 本地图片上传
- 调用 `remove.bg` API 去背景
- 抠图结果预览
- 下载透明 PNG
- 错误提示和重试
- 基础 SEO 页面信息
- 移动端可用

## 3.2 明确不做

- 用户注册登录
- 图片历史记录
- 云端存储
- 批量上传
- 手动橡皮擦/画笔编辑
- 背景替换模板
- 订阅支付
- 多语言
- 后台管理系统

## 4. 核心用户流程

1. 用户进入首页
2. 用户看到宠物场景说明和上传入口
3. 用户上传一张宠物照片
4. 前端将图片提交到 Cloudflare Worker
5. Worker 使用内存转发图片到 `remove.bg` API
6. 返回透明背景结果
7. 前端展示前后对比和下载按钮
8. 用户点击下载 PNG

## 5. 页面需求

## 5.1 首页

### 页面目标

让用户快速理解产品并立刻上传。

### 页面模块

- Hero 区
  - 标题：Pet Photo Background Remover
  - 副标题：Remove background from dog and cat photos in seconds
  - 主按钮：Upload Pet Photo
- 示例展示区
  - 1 组前后对比图
  - 文案强调宠物毛发、耳朵、尾巴等细节
- 使用步骤区
  - Upload
  - Remove
  - Download
- 信任说明区
  - No signup
  - No image storage
  - Fast processing
- FAQ 区
  - 支持哪些图片格式
  - 是否保存图片
  - 是否免费
- 页脚
  - Privacy
  - Terms
  - Contact

## 5.2 结果态

### 页面元素

- 原图缩略图
- 抠图结果图
- 下载按钮
- 重新上传按钮
- 错误时的重试按钮

## 6. 功能需求

## 6.1 图片上传

### 支持格式

- `png`
- `jpg`
- `jpeg`
- `webp`

### 限制

- 单张上传
- 文件大小限制：建议先设为 `10MB`
- 非图片文件需要拦截

### 交互要求

- 支持点击上传
- 支持拖拽上传
- 上传后立即展示本地预览

## 6.2 抠图处理

### 技术要求

- 前端不直接暴露 `remove.bg` API Key
- 由 Cloudflare Worker 作为服务端中转
- 不落盘，不接对象存储
- 请求和响应都只在内存中处理

### 处理逻辑

- 接收用户上传的文件
- 校验格式和大小
- 转发到 `remove.bg` API
- 接收返回的抠图结果
- 直接回传给前端

### 超时与失败

- 超时提示：处理时间过长，请重试
- API 失败提示：抠图失败，请更换图片或稍后再试
- 文件不合法提示：请上传 PNG/JPG/WEBP 图片

## 6.3 下载

### 要求

- 默认下载透明背景 PNG
- 文件名自动生成
  - 例如：`pet-cutout.png`

## 6.4 隐私说明

### 站内文案需要明确

- 图片不会被永久存储
- 图片仅在处理过程中经由内存转发
- 处理依赖第三方 `remove.bg` 服务

## 7. 非功能需求

## 7.1 性能

- 首页首屏尽量轻
- 上传前完成前端校验，减少无效请求
- 单次处理目标体验：`3-10 秒`

## 7.2 兼容性

- 桌面端 Chrome/Safari/Edge 可用
- 手机端 Safari/Chrome 可用

## 7.3 可用性

- 页面结构简单，不超过 1 个主流程
- 用户不需要登录即可完成完整操作

## 7.4 安全

- API Key 仅放在 Cloudflare 环境变量
- 限制请求大小
- 增加基础限流，防止滥用
- 不在日志中打印原始图片内容

## 8. 技术方案

## 8.1 推荐架构

为了最快上线，建议采用：

- 前端：`Next.js`
- 部署：`Cloudflare Pages`
- API 层：`Cloudflare Workers`
- 第三方能力：`remove.bg API`
- 图片存储：不使用
- 数据库：不使用

## 8.2 架构说明

- 前端负责页面展示、上传交互、结果展示、下载
- Worker 负责文件校验、转发第三方 API、返回结果
- 所有图片只走请求链路，不进入持久化存储

## 8.3 API 设计

### `POST /api/remove-background`

#### 请求

- `multipart/form-data`
- 字段名：`image_file`

#### 返回成功

- `image/png` 二进制流

#### 返回失败

```json
{
  "error": "Failed to remove background"
}
```

## 9. 前端需求细化

## 9.1 首页文案建议

### Hero

- H1: Pet Photo Background Remover
- Description: Remove the background from dog and cat photos in seconds. No signup. No storage. Download transparent PNG instantly.
- CTA: Upload Pet Photo

### SEO Title

- Pet Photo Background Remover | Remove Background from Dog & Cat Photos

### SEO Description

- Remove background from pet photos online. Fast dog and cat photo background remover with transparent PNG download. No signup, no image storage.

## 9.2 状态设计

- 默认态：引导上传
- 上传中：展示进度文案
- 处理中：按钮禁用，显示 loading
- 成功态：展示结果和下载
- 失败态：显示错误与重试

## 10. Cloudflare 部署要求

## 10.1 环境变量

- `REMOVE_BG_API_KEY`

## 10.2 部署结构

- 前端静态页面或 Next.js 页面部署到 Cloudflare
- API 路由运行在 Worker 环境

## 10.3 监控基础项

- 请求量
- 失败率
- 平均处理时间
- `remove.bg` 调用错误率

## 11. 验收标准

满足以下条件即可视为 MVP 可上线：

- 用户可以在首页上传一张宠物照片
- 服务端能够成功调用 `remove.bg`
- 用户可以看到透明背景结果
- 用户可以下载 PNG
- 页面在手机和桌面都能正常使用
- 不需要登录
- 不保存图片
- 错误场景有可理解提示

## 12. 首版上线清单

- 完成首页 UI
- 接通上传功能
- 接通 Worker API
- 配置 `remove.bg` Key
- 加入隐私说明
- 加入 FAQ
- 配置基础 SEO
- 自测桌面端和移动端
- 上线 Cloudflare

## 13. 上线后优先观察的数据

- 首页访问到上传点击率
- 上传到成功下载转化率
- 平均每次请求成本
- 失败率
- 用户更常上传的宠物类型
- 哪些入口词带来转化

## 14. 第二阶段可扩展功能

MVP 跑通后，再考虑：

- 白底背景一键替换
- 宠物头像裁切
- 宠物纪念照模板
- 多图批量处理
- 免费预览 + 付费高清下载
- SEO 场景页
  - Dog photo background remover
  - Cat photo background remover
  - Make pet photo transparent
  - Remove background from puppy image

## 15. 开发优先级

### P0

- 上传
- 抠图
- 预览
- 下载
- 错误处理

### P1

- SEO
- FAQ
- 隐私说明
- 页面美化

### P2

- 限流
- 分析埋点
- A/B 测试文案

## 16. 一句话开发原则

这次 MVP 的目标只有一个：用最轻的架构，在最短时间内把“宠物照片上传 -> 自动抠图 -> 下载透明 PNG”这条链路跑通并上线验证。
