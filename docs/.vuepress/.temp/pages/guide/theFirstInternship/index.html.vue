<template><div><h1 id="收获一-vue项目中-路径别名配置" tabindex="-1"><a class="header-anchor" href="#收获一-vue项目中-路径别名配置"><span>收获一：Vue项目中@路径别名配置</span></a></h1>
<p>@是说项目里用来代表<code v-pre>src</code>的路径，因为项目较大的时候，很多模块要写导入的方法写相对路径会非常麻烦，通过配置@来代表根目录下的src是非常方便的。但网上配置的方式众说纷纭，而且大多都会导致<em>vscode</em>中出现红线表示找不到对应文件，虽然不影响项目的正常运行，但不美观。</p>
<p>在我之前的个人项目中使用了@来代表<code v-pre>src</code>的路径，但不管查阅网上的各种方法、配置，还是询问过ai，都没有解决<em>vscode</em>中出现红线的问题。</p>
<p>这次接手到一些其他的vue项目，看到了更多人实现过的代码，从不报错的项目中将其关于@的配置复制过来之后成功解决问题。虽然没有技术上的难度，但对于以后遇到相关的需要也算是有了合适的解决方案，不需要忍受红线，获取到前人的智慧，也是值得记录的。</p>
<p>配置方法是：在<em>tsconfig.app.json</em>中进行如下配置：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">{</span>
<span class="line">  "extends": "@vue/tsconfig/tsconfig.dom.json",</span>
<span class="line">  "include": [</span>
<span class="line">    "env.d.ts",</span>
<span class="line">    "src/**/*",</span>
<span class="line">    "src/**/*.vue"</span>
<span class="line">  ],</span>
<span class="line">  "exclude": [</span>
<span class="line">    "src/**/__tests__/*"</span>
<span class="line">  ],</span>
<span class="line">  "compilerOptions": {</span>
<span class="line">    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",</span>
<span class="line">    "paths": {</span>
<span class="line">      "@/*": [</span>
<span class="line">        "./src/*"</span>
<span class="line">      ]</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div></template>


