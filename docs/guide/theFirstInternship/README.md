# 收获一：Vue项目中@路径别名配置

@是说项目里用来代表src的路径，因为项目较大的时候，很多模块要写导入的方法写相对路径会非常麻烦，通过配置@来代表根目录下的src是非常方便的。但网上配置的方式众说纷纭，而且大多都会导致vscode中出现红线表示找不到对应文件，虽然不影响项目的正常运行，但不美观。

在我之前的个人项目中使用了@来代表src的路径，但不管查阅网上的各种方法、配置，还是询问过ai，都没有解决vscode中出现红线的问题。

这次接手到一些其他的vue项目，看到了更多人实现过的代码，从不报错的项目中将其关于@的配置复制过来之后成功解决问题。虽然没有技术上的难度，但对于以后遇到相关的需要也算是有了合适的解决方案，不需要忍受红线，获取到前人的智慧，也是值得记录的。

配置方法是：在tsconfig.app.json中进行如下配置：
```
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue"
  ],
  "exclude": [
    "src/**/__tests__/*"
  ],
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```


