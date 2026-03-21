# 绘制功能——Canvas
Canvas 是一个 HTML 元素，允许我们通过 JavaScript 在网页上绘制图形。它提供了一个二维绘图环境，可以用来创建各种图形、动画和交互式内容。下面讲解一下canvas的使用方法和一些注意事项；

## canvas的代码提示：
canvas的代码提示在编辑器中不会自动显示，需要在canvas对象前添加注释，才能显示代码提示。
``` js
/** @type {HTMLCanvasElement} */ // 添加这行注释
const can = document.getElementById('canvas');
```

## canvas的简单使用方法：
### 笔画的一些基础属性
(lineWidth,strokeStyle,fillStyle)

*lineWidth*：画笔宽度

*strokeStyle*：画笔颜色

*fillStyle*：填充颜色

这些属性很好理解，后面的实例代码也会经常用到，这里就不做展示了。如果一定要说有什么需要注意的，那最多就是这些属性要在对应动作前设置，否则会默认使用上一个设置。比如fillStyle要写在fill()前。

### 笔画绘制动作与划分
(stroke,fill,beginPath)

canvas中绘制动作一般是笔画组合或图形绘制(比如绘制矩形，圆)；这里先讲讲笔画的绘制。

**绘制动作+重要的beginPath**

绘制动作用的比较多的比如*stroke*、*fill*等。*stroke*会把前面绘制的路径填充颜色，*fill*会把前面绘制的路径填充颜色。

而**如果没有使用*beginPath*方法，那么上一个路径会和当前路径连接起来。就会出现绘制覆盖**的情况。

举一个实例：（ps：会看到实例代码中也有注释讲解，是因为我本身自己写了一份代码+注释讲解进行学习记录，这里输出成文档，提到的“见第三点”在 [下面](#绘制矩形与restore恢复) 的实例代码也能见到）
``` js
ctx.moveTo(200, 200);
ctx.lineTo(300, 300);
ctx.lineWidth = 5;
ctx.strokeStyle = 'blue';
ctx.stroke();
// 1.重要的：beginPath分割stroke（或者直接说二者绑定使用，fill也需要），save,restore保存恢复画面设置(见第三点)
ctx.save();
ctx.beginPath(); // 如果这里没有这句beginPath，那么后面的ctx.stroke();会把上200→300的线条也再画一遍，出现绿盖蓝
ctx.moveTo(400, 400);
ctx.lineTo(500, 500);
ctx.lineWidth = 5; // 画笔宽度
ctx.strokeStyle = 'green'; // 画笔颜色
ctx.stroke();
```

### 封闭与填充
(closePath,fill)

*closePath*能够自动封闭图形，*fill*能够填充图形。
``` js
// 2.简单的：封闭与填充
ctx.beginPath();
ctx.moveTo(100, 100);
ctx.lineTo(150, 150);
ctx.lineTo(100, 150);
// ctx.closePath(); // 自动闭合封闭图形（相当于lineTo起点）
ctx.fillStyle = 'red'; // fillStyle要写在fill()前，才有效
ctx.fill();
// 会继续使用上面的5像素宽，绿色画笔
// ctx.lineWidth = 5; 
// ctx.strokeStyle = 'green';
ctx.stroke();
```

### 绘制矩形与restore恢复
(rect，fillRect，strokeRect，restore)

*rect*：绘制矩形，需要stroke;

*fillRect*：绘制填充矩形，不需要stroke;

*strokeRect*：绘制矩形边框，不需要stroke;

*restore*：恢复画面设置，配合*save*(在[上面](#笔画绘制动作与划分)的实例代码中有使用)
``` js
// 3.绘制矩形，restore恢复
ctx.restore();  // 可以看到这里绘制蓝色矩形而不是绿色，就是restore的效果
ctx.beginPath();
ctx.rect(200, 100, 100, 50); // 绘制矩形api
ctx.stroke();
ctx.fillStyle = 'blue'
ctx.fillRect(300, 100, 100, 50); // 绘制填充矩形api，不需要stroke
ctx.strokeRect(400, 100, 100, 50); // 绘制矩形api，同样不需要再补充stroke
```

### 绘制圆弧
(arcTo,arc)

日常使用绘制圆形基本会使用*arc*方法，*arcTo*则是用于绘制比如圆角矩形的圆角这些自由度更高的场景。

``` js
// 4.绘制圆弧，不推荐4.1arcTo，更推荐4.2arc
// 4.1 atcTo，先moveTo起点，arcTo(x1,y1,x2,y2,R);
// 根据起点与x1,y1连线，x1,y1与x2,y2连线，做内切圆，半径由R决定
// 并且最终起点还会与圆弧一端相连--->这意味着不只是圆弧，如果只想要圆弧，就得让起点为切点
ctx.beginPath();
ctx.moveTo(100, 500);
ctx.arcTo(100, 600, 0, 500, 100);
ctx.stroke();

// 4.2 arc，前两个参数为圆心坐标，然后是半径，起始角度，结束角度，绘制的顺逆时针(默认为false顺，输入true为逆)
ctx.beginPath();
ctx.arc(200, 500, 100, 0, Math.PI / 4);
ctx.stroke();
ctx.beginPath();
ctx.arc(300, 500, 100, 0, Math.PI / 4, true);
ctx.stroke();
```

### 贝塞尔曲线
(quadraticCurveTo，bezierCurveTo)

*quadraticCurveTo*：绘制二次贝塞尔曲线

*bezierCurveTo*：绘制三次贝塞尔曲线

**贝塞尔曲线这部分可能不太重要，arc和arcTo足够应用大部分场景**

``` js
// 5.贝塞尔曲线绘制任意弧线
// 5.1 二阶(当前点起点，quadraticCurveTo中传入控制点坐标+另一个参照点坐标)
// 原理是点1到控制点连线，控制点到点2连线，两线各取相同比例位置连线，
// 比如中点连接中点，同理各个点按比例互连得到很多新的线，从中取点连成弧线
ctx.save();
// 标记三个点（可忽略）
ctx.beginPath();
ctx.fillStyle = 'red';
ctx.arc(600, 100, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(700, 0, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(750, 200, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
// 绘制贝塞尔曲线
ctx.restore();
ctx.moveTo(600, 100);
ctx.quadraticCurveTo(700, 0, 750, 200);
ctx.stroke();

// 5.2 三阶，增加一个控制点
// 原理则是在二阶基础上叠加一层，因为多了一个控制点，
// 这次初始可以画出三条线了，那么三条线按照比例找点连接，
// 左连中，中连右，可以得到两条线，
// 这两条线仍然照相同比例找点连接，得到最后一条线，
// 重复，找点，得到曲线
ctx.save();
// 标记四个点（可忽略）
ctx.beginPath();
ctx.fillStyle = 'red';
ctx.arc(600, 300, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(700, 200, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(750, 400, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(600, 400, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
// 绘制贝塞尔曲线
ctx.restore();
ctx.moveTo(600, 300);
ctx.bezierCurveTo(700, 200, 750, 400, 600, 400);
ctx.stroke();
```

### 线段样式
(lineWidth,stroke，lineCap，lineJoin,setLineDash)

*lineCap*是**白板功能中常用的设置**，它能够使线段的端点样式更加美观。同时搭配的还有lineJoin，它能够使线段的连接点更加更加美观。

*lineWidth*：线段宽度

*strokeStyle*：线段颜色

*lineCap*：线段端点样式

*lineJoin*：线段连接点样式

*setLineDash*：设置线段虚线样式

``` js
ctx.beginPath();
ctx.lineWidth = 5;
ctx.lineJoin = 'round'; // 圆帽子，默认则是方形（手绘常用圆）
ctx.lineCap = 'round'; // 圆帽子，默认则是方形（手绘常用圆）
ctx.strokeStyle = 'black';
ctx.moveTo(600, 450);
ctx.lineTo(700, 450);
ctx.stroke();

ctx.beginPath();
ctx.setLineDash([5, 10]) // 虚线，数组可以传入多个，一般两个，美观
// 表示第一个线段，第一个空格，(第二个线段)...循环
ctx.moveTo(600, 500);
ctx.lineTo(700, 500);
ctx.stroke();
```

### 渐变
