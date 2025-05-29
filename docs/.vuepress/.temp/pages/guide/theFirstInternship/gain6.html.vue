<template><div><h1 id="收获三——实现excel导出工具" tabindex="-1"><a class="header-anchor" href="#收获三——实现excel导出工具"><span>收获三——实现Excel导出工具</span></a></h1>
<h2 id="核心依赖库" tabindex="-1"><a class="header-anchor" href="#核心依赖库"><span>核心依赖库</span></a></h2>
<p><code v-pre>file-saver</code>：</p>
<p>功能：实现文件保存到本地的功能，提供<code v-pre>saveAs</code>方法。</p>
<p><code v-pre>xlsx</code>：</p>
<p>功能：操作<code v-pre>Excel</code>文件的核心库，包含解析、生成<code v-pre>Excel</code>的工具函数（如<code v-pre>utils</code>、<code v-pre>write</code>）。</p>
<p><code v-pre>utils</code>：提供了一系列用于<em>转换数据格式</em>和<em>操作工作表</em>的工具函数。可以看到这个库使用了三个方法：<code v-pre>utils.encode_cell</code>、<code v-pre>utils.encode_range</code>、<code v-pre>utils.decode_range</code>，都是用于<em>处理单元格地址和区域</em>的核心工具函数。</p>
<p><code v-pre>write</code>：用于将工作表数据转换为不同格式的文件内容，支持多种输出格式，在这里都生成的是二进制文件。</p>
<p><code v-pre>SSF</code>：用于处理<code v-pre>Excel</code>日期格式的模块。</p>
<p><code v-pre>BookType</code>：定义<code v-pre>Excel</code>文件类型（如<code v-pre>xlsx</code>、<code v-pre>xls</code>）</p>
<h2 id="各部分函数解析" tabindex="-1"><a class="header-anchor" href="#各部分函数解析"><span>各部分函数解析</span></a></h2>
<h3 id="基本信息" tabindex="-1"><a class="header-anchor" href="#基本信息"><span>基本信息</span></a></h3>
<p>供外部使用导出<code v-pre>Excel</code>文件的方法只有<a href="#export_table_to_excel">export_table_to_excel</a>和<a href="#export_json_to_excel">export_json_to_excel</a>，其他的方法和结构都是为这两个导出方法服务的。</p>
<h3 id="关于generatearray" tabindex="-1"><a class="header-anchor" href="#关于generatearray"><span>关于generateArray</span></a></h3>
<p>这个方法的作用是将<code v-pre>HTML</code>表格（<code v-pre>&lt;table&gt;</code> 元素）转换为二维数组，并处理表格中的合并单元格（<code v-pre>colspan</code>和<code v-pre>rowspan</code>）</p>
<p>总体来说，它的处理就是把需要合并的单元格全都补充上<code v-pre>null</code>，并且将表格中的<code v-pre>colspan</code>和<code v-pre>rowspan</code>获取保存下来作为合并信息。</p>
<p>补充<code v-pre>null</code>后的二维数组就是<code v-pre>out</code>，显而易见，光有<code v-pre>null</code>补充并不能区分这部分单元格要如何合并，可能是行合并，也可能列合并，于是还需要对应的合并信息，也就是<code v-pre>range</code>，所以函数返回值是<code v-pre>[out, ranges]</code></p>
<h4 id="函数参数与返回值" tabindex="-1"><a class="header-anchor" href="#函数参数与返回值"><span>函数参数与返回值</span></a></h4>
<p>参数：<code v-pre>table</code>：一个<code v-pre>&lt;table&gt;</code>元素。</p>
<p>返回值：一个数组<code v-pre>[out, ranges]</code>，其中：</p>
<p><code v-pre>out</code>：转换后的二维数组，每个子数组代表表格的一行。</p>
<p><code v-pre>ranges</code>：合并单元格的范围信息，用于后续处理。</p>
<h4 id="初始化变量" tabindex="-1"><a class="header-anchor" href="#初始化变量"><span>初始化变量</span></a></h4>
<p>先初始化要返回的结果，并获取表格中的所有行，后续以行为大单位遍历</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const out: any[] = []; // 存储最终的二维数组</span>
<span class="line">const rows = table.querySelectorAll('tr'); // 获取所有行</span>
<span class="line">const ranges: any[] = []; // 存储合并单元格的范围</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="遍历每一行" tabindex="-1"><a class="header-anchor" href="#遍历每一行"><span>遍历每一行</span></a></h4>
<p>正如上面所说，以行为大单位遍历，后面再细分列，也就是到每个单元格了，这里的outRow用于存储处理完毕后的行内容，也就是后续会对它输入单元格内容并补充该行所需的<code v-pre>null</code>：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">for (let R = 0; R &lt; rows.length; ++R) {</span>
<span class="line">  const outRow: any[] = []; // 当前行的数据</span>
<span class="line">  const row = rows[R];</span>
<span class="line">  const columns = row.querySelectorAll('td'); // 获取当前行的所有单元格</span>
<span class="line">  // ...处理每一列</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="处理每个单元格" tabindex="-1"><a class="header-anchor" href="#处理每个单元格"><span>处理每个单元格</span></a></h4>
<p>细分到列，也就是每个单元格，在上面介绍过，这个函数的处理需要列合并数和行合并数来生成<code v-pre>range</code>，也就是合并信息</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">for (const cell of columns) {</span>
<span class="line">  let colspan = cell.getAttribute('colspan'); // 获取列合并数</span>
<span class="line">  let rowspan = cell.getAttribute('rowspan'); // 获取行合并数</span>
<span class="line">  let cellValue = cell.innerText; // 获取单元格文本内容</span>
<span class="line">  </span>
<span class="line">  // 转换数值类型（如果是纯数字）</span>
<span class="line">  if (cellValue !== '' &amp;&amp; cellValue === +cellValue) cellValue = +cellValue;</span>
<span class="line">  // ...处理合并单元格</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="处理记录的合并单元格——行合并" tabindex="-1"><a class="header-anchor" href="#处理记录的合并单元格——行合并"><span>处理记录的合并单元格——行合并</span></a></h4>
<p>因为是行遍历，对行处理，所以如果出现行合并，就需要ranges记录信息，才能在进入需要被上一行合并的第二行时准确判断出需要合并，这部分代码主要用于处理跨行合并，之前已经读取过合并信息(<a href="#%E5%A4%84%E7%90%86%E5%BD%93%E5%89%8D%E5%8D%95%E5%85%83%E6%A0%BC%E7%9A%84%E5%90%88%E5%B9%B6%E5%B1%9E%E6%80%A7">下面</a>马上讲到)，后续遍历读取合并区域信息来判断是否需要合并，需要时填充<code v-pre>null</code>进入该行结果。
之所以说这里主要处理行合并，是因为列合并是在<a href="#%E6%B7%BB%E5%8A%A0%E5%8D%95%E5%85%83%E6%A0%BC%E5%80%BC%E5%B9%B6%E5%A4%84%E7%90%86colspan">下面</a>读取到单元格列合并信息就立刻处理掉的，只有跨行合并这种在行遍历情况下需要后续才处理的、处理比较迟钝的情况才会需要通过ranges合并信息来判断并处理。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">ranges.forEach((range) => {</span>
<span class="line">  if (</span>
<span class="line">    R >= range.s.r &amp;&amp; // 当前行是否在合并范围内</span>
<span class="line">    R &lt;= range.e.r &amp;&amp;</span>
<span class="line">    outRow.length >= range.s.c &amp;&amp; // 当前列是否在合并范围内</span>
<span class="line">    outRow.length &lt;= range.e.c</span>
<span class="line">  ) {</span>
<span class="line">    // 在合并区域内，填充 null 以占位</span>
<span class="line">    for (let i = 0; i &lt;= range.e.c - range.s.c; ++i) outRow.push(null);</span>
<span class="line">  }</span>
<span class="line">});</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="记录当前单元格的合并属性" tabindex="-1"><a class="header-anchor" href="#记录当前单元格的合并属性"><span>记录当前单元格的合并属性</span></a></h4>
<p>这里就是填写<code v-pre>ranges</code>信息的部分了，根据之前读取的行合并、列合并信息，可以计算、记录下合并单元格的范围，为后续进行跨行合并，提供结果给<code v-pre>Excel</code>生成能够正确合并单元格的表格</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">if (rowspan || colspan) {</span>
<span class="line">  rowspan = rowspan || 1; // 默认值为 1</span>
<span class="line">  colspan = colspan || 1;</span>
<span class="line">  </span>
<span class="line">  // 记录合并单元格的范围</span>
<span class="line">  ranges.push({</span>
<span class="line">    s: { r: R, c: outRow.length }, // 起始位置</span>
<span class="line">    e: { r: R + rowspan - 1, c: outRow.length + colspan - 1 } // 结束位置</span>
<span class="line">  });</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="添加当前单元格值并进行列合并" tabindex="-1"><a class="header-anchor" href="#添加当前单元格值并进行列合并"><span>添加当前单元格值并进行列合并</span></a></h4>
<p>对于读取到单元格的值，立刻就填入当行结果<code v-pre>outRow</code>，并对当前如果有列合并，也是立刻处理</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">outRow.push(cellValue !== '' ? cellValue : null); // 添加当前单元格值</span>
<span class="line"></span>
<span class="line">// 处理 colspan：为合并的列添加 null 占位</span>
<span class="line">if (colspan) for (let k = 0; k &lt; colspan - 1; ++k) outRow.push(null);</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="处理完输入结果返回" tabindex="-1"><a class="header-anchor" href="#处理完输入结果返回"><span>处理完输入结果返回</span></a></h4>
<p>把每行结果<code v-pre>outRow</code>处理好之后，<code v-pre>push</code>进最终结果的数组中，行数遍历完毕，所有结果生成完毕，则返回：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">function generateArray(table: any) {</span>
<span class="line">  ...</span>
<span class="line">  for (let R = 0; R &lt; rows.length; ++R) {</span>
<span class="line">    ...</span>
<span class="line">    out.push(outRow)</span>
<span class="line">  }</span>
<span class="line">  return [out, ranges]</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="关于datenum" tabindex="-1"><a class="header-anchor" href="#关于datenum"><span>关于datenum</span></a></h3>
<p>这个方法的作用是将<code v-pre>JavaScript</code>日期对象或时间字符串 转换为<code v-pre>Excel</code>内部表示日期的数值（称为「日期序列值」）。这在将日期数据导出到<code v-pre>Excel</code>时非常重要，因为<code v-pre>Excel</code>和<code v-pre>JavaScript</code>对日期的存储方式不同。</p>
<h4 id="excel-的日期存储机制" tabindex="-1"><a class="header-anchor" href="#excel-的日期存储机制"><span>Excel 的日期存储机制</span></a></h4>
<p>要了解怎么做，为什么这么做，首先必须知道<code v-pre>Excel</code>的日期存储机制：</p>
<p><code v-pre>Excel</code>使用<em>数值</em>表示日期，其中：</p>
<p><code v-pre>1</code>代表<em>1900年1月1日</em>（<code v-pre>Windows</code>系统默认）或 <em>1904年1月1日</em>（<code v-pre>Mac</code>系统默认），后续日期依次递增（如<code v-pre>2</code>是<em>1900年1月2日</em>），时间部分用小数表示（如<code v-pre>0.5</code>代表中午<code v-pre>12</code>点）</p>
<p>了解这个，我们就能理解为什么<code v-pre>datenum</code>方法有第二个参数<code v-pre>date1904</code>了</p>
<h4 id="处理-1904-年日期系统" tabindex="-1"><a class="header-anchor" href="#处理-1904-年日期系统"><span>处理 1904 年日期系统</span></a></h4>
<p>之前已经解释过，<code v-pre>Mac</code>系统默认比<code v-pre>Windows</code>系统默认晚了<code v-pre>4</code>年，即晚<code v-pre>1462</code>天（<code v-pre>4</code>年差+闰年调整）</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">if (date1904) {</span>
<span class="line">  v += 1462;</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>比较意外，读到这部分代码的时候，我意识到这个项目原本这么写这部分代码是错误的，因为<code v-pre>v</code>是一个<code v-pre>Date</code>对象，如果对一个<code v-pre>Date</code>对象直接执行<code v-pre>v += 1462</code>会发生隐式类型转换，变成增加字符串<code v-pre>1462</code>，这与原本增加<code v-pre>1462</code>天的想法完全不是一回事。</p>
<p>因此想实现原本的想法，这部分代码应该修改为：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">if (date1904) {</span>
<span class="line">  v.setDate(v.getDate() + 1462);</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>不过这都是根据<a href="#%E5%B7%A5%E5%85%B7%E7%9A%84%E6%80%BB%E4%BD%93%E5%AE%9E%E7%8E%B0">整个工具的总体实现</a>都仅在<code v-pre>sheet_from_array_of_arrays</code>中使用<code v-pre>datenum</code>方法，并在其中对传入的参数做了判断，确保其为<code v-pre>Date</code>对象而设计的，但从长远角度考虑，因为不确定未来会不会还在别的地方使用，不能保证以后使用的人还记得提前对传入参数作判断，所以最好还是在<code v-pre>datenum</code>中也做一个判断提示</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">function datenum(v: Date, date1904: boolean = false) {</span>
<span class="line">  // 严格校验输入类型为 Date 对象</span>
<span class="line">  if (!(v instanceof Date)) {</span>
<span class="line">    throw new Error('输入必须是 Date 对象');</span>
<span class="line">  }</span>
<span class="line">  ...</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="计算-excel-日期序列值" tabindex="-1"><a class="header-anchor" href="#计算-excel-日期序列值"><span>计算 Excel 日期序列值</span></a></h4>
<p>计算完输入日期，并处理了对应不同系统的时间，再来统一计算距离系统默认时间过了多少天——即计算<code v-pre>Excel</code>内部表示日期的<em>日期序列值</em></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">  const epoch = Date.parse(v)</span>
<span class="line">  return (</span>
<span class="line">    (epoch - (new Date(Date.UTC(1899, 11, 30)) as any)) / (24 * 60 * 60 * 1000)</span>
<span class="line">  )</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里的原代码也是错的，于是我决定写下下面的<a href="#%E5%90%90%E6%A7%BD%E4%B8%8E%E9%87%8D%E6%9E%84">吐槽与重构</a>给出一个统一的更正结果，不过思路还是可以看的</p>
<h4 id="吐槽与重构" tabindex="-1"><a class="header-anchor" href="#吐槽与重构"><span>吐槽与重构</span></a></h4>
<p>上面说原代码又有错，是因为既然已经确保<code v-pre>v</code>是<code v-pre>Date</code>对象，也就不可能用<code v-pre>Date.parse(v)</code>转换，因为<code v-pre>Date.parse(v)</code>期望接收字符串参数，而不是<code v-pre>Date</code>对象。原版的代码写的非常混乱，分明自己都不清楚到底要传什么参数了。于是我把这个方法完整重写了一遍：</p>
<p>思路和上面是一样的，补充了校验输入类型，然后处理<code v-pre>Mac</code>系统默认的<code v-pre>1904</code>年日期系统，再计算<code v-pre>Excel</code>日期序列值即可，注意<code v-pre>(v- (new Date(Date.UTC(1899, 11, 30))))</code>这部分的计算是利用减法运算的类型隐式转换，<code v-pre>v</code>和后面的<code v-pre>new Date</code>都是<code v-pre>Date</code>对象，会隐式调用<code v-pre>valueOf()</code>转为时间戳（毫秒）相减</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">function datenum(v: Date, date1904: boolean = false) {</span>
<span class="line">  // 严格校验输入类型为 Date 对象</span>
<span class="line">  if (!(v instanceof Date)) {</span>
<span class="line">    throw new Error('输入必须是 Date 对象');</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (date1904) {</span>
<span class="line">    v = new Date(v); // 避免修改原始对象</span>
<span class="line">    v.setDate(v.getDate() + 1462);</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  return (</span>
<span class="line">    (v- (new Date(Date.UTC(1899, 11, 30)))) / (24 * 60 * 60 * 1000)</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="关于sheet-from-array-of-arrays" tabindex="-1"><a class="header-anchor" href="#关于sheet-from-array-of-arrays"><span>关于sheet_from_array_of_arrays</span></a></h3>
<p>这个方法的作用是将二维数组转换为<code v-pre>xlsx</code>所需的工作表（<code v-pre>Worksheet</code>）对象</p>
<h4 id="初始化工作表对象和范围" tabindex="-1"><a class="header-anchor" href="#初始化工作表对象和范围"><span>初始化工作表对象和范围</span></a></h4>
<p><code v-pre>ws</code>是最终的工作表对象，将包含所有单元格数据</p>
<p><code v-pre>range</code>用于记录工作表的实际范围（起始单元格和结束单元格）</p>
<p><code v-pre>s</code>代表开始，初始值设为极大值以便后续比较</p>
<p><code v-pre>e</code>代表结束，初始值设为极小值以便后续比较</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const ws: any = {};</span>
<span class="line">const range = {</span>
<span class="line">  s: { c: 10000000, r: 10000000 }, // 起始位置设为极大值</span>
<span class="line">  e: { c: 0, r: 0 }                // 结束位置设为极小值</span>
<span class="line">};</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="遍历二维数组-处理每个单元格" tabindex="-1"><a class="header-anchor" href="#遍历二维数组-处理每个单元格"><span>遍历二维数组，处理每个单元格</span></a></h4>
<h5 id="范围更新-确定工作表的实际范围" tabindex="-1"><a class="header-anchor" href="#范围更新-确定工作表的实际范围"><span>范围更新：确定工作表的实际范围</span></a></h5>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">for (let R = 0; R !== data.length; ++R) {</span>
<span class="line">  for (let C = 0; C !== data[R].length; ++C) {</span>
<span class="line">    // 更新范围</span>
<span class="line">    if (range.s.r > R) range.s.r = R;</span>
<span class="line">    if (range.s.c > C) range.s.c = C;</span>
<span class="line">    if (range.e.r &lt; R) range.e.r = R;</span>
<span class="line">    if (range.e.c &lt; C) range.e.c = C;</span>
<span class="line">    </span>
<span class="line">    // 处理单元格</span>
<span class="line">    ...</span>
<span class="line">    // 编码单元格引用（如 A1, B2 等）</span>
<span class="line">    ...</span>
<span class="line">    // 根据单元格值类型设置格式</span>
<span class="line">    ...</span>
<span class="line">    </span>
<span class="line">    ws[cellRef] = cell;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="创建单元格对象-生成单元格引用" tabindex="-1"><a class="header-anchor" href="#创建单元格对象-生成单元格引用"><span>创建单元格对象，生成单元格引用</span></a></h5>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">// 处理单元格</span>
<span class="line">    const cell: any = { v: data[R][C] };</span>
<span class="line">    if (cell.v === null) continue;</span>
<span class="line">    </span>
<span class="line">    // 编码单元格引用（如 A1, B2 等）</span>
<span class="line">    const cellRef = utils.encode_cell({ c: C, r: R });</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="根据单元格值类型设置格式-date对象转日期序列值-单元格添加到工作表" tabindex="-1"><a class="header-anchor" href="#根据单元格值类型设置格式-date对象转日期序列值-单元格添加到工作表"><span>根据单元格值类型设置格式，Date对象转日期序列值，单元格添加到工作表</span></a></h5>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">    // 根据单元格值类型设置格式</span>
<span class="line">    if (typeof cell.v === 'number') cell.t = 'n';</span>
<span class="line">    else if (typeof cell.v === 'boolean') cell.t = 'b';</span>
<span class="line">    else if (cell.v instanceof Date) {</span>
<span class="line">      cell.t = 'n';</span>
<span class="line">      cell.z = (SSF as any)._table[14];</span>
<span class="line">      cell.v = datenum(cell.v);</span>
<span class="line">    } else cell.t = 's';</span>
<span class="line">    </span>
<span class="line">    ws[cellRef] = cell; // 将单元格添加到工作表</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="设置工作表范围并返回" tabindex="-1"><a class="header-anchor" href="#设置工作表范围并返回"><span>设置工作表范围并返回</span></a></h4>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">  if (range.s.c &lt; 10000000) ws['!ref'] = utils.encode_range(range)</span>
<span class="line">  return ws</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="关于export-table-to-excel" tabindex="-1"><a class="header-anchor" href="#关于export-table-to-excel"><span>关于export_table_to_excel</span></a></h3>
<h3 id="关于export-json-to-excel" tabindex="-1"><a class="header-anchor" href="#关于export-json-to-excel"><span>关于export_json_to_excel</span></a></h3>
<p>这个方法的作用是将结构化<code v-pre>JSON</code>数据导出为<code v-pre>Excel</code>，是供外部使用导出<code v-pre>Excel</code>文件的方法</p>
<h4 id="函数参数与默认值" tabindex="-1"><a class="header-anchor" href="#函数参数与默认值"><span>函数参数与默认值</span></a></h4>
<p>首先是函数的参数和默认值，这在<RouteLink to="/guide/theFirstInternship/gain5.html#%E4%BA%86%E8%A7%A3%E6%96%B9%E6%B3%95%E5%92%8C%E5%8F%82%E6%95%B0">之前的文档</RouteLink>里也有讲解</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">export function export_json_to_excel(</span>
<span class="line">  {</span>
<span class="line">    multiHeader = [],       // 多级表头（数组，如 [[{label: '一级'}, {label: '二级'}]]）</span>
<span class="line">    header,                 // 单级表头（数组，如 ['字段1', '字段2']）</span>
<span class="line">    data,                   // 数据主体（数组，如 [{key: val}, ...]）</span>
<span class="line">    filename,               // 文件名（字符串）</span>
<span class="line">    merges = [],            // 合并单元格范围（数组，如 ['A1:B2', 'C3:D3']）</span>
<span class="line">    autoWidth = true,       // 是否自动计算列宽（布尔值）</span>
<span class="line">    bookType = 'xlsx',      // 文件类型（'xlsx'/'xls'/'csv'等）</span>
<span class="line">  } = { </span>
<span class="line">    header: {},            // 默认空对象（需修正为数组，可能是代码笔误）</span>
<span class="line">    data: [] as any[],      // 默认空数组</span>
<span class="line">    filename: ''            // 默认文件名</span>
<span class="line">  }</span>
<span class="line">) { ... }</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="数据预处理" tabindex="-1"><a class="header-anchor" href="#数据预处理"><span>数据预处理</span></a></h4>
<p>接下来是数据预处理，组装表头和数据：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">filename = filename || 'excel-list' // 处理默认文件名</span>
<span class="line">data = [...data] // 复制原始数据，避免修改源数据</span>
<span class="line">data.unshift(header) // 将单级表头插入数据顶部（作为第一行）</span>
<span class="line"></span>
<span class="line">// 插入多级表头（从最后一级到第一级，保持层级顺序）</span>
<span class="line">for (let i = multiHeader.length - 1; i > -1; i--) {</span>
<span class="line">  data.unshift(multiHeader[i])</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意这里把表头、多级表头插入到data前面，说明表头数据也是放到data中一起进行处理的</p>
<h4 id="生成工作表-worksheet" tabindex="-1"><a class="header-anchor" href="#生成工作表-worksheet"><span>生成工作表（Worksheet）</span></a></h4>
<p>这部分主要是调用<code v-pre>sheet_from_array_of_arrays</code>函数，将<code v-pre>data</code>转换为<code v-pre>xlsx</code>所需的<code v-pre>Worksheet</code>对象，具体实现看关于<code v-pre>sheet_from_array_of_arrays</code>函数的讲解部分</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const wsName = 'SheetJS'</span>
<span class="line">const wb = new Workbook()</span>
<span class="line">const ws = sheet_from_array_of_arrays(data) // 将二维数组转为工作表</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="合并单元格处理" tabindex="-1"><a class="header-anchor" href="#合并单元格处理"><span>合并单元格处理</span></a></h4>
<p>这部分是对单元格进行合并，虽然我导出的列表没有用到，但通过举例就能讲清楚它的作用：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">if (merges.length > 0) {</span>
<span class="line">  if (!ws['!merges']) ws['!merges'] = [] // 初始化合并范围数组</span>
<span class="line">  merges.forEach((item) => {</span>
<span class="line">    ws['!merges'].push(utils.decode_range(item)) // 将字符串范围转为对象</span>
<span class="line">  })</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>想要合并，需要调用方法时就传入合并规则，比如存在这种情况：</p>
<p>希望产品信息合并1-3三个单元格，销售信息合并4-5两个单元格。</p>
<p>那么就会设置A1-C1合并，D1-E1合并，最后调用时传入合并规则：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">const multiHeader = [</span>
<span class="line">  ['产品信息', null, null, '销售信息', null], // 第一行（合并后显示）</span>
<span class="line">  ['编码', '名称', '单价', '销量', '状态']    // 第二行</span>
<span class="line">];</span>
<span class="line">const merges = ['A1:C1', 'D1:E1'];</span>
<span class="line">...</span>
<span class="line">export_json_to_excel({</span>
<span class="line">  multiHeader,</span>
<span class="line">  ...</span>
<span class="line">  merges, // 传入合并规则</span>
<span class="line">});</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="自动列宽计算" tabindex="-1"><a class="header-anchor" href="#自动列宽计算"><span>自动列宽计算</span></a></h4>
<p>这部分是根据该列所有行的内容自动调整列宽，避免内容截断</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">if (autoWidth) {</span>
<span class="line">  // 1. 计算每列每一行的宽度</span>
<span class="line">  const colWidth = data.map((row) => </span>
<span class="line">    row.map((val) => {</span>
<span class="line">      if (val === null) return { wch: 10 } // 空值默认宽度10</span>
<span class="line">      const str = val.toString()</span>
<span class="line">      // 判断是否为双字节字符（如中文）</span>
<span class="line">      const isDoubleByte = str.charCodeAt(0) > 255 </span>
<span class="line">      return { wch: isDoubleByte ? str.length * 2 : str.length }</span>
<span class="line">    })</span>
<span class="line">  )</span>
<span class="line"></span>
<span class="line">  // 2. 取每列的最大宽度</span>
<span class="line">  const result = colWidth[0].slice() // 以第一行宽度为初始值</span>
<span class="line">  for (let i = 1; i &lt; colWidth.length; i++) {</span>
<span class="line">    for (let j = 0; j &lt; colWidth[i].length; j++) {</span>
<span class="line">      if (result[j].wch &lt; colWidth[i][j].wch) {</span>
<span class="line">        result[j].wch = colWidth[i][j].wch // 覆盖为更大值</span>
<span class="line">      }</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  // 3. 应用列宽到工作表</span>
<span class="line">  ws['!cols'] = result</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>具体实现逻辑都在代码中用注释标明，具体再讲一些：</p>
<p>单位<code v-pre>wch</code>：表示列宽，<code v-pre>Excel</code>中<code v-pre>1</code>个字符宽度约等于<code v-pre>7</code>像素。</p>
<p>提到的双字节字符处理，是因为中文、日文等字符占用<code v-pre>2</code>个字符宽度，因此<code v-pre>str.length * 2</code>。而英文、数字等单字节字符占用 1 个字符宽度。</p>
<p>关于<code v-pre>ws['!cols']</code>：在<code v-pre>SheetJS</code>（即<code v-pre>XLSX</code>库）中，<code v-pre>!cols</code> 是工作表（<code v-pre>Sheet</code>）对象的一个特殊属性，用于存储列宽配置。它是<code v-pre>SheetJS</code>约定的内部属性名，用于标识列宽信息，类似的还有<code v-pre>!merges</code>（合并单元格）、<code v-pre>!rows</code>（行高）等以<code v-pre>!</code>开头的元数据属性。</p>
<h4 id="生成文件并下载" tabindex="-1"><a class="header-anchor" href="#生成文件并下载"><span>生成文件并下载</span></a></h4>
<p>经过上面对数据的处理，这部分就只是调用函数生成文件并下载了：</p>
<p><code v-pre>write(wb, options)</code>：使用<code v-pre>xlsx</code>库将工作簿（<code v-pre>wb</code>）转为指定格式的二进制数据。</p>
<p><code v-pre>s2ab(wbout)</code>：将二进制字符串转为<code v-pre>ArrayBuffer</code>，用于创建<code v-pre>Blob</code>对象。</p>
<p><code v-pre>saveAs</code>：通过<code v-pre>file-saver</code>库触发浏览器下载。</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">wb.SheetNames.push(wsName) // 添加工作表名称</span>
<span class="line">wb.Sheets[wsName] = ws // 将工作表添加到工作簿</span>
<span class="line"></span>
<span class="line">// 生成二进制数据</span>
<span class="line">const wbout = write(wb, {</span>
<span class="line">  bookType: bookType as BookType, // 文件类型</span>
<span class="line">  bookSST: false, // 是否生成共享字符串表（默认false）</span>
<span class="line">  type: 'binary' // 输出类型为二进制字符串</span>
<span class="line">})</span>
<span class="line"></span>
<span class="line">// 保存文件</span>
<span class="line">saveAs(</span>
<span class="line">  new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),</span>
<span class="line">  `${filename}.${bookType}`</span>
<span class="line">)</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="工具的总体实现" tabindex="-1"><a class="header-anchor" href="#工具的总体实现"><span>工具的总体实现</span></a></h2>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">import { saveAs } from 'file-saver'</span>
<span class="line">import { utils, SSF, write, BookType } from 'xlsx'</span>
<span class="line"></span>
<span class="line">function generateArray(table: any) {</span>
<span class="line">  const out: any[] = []</span>
<span class="line">  const rows = table.querySelectorAll('tr')</span>
<span class="line">  const ranges: any[] = []</span>
<span class="line">  for (let R = 0; R &lt; rows.length; ++R) {</span>
<span class="line">    const outRow: any[] = []</span>
<span class="line">    const row = rows[R]</span>
<span class="line">    const columns = row.querySelectorAll('td')</span>
<span class="line">    for (const cell of columns) {</span>
<span class="line">      let colspan = cell.getAttribute('colspan')</span>
<span class="line">      let rowspan = cell.getAttribute('rowspan')</span>
<span class="line">      let cellValue = cell.innerText</span>
<span class="line">      if (cellValue !== '' &amp;&amp; cellValue === +cellValue) cellValue = +cellValue</span>
<span class="line">      ranges.forEach((range) => {</span>
<span class="line">        if (</span>
<span class="line">          R >= range.s.r &amp;&amp;</span>
<span class="line">          R &lt;= range.e.r &amp;&amp;</span>
<span class="line">          outRow.length >= range.s.c &amp;&amp;</span>
<span class="line">          outRow.length &lt;= range.e.c</span>
<span class="line">        ) {</span>
<span class="line">          for (let i = 0; i &lt;= range.e.c - range.s.c; ++i) outRow.push(null)</span>
<span class="line">        }</span>
<span class="line">      })</span>
<span class="line">      if (rowspan || colspan) {</span>
<span class="line">        rowspan = rowspan || 1</span>
<span class="line">        colspan = colspan || 1</span>
<span class="line">        ranges.push({</span>
<span class="line">          s: {</span>
<span class="line">            r: R,</span>
<span class="line">            c: outRow.length,</span>
<span class="line">          },</span>
<span class="line">          e: {</span>
<span class="line">            r: R + rowspan - 1,</span>
<span class="line">            c: outRow.length + colspan - 1,</span>
<span class="line">          },</span>
<span class="line">        })</span>
<span class="line">      }</span>
<span class="line"></span>
<span class="line">      outRow.push(cellValue !== '' ? cellValue : null)</span>
<span class="line"></span>
<span class="line">      if (colspan) for (let k = 0; k &lt; colspan - 1; ++k) outRow.push(null)</span>
<span class="line">    }</span>
<span class="line">    out.push(outRow)</span>
<span class="line">  }</span>
<span class="line">  return [out, ranges]</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">// function datenum(v: any, date1904 = null) {</span>
<span class="line">//   if (date1904) {</span>
<span class="line">//     v += 1462</span>
<span class="line">//   }</span>
<span class="line">//   const epoch = Date.parse(v)</span>
<span class="line">//   return (</span>
<span class="line">//     (epoch - (new Date(Date.UTC(1899, 11, 30)) as any)) / (24 * 60 * 60 * 1000)</span>
<span class="line">//   )</span>
<span class="line">// }</span>
<span class="line"></span>
<span class="line">// 上面写法有误，我改成下面这种</span>
<span class="line">function datenum(v: Date, date1904: boolean = false) {</span>
<span class="line">  // 严格校验输入类型为 Date 对象</span>
<span class="line">  if (!(v instanceof Date)) {</span>
<span class="line">    throw new Error('输入必须是 Date 对象');</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (date1904) {</span>
<span class="line">    v = new Date(v); // 避免修改原始对象</span>
<span class="line">    v.setDate(v.getDate() + 1462);</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  return (</span>
<span class="line">    (v- (new Date(Date.UTC(1899, 11, 30)))) / (24 * 60 * 60 * 1000)</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">function sheet_from_array_of_arrays(data: any) {</span>
<span class="line">  const ws: any = {}</span>
<span class="line">  const range = {</span>
<span class="line">    s: {</span>
<span class="line">      c: 10000000,</span>
<span class="line">      r: 10000000,</span>
<span class="line">    },</span>
<span class="line">    e: {</span>
<span class="line">      c: 0,</span>
<span class="line">      r: 0,</span>
<span class="line">    },</span>
<span class="line">  }</span>
<span class="line">  for (let R = 0; R !== data.length; ++R) {</span>
<span class="line">    for (let C = 0; C !== data[R].length; ++C) {</span>
<span class="line">      if (range.s.r > R) range.s.r = R</span>
<span class="line">      if (range.s.c > C) range.s.c = C</span>
<span class="line">      if (range.e.r &lt; R) range.e.r = R</span>
<span class="line">      if (range.e.c &lt; C) range.e.c = C</span>
<span class="line">      const cell: any = {</span>
<span class="line">        v: data[R][C],</span>
<span class="line">      }</span>
<span class="line">      if (cell.v === null) continue</span>
<span class="line">      const cellRef = utils.encode_cell({</span>
<span class="line">        c: C,</span>
<span class="line">        r: R,</span>
<span class="line">      })</span>
<span class="line"></span>
<span class="line">      if (typeof cell.v === 'number') cell.t = 'n'</span>
<span class="line">      else if (typeof cell.v === 'boolean') cell.t = 'b'</span>
<span class="line">      else if (cell.v instanceof Date) {</span>
<span class="line">        cell.t = 'n'</span>
<span class="line">        cell.z = (SSF as any)._table[14]</span>
<span class="line">        cell.v = datenum(cell.v)</span>
<span class="line">      } else cell.t = 's'</span>
<span class="line"></span>
<span class="line">      ws[cellRef] = cell</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">  if (range.s.c &lt; 10000000) ws['!ref'] = utils.encode_range(range)</span>
<span class="line">  return ws</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">class Workbook {</span>
<span class="line">  public SheetNames: any[] = []</span>
<span class="line">  public Sheets: any = {}</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">function s2ab(s: any) {</span>
<span class="line">  const buf = new ArrayBuffer(s.length)</span>
<span class="line">  const view = new Uint8Array(buf)</span>
<span class="line">  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) &amp; 0xff</span>
<span class="line">  return buf</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">export function export_table_to_excel(id: any) {</span>
<span class="line">  const theTable = document.getElementById(id)</span>
<span class="line">  const oo = generateArray(theTable)</span>
<span class="line">  const ranges = oo[1]</span>
<span class="line"></span>
<span class="line">  const data = oo[0]</span>
<span class="line">  const wsName = 'SheetJS'</span>
<span class="line"></span>
<span class="line">  const wb = new Workbook()</span>
<span class="line">  const ws = sheet_from_array_of_arrays(data)</span>
<span class="line"></span>
<span class="line">  ws['!merges'] = ranges</span>
<span class="line"></span>
<span class="line">  wb.SheetNames.push(wsName)</span>
<span class="line">  wb.Sheets[wsName] = ws</span>
<span class="line"></span>
<span class="line">  const wbout = write(wb, {</span>
<span class="line">    bookType: 'xlsx',</span>
<span class="line">    bookSST: false,</span>
<span class="line">    type: 'binary',</span>
<span class="line">  })</span>
<span class="line"></span>
<span class="line">  saveAs(</span>
<span class="line">    new Blob([s2ab(wbout)], {</span>
<span class="line">      type: 'application/octet-stream',</span>
<span class="line">    }),</span>
<span class="line">    'test.xlsx'</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">export function export_json_to_excel(</span>
<span class="line">  {</span>
<span class="line">    multiHeader = [],</span>
<span class="line">    header,</span>
<span class="line">    data,</span>
<span class="line">    filename,</span>
<span class="line">    merges = [],</span>
<span class="line">    autoWidth = true,</span>
<span class="line">    bookType = 'xlsx',</span>
<span class="line">  } = { header: {}, data: [] as any[], filename: '' }</span>
<span class="line">) {</span>
<span class="line">  /* original data */</span>
<span class="line">  filename = filename || 'excel-list'</span>
<span class="line">  data = [...data]</span>
<span class="line">  data.unshift(header)</span>
<span class="line"></span>
<span class="line">  for (let i = multiHeader.length - 1; i > -1; i--) {</span>
<span class="line">    data.unshift(multiHeader[i])</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  const wsName = 'SheetJS'</span>
<span class="line">  const wb = new Workbook()</span>
<span class="line">  const ws = sheet_from_array_of_arrays(data)</span>
<span class="line"></span>
<span class="line">  if (merges.length > 0) {</span>
<span class="line">    if (!ws['!merges']) {</span>
<span class="line">      ws['!merges'] = []</span>
<span class="line">    }</span>
<span class="line">    merges.forEach((item) => {</span>
<span class="line">      ws['!merges'].push(utils.decode_range(item))</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (autoWidth) {</span>
<span class="line">    const colWidth = data.map((row) =></span>
<span class="line">      row.map((val: any) => {</span>
<span class="line">        if (val === null) {</span>
<span class="line">          return {</span>
<span class="line">            wch: 10,</span>
<span class="line">          }</span>
<span class="line">        } else if (val.toString().charCodeAt(0) > 255) {</span>
<span class="line">          return {</span>
<span class="line">            wch: val.toString().length * 2,</span>
<span class="line">          }</span>
<span class="line">        } else {</span>
<span class="line">          return {</span>
<span class="line">            wch: val.toString().length,</span>
<span class="line">          }</span>
<span class="line">        }</span>
<span class="line">      })</span>
<span class="line">    )</span>
<span class="line">    const result = colWidth[0]</span>
<span class="line">    for (let i = 1; i &lt; colWidth.length; i++) {</span>
<span class="line">      for (let j = 0; j &lt; colWidth[i].length; j++) {</span>
<span class="line">        if (result[j]['wch'] &lt; colWidth[i][j]['wch']) {</span>
<span class="line">          result[j]['wch'] = colWidth[i][j]['wch']</span>
<span class="line">        }</span>
<span class="line">      }</span>
<span class="line">    }</span>
<span class="line">    ws['!cols'] = result</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  wb.SheetNames.push(wsName)</span>
<span class="line">  wb.Sheets[wsName] = ws</span>
<span class="line"></span>
<span class="line">  const wbout = write(wb, {</span>
<span class="line">    bookType: bookType as BookType,</span>
<span class="line">    bookSST: false,</span>
<span class="line">    type: 'binary',</span>
<span class="line">  })</span>
<span class="line">  saveAs(</span>
<span class="line">    new Blob([s2ab(wbout)], {</span>
<span class="line">      type: 'application/octet-stream',</span>
<span class="line">    }),</span>
<span class="line">    `${filename}.${bookType}`</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="后续要补充的讲解" tabindex="-1"><a class="header-anchor" href="#后续要补充的讲解"><span>后续要补充的讲解：</span></a></h2>
<p>sheet_from_array_of_arrays函数实现、s2ab实现、<code v-pre>Blob</code>对象是什么、saveAs如何触发浏览器下载，其他各部分其他函数；</p>
</div></template>


