# 项目三、四-小插曲

这次接触到了两个新的项目，两个都报错，其中一个报错还是我没见过的，经过对报错的分析和代码的查看，发现其实不需要我做修改，只需要项目更新代码、重新上线一下既可，不过还是记录一下这两个报错以及我判断问题根源的过程

## 需求与完成

第一个项目报错就是我没见过的：
```
Mixed Content: The page at 'https://youxuanshop.xunmengvip.com/#/login' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://youxuan-api.xunmengvip.com/user/login/shop'. This request has been blocked; the content must be served over HTTPS.
```
这部分报错总结起来就是混合了两种协议，`http`和`https`，应该全部使用`https`请求才对；于是我拉下代码运行，结果却成功登录，并没有报错。我又检查了拉取的代码，确实全都使用的是`https`，那上线的项目怎么会请求`http`呢？因为之前经历过我提交的代码被合并到分支，但上线网站并没有看到效果，最后了解到需要上线同步更改才行。因此我想到也许是没有同步更改导致的，查找了最新的更改：*项目-最新分支(主分支)-已合并请求*，果然看到：
```
axios.defaults.baseURL = 'http://xxx.com' //线上接口
```
最新修改为：
```
axios.defaults.baseURL = 'https://xxx.com' //线上接口
```
这印证了我的猜想，因此只要通知负责人及时更新同步上线代码即可。


第二个项目出现的是跨域报错：
```
Access to XMLHttpRequest at 'https://yxback.xunmengvip.cn/user/login/user' from origin 'https://yxvue.xunmengvip.cn' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
同样把代码拉下来运行，发现也没有报错，于是同样查看最新的代码更新信息，果然看到
```
axios.defaults.baseURL = 'https://xxx.xxx.com' //线上接口
```
被修改为
```
axios.defaults.baseURL = 'https://xxx-api.xxx.com' //线上接口
```
同样道理通知负责人及时更新同步上线代码即可。
