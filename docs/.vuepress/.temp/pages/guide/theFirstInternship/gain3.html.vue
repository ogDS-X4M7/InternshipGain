<template><div><h1 id="快速上手项目二——页面信息展示" tabindex="-1"><a class="header-anchor" href="#快速上手项目二——页面信息展示"><span>快速上手项目二——页面信息展示</span></a></h1>
<h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2>
<h2 id="另外的需求与完成" tabindex="-1"><a class="header-anchor" href="#另外的需求与完成"><span>另外的需求与完成</span></a></h2>
<p>这个项目还有一个简单的问题，404页面做了自动跳转的倒计时，但却没有做自动跳转，这是vue的编程式路由能够实现的内容，直接在倒计时结束时加上一行代码即可：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">router.push({path:'/'})</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>总结来说就是：实现商品详情页颜色样式选择部分展示图片与文字信息</p>
</div></template>


