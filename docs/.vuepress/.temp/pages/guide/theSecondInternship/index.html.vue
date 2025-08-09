<template><div><h1 id="实习杂记" tabindex="-1"><a class="header-anchor" href="#实习杂记"><span>实习杂记</span></a></h1>
<p>来到大厂实习后，学到了很多东西，但是规范和约束也非常多，所以可能不能像之前那样详细记录了，不过有些知识点的收获还是可以写一下：</p>
<h2 id="项目设计——防耦合" tabindex="-1"><a class="header-anchor" href="#项目设计——防耦合"><span>项目设计——防耦合</span></a></h2>
<p>为了项目的长期顺利运行，设计编写代码时需要考虑解耦：</p>
<p>简单来说，每个模块的功能都要尽可能做到可拆分，与无关的代码尽量减少联系，比如实现一个a功能，通常是编写一个组件，或者复用组件，为了实现功能可能会有很多的判断细节，可能判断的条件在在调用这个组件的父组件中，但是不应该把判断逻辑交给父组件，而是尽量都放到组件内实现，这就是解耦，其实也是为了尽可能地实现代码的可复用性，毕竟如果这个组件的a功能需要依托其父组件进行大量的判断，那么其他代码想要复用的话又得重复这部分判断，显然不合适。</p>
<h2 id="项目设计——方案评审与用户体验" tabindex="-1"><a class="header-anchor" href="#项目设计——方案评审与用户体验"><span>项目设计——方案评审与用户体验</span></a></h2>
<p>来到这边，自己也写过一些技术方案，参与了技术评审，其中遇到一个比较细节的点，大概就是a功能是判别用户点击或滑动来实现一个弹窗提醒，这是产品需求。</p>
<p>我当时看到的时候觉得没有什么问题，但是当自己实现后去自测，就会发现不合理的点，比如点击退出，也要弹窗，这是很不合理的。</p>
<p>其实如果从用户角度出发，会更快更容易意识到这个需求的不合理性，点击是一个很基础很广泛的交互逻辑，用户在页面上想要进行任何操作都要点击，但是如果点击后的第一个反应变成强制弹窗，很可能和用户的预期不符，造成用户体验不良。</p>
<p>最后需求改为了用户浏览x秒后弹窗，实现起来更简单，但用户体验更良好是最重要的。</p>
<h2 id="居中样式的副作用" tabindex="-1"><a class="header-anchor" href="#居中样式的副作用"><span>居中样式的副作用</span></a></h2>
<p>居中样式是非常常见的面试题，其中<code v-pre>left:50%;transform: translateX(-50%)</code>也是其中最常见的写法之一。但是我从来没有想过，这样的写法会压缩盒子的最大宽度；</p>
<p>其实原理和逻辑我都懂，这也是我在遇到这个有些诡异的情况的时候最后能够想明白的原因。<code v-pre>transform</code>实现元素移动可以说是最高效的，因为<code v-pre>transform</code>既不会影响布局，也不会影响绘制指令。他是直接在画出画面的阶段完成。把内容渲染到页面上一般是要分成8个步骤，它包括<code v-pre>HTML</code>的解析。样式的计算、布局、分层、生成绘制指令、分块、光栅化和画。因此一些页面的元素进行移动旋转等操作的时候，<code v-pre>transform</code>是一种非常好的实现方式，因此也是非常常用的实现方式。但恰恰是它的这个特性导致了盒子的样式经历了left:50%之后就可以渲染，然后得到了一个最多只有屏幕宽度一半的盒子，并且通过<code v-pre>transform</code>移动居中之后盒子的宽度也是不变的，因为正如刚刚原理所说，它是指影响最后的一个步骤，也就是画的步骤，他并不干扰样式的计算，不干扰<code v-pre>dom</code>的布局。</p>
<p>这些原理都很简单，我也都知道。但是从来没有考虑过他会造成这样的一个结果。解决它的办法也并不复杂，最后我是通过强制不换行<code v-pre>whitespace:nowrap</code>来保证我设计的内容不会因为盒子的长度只有屏幕的一半不够长而出现换行的非预期情况。</p>
<h2 id="可能的内存泄漏——逻辑的必然与锁的解决" tabindex="-1"><a class="header-anchor" href="#可能的内存泄漏——逻辑的必然与锁的解决"><span>可能的内存泄漏——逻辑的必然与锁的解决</span></a></h2>
<p>在实现第二个弹窗功能时，由于弹窗是组件复用的，所以对于不同情况下展现的不同弹窗内容是由对应的信号控制。这些信号通常就是标志着某种特定情景的发生，因为只有在某种特定情景下，弹窗会显示特定的样式内容。而对于所谓的某种特定情形是通过父组件调用组件并传递参数<code v-pre>A</code>给子组件得到的。由于之前的代码逻辑在一些特定情形下组件会被提前挂载，所以对于所需的这个参数<code v-pre>A</code>，需要监听来保证能够获取正确的内容。</p>
<p>这样的设计跟之前是相同的，不会有什么问题。但是第二个需求提出了对特定情况进行处理，而解决它的方式是组件通信。组件通信的方式有很多，这个地方采取的是事件总线，这就意味着需要使用<code v-pre>buson</code>，而为了保证是事件总线能够监听到另一个组件发送的通信信息<code v-pre>B</code>，通常在这个组件挂载的时候，我们会<code v-pre>buson</code>来进行监听，这个操作应该可以说是刻不容缓的，因为如果<code v-pre>buson</code>的监听稍微晚挂载上去，那么很有可能另一个组件发送的通信信息<code v-pre>B</code>不能够及时被监听到，所以说这个监听会被放在逻辑的最外层实现。</p>
<p>上面已经讲完了需求的情景和面临的情况，可以看到对于弹窗内容控制信号需要由参数<code v-pre>A</code>和通信信息<code v-pre>B</code>共同决定，而正如上面的逻辑所说，<code v-pre>A</code>是需要监听。而<code v-pre>B</code>作为通信信息需要放在逻辑的最外层实现。所以说就出现了一个问题。<code v-pre>B</code>在最外层监听通信信息。然后回调函数来触发<code v-pre>A</code>的监听和判断，我出现这个情况，那么就有可能<code v-pre>B</code>监听到通信信息的多次改变，多次调用回调函数，那么就会出现对<code v-pre>A</code>的多次监听，多次监听多次<code v-pre>watch</code>会造成<strong>内存泄漏</strong>的问题。</p>
<p>由于js并没有实现对<code v-pre>watch</code>的卸载类似的操作，所以对于重复监听，重复<code v-pre>watch</code>解决方案一般只有将监听放在逻辑外层处理，<strong>尽可能不要在回调中进行<code v-pre>watch</code></strong>。</p>
<p>但很明显由于逻辑的问题，我们不得不把对于参数<code v-pre>A</code>的<code v-pre>watch</code>放在通信信息<code v-pre>B</code>的回调函数内，但是对需求进行分析。我们可以了解到对于通信信息<code v-pre>B</code>的获取其实只需要一次。也就是说<code v-pre>buson</code>的挂载可以只监听一次，监听完获取完后可以将它卸载。当然卸载确实是解决了这个问题，但是如果说在短时间内多次触发了<code v-pre>buson</code>的监听，回调函数被多次触发。在卸载之前回调函数的多次<code v-pre>watch</code>仍然被执行，那么还是没有解决内存泄漏的问题。</p>
<p>应对这种情况，我使用锁来解决，也是进程的占用的实现，设计一个<code v-pre>watched</code>信号初始化为<code v-pre>false</code>，当<code v-pre>buson</code>的回调函数被触发，立即对监听得到的值和<code v-pre>watched</code>信号进行判断，只有<code v-pre>watched</code>信号为<code v-pre>false</code>时才能够继续执行下去，而如果能够继续执行下去，第一件事就是将<code v-pre>watched</code>信号置为<code v-pre>true</code>，那么即使后续有连续的多次回调函数被触发，也会由于这个信号实现进程的占用保证回调函数只执行一次，并且我在实现的时候，第二件事做的是之前所说的将<code v-pre>buson</code>的事件监听卸载掉，也就是<code v-pre>busoff</code>，这相当于实现了第二重保障，虽然他的效力没有刚刚的锁那么强，但是仍然是一个非常有效的手段，并且有利于资源的节约。</p>
<p>那么这个实现的收获是：<strong>应该尽可能不在回调中<code v-pre>watch</code>，但如果逻辑上需要实现，那么可以通过锁来解决。</strong></p>
<h2 id="npm-link" tabindex="-1"><a class="header-anchor" href="#npm-link"><span>npm link</span></a></h2>
<p>项目区分依赖的<code v-pre>npm</code>包和小程序，但开发的时候两边要同时进行，这个时候就需要<code v-pre>npm link</code>，因为个人项目不会有这种需求，所以我也是第一次接触。</p>
<p><code v-pre>npm link</code>是将未发布的<code v-pre>npm</code>包也就是本地的代码生成一个软链接，所需要进入想要生成软链接的代码目录下使用指令<code v-pre>npm link</code>即可；</p>
<p>而需要使用到这个未发布的<code v-pre>npm</code>包的小程序则是使用<code v-pre>npm link @xxxx/yyyy</code>来完成对本地软链接的依赖引入。用的链接引入后，在对未发布的<code v-pre>npm</code>包本地代码进行的修改，能够被同步到链接它的项目中，非常方便。</p>
<p>在这个使用期间还遇到一些问题，我分析后很快就得到结论，并且验证成功了。</p>
<p>这个问题是当我使用<code v-pre>npm link</code>生成软链接后在小程序里引入，但是似乎都没有体现出最新版本的特性，于是经过查找，我发现可以使用这条命令:<code v-pre>npm ls &lt;package_name&gt;</code>，它能够以树形结构打印出要查看包的所有版本，以及它们的依赖关系，箭头会指向本地链接的实际路径，而如果像我一样使用<code v-pre>nvm</code>管理<code v-pre>Node</code>版本，路径里就会显示使用的版本：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">your-project@1.0.0 D:\your-project</span>
<span class="line">└── /Users/yourname/.nvm/versions/node/v18.18.0/lib/node_modules/xxx/yyy  # 箭头指向本地包实际路径</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>也是因为这个，我发现在<code v-pre>npm</code>包本地代码生成软链接时使用的<code v-pre>Node</code>版本和小程序的代码里使用的版本是不同的，这导致了引入时没有使用到正确的软链接，也就不是最新版本。所以及时统一到同样的node版本后项目就正常运行了。</p>
<h2 id="项目上线" tabindex="-1"><a class="header-anchor" href="#项目上线"><span>项目上线</span></a></h2>
<h3 id="冲突与合并的处理" tabindex="-1"><a class="header-anchor" href="#冲突与合并的处理"><span>冲突与合并的处理</span></a></h3>
<h3 id="插曲——ts类型修复" tabindex="-1"><a class="header-anchor" href="#插曲——ts类型修复"><span>插曲——ts类型修复</span></a></h3>
<p>eslint检测ts自动推断</p>
<h3 id="npm的最新版本查看" tabindex="-1"><a class="header-anchor" href="#npm的最新版本查看"><span>npm的最新版本查看</span></a></h3>
<p><code v-pre>npm view &lt;package_name&gt; versions</code></p>
<h2 id="壳" tabindex="-1"><a class="header-anchor" href="#壳"><span>壳</span></a></h2>
<p>正如前面所讲到的，项目区分依赖的<code v-pre>npm</code>包和小程序，其中这些<code v-pre>npm</code>包被统一放到一个大型的项目里，其实这个项目就是“壳”。壳是各个包外的一个容器，它能够一定程度上统一限制依赖的版本，这个在后面会具体地分析。</p>
<h2 id="npm依赖的使用与思考" tabindex="-1"><a class="header-anchor" href="#npm依赖的使用与思考"><span>npm依赖的使用与思考</span></a></h2>
</div></template>


