# CW 小站

一支电键，一卷纸带。复古金属发报机风格的摩尔斯电码练习 PWA。

仓库：[AielloChan/cw-station](https://github.com/AielloChan/cw-station)。首版站点入口：[CW 小站](https://cw-station.huedrain2.chatgpt.site)（所有者私有）。

## 功能

- 英文短文、模拟 CW 通联、自由发报三种模式，各带三份预置练习（自由模式无预置）。
- 按压真实时长决定点划，鼠标、触屏和键盘空格均可操作。
- 逐字核对、当前字符点划提示、试听、完成进度和本轮准确率。
- 600 Hz 发报侧音，可静音；灵敏度和字符停顿时间分别调节。
- 自由输入自动分词，支持手动插入空格与退格。
- 设置保存在浏览器；Service Worker 缓存应用、字体和内容，支持离线与安装。
- 取消触摸、切后台、失焦及 10 秒长按保护均会停音。

## 本地开发

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

开发地址 `http://localhost:5173`，开发服务器不注册 Service Worker。修改后刷新页面。

```sh
npm test
npm run build
npm start
```

生产预览地址 `http://localhost:4173`，支持完整离线缓存。

```sh
npx playwright install chromium
npm run test:browser
```

浏览器测试覆盖桌面与手机视口、触摸和键盘输入、识别错误、模式切换、设置持久化及离线重载。

## 识别规则

少于 25ms 的触碰视为抖动；默认低于 180ms 为点，否则为划。松开后连续静默 600ms 识别一个字符。自由模式静默达到字符间隔的 2.5 倍时自动插入空格。练习模式自动跨过原文空格。错误输入计入准确率分母，目标不前进。

灵敏度范围 100–300ms，字符停顿范围 300–1200ms。默认参数偏向新手，非自动测量的 WPM。CW 文本为虚构练习情境，不是真实通联记录；连续 prosign 暂不单独识别。

## 结构

| 路径 | 作用 |
| --- | --- |
| `src/morse.js` | 编码表与独立可测试的输入计时器 |
| `src/audio.js` | Web Audio 侧音与静音保护 |
| `src/content.js` | 原创短文与模拟通联内容 |
| `src/app.js` | 练习状态、交互和 PWA 安装 |
| `src/styles.css` | 机身、纸带、电键及响应式布局 |
| `scripts/build.mjs` | 静态构建、基于资源内容哈希生成离线缓存 |
| `public/` | 字体、许可证、图标和 manifest |

## 部署

`npm run build` 生成 `dist/`，可发布到支持 HTTPS 的静态托管。资源路径为相对路径，兼容子路径部署。Sites 的站点标识保存在 `.openai/hosting.json`。新版本 Service Worker 会等待旧标签页关闭后激活，避免练习中突然重载；重新打开应用即可更新。

在 iOS 上用 Safari 的分享菜单「添加到主屏幕」。浏览器首次联网加载并显示「离线已就绪」后才能保证离线启动。微信内置浏览器的安装能力以实际浏览器支持为准，建议用系统浏览器打开。

## 字体与图标

Barlow Condensed 与 DM Mono 通过 Google Fonts 官方仓库取得，许可证随字体存放在 `public/fonts/`。图标为本项目原创几何图形，PNG 可用 `python3 scripts/icons.py` 重新生成（需要 Pillow）。

## 实现参考

- [MDN Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
