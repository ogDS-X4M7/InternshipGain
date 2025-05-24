# 其他文档的设计
可以开始正式写自己的文档了！设计各个页面，这些是和之前所说的link相匹配的文档。
## 文档处理与后续的添加操作方式
这里我把文档内容都放进/docs/guide里，guide是创建的新文件夹，为了区分各个章节，又创建了theFirstInternship、theSecondInternship、useVuepress，里面放各自的md文件，即为文档。

如果后续需要添加章节，其实也基本只是在/docs/guide里创建新文件夹，如果需要添加小节的内容，则到对应的文件夹下添加.md文件然后编写。

添加章节后，到config.js中去添加navbar和sidebar项目即可，操作和[之前](./use_one.md#defaulttheme)讲过的是一样的

添加小节的话，也是到config.js，不过只需要给sidebar中对应章节增加children就可以了

## 常用格式
文档的常用格式，或者说我用到了的格式都有：
```
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```
标题、代码、换行、链接，跨文档的锚点链接，
