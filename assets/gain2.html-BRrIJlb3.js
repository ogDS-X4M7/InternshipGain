import{_ as n,c as s,d as a,o as l}from"./app-CAwhaUul.js";const i={};function t(c,e){return l(),s("div",null,e[0]||(e[0]=[a(`<h1 id="快速上手项目一——批量处理数据" tabindex="-1"><a class="header-anchor" href="#快速上手项目一——批量处理数据"><span>快速上手项目一——批量处理数据</span></a></h1><p>实习开始后，并没有太多太重的任务，公司的项目基本都已经成型，需要的只是增加功能，完善项目，因此大部分时候需要快速上手项目，熟悉项目，并投入对需求的完成工作中。</p><h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2><p>项目一的第一个需求是我自己根据需求文档挑选了一个来完成的。</p><p>这个项目在后台用户资料的一个表格中，操作项下展示用户的资金与积分，资金和积分后台人员都可以点击进行操作，需求是想要一个批量操作的选项，并且在其他页面(后续称<code>页面A</code>)有类似的实现，需求文档里讲到可以和<code>页面A</code>实现效果一致。</p><p>于是我观察了<code>页面A</code>的实现效果，只需要给出选项，然后弹出消息框以供操作者输入，确定后修改全部用户资金或积分即可。不需要确定选中用户范围，批量修改就是修改全部，于是实现起来还是比较简单的。</p><p>不过两个页面仍然存在差别，<code>页面A</code>的操作栏是只有一个项目进行批量修改，需求的页面有两个选项，于是还需要有一个判断，选择是对资金进行批量修改还是对积分进行批量修改，于是我使用了<em>element-plus</em>的气泡确认框，结合自定义弹出框的内容和点击按钮触发事件，设计一个气泡框，操作流程和<code>页面A</code>差不多，点击操作栏时，弹出气泡框，自定义气泡框文本内容是询问操作者要批量修改什么内容，并将确认和取消的两个选项修改为用户资金和用户积分，选择后弹出相应的修改消息框以供操作者输入修改后的值，如果用户输入且值合理，调用批量修改的接口，完成批量修改。</p><p>找到操作栏所在部分代码：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;el-table-column align=&quot;center&quot; fixed=&quot;right&quot; :label=&quot;t(&#39;操作&#39;)&quot; width=&quot;180&quot;&gt;</span>
<span class="line">    &lt;template #default=&quot;{ row }&quot;&gt;</span>
<span class="line">        &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pay/userResource/edit&#39;] }&quot; style=&quot;margin-right: 15px&quot; text @click=&quot;MoneyShow(row)&quot;&gt;{{ t(&#39;修改资金&#39;)}}&lt;/el-button&gt;</span>
<span class="line">        &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pay/userResource/edit&#39;] }&quot; text @click=&quot;PointsShow(row)&quot;&gt;{{ t(&#39;修改积分&#39;) }}&lt;/el-button&gt;</span>
<span class="line">    &lt;/template&gt;</span>
<span class="line">&lt;/el-table-column&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对表格该列头部，即<code>el-table-column</code>增加<code>&lt;template #header=&quot;scope&quot; &gt;</code>：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;template #header=&quot;scope&quot; &gt;</span>
<span class="line">    &lt;el-popconfirm</span>
<span class="line">      placement=&quot;top&quot;</span>
<span class="line">      title=&quot;选择批量操作对象?&quot;</span>
<span class="line">      width=&quot;220&quot;</span>
<span class="line">      @cancel=&quot;operateMoney&quot;</span>
<span class="line">      @confirm=&quot;operatePoints&quot;</span>
<span class="line">    &gt;</span>
<span class="line">        &lt;template #reference&gt;</span>
<span class="line">            &lt;span style=&quot;cursor:pointer;&quot; :title=&quot;t(&#39;批量设置选择&#39;)&quot;&gt;{{scope.column.label}}&lt;ms-icon data-key=&quot;item_market_price&quot; icon=&quot;more-2-line&quot; /&gt;&lt;/span&gt;</span>
<span class="line">        &lt;/template&gt;</span>
<span class="line">        &lt;template #actions=&quot;{ confirm, cancel }&quot;&gt;</span>
<span class="line">            &lt;el-button size=&quot;small&quot; type=&quot;primary&quot; @click=&quot;cancel&quot;&gt;客户资金&lt;/el-button&gt;</span>
<span class="line">            &lt;el-button</span>
<span class="line">              size=&quot;small&quot;</span>
<span class="line">              type=&quot;danger&quot;</span>
<span class="line">              @click=&quot;confirm&quot;</span>
<span class="line">            &gt;</span>
<span class="line">                客户积分</span>
<span class="line">            &lt;/el-button&gt;</span>
<span class="line">        &lt;/template&gt;</span>
<span class="line">    &lt;/el-popconfirm&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下方添加增加的相应函数处理：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const operateMoney = ()=&gt;{</span>
<span class="line">    ElMessageBox.prompt(t(&#39;批量设置客户资金&#39;), {</span>
<span class="line">        confirmButtonText: t(&#39;确定&#39;),</span>
<span class="line">        cancelButtonText: t(&#39;取消&#39;),</span>
<span class="line">    })</span>
<span class="line">        .then(({ value }) =&gt; {</span>
<span class="line">          if (value) {</span>
<span class="line">            //调用接口</span>
<span class="line">          }</span>
<span class="line">        })</span>
<span class="line">        .catch(() =&gt; {})</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    const operatePoints = ()=&gt;{</span>
<span class="line">      ElMessageBox.prompt(t(&#39;批量设置客户积分&#39;), {</span>
<span class="line">        confirmButtonText: t(&#39;确定&#39;),</span>
<span class="line">        cancelButtonText: t(&#39;取消&#39;),</span>
<span class="line">      })</span>
<span class="line">        .then(({ value }) =&gt; {</span>
<span class="line">          if (value) {</span>
<span class="line">            //调用接口</span>
<span class="line">          }</span>
<span class="line">        })</span>
<span class="line">        .catch(() =&gt; {})</span>
<span class="line">    }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="另外的需求与完成" tabindex="-1"><a class="header-anchor" href="#另外的需求与完成"><span>另外的需求与完成</span></a></h2><p>关于这个项目后续其实还做了一个需求，不过因为比较简单，就不单开一页写了，直接在这里记录。</p><p>新的需求只是在用户发布商品信息时，把一个单选选项的默认项从第一项改为第二项，非常简单。</p><p>完成它只需修改一行代码，几乎没啥好讲的，但是毕竟一个项目的内容是庞大的，在这里我是想写一下我如何快速定位一个我不熟悉的项目它需要修改的代码位置：</p><p>我是通过<em>Vue DevTools</em>来定位的，打开要修改的页面，根据<em>Vue DevTools</em>中的项目找到单选项对应的属性，后续直接在对应页面的代码里搜索这个属性、值，就能找到有关这个属性和值的几个位置，将任务从在几千行代码里找出修改点变为从几行代码中找到修改点，效率大大提高，所以要熟悉并灵活运用<em>Vue DevTools</em>。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>相关的内容我之前做过类似的，总结来说就是：实现了选择对象并批量处理对象数据的功能；</p><p>收获的话，更加熟悉了<em>element-plus</em>的气泡确认框的使用，毕竟在完成我个人项目之后，也有一段时间没有使用了，框架、库也是需要多写多用才更熟练，遇到复杂问题的时候才能快速想到解决方案。</p><p>至于第二个需求的收获，就是前面说的，要熟悉并灵活运用<em>Vue DevTools</em>。</p>`,22)]))}const d=n(i,[["render",t]]),o=JSON.parse('{"path":"/guide/theFirstInternship/gain2.html","title":"快速上手项目一——批量处理数据","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"需求与完成","slug":"需求与完成","link":"#需求与完成","children":[]},{"level":2,"title":"另外的需求与完成","slug":"另外的需求与完成","link":"#另外的需求与完成","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"updatedTime":1748322406000,"contributors":[{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":2,"url":"https://github.com/X4M7"},{"name":"李锐标","username":"","email":"1415808154@qq.com","commits":1}],"changelog":[{"hash":"390433b836f920dd5fc5d1ea558f635897d565cd","time":1748322406000,"email":"1415808154@qq.com","author":"李锐标","message":"完善实习一内容，新增运行自动打开页面配置"},{"hash":"4215c19d7a3adc5ad3c57e0ced66a5bef5bae42b","time":1748186333000,"email":"1415808154@qq.com","author":"X4M7","message":"完成目前一段实习记得的所有收获记录"},{"hash":"e21ecbed39c29e59d6f40615d1a140a82b256832","time":1748098853000,"email":"1415808154@qq.com","author":"X4M7","message":"实习收获部分完成，需求全部记录"}]},"filePathRelative":"guide/theFirstInternship/gain2.md"}');export{d as comp,o as data};
