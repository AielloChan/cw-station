# CW 小站
<!-- impeccable:product-schema 1 -->

## Platform
web

## Product Purpose
一款摩尔斯电码发报练习 PWA。用户通过触屏电键的按压时长输入点划，看到纸带上的字符逐个完成。

## Capabilities and Constraints
- 英文文章、模拟 CW 通联、自由发报三种模式。
- 长按产生长音，短按产生短音；可关闭声音，调节识别灵敏度。
- 支持离线使用和安装到主屏幕。
- 第一版提供可操作预览与线上部署供用户评估。无应用账号和后端；首版托管入口为所有者私有。

## Brand Commitments
名称 CW 小站；复古金属发报机，上方打印纸，下方触屏拨杆。

## Implementation Decisions
首版采用原生 HTML/CSS/JavaScript 模块，延续「呼号之前」的静态 PWA 思路。键盘空格为触屏的补充。初始仓库为私有。这些是本次实现选择，可后续调整。
