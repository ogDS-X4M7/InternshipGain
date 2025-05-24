# 代码的简单整体解读——首页
框架弄完后就可以来安排各个页面的内容了，首先是首页，也就是docs/README.md

## 总体结构
首页是项目刚打开就看到的内容，代码中上来主要就是一个---(三个减号)划分区域，然后下面再随便写一点简单的文字内容作为首页介绍就可以了
```
---
home: true
title: 首页
heroImage: ...
actions:...
features:...
footer: ...
---

xxxxx(一些介绍)

```

## ---区域
使用三个减号（---）划分的区域是 YAML Front Matter，它是VuePress（以及许多静态网站生成器）中用于定义页面元数据的语法。其核心作用是为当前页面提供配置信息，控制页面的展示方式和行为。

了解大概的定义就可以了，最主要需要关心的其实是内部的结构。

首先是home:true，正如刚刚所说是主页的意思

title:首页，也是标签页的名字，但是是作为各个子页面的名字显示：因为之前也提到了.vuepress/config.js中也有一个title是标签页的名字，其实只要实际运行了项目就能看到，标签页的名字是xx|yy的形式，xx是各个子页面的名字，yy是.vuepress/config.js中的title，也就是这个网页项目的名字，因此它们都是标签页的名字

heroImage:主要的大图片url，是显示在首页的大图标，不需要的话注释掉就行了

actions:首页大图下的按钮，可以设置多个按钮，格式大概如下，
```
actions:
  - text: 让我们开始吧
    link: /guide/theFirstInternship/
    type: primary
  - text: Introduction
    link: https://vuejs.press/guide/introduction.html
    type: secondary
```
features:特点，三个一行展示在首页，所以感觉最好写三个，写一些自己想要的内容
格式如下：
```
features:
  - title: xxxx
    details: xxxxx
  - title: xxxx
    details: xxxxx
  - title: xxxx
    details: xxxxx
```

footer:---YAML Front Matter区域的最后一个部分，是作为首页的底部，首页的底部有一条长横线，然后下面的内容就是footer，也没什么好写的，就保留了原本的样子，默认的写的应该是vuepress版权。反正只是个人小项目，也没有什么想写的，我就没有改它。

## 其他文本区域与链接写法
最后就可以自由的写别的文本内容了，这部分内容会显示在footer之上，features之下，所以对于前面提到的features默认是三个一行而存在的问题：如果要写一个两个的，会只占1/3或2/3，右边空出来，不太美观，这种情况直接在这个区域写html和style写样式就可以解决

比如这个我的首页，在---之后写了html和style实现的一行占满，当然其实直接写文本内容也可以实现这个效果，但是这个写法使用flex占比还可以实现多个占一行，更具备普适性，自由度很高
```
---
......(YAML Front Matter部分的内容)
---
<div class="feature-row">
  <div class="feature-card wide">
    <!-- <h3>标题4（宽卡片）</h3> -->
    <p>这个文档的作用很明显是为我个人服务的，所以如果你想和我一样写一个类似的简单文档网站，而且不打算学的特别深入，可以参考一下我写的内容来快速了解关于vuepress的简单使用，对于快速创建应该有点帮助。或者你还是在校学生想了解一下实习中可能会遇到一些什么任务和问题，也许也会有一点参考作用</p>
  </div>
</div>
<style>
.feature-row {
  display: flex;
  gap: 20px; /* 卡片间距 */
}
.feature-card.wide {
  flex: 1; /* 卡片平分区域 */
}
</style>
```
在这个部分我还写了自己的github链接，[]中括号扩起关键词，后面()括号内写链接，显示出来就是中括号内的字高亮，且点击后打开新标签页进入括号内链接
就是这么写的： 
```
[github](https://github.com/ogDS-X4M7)
```
