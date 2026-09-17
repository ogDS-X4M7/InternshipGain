<template><div><h1 id="你不知道的js-摘录-this与对象原型-3" tabindex="-1"><a class="header-anchor" href="#你不知道的js-摘录-this与对象原型-3"><span>你不知道的JS-摘录-this与对象原型-3</span></a></h1>
<h2 id="摘自第五章" tabindex="-1"><a class="header-anchor" href="#摘自第五章"><span>摘自第五章</span></a></h2>
<details class="hint-container details"><summary>写在前面</summary>
<p>这个章节写的内容非常丰富和生动，能够得到很多启发，难度上并不会很大，但我还是对大部分内容都进行了完整的摘抄，如果想快速判断是否熟悉从而决定是否跳过，可以直接看 简单小结之类的部分。</p>
</details>
<p>在第三，四章中，我们几次提到了 <code v-pre>[[Prototype]]</code> 链，但我们没有讨论它到底是什么。现在我们就详细讲解一下原型（prototype）。</p>
<p><strong>注意：</strong> 所有模拟类拷贝行为的企图，也就是我们在前面第四章描述的内容，称为各种种类的“mixin”，和我们要在本章中讲解的 <code v-pre>[[Prototype]]</code> 链机制完全不同。</p>
<h2 id="摘自第五章-prototype" tabindex="-1"><a class="header-anchor" href="#摘自第五章-prototype"><span>摘自第五章-<code v-pre>[[Prototype]]</code></span></a></h2>
<p>JavaScript 中的对象有一个内部属性，在语言规范中称为 <code v-pre>[[Prototype]]</code>，它只是一个其他对象的引用。几乎所有的对象在被创建时，它的这个属性都被赋予了一个非 <code v-pre>null</code> 值。</p>
<p><strong>注意：</strong> 我们马上就会看到，一个对象拥有一个空的 <code v-pre>[[Prototype]]</code> 链接是 <em>可能</em> 的，虽然这有些不寻常。</p>
<p><strong>注意：</strong> ES6 的代理（Proxy）超出了我们要在本书内讨论的范围（将会在本系列的后续书目中涵盖！），但是如果加入 <code v-pre>Proxy</code>，我们在这里讨论的关于普通 <code v-pre>[[Get]]</code> 和 <code v-pre>[[Put]]</code> 的行为都是不被采用的。</p>
<p>但是如果 <code v-pre>myObject</code> 上 <strong>不</strong> 存在 <code v-pre>a</code> 属性时，我们就将注意力转向对象的 <code v-pre>[[Prototype]]</code> 链。</p>
<p>如果默认的 <code v-pre>[[Get]]</code> 操作不能直接在对象上找到被请求的属性，那么它会沿着对象的 <code v-pre>[[Prototype]]</code> <strong>链</strong> 继续处理。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">2</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 创建一个链接到 `anotherObject` 的对象</span></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 2</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>注意：</strong> 我们马上就会解释 <code v-pre>Object.create(..)</code> 是做什么，如何做的。眼下先假设，它创建了一个对象，这个对象带有一个链到指定对象的 <code v-pre>[[Prototype]]</code> 链接，这个链接就是我们要讲解的。</p>
<p>那么，我们现在让 <code v-pre>myObject</code> <code v-pre>[[Prototype]]</code> 链到了 <code v-pre>anotherObject</code>。虽然很明显 <code v-pre>myObject.a</code> 实际上不存在，但是无论如何属性访问成功了（在 <code v-pre>anotherObject</code> 中找到了），而且确实找到了值 <code v-pre>2</code>。</p>
<p>但是，如果在 <code v-pre>anotherObject</code> 上也没有找到 <code v-pre>a</code>，而且如果它的 <code v-pre>[[Prototype]]</code> 链不为空，就沿着它继续查找。</p>
<p>这个处理持续进行，直到找到名称匹配的属性，或者 <code v-pre>[[Prototype]]</code> 链终结。如果在链条的末尾都没有找到匹配的属性，那么 <code v-pre>[[Get]]</code> 操作的返回结果为 <code v-pre>undefined</code>。</p>
<p>和这种 <code v-pre>[[Prototype]]</code> 链查询处理相似，如果你使用 <code v-pre>for..in</code> 循环迭代一个对象，所有在它的链条上可以到达的（并且是 <code v-pre>enumerable</code> —— 见第三章）属性都会被枚举。如果你使用 <code v-pre>in</code> 操作符来测试一个属性在一个对象上的存在性，<code v-pre>in</code> 将会检查对象的整个链条（不管 <em>可枚举性</em>）。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">2</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 创建一个链接到 `anotherObject` 的对象</span></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">var</span> k <span class="token keyword">in</span> myObject<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"found: "</span> <span class="token operator">+</span> k<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token comment">// 找到: a</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">(</span><span class="token string">"a"</span> <span class="token keyword">in</span> myObject<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以，当你以各种方式进行属性查询时，<code v-pre>[[Prototype]]</code> 链就会一个链接一个链接地被查询。一旦找到属性或者链条终结，这种查询就会停止。</p>
<h3 id="object-prototype" tabindex="-1"><a class="header-anchor" href="#object-prototype"><span><code v-pre>Object.prototype</code></span></a></h3>
<p>但是 <code v-pre>[[Prototype]]</code> 链到底在 <em>哪里</em> “终结”？</p>
<p>每个 <em>普通</em> 的 <code v-pre>[[Prototype]]</code> 链的最顶端，是内建的 <code v-pre>Object.prototype</code>。这个对象包含各种在整个 JS 中被使用的共通工具，因为 JavaScript 中所有普通（内建，而非被宿主环境扩展的）的对象都“衍生自”（也就是，使它们的 <code v-pre>[[Prototype]]</code> 顶端为）<code v-pre>Object.prototype</code> 对象。</p>
<p>你会在这里发现一些你可能很熟悉的工具，比如 <code v-pre>.toString()</code> 和 <code v-pre>.valueOf()</code>。在第三章中，我们介绍了另一个：<code v-pre>.hasOwnProperty(..)</code>。还有另外一个你可能不太熟悉，但我们将在这一章里讨论的 <code v-pre>Object.prototype</code> 上的函数是 <code v-pre>.isPrototypeOf(..)</code>。</p>
<details class="hint-container details"><summary>简单小结</summary>
<p>对象天生带有原型链<code v-pre>Prototype</code>，可以通过<code v-pre>get</code>向上查找属性（ps:对象、数组用<code v-pre>.__proto__</code>，函数才有<code v-pre>prototype</code>，<code v-pre>.__proto__</code>会指向其构造函数的<code v-pre>prototype</code>）；尽头是 <code v-pre>Object.prototype</code>。</p>
</details>
<h3 id="设置与遮蔽属性" tabindex="-1"><a class="header-anchor" href="#设置与遮蔽属性"><span>设置与遮蔽属性</span></a></h3>
<p>回到第三章，我们提到过在对象上设置属性要比仅仅在对象上添加新属性或改变既存属性的值更加微妙。现在我们将更完整地重温这个话题。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">myObject<span class="token punctuation">.</span>foo <span class="token operator">=</span> <span class="token string">"bar"</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>如果 <code v-pre>myObject</code> 对象已经直接拥有了普通的名为 <code v-pre>foo</code> 的数据访问器属性，那么这个赋值就和改变既存属性的值一样简单。</p>
<p>如果 <code v-pre>foo</code> 还没有直接存在于 <code v-pre>myObject</code>，<code v-pre>[[Prototype]]</code> 就会被遍历，就像 <code v-pre>[[Get]]</code> 操作那样。如果在链条的任何地方都没有找到 <code v-pre>foo</code>，那么就会像我们期望的那样，属性 <code v-pre>foo</code> 就以指定的值被直接添加到 <code v-pre>myObject</code> 上。</p>
<p>然而，如果 <code v-pre>foo</code> 已经存在于链条更高层的某处，<code v-pre>myObject.foo = &quot;bar&quot;</code> 赋值就可能会发生微妙的（也许令人诧异的）行为。我们一会儿就详细讲解。</p>
<p>如果属性名 <code v-pre>foo</code> 同时存在于 <code v-pre>myObject</code> 本身和从 <code v-pre>myObject</code> 开始的 <code v-pre>[[Prototype]]</code> 链的更高层，这样的情况称为 <em>遮蔽</em>。直接存在于 <code v-pre>myObject</code> 上的 <code v-pre>foo</code> 属性会 <em>遮蔽</em> 任何出现在链条高层的 <code v-pre>foo</code> 属性，因为 <code v-pre>myObject.foo</code> 查询总是在寻找链条最底层的 <code v-pre>foo</code> 属性。</p>
<p>正如我们被暗示的那样，在 <code v-pre>myObject</code> 上的 <code v-pre>foo</code> 遮蔽没有看起来那么简单。我们现在来考察 <code v-pre>myObject.foo = &quot;bar&quot;</code> 赋值的三种场景，当 <code v-pre>foo</code> <strong>不直接存在</strong> 于 <code v-pre>myObject</code>，但 <strong>存在</strong> 于 <code v-pre>myObject</code> 的 <code v-pre>[[Prototype]]</code> 链的更高层时：</p>
<ol>
<li>如果一个普通的名为 <code v-pre>foo</code> 的数据访问属性在 <code v-pre>[[Prototype]]</code> 链的高层某处被找到，<strong>而且没有被标记为只读（<code v-pre>writable:false</code>）</strong>，那么一个名为 <code v-pre>foo</code> 的新属性就直接添加到 <code v-pre>myObject</code> 上，形成一个 <strong>遮蔽属性</strong>。</li>
<li>如果一个 <code v-pre>foo</code> 在 <code v-pre>[[Prototype]]</code> 链的高层某处被找到，但是它被标记为 <strong>只读（<code v-pre>writable:false</code>）</strong> ，那么设置既存属性和在 <code v-pre>myObject</code> 上创建遮蔽属性都是 <strong>不允许</strong> 的。如果代码运行在 <code v-pre>strict mode</code> 下，一个错误会被抛出。否则，这个设置属性值的操作会被无声地忽略。不论怎样，<strong>没有发生遮蔽</strong>。</li>
<li>如果一个 <code v-pre>foo</code> 在 <code v-pre>[[Prototype]]</code> 链的高层某处被找到，而且它是一个 setter（见第三章），那么这个 setter 总是被调用。没有 <code v-pre>foo</code> 会被添加到（也就是遮蔽在）<code v-pre>myObject</code> 上，这个 <code v-pre>foo</code> setter 也不会被重定义。</li>
</ol>
<p>大多数开发者认为，如果一个属性已经存在于 <code v-pre>[[Prototype]]</code> 链的高层，那么对它的赋值（<code v-pre>[[Put]]</code>）将总是造成遮蔽。但如你所见，这仅在刚才描述的三中场景中的一种（第一种）中是对的。</p>
<p>如果你想在第二和第三种情况中遮蔽 <code v-pre>foo</code>，那你就不能使用 <code v-pre>=</code> 赋值，而必须使用 <code v-pre>Object.defineProperty(..)</code>（见第三章）将 <code v-pre>foo</code> 添加到 <code v-pre>myObject</code>。</p>
<p><strong>注意：</strong> 第二种情况可能是三种情况中最让人诧异的了。<em>只读</em> 属性的存在会阻止同名属性在 <code v-pre>[[Prototype]]</code> 链的低层被创建（遮蔽）。这个限制的主要原因是为了增强类继承属性的幻觉。如果你想象位于链条高层的 <code v-pre>foo</code> 被继承（拷贝）至 <code v-pre>myObject</code>， 那么在 <code v-pre>myObject</code> 上强制 <code v-pre>foo</code> 属性不可写就有道理。但如果你将幻觉和现实分开，而且认识到 <em>实际上</em> 没有这样的继承拷贝发生（见第四，五章），那么仅因为某些其他的对象上拥有不可写的 <code v-pre>foo</code>，而导致 <code v-pre>myObject</code> 不能拥有 <code v-pre>foo</code> 属性就有些不自然。而且更奇怪的是，这个限制仅限于 <code v-pre>=</code> 赋值，当使用 <code v-pre>Object.defineProperty(..)</code> 时不被强制。</p>
<p>如果你需要在方法间进行委托，<strong>方法</strong> 的遮蔽会导致难看的 <em>显式假想多态</em>（见第四章）。一般来说，遮蔽与它带来的好处相比太过复杂和微妙了，<strong>所以你应当尽量避免它</strong>。第六章介绍另一种设计模式，它提倡干净而且不鼓励遮蔽。</p>
<p>遮蔽甚至会以微妙的方式隐含地发生，所以要想避免它必须小心。考虑这段代码：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">2</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">anotherObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 2</span></span>
<span class="line">myObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 2</span></span>
<span class="line"></span>
<span class="line">anotherObject<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span> <span class="token string">"a"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span> <span class="token string">"a"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// false</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span>a<span class="token operator">++</span><span class="token punctuation">;</span> <span class="token comment">// 噢，隐式遮蔽！</span></span>
<span class="line"></span>
<span class="line">anotherObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 2</span></span>
<span class="line">myObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 3</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span> <span class="token string">"a"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>虽然看起来 <code v-pre>myObject.a++</code> 应当（通过委托）查询并 <em>原地</em> 递增 <code v-pre>anotherObject.a</code> 属性，但是 <code v-pre>++</code> 操作符相当于 <code v-pre>myObject.a = myObject.a + 1</code>。结果就是在 <code v-pre>[[Prototype]]</code> 上进行 <code v-pre>a</code> 的 <code v-pre>[[Get]]</code> 查询，从 <code v-pre>anotherObject.a</code> 得到当前的值 <code v-pre>2</code>，将这个值递增1，然后将值 <code v-pre>3</code> 用 <code v-pre>[[Put]]</code> 赋值到 <code v-pre>myObject</code> 上的新遮蔽属性 <code v-pre>a</code> 上。噢！</p>
<p>修改你的委托属性时要非常小心。如果你想递增 <code v-pre>anotherObject.a</code>， 那么唯一正确的方法是 <code v-pre>anotherObject.a++</code>。</p>
<details class="hint-container details"><summary>总结与感想</summary>
<p>这一段有很多需要注意的地方，关于原型链数据的读取与设置，隐式遮蔽问题。原型链上有属性，如果访问的对象有，那么就是最常见的访问和修改，如果是原型链上原型对象有，访问对象没有就会有遮蔽现象：</p>
<ol>
<li>如果一个普通的名为 <code v-pre>foo</code> 的数据访问属性在 <code v-pre>[[Prototype]]</code> 链的高层某处被找到，<strong>而且没有被标记为只读（<code v-pre>writable:false</code>）</strong>，那么一个名为 <code v-pre>foo</code> 的新属性就直接添加到 <code v-pre>myObject</code> 上，形成一个 <strong>遮蔽属性</strong>。</li>
<li>如果一个 <code v-pre>foo</code> 在 <code v-pre>[[Prototype]]</code> 链的高层某处被找到，但是它被标记为 <strong>只读（<code v-pre>writable:false</code>）</strong> ，那么设置既存属性和在 <code v-pre>myObject</code> 上创建遮蔽属性都是 <strong>不允许</strong> 的。如果代码运行在 <code v-pre>strict mode</code> 下，一个错误会被抛出。否则，这个设置属性值的操作会被无声地忽略。不论怎样，<strong>没有发生遮蔽</strong>。</li>
<li>如果一个 <code v-pre>foo</code> 在 <code v-pre>[[Prototype]]</code> 链的高层某处被找到，而且它是一个 setter（见第三章），那么这个 setter 总是被调用。没有 <code v-pre>foo</code> 会被添加到（也就是遮蔽在）<code v-pre>myObject</code> 上，这个 <code v-pre>foo</code> setter 也不会被重定义。</li>
</ol>
<p><strong>遮蔽就是子“类”根据原型链上访问到的结果自己生成一个属性，以后读取和修改都在它身上进行；但是如果原型链上属性只读，那么不会产生遮蔽，不会被修改；如果原型链上属性是<code v-pre>setter</code>，那么修改时是调用原型链上的<code v-pre>set</code>方法，子“类”上不产生遮蔽</strong></p>
<p>我为这几个场景简单编写了代码，附带运行结果：</p>
<p>场景一：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">let</span> f <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token literal-property property">a</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">let</span> s <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>f<span class="token punctuation">)</span></span>
<span class="line">s<span class="token punctuation">.</span>a <span class="token comment">// 1</span></span>
<span class="line">s<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span><span class="token string">"a"</span><span class="token punctuation">)</span> <span class="token comment">// false</span></span>
<span class="line">s<span class="token punctuation">.</span>a <span class="token operator">=</span> <span class="token number">2</span></span>
<span class="line">s<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span><span class="token string">"a"</span><span class="token punctuation">)</span> <span class="token comment">// true</span></span>
<span class="line">f<span class="token punctuation">.</span>a <span class="token comment">// 1</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到子“类”产生遮蔽现象，不修改父“类”属性，属性在子类身上生成；</p>
<p>场景二：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span>f<span class="token punctuation">,</span><span class="token string">"a"</span><span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">writable</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">value</span><span class="token operator">:</span><span class="token number">1</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line">f<span class="token punctuation">.</span>a<span class="token operator">=</span><span class="token number">2</span></span>
<span class="line">f<span class="token punctuation">.</span>a <span class="token comment">// 1</span></span>
<span class="line"><span class="token keyword">let</span> son <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>f<span class="token punctuation">)</span></span>
<span class="line">son<span class="token punctuation">.</span>a <span class="token comment">// 1</span></span>
<span class="line">son<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span><span class="token string">"a"</span><span class="token punctuation">)</span> <span class="token comment">// false</span></span>
<span class="line">son<span class="token punctuation">.</span>a <span class="token operator">=</span> <span class="token number">2</span></span>
<span class="line">son<span class="token punctuation">.</span>a <span class="token comment">// 1</span></span>
<span class="line">son<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span><span class="token string">"a"</span><span class="token punctuation">)</span> <span class="token comment">// false</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到属性不能够被修改，子“类”上也不产生遮蔽现象</p>
<p>场景三：</p>
<p>重点在于<code v-pre>set a</code>，子“类”上最后也没有属性<code v-pre>&quot;a&quot;</code>，即不产生遮蔽；</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">let</span> father <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">_a</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token keyword">set</span> <span class="token function">a</span><span class="token punctuation">(</span><span class="token parameter">newV</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">this</span><span class="token punctuation">.</span>_a <span class="token operator">=</span> newV<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token keyword">get</span> <span class="token function">a</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>_a<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line">father<span class="token punctuation">.</span>a <span class="token comment">// 1</span></span>
<span class="line">father<span class="token punctuation">.</span>a<span class="token operator">=</span><span class="token number">2</span></span>
<span class="line"><span class="token keyword">let</span> son <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>father<span class="token punctuation">)</span></span>
<span class="line">son<span class="token punctuation">.</span>a <span class="token comment">// 2</span></span>
<span class="line">son<span class="token punctuation">.</span>a <span class="token operator">=</span> <span class="token number">3</span></span>
<span class="line">son <span class="token comment">// {_a: 3}</span></span>
<span class="line">father<span class="token punctuation">.</span>a <span class="token comment">// 2</span></span>
<span class="line">father<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span><span class="token string">"a"</span><span class="token punctuation">)</span> <span class="token comment">// true</span></span>
<span class="line">son<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span><span class="token string">"a"</span><span class="token punctuation">)</span> <span class="token comment">// false</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但很容易意识到，<code v-pre>son</code>仍然拥有了<code v-pre>_a</code>产生了遮蔽，这看起来这个特性对日常开发没有什么影响，<code v-pre>son.hasOwnProperty(&quot;a&quot;)</code>是<code v-pre>true</code>或<code v-pre>false</code>并不值得多少关注；但这个例子也足够说明属性修改是调用父“类”的<code v-pre>set a</code>，父“类”定义了 get a / set a，a 就是 father 的自有属性；子“类”不产生遮蔽。</p>
</details>
<h2 id="摘自第五章-类" tabindex="-1"><a class="header-anchor" href="#摘自第五章-类"><span>摘自第五章-“类”</span></a></h2>
<p>现在你可能会想知道：“<em>为什么</em> 一个对象需要链到另一个对象？” 真正的好处是什么？这是一个很恰当的问题，但在我们能够完全理解和体味它是什么和如何有用之前，我们必须首先理解 <code v-pre>[[Prototype]]</code> <strong>不是</strong> 什么。</p>
<p>正如我们在第四章讲解的，在 JavaScript 中，对于对象来说没有抽象模式/蓝图，即没有面向类的语言中那样的称为类的东西。JavaScript <strong>只有</strong> 对象。</p>
<p>实际上，在所有语言中，JavaScript <strong>几乎是独一无二的</strong>，也许是唯一的可以被称为“面向对象”的语言，因为可以根本没有类而直接创建对象的语言很少，而 JavaScript 就是其中之一。</p>
<p>在 JavaScript 中，类不能（因为根本不存在）描述对象可以做什么。对象直接定义它自己的行为。<strong>这里 <em>仅有</em> 对象</strong>。</p>
<h3 id="类-函数" tabindex="-1"><a class="header-anchor" href="#类-函数"><span>“类”函数</span></a></h3>
<p>在 JavaScript 中有一种奇异的行为被无耻地滥用了许多年来 <em>山寨</em> 成某些 <em>看起来</em> 像“类”的东西。我们来仔细看看这种方式。</p>
<p>“某种程度的类” 这种奇特的行为取决于函数的一个奇怪的性质：所有的函数默认都会得到一个公有的，不可枚举的属性，称为 <code v-pre>prototype</code>，它可以指向任意的对象。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">;</span> <span class="token comment">// { }</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个对象经常被称为 “Foo 的原型”，因为我们通过一个不幸地被命名为 <code v-pre>Foo.prototype</code> 的属性引用来访问它。然而，我们马上会看到，这个术语命中注定地将我们搞糊涂。为了取代它，我将它称为 “以前被认为是 Foo 的原型的对象”。只是开个玩笑。“一个被随意标记为‘Foo 点儿原型’的对象”，怎么样？</p>
<p>不管我们怎么称呼它，这个对象到底是什么？</p>
<p>解释它的最直接的方法是，每个由调用 <code v-pre>new Foo()</code>（见第二章）而创建的对象将最终（有些随意地）被 <code v-pre>[[Prototype]]</code> 链接到这个 “Foo 点儿原型” 对象。</p>
<p>让我们描绘一下：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">Object<span class="token punctuation">.</span><span class="token function">getPrototypeOf</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>停一会来思考一下这句话的含义。</p>
<p>当通过调用 <code v-pre>new Foo()</code> 创建 <code v-pre>a</code> 时，会发生的事情之一（见第二章了解所有 <em>四个</em> 步骤）是，<code v-pre>a</code> 得到一个内部 <code v-pre>[[Prototype]]</code> 链接，此链接链到 <code v-pre>Foo.prototype</code> 所指向的对象。</p>
<p>在面向类的语言中，可以制造一个类的多个 <strong>拷贝</strong>（即“实例”），就像从模具中冲压出某些东西一样。我们在第四章中看到，这是因为初始化（或者继承）类的处理意味着，“将行为计划从这个类拷贝到物理对象中”，对于每个新实例这都会发生。</p>
<p>但是在 JavaScript 中，没有这样的拷贝处理发生。你不会创建类的多个实例。你可以创建多个对象，它们的 <code v-pre>[[Prototype]]</code> 连接至一个共通对象。但默认地，没有拷贝发生，如此这些对象彼此间最终不会完全分离和切断关系，而是 <em><strong>链接在一起</strong></em>。</p>
<p><code v-pre>new Foo()</code> 得到一个新对象（我们叫他 <code v-pre>a</code>），这个新对象 <code v-pre>a</code> 内部地被 <code v-pre>[[Prototype]]</code> 链接至 <code v-pre>Foo.prototype</code> 对象。</p>
<p><strong>结果我们得到两个对象，彼此链接。</strong> 如是而已。我们没有初始化一个对象。当然我们也没有做任何从一个“类”到一个实体对象的拷贝。我们只是让两个对象互相链接在一起。</p>
<p>事实上，这个使大多数 JS 开发者无法理解的秘密，是因为 <code v-pre>new Foo()</code> 函数调用实际上几乎和建立链接的处理没有任何 <em>直接</em> 关系。<strong>它是某种偶然的副作用。</strong> <code v-pre>new Foo()</code> 是一个间接的，迂回的方法来得到我们想要的：<strong>一个被链接到另一个对象的对象。</strong></p>
<p>我们能用更直接的方法得到我们想要的吗？<strong>可以！</strong> 这位英雄就是 <code v-pre>Object.create(..)</code>。我们过会儿就谈到它。</p>
<details class="hint-container details"><summary>省流</summary>
<p>这部分就是讲，所有的函数默认都会得到一个公有的，不可枚举的属性，称为 <code v-pre>prototype</code>，它可以指向任意的对象。同时通过函数<code v-pre>new</code>创建的对象，链接到该函数的<code v-pre>prototype</code>（当然，正如我上面说过的，对象的<code v-pre>.__proto__</code>属性指向<code v-pre>Foo.prototype</code>）。神奇的是：<code v-pre>new Foo()</code> 函数调用实际上几乎和建立链接的处理没有任何 <em>直接</em> 关系。<strong>它是某种偶然的副作用</strong>。</p>
<p>字里行间依旧紧扣重要的核心思想：<strong>“类”是拷贝，而<code v-pre>js</code>中，主要是<em>对象</em>与<em>链接</em>，这是最底层决定不同的关键</strong>。</p>
<p>这里顺便总结一下下面的部分章节内容吧，感觉写的有些太冗余了：下面有章节不摘录，它的大致意思就是说 <strong>“继承”是拷贝，数据流向画成图看起来应该是父类中的数据拷贝到子类一份</strong> ；但是 <strong>对于原型链</strong> 来说，它其实 <strong>是向上访问和<code v-pre>get</code></strong>，因此是一个查找的动作而不是数据流向， <strong>查找的方向则是自下而上，从“子类”到“父类”</strong>，两个情况方向是相反的。</p>
<p>构造器章节讲了<code v-pre>js</code>中一些让人受“构造器”困惑的设计（可以说是受“类”困惑，毕竟完全一样，<code v-pre>js</code>中没有类，当然不应该有类构造器）；其中提到：</p>
<ol>
<li>
<p>默认给了<code v-pre>.constructor</code>方法（通过对一个函数的<code v-pre>prototype</code>自动增加<code v-pre>.constructor</code>方法，并令其绑定自身，这样通过这个函数创建的所有对象都能访问到<code v-pre>.constructor</code>），但是 <strong>“constructor”并不像它看起来的那样实际意味着“被XX创建”。</strong></p>
</li>
<li>
<p>根据 JavaScript 世界中的惯例，“类”都以大写字母开头的单词命名。<strong>注意：</strong> 这个惯例是如此强大，以至于如果你在一个小写字母名称的方法上使用 <code v-pre>new</code> 调用，或并没有在一个大写字母开头的函数上使用 <code v-pre>new</code>，许多 JS 语法检查器将会报告错误。这是因为我们如此努力地想要在 JavaScript 中将（假的）“面向类” <em>搞对</em>，所以我们建立了这些语法规则来确保我们使用了大写字母，即便对 JS 引擎来讲，大写字母根本 <strong>没有任何意义</strong>。</p>
</li>
</ol>
</details>
<h4 id="构造器还是调用" tabindex="-1"><a class="header-anchor" href="#构造器还是调用"><span>构造器还是调用？</span></a></h4>
<p>函数自身 <strong>不是</strong> 构造器。但是，当你在普通函数调用前面放一个 <code v-pre>new</code> 关键字时，这就将函数调用变成了“构造器调用”。事实上，<code v-pre>new</code> 在某种意义上劫持了普通函数并将它以另一种方式调用：构建一个对象，<strong>外加这个函数要做的其他任何事</strong>。</p>
<p>举个例子:</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">NothingSpecial</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> <span class="token string">"Don't mind me!"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NothingSpecial</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">// "Don't mind me!"</span></span>
<span class="line"></span>
<span class="line">a<span class="token punctuation">;</span> <span class="token comment">// {}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>NothingSpecial</code> 仅仅是一个普通的函数，但当用 <code v-pre>new</code> 调用时，几乎是一种副作用，它会 <em>构建</em> 一个对象，并被我们赋值到 <code v-pre>a</code>。这个 <strong>调用</strong> 是一个 <em>构造器调用</em>，但是 <code v-pre>NothingSpecial</code> 本身并不是一个 <em>构造器</em>。</p>
<p>换句话说，在 JavaScrip t中，更合适的说法是，“构造器”是在前面 <strong>用 <code v-pre>new</code> 关键字调用的任何函数</strong>。</p>
<p>函数不是构造器，但是当且仅当 <code v-pre>new</code> 被使用时，函数调用是一个“构造器调用”。</p>
<h4 id="复活-构造器" tabindex="-1"><a class="header-anchor" href="#复活-构造器"><span>复活“构造器”</span></a></h4>
<p>回想我们刚才对 <code v-pre>.constructor</code> 属性的讨论，怎么看起来 <code v-pre>a.constructor === Foo</code> 为 true 意味着 <code v-pre>a</code> 上实际拥有一个 <code v-pre>.constructor</code> 属性，指向 <code v-pre>Foo</code>？<strong>不对。</strong></p>
<p>这只是一种不幸的混淆。实际上，<code v-pre>.constructor</code> 引用也 <em>委托</em> 到了 <code v-pre>Foo.prototype</code>，它 <strong>恰好</strong> 有一个指向 <code v-pre>Foo</code> 的默认属性。</p>
<p>这 <em>看起来</em> 方便得可怕，一个被 <code v-pre>Foo</code> 构建的对象可以访问指向 <code v-pre>Foo</code> 的 <code v-pre>.constructor</code> 属性。但这只不过是安全感上的错觉。它是一个欢乐的巧合，几乎是误打误撞，通过默认的 <code v-pre>[[Prototype]]</code> 委托 <code v-pre>a.constructor</code> <em>恰好</em> 指向 <code v-pre>Foo</code>。实际上 <code v-pre>.constructor</code> 意味着“被XX构建”这种注定失败的臆测会以几种方式来咬到你。</p>
<p>第一，在 <code v-pre>Foo.prototype</code> 上的 <code v-pre>.constructor</code> 属性仅当 <code v-pre>Foo</code> 函数被声明时才出现在对象上。如果你创建一个新对象，并用它替换函数默认的 <code v-pre>.prototype</code> 对象引用，这个新对象上将不会魔法般地得到 <code v-pre>.contructor</code>。</p>
<p>考虑这段代码：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* .. */</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token comment">/* .. */</span> <span class="token punctuation">}</span><span class="token punctuation">;</span> <span class="token comment">// 创建一个新的 prototype 对象</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> a1 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">a1<span class="token punctuation">.</span>constructor <span class="token operator">===</span> Foo<span class="token punctuation">;</span> <span class="token comment">// false!</span></span>
<span class="line">a1<span class="token punctuation">.</span>constructor <span class="token operator">===</span> Object<span class="token punctuation">;</span> <span class="token comment">// true!</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>Object(..)</code> 没有“构建” <code v-pre>a1</code>，是吧？看起来确实是 <code v-pre>Foo()</code> “构建了”它。许多开发者认为 <code v-pre>Foo()</code> 在执行构建，但当你认为“构造器”意味着“被XX构建”时，一切就都崩塌了，因为如果那样的话，<code v-pre>a1.constructor</code> 应当是 <code v-pre>Foo</code>，但它不是！</p>
<p>发生了什么？<code v-pre>a1</code> 没有 <code v-pre>.constructor</code> 属性，所以它沿者 <code v-pre>[[Prototype]]</code> 链向上委托到了 <code v-pre>Foo.prototype</code>。但是这个对象也没有 <code v-pre>.constructor</code>（默认的 <code v-pre>Foo.prototype</code>  对象就会有！），所以它继续委托，这次轮到了 <code v-pre>Object.prototype</code>，委托链的最顶端。<em>那个</em> 对象上确实拥有 <code v-pre>.constructor</code>，它指向内建的 <code v-pre>Object(..)</code> 函数。</p>
<p><strong>误解，消除。</strong></p>
<p>当然，你可以把 <code v-pre>.constructor</code> 加回到 <code v-pre>Foo.prototype</code> 对象上，但是要做一些手动工作，特别是如果你想要它与原生的行为吻合，并不可枚举时（见第三章）。</p>
<p>举例来说：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* .. */</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token comment">/* .. */</span> <span class="token punctuation">}</span><span class="token punctuation">;</span> <span class="token comment">// 创建一个新的 prototype 对象</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 需要正确地“修复”丢失的 `.constructor`</span></span>
<span class="line"><span class="token comment">// 新对象上的属性以 `Foo.prototype` 的形式提供。</span></span>
<span class="line"><span class="token comment">// `defineProperty(..)` 的内容见第三章。</span></span>
<span class="line">Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">,</span> <span class="token string">"constructor"</span> <span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">enumerable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">writable</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">configurable</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">value</span><span class="token operator">:</span> Foo    <span class="token comment">// 使 `.constructor` 指向 `Foo`</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修复 <code v-pre>.constructor</code> 要花不少功夫。而且，我们做的一切是为了延续“构造器”意味着“被XX构建”的误解。这是一种昂贵的假象。</p>
<p>事实上，一个对象上的 <code v-pre>.constructor</code> 默认地随意指向一个函数，而这个函数反过来拥有一个指向被这个对象称为 <code v-pre>.prototype</code> 的对象。“构造器”和“原型”这两个词仅有松散的默认含义，可能是真的也可能不是真的。最佳方案是提醒你自己，“构造器不是意味着被XX构建”。</p>
<p><code v-pre>.constructor</code> 不是一个魔法般不可变的属性。它是不可枚举的（见上面的代码段），但是它的值是可写的（可以改变），而且，你可以用你感觉合适的任何值在 <code v-pre>[[Prototype]]</code> 链上的任何对象上添加或覆盖（有意或无意地）名为 <code v-pre>constructor</code> 的属性。</p>
<p>根据 <code v-pre>[[Get]]</code> 算法如何遍历 <code v-pre>[[Prototype]]</code> 链，在任何地方找到的一个 <code v-pre>.constructor</code> 属性引用解析的结果可能与你期望的十分不同。</p>
<p>看到它的实际意义有多随便了吗？</p>
<p>结果？某些像 <code v-pre>a1.constructor</code> 这样随意的对象属性引用实际上不能被认为是默认的函数引用。还有，我们马上就会看到，通过一个简单的省略，<code v-pre>a1.constructor</code> 可以最终指向某些令人诧异，没道理的地方。</p>
<p><code v-pre>a1.constructor</code> 是极其不可靠的，在你的代码中不应依赖的不安全引用。<strong>一般来说，这样的引用应当尽量避免。</strong></p>
<details class="hint-container details"><summary>省流小结</summary>
<p>这部分和我前面小结讲到的是一样的，当然摘抄的时候我省略了一些我认为比较简单的内容，那部分内容有点重复讲解了原型链的机制（对象上查不到，就沿着原型链查，自始至终都只是这样而已，很简单不是吗），然后引出了构造器这部分内容，正如上面小结所说：“（通过对一个函数的<code v-pre>prototype</code>自动增加<code v-pre>.constructor</code>方法，并令其绑定自身，这样通过这个函数创建的所有对象都能访问到<code v-pre>.constructor</code>）”；不过这一段我依然摘抄了下来，因为它还是提到了一个很重要的内容：<strong><code v-pre>.constructor</code> 不是一个魔法般不可变的属性。它是不可枚举的（见上面的代码段），但是它的值是可写的（可以改变）</strong>，因此当我们真的是当做“类”在使用这些原型链内容，可能就会踩坑。</p>
</details>
<h2 id="摘自第五章-原型-继承" tabindex="-1"><a class="header-anchor" href="#摘自第五章-原型-继承"><span>摘自第五章-“（原型）继承”</span></a></h2>
<p>我们已经看到了一些近似的“类”机制黑进 JavaScript 程序。但是如果我们没有一种近似的“继承”，JavaScript 的“类”将会更空洞。</p>
<p>实际上，我们已经看到了一个常被称为“原型继承”的机制如何工作：<code v-pre>a</code> 可以“继承自” <code v-pre>Foo.prototype</code>，并因此可以访问 <code v-pre>myName()</code> 函数。但是我们传统的想法认为“继承”是两个“类”间的关系，而非“类”与“实例”的关系。</p>
<p>这里是一段典型的创建这样的链接的“原型风格”代码：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">Foo</span><span class="token punctuation">(</span><span class="token parameter">name</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">myName</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>name<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">function</span> <span class="token function">Bar</span><span class="token punctuation">(</span><span class="token parameter">name<span class="token punctuation">,</span>label</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">Foo</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span> <span class="token keyword">this</span><span class="token punctuation">,</span> name <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>label <span class="token operator">=</span> label<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 这里，我们创建一个新的 `Bar.prototype` 链接链到 `Foo.prototype`</span></span>
<span class="line"><span class="token class-name">Bar</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 注意！现在 `Bar.prototype.constructor` 不存在了，</span></span>
<span class="line"><span class="token comment">// 如果你有依赖这个属性的习惯的话，它可以被手动“修复”。</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">Bar</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">myLabel</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>label<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Bar</span><span class="token punctuation">(</span> <span class="token string">"a"</span><span class="token punctuation">,</span> <span class="token string">"obj a"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">a<span class="token punctuation">.</span><span class="token function">myName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "a"</span></span>
<span class="line">a<span class="token punctuation">.</span><span class="token function">myLabel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "obj a"</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>注意：</strong> 要想知道为什么上面代码中的 <code v-pre>this</code> 指向 <code v-pre>a</code>，参见第二章。</p>
<p>重要的部分是 <code v-pre>Bar.prototype = Object.create( Foo.prototype )</code>。<code v-pre>Object.create(..)</code> 凭空 <em>创建</em> 了一个“新”对象，并将这个新对象内部的 <code v-pre>[[Prototype]]</code> 链接到你指定的对象上（在这里是 <code v-pre>Foo.prototype</code>）。</p>
<p>换句话说，这一行的意思是：“做一个 <em>新的</em> 链接到‘Foo 点儿 prototype’的‘Bar 点儿 prototype ’对象”。</p>
<p>当 <code v-pre>function Bar() { .. }</code> 被声明时，就像其他函数一样，拥有一个链到默认对象的 <code v-pre>.prototype</code> 链接。但是 <em>那个</em> 对象没有链到我们希望的 <code v-pre>Foo.prototype</code>。所以，我们创建了一个 <em>新</em> 对象，链到我们希望的地方，并将原来的错误链接的对象扔掉。</p>
<p><strong>注意：</strong> 这里一个常见的误解/困惑是，下面两种方法 <em>也</em> 能工作，但是他们不会如你期望的那样工作：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 不会如你期望的那样工作!</span></span>
<span class="line"><span class="token class-name">Bar</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 会如你期望的那样工作</span></span>
<span class="line"><span class="token comment">// 但会带有你可能不想要的副作用 :(</span></span>
<span class="line"><span class="token class-name">Bar</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>Bar.prototype = Foo.prototype</code> 不会创建新对象让 <code v-pre>Bar.prototype</code> 链接。它只是让 <code v-pre>Bar.prototype</code> 成为 <code v-pre>Foo.prototype</code> 的另一个引用，将 <code v-pre>Bar</code> 直接链到 <code v-pre>Foo</code> 链着的 <strong>同一个对象</strong>：<code v-pre>Foo.prototype</code>。这意味着当你开始赋值时，比如 <code v-pre>Bar.prototype.myLabel = ...</code>，你修改的 <strong>不是一个分离的对象</strong> 而是那个被分享的 <code v-pre>Foo.prototype</code> 对象本身，它将影响到所有链接到 <code v-pre>Foo.prototype</code> 的对象。这几乎可以确定不是你想要的。如果这正是你想要的，那么你根本就不需要 <code v-pre>Bar</code>，你应当仅使用 <code v-pre>Foo</code> 来使你的代码更简单。</p>
<p><code v-pre>Bar.prototype = new Foo()</code> <strong>确实</strong> 创建了一个新的对象，这个新对象也的确链接到了我们希望的 <code v-pre>Foo.prototype</code>。但是，它是用 <code v-pre>Foo(..)</code> “构造器调用”来这样做的。如果这个函数有任何副作用（比如 logging，改变状态，注册其他对象，<strong>向 <code v-pre>this</code> 添加数据属性</strong>，等等），这些副作用就会在链接时发生（而且很可能是对错误的对象！），而不是像可能希望的那样，仅最终在 <code v-pre>Bar()</code> 的“后裔”被创建时发生。</p>
<p>于是，我们剩下的选择就是使用 <code v-pre>Object.create(..)</code> 来制造一个新对象，这个对象被正确地链接，而且没有调用 <code v-pre>Foo(..)</code> 时所产生的副作用。一个轻微的缺点是，我们不得不创建新对象，并把旧的扔掉，而不是修改提供给我们的默认既存对象。</p>
<p>如果有一种标准且可靠地方法来修改既存对象的链接就好了。ES6 之前，有一个非标准的，而且不是完全对所有浏览器通用的方法：通过可以设置的 <code v-pre>.__proto__</code> 属性。ES6中增加了 <code v-pre>Object.setPrototypeOf(..)</code> 辅助工具，它提供了标准且可预见的方法。</p>
<p>让我们一对一地比较一下 ES6 之前和 ES6 标准的技术如何处理将 <code v-pre>Bar.prototype</code> 链接至 <code v-pre>Foo.prototype</code>：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// ES6 以前</span></span>
<span class="line"><span class="token comment">// 扔掉默认既存的 `Bar.prototype`</span></span>
<span class="line"><span class="token class-name">Bar</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// ES6+</span></span>
<span class="line"><span class="token comment">// 修改既存的 `Bar.prototype`</span></span>
<span class="line">Object<span class="token punctuation">.</span><span class="token function">setPrototypeOf</span><span class="token punctuation">(</span> <span class="token class-name">Bar</span><span class="token punctuation">.</span>prototype<span class="token punctuation">,</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果忽略 <code v-pre>Object.create(..)</code> 方式在性能上的轻微劣势（扔掉一个对象，然后被回收），其实它相对短一些而且可能比 ES6+ 的方式更易读。但两种方式可能都只是语法表面现象。</p>
<details class="hint-container details"><summary>小结</summary>
<p>这部分内容相对来说看起来复杂一些，但是核心思想仍然不变，模仿类，<strong>类是拷贝</strong>，所以很简单，即使现在在讲原型链，也是在尝试原型链上“模仿拷贝”，怎么把父类的<code v-pre>Foo.prototype</code>为子“类”所用，并且像拷贝出来那样“分离”呢。所以引用赋值<code v-pre>Bar.prototype = Foo.prototype;</code>不行；<code v-pre>Bar.prototype = new Foo();</code>可以，但是同时因为执行了<code v-pre>new Foo()</code>，可能产生意料之外的副作用。因此，最后还是<code v-pre>Object.create(..)</code>；补充了<code v-pre>es6+</code>中引入的新方法：<code v-pre>Object.setPrototypeOf( Bar.prototype, Foo.prototype );</code></p>
</details>
<h3 id="考察-类-关系" tabindex="-1"><a class="header-anchor" href="#考察-类-关系"><span>考察“类”关系</span></a></h3>
<p>如果你有一个对象 <code v-pre>a</code> 并且希望找到它委托至哪个对象呢（如果有的话）？考察一个实例（一个 JS 对象）的继承血统（在 JS 中是委托链接），在传统的面向类环境中称为 <em>自省（introspection）</em>（或 <em>反射（reflection）</em>）。</p>
<p>考虑下面的代码：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span>blah <span class="token operator">=</span> <span class="token operator">...</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那么我们如何自省 <code v-pre>a</code> 来找到它的“祖先”（委托链）呢？一种方式是接受“类”的困惑：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">a <span class="token keyword">instanceof</span> <span class="token class-name">Foo</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><code v-pre>instanceof</code> 操作符的左侧操作数接收一个普通对象，右侧操作数接收一个 <strong>函数</strong>。<code v-pre>instanceof</code> 回答的问题是：<strong>在 <code v-pre>a</code> 的整个 <code v-pre>[[Prototype]]</code> 链中，有没有出现那个被 <code v-pre>Foo.prototype</code> 所随便指向的对象？</strong></p>
<p>不幸的是，这意味着如果你拥有可以用于测试的 <strong>函数</strong>（<code v-pre>Foo</code>，和它带有的 <code v-pre>.prototype</code> 引用），你只能查询某些对象（<code v-pre>a</code>）的“祖先”。如果你有两个任意的对象，比如 <code v-pre>a</code> 和 <code v-pre>b</code>，而且你想调查是否 <em>这些对象</em> 通过 <code v-pre>[[Prototype]]</code> 链相互关联，单靠 <code v-pre>instanceof</code> 帮不上什么忙。</p>
<p><strong>注意：</strong> 如果你使用内建的 <code v-pre>.bind(..)</code> 工具来制造一个硬绑定的函数（见第二章），这个被创建的函数将不会拥有 <code v-pre>.prototype</code> 属性。将 <code v-pre>instanceof</code> 与这样的函数一起使用时，将会透明地替换为创建这个硬绑定函数的 <em>目标函数</em> 的 <code v-pre>.prototype</code>。</p>
<p>将硬绑定函数用于“构造器调用”十分罕见，但如果你这么做，它会表现得好像是 <em>目标函数</em> 被调用了，这意味着将 <code v-pre>instanceof</code> 与硬绑定函数一起使用也会参照原版函数。</p>
<p>下面这段代码展示了试图通过“类”的语义和 <code v-pre>instanceof</code> 来推导 <strong>两个对象</strong> 间的关系是多么荒谬：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 用来检查 `o1` 是否关联到（委托至）`o2` 的帮助函数</span></span>
<span class="line"><span class="token keyword">function</span> <span class="token function">isRelatedTo</span><span class="token punctuation">(</span><span class="token parameter">o1<span class="token punctuation">,</span> o2</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token constant">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">    <span class="token class-name">F</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> o2<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> o1 <span class="token keyword">instanceof</span> <span class="token class-name">F</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">var</span> b <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token function">isRelatedTo</span><span class="token punctuation">(</span> b<span class="token punctuation">,</span> a <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 <code v-pre>isRelatedTo(..)</code> 内部，我们借用一个一次性的函数 <code v-pre>F</code>，重新对它的 <code v-pre>.prototype</code> 赋值，使它随意地指向某个对象 <code v-pre>o2</code>，之后问 <code v-pre>o1</code> 是否是 <code v-pre>F</code> 的“一个实例”。很明显，<code v-pre>o1</code> 实际上不是继承或遗传自 <code v-pre>F</code>，甚至不是由 <code v-pre>F</code> 构建的，所以显而易见这种做法是愚蠢且让人困惑的。<strong>这个问题归根结底是将类的语义强加于 JavaScript 的尴尬</strong>，在这个例子中是由 <code v-pre>instanceof</code> 的间接语义揭露的。</p>
<p>第二种，也是更干净的方式，<code v-pre>[[Prototype]]</code> 反射：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">isPrototypeOf</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>注意在这种情况下，我们并不真正关心（甚至 <em>不需要</em>）<code v-pre>Foo</code>，我们仅需要一个 <strong>对象</strong>（在我们的例子中被随意标志为 <code v-pre>Foo.prototype</code>）来与另一个 <strong>对象</strong> 测试。<code v-pre>isPrototypeOf(..)</code> 回答的问题是：<strong>在 <code v-pre>a</code> 的整个 <code v-pre>[[Prototype]]</code> 链中，<code v-pre>Foo.prototype</code> 出现过吗？</strong></p>
<p>同样的问题，和完全同样的答案。但是在第二种方式中，我们实际上不需要间接地引用一个 <code v-pre>.prototype</code> 属性将被自动查询的 <strong>函数</strong>（<code v-pre>Foo</code>）。</p>
<p>我们 <em>只需要</em> 两个 <strong>对象</strong> 来考察它们之间的关系。比如：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token comment">// 简单地：`b` 在 `c` 的 `[[Prototype]]` 链中出现过吗？</span></span>
<span class="line">b<span class="token punctuation">.</span><span class="token function">isPrototypeOf</span><span class="token punctuation">(</span> c <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，这种方法根本不要求有一个函数（“类”）。它仅仅使用对象的直接引用 <code v-pre>b</code> 和 <code v-pre>c</code>，来查询他们的关系。换句话说，我们上面的 <code v-pre>isRelatedTo(..)</code> 工具是内建在语言中的，它的名字叫 <code v-pre>isPrototypeOf(..)</code>。</p>
<details class="hint-container details"><summary>补充解释</summary>
<p>感觉这部分写的不是很清晰，大概只是在问一个问题：“<strong>在 <code v-pre>a</code> 的整个 <code v-pre>[[Prototype]]</code> 链中，有没有出现那个被 <code v-pre>Foo.prototype</code> 所随便指向的对象？</strong>”。提供的两个写法其实都能解决这个问题，第一个方法只是内部会有一个看起来荒谬不合理的逻辑：<code v-pre>return o1 instanceof F;</code>,这里<code v-pre>F</code>跟<code v-pre>o1</code>从“类”理论上来说根本没有任何关系， <code v-pre>o1 instanceof F</code>返回结果却是<code v-pre>true</code>；第二种方法只是换了个<code v-pre>api</code>，直接接收对象而不需要函数，但本质和方法一是一样的，正如原文所说“上面的 <code v-pre>isRelatedTo(..)</code> 工具是内建在语言中的，它的名字叫 <code v-pre>isPrototypeOf(..)</code>”。</p>
<p>总的来说，<strong>重点是怎么实现“类”关系的判断，然后顺便提到了<code v-pre>o1 instanceof F</code>返回结果是<code v-pre>true</code>的荒谬（而这就是<code v-pre>js</code>的特性导致没有类引发的）。</strong></p>
</details>
<p>我们也可以直接取得一个对象的 <code v-pre>[[Prototype]]</code>。在 ES5 中，这么做的标准方法是：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">Object<span class="token punctuation">.</span><span class="token function">getPrototypeOf</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>而且你将注意到对象引用是我们期望的：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">Object<span class="token punctuation">.</span><span class="token function">getPrototypeOf</span><span class="token punctuation">(</span> a <span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>大多数浏览器（不是全部！）还一种长期支持的，非标准方法可以访问内部的 <code v-pre>[[Prototype]]</code>：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">a<span class="token punctuation">.</span>__proto__ <span class="token operator">===</span> <span class="token class-name">Foo</span><span class="token punctuation">.</span>prototype<span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>这个奇怪的 <code v-pre>.__proto__</code>（直到 ES6 才被标准化！）属性“魔法般地”取得一个对象内部的 <code v-pre>[[Prototype]]</code> 作为引用，如果你想要直接考察（甚至遍历：<code v-pre>.__proto__.__proto__...</code>）<code v-pre>[[Prototype]]</code> 链，这个引用十分有用。</p>
<p>和我们早先看到的 <code v-pre>.constructor</code> 一样，<code v-pre>.__proto__</code> 实际上不存在于你考察的对象上（在我们的例子中是 <code v-pre>a</code>）。事实上，它和其他的共通工具在一起(<code v-pre>.toString()</code>, <code v-pre>.isPrototypeOf(..)</code>, 等等)，存在于（不可枚举地；见第二章）内建的 <code v-pre>Object.prototype</code> 上。</p>
<p>而且，<code v-pre>.__proto__</code> 虽然看起来像一个属性，但实际上将它看做是一个 getter/setter（见第三章）更合适。</p>
<p>大致地，我们可以这样描述 <code v-pre>.__proto__</code> 的实现（见第三章，对象属性的定义）：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line">Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span> <span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">,</span> <span class="token string">"__proto__"</span><span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function-variable function">get</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> Object<span class="token punctuation">.</span><span class="token function">getPrototypeOf</span><span class="token punctuation">(</span> <span class="token keyword">this</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token function-variable function">set</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">o</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// ES6 的 setPrototypeOf(..)</span></span>
<span class="line">        Object<span class="token punctuation">.</span><span class="token function">setPrototypeOf</span><span class="token punctuation">(</span> <span class="token keyword">this</span><span class="token punctuation">,</span> o <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> o<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以，当我们访问 <code v-pre>a.__proto__</code>（取得它的值）时，就好像调用 <code v-pre>a.__proto__()</code>（调用 getter 函数）一样。虽然 getter 函数存在于 <code v-pre>Object.prototype</code> 上（参照第二章，<code v-pre>this</code> 绑定规则），但这个函数调用将 <code v-pre>a</code> 用作它的 <code v-pre>this</code>，所以它相当于在说 <code v-pre>Object.getPrototypeOf( a )</code>。</p>
<p><code v-pre>.__proto__</code> 还是一个可设置的属性，就像早先展示过的 ES6 <code v-pre>Object.setPrototypeOf(..)</code>。然而，一般来说你 <strong>不应该改变一个既存对象的 <code v-pre>[[Prototype]]</code></strong>。</p>
<p>在某些允许对 <code v-pre>Array</code> 定义“子类”的框架中，深度地使用了一些非常复杂，高级的技术，但是这在一般的编程实践中经常是让人皱眉头的，因为这通常导致非常难理解/维护的代码。</p>
<p><strong>注意：</strong> 在 ES6 中，关键字 <code v-pre>class</code> 将允许某些近似方法，对像 <code v-pre>Array</code> 这样的内建类型“定义子类”。参见附录A中关于 ES6 中加入的 <code v-pre>class</code> 的讨论。</p>
<p>仅有一小部分例外（就像前面提到过的）会设置一个默认函数 <code v-pre>.prototype</code> 对象的 <code v-pre>[[Prototype]]</code>，使它引用其他的对象（<code v-pre>Object.prototype</code> 之外的对象）。它们会避免将这个默认对象完全替换为一个新的链接对象。否则，为了在以后更容易地阅读你的代码 <strong>最好将对象的 <code v-pre>[[Prototype]]</code> 链接作为只读性质对待</strong>。</p>
<p><strong>注意：</strong> 针对双下划线，特别是在像 <code v-pre>__proto__</code> 这样的属性中开头的部分，JavaScript 社区非官方地创造了一个术语：“dunder”。所以，那些 JavaScript 的“酷小子”们通常将 <code v-pre>__proto__</code> 读作“dunder proto”。</p>
<details class="hint-container details"><summary>省流</summary>
<p>这部分提到了我们早就知道的<code v-pre>__proto__</code>，它能从实例上访问到构造函数的<code v-pre>prototype</code>，即获取原型链。</p>
</details>
<h2 id="摘自第五章-对象链接" tabindex="-1"><a class="header-anchor" href="#摘自第五章-对象链接"><span>摘自第五章-对象链接</span></a></h2>
<h3 id="创建链接" tabindex="-1"><a class="header-anchor" href="#创建链接"><span>创建链接</span></a></h3>
<p>我们已经彻底揭露了为什么 JavaScript 的 <code v-pre>[[Prototype]]</code> 机制和 <em>类</em> <strong>不</strong> 一样，而且我们也看到了如何在正确的对象间创建 <strong>链接</strong>。</p>
<p><code v-pre>[[Prototype]]</code> 机制的意义是什么？为什么总是见到 JS 开发者们费那么大力气（模拟类）在他们的代码中搞乱这些链接？</p>
<p>记得我们在本章很靠前的地方说过 <code v-pre>Object.create(..)</code> 是英雄吗？现在，我们准备好看看为什么了。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> foo <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function-variable function">something</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> <span class="token string">"Tell me something good..."</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> bar <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> foo <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">bar<span class="token punctuation">.</span><span class="token function">something</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// Tell me something good...</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>Object.create(..)</code> 创建了一个链接到我们指定的对象（<code v-pre>foo</code>）上的新对象（<code v-pre>bar</code>），这给了我们 <code v-pre>[[Prototype]]</code> 机制的所有力量（委托），而且没有 <code v-pre>new</code> 函数作为类和构造器调用产生的所有没必要的复杂性，搞乱 <code v-pre>.prototype</code> 和 <code v-pre>.constructor</code> 引用，或任何其他的多余的东西。</p>
<p><strong>注意：</strong> <code v-pre>Object.create(null)</code> 创建一个拥有空（也就是 <code v-pre>null</code>）<code v-pre>[[Prototype]]</code> 链接的对象，如此这个对象不能委托到任何地方。因为这样的对象没有原形链，<code v-pre>instancof</code> 操作符（前 面解释过）没有东西可检查，所以它总返回 <code v-pre>false</code>。由于他们典型的用途是在属性中存储数据，这种特殊的空 <code v-pre>[[Prototype]]</code> 对象经常被称为“字典（dictionaries）”，这主要是因为它们不可能受到在 <code v-pre>[[Prototype]]</code> 链上任何委托属性/函数的影响，所以它们是纯粹的扁平数据存储。</p>
<p>我们不 <em>需要</em> 类来在两个对象间创建有意义的关系。我们需要 <strong>真正关心</strong> 的唯一问题是对象为了委托而链接在一起，而 <code v-pre>Object.create(..)</code> 给我们这种链接并且没有一切关于类的烂设计。</p>
<details class="hint-container details"><summary>小结</summary>
<p>这部分内容在讲解<code v-pre>Object.create()</code>的优秀之处，它为我们在对象间建立原型委托链接提供了完美的方式，并且没有其他乱七八糟的东西（就像前面讲过的<code v-pre>new</code>调用方法导致的副作用，搞乱 <code v-pre>.prototype</code> 和 <code v-pre>.constructor</code> 引用）。那么我想，可以得出一个<code v-pre>Object.create()</code>胜利的结论了，它能够基于原型链实现对象间的委托，完全不需要类的概念。（它基于原型链实现了对象间的委托链接，达到与其他语言中类继承相同的效果，但机制完全不同——<code v-pre>JS</code> 没有类，只有对象之间的链接和委托）</p>
<p>下面的内容就不是那么重要了，主要讲怎么在<code v-pre>es5</code>之前实现<code v-pre>Object.create()</code>，因为<code v-pre>Object.create()</code>是<code v-pre>es5+</code>引入的，不是特别重要，不过还是摘抄了下来，到<code v-pre>details</code>里折叠起来，可看可不看吧。这里再提一下下面折叠部分有意思的点：</p>
<ol>
<li><code v-pre>Object.create</code>的简单实现：</li>
</ol>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>Object<span class="token punctuation">.</span>create<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    Object<span class="token punctuation">.</span><span class="token function-variable function">create</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">o</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">function</span> <span class="token constant">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">        <span class="token class-name">F</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> o<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2">
<li>设计软件时可以处理一下原型链的情况，因为如果在 <code v-pre>myObject</code> 上没有 <code v-pre>cool()</code> 方法时调用 <code v-pre>myObject.cool()</code> 能工作，可能会使未来维护软件的开发者很吃惊，我们可以这样处理一下：</li>
</ol>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function-variable function">cool</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> <span class="token string">"cool!"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function-variable function">doCool</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">cool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// internal delegation!</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">doCool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "cool!"</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样至少看的时候显然<code v-pre>myObject</code>是有<code v-pre>doCool</code>方法的。</p>
</details>
<details class="hint-container details"><summary>不太重要的——在<code v-pre>es5</code>之前实现<code v-pre>Object.create()</code></summary>
<h4 id="填补-object-create" tabindex="-1"><a class="header-anchor" href="#填补-object-create"><span>填补 <code v-pre>Object.create()</code></span></a></h4>
<p><code v-pre>Object.create(..)</code> 在 ES5 中被加入。你可能需要支持 ES5 之前的环境（比如老版本的 IE），所以让我们来看一个 <code v-pre>Object.create(..)</code> 的简单 <strong>部分</strong> 填补工具，它甚至能在更老的 JS 环境中给我们所需的能力：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>Object<span class="token punctuation">.</span>create<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    Object<span class="token punctuation">.</span><span class="token function-variable function">create</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">o</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">function</span> <span class="token constant">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">        <span class="token class-name">F</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> o<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个填补工具通过一个一次性的 <code v-pre>F</code> 函数并覆盖它的 <code v-pre>.prototype</code> 属性来指向我们想连接到的对象。之后我们用 <code v-pre>new F()</code> 构造器调用来制造一个将会链到我们指定对象上的新对象。</p>
<p><code v-pre>Object.create(..)</code> 的这种用法是目前最常见的用法，因为它的这一部分是 <em>可以</em> 填补的。ES5 标准的内建 <code v-pre>Object.create(..)</code> 还提供了一个附加的功能，它是 <strong>不能</strong> 被 ES5 之前的版本填补的。如此，这个功能的使用远没有那么常见。为了完整性，让我们看看这个附加功能：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">2</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject<span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token literal-property property">enumerable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">writable</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">configurable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">value</span><span class="token operator">:</span> <span class="token number">3</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">c</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token literal-property property">enumerable</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">writable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">configurable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">value</span><span class="token operator">:</span> <span class="token number">4</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span> <span class="token string">"a"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// false</span></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span> <span class="token string">"b"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span> <span class="token string">"c"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 2</span></span>
<span class="line">myObject<span class="token punctuation">.</span>b<span class="token punctuation">;</span> <span class="token comment">// 3</span></span>
<span class="line">myObject<span class="token punctuation">.</span>c<span class="token punctuation">;</span> <span class="token comment">// 4</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>Object.create(..)</code> 的第二个参数通过声明每个新属性的 <em>属性描述符</em>（见第三章）指定了要添加在新对象上的属性。因为在 ES5 之前的环境中填补属性描述符是不可能的，所以 <code v-pre>Object.create(..)</code> 的这个附加功能无法填补。</p>
<p>因为 <code v-pre>Object.create(..)</code> 的绝大多数用途都是使用填补安全的功能子集，所以大多数开发者在 ES5 之前的环境中使用这种 <strong>部分填补</strong> 也没有问题。</p>
<p>有些开发者采取严格得多的观点，也就是除非能够被 <em>完全</em> 填补，否则没有函数应该被填补。因为 <code v-pre>Object.create(..)</code> 是可以部分填补的工具之一，所以这种较狭窄的观点会说，如果你需要在 ES5 之前的环境中使用 <code v-pre>Object.create(..)</code> 的任何功能，你应当使用自定义的工具，而不是填补，而且应当彻底远离使用 <code v-pre>Object.create</code> 这个名字。你可以定义自己的工具，比如：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">function</span> <span class="token function">createAndLinkObject</span><span class="token punctuation">(</span><span class="token parameter">o</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token constant">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">    <span class="token class-name">F</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> o<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">2</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> <span class="token function">createAndLinkObject</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span>a<span class="token punctuation">;</span> <span class="token comment">// 2</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我不会分享这种严格的观点。我完全拥护如上面展示的 <code v-pre>Object.create(..)</code> 的常见部分填补，甚至在 ES5 之前的环境下在你的代码中使用它。我将选择权留给你。</p>
<h3 id="链接作为候补" tabindex="-1"><a class="header-anchor" href="#链接作为候补"><span>链接作为候补？</span></a></h3>
<p>也许这么想很吸引人：这些对象间的链接 <em>主要</em> 是为了给“缺失”的属性和方法提供某种候补。虽然这是一个可观察到的结果，但是我不认为这是考虑 <code v-pre>[[Prototype]]</code> 的正确方法。</p>
<p>考虑下面的代码：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function-variable function">cool</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> <span class="token string">"cool!"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">cool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "cool!"</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>得益于 <code v-pre>[[Prototype]]</code>，这段代码可以工作，但如果你这样写是为了 <strong>万一</strong> <code v-pre>myObject</code> 不能处理某些开发者可能会调用的属性/方法，而让 <code v-pre>anotherObject</code> 作为一个候补，你的软件大概会变得有点儿“魔性”并且更难于理解和维护。</p>
<p>这不是说候补在任何情况下都不是一个合适的设计模式，但它不是一个在 JS 中很常见的用法，所以如果你发现自己在这么做，那么你可能想要退一步并重新考虑它是否真的是合适且合理的设计。</p>
<p><strong>注意：</strong> 在 ES6 中，引入了一个称为 <code v-pre>Proxy（代理）</code> 的高级功能，它可以提供某种“方法未找到”类型的行为。<code v-pre>Proxy</code> 超出了本书的范围，但会在以后的 <em>“你不懂 JS”</em> 系列书目中详细讲解。</p>
<p><strong>这里不要错过一个重要的细节。</strong></p>
<p>例如，你打算为一个开发者设计软件，如果即使在 <code v-pre>myObject</code> 上没有 <code v-pre>cool()</code> 方法时调用 <code v-pre>myObject.cool()</code> 也能工作，会在你的 API 设计上引入一些“魔法”气息，这可能会使未来维护你的软件的开发者很吃惊。</p>
<p>然而你可以在你的 API 设计上少用些“魔法”，而仍然利用 <code v-pre>[[Prototype]]</code> 链接的力量。</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token keyword">var</span> anotherObject <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function-variable function">cool</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span> <span class="token string">"cool!"</span> <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">var</span> myObject <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span> anotherObject <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function-variable function">doCool</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">cool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// internal delegation!</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">myObject<span class="token punctuation">.</span><span class="token function">doCool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "cool!"</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里，我们调用 <code v-pre>myObject.doCool()</code>，它是一个 <em>实际存在于</em> <code v-pre>myObject</code> 上的方法，这使我们的 API 设计更清晰（没那么“魔性”）。<em>在它内部</em>，我们的实现依照 <strong>委托设计模式</strong>（见第六章），利用 <code v-pre>[[Prototype]]</code> 委托到 <code v-pre>anotherObject.cool()</code>。</p>
<p>换句话说，如果委托是一个内部实现细节，而非在你的 API 结构设计中简单地暴露出来，那么它将倾向于减少意外/困惑。我们会在下一章中详细解释 <strong>委托</strong>。</p>
</details>
<h2 id="摘自第五章-复习" tabindex="-1"><a class="header-anchor" href="#摘自第五章-复习"><span>摘自第五章-复习</span></a></h2>
<p>当试图在一个对象上进行属性访问，而对象又没有该属性时，对象内部的 <code v-pre>[[Prototype]]</code> 链接定义了 <code v-pre>[[Get]]</code> 操作（见第三章）下一步应当到哪里寻找它。这种对象到对象的串行链接定义了对象的“原形链”（和嵌套的作用域链有些相似），在解析属性时发挥作用。</p>
<p>所有普通的对象用内建的 <code v-pre>Object.prototype</code> 作为原形链的顶端（就像作用域查询的顶端是全局作用域），如果属性没能在链条的前面任何地方找到，属性解析就会在这里停止。<code v-pre>toString()</code>，<code v-pre>valueOf()</code>，和其他几种共同工具都存在于这个 <code v-pre>Object.prototype</code> 对象上，这解释了语言中所有的对象是如何能够访问他们的。</p>
<p>使两个对象相互链接在一起的最常见的方法是将 <code v-pre>new</code> 关键字与函数调用一起使用，在它的四个步骤中（见第二章），就会建立一个新对象链接到另一个对象。</p>
<p>那个用 <code v-pre>new</code> 调用的函数有一个被随便地命名为 <code v-pre>.prototype</code> 的属性，这个属性所引用的对象恰好就是这个新对象链接到的“另一个对象”。带有 <code v-pre>new</code> 的函数调用通常被称为“构造器”，尽管实际上它们并没有像传统的面向类语言那样初始化一个类。</p>
<p>虽然这些 JavaScript 机制看起来和传统面向类语言的“初始化类”和“类继承”类似，而在 JavaScript 中的关键区别是，没有拷贝发生。取而代之的是对象最终通过 <code v-pre>[[Prototype]]</code> 链链接在一起。</p>
<p>由于各种原因，不光是前面提到的术语，“继承”（和“原型继承”）与所有其他的 OO 用语，在考虑 JavaScript 实际如何工作时都没有道理。</p>
<p>相反，“委托”是一个更确切的术语，因为这些关系不是 <em>拷贝</em> 而是委托 <strong>链接</strong>。</p>
<details class="hint-container details"><summary>核心</summary>
<p>复习部分总结的很好很清晰，没有什么要补充的，最后强调一下核心观点吧：<strong>类是拷贝，而<code v-pre>JS</code>中没有拷贝发生，对于<code v-pre>JS</code>而言，“委托”是一个更确切的术语，因为这些关系不是 <em>拷贝</em> 而是委托 <strong>链接</strong></strong></p>
</details>
<p>npm选择覆盖peer依赖的场景
冲突的peer依赖来自间接依赖（即不是根项目直接声明的依赖），且当前已安装的版本能满足依赖树中大部分依赖的要求，npm会优先保留已安装版本，覆盖冲突的peer依赖限制
冲突的版本范围属于兼容层级的差异：比如已安装依赖是v17，冲突要求v16，但npm判断该库大概率能兼容更高版本时，会触发警告而非错误
覆盖操作不会引发新的依赖冲突：当依赖树中没有其他依赖会因为这次覆盖出现版本不兼容的情况时，npm会选择覆盖</p>
</div></template>


