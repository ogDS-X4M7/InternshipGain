<template><div><h1 id="快速开始一个新项目并完成部署" tabindex="-1"><a class="header-anchor" href="#快速开始一个新项目并完成部署"><span>快速开始一个新项目并完成部署</span></a></h1>
<p>不必多言，官方网站<a href="https://vuepress.vuejs.org/zh/guide/getting-started.html" target="_blank" rel="noopener noreferrer">点击前往</a></p>
<h2 id="创建项目简洁版本" tabindex="-1"><a class="header-anchor" href="#创建项目简洁版本"><span>创建项目简洁版本</span></a></h2>
<p><code v-pre>Node.js v18.19.0+</code>
包管理器，如<code v-pre>pnpm</code>、<code v-pre>yarn</code>、<code v-pre>npm</code> 等。(不管怎么样至少要有<code v-pre>npm</code>)</p>
<p>打开想创建文档的文件夹，右键打开终端，输入</p>
<div class="language-npm line-numbers-mode" data-highlighter="prismjs" data-ext="npm"><pre v-pre><code><span class="line">npm init vuepress yourProjectName</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>或</p>
<div class="language-pnpm line-numbers-mode" data-highlighter="prismjs" data-ext="pnpm"><pre v-pre><code><span class="line">pnpm create vuepress yourProjectName</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>跟随指示配置各个方面的一些基础内容，等待项目生成即可，马上就有一个模版项目生成</p>
<p>注意：像这里打算部署到<code v-pre>github</code>的话，过程中有相关的一个问题记得选y(yes)，它会在你的项目里生成<code v-pre>.github</code>文件夹，内有<code v-pre>deploy-docs.yml</code></p>
<h2 id="部署" tabindex="-1"><a class="header-anchor" href="#部署"><span>部署</span></a></h2>
<h3 id="新建github仓库" tabindex="-1"><a class="header-anchor" href="#新建github仓库"><span>新建github仓库</span></a></h3>
<p>到<code v-pre>github</code>上创建一个新仓库，用于部署这个项目，命名仓库</p>
<p>在上一步中新建项目的<code v-pre>docs/.vuepress/config.js</code> 的<code v-pre>export default defineUserConfig</code>中添加</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">base: '/github仓库名称/',</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><em>VuePress</em>初始化命令不会生成 <code v-pre>.gitignore</code>，我们直接自己手动在根目录下新建<code v-pre>.gitignore</code>文件，并在<code v-pre>.gitignore</code>中添加这些内容：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line"># 依赖目录</span>
<span class="line">node_modules/</span>
<span class="line"></span>
<span class="line"># 构建输出目录</span>
<span class="line">docs/.vuepress/dist/</span>
<span class="line"></span>
<span class="line"># 环境变量</span>
<span class="line">.env</span>
<span class="line"></span>
<span class="line"># IDE/编辑器配置</span>
<span class="line">.vscode/</span>
<span class="line">.idea/</span>
<span class="line">.DS_Store</span>
<span class="line"></span>
<span class="line"># 日志文件</span>
<span class="line">*.log</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="提交初始项目到github仓库" tabindex="-1"><a class="header-anchor" href="#提交初始项目到github仓库"><span>提交初始项目到github仓库</span></a></h3>
<p>在<em>vscode</em>终端中准备提交代码：</p>
<p>首先初始化<code v-pre>git</code>仓库</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git init</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>添加远程仓库</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git remote add origin https://github.com/你的账号名/新建的github仓库名.git</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>提交所有代码</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git add .</span>
<span class="line">git commit -m "初始项目"</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>由于本地仓库和 <code v-pre>GitHub</code> 仓库是独立创建的，现在需要合并无关联历史的仓库，由于都是新项目，我们直接强制合并就可以了</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git pull origin main --allow-unrelated-histories</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>会出现<code v-pre>MERGE_MSG</code>文件，直接关闭它就完成合并了</p>
<p>然后上传代码，有可能显示找不到<code v-pre>main</code>，因为可能默认创建分支是<code v-pre>master</code>，所以先在终端输入：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git branch</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>看到下面只有一个<code v-pre>master</code>，那就创建<code v-pre>main</code></p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git branch main</span>
<span class="line">git branch</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>现在应该能看到<code v-pre>main</code>了，转到分支<code v-pre>main</code>上</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git checkout main</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>然后再提交即可：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git push -u origin main</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="部署的最后步骤" tabindex="-1"><a class="header-anchor" href="#部署的最后步骤"><span>部署的最后步骤</span></a></h3>
<p>因为上面交代的配置选择yes，生成了<code v-pre>.github</code>文件夹，内有<code v-pre>deploy-docs.yml</code>，此时<code v-pre>github</code>网站上这个仓库里<code v-pre>code</code>内已经会有分支<code v-pre>gh-pages</code>了，这就意味着可以部署显示出来了</p>
<p>进入<code v-pre>Setting</code>-&gt;<code v-pre>Pages</code>,把里面的<code v-pre>Branch</code>从<code v-pre>None</code>改为<code v-pre>gh-pages</code>,记得点<code v-pre>save</code>保存</p>
<p>然后来到<code v-pre>Actions</code>(也许需要等待)就能看到<code v-pre>pages buide and development</code></p>
<p>点进去<code v-pre>deploy</code>就有你的项目部署链接了，进入链接就能看到部署效果，图片没加载出来没关系，后面都使用自己的资源</p>
<p>到这里我们就完成了新建项目的部署了。另外，<em>vscode</em>有很方便的GUI，后续项目更改可以在左侧源代码管理里面右键暂存更改，然后输入消息提交，终端<code v-pre>git push origin main</code>推上去即可</p>
</div></template>


