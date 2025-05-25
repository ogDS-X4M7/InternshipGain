<template><div><h1 id="快速上手项目二——页面信息展示" tabindex="-1"><a class="header-anchor" href="#快速上手项目二——页面信息展示"><span>快速上手项目二——页面信息展示</span></a></h1>
<h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2>
<p>接手到另一个项目是一个类似淘宝的商城，在商品详情页中，可以选择不同的颜色规格，不过之前的代码实现的效果是只展示对应颜色的图片，而没有显示对应颜色的文字。现在需要把对应颜色的文字也显示出来。</p>
<p>我观察了项目相关页面的代码，注意到代码设置了<code v-pre>v-if</code>、<code v-pre>v-else</code>来决定渲染与否，对这部分稍微改动一下就可以显示对应的文字了，不过后续更耗费时间的其实是对样式的调节。旧代码嵌套使用了多个标签(包括a标签)来包裹这部分内容，这导致我直接设置样式却没有效果，后面我通过浏览器的<code v-pre>选择元素工具</code>观察页面内容，发现是嵌套标签中有a标签，这让盒子高度只与文字内容高度有关，因此我对对应的a标签做了样式设计，就可以调节高度了。</p>
<p>随后遇到第二个问题，文字盒子总是处于靠下的位置，继续用浏览器的<code v-pre>选择元素工具</code>观察页面，发现盒子莫名其妙下移了几个像素，并且不是由于边框、外间距、内间距，而是莫名其妙的自动下移了，这导致文字没有正常居中。后续我找到了原因，顺利解决了，不过暂时没想起来是什么问题，等过两天回公司看完想起来了再写。</p>
<h2 id="另外的需求与完成" tabindex="-1"><a class="header-anchor" href="#另外的需求与完成"><span>另外的需求与完成</span></a></h2>
<p>这个项目还有一个简单的问题，404页面做了自动跳转的倒计时，但却没有做自动跳转，这是vue的编程式路由能够实现的内容，直接在倒计时结束时加上一行代码即可：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">router.push({path:'/'})</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>总结来说就是：实现商品详情页颜色样式选择部分展示图片与文字信息</p>
</div></template>


