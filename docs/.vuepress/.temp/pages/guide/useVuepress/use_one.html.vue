<template><div><h1 id="代码的简单整体解读——config-js" tabindex="-1"><a class="header-anchor" href="#代码的简单整体解读——config-js"><span>代码的简单整体解读——config.js</span></a></h1>
<p>首先得熟悉一下项目的代码都是怎么写的，才能把项目改成自己想要的样子，我们从<code v-pre>docs</code>项目文件夹来看。<code v-pre>docs</code>就是文档内容；<code v-pre>docs</code>目录下的<code v-pre>README.md</code>就是首页。我们这部分先讲项目的总体框架，也就是<code v-pre>.vuepress/config.js</code></p>
<h2 id="关于-vuepress-config-js" tabindex="-1"><a class="header-anchor" href="#关于-vuepress-config-js"><span>关于.vuepress/config.js</span></a></h2>
<p><code v-pre>.vuepress/config.js</code>是进行总体设计，布局框架，可以理解为<code v-pre>SPA</code>(单页应用)的总体布局框架，也就是切换路由的时候内部内容会修改，但是外面的(比如顶部的边框一直都是一样的)这部分内容就是不变的框架，后面会提到的我当时对侧边栏的误解，就是因为<code v-pre>config.js</code>是对内部各个页面的侧边栏做的总体设计，当时误以为是对首页的设计了</p>
<p>根据官网给出的新项目，以及刚刚讲的<code v-pre>config.js</code>的功能，可以看到总体框架的设计是怎么样的：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">export default defineUserConfig({</span>
<span class="line">  base: '/InternshipGain/',</span>
<span class="line">  lang: 'zh-CN',</span>
<span class="line">  title: '本小八的实习收获',</span>
<span class="line">  description: '记小八的首次实习',</span>
<span class="line">  theme: defaultTheme({</span>
<span class="line">    ...</span>
<span class="line">  })</span>
<span class="line">    bundler: viteBundler(),</span>
<span class="line">})</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol>
<li>
<p><code v-pre>lang</code>设置语言</p>
</li>
<li>
<p><code v-pre>title</code>是整个项目的标题(显示在首页、顶部栏、标签页名称)</p>
</li>
<li>
<p><code v-pre>description</code>是首页副标题，或者补充介绍</p>
</li>
<li>
<p><code v-pre>theme</code>是主题，有默认主题、<code v-pre>hope</code>等，但我只是简单地实现文档网页，就直接用默认主题，</p>
</li>
<li>
<p><code v-pre>bundler:viteBundler()</code>:用于配置 <em>Vite</em> 作为打包工具，这个也是生成的初始项目就已经写好的内容</p>
</li>
</ol>
<h3 id="defaulttheme" tabindex="-1"><a class="header-anchor" href="#defaulttheme"><span>defaultTheme</span></a></h3>
<p><code v-pre>defaultTheme</code>里面设置了总体、框架的内容，这部分比较重要，详细写一下：</p>
<ol>
<li><code v-pre>navbar</code>：顶部栏右上方的各个选项，数组存放对象的形式，一般就简单链接点击就跳转，和下拉栏两种类型</li>
</ol>
<p>简单链接填写好显示的名字和跳转链接即可：{ text: '首页', link: '/' },</p>
<p>下拉菜单则是填好显示名称，将下拉要显示的内容放入<code v-pre>children</code>里，<code v-pre>children</code>内部的内容则与简单链接写法一致：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">navbar: [</span>
<span class="line">      { text: '首页', link: '/' },</span>
<span class="line">      {</span>
<span class="line">        text: '实习收获',</span>
<span class="line">        children: [</span>
<span class="line">          { text: '第一段实习', link: '对应的路径' },</span>
<span class="line">          { text: '第二段实习', link: '对应的路径' },</span>
<span class="line">          { text: 'vuepress的简单使用', link: '对应的路径' }</span>
<span class="line">        ],</span>
<span class="line">      },</span>
<span class="line">    ],</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2">
<li><code v-pre>sidebar</code>：一开始调整了很久的侧边栏都不知道为什么没看到效果，其实是误解以为这里配置的侧边栏是给首页的，但实际上<code v-pre>config.js</code>里设置的侧边栏是给各个内部的页面使用的，首页默认要简洁，因此没有侧边栏
<code v-pre>sidebar</code>是对象存数组存对象，即</li>
</ol>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">sidebar: {</span>
<span class="line">      '/guide/': [</span>
<span class="line">        {</span>
<span class="line">          text: '第一段实习',</span>
<span class="line">          collapsible: true,</span>
<span class="line">          // 基于项目路径的 .md 或 .html 后缀是可以省略的。前缀可以是相对路径</span>
<span class="line">          prefix: 'theFirstInternship/',</span>
<span class="line">          children: ['index', 'testguide1'],</span>
<span class="line">        },</span>
<span class="line">        {</span>
<span class="line">          text: '第二段实习',</span>
<span class="line">          collapsible: true,</span>
<span class="line">          prefix: 'theSecondInternship/',</span>
<span class="line">          children: ['index'],</span>
<span class="line">        },</span>
<span class="line">        {</span>
<span class="line">          text: 'Vuepress的简单使用',</span>
<span class="line">          collapsible: true,</span>
<span class="line">          prefix: 'useVuepress/',</span>
<span class="line">          children: ['index', 'use_one'],</span>
<span class="line">        },</span>
<span class="line">      ],</span>
<span class="line">    },</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对象里面设置各个侧边栏目录项对应的文件路径，这里我都放到了<code v-pre>guide</code>里，如果有需要也可以放更多，为了让各部分内容文档不混在一起，我在常见的<code v-pre>guide</code>文件夹中继续创建分类文件夹进行分类，这就需要在侧边栏匹配各个分类的时候增加上<code v-pre>prefix</code>，把各个分类文件夹的路径名称放上去</p>
<p>内部属性：</p>
<p><code v-pre>text</code>设置目录名称，</p>
<p><code v-pre>collapsible</code>设置是否可折叠，不可折叠的话就会全部列出来而不能收缩起来，因此一般设置<code v-pre>true</code>，</p>
<p><code v-pre>prefix</code>设置前缀路径，</p>
<p><code v-pre>children</code>则是这个分类所拥有的目录项——md文件，并且后缀(.md、.html)可省略</p>
<h2 id="不太重要的小内容" tabindex="-1"><a class="header-anchor" href="#不太重要的小内容"><span>不太重要的小内容</span></a></h2>
<p>毕竟聊到<code v-pre>.vuepress/config.js</code>了，就顺便写一下关于<code v-pre>favicon</code>图标修改的实现和项目运行自动打开页面的配置，图标修改是在<code v-pre>.vuepress</code>下创建<code v-pre>public</code>文件夹，里面存放好准备好的<code v-pre>favicon</code>图标，
随后在<code v-pre>.vuepress/config.js</code>里的<code v-pre>export default defineUserConfig</code>中添加设置即可</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">head: [</span>
<span class="line">  ['link', { rel: 'icon', href: '/你的github仓库名/favicon.ico' }] </span>
<span class="line">  // 这个写法是指向public目录下的favicon.ico的意思</span>
<span class="line">],</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>项目运行自动打开需要在<code v-pre>package.json</code>中配置，加上<code v-pre>--open</code>：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">"scripts": {</span>
<span class="line">  "docs:dev": "vuepress dev docs --open",</span>
<span class="line">},</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div></template>


