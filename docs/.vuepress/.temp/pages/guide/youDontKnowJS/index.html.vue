<template><div><h1 id="你不知道的js-摘录-起步上路" tabindex="-1"><a class="header-anchor" href="#你不知道的js-摘录-起步上路"><span>你不知道的JS-摘录-起步上路</span></a></h1>
<p>顺便读一读<a href="https://github.com/getify/You-Dont-Know-JS" target="_blank" rel="noopener noreferrer">You-Dont-Know-JS</a>，把一些我觉得对我比较有启发的语句摘录下来，但其实很多重要的内容我都没有摘抄，只是因为相对而言我对它们比较熟悉，摘抄的主要是我不熟悉甚至不知道的内容，并不是说没有摘抄的内容就不重要。</p>
<p>另外，在极少数我觉得需要补充的地方会写一些内容，但大多数时候原内容就已经足够简单易懂了，所以基本都是摘抄</p>
<p>ps:目前摘录内容较少，暂时不加入侧边栏，只从顶部栏进入查看效果。等读的差不多了再放进侧边栏</p>
<h2 id="摘自第二章-值与类型" tabindex="-1"><a class="header-anchor" href="#摘自第二章-值与类型"><span>摘自第二章-值与类型</span></a></h2>
<p>在JavaScript中只有值拥有类型；变量只是这些值的简单容器。</p>
<p><code v-pre>typeof null</code>是一个有趣的例子，因为当你期望它返回<code v-pre>&quot;null&quot;</code>时，它错误地返回了<code v-pre>&quot;object&quot;</code>。这是JS中一直存在的一个bug，但是看起来它永远都不会被修复了。在网络上有太多的代码依存于这个bug，因此修复它将会导致更多的bug！</p>
<h3 id="值的比较" tabindex="-1"><a class="header-anchor" href="#值的比较"><span>值的比较</span></a></h3>
<h4 id="truthy-与-falsy" tabindex="-1"><a class="header-anchor" href="#truthy-与-falsy"><span>Truthy 与 Falsy</span></a></h4>
<p>当一个非<code v-pre>boolean</code>值被强制转换为一个<code v-pre>boolean</code>时，它是变成<code v-pre>true</code>还是<code v-pre>false</code>。</p>
<p>在JavaScript中“falsy”的明确列表如下：</p>
<ul>
<li><code v-pre>&quot;&quot;</code> （空字符串）</li>
<li><code v-pre>0</code>, <code v-pre>-0</code>, <code v-pre>NaN</code> （非法的<code v-pre>number</code>）</li>
<li><code v-pre>null</code>, <code v-pre>undefined</code></li>
<li><code v-pre>false</code></li>
</ul>
<p>任何不在这个“falsy”列表中的值都是“truthy”。</p>
<h4 id="等价性" tabindex="-1"><a class="header-anchor" href="#等价性"><span>等价性</span></a></h4>
<p><code v-pre>==</code>和<code v-pre>===</code>之间的不同通常被描述为，<code v-pre>==</code>检查值的等价性而<code v-pre>===</code>检查值和类型两者的等价性。然而，这是不准确的。描述它们的合理方式是，<code v-pre>==</code>在允许强制转换的条件下检查值的等价性，而<code v-pre>===</code>是在不允许强制转换的条件下检查值的等价性；因此<code v-pre>===</code>常被称为“严格等价”。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">这个部分我自己想补充一下==比较的流程的总结：</span>
<span class="line">==从上到下按照规则比较，直到能得到确切结果为止</span>
<span class="line">1.两端类型相同，比较值</span>
<span class="line">2.两端存在NaN，返回false</span>
<span class="line">3. undefined和null只有与自身比较，或者互相比较时，才会返回true</span>
<span class="line">4.两端都是原始类型，转换成数字比较</span>
<span class="line">5.一端是原始类型，一端是对象类型，把对象转换成原始类型后进入第1步</span>
<span class="line">6.两端都是对象类型直接比较引用地址是否相同</span>
<span class="line">注意直接开辟的[]、{}都会在内存中开辟一块空间，因此[]==[];{}=={}都不会相等</span>
<span class="line"></span>
<span class="line">也就是先看类型，相同直接比；</span>
<span class="line">不同的话，看看有没有NaN，有的话直接false；</span>
<span class="line">没有再看类型有没有对象，</span>
<span class="line">    有且仅有一个的话对对象进行处理成原始类型比较；</span>
<span class="line">        两个都是对象直接比引用地址是否相同；</span>
<span class="line">    没有的话转数字再比较；</span>
<span class="line">注意undefined和null的比较情况。</span>
<span class="line"></span>
<span class="line">对象如何转原始类型？下面的得不到原始值就是return {}；</span>
<span class="line">另外还有需要注意的地方，{}经过valueOf得到的还是对象，经过toString得到的是'[object Object]'，</span>
<span class="line">因此({})==""是false，而[]==""是true</span>
<span class="line">1.如果对象拥有[Symbol.toPrimitive]方法，调用该方法。</span>
<span class="line">若该方法能得到原始值，使用该原始值；</span>
<span class="line">若得不到原始值，抛出异常</span>
<span class="line">2.调用对象的value0f方法</span>
<span class="line">若该方法能得到原始值，使用该原始值；</span>
<span class="line">若得不到原始值，进入下一步</span>
<span class="line">3.调用对象的toString方法</span>
<span class="line">若该方法能得到原始值，使用该原始值;</span>
<span class="line">若得不到原始值，抛出异常</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>为了将这许多细节归纳为一个简单的包装，并帮助你在各种情况下判断是否使用<code v-pre>==</code>或<code v-pre>===</code>，这是我的简单规则：</p>
<ul>
<li>如果一个比较的两个值之一可能是<code v-pre>true</code>或<code v-pre>false</code>值，避免<code v-pre>==</code>而使用<code v-pre>===</code>。</li>
<li>如果一个比较的两个值之一可能是这些具体的值（<code v-pre>0</code>，<code v-pre>&quot;&quot;</code>，或<code v-pre>[]</code> —— 空数组），避免<code v-pre>==</code>而使用<code v-pre>===</code>。</li>
<li>在 <em>所有</em> 其他情况下，你使用<code v-pre>==</code>是安全的。它不仅安全，而且在许多情况下它可以简化你的代码并改善可读性。</li>
</ul>
<p>这些规则归纳出来的东西要求你严谨地考虑你的代码：什么样的值可能通过这个被比较等价性的变量。如果你可以确定这些值，那么<code v-pre>==</code>就是安全的，使用它！如果你不能确定这些值，就使用<code v-pre>===</code>。就这么简单。</p>
<h4 id="不等价性" tabindex="-1"><a class="header-anchor" href="#不等价性"><span>不等价性</span></a></h4>
<p>JavaScript<code v-pre>string</code>值也可进行不等价性比较，它使用典型的字母顺序规则（<code v-pre>&quot;bar&quot; &lt; &quot;foo&quot;</code>）。</p>
<p>在可能不同类型的值之间进行比较时，你可能遇到的最大的坑 —— 记住，没有“严格不等价”可用 —— 是其中一个值不能转换为合法的数字，例如：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token number">42</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">var</span> b <span class="token operator">=</span> <span class="token string">"foo"</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">a <span class="token operator">&lt;</span> b<span class="token punctuation">;</span>		<span class="token comment">// false</span></span>
<span class="line">a <span class="token operator">></span> b<span class="token punctuation">;</span>		<span class="token comment">// false</span></span>
<span class="line">a <span class="token operator">==</span> b<span class="token punctuation">;</span>		<span class="token comment">// false</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>等一下，这三个比较怎么可能都是<code v-pre>false</code>？因为在<code v-pre>&lt;</code>和<code v-pre>&gt;</code>的比较中，值<code v-pre>b</code>被强制转换为了“非法的数字值”，而且语言规范说<code v-pre>NaN</code>既不大于其他值，也不小于其他值。</p>
<h2 id="摘自第二章-strict模式" tabindex="-1"><a class="header-anchor" href="#摘自第二章-strict模式"><span>摘自第二章-Strict模式</span></a></h2>
<p>ES5在语言中加入了一个“strict模式”，它收紧了一些特定行为的规则。</p>
<p>使用strict模式的一个关键不同（改善！）是，它不允许因为省略了<code v-pre>var</code>而进行隐含的自动全局变量声明：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">	<span class="token string">"use strict"</span><span class="token punctuation">;</span>	<span class="token comment">// 打开strict模式</span></span>
<span class="line">	a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>			<span class="token comment">// 缺少`var`，ReferenceError</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="摘自第二章-旧的与新的" tabindex="-1"><a class="header-anchor" href="#摘自第二章-旧的与新的"><span>摘自第二章-旧的与新的</span></a></h2>
<h3 id="转译" tabindex="-1"><a class="header-anchor" href="#转译"><span>转译</span></a></h3>
<p>实质上，你的源代码是使用新的语法形式编写的，但是你向浏览器部署的是转译过的旧语法形式。你一般会将转译器插入到你的构建过程中，与你的代码linter和代码压缩器类似。</p>
<p>这是一个转译的简单例子。ES6增加了一个称为“默认参数值”的新特性。它看起来像是这样：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token parameter">a <span class="token operator">=</span> <span class="token number">2</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>		<span class="token comment">// 2</span></span>
<span class="line"><span class="token function">foo</span><span class="token punctuation">(</span> <span class="token number">42</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>	<span class="token comment">// 42</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>简单，对吧？也很有用！但是这种新语法在前ES6引擎中是不合法的。那么转译器将会对这段代码做什么才能使它在老版本环境中运行呢？</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">	<span class="token keyword">var</span> a <span class="token operator">=</span> arguments<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span> <span class="token operator">!==</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">?</span> arguments<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span> <span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">;</span></span>
<span class="line">	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如你所见，它检查<code v-pre>arguments[0]</code>值是否是<code v-pre>void 0</code>（也就是<code v-pre>undefined</code>），而且如果是，就提供默认值<code v-pre>2</code>；否则，它就赋值被传递的任何东西。</p>
<p>除了可以现在就在老版本浏览器中使用更好的语法以外，观察转译后的代码实际上更清晰地解释了意图中的行为。</p>
<p>仅从ES6版本的代码看来，你可能还不理解<code v-pre>undefined</code>是唯一不能作为参数默认值的明确传递的值，但是转译后的代码使这一点清楚的多。</p>
<h2 id="摘自第三章-作用域与闭包" tabindex="-1"><a class="header-anchor" href="#摘自第三章-作用域与闭包"><span>摘自第三章-作用域与闭包</span></a></h2>
<p><em>作用域与闭包</em> 从揭穿常见的误解开始：JS是“解释型语言”因此是不被编译的。不对。</p>
<p>JS引擎在你的代码执行的前一刻（有时是在执行期间！）编译它。所以我们首先深入了解编译器处理我们代码的方式，以此来理解它如何找到并处理变量和函数的声明。沿着这条道路，我们将见到JS变量作用域管理的特有隐喻，“提升”。</p>
<h1 id="注意" tabindex="-1"><a class="header-anchor" href="#注意"><span>注意</span></a></h1>
<p>后续的话把自己的总结等部分内容改用折叠演示结果写，不要用代码模式，不然看起来不舒服而且写的时候总是要顾及每行字体的长度，太麻烦</p>
</div></template>


