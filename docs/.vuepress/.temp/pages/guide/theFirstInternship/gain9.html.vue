<template><div><h1 id="项目五——优惠券全套业务与样式污染" tabindex="-1"><a class="header-anchor" href="#项目五——优惠券全套业务与样式污染"><span>项目五——优惠券全套业务与样式污染</span></a></h1>
<p>项目五是一个<code v-pre>react</code>项目；我并没有系统学习过<code v-pre>react</code>，但恰巧开始学习<code v-pre>Taro+React</code>写小程序，因此也是有了更好的学习机会。</p>
<p>因为最近要学的，要做的都非常多，所以我并不能很详细地进行记录，不过我遇到了一个典型问题，让我非常希望记录下来：也就是标题上的<strong>样式污染</strong></p>
<p>之所以那么想记录，一是我的记性不好，如果不及时写下来我可能会忘记；二是我很久之前就有看到过相关的问题，但从来没遇到过，甚至不明白为什么有这种情况，今天终于遇到了，并且顺利解决了这个问题：</p>
<p><strong>样式污染</strong>是指在一个组件或页面中，由于 CSS 样式的全局性，导致某些样式影响到其他组件或页面的现象。在项目的进行过程中，很多<code v-pre>page</code>中都有表格，每个<code v-pre>page</code>目录下都有自己的<code v-pre>.less</code>文件，<em>注意到由于表格格式高度类似，因此这些<code v-pre>.less</code>文件都是相同的（为后续埋下隐患）；</em> 由于新的表格与之前的很多表格样式接近但并不相同，因此我继续复制了其他组件一直使用的<code v-pre>.less</code>文件，并根据页面的需求进行调整，在这期间我遇到了奇怪的现象：</p>
<p>1.将样式中<code v-pre>margin-top</code>设为<code v-pre>0</code>后，对应部分<code v-pre>margin-top</code>没有改变；于是我使用了<code v-pre>!important</code>，修改成功，没有再深究；</p>
<p>2.到了另一个<code v-pre>page</code>，它的<code v-pre>margin-top</code>为<code v-pre>70px</code>，再次尝试使用<code v-pre>!important</code>，修改失败。使用<code v-pre>F12</code>开发者工具，选中对应元素可以看到它并没有外边距，查看样式，发现有很多完全同名的类选择器，其中就有第<code v-pre>1</code>点中提到的<code v-pre>page</code>的<code v-pre>.less</code>文件，这令我很诧异，因为每个<code v-pre>.less</code>文件都是在各自的<code v-pre>page</code>下的<code v-pre>index.jsx</code>文件引入，各自使用各自的<code v-pre>.less</code>样式，怎么会影响到其他<code v-pre>page</code>里去呢？而且有这么多的同名的类选择器，意味着样式文件没有隔离，而是混在一起。</p>
<p>这和我之前了解过的样式污染一样，但我还是第一次见，原理上是因为<code v-pre>CSS</code>没有本地作用域，所有声明的样式都是全局的（<code v-pre>global styles</code>）。换句话来说页面上任意元素只要匹配上某个选择器的规则，这个规则就会被应用上，而且规则和规则之间可以叠加作用（<code v-pre>cascading</code>）。<code v-pre>SPA</code>应用流行了之后这个问题变得更加突出了，因为对于<code v-pre>SPA</code>应用来说所有页面的样式代码都会加载到同一个环境中，样式冲突的概率会大大加大。这个项目正是<code v-pre>SPA</code>应用。</p>
<p>至于之前我自己从来没遇到过这种情况，原因主要是我几乎不重复使用<code v-pre>className</code>名，而且常用框架是<code v-pre>Vue</code>，<code v-pre>Vue</code>中关于样式使用了<code v-pre>scoped</code>属性，并且也正是由于学习了<code v-pre>scoped</code>属性，我在样式命名时更小心地避免使用重复的<code v-pre>className</code>名，因为哪怕是<code v-pre>scoped</code>属性也要求最外层的<code v-pre>className</code>不可重复。</p>
<p>分析了项目，前面也讲过，新的表格与之前的很多表格样式接近但并不相同，因此其实我只需要对这个新的<code v-pre>page</code>的样式文件进行处理即可，我将所有的<code v-pre>.itemxxx</code>统一更改为<code v-pre>.couponItemxxx</code>，避免了重名，也就消除了样式污染的问题。</p>
</div></template>


