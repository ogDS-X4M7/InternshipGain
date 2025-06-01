# 项目一——导出商品列表

## 需求与完成
继续完成项目一的需求，这次实现了对商品列表导出excel文件。因为注意到项目中的其他页面有实现过类似的功能，于是虽然之前没做过没学过相关的内容，但模仿之前的代码，仍然成功实现了这个需求。

项目中已经封装好了一个基于 xlsx 和 file-saver 库的 Excel 导出工具，关于这个工具，这部分内容比较多，而且都是新知识，所以放在[收获三——实现Excel导出工具](./gain6.md#收获三实现excel导出工具)中记录。

### 了解方法和参数
要导出商品列表，是通过封装好的Excel导出工具来导出，那么首要的就是了解相关的使用方法和所需的参数。直接来看我已经写好的代码：
```
import('@/utils/excel').then((excel) => {
    const tHeader = ['商品编码', '产品名称', '商品单价', '销售数量', '商品状态', '上架时间', '三级分销', '佣金比率 ', '排序']
    const filterVal = ['product_id', 'product_name', 'product_unit_price', 'product_sale_num', 'product_state_id', 'product_sale_time', 'product_dist_enable', 'scope.row.product_commission_rate', 'scope.row.product_order']
    const list = state.selectRows
    const data = formatJson(filterVal, list)
    excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: state.filename,
        autoWidth: state.autoWidth,
        bookType: state.bookType,
    })
})
```
这里采用了`ES6`的动态导入语法，用于按需加载模块，这样的写法是在用户点击导出按钮时才加载`Excel`工具库，而不是页面初始化时就加载，能够减少首屏加载时间，提高应用性能。

导出表格，主要使用的是`export_json_to_excel`方法，可以看到所需的参数：

`header`：文件中各列（属性）名称；

`filename`：导出的文件名称；

`data`：最主要的商品列表数据，操作者选中要导出的商品，然后再导出，因此有选中商品的操作，由于之前这个地方实现过批量删除的功能，因此已经实现过批量选择商品的功能，我们只需要把`Vuex`中的批量选中商品信息取过来使用即可，也就是代码中的`const list = state.selectRows`，当然后面需要对`list`格式化才交给`data`，这个下面再聊。（关于这个`selectRows`的实现并不困难，不过也在[下面](#补充一下selectrows的实现)一并记录一下）

`autoWidth`：Excel表格需要自适应宽度匹配各列

`bookType`：指定导出的 Excel 文件格式类型


### 提供参数
了解完所需的方法和参数，接下来就是为了调用`export_json_to_excel`方法而准备参数。

经过上面的了解，我把这些参数的提供分为两部分讲：`data`外的其他参数作为一部分，因为它们只需要简单配置即可；另一部分就是最重要的`data`的提供，因为它需要把主要的商品列表数据格式化，于是需要讲解自己设计使用的`formatJson`

#### formatJson按需格式化数据参数
可以看到最主要的`data`数据参数是需要格式化的。原因和我们平时所讲的定义其实紧密相关，比如`Vuex`，`Pinia`我们都叫状态管理工具，对于数据、变量其实就是状态，比如这里的*商品状态*、*三级分销*，存储在状态管理工具中的并不是字符串，而是一些数字，比如这里`1001`表示商品处于上架状态，`1002`处于下架。当导出`Excel`时，当然不能导出数字，而是要导出对应的文字信息。另外，像是上架时间，存储的也是*时间戳*，需要格式化再导出。

而这个负责格式化的函数，即`formatJson`，就需要自己来完成：
```
const formatJson = (filterVal, jsonData) => {
  return jsonData.map((v) =>
    filterVal.map((j) => {
      if(j == 'product_unit_price'){
        return formatPrice(v)
      }
      if (v[j] == null) return null;
      if (j == 'product_state_id') {
        if(v[j]===1001){
          return t('已上架')
        }else{
          return t('已下架')
        }
      }else if(j == 'product_sale_time'){
        return timestampToTime(v[j])
      }else if(j == 'product_dist_enable'){
        if(v[j]){
          return t('允许')
        }else{
          return t('不允许')
        }
      }
      return v[j]
    })
  )
}
```

正如上面介绍过的，我们所需要做的，就是把不适合展示的信息格式转化成适合展示在`Excel`中的格式。因此通过两层`map`方法，展开各个商品，展开商品内部信息，找出需要调整格式的信息，返回其修改格式后的信息，而不需要修改格式的信息直接返回即可。注意到这里`if(j == 'product_unit_price')`的处理被放在了`if (v[j] == null)`之前，并且返回值调用了另一个格式化函数`formatPrice`，和其他信息不同。这是因为我在导出Excel的过程中发现了一个典型的数据结构不匹配问题，这个放在下面的[解决数据结构不匹配问题](#解决数据结构不匹配问题)讲解。

#### 补充其他参数
完成最主要的数据格式化，剩下的简单参数进行补充即可。

比如`header`，根据页面展示的内容，给出`const tHeader = [...]`作为文件中各列（属性）名称，后面把`tHeader`做为参数导入即可。

至于`filename`、`autoWidth`、`bookType`，在`state`里补充设置好相应内容即可：
```
const state = reactive({
  ...
  filename: '商品列表',
  autoWidth: true,
  bookType: 'xlsx',
})
```

### 补充一下selectRows的实现
是通过`element-plus`对表格中全选框、复选框自带的监听实现的：`el-table`中有`@selection-change`可监听复选框勾选情况，发生改变时则调用对应的方法，这里设置了`setSelectRows`
```
<el-table
    ...
    @selection-change="setSelectRows"
>
```
关于`setSelectRows`的实现如下：可以看到`@selection-change`可监听复选框勾选情况，并获取被勾选对象信息作为参数传给对应的方法，这里直接将带来的参数`val`赋值给了`state.selectRows`
```
const setSelectRows = (val) => {
  ...
  state.selectRows = val
}
```

## 另外的需求与完成
### 样式调整
顺便对之前的按钮样式做了修改。在我接手之前，这个代码的写法布局破坏了默认的样式，导致样式混乱。我将不必要的写法抛去，使用默认的布局实现相同的功能，保留默认的样式即可。

这是原本的代码，为了做一个路由跳转使用了`<ms-link>`破坏了布局，下面也用了一个没有必要的`<ms-link>`。
```
<ms-search-box-left-panel :span="5">
  <ms-link to="/add">
    <el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" :icon="Plus" type="primary">
      {{ t('添加') }}
    </el-button>
  </ms-link>
  <ms-link to="">
    <el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" type="success" @click="importEdit">
      {{ t('导入') }}
    </el-button>
    <el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" type="warning" @click="importEditItem">
      {{ t('批量修改') }}
    </el-button>
    <el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" type="warning" @click="handleDelete">
      {{ t('批量删除') }}
    </el-button>
    <el-button v-if="hasSelected" :icon="Top" type="success" @click="batchUpdate(1001)">
      {{ t('上架') }}
    </el-button>
    <el-button v-if="hasSelected" :icon="Bottom" type="danger" @click="batchUpdate(1002)">
      {{ t('下架') }}
    </el-button>
  </ms-link>
</ms-search-box-left-panel>
```
事实上直接给*添加*按钮点击后编程式路由跳转就搞定了，删去`<ms-link>`就能保持默认布局
```
<ms-search-box-left-panel :span="5">
    <el-button v-permissions="{ permission: ['/manage/pt/productBase/edit'] }" :icon="Plus" type="primary" @click="router.push({path:'/add'})">
      {{ t('添加') }}
    </el-button>
    ...其他按钮
</ms-search-box-left-panel>
```

### 解决数据结构不匹配问题
数据结构不匹配是因为在最前面的配置代码中，可以看到`商品单价`对应的属性是`product_unit_price`，但当`product_unit_price`被访问时，返回的结果却是`undefined`，我查看了原本的表格是怎么使用`product_unit_price`的，然后就找到了原因，先看表格关于商品单价这一列的代码：
```
<el-table-column
    align="center"
    :formatter="(row, column)=>{if (row.product_unit_price_min!=row.product_unit_price_max && row.product_unit_price_min<row.product_unit_price_max){return t('￥') + row.product_unit_price_min + ' ~ ' + row.product_unit_price_max}else{return t('￥') + row.product_unit_price_min}}"
    :label="t('商品单价')"
    prop="product_unit_price"
    show-overflow-tooltip
    sortable
    width="120"
/>
```
可以看到表格通过`formatter`函数动态生成展示内容，组合了`product_unit_price_min`和`product_unit_price_max`，实际数据中并不存在`product_unit_price`；其实解决方案有简单的：可以在下面也根据`product_unit_price_min`和`product_unit_price_max`来生成对应的数据返回，但考虑到保持表格展示和导出逻辑的一致性，我觉得创建通用格式化函数更好，于是就有了`formatPrice`：
```
export const formatPrice = (row, withSymbol = true) => {
  const min = row.product_unit_price_min;
  const max = row.product_unit_price_max;
  const symbol = withSymbol ? '￥' : '';
  
  if (min !== max && min < max) {
    return `${symbol}${min} ~ ${max}`;
  } else {
    return `${symbol}${min}`;
  }
};
```
设计完函数，引入文件，在这两个地方都使用即可:

在`el-table-column`商品单价这一列使用：
```
<el-table-column 
  ...
  :formatter="(row) => formatPrice(row)" 
  ...
/>
```
在`formatJson`中使用：
```
const formatJson = (filterVal, jsonData) => {
  return jsonData.map(v => 
    filterVal.map(j => {
      if (j === 'product_unit_price') {
        return formatPrice(v); 
      }
      ...
    })
  );
};
```
这样就顺利解决了数据结构不匹配的问题了，既能正确导出`Excel`表格中所需的商品单价，也能保持表格展示和导出逻辑的一致性

## 总结
收获了调用`Excel`导出工具导出`Excel`文件的做法，这是之前的学习经历中没有做过的内容。学习、了解了导出`Excel`表格的库、方法和工具。掌握处理数据结构不匹配问题的方法，顺便复习熟悉了`element-plus`中`el-table`的`@selection-change`的作用。