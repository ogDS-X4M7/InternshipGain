import{_ as i,c as l,a as s,d as t,b as n,e as c,w as d,r as p,o as r}from"./app-Cp4rneoy.js";const o={};function u(m,e){const a=p("RouteLink");return r(),l("div",null,[e[3]||(e[3]=s("h1",{id:"项目一——导出商品列表",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#项目一——导出商品列表"},[s("span",null,"项目一——导出商品列表")])],-1)),e[4]||(e[4]=s("h2",{id:"需求与完成",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#需求与完成"},[s("span",null,"需求与完成")])],-1)),e[5]||(e[5]=s("p",null,"继续完成项目一的需求，这次实现了对商品列表导出excel文件。因为注意到项目中的其他页面有实现过类似的功能，于是虽然之前没做过没学过相关的内容，但模仿之前的代码，仍然成功实现了这个需求。",-1)),s("p",null,[e[1]||(e[1]=n("项目中已经封装好了一个基于 xlsx 和 file-saver 库的 Excel 导出工具，关于这个工具，这部分内容比较多，而且都是新知识，所以放在")),c(a,{to:"/guide/theFirstInternship/gain6.html#%E6%94%B6%E8%8E%B7%E4%B8%89%E5%AE%9E%E7%8E%B0excel%E5%AF%BC%E5%87%BA%E5%B7%A5%E5%85%B7"},{default:d(()=>e[0]||(e[0]=[n("收获三——实现Excel导出工具")])),_:1,__:[0]}),e[2]||(e[2]=n("中记录。"))]),e[6]||(e[6]=t(`<h3 id="了解方法和参数" tabindex="-1"><a class="header-anchor" href="#了解方法和参数"><span>了解方法和参数</span></a></h3><p>要导出商品列表，是通过封装好的Excel导出工具来导出，那么首要的就是了解相关的使用方法和所需的参数。直接来看我已经写好的代码：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import(&#39;@/utils/excel&#39;).then((excel) =&gt; {</span>
<span class="line">    const tHeader = [&#39;商品编码&#39;, &#39;产品名称&#39;, &#39;商品单价&#39;, &#39;销售数量&#39;, &#39;商品状态&#39;, &#39;上架时间&#39;, &#39;三级分销&#39;, &#39;佣金比率 &#39;, &#39;排序&#39;]</span>
<span class="line">    const filterVal = [&#39;product_id&#39;, &#39;product_name&#39;, &#39;product_unit_price&#39;, &#39;product_sale_num&#39;, &#39;product_state_id&#39;, &#39;product_sale_time&#39;, &#39;product_dist_enable&#39;, &#39;scope.row.product_commission_rate&#39;, &#39;scope.row.product_order&#39;]</span>
<span class="line">    const list = state.selectRows</span>
<span class="line">    const data = formatJson(filterVal, list)</span>
<span class="line">    excel.export_json_to_excel({</span>
<span class="line">        header: tHeader,</span>
<span class="line">        data,</span>
<span class="line">        filename: state.filename,</span>
<span class="line">        autoWidth: state.autoWidth,</span>
<span class="line">        bookType: state.bookType,</span>
<span class="line">    })</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里采用了<code>ES6</code>的动态导入语法，用于按需加载模块，这样的写法是在用户点击导出按钮时才加载<code>Excel</code>工具库，而不是页面初始化时就加载，能够减少首屏加载时间，提高应用性能。</p><p>导出表格，主要使用的是<code>export_json_to_excel</code>方法，可以看到所需的参数：</p><p><code>header</code>：文件中各列（属性）名称；</p><p><code>filename</code>：导出的文件名称；</p><p><code>data</code>：最主要的商品列表数据，操作者选中要导出的商品，然后再导出，因此有选中商品的操作，由于之前这个地方实现过批量删除的功能，因此已经实现过批量选择商品的功能，我们只需要把<code>Vuex</code>中的批量选中商品信息取过来使用即可，也就是代码中的<code>const list = state.selectRows</code>，当然后面需要对<code>list</code>格式化才交给<code>data</code>，这个下面再聊。（关于这个<code>selectRows</code>的实现并不困难，不过也在<a href="#%E8%A1%A5%E5%85%85%E4%B8%80%E4%B8%8Bselectrows%E7%9A%84%E5%AE%9E%E7%8E%B0">下面</a>一并记录一下）</p><p><code>autoWidth</code>：Excel表格需要自适应宽度匹配各列</p><p><code>bookType</code>：指定导出的 Excel 文件格式类型</p><h3 id="提供参数" tabindex="-1"><a class="header-anchor" href="#提供参数"><span>提供参数</span></a></h3><p>了解完所需的方法和参数，接下来就是为了调用<code>export_json_to_excel</code>方法而准备参数。</p><p>经过上面的了解，我把这些参数的提供分为两部分讲：<code>data</code>外的其他参数作为一部分，因为它们只需要简单配置即可；另一部分就是最重要的<code>data</code>的提供，因为它需要把主要的商品列表数据格式化，于是需要讲解自己设计使用的<code>formatJson</code></p><h4 id="formatjson按需格式化数据参数" tabindex="-1"><a class="header-anchor" href="#formatjson按需格式化数据参数"><span>formatJson按需格式化数据参数</span></a></h4><p>可以看到最主要的<code>data</code>数据参数是需要格式化的。原因和我们平时所讲的定义其实紧密相关，比如<code>Vuex</code>，<code>Pinia</code>我们都叫状态管理工具，对于数据、变量其实就是状态，比如这里的<em>商品状态</em>、<em>三级分销</em>，存储在状态管理工具中的并不是字符串，而是一些数字，比如这里<code>1001</code>表示商品处于上架状态，<code>1002</code>处于下架。当导出<code>Excel</code>时，当然不能导出数字，而是要导出对应的文字信息。另外，像是上架时间，存储的也是<em>时间戳</em>，需要格式化再导出。</p><p>而这个负责格式化的函数，即<code>formatJson</code>，就需要自己来完成：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const formatJson = (filterVal, jsonData) =&gt; {</span>
<span class="line">  return jsonData.map((v) =&gt;</span>
<span class="line">    filterVal.map((j) =&gt; {</span>
<span class="line">      if(j == &#39;product_unit_price&#39;){</span>
<span class="line">        return formatPrice(v)</span>
<span class="line">      }</span>
<span class="line">      if (v[j] == null) return null;</span>
<span class="line">      if (j == &#39;product_state_id&#39;) {</span>
<span class="line">        if(v[j]===1001){</span>
<span class="line">          return t(&#39;已上架&#39;)</span>
<span class="line">        }else{</span>
<span class="line">          return t(&#39;已下架&#39;)</span>
<span class="line">        }</span>
<span class="line">      }else if(j == &#39;product_sale_time&#39;){</span>
<span class="line">        return timestampToTime(v[j])</span>
<span class="line">      }else if(j == &#39;product_dist_enable&#39;){</span>
<span class="line">        if(v[j]){</span>
<span class="line">          return t(&#39;允许&#39;)</span>
<span class="line">        }else{</span>
<span class="line">          return t(&#39;不允许&#39;)</span>
<span class="line">        }</span>
<span class="line">      }</span>
<span class="line">      return v[j]</span>
<span class="line">    })</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>正如上面介绍过的，我们所需要做的，就是把不适合展示的信息格式转化成适合展示在<code>Excel</code>中的格式。因此通过两层<code>map</code>方法，展开各个商品，展开商品内部信息，找出需要调整格式的信息，返回其修改格式后的信息，而不需要修改格式的信息直接返回即可。注意到这里<code>if(j == &#39;product_unit_price&#39;)</code>的处理被放在了<code>if (v[j] == null)</code>之前，并且返回值调用了另一个格式化函数<code>formatPrice</code>，和其他信息不同。这是因为我在导出Excel的过程中发现了一个典型的数据结构不匹配问题，这个放在下面的<a href="#%E8%A7%A3%E5%86%B3%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8D%E5%8C%B9%E9%85%8D%E9%97%AE%E9%A2%98">解决数据结构不匹配问题</a>讲解。</p><h4 id="补充其他参数" tabindex="-1"><a class="header-anchor" href="#补充其他参数"><span>补充其他参数</span></a></h4><p>完成最主要的数据格式化，剩下的简单参数进行补充即可。</p><p>比如<code>header</code>，根据页面展示的内容，给出<code>const tHeader = [...]</code>作为文件中各列（属性）名称，后面把<code>tHeader</code>做为参数导入即可。</p><p>至于<code>filename</code>、<code>autoWidth</code>、<code>bookType</code>，在<code>state</code>里补充设置好相应内容即可：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const state = reactive({</span>
<span class="line">  ...</span>
<span class="line">  filename: &#39;商品列表&#39;,</span>
<span class="line">  autoWidth: true,</span>
<span class="line">  bookType: &#39;xlsx&#39;,</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="补充一下selectrows的实现" tabindex="-1"><a class="header-anchor" href="#补充一下selectrows的实现"><span>补充一下selectRows的实现</span></a></h3><p>是通过<code>element-plus</code>对表格中全选框、复选框自带的监听实现的：<code>el-table</code>中有<code>@selection-change</code>可监听复选框勾选情况，发生改变时则调用对应的方法，这里设置了<code>setSelectRows</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;el-table</span>
<span class="line">    ...</span>
<span class="line">    @selection-change=&quot;setSelectRows&quot;</span>
<span class="line">&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关于<code>setSelectRows</code>的实现如下：可以看到<code>@selection-change</code>可监听复选框勾选情况，并获取被勾选对象信息作为参数传给对应的方法，这里直接将带来的参数<code>val</code>赋值给了<code>state.selectRows</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const setSelectRows = (val) =&gt; {</span>
<span class="line">  ...</span>
<span class="line">  state.selectRows = val</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="另外的需求与完成" tabindex="-1"><a class="header-anchor" href="#另外的需求与完成"><span>另外的需求与完成</span></a></h2><h3 id="样式调整" tabindex="-1"><a class="header-anchor" href="#样式调整"><span>样式调整</span></a></h3><p>顺便对之前的按钮样式做了修改。在我接手之前，这个代码的写法布局破坏了默认的样式，导致样式混乱。我将不必要的写法抛去，使用默认的布局实现相同的功能，保留默认的样式即可。</p><p>这是原本的代码，为了做一个路由跳转使用了<code>&lt;ms-link&gt;</code>破坏了布局，下面也用了一个没有必要的<code>&lt;ms-link&gt;</code>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;ms-search-box-left-panel :span=&quot;5&quot;&gt;</span>
<span class="line">  &lt;ms-link to=&quot;/add&quot;&gt;</span>
<span class="line">    &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pt/productBase/edit&#39;] }&quot; :icon=&quot;Plus&quot; type=&quot;primary&quot;&gt;</span>
<span class="line">      {{ t(&#39;添加&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">  &lt;/ms-link&gt;</span>
<span class="line">  &lt;ms-link to=&quot;&quot;&gt;</span>
<span class="line">    &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pt/productBase/edit&#39;] }&quot; type=&quot;success&quot; @click=&quot;importEdit&quot;&gt;</span>
<span class="line">      {{ t(&#39;导入&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">    &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pt/productBase/edit&#39;] }&quot; type=&quot;warning&quot; @click=&quot;importEditItem&quot;&gt;</span>
<span class="line">      {{ t(&#39;批量修改&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">    &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pt/productBase/edit&#39;] }&quot; type=&quot;warning&quot; @click=&quot;handleDelete&quot;&gt;</span>
<span class="line">      {{ t(&#39;批量删除&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">    &lt;el-button v-if=&quot;hasSelected&quot; :icon=&quot;Top&quot; type=&quot;success&quot; @click=&quot;batchUpdate(1001)&quot;&gt;</span>
<span class="line">      {{ t(&#39;上架&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">    &lt;el-button v-if=&quot;hasSelected&quot; :icon=&quot;Bottom&quot; type=&quot;danger&quot; @click=&quot;batchUpdate(1002)&quot;&gt;</span>
<span class="line">      {{ t(&#39;下架&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">  &lt;/ms-link&gt;</span>
<span class="line">&lt;/ms-search-box-left-panel&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>事实上直接给<em>添加</em>按钮点击后编程式路由跳转就搞定了，删去<code>&lt;ms-link&gt;</code>就能保持默认布局</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;ms-search-box-left-panel :span=&quot;5&quot;&gt;</span>
<span class="line">    &lt;el-button v-permissions=&quot;{ permission: [&#39;/manage/pt/productBase/edit&#39;] }&quot; :icon=&quot;Plus&quot; type=&quot;primary&quot; @click=&quot;router.push({path:&#39;/add&#39;})&quot;&gt;</span>
<span class="line">      {{ t(&#39;添加&#39;) }}</span>
<span class="line">    &lt;/el-button&gt;</span>
<span class="line">    ...其他按钮</span>
<span class="line">&lt;/ms-search-box-left-panel&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="解决数据结构不匹配问题" tabindex="-1"><a class="header-anchor" href="#解决数据结构不匹配问题"><span>解决数据结构不匹配问题</span></a></h3><p>数据结构不匹配是因为在最前面的配置代码中，可以看到<code>商品单价</code>对应的属性是<code>product_unit_price</code>，但当<code>product_unit_price</code>被访问时，返回的结果却是<code>undefined</code>，我查看了原本的表格是怎么使用<code>product_unit_price</code>的，然后就找到了原因，先看表格关于商品单价这一列的代码：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;el-table-column</span>
<span class="line">    align=&quot;center&quot;</span>
<span class="line">    :formatter=&quot;(row, column)=&gt;{if (row.product_unit_price_min!=row.product_unit_price_max &amp;&amp; row.product_unit_price_min&lt;row.product_unit_price_max){return t(&#39;￥&#39;) + row.product_unit_price_min + &#39; ~ &#39; + row.product_unit_price_max}else{return t(&#39;￥&#39;) + row.product_unit_price_min}}&quot;</span>
<span class="line">    :label=&quot;t(&#39;商品单价&#39;)&quot;</span>
<span class="line">    prop=&quot;product_unit_price&quot;</span>
<span class="line">    show-overflow-tooltip</span>
<span class="line">    sortable</span>
<span class="line">    width=&quot;120&quot;</span>
<span class="line">/&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到表格通过<code>formatter</code>函数动态生成展示内容，组合了<code>product_unit_price_min</code>和<code>product_unit_price_max</code>，实际数据中并不存在<code>product_unit_price</code>；其实解决方案有简单的：可以在下面也根据<code>product_unit_price_min</code>和<code>product_unit_price_max</code>来生成对应的数据返回，但考虑到保持表格展示和导出逻辑的一致性，我觉得创建通用格式化函数更好，于是就有了<code>formatPrice</code>：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">export const formatPrice = (row, withSymbol = true) =&gt; {</span>
<span class="line">  const min = row.product_unit_price_min;</span>
<span class="line">  const max = row.product_unit_price_max;</span>
<span class="line">  const symbol = withSymbol ? &#39;￥&#39; : &#39;&#39;;</span>
<span class="line">  </span>
<span class="line">  if (min !== max &amp;&amp; min &lt; max) {</span>
<span class="line">    return \`\${symbol}\${min} ~ \${max}\`;</span>
<span class="line">  } else {</span>
<span class="line">    return \`\${symbol}\${min}\`;</span>
<span class="line">  }</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>设计完函数，引入文件，在这两个地方都使用即可:</p><p>在<code>el-table-column</code>商品单价这一列使用：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;el-table-column </span>
<span class="line">  ...</span>
<span class="line">  :formatter=&quot;(row) =&gt; formatPrice(row)&quot; </span>
<span class="line">  ...</span>
<span class="line">/&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code>formatJson</code>中使用：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const formatJson = (filterVal, jsonData) =&gt; {</span>
<span class="line">  return jsonData.map(v =&gt; </span>
<span class="line">    filterVal.map(j =&gt; {</span>
<span class="line">      if (j === &#39;product_unit_price&#39;) {</span>
<span class="line">        return formatPrice(v); </span>
<span class="line">      }</span>
<span class="line">      ...</span>
<span class="line">    })</span>
<span class="line">  );</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样就顺利解决了数据结构不匹配的问题了，既能正确导出<code>Excel</code>表格中所需的商品单价，也能保持表格展示和导出逻辑的一致性</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>收获了调用<code>Excel</code>导出工具导出<code>Excel</code>文件的做法，这是之前的学习经历中没有做过的内容。学习、了解了导出<code>Excel</code>表格的库、方法和工具。掌握处理数据结构不匹配问题的方法，顺便复习熟悉了<code>element-plus</code>中<code>el-table</code>的<code>@selection-change</code>的作用。</p>`,48))])}const b=i(o,[["render",u]]),h=JSON.parse('{"path":"/guide/theFirstInternship/gain5.html","title":"项目一——导出商品列表","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"需求与完成","slug":"需求与完成","link":"#需求与完成","children":[{"level":3,"title":"了解方法和参数","slug":"了解方法和参数","link":"#了解方法和参数","children":[]},{"level":3,"title":"提供参数","slug":"提供参数","link":"#提供参数","children":[]},{"level":3,"title":"补充一下selectRows的实现","slug":"补充一下selectrows的实现","link":"#补充一下selectrows的实现","children":[]}]},{"level":2,"title":"另外的需求与完成","slug":"另外的需求与完成","link":"#另外的需求与完成","children":[{"level":3,"title":"样式调整","slug":"样式调整","link":"#样式调整","children":[]},{"level":3,"title":"解决数据结构不匹配问题","slug":"解决数据结构不匹配问题","link":"#解决数据结构不匹配问题","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"updatedTime":1748738564000,"contributors":[{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":1,"url":"https://github.com/X4M7"},{"name":"李锐标","username":"","email":"1415808154@qq.com","commits":1}],"changelog":[{"hash":"b6fbf2ef47672a403de1a250e5830b27719920e8","time":1748738564000,"email":"1415808154@qq.com","author":"李锐标","message":"补充Excel部分代码演示"},{"hash":"e6c2e7c2c53288dc9cea12cbccf49263c237aedc","time":1748449321000,"email":"1415808154@qq.com","author":"X4M7","message":"项目一导出商品列表实现，Excel导出工具实现的部分讲解"}]},"filePathRelative":"guide/theFirstInternship/gain5.md"}');export{b as comp,h as data};
