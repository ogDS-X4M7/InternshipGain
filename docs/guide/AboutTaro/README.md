# Taro 小程序+React学习

这部分学习内容结合相应代码查看，目的是复习和记下使用方法，只供个人查看

大部分写法、使用方法都直接看代码就能了解，只做稍微的记录：

有类组件和函数组件两种写法，常用函数组件，两个写法都很简单，直接去看代码就知道，这里不多说。组件的调用很简单，到对应页面直接`import`，在`return`里直接使用即可

样式也很简单，基本没变，在组件、页面同目录下创建文件，然后`import './xxx.scss'`引入即可

**重点讲一下状态管理**

状态管理仓库使用`mobx`，`store`文件夹下创建想要的仓库`js`文件，引入`mobx`：
```
import { observable } from 'mobx'
```
使用它的`observable`函数创造仓库表示可观测监视，当然最后记得导出：
```
const counterStore = observable({
    counter: 0,
    increment(){
        this.counter++;
    },
})
export default counterStore;
```
多个仓库可以收在一起，方便一并挂载，`store`文件夹下创建`index.js`一起存放
```
import hotStore from "./hot";
import counterStore from "./counter";

const rootStore = {
    counterStore,
    hotStore
};
export default rootStore;
```
在`app.js`挂载，使用`Provide`
```
function App({ children }) {
  useLaunch(() => {
    console.log('App launched.')
  })
  return (
    <Provider {...rootStore}>
        {children}
    </Provider>
  )
}
```
最后到页面上使用，使用`inject`表示注入对应仓库，还要搭配`observer`使用：`observable` 是用来创建 / 转换状态数据的，不能直接包装组件,将普通对象、数组或类转换为可观察对象。`observer` 是 `MobX` 提供的高阶组件，用于将 `React` 组件转换为响应式组件。
```
const Index = ({ counterStore,hotStore })=> {
  const fetchData = ()=>{
    console.log('获取数据')
    hotStore.getHots();
  }
  useEffect(() => {
    console.log('Page loaded')
  }, [])
  return (
    <View className='index'>
      <Text>{counterStore.counter}</Text>
      <Button onClick={()=>counterStore.increment()}>+</Button>
      <Button onClick={fetchData}>获取热点信息</Button>
      {/* {
        hotStore.hots.map((hot)=><View key={hot.id}>{hot.title}</View>)
      } */}
      {
        hotStore.hots.map((hot)=><HotItem key={hot.id} hot={hot} />)
      }
    </View>
  )
}

export default inject('counterStore','hotStore')(observer(Index))
```

**再重点讲一下发送请求**

发送请求`Taro`有自己的`Taro.request`，引入一下就能用：这里是简单的二次封装，创建`service`文件夹，下创`httpService.js`:注意`return`
```
import Taro from "@tarojs/taro"

// option是obj，暂时先设置允许传入url、data、header
export default {
    request(option,method  ='GET'){
        return Taro.request({
            ...option,
            header: {
              'content-type': 'application/json', // 默认值
              ...option.header
            },
            success: function (res) {
            //   console.log(res.data)
            }
        })
    },
    get(option){
        return this.request(option,'GET');
    }
}
```

同一目录下创建`index.js`，封装`api`——对应的方法：注意`return`
```
import httpService from "./httpService";

const service = {
    getFilmList(){
        httpService.get({
            url:'https://ghibliapi.vercel.app/films',
        })
    },
    getHotList(){
        return httpService.get({
            url:'https://v2.xxapi.cn/api/baiduhot',
        })
    }
}

export default service;
```
**注意：小程序要求所有网络请求的域名必须先在微信公众平台完成备案，否则会被拦截。**

报错如下：
```
https://xxx 不在以下 request 合法域名列表中，请参考文档：https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html(env: Windows,mp,1.06.2412050; lib: 3.8.7)
```
需要进入微信公众平台，选择小程序，开发管理->开发设置->服务器域名，在`request`合法域名中添加使用的域名，回来微信开发者工具要点右上角详情->项目配置，看着域名信息自动更新，才能正常运行

最后就可以正常使用了，进入要使用的仓库，引入、调用方法即可：注意处理返回回来的`promise`
```
import { observable } from "mobx";
import service from "../service";
const hotStore = observable({
    hots:[],
    getHots(){
        const result = service.getHotList();
        console.log(result);
        result.then(res=>{
          console.log(res);
          this.hots.push(...res.data.data)
        })
    }
})
```




遇到一个之前让我放弃的问题，没想到开发了这么久又突然冒了出来，这次我找到了解决方案：

问题：
报警告：
```
WXMLRT_$gwx:./base.wxml:template:213:16: Template `tmpl_0_13` not found.
[WXML Runtime warning] ./base.wxml
 Template `tmpl_0_13` not found.
  375 | 
  376 | <template name="tmpl_5_container">
> 377 |   <template is="{{xs.a(5, i.nn, l)}}" data="{{i:i,cid:5,l:xs.f(l,i.nn)}}" />
      |                ^
  378 | </template>
  379 | 
  380 | <template name="tmpl_6_0">
```
并且出现页面AtModal打开确认、取消按钮不显示的问题；

解决方案与流程：
找到`github`上`taro`的`issues`中有人提到`Taro3.6.25 开启 Prebundle 微信小程序会报 Template tmpl_0_13 not found 警告 #15493`

可以通过搜索引擎搜索`Template 'tmpl_0_13' not found`找到；

解决方案：
打开`config/index.js`,将
```
compiler: 'webpack5',
```
修改为：
```
compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
      include: ['@taro/components'],
    },
  },
```
重新编译运行代码，重新打开微信开发者工具，代码恢复正常

问题的核心原因与Webpack5 预构建机制有关：

Webpack5 预构建的影响：

当配置compiler: 'webpack5'时，Taro 默认启用了prebundle（预构建）功能

预构建会提前打包某些模块（如@taro/components），但可能导致以下问题：

模块加载顺序混乱：预构建模块与业务模块的加载时序不匹配

模板引用丢失：动态模板引用在预构建过程中被错误处理

组件样式隔离：预构建可能导致组件样式作用域失效

模板未找到的具体原因：

预构建过程中，Taro 可能未能正确解析base.wxml中动态引用的模板

表达式`{{xs.a(5, i.nn, l)}}`生成的模板名称在预构建时被错误处理，导致运行时无法匹配

组件显示异常的原因：

AtModal按钮不显示通常是因为：

组件样式被预构建过程隔离，未正确注入到页面

动态组件渲染逻辑在预构建环境中执行异常

三、解决方案原理说明

将配置修改为以下形式解决了问题：

```js
compiler: {
  type: 'webpack5',
  prebundle: {
    enable: false,
    include: ['@taro/components'],
  },
}
```
这个方案的核心是禁用 Webpack5 的预构建功能，其解决问题的逻辑如下：

关闭预构建的直接效果：

模块加载顺序恢复正常：所有模块按运行时需求动态加载，避免时序错误

模板解析回归动态模式：Taro 在运行时按需解析模板引用，确保tmpl_0_13被正确查找

组件样式作用域修复：关闭预构建后，组件样式能正确注入到页面作用域

配置参数的具体作用：

type: 'webpack5'：保持使用 Webpack5 编译器，确保新特性支持

prebundle.enable: false：禁用预构建功能，这是解决问题的关键

prebundle.include：虽然启用了 include，但由于 enable 设为 false，该配置实际不生效

更深层的技术原理：

预构建本质是为了优化性能，但在复杂项目中可能破坏动态依赖关系

Taro 的模板系统依赖运行时动态解析，预构建的静态分析无法处理所有动态引用场景

关闭预构建后，Webpack 回归到传统的按需打包模式，确保模块和模板的动态加载能力





**没来得及记录的问题和内容**
因为太过忙碌,总是来不及记录学习内容,在这下面先列举吧:

react中useEffect回调函数使用async导致的崩溃问题、以及排查的方法与过程

数据库实现浏览历史的数组操作问题、去重、

利用token在redis里拿到userid、

查询用户使用的userid是ObjectId类型，先转换才能查，转换方式：const userid = mongoose.Types.ObjectId(data.userid);

微信小程序使用用户微信头像、昵称的事件需绑定在原生组件上（button、input）

微信小程序setState的渲染，并且setState的同个词法作用域闭包下捕获的是其渲染前的值，异步渲染后不更新，因此永远不要立刻使用刚setState设置完的值，要使用的话使用其数据源，而不是state




