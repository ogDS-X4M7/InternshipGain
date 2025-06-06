# 快速上手项目一——批量处理数据
实习开始后，并没有太多太重的任务，公司的项目基本都已经成型，需要的只是增加功能，完善项目，因此大部分时候需要快速上手项目，熟悉项目，并投入对需求的完成工作中。

## 需求与完成
项目一的第一个需求是我自己根据需求文档挑选了一个来完成的。

这个项目在后台用户资料的一个表格中，操作项下展示用户的资金与积分，资金和积分后台人员都可以点击进行操作，需求是想要一个批量操作的选项，并且在其他页面(后续称`页面A`)有类似的实现，需求文档里讲到可以和`页面A`实现效果一致。

于是我观察了`页面A`的实现效果，只需要给出选项，然后弹出消息框以供操作者输入，确定后修改全部用户资金或积分即可。不需要确定选中用户范围，批量修改就是修改全部，于是实现起来还是比较简单的。

不过两个页面仍然存在差别，`页面A`的操作栏是只有一个项目进行批量修改，需求的页面有两个选项，于是还需要有一个判断，选择是对资金进行批量修改还是对积分进行批量修改，于是我使用了*element-plus*的气泡确认框，结合自定义弹出框的内容和点击按钮触发事件，设计一个气泡框，操作流程和`页面A`差不多，点击操作栏时，弹出气泡框，自定义气泡框文本内容是询问操作者要批量修改什么内容，并将确认和取消的两个选项修改为用户资金和用户积分，选择后弹出相应的修改消息框以供操作者输入修改后的值，如果用户输入且值合理，调用批量修改的接口，完成批量修改。

找到操作栏所在部分代码：
```
<el-table-column align="center" fixed="right" :label="t('操作')" width="180">
    <template #default="{ row }">
        <el-button v-permissions="{ permission: ['/manage/pay/userResource/edit'] }" style="margin-right: 15px" text @click="MoneyShow(row)">{{ t('修改资金')}}</el-button>
        <el-button v-permissions="{ permission: ['/manage/pay/userResource/edit'] }" text @click="PointsShow(row)">{{ t('修改积分') }}</el-button>
    </template>
</el-table-column>
```
对表格该列头部，即`el-table-column`增加`<template #header="scope" >`：
```
<template #header="scope" >
    <el-popconfirm
      placement="top"
      title="选择批量操作对象?"
      width="220"
      @cancel="operateMoney"
      @confirm="operatePoints"
    >
        <template #reference>
            <span style="cursor:pointer;" :title="t('批量设置选择')">{{scope.column.label}}<ms-icon data-key="item_market_price" icon="more-2-line" /></span>
        </template>
        <template #actions="{ confirm, cancel }">
            <el-button size="small" type="primary" @click="cancel">客户资金</el-button>
            <el-button
              size="small"
              type="danger"
              @click="confirm"
            >
                客户积分
            </el-button>
        </template>
    </el-popconfirm>
</template>
```
下方添加增加的相应函数处理：
```
const operateMoney = ()=>{
    ElMessageBox.prompt(t('批量设置客户资金'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
    })
        .then(({ value }) => {
          if (value) {
            //调用接口
          }
        })
        .catch(() => {})
    }

    const operatePoints = ()=>{
      ElMessageBox.prompt(t('批量设置客户积分'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
      })
        .then(({ value }) => {
          if (value) {
            //调用接口
          }
        })
        .catch(() => {})
    }
```

## 另外的需求与完成
关于这个项目后续其实还做了一个需求，不过因为比较简单，就不单开一页写了，直接在这里记录。

新的需求只是在用户发布商品信息时，把一个单选选项的默认项从第一项改为第二项，非常简单。

完成它只需修改一行代码，几乎没啥好讲的，但是毕竟一个项目的内容是庞大的，在这里我是想写一下我如何快速定位一个我不熟悉的项目它需要修改的代码位置：

我是通过*Vue DevTools*来定位的，打开要修改的页面，根据*Vue DevTools*中的项目找到单选项对应的属性，后续直接在对应页面的代码里搜索这个属性、值，就能找到有关这个属性和值的几个位置，将任务从在几千行代码里找出修改点变为从几行代码中找到修改点，效率大大提高，所以要熟悉并灵活运用*Vue DevTools*。

## 总结
相关的内容我之前做过类似的，总结来说就是：实现了选择对象并批量处理对象数据的功能；

收获的话，更加熟悉了*element-plus*的气泡确认框的使用，毕竟在完成我个人项目之后，也有一段时间没有使用了，框架、库也是需要多写多用才更熟练，遇到复杂问题的时候才能快速想到解决方案。

至于第二个需求的收获，就是前面说的，要熟悉并灵活运用*Vue DevTools*。