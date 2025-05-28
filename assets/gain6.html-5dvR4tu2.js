import{_ as l,c as i,d as e,a as c,b as n,e as d,w as p,r,o as v}from"./app-B05S7fmk.js";const t={};function u(o,s){const a=r("RouteLink");return v(),i("div",null,[s[3]||(s[3]=e('<h1 id="收获三——实现excel导出工具" tabindex="-1"><a class="header-anchor" href="#收获三——实现excel导出工具"><span>收获三——实现Excel导出工具</span></a></h1><h2 id="核心依赖库" tabindex="-1"><a class="header-anchor" href="#核心依赖库"><span>核心依赖库</span></a></h2><p><code>file-saver</code>：</p><p>功能：实现文件保存到本地的功能，提供<code>saveAs</code>方法。</p><p><code>xlsx</code>：</p><p>功能：操作<code>Excel</code>文件的核心库，包含解析、生成<code>Excel</code>的工具函数（如<code>utils</code>、<code>write</code>）。</p><p><code>utils</code>：提供了一系列用于<em>转换数据格式</em>和<em>操作工作表</em>的工具函数。可以看到这个库使用了三个方法：<code>utils.encode_cell</code>、<code>utils.encode_range</code>、<code>utils.decode_range</code>，都是用于<em>处理单元格地址和区域</em>的核心工具函数。</p><p><code>write</code>：用于将工作表数据转换为不同格式的文件内容，支持多种输出格式，在这里都生成的是二进制文件。</p><p><code>SSF</code>：用于处理<code>Excel</code>日期格式的模块。</p><p><code>BookType</code>：定义<code>Excel</code>文件类型（如<code>xlsx</code>、<code>xls</code>）</p><h2 id="各部分函数解析" tabindex="-1"><a class="header-anchor" href="#各部分函数解析"><span>各部分函数解析</span></a></h2><h3 id="基本信息" tabindex="-1"><a class="header-anchor" href="#基本信息"><span>基本信息</span></a></h3><p>因为内容较多，在这里先讲解使用到的<code>export_json_to_excel</code>：</p><h3 id="export-json-to-excel" tabindex="-1"><a class="header-anchor" href="#export-json-to-excel"><span>export_json_to_excel</span></a></h3><h4 id="函数参数与默认值" tabindex="-1"><a class="header-anchor" href="#函数参数与默认值"><span>函数参数与默认值</span></a></h4>',15)),c("p",null,[s[1]||(s[1]=n("首先是函数的参数和默认值，这在")),d(a,{to:"/guide/theFirstInternship/gain5.html#%E4%BA%86%E8%A7%A3%E6%96%B9%E6%B3%95%E5%92%8C%E5%8F%82%E6%95%B0"},{default:p(()=>s[0]||(s[0]=[n("之前的文档")])),_:1,__:[0]}),s[2]||(s[2]=n("里也有讲解"))]),s[4]||(s[4]=e(`<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">export function export_json_to_excel(</span>
<span class="line">  {</span>
<span class="line">    multiHeader = [],       // 多级表头（数组，如 [[{label: &#39;一级&#39;}, {label: &#39;二级&#39;}]]）</span>
<span class="line">    header,                 // 单级表头（数组，如 [&#39;字段1&#39;, &#39;字段2&#39;]）</span>
<span class="line">    data,                   // 数据主体（数组，如 [{key: val}, ...]）</span>
<span class="line">    filename,               // 文件名（字符串）</span>
<span class="line">    merges = [],            // 合并单元格范围（数组，如 [&#39;A1:B2&#39;, &#39;C3:D3&#39;]）</span>
<span class="line">    autoWidth = true,       // 是否自动计算列宽（布尔值）</span>
<span class="line">    bookType = &#39;xlsx&#39;,      // 文件类型（&#39;xlsx&#39;/&#39;xls&#39;/&#39;csv&#39;等）</span>
<span class="line">  } = { </span>
<span class="line">    header: {},            // 默认空对象（需修正为数组，可能是代码笔误）</span>
<span class="line">    data: [] as any[],      // 默认空数组</span>
<span class="line">    filename: &#39;&#39;            // 默认文件名</span>
<span class="line">  }</span>
<span class="line">) { ... }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="数据预处理" tabindex="-1"><a class="header-anchor" href="#数据预处理"><span>数据预处理</span></a></h4><p>接下来是数据预处理，组装表头和数据：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">filename = filename || &#39;excel-list&#39; // 处理默认文件名</span>
<span class="line">data = [...data] // 复制原始数据，避免修改源数据</span>
<span class="line">data.unshift(header) // 将单级表头插入数据顶部（作为第一行）</span>
<span class="line"></span>
<span class="line">// 插入多级表头（从最后一级到第一级，保持层级顺序）</span>
<span class="line">for (let i = multiHeader.length - 1; i &gt; -1; i--) {</span>
<span class="line">  data.unshift(multiHeader[i])</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意这里把表头、多级表头插入到data前面，说明表头数据也是放到data中一起进行处理的</p><h4 id="生成工作表-worksheet" tabindex="-1"><a class="header-anchor" href="#生成工作表-worksheet"><span>生成工作表（Worksheet）</span></a></h4><p>这部分主要是调用<code>sheet_from_array_of_arrays</code>函数，将<code>data</code>转换为<code>xlsx</code>所需的<code>Worksheet</code>对象，具体实现看关于<code>sheet_from_array_of_arrays</code>函数的讲解部分</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const wsName = &#39;SheetJS&#39;</span>
<span class="line">const wb = new Workbook()</span>
<span class="line">const ws = sheet_from_array_of_arrays(data) // 将二维数组转为工作表</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="合并单元格处理" tabindex="-1"><a class="header-anchor" href="#合并单元格处理"><span>合并单元格处理</span></a></h4><p>这部分是对单元格进行合并，虽然我导出的列表没有用到，但通过举例就能讲清楚它的作用：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">if (merges.length &gt; 0) {</span>
<span class="line">  if (!ws[&#39;!merges&#39;]) ws[&#39;!merges&#39;] = [] // 初始化合并范围数组</span>
<span class="line">  merges.forEach((item) =&gt; {</span>
<span class="line">    ws[&#39;!merges&#39;].push(utils.decode_range(item)) // 将字符串范围转为对象</span>
<span class="line">  })</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>想要合并，需要调用方法时就传入合并规则，比如存在这种情况：</p><p>希望产品信息合并1-3三个单元格，销售信息合并4-5两个单元格。</p><p>那么就会设置A1-C1合并，D1-E1合并，最后调用时传入合并规则：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const multiHeader = [</span>
<span class="line">  [&#39;产品信息&#39;, null, null, &#39;销售信息&#39;, null], // 第一行（合并后显示）</span>
<span class="line">  [&#39;编码&#39;, &#39;名称&#39;, &#39;单价&#39;, &#39;销量&#39;, &#39;状态&#39;]    // 第二行</span>
<span class="line">];</span>
<span class="line">const merges = [&#39;A1:C1&#39;, &#39;D1:E1&#39;];</span>
<span class="line">...</span>
<span class="line">export_json_to_excel({</span>
<span class="line">  multiHeader,</span>
<span class="line">  ...</span>
<span class="line">  merges, // 传入合并规则</span>
<span class="line">});</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="自动列宽计算" tabindex="-1"><a class="header-anchor" href="#自动列宽计算"><span>自动列宽计算</span></a></h4><p>这部分是根据该列所有行的内容自动调整列宽，避免内容截断</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">if (autoWidth) {</span>
<span class="line">  // 1. 计算每列每一行的宽度</span>
<span class="line">  const colWidth = data.map((row) =&gt; </span>
<span class="line">    row.map((val) =&gt; {</span>
<span class="line">      if (val === null) return { wch: 10 } // 空值默认宽度10</span>
<span class="line">      const str = val.toString()</span>
<span class="line">      // 判断是否为双字节字符（如中文）</span>
<span class="line">      const isDoubleByte = str.charCodeAt(0) &gt; 255 </span>
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
<span class="line">  ws[&#39;!cols&#39;] = result</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>具体实现逻辑都在代码中用注释标明，具体再讲一些：</p><p>单位<code>wch</code>：表示列宽，<code>Excel</code>中<code>1</code>个字符宽度约等于<code>7</code>像素。</p><p>提到的双字节字符处理，是因为中文、日文等字符占用<code>2</code>个字符宽度，因此<code>str.length * 2</code>。而英文、数字等单字节字符占用 1 个字符宽度。</p><p>关于<code>ws[&#39;!cols&#39;]</code>：在<code>SheetJS</code>（即<code>XLSX</code>库）中，<code>!cols</code> 是工作表（<code>Sheet</code>）对象的一个特殊属性，用于存储列宽配置。它是<code>SheetJS</code>约定的内部属性名，用于标识列宽信息，类似的还有<code>!merges</code>（合并单元格）、<code>!rows</code>（行高）等以<code>!</code>开头的元数据属性。</p><h4 id="生成文件并下载" tabindex="-1"><a class="header-anchor" href="#生成文件并下载"><span>生成文件并下载</span></a></h4><p>经过上面对数据的处理，这部分就只是调用函数生成文件并下载了：</p><p><code>write(wb, options)</code>：使用<code>xlsx</code>库将工作簿（<code>wb</code>）转为指定格式的二进制数据。 <code>s2ab(wbout)</code>：将二进制字符串转为<code>ArrayBuffer</code>，用于创建<code>Blob</code>对象。 <code>saveAs</code>：通过<code>file-saver</code>库触发浏览器下载。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">wb.SheetNames.push(wsName) // 添加工作表名称</span>
<span class="line">wb.Sheets[wsName] = ws // 将工作表添加到工作簿</span>
<span class="line"></span>
<span class="line">// 生成二进制数据</span>
<span class="line">const wbout = write(wb, {</span>
<span class="line">  bookType: bookType as BookType, // 文件类型</span>
<span class="line">  bookSST: false, // 是否生成共享字符串表（默认false）</span>
<span class="line">  type: &#39;binary&#39; // 输出类型为二进制字符串</span>
<span class="line">})</span>
<span class="line"></span>
<span class="line">// 保存文件</span>
<span class="line">saveAs(</span>
<span class="line">  new Blob([s2ab(wbout)], { type: &#39;application/octet-stream&#39; }),</span>
<span class="line">  \`\${filename}.\${bookType}\`</span>
<span class="line">)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="工具的总体实现" tabindex="-1"><a class="header-anchor" href="#工具的总体实现"><span>工具的总体实现</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { saveAs } from &#39;file-saver&#39;</span>
<span class="line">import { utils, SSF, write, BookType } from &#39;xlsx&#39;</span>
<span class="line"></span>
<span class="line">function generateArray(table: any) {</span>
<span class="line">  const out: any[] = []</span>
<span class="line">  const rows = table.querySelectorAll(&#39;tr&#39;)</span>
<span class="line">  const ranges: any[] = []</span>
<span class="line">  for (let R = 0; R &lt; rows.length; ++R) {</span>
<span class="line">    const outRow: any[] = []</span>
<span class="line">    const row = rows[R]</span>
<span class="line">    const columns = row.querySelectorAll(&#39;td&#39;)</span>
<span class="line">    for (const cell of columns) {</span>
<span class="line">      let colspan = cell.getAttribute(&#39;colspan&#39;)</span>
<span class="line">      let rowspan = cell.getAttribute(&#39;rowspan&#39;)</span>
<span class="line">      let cellValue = cell.innerText</span>
<span class="line">      if (cellValue !== &#39;&#39; &amp;&amp; cellValue === +cellValue) cellValue = +cellValue</span>
<span class="line">      ranges.forEach((range) =&gt; {</span>
<span class="line">        if (</span>
<span class="line">          R &gt;= range.s.r &amp;&amp;</span>
<span class="line">          R &lt;= range.e.r &amp;&amp;</span>
<span class="line">          outRow.length &gt;= range.s.c &amp;&amp;</span>
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
<span class="line">      outRow.push(cellValue !== &#39;&#39; ? cellValue : null)</span>
<span class="line"></span>
<span class="line">      if (colspan) for (let k = 0; k &lt; colspan - 1; ++k) outRow.push(null)</span>
<span class="line">    }</span>
<span class="line">    out.push(outRow)</span>
<span class="line">  }</span>
<span class="line">  return [out, ranges]</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">function datenum(v: any, date1904 = null) {</span>
<span class="line">  if (date1904) {</span>
<span class="line">    v += 1462</span>
<span class="line">  }</span>
<span class="line">  const epoch = Date.parse(v)</span>
<span class="line">  return (</span>
<span class="line">    (epoch - (new Date(Date.UTC(1899, 11, 30)) as any)) / (24 * 60 * 60 * 1000)</span>
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
<span class="line">      if (range.s.r &gt; R) range.s.r = R</span>
<span class="line">      if (range.s.c &gt; C) range.s.c = C</span>
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
<span class="line">      if (typeof cell.v === &#39;number&#39;) cell.t = &#39;n&#39;</span>
<span class="line">      else if (typeof cell.v === &#39;boolean&#39;) cell.t = &#39;b&#39;</span>
<span class="line">      else if (cell.v instanceof Date) {</span>
<span class="line">        cell.t = &#39;n&#39;</span>
<span class="line">        cell.z = (SSF as any)._table[14]</span>
<span class="line">        cell.v = datenum(cell.v)</span>
<span class="line">      } else cell.t = &#39;s&#39;</span>
<span class="line"></span>
<span class="line">      ws[cellRef] = cell</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">  if (range.s.c &lt; 10000000) ws[&#39;!ref&#39;] = utils.encode_range(range)</span>
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
<span class="line">  const wsName = &#39;SheetJS&#39;</span>
<span class="line"></span>
<span class="line">  const wb = new Workbook()</span>
<span class="line">  const ws = sheet_from_array_of_arrays(data)</span>
<span class="line"></span>
<span class="line">  ws[&#39;!merges&#39;] = ranges</span>
<span class="line"></span>
<span class="line">  wb.SheetNames.push(wsName)</span>
<span class="line">  wb.Sheets[wsName] = ws</span>
<span class="line"></span>
<span class="line">  const wbout = write(wb, {</span>
<span class="line">    bookType: &#39;xlsx&#39;,</span>
<span class="line">    bookSST: false,</span>
<span class="line">    type: &#39;binary&#39;,</span>
<span class="line">  })</span>
<span class="line"></span>
<span class="line">  saveAs(</span>
<span class="line">    new Blob([s2ab(wbout)], {</span>
<span class="line">      type: &#39;application/octet-stream&#39;,</span>
<span class="line">    }),</span>
<span class="line">    &#39;test.xlsx&#39;</span>
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
<span class="line">    bookType = &#39;xlsx&#39;,</span>
<span class="line">  } = { header: {}, data: [] as any[], filename: &#39;&#39; }</span>
<span class="line">) {</span>
<span class="line">  /* original data */</span>
<span class="line">  filename = filename || &#39;excel-list&#39;</span>
<span class="line">  data = [...data]</span>
<span class="line">  data.unshift(header)</span>
<span class="line"></span>
<span class="line">  for (let i = multiHeader.length - 1; i &gt; -1; i--) {</span>
<span class="line">    data.unshift(multiHeader[i])</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  const wsName = &#39;SheetJS&#39;</span>
<span class="line">  const wb = new Workbook()</span>
<span class="line">  const ws = sheet_from_array_of_arrays(data)</span>
<span class="line"></span>
<span class="line">  if (merges.length &gt; 0) {</span>
<span class="line">    if (!ws[&#39;!merges&#39;]) {</span>
<span class="line">      ws[&#39;!merges&#39;] = []</span>
<span class="line">    }</span>
<span class="line">    merges.forEach((item) =&gt; {</span>
<span class="line">      ws[&#39;!merges&#39;].push(utils.decode_range(item))</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (autoWidth) {</span>
<span class="line">    const colWidth = data.map((row) =&gt;</span>
<span class="line">      row.map((val: any) =&gt; {</span>
<span class="line">        if (val === null) {</span>
<span class="line">          return {</span>
<span class="line">            wch: 10,</span>
<span class="line">          }</span>
<span class="line">        } else if (val.toString().charCodeAt(0) &gt; 255) {</span>
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
<span class="line">        if (result[j][&#39;wch&#39;] &lt; colWidth[i][j][&#39;wch&#39;]) {</span>
<span class="line">          result[j][&#39;wch&#39;] = colWidth[i][j][&#39;wch&#39;]</span>
<span class="line">        }</span>
<span class="line">      }</span>
<span class="line">    }</span>
<span class="line">    ws[&#39;!cols&#39;] = result</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  wb.SheetNames.push(wsName)</span>
<span class="line">  wb.Sheets[wsName] = ws</span>
<span class="line"></span>
<span class="line">  const wbout = write(wb, {</span>
<span class="line">    bookType: bookType as BookType,</span>
<span class="line">    bookSST: false,</span>
<span class="line">    type: &#39;binary&#39;,</span>
<span class="line">  })</span>
<span class="line">  saveAs(</span>
<span class="line">    new Blob([s2ab(wbout)], {</span>
<span class="line">      type: &#39;application/octet-stream&#39;,</span>
<span class="line">    }),</span>
<span class="line">    \`\${filename}.\${bookType}\`</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="后续要补充的讲解" tabindex="-1"><a class="header-anchor" href="#后续要补充的讲解"><span>后续要补充的讲解：</span></a></h2><p>sheet_from_array_of_arrays函数实现、s2ab实现、<code>Blob</code>对象是什么、saveAs如何触发浏览器下载，其他各部分其他函数；</p>`,30))])}const b=l(t,[["render",u]]),h=JSON.parse('{"path":"/guide/theFirstInternship/gain6.html","title":"收获三——实现Excel导出工具","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"核心依赖库","slug":"核心依赖库","link":"#核心依赖库","children":[]},{"level":2,"title":"各部分函数解析","slug":"各部分函数解析","link":"#各部分函数解析","children":[{"level":3,"title":"基本信息","slug":"基本信息","link":"#基本信息","children":[]},{"level":3,"title":"export_json_to_excel","slug":"export-json-to-excel","link":"#export-json-to-excel","children":[]}]},{"level":2,"title":"工具的总体实现","slug":"工具的总体实现","link":"#工具的总体实现","children":[]},{"level":2,"title":"后续要补充的讲解：","slug":"后续要补充的讲解","link":"#后续要补充的讲解","children":[]}],"git":{"updatedTime":1748449321000,"contributors":[{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":1,"url":"https://github.com/X4M7"}],"changelog":[{"hash":"e6c2e7c2c53288dc9cea12cbccf49263c237aedc","time":1748449321000,"email":"1415808154@qq.com","author":"X4M7","message":"项目一导出商品列表实现，Excel导出工具实现的部分讲解"}]},"filePathRelative":"guide/theFirstInternship/gain6.md"}');export{b as comp,h as data};
