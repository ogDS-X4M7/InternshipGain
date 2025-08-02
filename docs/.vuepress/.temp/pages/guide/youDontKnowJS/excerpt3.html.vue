<template><div><h1 id="你不知道的js-摘录-this与对象原型-2" tabindex="-1"><a class="header-anchor" href="#你不知道的js-摘录-this与对象原型-2"><span>你不知道的JS-摘录-this与对象原型-2</span></a></h1>
<details class="hint-container details"><summary>拆分的原因</summary>
<p>原本确实是打算在这个系列丛书中一本书摘抄一个文档，但这部分内容比较多且比较有难度，摘抄总结都写的很多，因此拆分为多个部分</p>
</details>
<h2 id="摘自第三章-类型" tabindex="-1"><a class="header-anchor" href="#摘自第三章-类型"><span>摘自第三章-类型</span></a></h2>
<p>注意 <em>简单基本类型</em> （<code v-pre>string</code>、<code v-pre>number</code>、<code v-pre>boolean</code>、<code v-pre>null</code>、和 <code v-pre>undefined</code>）自身 <strong>不是</strong> <code v-pre>object</code>。<code v-pre>null</code> 有时会被当成一个对象类型，但是这种误解源自于一个语言中的 Bug，它使得 <code v-pre>typeof null</code> 错误地（而且令人困惑地）返回字符串 <code v-pre>&quot;object&quot;</code>。实际上，<code v-pre>null</code> 是它自己的基本类型。</p>
<p><strong>一个常见的错误论断是“JavaScript中的一切都是对象”。这明显是不对的。</strong></p>
<p>对比来看，存在几种特殊的对象子类型，我们可以称之为 <em>复杂基本类型</em>。</p>
<p><code v-pre>function</code> 是对象的一种子类型（技术上讲，叫做“可调用对象”）。函数在 JS 中被称为“头等（first class）”类型，是因为它们基本上就是普通的对象（附带有可调用的行为语义），而且它们可以像其他普通的对象那样被处理。</p>
<p>数组也是一种形式的对象，带有特别的行为。数组在内容的组织上要稍稍比一般的对象更加结构化。</p>
</div></template>


