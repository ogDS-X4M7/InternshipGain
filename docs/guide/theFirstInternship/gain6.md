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


因为内容较多，在这里先讲解使用到的`export_json_to_excel`：
### export_json_to_excel
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
这部分主要是调用`sheet_from_array_of_arrays`函数，将`data`转换为`xlsx`所需的`Worksheet`对象，具体实现看关于`sheet_from_array_of_arrays`函数的讲解部分
```
const wsName = 'SheetJS'
const wb = new Workbook()
const ws = sheet_from_array_of_arrays(data) // 将二维数组转为工作表
```


#### 合并单元格处理
这部分是对单元格进行合并，虽然我导出的列表没有用到，但通过举例就能讲清楚它的作用：
```
if (merges.length > 0) {
  if (!ws['!merges']) ws['!merges'] = [] // 初始化合并范围数组
  merges.forEach((item) => {
    ws['!merges'].push(utils.decode_range(item)) // 将字符串范围转为对象
  })
}
```
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
  // 1. 计算每列每一行的宽度
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

// 生成二进制数据
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

function datenum(v: any, date1904 = null) {
  if (date1904) {
    v += 1462
  }
  const epoch = Date.parse(v)
  return (
    (epoch - (new Date(Date.UTC(1899, 11, 30)) as any)) / (24 * 60 * 60 * 1000)
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
sheet_from_array_of_arrays函数实现、s2ab实现、`Blob`对象是什么、saveAs如何触发浏览器下载，其他各部分其他函数；