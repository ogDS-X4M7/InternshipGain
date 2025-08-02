# 项目正式具体讲解
整体的项目已经完成，现在要对项目正式开始总结，因为比较忙碌，也隔了一定时间，决定从小程序功能出发来写总结，从而保证总结的全面，并且对之前写的难点要点，代码中有详细注释的部分拿出来做详细的文档总结：

小程序功能较多，暂时打算命名为“小八生活”，因为功能偏向于日常生活所需的集合，包括：

首页：新闻热点、天气预报、每日英语、单词详解；

短视频页：短视频播放以及对应子功能：播放上一个、下一个视频；点赞、收藏，并且个人页面有对应查询历史播放、我的点赞、我的收藏；

知识文档页：也就是你现在看到的，我编写的实习收获等总结的文档；

个人页：包括登录功能，退出功能，获取展示头像昵称，自定义上传头像昵称（支持获取上传微信头像昵称），查看我的点赞、我的收藏、浏览历史（这三个功能都是与短视频播放相关的）

首先从总体结构讲起：

# 页面与总体框架的配置：

正如上面所说，项目拆分四个主体页面，每个都有不同的内容，实现这个的方法就是tabbar，小程序中十分常见，就是底部有一个底部栏，提供四个选项给用户，优先展示首页：
tabbar是在app.config.js中写下,app.config.js内容如下：
```
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/me/me',
    'pages/hot/hot',
    'pages/study/study',
    'pages/shortvideo/shortvideo',
    'pages/historyVideo/historyVideo',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    list: [{
      pagePath: 'pages/index/index',
      text: '首页',
      iconPath: 'assets/images/indexnor1.png',
      selectedIconPath: 'assets/images/indexnor1_active.png'
    }, {
      pagePath: 'pages/shortvideo/shortvideo',
      text: '短视频',
      iconPath: 'assets/images/video.png',
      selectedIconPath: 'assets/images/video_active.png'
    }, {
      pagePath: 'pages/study/study',
      text: '知识文档',
      iconPath: 'assets/images/learn.png',
      selectedIconPath: 'assets/images/learn_active.png'
    }, {
      pagePath: 'pages/me/me',
      text: '我的',
      iconPath: 'assets/images/me.png',
      selectedIconPath: 'assets/images/me_active.png'
    }],
    color: '#8a8a8a',
    selectedColor: '#6190E8'
  }
})
```
那么很显然，大多数内容都是顾名思义，不做过多的解释，这里的配置和其他项目里的router基本是一致的，就是配置路由对应页面的意思：
只需要将自己写的所有页面对应的文件路径全部写进pages里便可以使用，**这一步也是很重要的，否则项目找不到页面**

window这一块则不是很重要，如果没记错，这应该是项目生成的时候默认自带的，我并没有修改它

最后到了我们本来主要想说的tabbar页面，tabBar里面有三个参数：

list中配置的就是底部栏选项，通过数组装入每个选项的配置对象，其中又有4个参数。pagePath是页面对应的路径，也就是可以理解为路由。text就是底部栏要显示的文字。iconPath是相对应的图标，图标还需要配置一个选中的版本，也就是selectedIconPath，因为点击后一般会显示成被选中激活的样式。

图标有被选中的版本，那么文字当然也是有的。文字要区分选中和未被选中就是通过颜色来区分。所以tabBar剩下的两个参数，color和selectedColor，就是区分选中和未被选中的文字颜色。

## 各个页面的详细配置

讲一下页面的配置。页面配置都是统一的，pages/index目录下，有index.config.js,index.jsx,index.scss：

index.config.js配置文件一般就是配置页面的顶部标签:
```
export default definePageConfig({
  navigationBarTitleText: '首页'
})
```
index.scss当然就是页面的样式；

index.jsx是页面的详细主体内容，下一节开始全面讲解。