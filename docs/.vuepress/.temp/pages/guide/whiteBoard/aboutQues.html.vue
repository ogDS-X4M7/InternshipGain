<template><div><h1 id="一些有意思的小问题" tabindex="-1"><a class="header-anchor" href="#一些有意思的小问题"><span>一些有意思的小问题</span></a></h1>
<p>项目的讲解已经结束，这里是后续做优化，已经回顾之前开发过程遇到的一些问题。</p>
<h2 id="canvas大小与移动端适配" tabindex="-1"><a class="header-anchor" href="#canvas大小与移动端适配"><span>canvas大小与移动端适配</span></a></h2>
<p>会议白板项目是绘制、通信的项目，那么对于坐标其实是很敏感的。canvas的特性要求我们为它输入的width和height其实也是它的分辨率，绘制时需要坐标，如果对canvas做简单的缩放，那么坐标就会失效。举个简单的例子，如果缩小到80%，那么你在canvas画布坐标(100,100)上绘制时，实际绘制的位置就是(80,80)，这会导致看起来绘制的线段出现在鼠标位置的左上部，没有“画笔”的实际效果。</p>
<p>解决的思路也很简单，可以给定宽度和高度，给定比例进行控制，比如宽高2:1，白板给分辨率1600,800，宽高设置100%，100%，代码中获取媒体屏幕宽高，计算与实际分辨率1600,800的比例，然后在缩放时，根据缩放比例，将canvas的width和height除以缩放比例，就可以实现移动端适配。(可以利用具象的例子去思考问题，比如刚刚到100-&gt;80，如何计算坐标让绘制内容能显示在正确的鼠标位置下，其实就可以反乘回来，100-&gt;80是因为缩小到80%，你在(100,100)绘制，白板原本也想在(100,100)为你绘制内容，但是因为缩放到80%，你看起来是屏幕的(80,80)，那么就是需要你去考虑缩放了80%后，外层的(100,100)到底是原本白板的哪个位置，答案是100*5/4，也就是(125,125)，需要按比例提交给白板才能够得到正确的画面内容)</p>
<p>当然我到开发完毕才想到这个问题，之前没有考虑到移动端的适配。而坐标已经涉及太多功能，因此后续不再考虑做这个缩放比例的计算，直接采用了一个简单的方案，我对外层设置了百分比的max-width和max-height，设置了对应比例，然后对白板提供固定的分辨率，也不做缩放，只在容器上添加overflow: auto;通过滚动条让小屏幕用户能看到内容，从而实现相对粗糙的移动端适配。</p>
<h2 id="撤销美化的重构" tabindex="-1"><a class="header-anchor" href="#撤销美化的重构"><span>撤销美化的重构</span></a></h2>
<h2 id="socket-io的迁移使用" tabindex="-1"><a class="header-anchor" href="#socket-io的迁移使用"><span>socket.io的迁移使用</span></a></h2>
<p>项目开发完成后，需要考虑优化方面的功能。其中一项就是websocket弱网状态下的断线重连等问题，综合考虑下直接迁移为<code v-pre>socket.io</code>。下面可以来看看迁移的改动对比，也能从中学习socket.io的使用。</p>
<h2 id="一、前端改动对比" tabindex="-1"><a class="header-anchor" href="#一、前端改动对比"><span>一、前端改动对比</span></a></h2>
<h3 id="_1-导入依赖" tabindex="-1"><a class="header-anchor" href="#_1-导入依赖"><span>1. 导入依赖</span></a></h3>
<p><strong>原生WebSocket</strong>（无需额外导入）</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 直接使用浏览器原生API</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">import</span> <span class="token punctuation">{</span> io <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'socket.io-client'</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><hr>
<h3 id="_2-建立连接" tabindex="-1"><a class="header-anchor" href="#_2-建立连接"><span>2. 建立连接</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 使用传入的roomCode建立WebSocket连接</span></span>
<span class="line">console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">与会议室</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>roomCode<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">建立WebSocket连接</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WebSocket</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">ws://192.168.2.9:8080?roomCode=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>roomCode<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function-variable function">onopen</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">与会议室</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>roomCode<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">的WebSocket连接成功，readyState: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span>readyState<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">sendWebSocketMessage</span><span class="token punctuation">(</span><span class="token string">'updateNickname'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">nickname</span><span class="token operator">:</span> <span class="token keyword">this</span><span class="token punctuation">.</span>nickname <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">与会议室</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>roomCode<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">建立Socket.IO连接</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket <span class="token operator">=</span> <span class="token function">io</span><span class="token punctuation">(</span><span class="token string">'http://192.168.2.9:8080'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token literal-property property">query</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">roomCode</span><span class="token operator">:</span> <span class="token keyword">this</span><span class="token punctuation">.</span>roomCode <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">transports</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'websocket'</span><span class="token punctuation">,</span> <span class="token string">'polling'</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">reconnection</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>           <span class="token comment">// 启用自动重连</span></span>
<span class="line">  <span class="token literal-property property">reconnectionDelay</span><span class="token operator">:</span> <span class="token number">1000</span><span class="token punctuation">,</span>      <span class="token comment">// 重连延迟1秒</span></span>
<span class="line">  <span class="token literal-property property">reconnectionDelayMax</span><span class="token operator">:</span> <span class="token number">5000</span><span class="token punctuation">,</span>   <span class="token comment">// 最大重连延迟5秒</span></span>
<span class="line">  <span class="token literal-property property">reconnectionAttempts</span><span class="token operator">:</span> <span class="token number">Infinity</span> <span class="token comment">// 无限次重连</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'connect'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">与会议室</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>roomCode<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">的Socket.IO连接成功</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">sendWebSocketMessage</span><span class="token punctuation">(</span><span class="token string">'updateNickname'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">nickname</span><span class="token operator">:</span> <span class="token keyword">this</span><span class="token punctuation">.</span>nickname <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>协议从 <code v-pre>ws://</code> 改为 <code v-pre>http://</code>（Socket.IO内部处理协议切换）</li>
<li>参数通过 <code v-pre>query</code> 对象传递，而不是URL参数</li>
<li>新增重连配置选项</li>
<li>事件名从 <code v-pre>onopen</code> 改为 <code v-pre>connect</code></li>
</ul>
<hr>
<h3 id="_3-消息监听" tabindex="-1"><a class="header-anchor" href="#_3-消息监听"><span>3. 消息监听</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function-variable function">onmessage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">event</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>event<span class="token punctuation">.</span>data <span class="token keyword">instanceof</span> <span class="token class-name">ArrayBuffer</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 处理二进制数据</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">playAudioData</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Int16Array</span><span class="token punctuation">(</span>event<span class="token punctuation">.</span>data<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    </span>
<span class="line">    <span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">parse</span><span class="token punctuation">(</span>event<span class="token punctuation">.</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>data<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">'canvasState'</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 处理画布状态</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>elements <span class="token operator">=</span> data<span class="token punctuation">.</span>data<span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">redrawCanvas</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>data<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">'draw'</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 处理绘制</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>elements<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>data<span class="token punctuation">.</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">redrawCanvas</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>data<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">'error'</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">WebSocket错误: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>data<span class="token punctuation">.</span>message<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">处理WebSocket消息时出错: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>error<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'canvasState'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">收到canvasState消息，元素数量: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>data<span class="token punctuation">.</span>length<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span>elements <span class="token operator">=</span> data<span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">redrawCanvas</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'draw'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">收到draw消息</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span>elements<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">redrawCanvas</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'audio'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">收到音频数据，长度: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>data<span class="token punctuation">.</span>byteLength<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">playAudioData</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Int16Array</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>不再需要手动解析JSON，Socket.IO自动处理</li>
<li>不再需要判断是否是二进制数据，分开监听不同事件</li>
<li>直接使用 <code v-pre>socket.on('事件名', callback)</code> 监听，更清晰直观</li>
<li>每个事件独立处理，代码结构更清晰</li>
</ul>
<hr>
<h3 id="_4-消息发送" tabindex="-1"><a class="header-anchor" href="#_4-消息发送"><span>4. 消息发送</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token function">sendWebSocketMessage</span><span class="token punctuation">(</span><span class="token parameter">type<span class="token punctuation">,</span> data</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>socket <span class="token operator">&amp;&amp;</span> <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span>readyState <span class="token operator">===</span> WebSocket<span class="token punctuation">.</span><span class="token constant">OPEN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Sending WebSocket message: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>type<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">, data length: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">.</span>length<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span><span class="token punctuation">{</span> type<span class="token punctuation">,</span> data <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'WebSocket not open, readyState:'</span><span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">.</span>socket <span class="token operator">?</span> <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span>readyState <span class="token operator">:</span> <span class="token string">'null'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 发送音频数据</span></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span>mergedData<span class="token punctuation">.</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token function">sendWebSocketMessage</span><span class="token punctuation">(</span><span class="token parameter">type<span class="token punctuation">,</span> data</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>socket <span class="token operator">&amp;&amp;</span> <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span>connected<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Sending Socket.IO message: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>type<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span>type<span class="token punctuation">,</span> data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Socket.IO not connected'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 发送音频数据</span></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'audio'</span><span class="token punctuation">,</span> mergedData<span class="token punctuation">.</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>使用 <code v-pre>emit()</code> 替代 <code v-pre>send()</code></li>
<li>不再需要手动JSON序列化，Socket.IO自动处理</li>
<li>连接状态检查从 <code v-pre>readyState === WebSocket.OPEN</code> 改为 <code v-pre>socket.connected</code></li>
<li>二进制数据通过专用事件发送，更清晰</li>
</ul>
<hr>
<h3 id="_5-连接状态监听" tabindex="-1"><a class="header-anchor" href="#_5-连接状态监听"><span>5. 连接状态监听</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function-variable function">onclose</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">WebSocket 已断开连接，会议室: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token keyword">this</span><span class="token punctuation">.</span>roomCode<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function-variable function">onerror</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">error</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">WebSocket 错误: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>error<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'disconnect'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">reason</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Socket.IO 已断开连接，原因: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>reason<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span>reason <span class="token operator">===</span> <span class="token string">'io server disconnect'</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'服务器主动断开连接，需要手动重连'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'connect_error'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">error</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Socket.IO 连接错误: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>error<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'reconnect'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">attemptNumber</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Socket.IO 重连成功，尝试次数: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>attemptNumber<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'reconnect_error'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">error</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Socket.IO 重连失败: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>error<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'reconnect_failed'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Socket.IO 重连失败'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li><code v-pre>onclose</code> 改为 <code v-pre>disconnect</code></li>
<li>新增重连相关事件监听</li>
<li>提供更详细的连接错误信息</li>
</ul>
<hr>
<h3 id="_6-关闭连接" tabindex="-1"><a class="header-anchor" href="#_6-关闭连接"><span>6. 关闭连接</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token function">closeWebSocket</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token number">1000</span><span class="token punctuation">,</span> <span class="token string">'User left meeting'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'WebSocket connection closed'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Error closing WebSocket connection:'</span><span class="token punctuation">,</span> error<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token function">closeWebSocket</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>socket<span class="token punctuation">.</span><span class="token function">disconnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'Socket.IO connection closed'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Error closing Socket.IO connection:'</span><span class="token punctuation">,</span> error<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>
<h2 id="二、后端改动对比" tabindex="-1"><a class="header-anchor" href="#二、后端改动对比"><span>二、后端改动对比</span></a></h2>
<h3 id="_1-导入依赖-1" tabindex="-1"><a class="header-anchor" href="#_1-导入依赖-1"><span>1. 导入依赖</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">const</span> WebSocket <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">'ws'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">const</span> <span class="token punctuation">{</span> Server <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">'socket.io'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><hr>
<h3 id="_2-初始化服务器" tabindex="-1"><a class="header-anchor" href="#_2-初始化服务器"><span>2. 初始化服务器</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">const</span> server <span class="token operator">=</span> http<span class="token punctuation">.</span><span class="token function">createServer</span><span class="token punctuation">(</span>app<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">const</span> wss <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WebSocket<span class="token punctuation">.</span>Server</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">noServer</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">server<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'upgrade'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">req<span class="token punctuation">,</span> socket<span class="token punctuation">,</span> head</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">const</span> url <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">URL</span><span class="token punctuation">(</span>req<span class="token punctuation">.</span>url<span class="token punctuation">,</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">http://</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>req<span class="token punctuation">.</span>headers<span class="token punctuation">.</span>host<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">const</span> roomCode <span class="token operator">=</span> url<span class="token punctuation">.</span>searchParams<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">'roomCode'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>roomCode<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    socket<span class="token punctuation">.</span><span class="token function">destroy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line">  wss<span class="token punctuation">.</span><span class="token function">handleUpgrade</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> socket<span class="token punctuation">,</span> head<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">ws</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">    wss<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'connection'</span><span class="token punctuation">,</span> ws<span class="token punctuation">,</span> req<span class="token punctuation">,</span> roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">const</span> server <span class="token operator">=</span> http<span class="token punctuation">.</span><span class="token function">createServer</span><span class="token punctuation">(</span>app<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">const</span> io <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Server</span><span class="token punctuation">(</span>server<span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token literal-property property">cors</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">origin</span><span class="token operator">:</span> <span class="token string">"*"</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">methods</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">"GET"</span><span class="token punctuation">,</span> <span class="token string">"POST"</span><span class="token punctuation">]</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">transports</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'websocket'</span><span class="token punctuation">,</span> <span class="token string">'polling'</span><span class="token punctuation">]</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>不再需要手动处理 <code v-pre>upgrade</code> 事件</li>
<li>内置CORS支持，配置更简单</li>
<li>直接通过 <code v-pre>query</code> 获取参数</li>
</ul>
<hr>
<h3 id="_3-连接处理" tabindex="-1"><a class="header-anchor" href="#_3-连接处理"><span>3. 连接处理</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">wss<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'connection'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">ws<span class="token punctuation">,</span> req<span class="token punctuation">,</span> roomCode</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  ws<span class="token punctuation">.</span>id <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">socket_</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>Date<span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span></span>
<span class="line">  ws<span class="token punctuation">.</span>roomCode <span class="token operator">=</span> roomCode<span class="token punctuation">;</span></span>
<span class="line">  meetingRoomManager<span class="token punctuation">.</span><span class="token function">joinRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> ws<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  clients<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>ws<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  ws<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">'canvasState'</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">data</span><span class="token operator">:</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">getCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  ws<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">'socketId'</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">data</span><span class="token operator">:</span> ws<span class="token punctuation">.</span>id</span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// ... 消息处理</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">io<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'connection'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">socket</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">const</span> roomCode <span class="token operator">=</span> socket<span class="token punctuation">.</span>handshake<span class="token punctuation">.</span>query<span class="token punctuation">.</span>roomCode<span class="token punctuation">;</span></span>
<span class="line">  </span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>roomCode<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    socket<span class="token punctuation">.</span><span class="token function">disconnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  socket<span class="token punctuation">.</span>roomCode <span class="token operator">=</span> roomCode<span class="token punctuation">;</span></span>
<span class="line">  meetingRoomManager<span class="token punctuation">.</span><span class="token function">joinRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> socket<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  </span>
<span class="line">  socket<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 加入Socket.IO房间</span></span>
<span class="line"></span>
<span class="line">  socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'canvasState'</span><span class="token punctuation">,</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">getCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'socketId'</span><span class="token punctuation">,</span> socket<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// ... 消息处理</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>参数通过 <code v-pre>socket.handshake.query</code> 获取</li>
<li>Socket.ID自动生成，无需手动创建</li>
<li>使用 <code v-pre>socket.join(roomCode)</code> 加入房间（Socket.IO内置房间功能）</li>
<li>发送消息使用 <code v-pre>socket.emit()</code>，无需手动JSON序列化</li>
</ul>
<hr>
<h3 id="_4-消息监听" tabindex="-1"><a class="header-anchor" href="#_4-消息监听"><span>4. 消息监听</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">ws<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'message'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data<span class="token punctuation">,</span> isBinary</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>isBinary<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">if</span> <span class="token punctuation">(</span>speechService<span class="token operator">?.</span>isConnected<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        speechService<span class="token punctuation">.</span><span class="token function">sendAudio</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">      meetingRoomManager<span class="token punctuation">.</span><span class="token function">broadcastToRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> data<span class="token punctuation">,</span> ws<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    </span>
<span class="line">    <span class="token keyword">const</span> parsed <span class="token operator">=</span> <span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">parse</span><span class="token punctuation">(</span>data<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>parsed<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">'draw'</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">const</span> s <span class="token operator">=</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">getCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      s<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>parsed<span class="token punctuation">.</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      meetingRoomManager<span class="token punctuation">.</span><span class="token function">updateCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      meetingRoomManager<span class="token punctuation">.</span><span class="token function">broadcastToRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> <span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">'draw'</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">data</span><span class="token operator">:</span> parsed<span class="token punctuation">.</span>data</span>
<span class="line">      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ws<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>parsed<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">'text'</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// ...</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'draw'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">const</span> s <span class="token operator">=</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">getCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  s<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  meetingRoomManager<span class="token punctuation">.</span><span class="token function">updateCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  socket<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'draw'</span><span class="token punctuation">,</span> data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'text'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">const</span> s <span class="token operator">=</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">getCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  s<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  meetingRoomManager<span class="token punctuation">.</span><span class="token function">updateCanvasState</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  socket<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'text'</span><span class="token punctuation">,</span> data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'audio'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span>speechService<span class="token operator">?.</span>isConnected<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    speechService<span class="token punctuation">.</span><span class="token function">sendAudio</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line">  socket<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'audio'</span><span class="token punctuation">,</span> data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>不再需要判断是否是二进制数据</li>
<li>不再需要手动JSON解析</li>
<li>每个事件独立监听，代码更清晰</li>
<li>Socket.IO自动处理数据类型</li>
</ul>
<hr>
<h3 id="_5-房间广播" tabindex="-1"><a class="header-anchor" href="#_5-房间广播"><span>5. 房间广播</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 需要自己实现broadcastToRoom方法</span></span>
<span class="line"><span class="token function">broadcastToRoom</span><span class="token punctuation">(</span><span class="token parameter">roomCode<span class="token punctuation">,</span> data<span class="token punctuation">,</span> excludeId</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">const</span> room <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>room<span class="token punctuation">)</span> <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">  room<span class="token punctuation">.</span>members<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">m</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>m<span class="token punctuation">.</span>socketId <span class="token operator">!==</span> excludeId<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">const</span> ws <span class="token operator">=</span> clients<span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span><span class="token parameter">c</span> <span class="token operator">=></span> c<span class="token punctuation">.</span>id <span class="token operator">===</span> m<span class="token punctuation">.</span>socketId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">if</span> <span class="token punctuation">(</span>ws <span class="token operator">&amp;&amp;</span> ws<span class="token punctuation">.</span>readyState <span class="token operator">===</span> WebSocket<span class="token punctuation">.</span><span class="token constant">OPEN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        ws<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 使用</span></span>
<span class="line">meetingRoomManager<span class="token punctuation">.</span><span class="token function">broadcastToRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> <span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">  <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">'draw'</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">data</span><span class="token operator">:</span> parsed<span class="token punctuation">.</span>data</span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ws<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// Socket.IO内置房间功能，直接使用</span></span>
<span class="line">socket<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'draw'</span><span class="token punctuation">,</span> data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 广播给所有人（包括发送者）</span></span>
<span class="line">io<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">'transcriptionResult'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">data</span><span class="token operator">:</span> t<span class="token punctuation">,</span> <span class="token literal-property property">speaker</span><span class="token operator">:</span> nick <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>不需要自己维护clients数组</li>
<li>不需要自己实现广播逻辑</li>
<li><code v-pre>socket.to()</code> 广播给房间内其他人</li>
<li><code v-pre>io.to()</code> 广播给房间内所有人</li>
</ul>
<hr>
<h3 id="_6-断开连接" tabindex="-1"><a class="header-anchor" href="#_6-断开连接"><span>6. 断开连接</span></a></h3>
<p><strong>原生WebSocket</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">ws<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'close'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  speechService<span class="token operator">?.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  meetingRoomManager<span class="token punctuation">.</span><span class="token function">leaveRoom</span><span class="token punctuation">(</span>ws<span class="token punctuation">.</span>roomCode<span class="token punctuation">,</span> ws<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  clients <span class="token operator">=</span> clients<span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token parameter">c</span> <span class="token operator">=></span> c <span class="token operator">!==</span> ws<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">ws<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'error'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Socket.IO</strong></p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'disconnect'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  speechService<span class="token operator">?.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  meetingRoomManager<span class="token punctuation">.</span><span class="token function">leaveRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> socket<span class="token punctuation">.</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">'error'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">err</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Socket error:'</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>主要区别：</strong></p>
<ul>
<li>不再需要手动从clients数组移除</li>
<li>Socket.IO自动管理连接状态</li>
</ul>
<hr>
<h2 id="三、socket-io优势总结" tabindex="-1"><a class="header-anchor" href="#三、socket-io优势总结"><span>三、Socket.IO优势总结</span></a></h2>
<table>
<thead>
<tr>
<th>功能</th>
<th>原生WebSocket</th>
<th>Socket.IO</th>
</tr>
</thead>
<tbody>
<tr>
<td>自动重连</td>
<td>需要手动实现</td>
<td>✅ 内置支持</td>
</tr>
<tr>
<td>心跳检测</td>
<td>需要手动实现</td>
<td>✅ 内置支持</td>
</tr>
<tr>
<td>房间管理</td>
<td>需要手动实现</td>
<td>✅ 内置支持</td>
</tr>
<tr>
<td>广播功能</td>
<td>需要手动实现</td>
<td>✅ 内置支持</td>
</tr>
<tr>
<td>二进制数据</td>
<td>需要手动处理</td>
<td>✅ 自动处理</td>
</tr>
<tr>
<td>JSON序列化</td>
<td>需要手动处理</td>
<td>✅ 自动处理</td>
</tr>
<tr>
<td>跨浏览器兼容</td>
<td>有限支持</td>
<td>✅ 完善支持</td>
</tr>
<tr>
<td>降级策略（长轮询）</td>
<td>无</td>
<td>✅ 支持</td>
</tr>
<tr>
<td>CORS配置</td>
<td>需要手动处理</td>
<td>✅ 内置支持</td>
</tr>
</tbody>
</table>
<hr>
<h2 id="四、核心api对比速查" tabindex="-1"><a class="header-anchor" href="#四、核心api对比速查"><span>四、核心API对比速查</span></a></h2>
<h3 id="前端api" tabindex="-1"><a class="header-anchor" href="#前端api"><span>前端API</span></a></h3>
<table>
<thead>
<tr>
<th>操作</th>
<th>原生WebSocket</th>
<th>Socket.IO</th>
</tr>
</thead>
<tbody>
<tr>
<td>创建连接</td>
<td><code v-pre>new WebSocket(url)</code></td>
<td><code v-pre>io(url, options)</code></td>
</tr>
<tr>
<td>连接成功</td>
<td><code v-pre>socket.onopen</code></td>
<td><code v-pre>socket.on('connect')</code></td>
</tr>
<tr>
<td>断开连接</td>
<td><code v-pre>socket.onclose</code></td>
<td><code v-pre>socket.on('disconnect')</code></td>
</tr>
<tr>
<td>发送消息</td>
<td><code v-pre>socket.send(data)</code></td>
<td><code v-pre>socket.emit(event, data)</code></td>
</tr>
<tr>
<td>监听消息</td>
<td><code v-pre>socket.onmessage</code></td>
<td><code v-pre>socket.on(event, callback)</code></td>
</tr>
<tr>
<td>检查连接</td>
<td><code v-pre>socket.readyState === WebSocket.OPEN</code></td>
<td><code v-pre>socket.connected</code></td>
</tr>
<tr>
<td>关闭连接</td>
<td><code v-pre>socket.close()</code></td>
<td><code v-pre>socket.disconnect()</code></td>
</tr>
</tbody>
</table>
<h3 id="后端api" tabindex="-1"><a class="header-anchor" href="#后端api"><span>后端API</span></a></h3>
<table>
<thead>
<tr>
<th>操作</th>
<th>原生WebSocket (ws)</th>
<th>Socket.IO</th>
</tr>
</thead>
<tbody>
<tr>
<td>创建服务器</td>
<td><code v-pre>new WebSocket.Server()</code></td>
<td><code v-pre>new Server(httpServer)</code></td>
</tr>
<tr>
<td>连接处理</td>
<td><code v-pre>wss.on('connection', (ws) =&gt; {})</code></td>
<td><code v-pre>io.on('connection', (socket) =&gt; {})</code></td>
</tr>
<tr>
<td>获取参数</td>
<td>手动解析URL</td>
<td><code v-pre>socket.handshake.query</code></td>
</tr>
<tr>
<td>发送消息</td>
<td><code v-pre>ws.send(data)</code></td>
<td><code v-pre>socket.emit(event, data)</code></td>
</tr>
<tr>
<td>监听消息</td>
<td><code v-pre>ws.on('message', (data) =&gt; {})</code></td>
<td><code v-pre>socket.on(event, (data) =&gt; {})</code></td>
</tr>
<tr>
<td>加入房间</td>
<td>需要手动实现</td>
<td><code v-pre>socket.join(room)</code></td>
</tr>
<tr>
<td>广播消息</td>
<td>需要手动实现</td>
<td><code v-pre>socket.to(room).emit(event, data)</code></td>
</tr>
<tr>
<td>全房间广播</td>
<td>需要手动实现</td>
<td><code v-pre>io.to(room).emit(event, data)</code></td>
</tr>
<tr>
<td>断开连接</td>
<td><code v-pre>ws.on('close', () =&gt; {})</code></td>
<td><code v-pre>socket.on('disconnect', () =&gt; {})</code></td>
</tr>
</tbody>
</table>
</div></template>


