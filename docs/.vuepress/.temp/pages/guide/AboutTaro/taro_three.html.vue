<template><div><h1 id="短视频播放页——包含普通播放和历史播放-实现播放页复用" tabindex="-1"><a class="header-anchor" href="#短视频播放页——包含普通播放和历史播放-实现播放页复用"><span>短视频播放页——包含普通播放和历史播放，实现播放页复用</span></a></h1>
<h2 id="播放页复用-查看历史、点赞、收藏播放" tabindex="-1"><a class="header-anchor" href="#播放页复用-查看历史、点赞、收藏播放"><span>播放页复用，查看历史、点赞、收藏播放</span></a></h2>
<p>通过仓库设置clickUrl，用于存放用户从历史/点赞/收藏中选中某个视频的url，这个url不为空的同时也说明用户进入了历史播放模式，屏幕底部中间会出现退出历史模式的按钮</p>
<h2 id="支持手势设置亮度、音量、全屏播放" tabindex="-1"><a class="header-anchor" href="#支持手势设置亮度、音量、全屏播放"><span>支持手势设置亮度、音量、全屏播放</span></a></h2>
<p>taro的video本身就支持这些属性设置，查找官方文档还有更多</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;Video</span>
<span class="line">  className='videobox'</span>
<span class="line">  id='video'</span>
<span class="line">  src={videosrc}</span>
<span class="line">  // src='https://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&amp;bizid=1023&amp;hy=SH&amp;fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'</span>
<span class="line">  // poster='https://misc.aotu.io/booxood/mobile-video/cover_900x500.jpg' // 封面-不需要</span>
<span class="line">  initialTime={0}</span>
<span class="line">  controls={true}</span>
<span class="line">  autoplay={true}</span>
<span class="line">  loop={false}</span>
<span class="line">  muted={false}</span>
<span class="line">  enablePlayGesture={true} // 非全屏下进度拖动手势</span>
<span class="line">  vslideGesture={true} // 非全屏下亮度和音量手势</span>
<span class="line">/></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="支持使用播放上一个、下一个视频" tabindex="-1"><a class="header-anchor" href="#支持使用播放上一个、下一个视频"><span>支持使用播放上一个、下一个视频</span></a></h2>
<p>使用栈存储播放视频的url，按序进栈，index作为当前指针，实现播放上一个视频，当index指向栈底提示已经是第一个视频；播放下一个视频且index指向栈顶则发送请求获取url进栈，否则按序播放；</p>
<h2 id="支持查看历史播放记录、支持清空历史记录" tabindex="-1"><a class="header-anchor" href="#支持查看历史播放记录、支持清空历史记录"><span>支持查看历史播放记录、支持清空历史记录</span></a></h2>
<p>设置定时器，每个视频播放5秒则发送更新历史记录请求，切换视频清空定时器重新计时，发送请求携带参数为token和当前播放url；</p>
<p>后端设置更新历史记录有查重功能，相同视频保留最新的浏览记录</p>
<p>历史播放记录的功能建立在用户登录的前提下，如果用户还未登录，则播放视频时不发送更新历史记录的请求。</p>
<p>同样还支持清空历史记录。查看历史记录，点赞收藏的功能与个人页紧密相关，因此这部分的详细讲解放在个人页中。（##这里填写个人页讲解部分的链接）</p>
<h2 id="支持点赞、收藏-支持校验点赞、收藏-收藏按钮准确校验" tabindex="-1"><a class="header-anchor" href="#支持点赞、收藏-支持校验点赞、收藏-收藏按钮准确校验"><span>支持点赞、收藏，支持校验点赞、收藏，收藏按钮准确校验</span></a></h2>
<p>点赞和收藏在功能上高度相似，一起讲解：</p>
<p>设置点赞收藏按钮，如果视频已点赞/收藏，则对应按钮显示为实心样式，否则为空心样式；用户点赞/取消点赞实时改变，并且设置轻提示反馈交互</p>
<p>因为点赞/取消点赞是样式改变的同一个按钮，因此传参时，除了携带tokne和视频url，还需要额外携带一个信号参数，1表示点赞，0表示取消点赞，后端设置了相应的校验</p>
<p>其中点击点赞、收藏除了发送请求传递给后端数据库，内存中也存放对应的url列表，获取视频（上一个、下一个）时会进行校验，如果是点赞过、收藏过的视频，则点赞、收藏按钮的状态是与之对应的。</p>
<p><strong>关于点赞与收藏的设计思路</strong>上，通过观察市场常见视频软件，收藏数量一般较少，校验不能出错，但点赞数量通常较多，数据量大，校验经常不正确；一个历史点赞过的视频，后续刷到可能显示是未点赞的状态；</p>
<p>因此，点赞记录是实时存储内存中，如果用户没有专门获取点赞记录的情况下，允许刷到历史点赞过的视频，但其点赞按钮未亮起；即内存中的点赞列表不需与数据库保持同步，可以只与当次使用、当天使用保持一致；</p>
<p>但收藏记录必须保持一致，在用户登录、进入小程序的同时就要求发送请求获取用户收藏列表，保证内存的收藏列表与数据库一致，每一个收藏过的视频刷到时都能准确显示收藏按钮的样式</p>
<p>当然这些功能都是建立在用户已经登录的前提下，如果用户还未登录，使用点赞收藏的话会提示请先登录。</p>
<h2 id="支持点赞收藏按钮的节流" tabindex="-1"><a class="header-anchor" href="#支持点赞收藏按钮的节流"><span>支持点赞收藏按钮的节流</span></a></h2>
<p>设置了点赞收藏按钮的节流信号，当用户快速点击按钮时，如果当次操作还未完成，则提示操作过快。</p>
<h2 id="点赞实现时遇到常见的一个小问题" tabindex="-1"><a class="header-anchor" href="#点赞实现时遇到常见的一个小问题"><span>点赞实现时遇到常见的一个小问题</span></a></h2>
<p>报错</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">[MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: ObservableObject@4.likeSignal</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>原因是仓库中修改this.likeSignal（点赞信号）没有在action中修改，这个报错还是比较常见的，需要给自己强调这些state类型信号的更新应该放到action里，这其实跟vue的vuex、pinia是很像的，它们内部都有aciton-&gt;mutation（pinia省略这个环节）-&gt;state的更新流程，也可以理解为是放在action里才允许修改state的值的表现，关于上面报错的解决方法：</p>
<p>将所有修改状态的语句都用runInAction(()=&gt;{xxx})包起来即可，runInAction就是顾名思义，里面的代码相当于在action中运行，action中可以修改state。</p>
</div></template>


