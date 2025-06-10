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