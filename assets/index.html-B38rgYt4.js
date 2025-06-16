import{_ as n,c as e,d as a,o as i}from"./app-C9CxlQiR.js";const l={};function p(t,s){return i(),e("div",null,s[0]||(s[0]=[a(`<h1 id="taro-小程序-react学习" tabindex="-1"><a class="header-anchor" href="#taro-小程序-react学习"><span>Taro 小程序+React学习</span></a></h1><p>这部分学习内容结合相应代码查看，目的是复习和记下使用方法，只供个人查看</p><p>大部分写法、使用方法都直接看代码就能了解，只做稍微的记录：</p><p>有类组件和函数组件两种写法，常用函数组件，两个写法都很简单，直接去看代码就知道，这里不多说。组件的调用很简单，到对应页面直接<code>import</code>，在<code>return</code>里直接使用即可</p><p>样式也很简单，基本没变，在组件、页面同目录下创建文件，然后<code>import &#39;./xxx.scss&#39;</code>引入即可</p><p><strong>重点讲一下状态管理</strong></p><p>状态管理仓库使用<code>mobx</code>，<code>store</code>文件夹下创建想要的仓库<code>js</code>文件，引入<code>mobx</code>：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { observable } from &#39;mobx&#39;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>使用它的<code>observable</code>函数创造仓库表示可观测监视，当然最后记得导出：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const counterStore = observable({</span>
<span class="line">    counter: 0,</span>
<span class="line">    increment(){</span>
<span class="line">        this.counter++;</span>
<span class="line">    },</span>
<span class="line">})</span>
<span class="line">export default counterStore;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>多个仓库可以收在一起，方便一并挂载，<code>store</code>文件夹下创建<code>index.js</code>一起存放</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import hotStore from &quot;./hot&quot;;</span>
<span class="line">import counterStore from &quot;./counter&quot;;</span>
<span class="line"></span>
<span class="line">const rootStore = {</span>
<span class="line">    counterStore,</span>
<span class="line">    hotStore</span>
<span class="line">};</span>
<span class="line">export default rootStore;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code>app.js</code>挂载，使用<code>Provide</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">function App({ children }) {</span>
<span class="line">  useLaunch(() =&gt; {</span>
<span class="line">    console.log(&#39;App launched.&#39;)</span>
<span class="line">  })</span>
<span class="line">  return (</span>
<span class="line">    &lt;Provider {...rootStore}&gt;</span>
<span class="line">        {children}</span>
<span class="line">    &lt;/Provider&gt;</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后到页面上使用，使用<code>inject</code>表示注入对应仓库，还要搭配<code>observer</code>使用：<code>observable</code> 是用来创建 / 转换状态数据的，不能直接包装组件,将普通对象、数组或类转换为可观察对象。<code>observer</code> 是 <code>MobX</code> 提供的高阶组件，用于将 <code>React</code> 组件转换为响应式组件。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const Index = ({ counterStore,hotStore })=&gt; {</span>
<span class="line">  const fetchData = ()=&gt;{</span>
<span class="line">    console.log(&#39;获取数据&#39;)</span>
<span class="line">    hotStore.getHots();</span>
<span class="line">  }</span>
<span class="line">  useEffect(() =&gt; {</span>
<span class="line">    console.log(&#39;Page loaded&#39;)</span>
<span class="line">  }, [])</span>
<span class="line">  return (</span>
<span class="line">    &lt;View className=&#39;index&#39;&gt;</span>
<span class="line">      &lt;Text&gt;{counterStore.counter}&lt;/Text&gt;</span>
<span class="line">      &lt;Button onClick={()=&gt;counterStore.increment()}&gt;+&lt;/Button&gt;</span>
<span class="line">      &lt;Button onClick={fetchData}&gt;获取热点信息&lt;/Button&gt;</span>
<span class="line">      {/* {</span>
<span class="line">        hotStore.hots.map((hot)=&gt;&lt;View key={hot.id}&gt;{hot.title}&lt;/View&gt;)</span>
<span class="line">      } */}</span>
<span class="line">      {</span>
<span class="line">        hotStore.hots.map((hot)=&gt;&lt;HotItem key={hot.id} hot={hot} /&gt;)</span>
<span class="line">      }</span>
<span class="line">    &lt;/View&gt;</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">export default inject(&#39;counterStore&#39;,&#39;hotStore&#39;)(observer(Index))</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>再重点讲一下发送请求</strong></p><p>发送请求<code>Taro</code>有自己的<code>Taro.request</code>，引入一下就能用：这里是简单的二次封装，创建<code>service</code>文件夹，下创<code>httpService.js</code>:注意<code>return</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import Taro from &quot;@tarojs/taro&quot;</span>
<span class="line"></span>
<span class="line">// option是obj，暂时先设置允许传入url、data、header</span>
<span class="line">export default {</span>
<span class="line">    request(option,method  =&#39;GET&#39;){</span>
<span class="line">        return Taro.request({</span>
<span class="line">            ...option,</span>
<span class="line">            header: {</span>
<span class="line">              &#39;content-type&#39;: &#39;application/json&#39;, // 默认值</span>
<span class="line">              ...option.header</span>
<span class="line">            },</span>
<span class="line">            success: function (res) {</span>
<span class="line">            //   console.log(res.data)</span>
<span class="line">            }</span>
<span class="line">        })</span>
<span class="line">    },</span>
<span class="line">    get(option){</span>
<span class="line">        return this.request(option,&#39;GET&#39;);</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同一目录下创建<code>index.js</code>，封装<code>api</code>——对应的方法：注意<code>return</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import httpService from &quot;./httpService&quot;;</span>
<span class="line"></span>
<span class="line">const service = {</span>
<span class="line">    getFilmList(){</span>
<span class="line">        httpService.get({</span>
<span class="line">            url:&#39;https://ghibliapi.vercel.app/films&#39;,</span>
<span class="line">        })</span>
<span class="line">    },</span>
<span class="line">    getHotList(){</span>
<span class="line">        return httpService.get({</span>
<span class="line">            url:&#39;https://v2.xxapi.cn/api/baiduhot&#39;,</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">export default service;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>注意：小程序要求所有网络请求的域名必须先在微信公众平台完成备案，否则会被拦截。</strong></p><p>报错如下：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">https://xxx 不在以下 request 合法域名列表中，请参考文档：https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html(env: Windows,mp,1.06.2412050; lib: 3.8.7)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>需要进入微信公众平台，选择小程序，开发管理-&gt;开发设置-&gt;服务器域名，在<code>request</code>合法域名中添加使用的域名，回来微信开发者工具要点右上角详情-&gt;项目配置，看着域名信息自动更新，才能正常运行</p><p>最后就可以正常使用了，进入要使用的仓库，引入、调用方法即可：注意处理返回回来的<code>promise</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { observable } from &quot;mobx&quot;;</span>
<span class="line">import service from &quot;../service&quot;;</span>
<span class="line">const hotStore = observable({</span>
<span class="line">    hots:[],</span>
<span class="line">    getHots(){</span>
<span class="line">        const result = service.getHotList();</span>
<span class="line">        console.log(result);</span>
<span class="line">        result.then(res=&gt;{</span>
<span class="line">          console.log(res);</span>
<span class="line">          this.hots.push(...res.data.data)</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line">})</span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>遇到一个之前让我放弃的问题，没想到开发了这么久又突然冒了出来，这次我找到了解决方案：</p><p>问题： 报警告：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">WXMLRT_$gwx:./base.wxml:template:213:16: Template \`tmpl_0_13\` not found.</span>
<span class="line">[WXML Runtime warning] ./base.wxml</span>
<span class="line"> Template \`tmpl_0_13\` not found.</span>
<span class="line">  375 | </span>
<span class="line">  376 | &lt;template name=&quot;tmpl_5_container&quot;&gt;</span>
<span class="line">&gt; 377 |   &lt;template is=&quot;{{xs.a(5, i.nn, l)}}&quot; data=&quot;{{i:i,cid:5,l:xs.f(l,i.nn)}}&quot; /&gt;</span>
<span class="line">      |                ^</span>
<span class="line">  378 | &lt;/template&gt;</span>
<span class="line">  379 | </span>
<span class="line">  380 | &lt;template name=&quot;tmpl_6_0&quot;&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>并且出现页面AtModal打开确认、取消按钮不显示的问题；</p><p>解决方案与流程： 找到<code>github</code>上<code>taro</code>的<code>issues</code>中有人提到<code>Taro3.6.25 开启 Prebundle 微信小程序会报 Template tmpl_0_13 not found 警告 #15493</code></p><p>可以通过搜索引擎搜索<code>Template &#39;tmpl_0_13&#39; not found</code>找到；</p><p>解决方案： 打开<code>config/index.js</code>,将</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">compiler: &#39;webpack5&#39;,</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>修改为：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">compiler: {</span>
<span class="line">    type: &#39;webpack5&#39;,</span>
<span class="line">    prebundle: {</span>
<span class="line">      enable: false,</span>
<span class="line">      include: [&#39;@taro/components&#39;],</span>
<span class="line">    },</span>
<span class="line">  },</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重新编译运行代码，重新打开微信开发者工具，代码恢复正常</p><p>问题的核心原因与Webpack5 预构建机制有关：</p><p>Webpack5 预构建的影响：</p><p>当配置compiler: &#39;webpack5&#39;时，Taro 默认启用了prebundle（预构建）功能</p><p>预构建会提前打包某些模块（如@taro/components），但可能导致以下问题：</p><p>模块加载顺序混乱：预构建模块与业务模块的加载时序不匹配</p><p>模板引用丢失：动态模板引用在预构建过程中被错误处理</p><p>组件样式隔离：预构建可能导致组件样式作用域失效</p><p>模板未找到的具体原因：</p><p>预构建过程中，Taro 可能未能正确解析base.wxml中动态引用的模板</p><p>表达式<code>{{xs.a(5, i.nn, l)}}</code>生成的模板名称在预构建时被错误处理，导致运行时无法匹配</p><p>组件显示异常的原因：</p><p>AtModal按钮不显示通常是因为：</p><p>组件样式被预构建过程隔离，未正确注入到页面</p><p>动态组件渲染逻辑在预构建环境中执行异常</p><p>三、解决方案原理说明</p><p>将配置修改为以下形式解决了问题：</p><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js"><pre><code><span class="line"><span class="token literal-property property">compiler</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;webpack5&#39;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">prebundle</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">enable</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token literal-property property">include</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&#39;@taro/components&#39;</span><span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个方案的核心是禁用 Webpack5 的预构建功能，其解决问题的逻辑如下：</p><p>关闭预构建的直接效果：</p><p>模块加载顺序恢复正常：所有模块按运行时需求动态加载，避免时序错误</p><p>模板解析回归动态模式：Taro 在运行时按需解析模板引用，确保tmpl_0_13被正确查找</p><p>组件样式作用域修复：关闭预构建后，组件样式能正确注入到页面作用域</p><p>配置参数的具体作用：</p><p>type: &#39;webpack5&#39;：保持使用 Webpack5 编译器，确保新特性支持</p><p>prebundle.enable: false：禁用预构建功能，这是解决问题的关键</p><p>prebundle.include：虽然启用了 include，但由于 enable 设为 false，该配置实际不生效</p><p>更深层的技术原理：</p><p>预构建本质是为了优化性能，但在复杂项目中可能破坏动态依赖关系</p><p>Taro 的模板系统依赖运行时动态解析，预构建的静态分析无法处理所有动态引用场景</p><p>关闭预构建后，Webpack 回归到传统的按需打包模式，确保模块和模板的动态加载能力</p>`,68)]))}const d=n(l,[["render",p]]),r=JSON.parse('{"path":"/guide/AboutTaro/","title":"Taro 小程序+React学习","lang":"zh-CN","frontmatter":{},"headers":[],"git":{"updatedTime":1750086280000,"contributors":[{"name":"李锐标","username":"","email":"1415808154@qq.com","commits":1},{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":1,"url":"https://github.com/X4M7"}],"changelog":[{"hash":"6f04d3ffa0f5ae82e07d6618a3dd6590808ce70f","time":1750086280000,"email":"1415808154@qq.com","author":"X4M7","message":"补充taro预构建导致问题解决方案"},{"hash":"602e0b1be38e4c5febc7f723fe34af31371125d9","time":1749549540000,"email":"1415808154@qq.com","author":"李锐标","message":"记录taro的学习"}]},"filePathRelative":"guide/AboutTaro/README.md"}');export{d as comp,r as data};
