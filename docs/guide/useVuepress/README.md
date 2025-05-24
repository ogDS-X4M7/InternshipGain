# 快速开始一个新项目并完成部署

不必多言，官方网站[点击前往](https://vuepress.vuejs.org/zh/guide/getting-started.html)

## 创建项目简洁版本

Node.js v18.19.0+
包管理器，如 pnpm、yarn、npm 等。(不管怎么样至少要有npm)

打开想创建文档的文件夹，右键打开终端，输入

```npm
npm init vuepress yourProjectName
```
或
```pnpm
pnpm create vuepress yourProjectName
```
跟随指示配置各个方面的一些基础内容，等待项目生成即可，马上就有一个模版项目生成

注意：像这里打算部署到github的话，过程中有相关的一个问题记得选y(yes)，它会在你的项目里生成.github文件夹，内有deploy-docs.yml


## 部署
### 新建github仓库
到github上创建一个新仓库，用于部署这个项目，命名仓库

在上一步中新建项目的docs/.vuepress/config.js 的export default defineUserConfig中添加
```
base: '/github仓库名称/',
```
VuePress初始化命令不会生成 .gitignore，我们直接自己手动在根目录下新建.gitignore文件，并在.gitignore中添加这些内容：
```
# 依赖目录
node_modules/

# 构建输出目录
docs/.vuepress/dist/

# 环境变量
.env

# IDE/编辑器配置
.vscode/
.idea/
.DS_Store

# 日志文件
*.log
```
### 提交初始项目到github仓库
在vscode终端中准备提交代码：

首先初始化git仓库
```
git init
```
添加远程仓库
```
git remote add origin https://github.com/你的账号名/新建的github仓库名.git
```
提交所有代码
```
git add .
git commit -m "初始项目"
```
由于本地仓库和 GitHub 仓库是独立创建的，现在需要合并无关联历史的仓库，由于都是新项目，我们直接强制合并就可以了
```
git pull origin main --allow-unrelated-histories
```
会出现MERGE_MSG文件，直接关闭它就完成合并了
然后上传代码
有可能显示找不到main，因为可能默认创建分支是master，所以先在终端输入：
```
git branch
```
看到下面只有一个master，那就创建main
```
git branch main
git branch
```
现在应该能看到main了，转到分支main上
```
git checkout main
```
然后再提交即可：
```
git push -u origin main
```

### 部署的最后步骤

因为上面交代的配置选择yes，生成了.github文件夹，内有deploy-docs.yml），此时github网站上这个仓库里code内已经会有分支gh-pages了，这就意味着可以部署显示出来了

进入setting->pages,把里面的Branch从None改为gh-pages,记得点save保存

然后来到Actions(也许需要等待)就能看到pages buide and development

点进去deploy就有你的项目部署链接了，进入链接就能看到部署效果，图片没加载出来没关系，后面都使用自己的资源

到这里我们就完成了新建项目的部署了。另外，vscode有很方便的gui，后续项目更改可以在左侧源代码管理里面右键暂存更改，然后输入消息提交，终端git push origin main推上去即可


