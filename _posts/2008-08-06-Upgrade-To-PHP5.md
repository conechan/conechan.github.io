---
layout: post
title: 在FC 3和Apache 2.0.52和mysql 6上把php4升级到php5
description: 在FC 3和Apache 2.0.52和mysql 6上把php4升级到php5
categories: Old
tags: Old
---
这两天在搞一个LAMP的server，主要是想搞个wiki在team里用用。。  
  
因为想装的pmwiki不能在php4下工作，无奈之下只好看看能不能把php4升到php5。。  
  
server的情况比较郁闷，外网是连不上的，所以想让它自动搞是没可能了。然后系统是FC3，apache版本是2.0.52，php版本是4.3.9，而mysql的版本居然是6.0.0-alpha。。  
  
总之情况就是apache和php的版本极低，02年的，而mysql的版本极高，08年的。。兼容方面极可能有极多bug。。这server是人家的，不敢乱动apache，别人还装了tomcat，所以动了的话可能要全部重新配置过。。  
  
为了把影响降到最低，于是就直接搞php5算了。。过程当然是非常郁闷，error极多。。但写得这篇东西出来，当然是搞定了。。  
  
这里提点一些可能是关键的步骤，希望能对要把php4升级到php5的同学有所帮助。。  
  
---------------------（上面一大段是写给搜索引擎的）---------------------  
  
我采用是直接编译的方法来安装。。  
  
./configure --prefix=/usr/local/php5 --with-mysql=/usr/local/mysql --with-apxs2=/usr/sbin/apxs  
./make  
./make install  
  
路径要具体分析，不能照抄。。  
  
一般来说编译出错是不容易的，如果你以前php4能正常工作的话。。  
  
然后是php.ini的问题，我也不清楚要放哪里好，于是下面这些地方都放了一个。。  
  
/etc/php.ini  
/usr/local/php5/lib/php.ini  
/usr/local/lib/php.ini  
  
php.ini里的include\_path和extension\_dir可能要修改一下。。  
  
httpd.conf文件一般make install的话php5会自动帮你修改，加上一句。。  
  
LoadModule php5\_module /usr/lib/httpd/modules/libphp5.so  
  
路径方面具体情况具体分析。。  
  
跟着mysql方面可能会有影响，主要是libmysqlclient.so.15这个module没load到，我这次最主要就卡在这个error上。。  
  
首先要把libmysqlclient.so.15搞到恰当的位置，做法是ln一个是soft link。。  
  
网上google到这个。。  
  
cd /usr/lib  
ln -s /usr/local/lib/mysql/libmysqlclient.so  
ln -s /usr/local/lib/mysql/libmysqlclient.so.15  
  
具体放哪里也需要具体分析error的log。。  
  
还要确保mysql的进程起来了，ps -ef | grep mysql一下。。  
  
没起来就启动一下。。  
  
/usr/local/mysql/bin/mysqld\_safe &  
  
最后可能还会出现libmysqlclient.so.15 Permission denied之类的错误，把FC的selinux关了reboot就好了。。  
  
编辑/etc/selinux/config文件，找到SELINUX=enforcing，改为SELINUX=disabled  
  
编辑/etc/sysconfig/selinux文件，找到SELINUX=enforcing，改为SELINUX=disabled  
  
  
以上就是我这次升级php4到php5的一些tips。。个人懒惰问题，没有装gd库，如果装多点feature的话，可能error会更多。。

2008年08月06日 星期三  01:50 P.M.

-EOF-