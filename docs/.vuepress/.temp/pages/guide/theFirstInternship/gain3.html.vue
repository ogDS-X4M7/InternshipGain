<template><div><h1 id="快速上手项目二——页面信息展示" tabindex="-1"><a class="header-anchor" href="#快速上手项目二——页面信息展示"><span>快速上手项目二——页面信息展示</span></a></h1>
<h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2>
<p>接手到另一个项目是一个类似淘宝的商城，在商品详情页中，可以选择不同的颜色规格，不过之前的代码实现的效果是只展示对应颜色的图片，而没有显示对应颜色的文字。现在需要把对应颜色的文字也显示出来。</p>
<p>不过在需求之外，当时打开项目就遇到报错，是路由的名称配置问题，比如这里，路由与其子路由使用了相同的名称&quot;user&quot;导致报错：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">{</span>
<span class="line">        path: "/user",</span>
<span class="line">        name: "user",</span>
<span class="line">        meta: {title: ''},</span>
<span class="line">        component: () => import("../views/layouts/user.vue"),</span>
<span class="line">        children: [</span>
<span class="line">            {</span>
<span class="line">                path: '/user', name: "user",</span>
<span class="line">                meta: {requireAuth: true},</span>
<span class="line">                ...</span>
<span class="line">            }</span>
<span class="line">        ]</span>
<span class="line">        ...</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在框架内，会通过名称、路径作为路由唯一标识用于内部管理和跳转，如果使用相同名称，可能会有<code v-pre>跳转异常</code>、<code v-pre>状态混淆</code>的问题，如调用<code v-pre>router.push({ name: 'user' })</code>，框架无法判断该跳转到哪个路由，<code v-pre>状态混淆</code>则是说路由的元信息（如权限、缓存状态）可能被错误覆盖，导致页面逻辑异常。</p>
<p>这是<em>Vue Router</em>的官方说明：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">“每个路由的name属性应唯一，用于精确匹配和跳转。”</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>修改方法也很简单，把子路由改个名称既可：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">{</span>
<span class="line">        path: "/user",</span>
<span class="line">        name: "user",</span>
<span class="line">        meta: {title: ''},</span>
<span class="line">        component: () => import("../views/layouts/user.vue"),</span>
<span class="line">        children: [</span>
<span class="line">            {</span>
<span class="line">                path: '/user', name: "user.index",</span>
<span class="line">                meta: {requireAuth: true},</span>
<span class="line">                ...</span>
<span class="line">            }</span>
<span class="line">        ]</span>
<span class="line">        ...</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然应该检查一下代码中是否有其他使用旧路由名称跳转旧路由组件的部分，有则一并修改，不过就它当前运行即报错的状态来看，这种情况应该不太可能存在，快速检查一遍既可。</p>
<p>接着开始完成需求，我观察了项目相关页面的代码，注意到代码设置了<code v-pre>v-if</code>、<code v-pre>v-else</code>来决定渲染与否，对这部分稍微改动一下就可以显示对应的文字了，不过后续更耗费时间的其实是对样式的调节。旧代码嵌套使用了多个标签(包括<code v-pre>a</code>标签)来包裹这部分内容，这导致我直接设置样式却没有效果，后面我通过浏览器的<code v-pre>选择元素工具</code>观察页面内容，发现是嵌套标签中有<code v-pre>a</code>标签，这让盒子高度只与文字内容高度有关，因此我对对应的<code v-pre>a</code>标签做了样式设计，就可以调节高度了。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;a href="javascript:void(0);" class="item goodsStyle" :title="item.Name" @click="selectItem(items.ckid, items.unit_id,item.Id,ProductInfo.spec_item_map[item.Id])"></span>
<span class="line">	&lt;img v-if="ProductInfo.product_spec_image_row[item.Id] &amp;&amp; ProductInfo.product_spec_image_row.length>0" class="square" style="width: 35px; height: 35px" :alt="item.Name" :title="item.Name" :src="ProductInfo.product_spec_image_row[item.Id]" /></span>
<span class="line">	&lt;span v-else> {{ item.Name }}&lt;/span></span>
<span class="line">&lt;/a></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>随后遇到第二个问题，文字盒子总是处于靠下的位置，继续用浏览器的<code v-pre>选择元素工具</code>观察页面，发现盒子莫名其妙下移，并且不是由于边框、外间距、内间距，而是莫名其妙的自动下移了，这导致文字没有正常居中。考虑到前面是图片，可能是基线对准的问题，于是我给图片添加了<code v-pre>vertical-align: top;</code>，问题解决。</p>
<p>最后是第三个问题，我注意到项目中这个<code v-pre>span</code>盒子是复用的，样式调节会影响到其他部分的使用，因此再增加逻辑判断，对<code v-pre>style</code>做三目表达式判断来修改样式既可。</p>
<p>这是最终修改完毕的代码：
为<code v-pre>a</code>标签添加<code v-pre>style=&quot;display: block;height: 100%&quot;</code>；</p>
<p>为<code v-pre>img</code>添加<code v-pre>style=&quot;display: block;height: 100%&quot;</code>；</p>
<p>为<code v-pre>span</code>添加<code v-pre>style=&quot;display:inline-block;padding: 0;height: 100%;&quot; :style=&quot;(ProductInfo.product_spec_image_row[item.Id] &amp;&amp; ProductInfo.product_spec_image_row.length&gt;0)?'margin:0px s5px;font-Size:14px':''&quot;</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;a href="javascript:void(0);" class="item goodsStyle" style="display: block;height: 100%" :title="item.Name" @click="selectItem(items.ckid, items.unit_id,item.Id,ProductInfo.spec_item_map[item.Id])"></span>
<span class="line">	&lt;img v-if="ProductInfo.product_spec_image_row[item.Id] &amp;&amp; ProductInfo.product_spec_image_row.length>0" class="square" style="width: 35px; height: 35px;vertical-align: top;" :alt="item.Name" :title="item.Name" :src="ProductInfo.product_spec_image_row[item.Id]" /></span>
<span class="line">	&lt;span style="display:inline-block;padding: 0;height: 100%;" :style="(ProductInfo.product_spec_image_row[item.Id] &amp;&amp; ProductInfo.product_spec_image_row.length>0)?'margin:0px s5px;font-Size:14px':''"> {{ item.Name }}&lt;/span></span>
<span class="line">&lt;/a></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="另外的需求与完成" tabindex="-1"><a class="header-anchor" href="#另外的需求与完成"><span>另外的需求与完成</span></a></h2>
<p>这个项目还有一个简单的问题，404页面做了自动跳转的倒计时，但却没有做自动跳转，这是vue的编程式路由能够实现的内容，直接在倒计时结束时加上一行代码即可：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">router.push({path:'/'})</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>总结来说就是：实现商品详情页颜色样式选择部分展示图片与文字信息</p>
</div></template>


