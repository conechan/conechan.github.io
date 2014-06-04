---
layout: post
title: 腾讯技术支持笔试附加题那个走圈圈矩阵的C语言代码
description: 腾讯技术支持笔试附加题那个走圈圈矩阵的C语言代码
categories: Old
tags: Old
---

{% highlight c %}

/*-------------------------------------------  
昨晚搞到3点，硬是把程序写出来了，在Dev-C++中编译通过。因为注释和include问题，可能不能在C的编译器中编译，修改一下就ok了。  
-------------------------------------------*/  
  
/*--------------------------------------------  
Title: 打印走圈圈矩阵  
Version: 1.0  
Author: cone  
Date: Oct 30, 2007  
Use: QQ技术支持类笔试附加题  
Other: 算法比较傻   
  
--------------------------------------------*/  
  
#include <iostream>
#include <stdlib.h>

#define POWER 15
#define ELEMENT "%5d"

using namespace std;

main()
{
    int n;            //输入的n
    int x[POWER][POWER];    //初始化二维数组

    int i;        //i来控制循环结束
    int j;
    int count;        //计数每一步

    int right, down, left, up;
    //每次分别向上下左右走的步数
    int pos_right, pos_down, pos_left, pos_up;
    //每次分别向上下左右走的初始位置，亦作相反方向的边界

    printf("please enter n: ");
    scanf("%d", &n);            //输入n

    count = 1;      //从1开始计数

    pos_right = 0;
    pos_down = 0;
    pos_left = n - 1;
    pos_up = n - 1;

    for (i = n; i > 0; i = i - 2)
    {
        //因为每次上下或左右两边界都要向中间缩一步，所以i每次减2
        for (right = pos_right; right < pos_left; right++) //用pos_left来定右界
        {
            //从pos_right开始向右走，走到pos_left的前一步
            x[pos_down][right] = count;          //借用pos_down来指定行号
            count++;
        }
        for (down = pos_down; down < pos_up; down++) //借用pos_up来定下界
        {
            //从pos_down开始向下走，走到pos_up的前一步
            x[down][pos_left] = count;            //借用pos_left来指定列号
            count++;
        }
        for (left = pos_left; left > pos_right; left--) //用pos_right来定左界
        {
            //从pos_left开始向左走，走到pos_right的前一步
            x[pos_up][left] = count;                //借用pos_up来指定行号
            count++;
        }
        for (up = pos_up; up > pos_down; up--)    //用pos_down来定上界
        {
            //从pos_up开始向上走，走到pos_down的前一步
            x[up][pos_right] = count;                //借用pos_right来指定列号
            count++;
        }

        pos_right++;
        pos_down++;
        pos_left--;
        pos_up--;
        //pos_分别向右下左上各移一步，也是各边界向中间各缩一步
        if (pos_right == pos_left)
        {
            x[pos_right][pos_left] = n * n;
            break;
        }
        /*因为当n为奇数时上面的4个循环均未能考虑到正中的那个位置，
        即最后一步，所以这里在每次走完一圈后加上一个判断。n为奇数
        的最后一步，四个pos_相同，这里随便取了两个pos_来判断，直接
        给最后一步赋值为(n*n)，可能是比较傻的方法了*/
    }

    for (i = 0; i < n; i++)
    {
        for (j = 0; j < n; j++)
        {
            printf(ELEMENT, x[i][j]);        //打印矩阵
        }
        printf("\n");
    }

    system("PAUSE");
    return 0;
}

{% endhighlight %}

2007年10月31日 星期三  12:41 P.M.

-EOF-