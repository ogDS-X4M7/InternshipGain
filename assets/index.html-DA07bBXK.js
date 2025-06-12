import{_ as e,c as n,d as a,o as i}from"./app-BviTu2rp.js";const l={};function t(c,s){return i(),n("div",null,s[0]||(s[0]=[a(`<h1 id="收获一-vue项目中-路径别名配置" tabindex="-1"><a class="header-anchor" href="#收获一-vue项目中-路径别名配置"><span>收获一：Vue项目中@路径别名配置</span></a></h1><p>@是说项目里用来代表<code>src</code>的路径，因为项目较大的时候，很多模块要写导入的方法写相对路径会非常麻烦，通过配置@来代表根目录下的src是非常方便的。但网上配置的方式众说纷纭，而且大多都会导致<em>vscode</em>中出现红线表示找不到对应文件，虽然不影响项目的正常运行，但不美观。</p><p>在我之前的个人项目中使用了@来代表<code>src</code>的路径，但不管查阅网上的各种方法、配置，还是询问过ai，都没有解决<em>vscode</em>中出现红线的问题。</p><p>这次接手到一些其他的vue项目，看到了更多人实现过的代码，从不报错的项目中将其关于@的配置复制过来之后成功解决问题。虽然没有技术上的难度，但对于以后遇到相关的需要也算是有了合适的解决方案，不需要忍受红线，获取到前人的智慧，也是值得记录的。</p><p>配置方法是：在<em>tsconfig.app.json</em>中进行如下配置：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">{</span>
<span class="line">  &quot;extends&quot;: &quot;@vue/tsconfig/tsconfig.dom.json&quot;,</span>
<span class="line">  &quot;include&quot;: [</span>
<span class="line">    &quot;env.d.ts&quot;,</span>
<span class="line">    &quot;src/**/*&quot;,</span>
<span class="line">    &quot;src/**/*.vue&quot;</span>
<span class="line">  ],</span>
<span class="line">  &quot;exclude&quot;: [</span>
<span class="line">    &quot;src/**/__tests__/*&quot;</span>
<span class="line">  ],</span>
<span class="line">  &quot;compilerOptions&quot;: {</span>
<span class="line">    &quot;tsBuildInfoFile&quot;: &quot;./node_modules/.tmp/tsconfig.app.tsbuildinfo&quot;,</span>
<span class="line">    &quot;paths&quot;: {</span>
<span class="line">      &quot;@/*&quot;: [</span>
<span class="line">        &quot;./src/*&quot;</span>
<span class="line">      ]</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,6)]))}const o=e(l,[["render",t]]),u=JSON.parse('{"path":"/guide/theFirstInternship/","title":"收获一：Vue项目中@路径别名配置","lang":"zh-CN","frontmatter":{},"headers":[],"git":{"updatedTime":1748186333000,"contributors":[{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":5,"url":"https://github.com/X4M7"}],"changelog":[{"hash":"4215c19d7a3adc5ad3c57e0ced66a5bef5bae42b","time":1748186333000,"email":"1415808154@qq.com","author":"X4M7","message":"完成目前一段实习记得的所有收获记录"},{"hash":"e21ecbed39c29e59d6f40615d1a140a82b256832","time":1748098853000,"email":"1415808154@qq.com","author":"X4M7","message":"实习收获部分完成，需求全部记录"},{"hash":"6a1d8c7cf4905608da195ae3ce18559b7de0f5fb","time":1748079741000,"email":"1415808154@qq.com","author":"X4M7","message":"改良了一下语句表达"},{"hash":"3e476d80bbbabf8c0f5af61df37830937b4e004e","time":1748079569000,"email":"1415808154@qq.com","author":"X4M7","message":"实习收获一完成记录"},{"hash":"b7bae5f25ad46d17f6915280defb9a887e317292","time":1748051530000,"email":"1415808154@qq.com","author":"X4M7","message":"&quot;提交初步进行中的项目&quot;"}]},"filePathRelative":"guide/theFirstInternship/README.md"}');export{o as comp,u as data};
