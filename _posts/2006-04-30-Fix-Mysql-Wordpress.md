---
layout: post
title: 转载：解决wordpress在mysql数据库乱码问题
description: 转载：解决wordpress在mysql数据库乱码问题
categories: Old
tags: Old
---
修改文件"WordPress/wp-includes/wp-db.php"，在第58行添加下边两行：

{% highlight console %}
mysql_query("SET NAMES 'UTF8'");  
mysql_query("SET CHARACTER SET UTF8"); 
{% endhighlight %}

修改结果参照如下：

{% highlight php %}
function wpdb($dbuser, $dbpassword, $dbname, $dbhost) {  
  $this->dbh = @mysql_connect($dbhost, $dbuser, $dbpassword);  
  if (!$this->dbh) {  
    $this->bail("......");  
  }  
  $this->select($dbname);  
  mysql_query("SET NAMES 'UTF8'");  
  mysql_query("SET CHARACTER SET UTF8");  
}
{% endhighlight %}

恭喜！设置完成！接下来照常安装WordPress，就一切OK了！

This entry was posted on Sunday, April 30th, 2006 at 2:32 am.

---



-EOF-