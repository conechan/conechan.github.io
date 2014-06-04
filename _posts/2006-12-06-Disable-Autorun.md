---
layout: post
title: 关闭autorun，远离U盘病毒
description: 关闭autorun，远离U盘病毒
categories: Old
tags: Old
---
在"开始"菜单的"运行"中输入Regedit，打开注册表编辑器，展开到HKEY\_CURRENT\_USER\\Software\\Microsoft＼Windows＼CurrentVersion＼ Policies＼Exploer主键下，在右侧窗格中找到"NoDriveTypeAutoRun"，就是这个键决定了是否执行CDROM或硬盘的 AutoRun功能。把NoDriveTypeAutoRun的值改为 FF,00,00,00。

**最后切记请勿双击打开，要用右键--打开。**

This entry was posted on Wednesday, December 6th, 2006 at 3:34 pm.

---

Diky says 

December 6th, 2006 at 6:25 pm

右键打开也不是很保险
用资源管理器比较好

cone says 

December 7th, 2006 at 5:52 pm

右键又会有麻烦? \* - \*

Diky says 

December 8th, 2006 at 4:17 pm

会有的，我试过右键的"打开"也是病毒......

cone says 

December 8th, 2006 at 10:03 pm

开始 - 运行 - cmdDOS操作进去。。

oo says 

December 18th, 2006 at 1:54 am

oo

-EOF-