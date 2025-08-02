# Taro小程序+React——基础知识与正常运行须知

这部分学习内容结合相应代码查看，目的是复习和记下使用方法，只供个人查看

大部分写法、使用方法都直接看代码就能了解，只做稍微的记录：

有类组件和函数组件两种写法，常用函数组件，两个写法都很简单，直接去看代码就知道，这里不多说。组件的调用很简单，到对应页面直接`import`，在`return`里直接使用即可

样式也很简单，基本没变，在组件、页面同目录下创建文件，然后`import './xxx.scss'`引入即可

## 状态管理（重点）

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

## 发送请求（重点）

发送请求`Taro`有自己的`Taro.request`，引入一下就能用：

这里是二次封装，设置网络请求拦截器，添加了请求时的顶部栏加载动画与请求后的关闭，添加了请求附带token的设置；

创建`service`文件夹，下创`httpService.js`:注意`return`
```
import Taro from "@tarojs/taro"
import { request as TaroRequest } from '@tarojs/taro';

// 网络请求拦截器
const interceptor = function (chain) {
    const requestParams = chain.requestParams
    const { method, data, url } = requestParams

    // console.log(`http ${method || 'GET'} --> ${url} data: `, data)

    // 添加加载
    Taro.showNavigationBarLoading();
    Taro.showLoading()

    // console.log(requestParams)
    // debugger
    // 添加token
    const token = Taro.getStorageSync('token')
    // console.log(token);
    if (token) {
        requestParams.header = { ...requestParams.header, authorization: `Bearer ${token}` }
    } else {
        // console.log('请先登录')
    }
    // console.log(requestParams)
    // 这里还意外发现两个console.log打印结果都是添加了token后的内容，原因是没有深拷贝， 
    // JavaScript 的 console 在打印对象时，通常会显示对象的最终状态（特别是在异步环境中）。
    // 这是因为 console 可能会在修改对象后才渲染其内容，导致看到的两个打印结果都包含了 token。

    // 顺便使用了debugger，在debugger的帮助下，第一个console.log会打印出添加token前的requestParams

    return chain.proceed(requestParams)
        .then(res => {
            // console.log(`http <-- ${url} result:`, res)
            // 关闭加载
            Taro.hideNavigationBarLoading()
            Taro.hideLoading();
            return res
        })
}
Taro.addInterceptor(interceptor)

// option是obj，暂时先设置允许传入url、data、header
export default {
    request(option, method = 'GET') {
        return TaroRequest({
            ...option,
            method, // 传递 method 参数
            header: {
                'content-type': 'application/json', // 默认值
                ...option.header
            },
            success: function (res) {
                // console.log(res.data)
            },
            timeout: 5000
        })
    },
    get(option) {
        return this.request(option, 'GET');
    },
    post(option) {
        return this.request(option, 'POST')
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
## 注意事项：域名备案
**注意：小程序要求所有网络请求的域名必须先在微信公众平台完成备案，否则会被拦截。**

报错如下：
```
https://xxx 不在以下 request 合法域名列表中，请参考文档：https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html(env: Windows,mp,1.06.2412050; lib: 3.8.7)
```
需要进入微信公众平台，选择小程序，开发管理->开发设置->服务器域名，在`request`合法域名中添加使用的域名，回来微信开发者工具要点右上角详情->项目配置，看着域名信息自动更新，才能正常运行

最后就可以正常使用了，进入要使用的仓库，引入、调用方法即可：注意处理返回回来的`promise`
```
import { observable, runInAction } from "mobx";
import service from "../service";
const hotStore = observable({
  hots: [],
  async getHots() {
    try {
      const result = await service.getHotList();
      // console.log(result);
      // console.log(result.data);
      // this.hots.push(...result.data.data);
      if (result.data.code === 200) {
        runInAction(() => {
          // 在 runInAction 中修改状态
          this.hots = result.data.data.map(item => ({
            ...item,
            // 如果原数据没有 id，添加唯一标识
            id: item.id || `hot-${Date.now()}-${Math.random().toString(36).slice(2)}`
          }));
        });
        return true;
      }
      return result.data.msg; // 因为其他原因没能获取数据，则返回原因
      // async、await本质就是promise的语法糖，我在这里return true，但后续调用这个函数的地方收到的返回值仍然是一个promise：resolved状态，值为 true。
      // 因为async、await内部会自动帮忙转化成promise，当然源头必须本身是promise才能处理，就像这里的await service.getHotList()，
      // 找到源头是返回了一个request请求，返回的本身就是promise，经过这里的语法糖，继续返回的值就和promise直接的.then是一样的，返回的一直都是promise。
    } catch (err) {
      return err;
    }
  }
})


export default hotStore;
```


## Webpack5 预构建机制导致的问题

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
并且出现页面`AtModal`打开确认、取消按钮不显示的问题；

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

问题的核心原因与`Webpack5`预构建机制有关：

`Webpack5`预构建的影响：

当配置`compiler: 'webpack5'`时，`Taro`默认启用了`prebundle（预构建）`功能

预构建会提前打包某些模块（如`@taro/components`），但可能导致以下问题：

模块加载顺序混乱：预构建模块与业务模块的加载时序不匹配

模板引用丢失：动态模板引用在预构建过程中被错误处理

组件样式隔离：预构建可能导致组件样式作用域失效

模板未找到的具体原因：

预构建过程中，`Taro`可能未能正确解析`base.wxml`中动态引用的模板

表达式`{{xs.a(5, i.nn, l)}}`生成的模板名称在预构建时被错误处理，导致运行时无法匹配

组件显示异常的原因：

`AtModal`按钮不显示通常是因为：

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
这个方案的核心是禁用`Webpack5`的预构建功能，其解决问题的逻辑如下：

关闭预构建的直接效果：

模块加载顺序恢复正常：所有模块按运行时需求动态加载，避免时序错误

模板解析回归动态模式：`Taro`在运行时按需解析模板引用，确保`tmpl_0_13`被正确查找

组件样式作用域修复：关闭预构建后，组件样式能正确注入到页面作用域

配置参数的具体作用：

`type: 'webpack5'`：保持使用`Webpack5`编译器，确保新特性支持

`prebundle.enable`: `false`：禁用预构建功能，这是解决问题的关键

`prebundle.include`：虽然启用了 `include`，但由于`enable`设为`false`，该配置实际不生效

更深层的技术原理：

预构建本质是为了优化性能，但在复杂项目中可能破坏动态依赖关系

`Taro`的模板系统依赖运行时动态解析，预构建的静态分析无法处理所有动态引用场景

关闭预构建后，`Webpack`回归到传统的按需打包模式，确保模块和模板的动态加载能力
