---
layout: post
title: Macbook Air的移动硬盘方案
description: 话说乞丐版的13寸Macbook Air只有128GB的SSD，如果要配256GB的SSD，要加差不多一台ipad mini的钱，这显然是不符合屌丝的价值观的。而且Air又不像Pro那样可以潇洒地拆光驱装硬盘，所以要扩展存储只能通过移动硬盘，或者网络存储。
categories: Mac
tags: Macbook Air, OSX
---
话说乞丐版的13寸Macbook Air只有128GB的SSD，如果要配256GB的SSD，要加差不多一台ipad mini的钱，这显然是不符合屌丝的价值观的。而且Air又不像Pro那样可以潇洒地拆光驱装硬盘，所以要扩展存储只能通过移动硬盘，或者网络存储。

而网络存储又有点高端（NAS买不起呀），而且依赖网络（在小水管网络下云存储只是浮云），所以一般人还是会使用移动硬盘作为首选的外部存储设备。

因为移动硬盘需要在Mac和Windows间来回走动，所以先来研究一下文件系统吧。

OSX的文件系统是HFS+格式，现代Windows的文件系统是NTFS格式。OSX对NTFS原生只能读取，要写入的话可以hack设置或者使用第三方软件，不过貌似可靠性不高，网上有丢失数据的个案。Windows对HFS+则完全不支持，略过。

那有没有Mac和Windows都支持读写的文件系统呢？有，ExFAT格式。但ExFAT也有缺点。首先，ExFAT格式的分区在Windows XP上需要加装额外的驱动才能认出来。不过我的硬盘没打算在XP上使用，所以问题不大。然后，ExFAT格式并没有像NTFS那样的文件索引，所以像Everything这样的搜索神器在上面就武功全废了。这个对于文件特别多又喜欢乱放的同学是比较痛苦的。

除了储存文件，我还想用移动硬盘来做OSX的安装盘，做Time Machine备份，最后我那个750GB的移动硬盘有了下面这个分区方案。

* 5GB for OSX安装盘，HFS+格式
* 200GB for Time Machine（据说Time Machine的分区最好为系统分区的1.5到2倍），HFS+格式
* 50GB for Mac的各种东西，Windows不可能用到的，HFS+格式
* 剩下的做储存仓库，exFAT格式

动手了，把硬盘上原来的数据备份好，然后把分区全部删掉（新买的硬盘就忽略这步），用OSX里的磁盘工具（spotlight搜“磁盘工具”打开）重新划分。

![分区](http://ww4.sinaimg.cn/mw600/547806e8jw1e0bxt67cljj.jpg "分区")

插个话题，为毛一定要在OSX里分区呢？在Windows里分区不行吗？这个，是有关于分区表的问题。我们PC上的硬盘一般都是使用MBR分区表，Windows下面默认初始化硬盘也是使用MBR分区表。这是个旧时代的产物，有些局限性，主要是硬盘上的主分区（Primary）不能多于4个，还有对超大硬盘支持不好（2TB限制）。而在Mac下，硬盘都是用新时代的GPT分区表（GUID）。不过GPT分区表的硬盘也有局限性，就是不能在BIOS的机器上作启动盘（装系统），只能在EFI（EFI是用来取代BIOS的）的机器上启动。其实Windows下面也能把硬盘转换成GPT分区表，不过还是直接在Mac下分区来得省事吧。

回到正题。分好区后，就按方案把各个分区格式化成想要的格式。在左边选择分区，在右边的“抹掉”标签页里选格式，抹掉。

![ExFAT](http://ww2.sinaimg.cn/mw600/547806e8jw1e0bxt2hyidj.jpg "ExFAT格式")

接着，制作OSX的安装盘。先要搞到系统的image，我的方法是在App Store下载Mountain Lion系统，然后在安装包里把InstallESD.dmg复制出来。在左边选择“恢复”标签页，把InstallESD.dmg拖到源磁盘，把对应的移动硬盘上的分区拖到目的磁盘，恢复。

![OSX安装盘](http://ww1.sinaimg.cn/mw600/547806e8jw1e0bxt9ln5dj.jpg "OSX安装盘")

最后，制作Time Machine备份盘。打开Time Machine的偏好设置，选择磁盘，然后选择对应的分区。

![Time Machine](http://ww2.sinaimg.cn/mw600/547806e8jw1e0bxtda4lqj.jpg "Time Machine")

关于Time Machine，还有要注意的地方。首先，是排除一些不需要备份的文件夹，免得备份过大，下面是我自己的设置（那些文件都在PC上有存档，仅供参考）。

![Time Machine设置](http://ww1.sinaimg.cn/mw600/547806e8jw1e0bzo4r1n1j.jpg "Time Machine 设置")

然后最最重要的，**禁止Time Machine本地备份**。因为当移动硬盘没接上的时候，Time Machine就会默默地往你宝贵的SSD空间上备份了……在终端窗口输入如下命令禁止掉。

    sudo tmutil disablelocal

好了，大功告成，接上硬盘让Time Machine慢慢备份，我们庆功吃牛杂去～
