# 首页 多标签页
首页上有新闻热点、天气预报、每日英语、单词详解，还有一个使用须知，这些不同的功能当然不应该在一个页面里面展示。但是我们又不可能把他们都配置在底部栏，这样的话底部栏就有太多的内容。因此我们使用了AtTabsPane，也就是标签页，它是taro-ui中的内容。具体的使用方法直接在taro-ui官网就可以查看。因此不多赘述。

## 新闻热点标签页——动态渲染热点列表、url传参链接的编码与解码
这个页面的设计写的非常简单，是一个获取新闻热点的按钮，点击会调用获取新闻热点的方法，新闻热点的内容是存储在仓库中的，仓库的使用方法已经在前面讲过，这里不再赘述。这里的方法是校验了token来判断用户是否登录，登录的用户使用仓库中的获取热点方法来发送请求，token过期或者未登录都会提示登录

这种用大括号 {} 包裹的、用于嵌入表达式的区域，是 JSX 表达式插入，作用是在 JSX 语法中嵌入 JavaScript 表达式，实现动态内容渲染（如示例中的数组遍历 map 生成列表）。这是 JSX 语法的核心特性之一，允许将逻辑计算、变量、函数调用等结果直接嵌入到 UI 结构中。
```
<View style={{ marginTop: '10px' }}>
  <AtButton type='primary' onClick={fetchData}>获取热点信息</AtButton>
  {
    hotStore.hots.map((hot) => <HotItem key={hot.id} hot={hot} toHotDetail={toHotDetail} />)
  }
</View>
```
### 组件的使用
可以看到嵌入语法中使用仓库中存储的新闻热点内容map遍历渲染，渲染的内容是自己写的一个组件，组件的使用方法就是在src目录下创建components目录，然后创建组件的文件夹，内有jsx和scss：
这个组件的写法如下：
```
import { View, Text } from "@tarojs/components";
import React, { forwardRef } from 'react';
import './HotItem.scss'

// 使用 forwardRef 包装组件，使其支持 ref
// 注意父组件传过来的toHotDetail，forwardRef第一个参数就是props，可以接收变量、方法
const HotItem = forwardRef(({ hot, toHotDetail }, ref) => {
    function getHotId() {
        // console.log(hot.id);
        toHotDetail && toHotDetail(hot);
    }
    return (
        <View className="HotItem" ref={ref} onClick={getHotId}>
            <View className="hot-title">{hot.title}</View>
            <View className="hot-description">{hot.desc}</View>
            <View className="hot-bottom">
                <View className="hot-hot"><Text className="myicon myicon-hot"></Text>热度：{hot.hot}</View>
                <View className="hot-url"><Text className="myicon myicon-star-outline"></Text>{hot.url}</View>
            </View>
        </View>
    )
});

export default HotItem;
```
可以看到使用 forwardRef 包装组件，使其支持 ref，这是因为map遍历生成，需要有key，需要ref对应起来，和vue中v-for创建时需要key来对应是一样的，建议基本上都使用这个来包装。

通过代码我们也很容易看懂参数的传递和使用，那么这里就不再讲解。

### url作为链接参数出现的问题
有一个比较重要的需要讲解的内容是，父组件向子组件传递了一个toHotDetail的方法，这个方法的内容如下：
```
function toHotDetail(hot) {
  const encodeUrl = encodeURIComponent(hot.url)
  Taro.navigateTo({
    url: `/pages/hot/hot?id=${hot.id}&url=${encodeUrl}&hot=${hot.hot}`,
    events: {
      // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
      acceptDataFromOpenedPage: function (data) {
        console.log(data)
      },
    },
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
    }
  })
  // redirectTo重定向，会从栈中弹出一个，再让自己入栈
  // Taro.redirectTo({
  //   url: '/pages/hot/hot'
  // })
  // console.log(hot.id)
}
```
可以看到它主要是实现了一个页面跳转的功能，navigateTo和redirectTo如代码中写的那样，非常简单不做赘述。前面已经知道我们是动态渲染了一个新闻热点列表，因此我们把这个方法交给子组件，这样的话子组件就可以在被点击时传回对应的新闻热点hot，来告知具体哪一个热点被用户点击。

这里主要是想讲一下因为页面跳转它是使用url进行的，这里是跳转到一个写好的hot页面，因此我们把它的路径填入url中，又因为url是可以携带参数在链接中的，所以我们可以通过放在链接中的参数来告知他是哪一个新闻热点被用户选中。hot页面主要是展示的新闻热点信息中具有的url链接对应的页面，因此为了展示这个页面，hot使用的是WebView，所以最主要的参数就是这个url，但我们通过链接把url作为参数去传递就出现了问题：处理url，如果直接传像“？”这类特殊字符会导致解析出问题，因此使用encodeURIComponent编码后传过来，再用decodeURIComponent解码使用

这里我们可以再来看一下hot页面的实现：
```
import React, { forwardRef } from 'react';
import { View, Text, Button, WebView } from '@tarojs/components'
import { useState, useEffect } from 'react';
import { AtTag, AtButton } from 'taro-ui'
import Taro from '@tarojs/taro';
import './hot.scss'

const Hot = forwardRef((props, ref) => {
    // 使用state管理url
    const [webViewUrl, setWebViewUrl] = useState('');
    useEffect(() => {
        console.log('Page loaded')
        // console.log(Taro.getCurrentPages().length)// 能够显示当前页面栈深度，如果使用redirect重定向过来的，大概率就是1，这里前面是navigateto过来，所以是2
        // console.log(Taro.getCurrentInstance().router.params)// 前面跳转可以携带params参数，这边通过router路由器来读取
        let decodedUrl = decodeURIComponent(Taro.getCurrentInstance().router.params.url)
        // console.log('完整URL',decodedUrl);
        setWebViewUrl(decodedUrl)
    }, [])
    // function goback() {
    //     Taro.navigateBack({
    //         delta: 1 // 可以设置返回深度，这里是为了演示，不写也可以因为默认就是1；
    //     })
    // }
    // function goToMe() {
    //     // 如果使用navigate无法切换tab页面，会报错："errMsg":"navigateTo:fail can not navigateTo a tabbar page"
    //     // Taro.navigateTo({ 无法跳转！！
    //     //     url: '/pages/me/me'
    //     // })
    //     Taro.switchTab({
    //         url: '/pages/me/me'
    //     })
    // }
    function handleMessage() { }
    return (
        // <View className='hot' ref={ref}>
        //     热点详情
        //     <Button onClick={goback}>点我返回</Button>
        //     <Button onClick={goToMe}>点我前往个人页面</Button>
        // </View>
        // 处理url，如果直接传像“？”这类特殊字符会导致解析出问题，因此使用encodeURIComponent编码后传过来，再用decodeURIComponent解码使用
        // webview会占满屏幕，因此不能return其他内容
        <WebView src={webViewUrl} onMessage={handleMessage} />
    )
})

export default Hot;
```
可以看到获取params参数的方法是Taro.getCurrentInstance().router.params，解码方法是decodeURIComponent；

WebView只需要一个链接即可使用，注意会占满屏幕；这个页面的代码中还提到switchTab切换tab页，navigateTo不行；

当然其实现在回头去看也可以只通过params传一个hot.id参数，然后hot页面再去从仓库里获取对应id的url，但是直接通过链接传递的方法不需要使用仓库，运行的效率、速度会更快。

## 天气预报标签页——样式统一适配，搜索城市天气、绑定设置默认城市
相较于新闻热点，天气预报标签页要更加直接，标签页内容、方法直接写在index中，当然还是创建了weather仓库存放请求内容

### 样式统一适配
这个标签页的主要内容是样式的适配与调整，采用视窗vh，vw作为主要的样式调整单位，实现不同大小屏幕的统一适配

### 支持搜索城市、绑定设置默认城市
设置顶部搜索栏，提供给用户搜索省市区，展示对应天气信息：
```
<AtSearchBar
  inputType='text'
  placeholder='请输入您要查看的市/区'
  value={city}
  onChange={onChangeCity}
  onActionClick={onActionClickCity}
/>
```

底部提供设置默认城市按钮，存储用户城市，下次打开自动展示该城市天气：
```
<View className='weatherBottom'>下方设置默认市/区，以后打开天气预报默认展示该市/区天气</View>
<AtButton circle onClick={CityInToken}>设置为默认市/区</AtButton>
```

注意到onChange={onChangeCity}绑定修改city，city随着用户在搜索栏中的输入而变化，内容有可能并不是正确的省市区名称，也有可能不是当前天气预报展示的省市区，而用户点击设置为默认城市时，想设置的一定是当前正在展示的城市，因此需要额外设置一个successcity，表示当前页面正在展示的省市区，也可以理解为用户最后一次成功请求的城市；

### 自动展示该城市天气
当用户点击保存后，将其缓存至StorageSync（相当于localstorage）
```
// 设置默认市/区存入token
async function CityInToken() {
  Taro.setStorageSync('defaultCity', successCity);
  setToastOpen(true)
  setTimeout(() => {
    setToastOpen(false)
  }, 1000)
}
```
ps：可以看到这里使用了AtToast轻提示，AtMessage是非常常用且我印象比较深的内容，但AtToast也同样非常好用，这里也补充强调一下：
```
<AtToast isOpened={toastOpen} text="默认市/区设置成功" duration={1000}	></AtToast>
```

当用户打开该页面，先检查缓存中是否有城市：
```
let defaultCity = Taro.getStorageSync('defaultCity') // 开始就要获取，和token一样，token判断获取收藏，defaultCity判断获取天气
```

如果有，通过useEffect及时发送请求，当然，要同步设置SuccessCity，否则用户在未进行任何搜索的情况下，再次点击保存默认城市将不是当前展示城市
```
useEffect(() => {
  ......
  if (defaultCity) {
    setSuccessCity(defaultCity) // 如果有就设置默认市/区并发送请求获取数据
    const res = weatherStore.getWeathers(defaultCity);
    console.log(res);
  }
}, [])
```

## 每日英语、单词详解标签页——复用组件实现两个页面
两个标签页的内容高度重合，复用组件English实现：
```
{/* 每日英语 */}
<AtTabsPane current={current} index={3}>
  <View>
    <AtButton onClick={getEverydayEnglish}>获取每日英语知识</AtButton>
    {
      englishTip
        ? <EnglishWeb EnglishStore={EnglishStore} word={EnglishStore.word}></EnglishWeb>
        : <View className='EnglishTip'>
          每日英语提供每日经典英语例句、词汇和短语等内容，帮助您进行英语学习，提高语言能力。当然您可以多次点击按钮来学习更多，不过学习知识，质量比数量更重要，请量力而行。
        </View>
    }
  </View>
</AtTabsPane>
{/* 单词详解 */}
<AtTabsPane current={current} index={4}>
  <View>
    <AtSearchBar
      inputType='text'
      placeholder='请输入您要查看的单词'
      value={word}
      onChange={onChangeWord}
      onActionClick={onActionClickWord}
    />
    {
      WordStore.word
        ? <EnglishWeb EnglishStore={WordStore} word={WordStore.word}></EnglishWeb>
        : null
    }
  </View>
</AtTabsPane>
```
可以看到每日英语是通过顶部按钮获取内容，单词详解则是由用户通过搜索栏搜索获取内容，由于设计上的样式等相同，都复用EnglishWeb组件，但需要区分两个仓库EnglishStore和WordStore存放对应请求得到的信息，这样保证两个页面各自展示对应内容，互不干扰


### 支持播放英式、美式音频
播放音频使用Taro.createInnerAudioContext创建，曾经出现过播放音频错误、阻塞等问题，是由于没有及时准确调整音频内容导致：

使用useEffect及时监听对应仓库内容变化，及时更新渲染页面内容

```
const EnglishWeb = forwardRef(({ EnglishStore, word }, ref) => {
  let UKAudio = Taro.createInnerAudioContext({ useWebAudioImplement: true }) // 创建英式发音音频
  let USAudio = Taro.createInnerAudioContext() // 创建美式发音音频
  // 播放英式发音音频
  function playUKAudio() {
    // UKAudio.src = EnglishStore.ukspeech;
    // console.log('播放音频',UKAudio.src);
    UKAudio.play();
  }

  // 播放美式发音音频
  function playUSAudio() {
    // USAudio.src = EnglishStore.usspeech;
    USAudio.play();
  }

  useEffect(() => {
    // console.log('Page loaded')
    UKAudio.src = EnglishStore.ukspeech;
    USAudio.src = EnglishStore.usspeech;
  }, [word])
  return (
    ......
  )
});
```

### 支持搜索单词
搜索单词的实现与搜索城市天气基本相同，但更简单，因为不需要保留默认内容
