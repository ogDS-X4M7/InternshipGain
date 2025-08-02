<template><div><h1 id="首页-多标签页" tabindex="-1"><a class="header-anchor" href="#首页-多标签页"><span>首页 多标签页</span></a></h1>
<p>首页上有新闻热点、天气预报、每日英语、单词详解，还有一个使用须知，这些不同的功能当然不应该在一个页面里面展示。但是我们又不可能把他们都配置在底部栏，这样的话底部栏就有太多的内容。因此我们使用了AtTabsPane，也就是标签页，它是taro-ui中的内容。具体的使用方法直接在taro-ui官网就可以查看。因此不多赘述。</p>
<h2 id="新闻热点标签页——动态渲染热点列表、url传参链接的编码与解码" tabindex="-1"><a class="header-anchor" href="#新闻热点标签页——动态渲染热点列表、url传参链接的编码与解码"><span>新闻热点标签页——动态渲染热点列表、url传参链接的编码与解码</span></a></h2>
<p>这个页面的设计写的非常简单，是一个获取新闻热点的按钮，点击会调用获取新闻热点的方法，新闻热点的内容是存储在仓库中的，仓库的使用方法已经在前面讲过，这里不再赘述。这里的方法是校验了token来判断用户是否登录，登录的用户使用仓库中的获取热点方法来发送请求，token过期或者未登录都会提示登录</p>
<p>这种用大括号 {} 包裹的、用于嵌入表达式的区域，是 JSX 表达式插入，作用是在 JSX 语法中嵌入 JavaScript 表达式，实现动态内容渲染（如示例中的数组遍历 map 生成列表）。这是 JSX 语法的核心特性之一，允许将逻辑计算、变量、函数调用等结果直接嵌入到 UI 结构中。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;View style={{ marginTop: '10px' }}></span>
<span class="line">  &lt;AtButton type='primary' onClick={fetchData}>获取热点信息&lt;/AtButton></span>
<span class="line">  {</span>
<span class="line">    hotStore.hots.map((hot) => &lt;HotItem key={hot.id} hot={hot} toHotDetail={toHotDetail} />)</span>
<span class="line">  }</span>
<span class="line">&lt;/View></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="组件的使用" tabindex="-1"><a class="header-anchor" href="#组件的使用"><span>组件的使用</span></a></h3>
<p>可以看到嵌入语法中使用仓库中存储的新闻热点内容map遍历渲染，渲染的内容是自己写的一个组件，组件的使用方法就是在src目录下创建components目录，然后创建组件的文件夹，内有jsx和scss：
这个组件的写法如下：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import { View, Text } from "@tarojs/components";</span>
<span class="line">import React, { forwardRef } from 'react';</span>
<span class="line">import './HotItem.scss'</span>
<span class="line"></span>
<span class="line">// 使用 forwardRef 包装组件，使其支持 ref</span>
<span class="line">// 注意父组件传过来的toHotDetail，forwardRef第一个参数就是props，可以接收变量、方法</span>
<span class="line">const HotItem = forwardRef(({ hot, toHotDetail }, ref) => {</span>
<span class="line">    function getHotId() {</span>
<span class="line">        // console.log(hot.id);</span>
<span class="line">        toHotDetail &amp;&amp; toHotDetail(hot);</span>
<span class="line">    }</span>
<span class="line">    return (</span>
<span class="line">        &lt;View className="HotItem" ref={ref} onClick={getHotId}></span>
<span class="line">            &lt;View className="hot-title">{hot.title}&lt;/View></span>
<span class="line">            &lt;View className="hot-description">{hot.desc}&lt;/View></span>
<span class="line">            &lt;View className="hot-bottom"></span>
<span class="line">                &lt;View className="hot-hot">&lt;Text className="myicon myicon-hot">&lt;/Text>热度：{hot.hot}&lt;/View></span>
<span class="line">                &lt;View className="hot-url">&lt;Text className="myicon myicon-star-outline">&lt;/Text>{hot.url}&lt;/View></span>
<span class="line">            &lt;/View></span>
<span class="line">        &lt;/View></span>
<span class="line">    )</span>
<span class="line">});</span>
<span class="line"></span>
<span class="line">export default HotItem;</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到使用 forwardRef 包装组件，使其支持 ref，这是因为map遍历生成，需要有key，需要ref对应起来，和vue中v-for创建时需要key来对应是一样的，建议基本上都使用这个来包装。</p>
<p>通过代码我们也很容易看懂参数的传递和使用，那么这里就不再讲解。</p>
<h3 id="url作为链接参数出现的问题" tabindex="-1"><a class="header-anchor" href="#url作为链接参数出现的问题"><span>url作为链接参数出现的问题</span></a></h3>
<p>有一个比较重要的需要讲解的内容是，父组件向子组件传递了一个toHotDetail的方法，这个方法的内容如下：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">function toHotDetail(hot) {</span>
<span class="line">  const encodeUrl = encodeURIComponent(hot.url)</span>
<span class="line">  Taro.navigateTo({</span>
<span class="line">    url: `/pages/hot/hot?id=${hot.id}&amp;url=${encodeUrl}&amp;hot=${hot.hot}`,</span>
<span class="line">    events: {</span>
<span class="line">      // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据</span>
<span class="line">      acceptDataFromOpenedPage: function (data) {</span>
<span class="line">        console.log(data)</span>
<span class="line">      },</span>
<span class="line">    },</span>
<span class="line">    success: function (res) {</span>
<span class="line">      // 通过eventChannel向被打开页面传送数据</span>
<span class="line">      // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })</span>
<span class="line">    }</span>
<span class="line">  })</span>
<span class="line">  // redirectTo重定向，会从栈中弹出一个，再让自己入栈</span>
<span class="line">  // Taro.redirectTo({</span>
<span class="line">  //   url: '/pages/hot/hot'</span>
<span class="line">  // })</span>
<span class="line">  // console.log(hot.id)</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到它主要是实现了一个页面跳转的功能，navigateTo和redirectTo如代码中写的那样，非常简单不做赘述。前面已经知道我们是动态渲染了一个新闻热点列表，因此我们把这个方法交给子组件，这样的话子组件就可以在被点击时传回对应的新闻热点hot，来告知具体哪一个热点被用户点击。</p>
<p>这里主要是想讲一下因为页面跳转它是使用url进行的，这里是跳转到一个写好的hot页面，因此我们把它的路径填入url中，又因为url是可以携带参数在链接中的，所以我们可以通过放在链接中的参数来告知他是哪一个新闻热点被用户选中。hot页面主要是展示的新闻热点信息中具有的url链接对应的页面，因此为了展示这个页面，hot使用的是WebView，所以最主要的参数就是这个url，但我们通过链接把url作为参数去传递就出现了问题：处理url，如果直接传像“？”这类特殊字符会导致解析出问题，因此使用encodeURIComponent编码后传过来，再用decodeURIComponent解码使用</p>
<p>这里我们可以再来看一下hot页面的实现：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import React, { forwardRef } from 'react';</span>
<span class="line">import { View, Text, Button, WebView } from '@tarojs/components'</span>
<span class="line">import { useState, useEffect } from 'react';</span>
<span class="line">import { AtTag, AtButton } from 'taro-ui'</span>
<span class="line">import Taro from '@tarojs/taro';</span>
<span class="line">import './hot.scss'</span>
<span class="line"></span>
<span class="line">const Hot = forwardRef((props, ref) => {</span>
<span class="line">    // 使用state管理url</span>
<span class="line">    const [webViewUrl, setWebViewUrl] = useState('');</span>
<span class="line">    useEffect(() => {</span>
<span class="line">        console.log('Page loaded')</span>
<span class="line">        // console.log(Taro.getCurrentPages().length)// 能够显示当前页面栈深度，如果使用redirect重定向过来的，大概率就是1，这里前面是navigateto过来，所以是2</span>
<span class="line">        // console.log(Taro.getCurrentInstance().router.params)// 前面跳转可以携带params参数，这边通过router路由器来读取</span>
<span class="line">        let decodedUrl = decodeURIComponent(Taro.getCurrentInstance().router.params.url)</span>
<span class="line">        // console.log('完整URL',decodedUrl);</span>
<span class="line">        setWebViewUrl(decodedUrl)</span>
<span class="line">    }, [])</span>
<span class="line">    // function goback() {</span>
<span class="line">    //     Taro.navigateBack({</span>
<span class="line">    //         delta: 1 // 可以设置返回深度，这里是为了演示，不写也可以因为默认就是1；</span>
<span class="line">    //     })</span>
<span class="line">    // }</span>
<span class="line">    // function goToMe() {</span>
<span class="line">    //     // 如果使用navigate无法切换tab页面，会报错："errMsg":"navigateTo:fail can not navigateTo a tabbar page"</span>
<span class="line">    //     // Taro.navigateTo({ 无法跳转！！</span>
<span class="line">    //     //     url: '/pages/me/me'</span>
<span class="line">    //     // })</span>
<span class="line">    //     Taro.switchTab({</span>
<span class="line">    //         url: '/pages/me/me'</span>
<span class="line">    //     })</span>
<span class="line">    // }</span>
<span class="line">    function handleMessage() { }</span>
<span class="line">    return (</span>
<span class="line">        // &lt;View className='hot' ref={ref}></span>
<span class="line">        //     热点详情</span>
<span class="line">        //     &lt;Button onClick={goback}>点我返回&lt;/Button></span>
<span class="line">        //     &lt;Button onClick={goToMe}>点我前往个人页面&lt;/Button></span>
<span class="line">        // &lt;/View></span>
<span class="line">        // 处理url，如果直接传像“？”这类特殊字符会导致解析出问题，因此使用encodeURIComponent编码后传过来，再用decodeURIComponent解码使用</span>
<span class="line">        // webview会占满屏幕，因此不能return其他内容</span>
<span class="line">        &lt;WebView src={webViewUrl} onMessage={handleMessage} /></span>
<span class="line">    )</span>
<span class="line">})</span>
<span class="line"></span>
<span class="line">export default Hot;</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到获取params参数的方法是Taro.getCurrentInstance().router.params，解码方法是decodeURIComponent；</p>
<p>WebView只需要一个链接即可使用，注意会占满屏幕；这个页面的代码中还提到switchTab切换tab页，navigateTo不行；</p>
<p>当然其实现在回头去看也可以只通过params传一个hot.id参数，然后hot页面再去从仓库里获取对应id的url，但是直接通过链接传递的方法不需要使用仓库，运行的效率、速度会更快。</p>
<h2 id="天气预报标签页——样式统一适配-搜索城市天气、绑定设置默认城市" tabindex="-1"><a class="header-anchor" href="#天气预报标签页——样式统一适配-搜索城市天气、绑定设置默认城市"><span>天气预报标签页——样式统一适配，搜索城市天气、绑定设置默认城市</span></a></h2>
<p>相较于新闻热点，天气预报标签页要更加直接，标签页内容、方法直接写在index中，当然还是创建了weather仓库存放请求内容</p>
<h3 id="样式统一适配" tabindex="-1"><a class="header-anchor" href="#样式统一适配"><span>样式统一适配</span></a></h3>
<p>这个标签页的主要内容是样式的适配与调整，采用视窗vh，vw作为主要的样式调整单位，实现不同大小屏幕的统一适配</p>
<h3 id="支持搜索城市、绑定设置默认城市" tabindex="-1"><a class="header-anchor" href="#支持搜索城市、绑定设置默认城市"><span>支持搜索城市、绑定设置默认城市</span></a></h3>
<p>设置顶部搜索栏，提供给用户搜索省市区，展示对应天气信息：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;AtSearchBar</span>
<span class="line">  inputType='text'</span>
<span class="line">  placeholder='请输入您要查看的市/区'</span>
<span class="line">  value={city}</span>
<span class="line">  onChange={onChangeCity}</span>
<span class="line">  onActionClick={onActionClickCity}</span>
<span class="line">/></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>底部提供设置默认城市按钮，存储用户城市，下次打开自动展示该城市天气：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;View className='weatherBottom'>下方设置默认市/区，以后打开天气预报默认展示该市/区天气&lt;/View></span>
<span class="line">&lt;AtButton circle onClick={CityInToken}>设置为默认市/区&lt;/AtButton></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>注意到onChange={onChangeCity}绑定修改city，city随着用户在搜索栏中的输入而变化，内容有可能并不是正确的省市区名称，也有可能不是当前天气预报展示的省市区，而用户点击设置为默认城市时，想设置的一定是当前正在展示的城市，因此需要额外设置一个successcity，表示当前页面正在展示的省市区，也可以理解为用户最后一次成功请求的城市；</p>
<h3 id="自动展示该城市天气" tabindex="-1"><a class="header-anchor" href="#自动展示该城市天气"><span>自动展示该城市天气</span></a></h3>
<p>当用户点击保存后，将其缓存至StorageSync（相当于localstorage）</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">// 设置默认市/区存入token</span>
<span class="line">async function CityInToken() {</span>
<span class="line">  Taro.setStorageSync('defaultCity', successCity);</span>
<span class="line">  setToastOpen(true)</span>
<span class="line">  setTimeout(() => {</span>
<span class="line">    setToastOpen(false)</span>
<span class="line">  }, 1000)</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ps：可以看到这里使用了AtToast轻提示，AtMessage是非常常用且我印象比较深的内容，但AtToast也同样非常好用，这里也补充强调一下：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;AtToast isOpened={toastOpen} text="默认市/区设置成功" duration={1000}	>&lt;/AtToast></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>当用户打开该页面，先检查缓存中是否有城市：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">let defaultCity = Taro.getStorageSync('defaultCity') // 开始就要获取，和token一样，token判断获取收藏，defaultCity判断获取天气</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>如果有，通过useEffect及时发送请求，当然，要同步设置SuccessCity，否则用户在未进行任何搜索的情况下，再次点击保存默认城市将不是当前展示城市</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">useEffect(() => {</span>
<span class="line">  ......</span>
<span class="line">  if (defaultCity) {</span>
<span class="line">    setSuccessCity(defaultCity) // 如果有就设置默认市/区并发送请求获取数据</span>
<span class="line">    const res = weatherStore.getWeathers(defaultCity);</span>
<span class="line">    console.log(res);</span>
<span class="line">  }</span>
<span class="line">}, [])</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="每日英语、单词详解标签页——复用组件实现两个页面" tabindex="-1"><a class="header-anchor" href="#每日英语、单词详解标签页——复用组件实现两个页面"><span>每日英语、单词详解标签页——复用组件实现两个页面</span></a></h2>
<p>两个标签页的内容高度重合，复用组件English实现：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">{/* 每日英语 */}</span>
<span class="line">&lt;AtTabsPane current={current} index={3}></span>
<span class="line">  &lt;View></span>
<span class="line">    &lt;AtButton onClick={getEverydayEnglish}>获取每日英语知识&lt;/AtButton></span>
<span class="line">    {</span>
<span class="line">      englishTip</span>
<span class="line">        ? &lt;EnglishWeb EnglishStore={EnglishStore} word={EnglishStore.word}>&lt;/EnglishWeb></span>
<span class="line">        : &lt;View className='EnglishTip'></span>
<span class="line">          每日英语提供每日经典英语例句、词汇和短语等内容，帮助您进行英语学习，提高语言能力。当然您可以多次点击按钮来学习更多，不过学习知识，质量比数量更重要，请量力而行。</span>
<span class="line">        &lt;/View></span>
<span class="line">    }</span>
<span class="line">  &lt;/View></span>
<span class="line">&lt;/AtTabsPane></span>
<span class="line">{/* 单词详解 */}</span>
<span class="line">&lt;AtTabsPane current={current} index={4}></span>
<span class="line">  &lt;View></span>
<span class="line">    &lt;AtSearchBar</span>
<span class="line">      inputType='text'</span>
<span class="line">      placeholder='请输入您要查看的单词'</span>
<span class="line">      value={word}</span>
<span class="line">      onChange={onChangeWord}</span>
<span class="line">      onActionClick={onActionClickWord}</span>
<span class="line">    /></span>
<span class="line">    {</span>
<span class="line">      WordStore.word</span>
<span class="line">        ? &lt;EnglishWeb EnglishStore={WordStore} word={WordStore.word}>&lt;/EnglishWeb></span>
<span class="line">        : null</span>
<span class="line">    }</span>
<span class="line">  &lt;/View></span>
<span class="line">&lt;/AtTabsPane></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到每日英语是通过顶部按钮获取内容，单词详解则是由用户通过搜索栏搜索获取内容，由于设计上的样式等相同，都复用EnglishWeb组件，但需要区分两个仓库EnglishStore和WordStore存放对应请求得到的信息，这样保证两个页面各自展示对应内容，互不干扰</p>
<h3 id="支持播放英式、美式音频" tabindex="-1"><a class="header-anchor" href="#支持播放英式、美式音频"><span>支持播放英式、美式音频</span></a></h3>
<p>播放音频使用Taro.createInnerAudioContext创建，曾经出现过播放音频错误、阻塞等问题，是由于没有及时准确调整音频内容导致：</p>
<p>使用useEffect及时监听对应仓库内容变化，及时更新渲染页面内容</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const EnglishWeb = forwardRef(({ EnglishStore, word }, ref) => {</span>
<span class="line">  let UKAudio = Taro.createInnerAudioContext({ useWebAudioImplement: true }) // 创建英式发音音频</span>
<span class="line">  let USAudio = Taro.createInnerAudioContext() // 创建美式发音音频</span>
<span class="line">  // 播放英式发音音频</span>
<span class="line">  function playUKAudio() {</span>
<span class="line">    // UKAudio.src = EnglishStore.ukspeech;</span>
<span class="line">    // console.log('播放音频',UKAudio.src);</span>
<span class="line">    UKAudio.play();</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  // 播放美式发音音频</span>
<span class="line">  function playUSAudio() {</span>
<span class="line">    // USAudio.src = EnglishStore.usspeech;</span>
<span class="line">    USAudio.play();</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  useEffect(() => {</span>
<span class="line">    // console.log('Page loaded')</span>
<span class="line">    UKAudio.src = EnglishStore.ukspeech;</span>
<span class="line">    USAudio.src = EnglishStore.usspeech;</span>
<span class="line">  }, [word])</span>
<span class="line">  return (</span>
<span class="line">    ......</span>
<span class="line">  )</span>
<span class="line">});</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="支持搜索单词" tabindex="-1"><a class="header-anchor" href="#支持搜索单词"><span>支持搜索单词</span></a></h3>
<p>搜索单词的实现与搜索城市天气基本相同，但更简单，因为不需要保留默认内容</p>
</div></template>


