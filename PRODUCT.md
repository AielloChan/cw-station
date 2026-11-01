# CW 小站
<!-- impeccable:product-schema 1 -->

## Platform
web

## Product Purpose
一款摩尔斯电码发报练习 PWA。用户通过触屏电键的按压时长输入点划，看到纸带上的字符逐个完成。

## Capabilities and Constraints
- 英文文章、模拟 CW 通联、自由发报三种模式。
- 内置 100 段经典英文原作节选、3 篇基础练习、21 组模拟通联；支持检索、类别/长度筛选、列表和随机选择。
- 更换练习时使用滚筒退纸、引纸校正与分段进纸动画，尊重减少动态效果偏好。
- 长按产生长音，短按产生短音；可关闭声音，调节识别灵敏度。
- 支持离线使用和安装到主屏幕。
- 最近 30 秒滑动窗口计速；可展开实时指标、入门课程与通联/军事/竞技速度参考，附来源与统计口径。
- 第一版提供可操作预览与 GitHub Pages 线上部署。无账号和后端，公开访问，无需登录。

## Brand Commitments
名称 CW 小站；复古金属发报机，上方打印纸，下方触屏拨杆。

## Implementation Decisions
首版采用原生 HTML/CSS/JavaScript 模块，延续「呼号之前」的静态 PWA 思路。键盘空格为触屏的补充。用户指定 GitHub Pages 部署；为兼容当前 GitHub 套餐，仓库公开。
