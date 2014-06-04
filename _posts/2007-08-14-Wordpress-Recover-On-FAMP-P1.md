---
layout: post
title: 在FreeBSD上搭建”FAMP”平台恢复Wordpress的文章（上）
description: 在FreeBSD上搭建”FAMP”平台恢复Wordpress的文章（上）
categories: Old
tags: Old
---
"FAMP" = FreeBSD + Apache + MySQL + PHP，相比起 Linux的乱糟糟，FreeBSD可以说是非常有条理性而且简单易用，强大的ports功能使我们安装软件和打补丁时不用考虑版本的兼容性，官方的 handbook和统一的目录结构使我们学习起来得心应手。总的来说，FreeBSD是简单快捷搭建Web服务器的首选。

顺利搭建好的FAMP版本号如下：  
FreeBSD 6.1  
Apache 2.2.4  
MySQL 5.0.24  
php 5.2.3  
外加一个管理MySQL的php程序phpMyAdmin-2.10.3

因为我是在那台老赛扬366上装FreeBSD的，所以选了最小安装，没有直接连接上网，于是也就用不了ports了。控制的话，是在我台电脑用网线直连 那台366，用putty通过ssh登录来实现。如何使用ssh在handbook里有说的，如果已经安装了sshd的话，只需在 /etc/rc.conf里添加一行sshd\_enable="YES"就行了，这样每次开机就自动运行sshd。这里要留意一下，要wheel组的用户 才能su到root。

这里介绍下，在unix世界中，所有server端都会用个"d"做尾巴，ssh server就是sshd，ftp server就是ftpd，http server就是httpd，d是daemon的缩写。

文件互传方面，就是在FreeBSD上开一个ftp，也是非常简单，把/etc/inetd.conf里关于ftpd的行前的\#号去掉（\#号代表开行被注 释掉），然后在/etc/rc.conf中添加一行inetd\_enable="YES"，这样每次开机都自动运行ftpd了。

这里提示一下，上面的ftpd和sshd都没有做好安全方面的设置的，如果服务器暴露在公网上是非常危险的。

既然ports不了，我打算用更加简单的package来安装，Apache和MySQL都装得很顺，就是装php时不能在Apache里添加php模 块，没找到解决办法，这样就不得不放弃了，要用非常传统的编译安装，就是configure完后make那种。参考了下网上的文章，过程非常顺利，这里我 只记录下关键步骤供自己以后参考，详细步骤可以上网搜索。先说明，除了AMP这3个包是源码外，其余所有依存关系的包我都是用package安装，例如 perl。

首先，安装MySQL，解压好后，执行如下：  
\# ./configure --prefix=/usr/local/mysql  
\# make  
\# make install  
\# make clean  
创建MySQL用户：  
\# pw group add mysql  
\# pw user add mysql -g mysq  
初始化表：  
\# /usr/local/mysql/bin/mysql\_install\_db --user=mysql  
设置目录访问权限：  
\# cd /usr/local/mysql  
\# chown -R root . （设定root可以访问/usr/local/mysql目录）  
\# chown -R mysql var （设定mysql用户能访问/usr/local/mysql/var目录，该目录中存放mysql的数据库文件）  
\# chown -R mysql var/. （设定mysql用户能访问/usr/local/mysql/var目录下的所有文件）  
\# chown -R mysql var/mysql/. （设定mysql用户能访问/usr/local/mysql/var/mysql目录下的所有文件）  
\# chgrp -R mysql . （设定mysql组能访问/usr/local/mysql目录）  
开机自动运行：  
在/etc/rc.d目录中编辑文件 mysql\_start.sh ，内容如下  
\#! /bin/sh  
/usr/local/mysql/bin/mysqld\_safe &  
设置文件权限为可执行  
\# chmod +x mysql\_start.sh  
刚开始MySQL的密码为空，所以要更改root的密码：  
\# /usr/local/mysql/bin/mysqladmin -u root password 123123  
这样MySQL的root密码被改为123123了。  
连接测试：  
\# /usr/local/mysql/bin/mysql -uroot -p123123  
连接上后可以测试各种SQL命令：  
show databases;  
use database;  
show tables;  
select \* from table;

然后，安装Apache，解压好后，执行如下：  
\# ./configure --prefix=/usr/local/apache2 --enable-shared=max --enable-module=rewrite --enable-so  
\# make  
\# make install  
\# make clean  
开机自动运行：  
在/etc/rc.d目录中编辑文件 apache\_start.sh  
\#! /bin/sh  
/usr/local/apache2/bin/httpd -k start  
设置文件权限  
\# chmod +x apache\_start.sh  
当然，还要修改/usr/local/apache2/conf/httpd.conf里面的具体参数了。

最后，安装php，解压好后，执行如下：  
\# ./configure --prefix=/usr/local/php --with-apxs2=/usr/local/apache2/bin/apxs --with-xml --with-mysql=/usr/local/mysql   --with-config-file-path=/usr/local/lib --disable-debug --enable-safe-mode --enable-trans-sid --enable-memory-limit --enable-short-tags --disable-posix --enable-exif --enable-ftp --enable-sockets  
\# make  
\# make install  
\# make clean  
cp 一个php.ini到/usr/local/lib/php.ini去  
把php加到apache里去：  
编辑/usr/local/apache2/conf/httpd.conf，添加一行  
AddType application/x-httpd-php .php  
找到DirectoryIndex index.html，在后面添加多一个index.php  
至于LoadModule php5\_module modules/libphp5.so这行则一般已被自动添加了。

这样，一个超简单的FAMP就建起来了，创建一个php文件，内容为：  
phpinfo();  
?\>  
可以测试一下是否安装成功了。

写得有点长，关于恢复wordpress的文章，下篇再写。

This entry was posted on Tuesday, August 14th, 2007 at 5:56 pm.

---



-EOF-