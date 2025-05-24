export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":"首页"} }],
  ["/guide/theFirstInternship/", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/index.html.js"), meta: {"title":"你不懂JS：入门与进阶"} }],
  ["/guide/theFirstInternship/testguide1.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_testguide1.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/testguide1.html.js"), meta: {"title":"直接抄的Get Started"} }],
  ["/guide/theSecondInternship/", { loader: () => import(/* webpackChunkName: "guide_theSecondInternship_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theSecondInternship/index.html.js"), meta: {"title":"暂未开始，敬请期待"} }],
  ["/guide/useVuepress/", { loader: () => import(/* webpackChunkName: "guide_useVuepress_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/index.html.js"), meta: {"title":"快速开始一个新项目并完成部署"} }],
  ["/guide/useVuepress/use_one.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_one.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_one.html.js"), meta: {"title":"代码的简单整体解读——config.js"} }],
  ["/guide/useVuepress/use_three.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_three.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_three.html.js"), meta: {"title":"文档的设计"} }],
  ["/guide/useVuepress/use_two.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_two.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_two.html.js"), meta: {"title":"代码的简单整体解读——首页"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
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
