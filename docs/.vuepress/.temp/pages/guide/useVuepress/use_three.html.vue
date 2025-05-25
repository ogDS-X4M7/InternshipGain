<template><div><h1 id="其他文档的设计" tabindex="-1"><a class="header-anchor" href="#其他文档的设计"><span>其他文档的设计</span></a></h1>
<p>可以开始正式写自己的文档了！设计各个页面，这些是和之前所说的<code v-pre>link</code>相匹配的文档。</p>
<h2 id="文档处理与后续的添加操作方式" tabindex="-1"><a class="header-anchor" href="#文档处理与后续的添加操作方式"><span>文档处理与后续的添加操作方式</span></a></h2>
<p>这里我把文档内容都放进<code v-pre>/docs/guide</code>里，<code v-pre>guide</code>是创建的新文件夹，为了区分各个章节，又创建了<code v-pre>theFirstInternship</code>、<code v-pre>theSecondInternship</code>、<code v-pre>useVuepress</code>，里面放各自的md文件，即为文档。</p>
<p><a id="test"></a></p>
<p>如果后续需要添加章节，其实也基本只是在<code v-pre>/docs/guide</code>里创建新文件夹，如果需要添加小节的内容，则到对应的文件夹下添加.md文件然后编写。</p>
<p>添加章节后，到<code v-pre>config.js</code>中去添加<code v-pre>navbar</code>和<code v-pre>sidebar</code>项目即可，操作和<RouteLink to="/guide/useVuepress/use_one.html#defaulttheme">之前</RouteLink>讲过的是一样的</p>
<p>添加小节的话，也是到<code v-pre>config.js</code>，不过只需要给<code v-pre>sidebar</code>中对应章节增加<code v-pre>children</code>就可以了</p>
<h2 id="常用格式" tabindex="-1"><a class="header-anchor" href="#常用格式"><span>常用格式</span></a></h2>
<p>文档的常用格式，或者说我用到了的格式都有：</p>
<h3 id="标题" tabindex="-1"><a class="header-anchor" href="#标题"><span>标题</span></a></h3>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">注意井号和文字中间要有一个空格</span>
<span class="line"># 一级标题</span>
<span class="line">## 二级标题</span>
<span class="line">### 三级标题</span>
<span class="line">#### 四级标题</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>演示结果：演示结果就是这个页面中的各个标题，就不赘述了。</p>
<h3 id="在文档中添加代码" tabindex="-1"><a class="header-anchor" href="#在文档中添加代码"><span>在文档中添加代码</span></a></h3>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">使用的是三个反引号进行划分：</span>
<span class="line">(</span>
<span class="line">    ```</span>
<span class="line">    this area is for your codes</span>
<span class="line">    ```</span>
<span class="line">)</span>
<span class="line">代码开始前的上一行写三个反引号，代码结束后的下一行写三个反引号。</span>
<span class="line">从而划分出代码的区域，展示在页面上。</span>
<span class="line">这是Markdown 中表示代码区域的标准方式，被称作代码围栏</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><details class="hint-container details"><summary>点击查看演示结果</summary>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">this area is for your codes</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></details>
<h3 id="换行" tabindex="-1"><a class="header-anchor" href="#换行"><span>换行</span></a></h3>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">a:写文本内容的时候经常需要换行，但并不是一个回车就能解决</span>
<span class="line"></span>
<span class="line">b:而是需要间隔一行来表示换行，就像这里的b行和a行，到页面上才会换一行</span>
<span class="line">c:而如果只是一个回车，就像这里的b行和c行，页面上是相连的，中间只隔一个空格</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><details class="hint-container details"><summary>点击查看演示结果</summary>
<p>a:写文本内容的时候经常需要换行，但并不是一个回车就能解决</p>
<p>b:而是需要间隔一行来表示换行，就像这里的b行和a行，到页面上才会换一行
c:而如果只是一个回车，页面上的b和c是相连的，中间只隔了一个空格</p>
</details>
<h3 id="链接" tabindex="-1"><a class="header-anchor" href="#链接"><span>链接</span></a></h3>
<p>在写文档的时候链接是经常用到的，我用到的几种链接如下：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">注意：锚点链接跳转后返回上一页(或点击浏览器刷新旁的返回)就能回到这个地方</span>
<span class="line">[直接链接](https://www.baidu.com/)</span>
<span class="line">[锚点链接](#在文档中添加代码)</span>
<span class="line">[锚点链接也可以跨文档](./use_two.md#总体结构)</span>
<span class="line">[自定义锚点链接](#test)</span>
<span class="line">这里我在上面的文字内容中加入一个a标签，设置id为test，就能跳转到那里</span>
<span class="line">“里面放各自的md文件，即为文档。</span>
<span class="line">&lt;a id="test">&lt;/a></span>
<span class="line">如果后续需要添加章节”</span>
<span class="line">因为有时候可能没有合适的标签让我们锚点跳转，这个时候自定义锚点就能让我们自由跳转</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><details class="hint-container details"><summary>点击查看演示结果</summary>
<p><a href="https://www.baidu.com/" target="_blank" rel="noopener noreferrer">直接链接</a></p>
<p><a href="#%E5%9C%A8%E6%96%87%E6%A1%A3%E4%B8%AD%E6%B7%BB%E5%8A%A0%E4%BB%A3%E7%A0%81">锚点链接</a></p>
<p><RouteLink to="/guide/useVuepress/use_two.html#%E5%85%B6%E4%BB%96%E6%96%87%E6%9C%AC%E5%8C%BA%E5%9F%9F%E4%B8%8E%E9%93%BE%E6%8E%A5%E5%86%99%E6%B3%95">锚点链接也可以跨文档</RouteLink></p>
<p><a href="#test">自定义锚点链接</a></p>
</details>
<h3 id="斜体字体" tabindex="-1"><a class="header-anchor" href="#斜体字体"><span>斜体字体</span></a></h3>
<p>我觉得不是很好看，所以不怎么使用，不过写专有名词时还是比较常用的</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">这个是*斜体字*</span>
<span class="line">注意：直接写a*b*c会看不到乘号，解决方法在下面的行内代码</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><details class="hint-container details"><summary>点击查看演示结果</summary>
<p>这个是 <em>斜体字</em></p>
<p>注意：直接写a<em>b</em>c会看不到乘号，解决方法在下面的行内代码</p>
</details>
<h3 id="行内代码" tabindex="-1"><a class="header-anchor" href="#行内代码"><span>行内代码</span></a></h3>
<p>同样可以用来写专有名词，而且表达式也最好采用这种方式来写</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">比如上面提到的`a*b*c`，或者标明`专有名词`的时候都可以使用</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><details class="hint-container details"><summary>点击查看演示结果</summary>
<p>比如上面提到的<code v-pre>a*b*c</code>，或者标明<code v-pre>专有名词</code>的时候都可以使用</p>
</details>
<h3 id="折叠面板" tabindex="-1"><a class="header-anchor" href="#折叠面板"><span>折叠面板</span></a></h3>
<p>像我们这个页面的演示结果，都是采用折叠面板展示的</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">::: details 点击查看演示结果</span>
<span class="line">需要演示的内容</span>
<span class="line">:::</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><details class="hint-container details"><summary>点击查看演示结果</summary>
<p>需要演示的内容</p>
</details>
<p>实际上还有很多用法，因为这个文档比较简单，不需要多复杂，所以我只写了很少一部分我比较常用的内容，后续如果有再使用到别的设计，会再更新。</p>
</div></template>


