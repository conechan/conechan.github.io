---
layout: post
title: 在FreeBSD上搭建”FAMP”平台恢复Wordpress的文章（下）
description: 在FreeBSD上搭建”FAMP”平台恢复Wordpress的文章（下）
categories: Old
tags: Old
---
先接回上篇，最后还差phpmyadmin的安装。其实就是普通php程序一样，非常容易，这里用了最新的2.10.3，按说明修改一下config就行了。

我的旧blog是百步梯服务器上搭的Wordpress，要恢复的话，当然要有备份了。平时我是用phpmyadmin来导出sql文件来备份的。最后一次备份的信息如下：  
-- phpMyAdmin SQL Dump  
-- version 2.8.0.2  
-- http://www.phpmyadmin.net  
--  
-- 主机: localhost  
-- 生成日期: 2007 年 02 月 27 日 02:16  
-- 服务器版本: 4.0.18  
-- PHP 版本: 4.3.6  
--  
-- 数据库: \`cone\`

由此可见备份的MySQL版本是4.0，而我装的那个是5.0，可能会有点兼容性的问题出现。 恢复的时候果然如此，当我全部都选utf8-unicode导入时，还是会出现乱码。后来比较好运，试了一个编码组合，居然成功了，组合如下：  
建数据库时，选utf8\_unicode\_ci；  
导入数据时，字符集选latin1；  
SQL compatibility mode选MySQL40。

到此，终于成功地恢复了旧blog的文章。下面，將利用Wordpress的插件把所有文章都生成独立的静态html文件，这样就可以真真正正地备份好了。

通过搜索，我找到了一个名为aReal-Html-Cache的Wordpress插件，可以在[http://www.pkphp.com/index.php?act=art&AID=1541](http://www.pkphp.com/index.php?act=art&AID=1541)下载到。因为改插件需要建立目录和写文件，所以涉及到权限的问题，我们可以适当地修改目录权限来解决。设置好后，可以手动控制来生成html文档，效果正是我想要的那样，非常好。

搞这个东西，浑浑噩噩地又过了两天，呵呵～

This entry was posted on Tuesday, August 14th, 2007 at 7:13 pm.

---



-EOF-