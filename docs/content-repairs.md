# 历史内容修复记录

后续变更（2026-11-17）：按站点所有者要求移除评论入口及 Disqus 加载组件。下方评论相关内容记录当时的检查和修复过程；文章正文内保存的历史留言保留。

2026-11-17。保留 213 篇文章的正文、日期、原始路径及原 Disqus 线程身份。

## 已修复

- 两类大小写错误的站内路径共 3 处引用已改正，并为带/不带尾斜杠的旧路径添加 301 跳转。
- 三张豆瓣电影海报找回原文件，确认图片内容后转存到 `img/post/<文章日期和名称>/poster.jpg`，并加入公开资源清单。原文件分别为 `s3692634.jpg`、`s3643899.jpg`、`s3765401.jpg`。
- 评论真正加载完成后才隐藏加载按钮和提示；网络失败或等待超过 20 秒时显示重试入口。重试沿用原 Disqus URL，并避免同时重复加载。
- 8 个异常外链替换为下列已经读取并核对内容的网页存档。保留原地址作为可见文字，并明确标注“网页存档”。未将后来变为其他用途的域名快照当作原站。

| 原地址 | 可用网页存档 |
|---|---|
| `http://www.douban.com/review/2292485/` | [查看存档](https://web.archive.org/web/20130317091159/http://movie.douban.com:80/review/2292485/) |
| `http://www.qpg901.com` | [查看存档](https://web.archive.org/web/20061205044251/http://qpg901.com:80/) |
| `http://my.donews.com/diky/` | [查看存档](https://web.archive.org/web/20080907144454/http://my.donews.com/diky/) |
| `http://blog.sina.com.cn/BACHBLOG` | [查看存档](https://web.archive.org/web/20231003032654/https://blog.sina.com.cn/BACHBLOG) |
| `http://ligy.100steps.net/blog/index.php` | [查看存档](https://web.archive.org/web/20071030062320/http://ligy.100steps.net:80/blog/index.php) |
| `http://www.linuxsir.org/bbs/forumdisplay.php?f=58` | [查看存档](https://web.archive.org/web/20060711233655/http://www.linuxsir.org:80/bbs/forumdisplay.php?f=58) |
| `http://lfs.linuxsir.org/main/?q=node&from=110` | [查看存档](https://web.archive.org/web/20070823110049/http://lfs.linuxsir.org/main/?q=node&from=110) |
| `http://www.pianopractice.org/` | [查看存档](https://web.archive.org/web/20090422161121/http://www.pianopractice.org:80/) |

其中 `qpg901.com` 的 2006 年快照会转向当时的“小朋友的大世界”节目站；LinuxSir 使用 2006 年的 LFS 讨论区快照，未采用后来内容无关的快照。钢琴练习书使用 2009 年作者 Chuan C. Chang 的原主页存档。

## 无法恢复的原始内容

- 7 张 Windows 临时目录 `moz-screenshot*.jpg`：仓库及可用 Git 历史没有原图。移除无效图片语法，在原位置注明缺失，不用其他图片冒充。原引用仍可在 Git 历史中查到。
- Yahoo 博客的两篇手型文章：未找到对应文章的可用存档。保留原地址为文本，标注失效。
- `ticket.100steps.net`：原站已无法解析，未找到可用存档；保留原地址为文本。
- `blogcn.com/user45/xtlinger/index.html`：找到的历史快照本身就是错误页面，不能作为恢复结果；保留原地址并标注。

## 评论完整性

公开接口可查到《GitLab 安装配置心得记录》和《MacBook Air 的移动硬盘方案》各 1 条评论，均已在浏览器确认。其余未返回公开计数的 URL 不等同于“评论丢失”；私密、待审和已删除记录需由账户持有人在 Disqus 管理后台核对。本次没有迁移、合并或覆盖评论线程。

## 验证

构建会检查全部文章正文里的站内 href/src 是否有实际构建产物，公开资源是否字节一致，旧路径跳转文件是否发布。回归测试覆盖旧路径目标、缺失图片说明及本地海报。评论加载成功和网络失败/重试通过浏览器验证。
