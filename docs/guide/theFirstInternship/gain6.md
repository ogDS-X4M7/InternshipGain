# 收获三——实现Excel导出工具
## 核心依赖库
`file-saver`：

功能：实现文件保存到本地的功能，提供`saveAs`方法。

`xlsx`：

功能：操作`Excel`文件的核心库，包含解析、生成`Excel`的工具函数（如`utils`、`write`）。

`utils`：提供了一系列用于*转换数据格式*和*操作工作表*的工具函数。可以看到这个库使用了三个方法：`utils.encode_cell`、`utils.encode_range`、`utils.decode_range`，都是用于*处理单元格地址和区域*的核心工具函数。

`write`：用于将工作表数据转换为不同格式的文件内容，支持多种输出格式，在这里都生成的是二进制文件。

`SSF`：用于处理`Excel`日期格式的模块。

`BookType`：定义`Excel`文件类型（如`xlsx`、`xls`）

## 各部分函数解析
### 基本信息
供外部使用导出`Excel`文件的方法只有[export_table_to_excel](#export_table_to_excel)和[export_json_to_excel](#export_json_to_excel)，其他的方法和结构都是为这两个导出方法服务的。

### 关于generateArray
这个方法的作用是将`HTML`表格（`<table>` 元素）转换为二维数组，并处理表格中的合并单元格（`colspan`和`rowspan`）

总体来说，它的处理就是把需要合并的单元格全都补充上`null`，并且将表格中的`colspan`和`rowspan`获取保存下来作为合并信息。

补充`null`后的二维数组就是`out`，显而易见，光有`null`补充并不能区分这部分单元格要如何合并，可能是行合并，也可能列合并，于是还需要对应的合并信息，也就是`range`，所以函数返回值是`[out, ranges]`


#### 函数参数与返回值
参数：`table`：一个`<table>`元素。

返回值：一个数组`[out, ranges]`，其中：

`out`：转换后的二维数组，每个子数组代表表格的一行。

`ranges`：合并单元格的范围信息，用于后续处理。


#### 初始化变量
先初始化要返回的结果，并获取表格中的所有行，后续以行为大单位遍历
```
const out: any[] = []; // 存储最终的二维数组
const rows = table.querySelectorAll('tr'); // 获取所有行
const ranges: any[] = []; // 存储合并单元格的范围
```


#### 遍历每一行
正如上面所说，以行为大单位遍历，后面再细分列，也就是到每个单元格了，这里的outRow用于存储处理完毕后的行内容，也就是后续会对它输入单元格内容并补充该行所需的`null`：
```
for (let R = 0; R < rows.length; ++R) {
  const outRow: any[] = []; // 当前行的数据
  const row = rows[R];
  const columns = row.querySelectorAll('td'); // 获取当前行的所有单元格
  // ...处理每一列
}
```


#### 处理每个单元格
细分到列，也就是每个单元格，在上面介绍过，这个函数的处理需要列合并数和行合并数来生成`range`，也就是合并信息
```
for (const cell of columns) {
  let colspan = cell.getAttribute('colspan'); // 获取列合并数
  let rowspan = cell.getAttribute('rowspan'); // 获取行合并数
  let cellValue = cell.innerText; // 获取单元格文本内容
  
  // 转换数值类型（如果是纯数字）
  if (cellValue !== '' && cellValue === +cellValue) cellValue = +cellValue;
  // ...处理合并单元格
}
```


#### 处理记录的合并单元格——行合并
因为是行遍历，对行处理，所以如果出现行合并，就需要ranges记录信息，才能在进入需要被上一行合并的第二行时准确判断出需要合并，这部分代码主要用于处理跨行合并，之前已经读取过合并信息([下面](#处理当前单元格的合并属性)马上讲到)，后续遍历读取合并区域信息来判断是否需要合并，需要时填充`null`进入该行结果。
之所以说这里主要处理行合并，是因为列合并是在[下面](#添加单元格值并处理colspan)读取到单元格列合并信息就立刻处理掉的，只有跨行合并这种在行遍历情况下需要后续才处理的、处理比较迟钝的情况才会需要通过ranges合并信息来判断并处理。
```
ranges.forEach((range) => {
  if (
    R >= range.s.r && // 当前行是否在合并范围内
    R <= range.e.r &&
    outRow.length >= range.s.c && // 当前列是否在合并范围内
    outRow.length <= range.e.c
  ) {
    // 在合并区域内，填充 null 以占位
    for (let i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
  }
});
```

#### 记录当前单元格的合并属性
这里就是填写`ranges`信息的部分了，根据之前读取的行合并、列合并信息，可以计算、记录下合并单元格的范围，为后续进行跨行合并，提供结果给`Excel`生成能够正确合并单元格的表格
```
if (rowspan || colspan) {
  rowspan = rowspan || 1; // 默认值为 1
  colspan = colspan || 1;
  
  // 记录合并单元格的范围
  ranges.push({
    s: { r: R, c: outRow.length }, // 起始位置
    e: { r: R + rowspan - 1, c: outRow.length + colspan - 1 } // 结束位置
  });
}
```

#### 添加当前单元格值并进行列合并
对于读取到单元格的值，立刻就填入当行结果`outRow`，并对当前如果有列合并，也是立刻处理
```
outRow.push(cellValue !== '' ? cellValue : null); // 添加当前单元格值

// 处理 colspan：为合并的列添加 null 占位
if (colspan) for (let k = 0; k < colspan - 1; ++k) outRow.push(null);
```


#### 处理完输入结果返回
把每行结果`outRow`处理好之后，`push`进最终结果的数组中，行数遍历完毕，所有结果生成完毕，则返回：
```
function generateArray(table: any) {
  ...
  for (let R = 0; R < rows.length; ++R) {
    ...
    out.push(outRow)
  }
  return [out, ranges]
}
```


### 关于datenum
这个方法的作用是将`JavaScript`日期对象或时间字符串 转换为`Excel`内部表示日期的数值（称为「日期序列值」）。这在将日期数据导出到`Excel`时非常重要，因为`Excel`和`JavaScript`对日期的存储方式不同。

#### Excel 的日期存储机制
要了解怎么做，为什么这么做，首先必须知道`Excel`的日期存储机制：

`Excel`使用*数值*表示日期，其中：

`1`代表*1900年1月1日*（`Windows`系统默认）或 *1904年1月1日*（`Mac`系统默认），后续日期依次递增（如`2`是*1900年1月2日*），时间部分用小数表示（如`0.5`代表中午`12`点）

了解这个，我们就能理解为什么`datenum`方法有第二个参数`date1904`了

#### 处理 1904 年日期系统
之前已经解释过，`Mac`系统默认比`Windows`系统默认晚了`4`年，即晚`1462`天（`4`年差+闰年调整）
```
if (date1904) {
  v += 1462;
}
```
比较意外，读到这部分代码的时候，我意识到这个项目原本这么写这部分代码是错误的，因为`v`是一个`Date`对象，如果对一个`Date`对象直接执行`v += 1462`会发生隐式类型转换，变成增加字符串`1462`，这与原本增加`1462`天的想法完全不是一回事。

因此想实现原本的想法，这部分代码应该修改为：
```
if (date1904) {
  v.setDate(v.getDate() + 1462);
}
```
不过这都是根据[整个工具的总体实现](#工具的总体实现)都仅在`sheet_from_array_of_arrays`中使用`datenum`方法，并在其中对传入的参数做了判断，确保其为`Date`对象而设计的，但从长远角度考虑，因为不确定未来会不会还在别的地方使用，不能保证以后使用的人还记得提前对传入参数作判断，所以最好还是在`datenum`中也做一个判断提示
```
function datenum(v: Date, date1904: boolean = false) {
  // 严格校验输入类型为 Date 对象
  if (!(v instanceof Date)) {
    throw new Error('输入必须是 Date 对象');
  }
  ...
}
```

#### 计算 Excel 日期序列值
计算完输入日期，并处理了对应不同系统的时间，再来统一计算距离系统默认时间过了多少天——即计算`Excel`内部表示日期的*日期序列值*
```
  const epoch = Date.parse(v)
  return (
    (epoch - (new Date(Date.UTC(1899, 11, 30)) as any)) / (24 * 60 * 60 * 1000)
  )
```
这里的原代码也是错的，于是我决定写下下面的[吐槽与重构](#吐槽与重构)给出一个统一的更正结果，不过思路还是可以看的

#### 吐槽与重构
上面说原代码又有错，是因为既然已经确保`v`是`Date`对象，也就不可能用`Date.parse(v)`转换，因为`Date.parse(v)`期望接收字符串参数，而不是`Date`对象。原版的代码写的非常混乱，分明自己都不清楚到底要传什么参数了。于是我把这个方法完整重写了一遍：

思路和上面是一样的，补充了校验输入类型，然后处理`Mac`系统默认的`1904`年日期系统，再计算`Excel`日期序列值即可，注意`(v- (new Date(Date.UTC(1899, 11, 30))))`这部分的计算是利用减法运算的类型隐式转换，`v`和后面的`new Date`都是`Date`对象，会隐式调用`valueOf()`转为时间戳（毫秒）相减
```
function datenum(v: Date, date1904: boolean = false) {
  // 严格校验输入类型为 Date 对象
  if (!(v instanceof Date)) {
    throw new Error('输入必须是 Date 对象');
  }

  if (date1904) {
    v = new Date(v); // 避免修改原始对象
    v.setDate(v.getDate() + 1462);
  }

  return (
    (v- (new Date(Date.UTC(1899, 11, 30)))) / (24 * 60 * 60 * 1000)
  )
}
```



### 关于sheet_from_array_of_arrays
这个方法的作用是将二维数组转换为`xlsx`所需的工作表（`Worksheet`）对象

#### 初始化工作表对象和范围
`ws`是最终的工作表对象，将包含所有单元格数据

`range`用于记录工作表的实际范围（起始单元格和结束单元格）

`s`代表开始，初始值设为极大值以便后续比较

`e`代表结束，初始值设为极小值以便后续比较
```
const ws: any = {};
const range = {
  s: { c: 10000000, r: 10000000 }, // 起始位置设为极大值
  e: { c: 0, r: 0 }                // 结束位置设为极小值
};
```

#### 遍历二维数组，处理每个单元格
##### 范围更新：确定工作表的实际范围
定义工作表的边界（从左上角到右下角的单元格区域）、确定这个范围的主要目的是：

优化文件大小：只保存实际有数据的区域，避免包含大量空单元格

确保软件兼容性：让`Excel`等工具正确识别数据边界

提升渲染性能：减少不必要的单元格计算和显示

这部分代码，保证起始位置的行和列，等于工作表左上角单元格的行和列；保证结束位置的行和列，等于右下角单元格的行和列
```
for (let R = 0; R !== data.length; ++R) {
  for (let C = 0; C !== data[R].length; ++C) {
    // 更新范围
    if (range.s.r > R) range.s.r = R;
    if (range.s.c > C) range.s.c = C;
    if (range.e.r < R) range.e.r = R;
    if (range.e.c < C) range.e.c = C;
    
    // 处理单元格
    ...
    // 编码单元格引用（如 A1, B2 等）
    ...
    // 根据单元格值类型设置格式
    ...
    
    ws[cellRef] = cell;
  }
}
```
##### 创建单元格对象，生成单元格引用
从二维数组中获取值，并准备创建符合`SheetJS`格式的单元格对象。将数字索引转换为`Excel`的*字母 - 数字*引用，确保数据能正确映射到工作表的对应位置：`utils.encode_cell`与下面的`utils.decode_range`正好相反，不过都是为了`SheetJS`格式的需要。
```
    // 处理单元格
    const cell: any = { v: data[R][C] };
    if (cell.v === null) continue;
    
    // 编码单元格引用（如 A1, B2 等）
    const cellRef = utils.encode_cell({ c: C, r: R });
```


##### 根据单元格值类型设置格式，Date对象转日期序列值，单元格添加到工作表
具体讲解一下各个类型与属性：

`cell.v`：存储单元格的原始值

`cell.t`表示单元格类型

`'n'`表示数值

`'b'`表示布尔值

`'s'`表示字符串

```
    // 根据单元格值类型设置格式
    if (typeof cell.v === 'number') cell.t = 'n';
    else if (typeof cell.v === 'boolean') cell.t = 'b';
    else if (cell.v instanceof Date) {
      cell.t = 'n';
      cell.z = (SSF as any)._table[14];
      cell.v = datenum(cell.v);
    } else cell.t = 's';
    
    ws[cellRef] = cell; // 将单元格添加到工作表
```
日期处理的特殊逻辑是这部分代码中最关键的部分：

将类型设为`'n'`（数值），因为`Excel`中日期本质上是数值

`cell.z`设置日期格式（`SSF._table[14]`是预定义的日期格式）

`datenum()`函数将`JavaScript`日期对象转换为`Excel`的日期数值，具体的原因和实现已经[写过](#关于datenum)


#### 设置工作表范围并返回
`!ref`是`SheetJS`的特殊属性，表示工作表的范围

`utils.encode_range`将范围对象`range`转换为字符串（如 "A1:C3"）

最后将工作表返回
```
  if (range.s.c < 10000000) ws['!ref'] = utils.encode_range(range)
  return ws
```


### 关于export_table_to_excel


### 关于s2ab
这个方法的作用就是将二进制字符串转为`ArrayBuffer`，因为当使用`FileSaver.js`等库保存文件时，需要传入`Blob`对象（基于二进制数据），而非字符串
```
function s2ab(s: any) {
  const buf = new ArrayBuffer(s.length) // 创建 ArrayBuffer
  const view = new Uint8Array(buf) // 创建 Uint8Array 视图
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff // 遍历字符串并转换
  return buf
}
```
其中创建`Uint8Array`视图是要通过数组语法操作`ArrayBuffer`的字节（如`view[0] = 65`表示第一个字节为`65`，对应`ASCII`字符`A`）。正如下面的遍历字符串并转换所进行的操作，就是对`view[i]`的数组语法操作，其中：

`s.charCodeAt(i)`是获取第`i`个字符的`Unicode`码点（如`A`的码点是`65`）；

`& 0xff`：取低`8`位（相当于`% 256`），用于处理超出`8`位的字符，因为导入的参数`s`是*二进制字符串*，对于*二进制字符串*，码点范围应为 `0-255`，即低八位表示，每个字符直接映射一个字节(`8`位)，无需编码转换。`& 0xff`确保了数据安全，即使字符串包含超出`0-255`范围的字符，`& 0xff`也会将其截断为低`8`位，防止意外混入*非二进制字符串*的字符（如中文），导致数据错误。

### 关于export_json_to_excel
这个方法的作用是将结构化`JSON`数据导出为`Excel`，是供外部使用导出`Excel`文件的方法：总结起来就是：为了使用`saveAs`自动处理文件流的写入来导出文件，需要`Blob`对象，Blob对象需要`ArrayBuffer`来生成，而`ArrayBuffer`由二进制字符串生成，于是使用`xlsx`库的`write`方法生成对应的二进制字符串，`write`方法需要参数`wb`也就是工作簿，而工作簿最主要的内容就是工作表`ws`，而工作表就是通过`sheet_from_array_of_arrays`对传入的二维数组进行处理得到的，当然还需要对合并单元格做标记处理、对列宽进行计算保存，这就是这一整套流程的逆推，也是要有这套流程的原因：

`saveAs`保存文件->需要`Blob`对象生成->需要`ArrayBuffer`生成->需要`wbout`（二进制字符串）生成->需要`write`方法生成->需要参数`wb`->需要工作表`ws`组成->需要`sheet_from_array_of_arrays`方法生成并进行系列处理->需要参数二维数组->用户导入

#### 函数参数与默认值
首先是函数的参数和默认值，这在[之前的文档](./gain5.md#了解方法和参数)里也有讲解
```
export function export_json_to_excel(
  {
    multiHeader = [],       // 多级表头（数组，如 [[{label: '一级'}, {label: '二级'}]]）
    header,                 // 单级表头（数组，如 ['字段1', '字段2']）
    data,                   // 数据主体（数组，如 [{key: val}, ...]）
    filename,               // 文件名（字符串）
    merges = [],            // 合并单元格范围（数组，如 ['A1:B2', 'C3:D3']）
    autoWidth = true,       // 是否自动计算列宽（布尔值）
    bookType = 'xlsx',      // 文件类型（'xlsx'/'xls'/'csv'等）
  } = { 
    header: {},            // 默认空对象（需修正为数组，可能是代码笔误）
    data: [] as any[],      // 默认空数组
    filename: ''            // 默认文件名
  }
) { ... }
```

#### 数据预处理
接下来是数据预处理，组装表头和数据：
```
filename = filename || 'excel-list' // 处理默认文件名
data = [...data] // 复制原始数据，避免修改源数据
data.unshift(header) // 将单级表头插入数据顶部（作为第一行）

// 插入多级表头（从最后一级到第一级，保持层级顺序）
for (let i = multiHeader.length - 1; i > -1; i--) {
  data.unshift(multiHeader[i])
}
```
注意这里把表头、多级表头插入到data前面，说明表头数据也是放到data中一起进行处理的


#### 生成工作表（Worksheet）
这部分主要是调用`sheet_from_array_of_arrays`函数，将`data`转换为`xlsx`所需的`Worksheet`对象，具体实现看关于`sheet_from_array_of_arrays`函数的[讲解部分](#关于sheet_from_array_of_arrays)
```
const wsName = 'SheetJS'
const wb = new Workbook()
const ws = sheet_from_array_of_arrays(data) // 将二维数组转为工作表
```


#### 合并单元格处理
这部分是为工作表添加 “合并范围” 的元数据标记。
```
if (merges.length > 0) {
  if (!ws['!merges']) ws['!merges'] = [] // 初始化合并范围数组
  merges.forEach((item) => {
    ws['!merges'].push(utils.decode_range(item)) // 将字符串范围转为对象
  })
}
```
通过导入的数据`merges`判断需不需要合并，如果有，先初始化合并范围数组`ws['!merges']`，当使用`SheetJS`等库将`ws`对象导出为`.xlsx`文件时，库会读取`!merges`中的数据，并在文件中写入对应的合并单元格配置。后面将`merges`中的内容均通过`utils.decode_range()`方法处理后放入`ws['!merges']`当中。`utils.decode_range()`是将字符串格式的合并范围（如 `A1:C3`）解析为对象格式（如 `{ s: { r: 0, c: 0 }, e: { r: 2, c: 2 } }`），其中`s`表示起始行列，`e`表示结束行列。目的当然是为了符合`SheetJS`等库要求的内部数据结构，便于后续生成文件时处理。

虽然我导出的列表没有用到合并，但通过举例就能讲清楚它的作用：

想要合并，需要调用方法时就传入合并规则，比如存在这种情况：

希望产品信息合并1-3三个单元格，销售信息合并4-5两个单元格。

那么就会设置A1-C1合并，D1-E1合并，最后调用时传入合并规则：
```
const multiHeader = [
  ['产品信息', null, null, '销售信息', null], // 第一行（合并后显示）
  ['编码', '名称', '单价', '销量', '状态']    // 第二行
];
const merges = ['A1:C1', 'D1:E1'];
...
export_json_to_excel({
  multiHeader,
  ...
  merges, // 传入合并规则
});
```



#### 自动列宽计算
这部分是根据该列所有行的内容自动调整列宽，避免内容截断
```
if (autoWidth) {
  // 1. 计算每行每一列的宽度
  const colWidth = data.map((row) => 
    row.map((val) => {
      if (val === null) return { wch: 10 } // 空值默认宽度10
      const str = val.toString()
      // 判断是否为双字节字符（如中文）
      const isDoubleByte = str.charCodeAt(0) > 255 
      return { wch: isDoubleByte ? str.length * 2 : str.length }
    })
  )

  // 2. 取每列的最大宽度
  const result = colWidth[0].slice() // 以第一行宽度为初始值
  for (let i = 1; i < colWidth.length; i++) {
    for (let j = 0; j < colWidth[i].length; j++) {
      if (result[j].wch < colWidth[i][j].wch) {
        result[j].wch = colWidth[i][j].wch // 覆盖为更大值
      }
    }
  }

  // 3. 应用列宽到工作表
  ws['!cols'] = result
}
```
具体实现逻辑都在代码中用注释标明，具体再讲一些：

单位`wch`：表示列宽，`Excel`中`1`个字符宽度约等于`7`像素。

提到的双字节字符处理，是因为中文、日文等字符占用`2`个字符宽度，因此`str.length * 2`。而英文、数字等单字节字符占用 1 个字符宽度。

关于`ws['!cols']`：在`SheetJS`（即`XLSX`库）中，`!cols` 是工作表（`Sheet`）对象的一个特殊属性，用于存储列宽配置。它是`SheetJS`约定的内部属性名，用于标识列宽信息，类似的还有`!merges`（合并单元格）、`!rows`（行高）等以`!`开头的元数据属性。


#### 生成文件并下载
经过上面对数据的处理，这部分就只是调用函数生成文件并下载了：

`write(wb, options)`：使用`xlsx`库将工作簿（`wb`）转为指定格式的二进制数据。

`s2ab(wbout)`：将二进制字符串转为`ArrayBuffer`，用于创建`Blob`对象。

`saveAs`：通过`file-saver`库触发浏览器下载。
```
wb.SheetNames.push(wsName) // 添加工作表名称
wb.Sheets[wsName] = ws // 将工作表添加到工作簿

// 生成二进制字符串
const wbout = write(wb, {
  bookType: bookType as BookType, // 文件类型
  bookSST: false, // 是否生成共享字符串表（默认false）
  type: 'binary' // 输出类型为二进制字符串
})

// 保存文件
saveAs(
  new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),
  `${filename}.${bookType}`
)
```
可以看到是通过*浏览器的文件操作接口*和`Blob`对象实现文件保存功能：

`Blob`是`Binary Large Object`（二进制大对象），用于存储二进制数据（如文本、图片、二进制文件等）。可以看作是一个不可变的原始数据缓冲区，常见于文件操作、网络请求（如`fetch`的响应体）等场景。这里的`Blob([s2ab(),{type}])`，关于`s2ab`方法和`ArrayBuffer`见[关于s2ab](#关于s2ab)；`type`参数：`application/octet-stream`是通用二进制流类型，适用于未知文件类型。

`saveAs`函数是`FileSaver.js`库提供的核心方法，用于在浏览器中触发文件保存对话框。`saveAs(blob, filename)`执行时，浏览器生成一个临时的`URL`指向`Blob`对象；触发文件保存对话框，用户可选择保存路径；自动处理文件流的写入，无需前端代码干预。


## 工具的总体实现
```
import { saveAs } from 'file-saver'
import { utils, SSF, write, BookType } from 'xlsx'

function generateArray(table: any) {
  const out: any[] = []
  const rows = table.querySelectorAll('tr')
  const ranges: any[] = []
  for (let R = 0; R < rows.length; ++R) {
    const outRow: any[] = []
    const row = rows[R]
    const columns = row.querySelectorAll('td')
    for (const cell of columns) {
      let colspan = cell.getAttribute('colspan')
      let rowspan = cell.getAttribute('rowspan')
      let cellValue = cell.innerText
      if (cellValue !== '' && cellValue === +cellValue) cellValue = +cellValue
      ranges.forEach((range) => {
        if (
          R >= range.s.r &&
          R <= range.e.r &&
          outRow.length >= range.s.c &&
          outRow.length <= range.e.c
        ) {
          for (let i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null)
        }
      })
      if (rowspan || colspan) {
        rowspan = rowspan || 1
        colspan = colspan || 1
        ranges.push({
          s: {
            r: R,
            c: outRow.length,
          },
          e: {
            r: R + rowspan - 1,
            c: outRow.length + colspan - 1,
          },
        })
      }

      outRow.push(cellValue !== '' ? cellValue : null)

      if (colspan) for (let k = 0; k < colspan - 1; ++k) outRow.push(null)
    }
    out.push(outRow)
  }
  return [out, ranges]
}

// function datenum(v: any, date1904 = null) {
//   if (date1904) {
//     v += 1462
//   }
//   const epoch = Date.parse(v)
//   return (
//     (epoch - (new Date(Date.UTC(1899, 11, 30)) as any)) / (24 * 60 * 60 * 1000)
//   )
// }

// 上面写法有误，我改成下面这种
function datenum(v: Date, date1904: boolean = false) {
  // 严格校验输入类型为 Date 对象
  if (!(v instanceof Date)) {
    throw new Error('输入必须是 Date 对象');
  }

  if (date1904) {
    v = new Date(v); // 避免修改原始对象
    v.setDate(v.getDate() + 1462);
  }

  return (
    (v- (new Date(Date.UTC(1899, 11, 30)))) / (24 * 60 * 60 * 1000)
  )
}

function sheet_from_array_of_arrays(data: any) {
  const ws: any = {}
  const range = {
    s: {
      c: 10000000,
      r: 10000000,
    },
    e: {
      c: 0,
      r: 0,
    },
  }
  for (let R = 0; R !== data.length; ++R) {
    for (let C = 0; C !== data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R
      if (range.s.c > C) range.s.c = C
      if (range.e.r < R) range.e.r = R
      if (range.e.c < C) range.e.c = C
      const cell: any = {
        v: data[R][C],
      }
      if (cell.v === null) continue
      const cellRef = utils.encode_cell({
        c: C,
        r: R,
      })

      if (typeof cell.v === 'number') cell.t = 'n'
      else if (typeof cell.v === 'boolean') cell.t = 'b'
      else if (cell.v instanceof Date) {
        cell.t = 'n'
        cell.z = (SSF as any)._table[14]
        cell.v = datenum(cell.v)
      } else cell.t = 's'

      ws[cellRef] = cell
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = utils.encode_range(range)
  return ws
}

class Workbook {
  public SheetNames: any[] = []
  public Sheets: any = {}
}

function s2ab(s: any) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

export function export_table_to_excel(id: any) {
  const theTable = document.getElementById(id)
  const oo = generateArray(theTable)
  const ranges = oo[1]

  const data = oo[0]
  const wsName = 'SheetJS'

  const wb = new Workbook()
  const ws = sheet_from_array_of_arrays(data)

  ws['!merges'] = ranges

  wb.SheetNames.push(wsName)
  wb.Sheets[wsName] = ws

  const wbout = write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
  })

  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream',
    }),
    'test.xlsx'
  )
}

export function export_json_to_excel(
  {
    multiHeader = [],
    header,
    data,
    filename,
    merges = [],
    autoWidth = true,
    bookType = 'xlsx',
  } = { header: {}, data: [] as any[], filename: '' }
) {
  /* original data */
  filename = filename || 'excel-list'
  data = [...data]
  data.unshift(header)

  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i])
  }

  const wsName = 'SheetJS'
  const wb = new Workbook()
  const ws = sheet_from_array_of_arrays(data)

  if (merges.length > 0) {
    if (!ws['!merges']) {
      ws['!merges'] = []
    }
    merges.forEach((item) => {
      ws['!merges'].push(utils.decode_range(item))
    })
  }

  if (autoWidth) {
    const colWidth = data.map((row) =>
      row.map((val: any) => {
        if (val === null) {
          return {
            wch: 10,
          }
        } else if (val.toString().charCodeAt(0) > 255) {
          return {
            wch: val.toString().length * 2,
          }
        } else {
          return {
            wch: val.toString().length,
          }
        }
      })
    )
    const result = colWidth[0]
    for (let i = 1; i < colWidth.length; i++) {
      for (let j = 0; j < colWidth[i].length; j++) {
        if (result[j]['wch'] < colWidth[i][j]['wch']) {
          result[j]['wch'] = colWidth[i][j]['wch']
        }
      }
    }
    ws['!cols'] = result
  }

  wb.SheetNames.push(wsName)
  wb.Sheets[wsName] = ws

  const wbout = write(wb, {
    bookType: bookType as BookType,
    bookSST: false,
    type: 'binary',
  })
  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream',
    }),
    `${filename}.${bookType}`
  )
}
```

## 后续要补充的讲解：
export_table_to_excel函数；