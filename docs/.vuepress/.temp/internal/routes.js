export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":"首页"} }],
  ["/guide/theFirstInternship/gain1.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain1.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain1.html.js"), meta: {"title":"收获二：熟悉团队协作流程与Git"} }],
  ["/guide/theFirstInternship/gain2.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain2.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain2.html.js"), meta: {"title":"快速上手项目一——批量处理数据"} }],
  ["/guide/theFirstInternship/gain3.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain3.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain3.html.js"), meta: {"title":"快速上手项目二——页面信息展示"} }],
  ["/guide/theFirstInternship/gain4.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain4.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain4.html.js"), meta: {"title":"快速上手项目三——登录后查看内容"} }],
  ["/guide/theFirstInternship/", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_index.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/index.html.js"), meta: {"title":"收获一：Vue项目中@路径别名配置"} }],
  ["/guide/theSecondInternship/", { loader: () => import(/* webpackChunkName: "guide_theSecondInternship_index.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theSecondInternship/index.html.js"), meta: {"title":"暂未开始，敬请期待"} }],
  ["/guide/useVuepress/", { loader: () => import(/* webpackChunkName: "guide_useVuepress_index.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/index.html.js"), meta: {"title":"快速开始一个新项目并完成部署"} }],
  ["/guide/useVuepress/use_one.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_one.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_one.html.js"), meta: {"title":"代码的简单整体解读——config.js"} }],
  ["/guide/useVuepress/use_three.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_three.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_three.html.js"), meta: {"title":"其他文档的设计"} }],
  ["/guide/useVuepress/use_two.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_two.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_two.html.js"), meta: {"title":"代码的简单整体解读——首页"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/A-Myvuepress/InternshipGain/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
