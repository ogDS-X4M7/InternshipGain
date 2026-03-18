<template><div><h1 id="关于whiteboard" tabindex="-1"><a class="header-anchor" href="#关于whiteboard"><span>关于whiteBoard</span></a></h1>
<p>whiteBoard是我的毕业设计，一个基于 WebSocket 的实时协作白板系统，支持语音通话，实时字幕转写，会议摘要功能。</p>
<h2 id="功能特性" tabindex="-1"><a class="header-anchor" href="#功能特性"><span>功能特性</span></a></h2>
<ul>
<li>实时协作白板，支持多人同时绘制</li>
<li>支持画笔、橡皮、文本、矩形、圆形、菱形、箭头等工具</li>
<li>图形美化功能，自动识别和美化手绘图形</li>
<li>语音转写功能，使用讯飞星火 API 实现实时语音转写</li>
<li>会议摘要生成功能，基于白板内容和语音转写结果生成会议摘要</li>
<li>文本输入功能改进：
<ul>
<li>支持画布上直接生成文本框</li>
<li>文本框大小调整和位置拖动</li>
<li>文本自动换行，支持垂直排列</li>
<li>Enter键或确认按钮确认绘制</li>
</ul>
</li>
<li>鼠标工具，方便调整和选择元素</li>
<li>会议室自动清理机制，基于最后活动时间清理无人使用的会议室</li>
</ul>
<h2 id="技术栈" tabindex="-1"><a class="header-anchor" href="#技术栈"><span>技术栈</span></a></h2>
<ul>
<li>前端：Vue 3</li>
<li>后端：Node.js + Express</li>
<li>WebSocket：实时通信</li>
<li>语音转写与会议摘要：讯飞星火 API</li>
</ul>
</div></template>


