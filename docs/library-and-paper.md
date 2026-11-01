# 阅读库与换纸动作

## 内容来源

内置 100 段英文原作节选，每部作品 10 段；保留作者、作品名、出版年份及数字底本链接。另有 3 篇小站基础练习、21 组虚构通联。节选是原文完整段落，适配练习时转为大写、移除引号与排版标记、将感叹号改为句号、分号改为逗号；不支持的排版字符转换为空格。未将原创内容冒称经典摘录。

| 原作 | 作者 | 初版年份 | 数字底本 |
| --- | --- | --- | --- |
| Pride and Prejudice | Jane Austen | 1813 | https://www.gutenberg.org/ebooks/1342 |
| Alice's Adventures in Wonderland | Lewis Carroll | 1865 | https://www.gutenberg.org/ebooks/11 |
| Great Expectations | Charles Dickens | 1861 | https://www.gutenberg.org/ebooks/1400 |
| Walden | Henry David Thoreau | 1854 | https://www.gutenberg.org/ebooks/205 |
| Little Women | Louisa May Alcott | 1868 | https://www.gutenberg.org/ebooks/514 |
| Treasure Island | Robert Louis Stevenson | 1883 | https://www.gutenberg.org/ebooks/120 |
| The Happy Prince and Other Tales | Oscar Wilde | 1888 | https://www.gutenberg.org/ebooks/902 |
| The Secret Garden | Frances Hodgson Burnett | 1911 | https://www.gutenberg.org/ebooks/113 |
| The Call of the Wild | Jack London | 1903 | https://www.gutenberg.org/ebooks/215 |
| The Wind in the Willows | Kenneth Grahame | 1908 | https://www.gutenberg.org/ebooks/27805 |

选用久已进入公版的英文原作（作者卒于 1817–1932 年），不收录现代译文、插图、前言及电子书发布机构的包装内容。数字底本所在网站与文本本身的权利状态应区别看待；参考[底本版权说明](https://www.gutenberg.org/help/copyright.html)。`node scripts/import-readings.mjs` 可重建当前选段；脚本筛选完整段落、检查数量和重复项，输出经人工浏览确认后入库。后续重新抓取可能因底本修订改变结果，应审核 diff，不能自动发布。

## 机械动作依据

- [Smithsonian：1848 年摩尔斯记录机](https://americanhistory.si.edu/collections/object/nmah_706644)：发条机构通过一对滚轮拉动窄纸带，压出点划，并非自动印出英文字母的宽纸面。
- [Creed 7/8 原理手册，纸张插入与纸车章节](https://www.cryptomuseum.com/telex/creed/7/files/CM303966_Creed_7_8_principles.pdf)：纸从滚筒后方引入，转动滚筒旋钮带到前方；松开压轮，校正纸边，再恢复压力。

本应用是以当前宽纸面 UI 为基础的机械意象，借用电传打字机装纸与摩尔斯记录机滚轮牵引的动作逻辑，并非某一真实机型的精确数字复刻，也没有资料支持“所有机器都固定会卡两下”。退纸方向与新纸出现的遮挡关系服务于当前滚筒的位置。

换纸总长约 680ms：旧纸连续收进滚筒后方（260ms），新纸紧接着连续卷出（420ms）。两段各自只有起止姿态，使用平顺缓动，不包含中途停顿、摆正、分段进纸或末端回弹。纸张始终裁切在固定区域中，滚筒遮住纸头，局部投影表示接触。资料中的人工装纸校正步骤不再被改编成自动换篇时的固定动作。

Web Animations API 管理单个纸张的变换。连续请求从当前姿态重新退纸，以最后一次请求为准；取消的动画不提交过期内容。换纸时撤销未完成输入并暂停发报，完成后恢复；切后台立即完成最新请求。减少动态效果时直接换纸，仍给出就位提示，不强迫用户等待空间动画。没有加入新依赖。
