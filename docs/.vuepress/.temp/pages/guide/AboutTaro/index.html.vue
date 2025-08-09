<template><div><h1 id="taro小程序-react——基础知识与正常运行须知" tabindex="-1"><a class="header-anchor" href="#taro小程序-react——基础知识与正常运行须知"><span>Taro小程序+React——基础知识与正常运行须知</span></a></h1>
<p>这部分学习内容结合相应代码查看，目的是复习和记下使用方法，只供个人查看</p>
<p>大部分写法、使用方法都直接看代码就能了解，只做稍微的记录：</p>
<p>有类组件和函数组件两种写法，常用函数组件，两个写法都很简单，直接去看代码就知道，这里不多说。组件的调用很简单，到对应页面直接<code v-pre>import</code>，在<code v-pre>return</code>里直接使用即可</p>
<p>样式也很简单，基本没变，在组件、页面同目录下创建文件，然后<code v-pre>import './xxx.scss'</code>引入即可</p>
<h2 id="状态管理-重点" tabindex="-1"><a class="header-anchor" href="#状态管理-重点"><span>状态管理（重点）</span></a></h2>
<p>状态管理仓库使用<code v-pre>mobx</code>，<code v-pre>store</code>文件夹下创建想要的仓库<code v-pre>js</code>文件，引入<code v-pre>mobx</code>：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import { observable } from 'mobx'</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>使用它的<code v-pre>observable</code>函数创造仓库表示可观测监视，当然最后记得导出：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const counterStore = observable({</span>
<span class="line">    counter: 0,</span>
<span class="line">    increment(){</span>
<span class="line">        this.counter++;</span>
<span class="line">    },</span>
<span class="line">})</span>
<span class="line">export default counterStore;</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>多个仓库可以收在一起，方便一并挂载，<code v-pre>store</code>文件夹下创建<code v-pre>index.js</code>一起存放</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import hotStore from "./hot";</span>
<span class="line">import counterStore from "./counter";</span>
<span class="line"></span>
<span class="line">const rootStore = {</span>
<span class="line">    counterStore,</span>
<span class="line">    hotStore</span>
<span class="line">};</span>
<span class="line">export default rootStore;</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code v-pre>app.js</code>挂载，使用<code v-pre>Provide</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">function App({ children }) {</span>
<span class="line">  useLaunch(() => {</span>
<span class="line">    console.log('App launched.')</span>
<span class="line">  })</span>
<span class="line">  return (</span>
<span class="line">    &lt;Provider {...rootStore}></span>
<span class="line">        {children}</span>
<span class="line">    &lt;/Provider></span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后到页面上使用，使用<code v-pre>inject</code>表示注入对应仓库，还要搭配<code v-pre>observer</code>使用：<code v-pre>observable</code> 是用来创建 / 转换状态数据的，不能直接包装组件,将普通对象、数组或类转换为可观察对象。<code v-pre>observer</code> 是 <code v-pre>MobX</code> 提供的高阶组件，用于将 <code v-pre>React</code> 组件转换为响应式组件。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const Index = ({ counterStore,hotStore })=> {</span>
<span class="line">  const fetchData = ()=>{</span>
<span class="line">    console.log('获取数据')</span>
<span class="line">    hotStore.getHots();</span>
<span class="line">  }</span>
<span class="line">  useEffect(() => {</span>
<span class="line">    console.log('Page loaded')</span>
<span class="line">  }, [])</span>
<span class="line">  return (</span>
<span class="line">    &lt;View className='index'></span>
<span class="line">      &lt;Text>{counterStore.counter}&lt;/Text></span>
<span class="line">      &lt;Button onClick={()=>counterStore.increment()}>+&lt;/Button></span>
<span class="line">      &lt;Button onClick={fetchData}>获取热点信息&lt;/Button></span>
<span class="line">      {/* {</span>
<span class="line">        hotStore.hots.map((hot)=>&lt;View key={hot.id}>{hot.title}&lt;/View>)</span>
<span class="line">      } */}</span>
<span class="line">      {</span>
<span class="line">        hotStore.hots.map((hot)=>&lt;HotItem key={hot.id} hot={hot} />)</span>
<span class="line">      }</span>
<span class="line">    &lt;/View></span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">export default inject('counterStore','hotStore')(observer(Index))</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="发送请求-重点" tabindex="-1"><a class="header-anchor" href="#发送请求-重点"><span>发送请求（重点）</span></a></h2>
<p>发送请求<code v-pre>Taro</code>有自己的<code v-pre>Taro.request</code>，引入一下就能用：</p>
<p>这里是二次封装，设置网络请求拦截器，添加了请求时的顶部栏加载动画与请求后的关闭，添加了请求附带token的设置；</p>
<p>创建<code v-pre>service</code>文件夹，下创<code v-pre>httpService.js</code>:注意<code v-pre>return</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import Taro from "@tarojs/taro"</span>
<span class="line">import { request as TaroRequest } from '@tarojs/taro';</span>
<span class="line"></span>
<span class="line">// 网络请求拦截器</span>
<span class="line">const interceptor = function (chain) {</span>
<span class="line">    const requestParams = chain.requestParams</span>
<span class="line">    const { method, data, url } = requestParams</span>
<span class="line"></span>
<span class="line">    // console.log(`http ${method || 'GET'} --> ${url} data: `, data)</span>
<span class="line"></span>
<span class="line">    // 添加加载</span>
<span class="line">    Taro.showNavigationBarLoading();</span>
<span class="line">    Taro.showLoading()</span>
<span class="line"></span>
<span class="line">    // console.log(requestParams)</span>
<span class="line">    // debugger</span>
<span class="line">    // 添加token</span>
<span class="line">    const token = Taro.getStorageSync('token')</span>
<span class="line">    // console.log(token);</span>
<span class="line">    if (token) {</span>
<span class="line">        requestParams.header = { ...requestParams.header, authorization: `Bearer ${token}` }</span>
<span class="line">    } else {</span>
<span class="line">        // console.log('请先登录')</span>
<span class="line">    }</span>
<span class="line">    // console.log(requestParams)</span>
<span class="line">    // 这里还意外发现两个console.log打印结果都是添加了token后的内容，原因是没有深拷贝， </span>
<span class="line">    // JavaScript 的 console 在打印对象时，通常会显示对象的最终状态（特别是在异步环境中）。</span>
<span class="line">    // 这是因为 console 可能会在修改对象后才渲染其内容，导致看到的两个打印结果都包含了 token。</span>
<span class="line"></span>
<span class="line">    // 顺便使用了debugger，在debugger的帮助下，第一个console.log会打印出添加token前的requestParams</span>
<span class="line"></span>
<span class="line">    return chain.proceed(requestParams)</span>
<span class="line">        .then(res => {</span>
<span class="line">            // console.log(`http &lt;-- ${url} result:`, res)</span>
<span class="line">            // 关闭加载</span>
<span class="line">            Taro.hideNavigationBarLoading()</span>
<span class="line">            Taro.hideLoading();</span>
<span class="line">            return res</span>
<span class="line">        })</span>
<span class="line">}</span>
<span class="line">Taro.addInterceptor(interceptor)</span>
<span class="line"></span>
<span class="line">// option是obj，暂时先设置允许传入url、data、header</span>
<span class="line">export default {</span>
<span class="line">    request(option, method = 'GET') {</span>
<span class="line">        return TaroRequest({</span>
<span class="line">            ...option,</span>
<span class="line">            method, // 传递 method 参数</span>
<span class="line">            header: {</span>
<span class="line">                'content-type': 'application/json', // 默认值</span>
<span class="line">                ...option.header</span>
<span class="line">            },</span>
<span class="line">            success: function (res) {</span>
<span class="line">                // console.log(res.data)</span>
<span class="line">            },</span>
<span class="line">            timeout: 5000</span>
<span class="line">        })</span>
<span class="line">    },</span>
<span class="line">    get(option) {</span>
<span class="line">        return this.request(option, 'GET');</span>
<span class="line">    },</span>
<span class="line">    post(option) {</span>
<span class="line">        return this.request(option, 'POST')</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同一目录下创建<code v-pre>index.js</code>，封装<code v-pre>api</code>——对应的方法：注意<code v-pre>return</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import httpService from "./httpService";</span>
<span class="line"></span>
<span class="line">const service = {</span>
<span class="line">    getFilmList(){</span>
<span class="line">        httpService.get({</span>
<span class="line">            url:'https://ghibliapi.vercel.app/films',</span>
<span class="line">        })</span>
<span class="line">    },</span>
<span class="line">    getHotList(){</span>
<span class="line">        return httpService.get({</span>
<span class="line">            url:'https://v2.xxapi.cn/api/baiduhot',</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">export default service;</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="注意事项-域名备案" tabindex="-1"><a class="header-anchor" href="#注意事项-域名备案"><span>注意事项：域名备案</span></a></h2>
<p><strong>注意：小程序要求所有网络请求的域名必须先在微信公众平台完成备案，否则会被拦截。</strong></p>
<p>报错如下：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">https://xxx 不在以下 request 合法域名列表中，请参考文档：https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html(env: Windows,mp,1.06.2412050; lib: 3.8.7)</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>需要进入微信公众平台，选择小程序，开发管理-&gt;开发设置-&gt;服务器域名，在<code v-pre>request</code>合法域名中添加使用的域名，回来微信开发者工具要点右上角详情-&gt;项目配置，看着域名信息自动更新，才能正常运行</p>
<p>最后就可以正常使用了，进入要使用的仓库，引入、调用方法即可：注意处理返回回来的<code v-pre>promise</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import { observable, runInAction } from "mobx";</span>
<span class="line">import service from "../service";</span>
<span class="line">const hotStore = observable({</span>
<span class="line">  hots: [],</span>
<span class="line">  async getHots() {</span>
<span class="line">    try {</span>
<span class="line">      const result = await service.getHotList();</span>
<span class="line">      // console.log(result);</span>
<span class="line">      // console.log(result.data);</span>
<span class="line">      // this.hots.push(...result.data.data);</span>
<span class="line">      if (result.data.code === 200) {</span>
<span class="line">        runInAction(() => {</span>
<span class="line">          // 在 runInAction 中修改状态</span>
<span class="line">          this.hots = result.data.data.map(item => ({</span>
<span class="line">            ...item,</span>
<span class="line">            // 如果原数据没有 id，添加唯一标识</span>
<span class="line">            id: item.id || `hot-${Date.now()}-${Math.random().toString(36).slice(2)}`</span>
<span class="line">          }));</span>
<span class="line">        });</span>
<span class="line">        return true;</span>
<span class="line">      }</span>
<span class="line">      return result.data.msg; // 因为其他原因没能获取数据，则返回原因</span>
<span class="line">      // async、await本质就是promise的语法糖，我在这里return true，但后续调用这个函数的地方收到的返回值仍然是一个promise：resolved状态，值为 true。</span>
<span class="line">      // 因为async、await内部会自动帮忙转化成promise，当然源头必须本身是promise才能处理，就像这里的await service.getHotList()，</span>
<span class="line">      // 找到源头是返回了一个request请求，返回的本身就是promise，经过这里的语法糖，继续返回的值就和promise直接的.then是一样的，返回的一直都是promise。</span>
<span class="line">    } catch (err) {</span>
<span class="line">      return err;</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">})</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">export default hotStore;</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="webpack5-预构建机制导致的问题" tabindex="-1"><a class="header-anchor" href="#webpack5-预构建机制导致的问题"><span>Webpack5 预构建机制导致的问题</span></a></h2>
<p>遇到一个之前让我放弃的问题，没想到开发了这么久又突然冒了出来，这次我找到了解决方案：</p>
<p>问题：
报警告：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">WXMLRT_$gwx:./base.wxml:template:213:16: Template `tmpl_0_13` not found.</span>
<span class="line">[WXML Runtime warning] ./base.wxml</span>
<span class="line"> Template `tmpl_0_13` not found.</span>
<span class="line">  375 | </span>
<span class="line">  376 | &lt;template name="tmpl_5_container"></span>
<span class="line">> 377 |   &lt;template is="{{xs.a(5, i.nn, l)}}" data="{{i:i,cid:5,l:xs.f(l,i.nn)}}" /></span>
<span class="line">      |                ^</span>
<span class="line">  378 | &lt;/template></span>
<span class="line">  379 | </span>
<span class="line">  380 | &lt;template name="tmpl_6_0"></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>并且出现页面<code v-pre>AtModal</code>打开确认、取消按钮不显示的问题；</p>
<p>解决方案与流程：
找到<code v-pre>github</code>上<code v-pre>taro</code>的<code v-pre>issues</code>中有人提到<code v-pre>Taro3.6.25 开启 Prebundle 微信小程序会报 Template tmpl_0_13 not found 警告 #15493</code></p>
<p>可以通过搜索引擎搜索<code v-pre>Template 'tmpl_0_13' not found</code>找到；</p>
<p>解决方案：
打开<code v-pre>config/index.js</code>,将</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">compiler: 'webpack5',</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>修改为：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">compiler: {</span>
<span class="line">    type: 'webpack5',</span>
<span class="line">    prebundle: {</span>
<span class="line">      enable: false,</span>
<span class="line">      include: ['@taro/components'],</span>
<span class="line">    },</span>
<span class="line">  },</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重新编译运行代码，重新打开微信开发者工具，代码恢复正常</p>
<p>问题的核心原因与<code v-pre>Webpack5</code>预构建机制有关：</p>
<p><code v-pre>Webpack5</code>预构建的影响：</p>
<p>当配置<code v-pre>compiler: 'webpack5'</code>时，<code v-pre>Taro</code>默认启用了<code v-pre>prebundle（预构建）</code>功能</p>
<p>预构建会提前打包某些模块（如<code v-pre>@taro/components</code>），但可能导致以下问题：</p>
<p>模块加载顺序混乱：预构建模块与业务模块的加载时序不匹配</p>
<p>模板引用丢失：动态模板引用在预构建过程中被错误处理</p>
<p>组件样式隔离：预构建可能导致组件样式作用域失效</p>
<p>模板未找到的具体原因：</p>
<p>预构建过程中，<code v-pre>Taro</code>可能未能正确解析<code v-pre>base.wxml</code>中动态引用的模板</p>
<p>表达式<code v-pre>{{xs.a(5, i.nn, l)}}</code>生成的模板名称在预构建时被错误处理，导致运行时无法匹配</p>
<p>组件显示异常的原因：</p>
<p><code v-pre>AtModal</code>按钮不显示通常是因为：</p>
<p>组件样式被预构建过程隔离，未正确注入到页面</p>
<p>动态组件渲染逻辑在预构建环境中执行异常</p>
<p>三、解决方案原理说明</p>
<p>将配置修改为以下形式解决了问题：</p>
<div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre v-pre><code><span class="line"><span class="token literal-property property">compiler</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">'webpack5'</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">prebundle</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">enable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">include</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'@taro/components'</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个方案的核心是禁用<code v-pre>Webpack5</code>的预构建功能，其解决问题的逻辑如下：</p>
<p>关闭预构建的直接效果：</p>
<p>模块加载顺序恢复正常：所有模块按运行时需求动态加载，避免时序错误</p>
<p>模板解析回归动态模式：<code v-pre>Taro</code>在运行时按需解析模板引用，确保<code v-pre>tmpl_0_13</code>被正确查找</p>
<p>组件样式作用域修复：关闭预构建后，组件样式能正确注入到页面作用域</p>
<p>配置参数的具体作用：</p>
<p><code v-pre>type: 'webpack5'</code>：保持使用<code v-pre>Webpack5</code>编译器，确保新特性支持</p>
<p><code v-pre>prebundle.enable</code>: <code v-pre>false</code>：禁用预构建功能，这是解决问题的关键</p>
<p><code v-pre>prebundle.include</code>：虽然启用了 <code v-pre>include</code>，但由于<code v-pre>enable</code>设为<code v-pre>false</code>，该配置实际不生效</p>
<p>更深层的技术原理：</p>
<p>预构建本质是为了优化性能，但在复杂项目中可能破坏动态依赖关系</p>
<p><code v-pre>Taro</code>的模板系统依赖运行时动态解析，预构建的静态分析无法处理所有动态引用场景</p>
<p>关闭预构建后，<code v-pre>Webpack</code>回归到传统的按需打包模式，确保模块和模板的动态加载能力</p>
</div></template>


