# 收获二：熟悉团队协作流程与Git

为了参与大型项目，团队开发，使用了阿里云的云效代码管理，在这个过程中主要熟悉了 `git` 操作，对自己完整的工作进行新建分支，申请合并，熟悉团队协作的流程。

## 常用到的git命令以及含义

拉取克隆项目代码到本地：
```
git clone https://xxxxxx(项目的克隆链接)
```
对分支进行操作，可以查看分支，创建分支，删除分支(见[下文](#del-branch))
```
查看分支(本地分支)
git branch
创建分支
git branch new-branch
```
查看当前状态：所在分支
```
git status
```
移动到分支
```
git checkout branchName
```
暂存更改（不过我一般直接使用*vscode*的源代码管理暂存更改,这里的`/xx/yy`是要写所要暂存更改的根目录开始的文件路径）
```
git add /xx/yy
另外，暂存所有更改可以使用.，写法如下：
git add .
```
提交更改（我也是更爱用*vscode*的源代码管理提交更改，""中写关于你本次提交修改内容的描述）
```
git commit -m ""
-am可以把暂存和提交一起执行，等价于 git add . + git commit，写法如下：
git commit -am "Update files" 
```
拉取代码，一般在提交代码前都应该拉取代码，避免其他人提交了新的代码，而我们的本地代码没有及时更新
```
git pull
```

指令中还有一些常见的内容，比如参数、别名

`-a`：all的意思
```
查看所有分支：本地+远程
git branch -a
```
`-b`：创建并切换分支,在创建新分支的同时切换到该分支
```
git checkout -b new-feature
```
<a id="del-branch"></a>
`-d`：删除分支
```
git branch -d new-feature
```
`origin`：是远程仓库的默认别名,如果要提交或拉取远程仓库代码，远程仓库的名称(或别名)是必不可少的
```
git push origin main
git pull origin main
```

## 云效日常使用
云效仓库日常使用的话，完成个人代码任务后，给云效管理平台对应项目创建个人分支，然后在本地这边也是一样新建分支并移动到新分支下，本地代码`push`提交到新的分支上去，申请合并就可以了

## 多写多用
难度并不大，主要是作为学生大多数时候都是个人开发，所以缺乏团队开发，共享开发的经验。只要多用到自然就会了。

包括像现在正在写的这个文档项目，从初始代码就开始提交部署到`github`，期间更改、新增代码都会使用到`git`命令，也同样可以学习、熟悉`git`指令。