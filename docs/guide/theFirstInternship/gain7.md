# 项目一——完善订单列表

## 需求与完成
这次的需求仍然来自于项目一，不过是完善功能。原本项目已经实现了订单的导出功能，但现在想要增加信息，包括规格明细、积分、单价、成交单价、下单数量、收件人信息

基于之前完成的需求以及对整个导出封装文件的解读理解，很轻松就能修改原本的代码来增加新的功能

找到原本对excel方法的调用位置
```
import('@/utils/excel').then((excel) => {
    const tHeader = ['订单编号', '订单标题', '客户名称', '应付金额', '下单时间', '配送方式', '订单状态', '退款状态', '发货状态', '付款状态', '收货状态', '买家留言', '支付方式', '活动类型']
    const filterVal = ['order_id', 'order_title', 'user_nickname', 'order_payment_amount', 'order_time', 'delivery_type_id', 'order_state_id', 'order_refund_status', 'order_is_shipped', 'order_is_paid', 'order_is_received', 'order_message', 'payment_type_id', 'activity_type_id']
    ......其他配置
})
```
补充对应的信息和内容
```
import('@/utils/excel').then((excel) => {
    const tHeader = ['订单编号', '订单标题', '客户名称', '应付金额', '下单时间', '配送方式', '订单状态', '退款状态', '发货状态', '付款状态', '收货状态', '买家留言', '支付方式', '活动类型','规格明细','积分','单价','成交单价','下单数量','收货人','联系电话','收货地址']
    const filterVal = ['order_id', 'order_title', 'user_nickname', 'order_payment_amount', 'order_time', 'delivery_type_id', 'order_state_id', 'order_refund_status', 'order_is_shipped', 'order_is_paid', 'order_is_received', 'order_message', 'payment_type_id', 'activity_type_id','items.item_name','items.item_unit_points','items.item_unit_price','items.order_item_sale_price','items.order_item_quantity','da_name','da_mobile','da_address']

    ......其他配置
})
```
注意到，需要补充的信息很多位于`items`内，如果直接像这样写`items.xxx`一定会出问题，因为处理数据的`formationJson`原本的写法如下：
```
const formatJson = (filterVal, jsonData) => {
    return jsonData.map((v) =>
      filterVal.map((j) => {
        if (v[j] == null) return null;
        if (j == '...') {
          return ...
        } else if (j == '...'){
            return ...
        } ......

        return v[j]
      })
    )
}
```
因此`items.xxx`这多样的写法很明显根本不会有这样的属性：`v[items.xxx]`，所以对`formationJson`也要做处理：
```
const formatJson = (filterVal, jsonData) => {
    return jsonData.map((v) =>
      filterVal.map((j) => {
        if (j.startsWith("items")) {
          j = j.split('.');
          if (v[j[0]][0][j[1]] == null) return null;
          return v[j[0]][0][j[1]];
        }

        if (v[j] == null) return null;
        if (j == 'order_payment_amount') {
          return ...
        } else if ...

        return v[j]
      })
    )
}
```
因为像`items.xxx`这样的内层属性很多，所以我干脆统一了一个写法：使用`split`分割，随后一层一层地获取属性`v[j[0]][0][j[1]]`

为什么中间有个`[0]`？这是后端传过来的数据，`v[j[0]]`拿到的是一个数组，而且这个数组只有一个元素，那就直接`v[j[0]][0]`拿到数组第一个元素，随后再从数组第一个元素中拿到属性`j[1]`

## 小插曲与收获
在这次修改完成后，项目的新功能上线。不过在我检查上线后的效果时，发现收件人信息欠缺，和后端沟通后了解到后端修改还未上线。和负责人沟通相关情况后，负责人让我和后端说尽快上线不然影响功能，不过我和负责人说不会报错，只是相应一小部分信息为空，负责人表示还行。后续和后端沟通，了解到项目目前有多个后端在处理，不好统一提交，我不得不庆幸提交前自己完善了代码健全性：

其实这部分在我提交修改，在上传分支之前先看了自己修改的代码，然后临时补充了`if (v[j[0]][0][j[1]] == null) return null;`对空值的处理，如果当时没有再检查一遍，前端上线，后端没上线，这部分功能就要受影响报错了。

也是在这样的实际项目经历中才能体会到代码健全的重要性，如果个人项目，后端没有及时提交修改，我补充提交一下就可以了。但是像实际项目，就容易出现这些意想不到的问题，我们能做的就是完善自己的代码，以应对各种情况。

## 总结
再次熟悉导出`excel`表格实际操作，思考了解决问题、处理字段的新方法，并通过实际操作感受了代码健全性的重要性。