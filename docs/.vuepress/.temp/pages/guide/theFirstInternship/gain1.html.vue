<template><div><h1 id="收获二-熟悉团队协作流程与git" tabindex="-1"><a class="header-anchor" href="#收获二-熟悉团队协作流程与git"><span>收获二：熟悉团队协作流程与Git</span></a></h1>
<p>为了参与大型项目，团队开发，使用了阿里云的云效代码管理，在这个过程中主要熟悉了 <code v-pre>git</code> 操作，对自己完整的工作进行新建分支，申请合并，熟悉团队协作的流程。</p>
<h2 id="常用到的git命令以及含义" tabindex="-1"><a class="header-anchor" href="#常用到的git命令以及含义"><span>常用到的git命令以及含义</span></a></h2>
<p>拉取克隆项目代码到本地：</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git clone https://xxxxxx(项目的克隆链接)</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>对分支进行操作，可以查看分支，创建分支，删除分支(见<a href="#del-branch">下文</a>)</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">查看分支(本地分支)</span>
<span class="line">git branch</span>
<span class="line">创建分支</span>
<span class="line">git branch new-branch</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看当前状态：所在分支</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git status</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>移动到分支</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git checkout branchName</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>暂存更改（不过我一般直接使用<em>vscode</em>的源代码管理暂存更改,这里的<code v-pre>/xx/yy</code>是要写所要暂存更改的根目录开始的文件路径）</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git add /xx/yy</span>
<span class="line">另外，暂存所有更改可以使用.，写法如下：</span>
<span class="line">git add .</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>提交更改（我也是更爱用<em>vscode</em>的源代码管理提交更改，&quot;&quot;中写关于你本次提交修改内容的描述）</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git commit -m ""</span>
<span class="line">-am可以把暂存和提交一起执行，等价于 git add . + git commit，写法如下：</span>
<span class="line">git commit -am "Update files" </span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>拉取代码，一般在提交代码前都应该拉取代码，避免其他人提交了新的代码，而我们的本地代码没有及时更新</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git pull</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>指令中还有一些常见的内容，比如参数、别名</p>
<p><code v-pre>-a</code>：all的意思</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">查看所有分支：本地+远程</span>
<span class="line">git branch -a</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>-b</code>：创建并切换分支,在创建新分支的同时切换到该分支</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git checkout -b new-feature</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><a id="del-branch"></a>
<code v-pre>-d</code>：删除分支</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git branch -d new-feature</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><code v-pre>origin</code>：是远程仓库的默认别名,如果要提交或拉取远程仓库代码，远程仓库的名称(或别名)是必不可少的</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">git push origin main</span>
<span class="line">git pull origin main</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="云效日常使用" tabindex="-1"><a class="header-anchor" href="#云效日常使用"><span>云效日常使用</span></a></h2>
<p>云效仓库日常使用的话，完成个人代码任务后，给云效管理平台对应项目创建个人分支，然后在本地这边也是一样新建分支并移动到新分支下，本地代码<code v-pre>push</code>提交到新的分支上去，申请合并就可以了</p>
<h2 id="多写多用" tabindex="-1"><a class="header-anchor" href="#多写多用"><span>多写多用</span></a></h2>
<p>难度并不大，主要是作为学生大多数时候都是个人开发，所以缺乏团队开发，共享开发的经验。只要多用到自然就会了。</p>
<p>包括像现在正在写的这个文档项目，从初始代码就开始提交部署到<code v-pre>github</code>，期间更改、新增代码都会使用到<code v-pre>git</code>命令，也同样可以学习、熟悉<code v-pre>git</code>指令。</p>
</div></template>


