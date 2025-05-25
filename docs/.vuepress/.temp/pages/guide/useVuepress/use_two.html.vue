<template><div><h1 id="代码的简单整体解读——首页" tabindex="-1"><a class="header-anchor" href="#代码的简单整体解读——首页"><span>代码的简单整体解读——首页</span></a></h1>
<p>框架弄完后就可以来安排各个页面的内容了，首先是首页，也就是<code v-pre>docs/README.md</code></p>
<h2 id="总体结构" tabindex="-1"><a class="header-anchor" href="#总体结构"><span>总体结构</span></a></h2>
<p>首页是项目刚打开就看到的内容，代码中上来主要就是一个<code v-pre>---</code>(三个减号)划分区域，然后下面再随便写一点简单的文字内容作为首页介绍就可以了</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">---</span>
<span class="line">home: true</span>
<span class="line">title: 首页</span>
<span class="line">heroImage: ...</span>
<span class="line">actions:...</span>
<span class="line">features:...</span>
<span class="line">footer: ...</span>
<span class="line">---</span>
<span class="line"></span>
<span class="line">xxxxx(一些介绍)</span>
<span class="line"></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="区域" tabindex="-1"><a class="header-anchor" href="#区域"><span>---区域</span></a></h2>
<p>使用三个减号（<code v-pre>---</code>）划分的区域是 <code v-pre>YAML Front Matter</code>，它是<em>VuePress</em>（以及许多静态网站生成器）中用于定义页面元数据的语法。其核心作用是为当前页面提供配置信息，控制页面的展示方式和行为。</p>
<p>了解大概的定义就可以了，最主要需要关心的其实是内部的结构。</p>
<p>首先是<code v-pre>home:true</code>，正如刚刚所说是主页的意思</p>
<p><code v-pre>title</code>：首页、标签页的名字，是作为各个子页面的名字显示：因为<RouteLink to="/guide/useVuepress/use_one.html#%E5%85%B3%E4%BA%8Evuepressconfigjs">之前</RouteLink>也提到了<code v-pre>.vuepress/config.js</code>中也有一个<code v-pre>title</code>是标签页的名字，其实只要实际运行了项目就能看到，标签页的名字是<code v-pre>xx|yy</code>的形式，<code v-pre>xx</code>是各个子页面的名字，<code v-pre>yy</code>是<code v-pre>.vuepress/config.js</code>中的<code v-pre>title</code>，也就是这个网页项目的名字，因此它们都是标签页的名字</p>
<p><code v-pre>heroImage</code>：主要的大图片<code v-pre>url</code>，是显示在首页的大图标，不需要的话注释掉就行了</p>
<p><code v-pre>actions</code>：首页大图下的按钮，可以设置多个按钮，格式大概如下，</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">actions:</span>
<span class="line">  - text: 让我们开始吧</span>
<span class="line">    link: /guide/theFirstInternship/</span>
<span class="line">    type: primary</span>
<span class="line">  - text: Introduction</span>
<span class="line">    link: https://vuejs.press/guide/introduction.html</span>
<span class="line">    type: secondary</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>features</code>：特点，三个一行展示在首页，所以感觉最好写三个，写一些自己想要的内容
格式如下：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">features:</span>
<span class="line">  - title: xxxx</span>
<span class="line">    details: xxxxx</span>
<span class="line">  - title: xxxx</span>
<span class="line">    details: xxxxx</span>
<span class="line">  - title: xxxx</span>
<span class="line">    details: xxxxx</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>footer</code>：<code v-pre>YAML Front Matter</code>区域的最后一个部分，是作为首页的底部，首页的底部有一条长横线，然后下面的内容就是<code v-pre>footer</code>，也没什么好写的，就保留了原本的样子，默认的写的应该是<em>vuepress</em>版权。反正只是个人小项目，也没有什么想写的，我就没有改它。</p>
<h2 id="其他文本区域与链接写法" tabindex="-1"><a class="header-anchor" href="#其他文本区域与链接写法"><span>其他文本区域与链接写法</span></a></h2>
<p>最后就可以自由的写别的文本内容了，这部分内容会显示在<code v-pre>footer</code>之上，<code v-pre>features</code>之下，所以对于前面提到的<code v-pre>features</code>默认是三个一行而存在的问题：如果要写一个两个的，会只占<code v-pre>1/3</code>或<code v-pre>2/3</code>，右边空出来，不太美观，这种情况直接在这个区域写<code v-pre>html</code>标签和<code v-pre>style</code>写样式就可以解决</p>
<p>比如这个我的首页，在<code v-pre>---</code>之后写了<code v-pre>html</code>和<code v-pre>style</code>实现的一行占满，当然其实直接写文本内容也可以实现这个效果，但是这个写法使用<code v-pre>flex</code>占比还可以实现多个占一行，更具备普适性，自由度很高</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">---</span>
<span class="line">......(YAML Front Matter部分的内容)</span>
<span class="line">---</span>
<span class="line">&lt;div class="feature-row"></span>
<span class="line">  &lt;div class="feature-card wide"></span>
<span class="line">    &lt;!-- &lt;h3>标题4（宽卡片）&lt;/h3> --></span>
<span class="line">    &lt;p>这个文档的作用很明显是为我个人服务的，所以如果你想和我一样写一个类似的简单文档网站，而且不打算学的特别深入，可以参考一下我写的内容来快速了解关于vuepress的简单使用，对于快速创建应该有点帮助。或者你还是在校学生想了解一下实习中可能会遇到一些什么任务和问题，也许也会有一点参考作用&lt;/p></span>
<span class="line">  &lt;/div></span>
<span class="line">&lt;/div></span>
<span class="line">&lt;style></span>
<span class="line">.feature-row {</span>
<span class="line">  display: flex;</span>
<span class="line">  gap: 20px; /* 卡片间距 */</span>
<span class="line">}</span>
<span class="line">.feature-card.wide {</span>
<span class="line">  flex: 1; /* 卡片平分区域 */</span>
<span class="line">}</span>
<span class="line">&lt;/style></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这个部分我还写了自己的<code v-pre>github</code>链接，<code v-pre>[]</code>中括号扩起关键词，后面<code v-pre>()</code>括号内写链接，显示出来就是中括号内的字高亮，且点击后打开新标签页进入括号内链接
就是这么写的：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">[github](https://github.com/ogDS-X4M7)</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></div></template>


