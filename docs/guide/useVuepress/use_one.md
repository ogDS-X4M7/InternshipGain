# 代码的简单整体解读——config.js

首先得熟悉一下项目的代码都是怎么写的，才能把项目改成自己想要的样子，我们从docs项目文件夹来看。docs就是文档内容；docs目录下的README.md就是首页。我们这部分先讲项目的总体框架，也就是.vuepress/config.js

## 关于.vuepress/config.js
.vuepress/config.js是进行总体设计，布局框架，可以理解为SPA(单页应用)的总体布局框架，也就是切换路由的时候内部内容会修改，但是外面的(比如顶部的边框一直都是一样的)这部分内容就是不变的框架，后面会提到的我当时对侧边栏的误解，就是因为config是对内部各个页面的侧边栏做的总体设计，当时误以为是对首页的设计了

根据官网给出的新项目，以及刚刚讲的config.js的功能，可以看到总体框架的设计是怎么样的：
```
export default defineUserConfig({
  base: '/InternshipGain/',
  lang: 'zh-CN',
  title: '本小八的实习收获',
  description: '记小八的首次实习',
  theme: defaultTheme({
    ...
  })
    bundler: viteBundler(),
})
```
1. lang设置语言

2. title是整个项目的标题(显示在首页、顶部栏、标签页名称)

3. description是首页副标题，或者补充介绍

4. theme是主题，有默认主题、hope等，但我只是简单地实现文档网页，就直接用默认主题，

5. bundler:viteBundler():用于配置 Vite 作为打包工具，这个也是生成的初始项目就已经写好的内容
### defaultTheme
defaultTheme里面设置了总体、框架的内容，这部分比较重要，详细写一下：

1. navbar：顶部栏右上方的各个选项，数组存放对象的形式，一般就简单链接点击就跳转，和下拉栏两种类型
简单链接填写好显示的名字和跳转链接即可：{ text: '首页', link: '/' },
下拉菜单则是填好显示名称，将下拉要显示的内容放入children里，children内部的内容则与简单链接写法一致：
```
navbar: [
      { text: '首页', link: '/' },
      {
        text: '实习收获',
        children: [
          { text: '第一段实习', link: '对应的路径' },
          { text: '第二段实习', link: '对应的路径' },
          { text: 'vuepress的简单使用', link: '对应的路径' }
        ],
      },
    ],
```

2. sidebar：一开始调整了很久的侧边栏都不知道为什么没看到效果，其实是误解以为这里配置的侧边栏是给首页的，但实际上config里设置的侧边栏是给各个内部的页面使用的，首页默认要简洁，因此没有侧边栏
sidebar是对象存数组存对象，即
```
sidebar: {
      '/guide/': [
        {
          text: '第一段实习',
          collapsible: true,
          // 基于项目路径的 .md 或 .html 后缀是可以省略的。前缀可以是相对路径
          prefix: 'theFirstInternship/',
          children: ['index', 'testguide1'],
        },
        {
          text: '第二段实习',
          collapsible: true,
          prefix: 'theSecondInternship/',
          children: ['index'],
        },
        {
          text: 'Vuepress的简单使用',
          collapsible: true,
          prefix: 'useVuepress/',
          children: ['index', 'use_one'],
        },
      ],
    },
```
对象里面设置各个侧边栏目录项对应的文件路径，这里我都放到了guide里，如果有需要也可以放更多，为了让各部分内容文档不混在一起，我在常见的guide文件夹中继续创建分类文件夹进行分类，这就需要在侧边栏匹配各个分类的时候增加上prefix，把各个分类文件夹的路径名称放上去

内部属性：

text设置目录名称，

collapsible设置是否可折叠，不可折叠的话就会全部列出来而不能收缩起来，因此一般设置true，

prefix设置前缀路径，

children则是这个分类所拥有的目录项——md文件，并且后缀(.md、.html)可省略

## 不太重要的小内容
毕竟聊到.vuepress/config.js了，就顺便写一下关于favicon图标修改的实现，是在.vuepress下创建public文件夹，里面存放好准备好的favicon图标，
随后在.vuepress/config.js里的export default defineUserConfig中添加设置即可
```
head: [
['link', { rel: 'icon', href: '/你的github仓库名/favicon.ico' }] // 这个写法是指向public目录下的favicon.ico的意思
],
```