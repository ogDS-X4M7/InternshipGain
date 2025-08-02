<template><div><h1 id="项目四、五-小插曲" tabindex="-1"><a class="header-anchor" href="#项目四、五-小插曲"><span>项目四、五-小插曲</span></a></h1>
<p>这次接触到了两个新的项目，两个都报错，其中一个报错还是我没见过的，经过对报错的分析和代码的查看，发现其实不需要我做修改，只需要项目更新代码、重新上线一下既可，不过还是记录一下这两个报错以及我判断问题根源的过程</p>
<h2 id="需求与完成" tabindex="-1"><a class="header-anchor" href="#需求与完成"><span>需求与完成</span></a></h2>
<p>第一个项目，叫它项目四吧，项目四是一个商户管理项目，商家登录管理，报错就是我没见过的：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">Mixed Content: The page at 'https://xxx.com/#/login' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://xxx.com/user/login/shop'. This request has been blocked; the content must be served over HTTPS.</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>这部分报错总结起来就是混合了两种协议，<code v-pre>http</code>和<code v-pre>https</code>，应该全部使用<code v-pre>https</code>请求才对；于是我拉下代码运行，结果却成功登录，并没有报错。我又检查了拉取的代码，确实全都使用的是<code v-pre>https</code>，那上线的项目怎么会请求<code v-pre>http</code>呢？因为之前经历过我提交的代码被合并到分支，但上线网站并没有看到效果，最后了解到需要上线同步更改才行。因此我想到也许是没有同步更改导致的，查找了最新的更改：<em>项目-最新分支(主分支)-已合并请求</em>，果然看到：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">axios.defaults.baseURL = 'http://xxx.com' //线上接口</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>最新修改为：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">axios.defaults.baseURL = 'https://xxx.com' //线上接口</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>这印证了我的猜想，因此只要通知负责人及时更新同步上线代码即可。</p>
<p>第二个项目，叫它项目五，是一个外卖平台后台管理项目，管理员登录管理商家，出现的是跨域报错：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">Access to XMLHttpRequest at 'https://yyy.cn/user/login/user' from origin 'https://yyy.cn' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>同样把代码拉下来运行，发现也没有报错，于是同样查看最新的代码更新信息，果然看到</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">axios.defaults.baseURL = 'https://xxx.xxx.com' //线上接口</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>被修改为</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">axios.defaults.baseURL = 'https://xxx-api.xxx.com' //线上接口</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>注意到我写成<code v-pre>yyy</code>和<code v-pre>xxx</code>，意思就是它们完全不同，仔细查看请求的<code v-pre>url</code>，完全是不同的两个请求<code v-pre>url</code>，这是很奇怪的，因为哪怕看到最近的更新里面，也没有使用<code v-pre>yyy</code>，于是我在整个项目中查找<code v-pre>yyy</code>，想找出这到底是从哪里来的，结果就是，仅在<code v-pre>build</code>文件夹中存在<code v-pre>yyy</code>，这意味着之前更新代码的人，修改代码后一直没有重新<code v-pre>build</code>，以至于这里面还在使用接口<code v-pre>yyy</code>，而项目上线使用的是生产环境下的<code v-pre>build</code>中的文件，这就导致上线项目和本地项目运行起来完全不同，会请求不一样的<code v-pre>url</code>。因此，需要重新<code v-pre>build</code>，并将新的文件上传，再部署上线来解决这个问题。</p>
</div></template>


