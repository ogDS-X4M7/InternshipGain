import{_ as s,c as e,d as a,o as l}from"./app-BviTu2rp.js";const i={};function t(c,n){return l(),e("div",null,n[0]||(n[0]=[a(`<h1 id="快速上手项目三——登录后查看内容" tabindex="-1"><a class="header-anchor" href="#快速上手项目三——登录后查看内容"><span>快速上手项目三——登录后查看内容</span></a></h1><h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2><p>这次接手的项目是公司的知识库，但是之前设置的登录权限是对知识库进行编辑、增加，而未登录用户也可以查看，只是不能修改或增加知识。而现在的需求是想要让未登录用户不能查看知识库。</p><p>完成的过程中走了一些弯路，因为这也是刚刚接手的项目。在需求交接的过程中，我了解到后端是希望减少请求，就是非登录用户<code>不能请求</code>知识库的内容，不然会有很多未登录的其他人在不停地发送请求。页面中知识库分为两个部分，左侧是菜单栏，右侧是对应的内容。我最开始的想法是，如果用户未登录，就将内容部分不做展示，而是提示需要登录后才能查看知识库，于是做了一个新的<em>卡片</em>，内容是提示登录，和原先的内容<em>卡片</em>通过<code>v-if</code>和<code>v-else</code>来分不同情况展示：获取本地token判断用户是否登录，登录后才显示知识。很顺利就完成了，虽然菜单栏仍然可以点击修改，但未登录情况下内容部分只会展示我做的那张用于提示用户登录的<em>卡片</em>。</p><p>到这里简单的需求就已经完成了，不过我想起交接时后端人员的意思似乎是不想要未登录用户发送请求，也许是想减轻服务器的负荷。于是我查看浏览器<code>开发者工具</code>-&gt;<code>网络</code>，看到了请求是随着菜单的选项而发送的，于是我又用<code>v-if</code>隐藏了菜单，结果仍然看到有一个关于知识库内容的请求发送了，是默认根据菜单第一个选项进行的内容请求。为了连这个请求也不发送，并且优化刚刚的实现：之前是对两个模块做<code>v-if</code>和<code>v-else</code>，并且它们的上层模块其实也只由这两个模块组成。我干脆直接对上层模块做<code>v-if</code>和<code>v-else</code>的处理，只需判断一次，这两个子模块就不需要判断是否渲染了。把之前写好的新<em>卡片</em>移到上层模块这边来，这样做之后，未登录时上层模块不渲染，子模块当然也不渲染，更不会发送请求，而登录后，由于之前这个项目就做了页面刷新，因此内容也能正常显示，再退出模块又会切换为登录提示的<em>卡片</em>，至此需求圆满完成。</p><p>于是根据上面的操作与分析，最终对代码的修改非常简单： 原代码：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div id=&quot;content-layout&quot;&gt;</span>
<span class="line">    &lt;a-row type=&quot;flex&quot; justify=&quot;center&quot;&gt;</span>
<span class="line">      &lt;a-col span=&quot;4&quot;&gt;</span>
<span class="line">        &lt;Menu /&gt;</span>
<span class="line">      &lt;/a-col&gt;</span>
<span class="line">      &lt;a-col span=&quot;14&quot;&gt;</span>
<span class="line">        &lt;div class=&quot;content-layout-right&quot;&gt;</span>
<span class="line">          &lt;router-view&gt;&lt;/router-view&gt;</span>
<span class="line">        &lt;/div&gt;</span>
<span class="line">      &lt;/a-col&gt;</span>
<span class="line">    &lt;/a-row&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line">&lt;script&gt;</span>
<span class="line">import Menu from &quot;@/components/Menu.vue&quot;;</span>
<span class="line">export default {</span>
<span class="line">  components: {</span>
<span class="line">    Menu,</span>
<span class="line">  },</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修改后：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div id=&quot;content-layout&quot;&gt;</span>
<span class="line">    &lt;a-row type=&quot;flex&quot; justify=&quot;center&quot;  v-if=&quot;loginflag&quot;&gt;</span>
<span class="line">      &lt;a-col span=&quot;4&quot;&gt;</span>
<span class="line">        &lt;Menu /&gt;</span>
<span class="line">      &lt;/a-col&gt;</span>
<span class="line">      &lt;a-col span=&quot;14&quot;&gt;</span>
<span class="line">        &lt;div class=&quot;content-layout-right&quot;&gt;</span>
<span class="line">          &lt;router-view&gt;&lt;/router-view&gt;</span>
<span class="line">        &lt;/div&gt;</span>
<span class="line">      &lt;/a-col&gt;</span>
<span class="line">    &lt;/a-row&gt;</span>
<span class="line">    &lt;a-row  type=&quot;flex&quot; justify=&quot;center&quot; v-if=&quot;!loginflag&quot;&gt;</span>
<span class="line">      &lt;h3&gt;知识库内容需登录后查看&lt;/h3&gt;</span>
<span class="line">    &lt;/a-row&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line">&lt;script&gt;</span>
<span class="line">import Menu from &quot;@/components/Menu.vue&quot;;</span>
<span class="line">import {ref,onMounted} from &quot;vue&quot;</span>
<span class="line">export default {</span>
<span class="line">  components: {</span>
<span class="line">    Menu,</span>
<span class="line">  },</span>
<span class="line">  setup(){</span>
<span class="line">    let loginflag=ref(false)</span>
<span class="line">    onMounted(()=&gt;{</span>
<span class="line">      loginflag.value = localStorage.getItem(&#39;token&#39;)!==null;</span>
<span class="line">    })</span>
<span class="line">    return{</span>
<span class="line">      loginflag</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>总结来说就是：对知识库设置登录后查看内容，或者按我的实现思路来说，是取消未登录用户的渲染与请求。</p><p>这次的收获是：明确需求，并且多对项目结构做分析，也许能够给出更快捷合理的解决方案。</p>`,12)]))}const p=s(i,[["render",t]]),o=JSON.parse('{"path":"/guide/theFirstInternship/gain4.html","title":"快速上手项目三——登录后查看内容","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"需求与完成","slug":"需求与完成","link":"#需求与完成","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"updatedTime":1748538854000,"contributors":[{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":4,"url":"https://github.com/X4M7"},{"name":"李锐标","username":"","email":"1415808154@qq.com","commits":1}],"changelog":[{"hash":"db31e1a3432e448ae4da377191cf77d861406181","time":1748538854000,"email":"1415808154@qq.com","author":"X4M7","message":"基本完成Excel导出工具的讲解"},{"hash":"390433b836f920dd5fc5d1ea558f635897d565cd","time":1748322406000,"email":"1415808154@qq.com","author":"李锐标","message":"完善实习一内容，新增运行自动打开页面配置"},{"hash":"f0afb6a4e7d14e13cfcfea06153ad2cf8255c3fa","time":1748186909000,"email":"1415808154@qq.com","author":"X4M7","message":"优化一些表达和格式"},{"hash":"4215c19d7a3adc5ad3c57e0ced66a5bef5bae42b","time":1748186333000,"email":"1415808154@qq.com","author":"X4M7","message":"完成目前一段实习记得的所有收获记录"},{"hash":"e21ecbed39c29e59d6f40615d1a140a82b256832","time":1748098853000,"email":"1415808154@qq.com","author":"X4M7","message":"实习收获部分完成，需求全部记录"}]},"filePathRelative":"guide/theFirstInternship/gain4.md"}');export{p as comp,o as data};
