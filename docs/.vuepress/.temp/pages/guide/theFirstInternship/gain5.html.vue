<template><div><h1 id="项目一——导出商品列表" tabindex="-1"><a class="header-anchor" href="#项目一——导出商品列表"><span>项目一——导出商品列表</span></a></h1>
<h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2>
<p>继续完成项目一的需求，这次实现了对商品列表导出excel文件。因为注意到项目中的其他页面有实现过类似的功能，于是虽然之前没做过没学过相关的内容，但模仿之前的代码，仍然成功实现了这个需求。</p>
<p>项目中已经封装好了一个基于 xlsx 和 file-saver 库的 Excel 导出工具，关于这个工具，这部分内容比较多，而且都是新知识，所以放在<RouteLink to="/guide/theFirstInternship/gain6.html#%E6%94%B6%E8%8E%B7%E4%B8%89%E5%AE%9E%E7%8E%B0excel%E5%AF%BC%E5%87%BA%E5%B7%A5%E5%85%B7">收获三——实现Excel导出工具</RouteLink>中记录。</p>
<h3 id="了解方法和参数" tabindex="-1"><a class="header-anchor" href="#了解方法和参数"><span>了解方法和参数</span></a></h3>
<p>要导出商品列表，是通过封装好的Excel导出工具来导出，那么首要的就是了解相关的使用方法和所需的参数。直接来看我已经写好的代码：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import('@/utils/excel').then((excel) => {</span>
<span class="line">    const tHeader = ['商品编码', '产品名称', '商品单价', '销售数量', '商品状态', '上架时间', '三级分销', '佣金比率 ', '排序']</span>
<span class="line">    const filterVal = ['product_id', 'product_name', 'product_unit_price', 'product_sale_num', 'product_state_id', 'product_sale_time', 'product_dist_enable', 'scope.row.product_commission_rate', 'scope.row.product_order']</span>
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
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里采用了<code v-pre>ES6</code>的动态导入语法，用于按需加载模块，这样的写法是在用户点击导出按钮时才加载<code v-pre>Excel</code>工具库，而不是页面初始化时就加载，能够减少首屏加载时间，提高应用性能。</p>
<p>导出表格，主要使用的是<code v-pre>export_json_to_excel</code>方法，可以看到所需的参数：</p>
<p><code v-pre>header</code>：文件中各列（属性）名称；</p>
<p><code v-pre>filename</code>：导出的文件名称；</p>
<p><code v-pre>data</code>：最主要的商品列表数据，操作者选中要导出的商品，然后再导出，因此有选中商品的操作，由于之前这个地方实现过批量删除的功能，因此已经实现过批量选择商品的功能，我们只需要把<code v-pre>Vuex</code>中的批量选中商品信息取过来使用即可，也就是代码中的<code v-pre>const list = state.selectRows</code>，当然后面需要对<code v-pre>list</code>格式化才交给<code v-pre>data</code>，这个下面再聊。（关于这个<code v-pre>selectRows</code>的实现并不困难，不过也在<a href="#%E8%A1%A5%E5%85%85%E4%B8%80%E4%B8%8Bselectrows%E7%9A%84%E5%AE%9E%E7%8E%B0">下面</a>一并记录一下）</p>
<p><code v-pre>autoWidth</code>：Excel表格需要自适应宽度匹配各列</p>
<p><code v-pre>bookType</code>：指定导出的 Excel 文件格式类型</p>
<h3 id="提供参数" tabindex="-1"><a class="header-anchor" href="#提供参数"><span>提供参数</span></a></h3>
<p>了解完所需的方法和参数，接下来就是为了调用<code v-pre>export_json_to_excel</code>方法而准备参数。</p>
<p>经过上面的了解，我把这些参数的提供分为两部分讲：<code v-pre>data</code>外的其他参数作为一部分，因为它们只需要简单配置即可；另一部分就是最重要的<code v-pre>data</code>的提供，因为它需要把主要的商品列表数据格式化，于是需要讲解自己设计使用的<code v-pre>formatJson</code></p>
<h4 id="formatjson按需格式化数据参数" tabindex="-1"><a class="header-anchor" href="#formatjson按需格式化数据参数"><span>formatJson按需格式化数据参数</span></a></h4>
<p>可以看到最主要的<code v-pre>data</code>数据参数是需要格式化的。原因和我们平时所讲的定义其实紧密相关，比如<code v-pre>Vuex</code>，<code v-pre>Pinia</code>我们都叫状态管理工具，对于数据、变量其实就是状态，比如这里的<em>商品状态</em>、<em>三级分销</em>，存储在状态管理工具中的并不是字符串，而是一些数字，比如这里<code v-pre>1001</code>表示商品处于上架状态，<code v-pre>1002</code>处于下架。当导出<code v-pre>Excel</code>时，当然不能导出数字，而是要导出对应的文字信息。另外，像是上架时间，存储的也是<em>时间戳</em>，需要格式化再导出。</p>
<p>而这个负责格式化的函数，即<code v-pre>formatJson</code>，就需要自己来完成：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const formatJson = (filterVal, jsonData) => {</span>
<span class="line">  return jsonData.map((v) =></span>
<span class="line">    filterVal.map((j) => {</span>
<span class="line">      if(j == 'product_unit_price'){</span>
<span class="line">        return formatPrice(v)</span>
<span class="line">      }</span>
<span class="line">      if (v[j] == null) return null;</span>
<span class="line">      if (j == 'product_state_id') {</span>
<span class="line">        if(v[j]===1001){</span>
<span class="line">          return t('已上架')</span>
<span class="line">        }else{</span>
<span class="line">          return t('已下架')</span>
<span class="line">        }</span>
<span class="line">      }else if(j == 'product_sale_time'){</span>
<span class="line">        return timestampToTime(v[j])</span>
<span class="line">      }else if(j == 'product_dist_enable'){</span>
<span class="line">        if(v[j]){</span>
<span class="line">          return t('允许')</span>
<span class="line">        }else{</span>
<span class="line">          return t('不允许')</span>
<span class="line">        }</span>
<span class="line">      }</span>
<span class="line">      return v[j]</span>
<span class="line">    })</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>正如上面介绍过的，我们所需要做的，就是把不适合展示的信息格式转化成适合展示在<code v-pre>Excel</code>中的格式。因此通过两层<code v-pre>map</code>方法，展开各个商品，展开商品内部信息，找出需要调整格式的信息，返回其修改格式后的信息，而不需要修改格式的信息直接返回即可。注意到这里<code v-pre>if(j == 'product_unit_price')</code>的处理被放在了<code v-pre>if (v[j] == null)</code>之前，并且返回值调用了另一个格式化函数<code v-pre>formatPrice</code>，和其他信息不同。这是因为我在导出Excel的过程中发现了一个典型的数据结构不匹配问题，这个放在下面的<a href="#%E8%A7%A3%E5%86%B3%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8D%E5%8C%B9%E9%85%8D%E9%97%AE%E9%A2%98">解决数据结构不匹配问题</a>讲解。</p>
<h4 id="补充其他参数" tabindex="-1"><a class="header-anchor" href="#补充其他参数"><span>补充其他参数</span></a></h4>
<p>完成最主要的数据格式化，剩下的简单参数进行补充即可。</p>
<p>比如<code v-pre>header</code>，根据页面展示的内容，给出<code v-pre>const tHeader = [...]</code>作为文件中各列（属性）名称，后面把<code v-pre>tHeader</code>做为参数导入即可。</p>
<p>至于<code v-pre>filename</code>、<code v-pre>autoWidth</code>、<code v-pre>bookType</code>，在<code v-pre>state</code>里补充设置好相应内容即可：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const state = reactive({</span>
<span class="line">  ...</span>
<span class="line">  filename: '商品列表',</span>
<span class="line">  autoWidth: true,</span>
<span class="line">  bookType: 'xlsx',</span>
<span class="line">})</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="补充一下selectrows的实现" tabindex="-1"><a class="header-anchor" href="#补充一下selectrows的实现"><span>补充一下selectRows的实现</span></a></h3>
<p>是通过<code v-pre>element-plus</code>对表格中全选框、复选框自带的监听实现的：<code v-pre>el-table</code>中有<code v-pre>@selection-change</code>可监听复选框勾选情况，发生改变时则调用对应的方法，这里设置了<code v-pre>setSelectRows</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;el-table</span>
<span class="line">    ...</span>
<span class="line">    @selection-change="setSelectRows"</span>
<span class="line">></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关于<code v-pre>setSelectRows</code>的实现如下：可以看到<code v-pre>@selection-change</code>可监听复选框勾选情况，并获取被勾选对象信息作为参数传给对应的方法，这里直接将带来的参数<code v-pre>val</code>赋值给了<code v-pre>state.selectRows</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const setSelectRows = (val) => {</span>
<span class="line">  ...</span>
<span class="line">  state.selectRows = val</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="另外的需求与完成" tabindex="-1"><a class="header-anchor" href="#另外的需求与完成"><span>另外的需求与完成</span></a></h2>
<h3 id="样式调整" tabindex="-1"><a class="header-anchor" href="#样式调整"><span>样式调整</span></a></h3>
<p>顺便对之前的按钮样式做了修改。在我接手之前，这个代码的写法布局破坏了默认的样式，导致样式混乱。我将不必要的写法抛去，使用默认的布局实现相同的功能，保留默认的样式即可。</p>
<p>这是原本的代码，为了做一个路由跳转使用了<code v-pre>&lt;ms-link&gt;</code>破坏了布局，下面也用了一个没有必要的<code v-pre>&lt;ms-link&gt;</code>。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;ms-search-box-left-panel :span="5"></span>
<span class="line">  &lt;ms-link to="/add"></span>
<span class="line">    &lt;el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" :icon="Plus" type="primary"></span>
<span class="line">      {{ t('添加') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">  &lt;/ms-link></span>
<span class="line">  &lt;ms-link to=""></span>
<span class="line">    &lt;el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" type="success" @click="importEdit"></span>
<span class="line">      {{ t('导入') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">    &lt;el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" type="warning" @click="importEditItem"></span>
<span class="line">      {{ t('批量修改') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">    &lt;el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" type="warning" @click="handleDelete"></span>
<span class="line">      {{ t('批量删除') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">    &lt;el-button v-if="hasSelected" :icon="Top" type="success" @click="batchUpdate(1001)"></span>
<span class="line">      {{ t('上架') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">    &lt;el-button v-if="hasSelected" :icon="Bottom" type="danger" @click="batchUpdate(1002)"></span>
<span class="line">      {{ t('下架') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">  &lt;/ms-link></span>
<span class="line">&lt;/ms-search-box-left-panel></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>事实上直接给<em>添加</em>按钮点击后编程式路由跳转就搞定了，删去<code v-pre>&lt;ms-link&gt;</code>就能保持默认布局</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;ms-search-box-left-panel :span="5"></span>
<span class="line">    &lt;el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" :icon="Plus" type="primary" @click="router.push({path:'/add'})"></span>
<span class="line">      {{ t('添加') }}</span>
<span class="line">    &lt;/el-button></span>
<span class="line">    ...其他按钮</span>
<span class="line">&lt;/ms-search-box-left-panel></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="解决数据结构不匹配问题" tabindex="-1"><a class="header-anchor" href="#解决数据结构不匹配问题"><span>解决数据结构不匹配问题</span></a></h3>
<p>数据结构不匹配是因为在最前面的配置代码中，可以看到<code v-pre>商品单价</code>对应的属性是<code v-pre>product_unit_price</code>，但当<code v-pre>product_unit_price</code>被访问时，返回的结果却是<code v-pre>undefined</code>，我查看了原本的表格是怎么使用<code v-pre>product_unit_price</code>的，然后就找到了原因，先看表格关于商品单价这一列的代码：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;el-table-column</span>
<span class="line">    align="center"</span>
<span class="line">    :formatter="(row, column)=>{if (row.product_unit_price_min!=row.product_unit_price_max &amp;&amp; row.product_unit_price_min&lt;row.product_unit_price_max){return t('￥') + row.product_unit_price_min + ' ~ ' + row.product_unit_price_max}else{return t('￥') + row.product_unit_price_min}}"</span>
<span class="line">    :label="t('商品单价')"</span>
<span class="line">    prop="product_unit_price"</span>
<span class="line">    show-overflow-tooltip</span>
<span class="line">    sortable</span>
<span class="line">    width="120"</span>
<span class="line">/></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到表格通过<code v-pre>formatter</code>函数动态生成展示内容，组合了<code v-pre>product_unit_price_min</code>和<code v-pre>product_unit_price_max</code>，实际数据中并不存在<code v-pre>product_unit_price</code>；其实解决方案有简单的：可以在下面也根据<code v-pre>product_unit_price_min</code>和<code v-pre>product_unit_price_max</code>来生成对应的数据返回，但考虑到保持表格展示和导出逻辑的一致性，我觉得创建通用格式化函数更好，于是就有了<code v-pre>formatPrice</code>：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">export const formatPrice = (row, withSymbol = true) => {</span>
<span class="line">  const min = row.product_unit_price_min;</span>
<span class="line">  const max = row.product_unit_price_max;</span>
<span class="line">  const symbol = withSymbol ? '￥' : '';</span>
<span class="line">  </span>
<span class="line">  if (min !== max &amp;&amp; min &lt; max) {</span>
<span class="line">    return `${symbol}${min} ~ ${max}`;</span>
<span class="line">  } else {</span>
<span class="line">    return `${symbol}${min}`;</span>
<span class="line">  }</span>
<span class="line">};</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>设计完函数，引入文件，在这两个地方都使用即可:</p>
<p>在<code v-pre>el-table-column</code>商品单价这一列使用：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">&lt;el-table-column </span>
<span class="line">  ...</span>
<span class="line">  :formatter="(row) => formatPrice(row)" </span>
<span class="line">  ...</span>
<span class="line">/></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code v-pre>formatJson</code>中使用：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const formatJson = (filterVal, jsonData) => {</span>
<span class="line">  return jsonData.map(v => </span>
<span class="line">    filterVal.map(j => {</span>
<span class="line">      if (j === 'product_unit_price') {</span>
<span class="line">        return formatPrice(v); </span>
<span class="line">      }</span>
<span class="line">      ...</span>
<span class="line">    })</span>
<span class="line">  );</span>
<span class="line">};</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样就顺利解决了数据结构不匹配的问题了，既能正确导出<code v-pre>Excel</code>表格中所需的商品单价，也能保持表格展示和导出逻辑的一致性</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>收获了调用<code v-pre>Excel</code>导出工具导出<code v-pre>Excel</code>文件的做法，这是之前的学习经历中没有做过的内容。学习、了解了导出<code v-pre>Excel</code>表格的库、方法和工具。掌握处理数据结构不匹配问题的方法，顺便复习熟悉了<code v-pre>element-plus</code>中<code v-pre>el-table</code>的<code v-pre>@selection-change</code>的作用。</p>
</div></template>


