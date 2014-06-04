---
layout: post
title: 汇编中输出字符窜换行
description: 汇编中输出字符窜换行
categories: Old
tags: Old
---
在C中，输出换行很简单，就是**printf("\\n");**

但在汇编中就要一段代码来实现：

{% highlight nasm %}
MOV DL,0DH ;_0D为回车的ASCII码_  
INT 21H 
MOV DL,0AH ;_0A为换行的ASCII码_  
INT 21H
{% endhighlight %}

就是先输出一个回车，再输出一个换行。

这是在写某程序中的一个烦的问题，最后Google出了一个办法。

This entry was posted on Monday, November 13th, 2006 at 9:25 pm.

---



-EOF-