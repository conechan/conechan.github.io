---
layout: post
title: 汇编隐藏光标代码
description: 汇编隐藏光标代码
categories: Old
tags: Old
---
某些场合光标在那里跳来跳去很烦，可用下面代码隐藏光标。

{% highlight nasm %}
MOV CX,1000H  
MOV AH,1  
INT 10H
{% endhighlight %}

`MOV AH,1，INT 10H` 是设定光标大小的中断。而 `CX=1000H` 暂时还搞不清什么原理。。

This entry was posted on Thursday, November 16th, 2006 at 7:34 pm.

---



-EOF-