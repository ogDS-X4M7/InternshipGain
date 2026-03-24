<template><div><h1 id="白板项目" tabindex="-1"><a class="header-anchor" href="#白板项目"><span>白板项目</span></a></h1>
<p>基础知识学习介绍完毕，终于到了讲解项目的阶段。</p>
<h2 id="项目设计" tabindex="-1"><a class="header-anchor" href="#项目设计"><span>项目设计</span></a></h2>
<p>首先讲一下项目设计，要设计一个会议白板，实现一个即时会议，不需要下载、注册、登录等，总体的框架上只需要一个进入会议的页面(首页)，以及会议室页面。</p>
<ul>
<li>
<p>进入会议的页面，则分为创建会议/加入会议两种情况。</p>
<ul>
<li>创建会议：用户点击创建会议按钮，即可创建会议。（创建会议会自动生成一个会议码，用户可以将会议码分享给其他用户。）</li>
<li>加入会议：用户需要输入会议码，点击加入会议按钮，即可加入会议。</li>
</ul>
</li>
<li>
<p>会议室页面，则主要围绕会议白板展开；</p>
<ul>
<li>实时协作白板，支持多人同时绘制</li>
<li>支持画笔、橡皮、文本、矩形、圆形、菱形、箭头等工具</li>
<li>图形美化功能，自动识别和美化手绘图形</li>
<li>语音转写功能，使用讯飞星火 API 实现实时语音转写</li>
<li>会议摘要生成功能，基于白板内容和语音转写结果生成会议摘要</li>
<li>文本输入功能：
<ul>
<li>支持画布上直接生成文本框</li>
<li>文本框大小调整和位置拖动</li>
<li>文本自动换行，支持垂直排列</li>
<li>Enter键或确认按钮确认绘制</li>
</ul>
</li>
<li>会议室自动清理机制，基于最后活动时间清理无人使用的会议室</li>
</ul>
</li>
</ul>
<h2 id="项目实现" tabindex="-1"><a class="header-anchor" href="#项目实现"><span>项目实现</span></a></h2>
<p>围绕项目结构与设计功能，我们划分为以下几个模块进行讲解：</p>
<ul>
<li>首页基础功能(会议创建与加入，请求/操作成功失败的消息提示)</li>
<li>会议页基础功能(连接开始会议，断开连接离开会议，会议室自动清理功能)</li>
<li>实时协作白板功能(多人共享白板，绘制与图形美化功能,文本输入功能)</li>
<li>语音转写字幕功能</li>
<li>会议摘要生成功能</li>
</ul>
<h2 id="首页基础功能" tabindex="-1"><a class="header-anchor" href="#首页基础功能"><span>首页基础功能</span></a></h2>
<p>先讲一讲基础功能，即会议创建与加入，请求/操作成功失败的消息提示。</p>
<h3 id="首页前端实现" tabindex="-1"><a class="header-anchor" href="#首页前端实现"><span>首页前端实现</span></a></h3>
<p><strong>页面结构与设计</strong></p>
<p>首页其实就是整个项目的页面展示，后面讲的白板页面其实就是一个<code v-pre>component</code>组件，由<code v-pre>v-if</code>指令来控制显示隐藏。因为页面结构组成简单，所以包括请求/操作成功失败的消息提示也只需要用<code v-pre>v-if</code>指令控制显隐的<code v-pre>div</code>即可实现；</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token operator">&lt;</span><span class="token operator">!</span><span class="token operator">--</span> 会议室管理界面 <span class="token operator">--</span><span class="token operator">></span></span>
<span class="line"><span class="token operator">&lt;</span>div v<span class="token operator">-</span><span class="token keyword">if</span><span class="token operator">=</span><span class="token string">"!isInMeeting"</span> <span class="token keyword">class</span><span class="token operator">=</span><span class="token string">"meeting-management"</span><span class="token operator">></span></span>
<span class="line">    <span class="token operator">...</span></span>
<span class="line">    <span class="token operator">&lt;</span>div v<span class="token operator">-</span><span class="token keyword">if</span><span class="token operator">=</span><span class="token string">"errorMessage"</span> <span class="token keyword">class</span><span class="token operator">=</span><span class="token string">"error-message"</span><span class="token operator">></span></span>
<span class="line">      <span class="token punctuation">{</span><span class="token punctuation">{</span> errorMessage <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">></span></span>
<span class="line">    <span class="token operator">&lt;</span>div v<span class="token operator">-</span><span class="token keyword">if</span><span class="token operator">=</span><span class="token string">"successMessage"</span> <span class="token keyword">class</span><span class="token operator">=</span><span class="token string">"success-message"</span><span class="token operator">></span></span>
<span class="line">      <span class="token punctuation">{</span><span class="token punctuation">{</span> successMessage <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">></span></span>
<span class="line"><span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">></span></span>
<span class="line"><span class="token operator">&lt;</span><span class="token operator">!</span><span class="token operator">--</span> 白板界面 <span class="token operator">--</span><span class="token operator">></span></span>
<span class="line"><span class="token operator">&lt;</span>div v<span class="token operator">-</span><span class="token keyword">else</span> <span class="token keyword">class</span><span class="token operator">=</span><span class="token string">"whiteboard-container"</span><span class="token operator">></span></span>
<span class="line">    <span class="token operator">...</span></span>
<span class="line"><span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">></span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>会议基础功能</strong>：</p>
<p>创建会议按钮，直接触发对应方法发送请求，获取会议码，进入会议室；</p>
<p>加入会议按钮，触发对应方法，依靠v-model绑定输入框，获取会议码发送请求，根据请求结果加入会议室/提示错误；<span style="color: green;"><strong>需要注意的是，首页部分并没有真正的加入会议室</strong></span>，加入会议室开始会议是涉及到<code v-pre>websocket</code>连接的，项目设计中加入会议室是进入<a href="#">会议室页面</a>后才进行的连接操作，首页进行的操作其实只有校验会议室代码是否存在，决定是否进入会议室页面，仅此而已；因此这里发送请求只要发送会议室代码给后台检测一下是否有这个会议室即可。</p>
<p>因为非常简单，只是发送一些请求，所以这里就不贴出代码了。</p>
<h3 id="首页后端实现" tabindex="-1"><a class="header-anchor" href="#首页后端实现"><span>首页后端实现</span></a></h3>
<p>主要实现以下功能：</p>
<ul>
<li>生成唯一的会议室代码</li>
<li>创建会议室</li>
<li>加入会议室</li>
<li>离开会议室</li>
<li>清理无人或长时间无活动的会议室</li>
</ul>
<p><strong>唯一代码与创建会议室</strong>
创建一个会议室管理类，用于管理所有的会议室。每个会议室都有一个唯一的会议室代码，用于标识会议室。</p>
<p>通过<code v-pre>map</code>来存储所有的会议室，键为会议室代码，值为会议室对象。生成唯一会议室代码时，检测<code v-pre>map</code>来确保唯一性；创建会议室的api就是调用这个方法，生成一个<code v-pre>code</code>，然后创建一个会议室对象(包含会议室代码、创建时间、最后活动时间、成员列表、画布状态、图形美化状态)，最后将会议室对象存储到<code v-pre>map</code>中，返回<code v-pre>code</code>给前端；</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">class</span> <span class="token class-name">MeetingRoomManager</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>rooms <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line">  <span class="token comment">// 生成4-6位随机数字作为会议室快捷号</span></span>
<span class="line">  <span class="token function">generateRoomCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">let</span> code<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">do</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 生成4-6位随机数字</span></span>
<span class="line">      <span class="token keyword">const</span> length <span class="token operator">=</span> Math<span class="token punctuation">.</span><span class="token function">floor</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">4</span><span class="token punctuation">;</span> <span class="token comment">// 4-6位</span></span>
<span class="line">      code <span class="token operator">=</span> <span class="token string">''</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        code <span class="token operator">+=</span> Math<span class="token punctuation">.</span><span class="token function">floor</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">has</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 确保唯一性</span></span>
<span class="line">    <span class="token keyword">return</span> code<span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 创建会议室</span></span>
<span class="line">  <span class="token function">createRoom</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> code <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">generateRoomCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> room <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">      code<span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">createdAt</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">lastActivityTime</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">members</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">canvasState</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">beautifyState</span><span class="token operator">:</span> <span class="token keyword">null</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span> room<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> room<span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token comment">// 创建会议API端点</span></span>
<span class="line">app<span class="token punctuation">.</span><span class="token function">post</span><span class="token punctuation">(</span><span class="token string">'/api/create-meeting'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">req<span class="token punctuation">,</span> res</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">const</span> room <span class="token operator">=</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">createRoom</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        res<span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">roomCode</span><span class="token operator">:</span> room<span class="token punctuation">.</span>code <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Error creating meeting:'</span><span class="token punctuation">,</span> error<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        res<span class="token punctuation">.</span><span class="token function">status</span><span class="token punctuation">(</span><span class="token number">500</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token literal-property property">error</span><span class="token operator">:</span> error<span class="token punctuation">.</span>message <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>加入会议室</strong>
<span style="color: green;"><strong>需要注意的是，首页部分并没有真正的加入会议室</strong></span>，加入会议室，开始会议是涉及到<code v-pre>websocket</code>连接的，项目设计中加入会议室是进入<a href="#">会议室页面</a>后才进行的连接操作，首页进行的操作其实只有校验会议室代码是否存在，决定是否进入会议室页面，仅此而已；api接口也只需要从<code v-pre>map</code>中get一下是否有请求时发送过来的会议室代码即可。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">class</span> <span class="token class-name">MeetingRoomManager</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token operator">...</span></span>
<span class="line">    <span class="token comment">// 获取会议室</span></span>
<span class="line">    <span class="token function">getRoom</span><span class="token punctuation">(</span><span class="token parameter">code</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token comment">// 加入会议API端点</span></span>
<span class="line">app<span class="token punctuation">.</span><span class="token function">post</span><span class="token punctuation">(</span><span class="token string">'/api/join-meeting'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">req<span class="token punctuation">,</span> res</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token punctuation">{</span> roomCode <span class="token punctuation">}</span> <span class="token operator">=</span> req<span class="token punctuation">.</span>body<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>roomCode<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">return</span> res<span class="token punctuation">.</span><span class="token function">status</span><span class="token punctuation">(</span><span class="token number">400</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token literal-property property">error</span><span class="token operator">:</span> <span class="token string">'请提供会议室代码（roomCode）'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">const</span> room <span class="token operator">=</span> meetingRoomManager<span class="token punctuation">.</span><span class="token function">getRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>room<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">return</span> res<span class="token punctuation">.</span><span class="token function">status</span><span class="token punctuation">(</span><span class="token number">404</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token literal-property property">error</span><span class="token operator">:</span> <span class="token string">'会议室不存在（roomCode）'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    res<span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">roomCode</span><span class="token operator">:</span> room<span class="token punctuation">.</span>code <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'加入会议室时出错:'</span><span class="token punctuation">,</span> error<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    res<span class="token punctuation">.</span><span class="token function">status</span><span class="token punctuation">(</span><span class="token number">500</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token literal-property property">error</span><span class="token operator">:</span> error<span class="token punctuation">.</span>message <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="会议页基础功能" tabindex="-1"><a class="header-anchor" href="#会议页基础功能"><span>会议页基础功能</span></a></h2>
<ul>
<li>加入会议室</li>
<li>离开会议室</li>
<li>清理无人或长时间无活动的会议室</li>
</ul>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 会议室管理</span></span>
<span class="line"><span class="token keyword">class</span> <span class="token class-name">MeetingRoomManager</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>rooms <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 生成4-6位随机数字作为会议室快捷号</span></span>
<span class="line">  <span class="token function">generateRoomCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">let</span> code<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">do</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 生成4-6位随机数字</span></span>
<span class="line">      <span class="token keyword">const</span> length <span class="token operator">=</span> Math<span class="token punctuation">.</span><span class="token function">floor</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">4</span><span class="token punctuation">;</span> <span class="token comment">// 4-6位</span></span>
<span class="line">      code <span class="token operator">=</span> <span class="token string">''</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        code <span class="token operator">+=</span> Math<span class="token punctuation">.</span><span class="token function">floor</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">has</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 确保唯一性</span></span>
<span class="line">    <span class="token keyword">return</span> code<span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 创建会议室</span></span>
<span class="line">  <span class="token function">createRoom</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> code <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">generateRoomCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> room <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">      code<span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">createdAt</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">lastActivityTime</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">members</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">canvasState</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">beautifyState</span><span class="token operator">:</span> <span class="token keyword">null</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span> room<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> room<span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 加入会议室</span></span>
<span class="line">  <span class="token function">joinRoom</span><span class="token punctuation">(</span><span class="token parameter">code<span class="token punctuation">,</span> socketId</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">let</span> room <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 检查会议室是否存在且为空</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>room <span class="token operator">&amp;&amp;</span> room<span class="token punctuation">.</span>members<span class="token punctuation">.</span>length <span class="token operator">===</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 如果会议室存在但为空，创建一个新的空会议室</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Meeting room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> is empty, creating new one</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      room <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">        code<span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">createdAt</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">lastActivityTime</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">members</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">canvasState</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">beautifyState</span><span class="token operator">:</span> <span class="token keyword">null</span></span>
<span class="line">      <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span> room<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>room<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 如果会议室不存在，创建一个新的</span></span>
<span class="line">      room <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">        code<span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">createdAt</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">lastActivityTime</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">members</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">canvasState</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">beautifyState</span><span class="token operator">:</span> <span class="token keyword">null</span></span>
<span class="line">      <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span> room<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Meeting room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> created for new join</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 更新最后活动时间</span></span>
<span class="line">      room<span class="token punctuation">.</span>lastActivityTime <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 检查是否已加入</span></span>
<span class="line">    <span class="token keyword">const</span> existingMember <span class="token operator">=</span> room<span class="token punctuation">.</span>members<span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span><span class="token parameter">member</span> <span class="token operator">=></span> member<span class="token punctuation">.</span>socketId <span class="token operator">===</span> socketId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>existingMember<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">return</span> room<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 添加新成员</span></span>
<span class="line">    <span class="token keyword">const</span> member <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">user_</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>Date<span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">_</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>Math<span class="token punctuation">.</span><span class="token function">floor</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">1000</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">,</span></span>
<span class="line">      socketId<span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">joinedAt</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">nickname</span><span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">用户</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>Math<span class="token punctuation">.</span><span class="token function">floor</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">1000</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">    room<span class="token punctuation">.</span>members<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>member<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> room<span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 离开会议室</span></span>
<span class="line">  <span class="token function">leaveRoom</span><span class="token punctuation">(</span><span class="token parameter">code<span class="token punctuation">,</span> socketId</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> room <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>room<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> not found</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Leaving room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">, current members: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>room<span class="token punctuation">.</span>members<span class="token punctuation">.</span>length<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    room<span class="token punctuation">.</span>members <span class="token operator">=</span> room<span class="token punctuation">.</span>members<span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token parameter">member</span> <span class="token operator">=></span> member<span class="token punctuation">.</span>socketId <span class="token operator">!==</span> socketId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">After leaving, members left: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>room<span class="token punctuation">.</span>members<span class="token punctuation">.</span>length<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果会议室为空，删除会议室</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>room<span class="token punctuation">.</span>members<span class="token punctuation">.</span>length <span class="token operator">===</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> is empty, deleting</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">delete</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Meeting room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> deleted as all members left</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 定期检查并清理无人或长时间无活动的会议室</span></span>
<span class="line">  <span class="token function">cleanupEmptyRooms</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> now <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> timeout <span class="token operator">=</span> <span class="token number">10</span> <span class="token operator">*</span> <span class="token number">60</span> <span class="token operator">*</span> <span class="token number">1000</span><span class="token punctuation">;</span> <span class="token comment">// 10分钟超时</span></span>
<span class="line">    <span class="token keyword">let</span> deletedRooms <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token punctuation">[</span>code<span class="token punctuation">,</span> room<span class="token punctuation">]</span> <span class="token keyword">of</span> <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">entries</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token comment">// 检查会议室是否为空或长时间无活动</span></span>
<span class="line">      <span class="token keyword">const</span> isEmpty <span class="token operator">=</span> room<span class="token punctuation">.</span>members<span class="token punctuation">.</span>length <span class="token operator">===</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">const</span> isInactive <span class="token operator">=</span> now <span class="token operator">-</span> room<span class="token punctuation">.</span>lastActivityTime <span class="token operator">></span> timeout<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">      <span class="token keyword">if</span> <span class="token punctuation">(</span>isEmpty <span class="token operator">||</span> isInactive<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Cleaning up room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> - </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>isEmpty <span class="token operator">?</span> <span class="token string">'empty'</span> <span class="token operator">:</span> <span class="token string">'inactive'</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">delete</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        deletedRooms<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>deletedRooms <span class="token operator">></span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Cleaned up </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>deletedRooms<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> rooms</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>API 端点</strong>：
<strong>离开会议</strong>：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 离开会议API端点</span></span>
<span class="line">app<span class="token punctuation">.</span><span class="token function">post</span><span class="token punctuation">(</span><span class="token string">'/api/leave-meeting'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">req<span class="token punctuation">,</span> res</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token punctuation">{</span> roomCode<span class="token punctuation">,</span> socketId <span class="token punctuation">}</span> <span class="token operator">=</span> req<span class="token punctuation">.</span>body<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>roomCode <span class="token operator">||</span> <span class="token operator">!</span>socketId<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">return</span> res<span class="token punctuation">.</span><span class="token function">status</span><span class="token punctuation">(</span><span class="token number">400</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token literal-property property">error</span><span class="token operator">:</span> <span class="token string">'Room code and socketId are required'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 从会议室中移除用户</span></span>
<span class="line">    meetingRoomManager<span class="token punctuation">.</span><span class="token function">leaveRoom</span><span class="token punctuation">(</span>roomCode<span class="token punctuation">,</span> socketId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    res<span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">message</span><span class="token operator">:</span> <span class="token string">'Left meeting successfully'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Error leaving meeting:'</span><span class="token punctuation">,</span> error<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    res<span class="token punctuation">.</span><span class="token function">status</span><span class="token punctuation">(</span><span class="token number">500</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">success</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token literal-property property">error</span><span class="token operator">:</span> error<span class="token punctuation">.</span>message <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="会议室自动清理功能" tabindex="-1"><a class="header-anchor" href="#会议室自动清理功能"><span>会议室自动清理功能</span></a></h4>
<p>为了避免资源浪费，系统实现了会议室自动清理机制：</p>
<p><strong>实现原理</strong>：</p>
<ul>
<li>定期检查所有会议室的状态</li>
<li>清理条件：
<ol>
<li>会议室为空（没有成员）</li>
<li>会议室长时间无活动（超过10分钟）</li>
</ol>
</li>
<li>清理频率：每5分钟执行一次</li>
</ul>
<p><strong>核心代码</strong>：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 定期检查并清理无人或长时间无活动的会议室</span></span>
<span class="line"><span class="token function">cleanupEmptyRooms</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">const</span> now <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">const</span> timeout <span class="token operator">=</span> <span class="token number">10</span> <span class="token operator">*</span> <span class="token number">60</span> <span class="token operator">*</span> <span class="token number">1000</span><span class="token punctuation">;</span> <span class="token comment">// 10分钟超时</span></span>
<span class="line">  <span class="token keyword">let</span> deletedRooms <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token punctuation">[</span>code<span class="token punctuation">,</span> room<span class="token punctuation">]</span> <span class="token keyword">of</span> <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">entries</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 检查会议室是否为空或长时间无活动</span></span>
<span class="line">    <span class="token keyword">const</span> isEmpty <span class="token operator">=</span> room<span class="token punctuation">.</span>members<span class="token punctuation">.</span>length <span class="token operator">===</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> isInactive <span class="token operator">=</span> now <span class="token operator">-</span> room<span class="token punctuation">.</span>lastActivityTime <span class="token operator">></span> timeout<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>isEmpty <span class="token operator">||</span> isInactive<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Cleaning up room </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>code<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> - </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>isEmpty <span class="token operator">?</span> <span class="token string">'empty'</span> <span class="token operator">:</span> <span class="token string">'inactive'</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token keyword">this</span><span class="token punctuation">.</span>rooms<span class="token punctuation">.</span><span class="token function">delete</span><span class="token punctuation">(</span>code<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      deletedRooms<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token keyword">if</span> <span class="token punctuation">(</span>deletedRooms <span class="token operator">></span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Cleaned up </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>deletedRooms<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> rooms</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 启动定时清理任务</span></span>
<span class="line"><span class="token keyword">const</span> <span class="token constant">PORT</span> <span class="token operator">=</span> process<span class="token punctuation">.</span>env<span class="token punctuation">.</span><span class="token constant">PORT</span> <span class="token operator">||</span> <span class="token number">8080</span><span class="token punctuation">;</span></span>
<span class="line">server<span class="token punctuation">.</span><span class="token function">listen</span><span class="token punctuation">(</span><span class="token constant">PORT</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">Server running on port </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">PORT</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 每5分钟检查并清理一次无人的会议室</span></span>
<span class="line">  <span class="token function">setInterval</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span></span>
<span class="line">    meetingRoomManager<span class="token punctuation">.</span><span class="token function">cleanupEmptyRooms</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">5</span> <span class="token operator">*</span> <span class="token number">60</span> <span class="token operator">*</span> <span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'Empty room cleanup scheduled every 5 minutes'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="技术要点" tabindex="-1"><a class="header-anchor" href="#技术要点"><span>技术要点</span></a></h4>
<ol>
<li><strong>会议室代码生成</strong>：
<ul>
<li>生成4-6位随机数字作为会议室代码</li>
<li>确保代码的唯一性，避免重复</li>
</ul>
</li>
<li><strong>会议室状态管理</strong>：
<ul>
<li>使用 Map 数据结构存储会议室信息</li>
<li>每个会议室包含成员列表、画布状态等信息</li>
<li>跟踪会议室的最后活动时间，用于判断是否需要清理</li>
</ul>
</li>
<li><strong>WebSocket 连接</strong>：
<ul>
<li>当用户加入会议时，建立 WebSocket 连接</li>
<li>连接时发送当前画布状态给新用户</li>
<li>断开连接时从会议室中移除用户</li>
</ul>
</li>
<li><strong>错误处理</strong>：
<ul>
<li>前端处理网络错误和服务器返回的错误</li>
<li>后端处理各种异常情况，确保系统稳定运行</li>
</ul>
</li>
<li><strong>用户体验</strong>：
<ul>
<li>加入和创建会议时显示成功或错误提示</li>
<li>会议创建成功后自动显示会议代码</li>
<li>提示信息自动消失，不干扰用户操作</li>
</ul>
</li>
</ol>
<h3 id="实时协作白板功能" tabindex="-1"><a class="header-anchor" href="#实时协作白板功能"><span>实时协作白板功能</span></a></h3>
</div></template>


