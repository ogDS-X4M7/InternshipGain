export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/get-started.html", { loader: () => import(/* webpackChunkName: "get-started.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/get-started.html.js"), meta: {"title":"Get Started"} }],
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":"首页"} }],
  ["/guide/theFirstInternship/", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/index.html.js"), meta: {"title":"你不懂JS：入门与进阶"} }],
  ["/guide/theFirstInternship/testguide1.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_testguide1.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/testguide1.html.js"), meta: {"title":"直接抄的Get Started"} }],
  ["/guide/useVuepress/testguide2.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_testguide2.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/testguide2.html.js"), meta: {"title":"testguide2项小目"} }],
  ["/guide/useVuepress/testguide3.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_testguide3.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/testguide3.html.js"), meta: {"title":"testguide3项目"} }],
  ["/guide/useVuepress/use_one.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_one.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_one.html.js"), meta: {"title":"官网快速上手创建一个模版项目"} }],
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
