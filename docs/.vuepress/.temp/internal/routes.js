export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":"首页"} }],
  ["/guide/AboutTaro/", { loader: () => import(/* webpackChunkName: "guide_AboutTaro_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/AboutTaro/index.html.js"), meta: {"title":"Taro小程序+React——基础知识与正常运行须知"} }],
  ["/guide/AboutTaro/taro_five.html", { loader: () => import(/* webpackChunkName: "guide_AboutTaro_taro_five.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/AboutTaro/taro_five.html.js"), meta: {"title":"个人页——支持登录，更新头像昵称，查看历史、点赞、收藏，支持退出登录"} }],
  ["/guide/AboutTaro/taro_four.html", { loader: () => import(/* webpackChunkName: "guide_AboutTaro_taro_four.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/AboutTaro/taro_four.html.js"), meta: {"title":"知识文档页"} }],
  ["/guide/AboutTaro/taro_one.html", { loader: () => import(/* webpackChunkName: "guide_AboutTaro_taro_one.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/AboutTaro/taro_one.html.js"), meta: {"title":"项目正式具体讲解"} }],
  ["/guide/AboutTaro/taro_three.html", { loader: () => import(/* webpackChunkName: "guide_AboutTaro_taro_three.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/AboutTaro/taro_three.html.js"), meta: {"title":"短视频播放页——包含普通播放和历史播放，实现播放页复用"} }],
  ["/guide/AboutTaro/taro_two.html", { loader: () => import(/* webpackChunkName: "guide_AboutTaro_taro_two.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/AboutTaro/taro_two.html.js"), meta: {"title":"首页 多标签页"} }],
  ["/guide/theSecondInternship/", { loader: () => import(/* webpackChunkName: "guide_theSecondInternship_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theSecondInternship/index.html.js"), meta: {"title":"暂未开始，敬请期待"} }],
  ["/guide/theFirstInternship/gain1.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain1.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain1.html.js"), meta: {"title":"收获二：熟悉团队协作流程与Git"} }],
  ["/guide/theFirstInternship/gain2.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain2.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain2.html.js"), meta: {"title":"快速上手项目一——批量处理数据"} }],
  ["/guide/theFirstInternship/gain3.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain3.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain3.html.js"), meta: {"title":"快速上手项目二——页面信息展示"} }],
  ["/guide/theFirstInternship/gain4.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain4.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain4.html.js"), meta: {"title":"快速上手项目三——登录后查看内容"} }],
  ["/guide/theFirstInternship/gain5.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain5.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain5.html.js"), meta: {"title":"项目一——导出商品列表"} }],
  ["/guide/theFirstInternship/gain6.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain6.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain6.html.js"), meta: {"title":"收获三——实现Excel导出工具"} }],
  ["/guide/theFirstInternship/gain7.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain7.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain7.html.js"), meta: {"title":"项目一——完善订单列表"} }],
  ["/guide/theFirstInternship/gain8.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain8.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain8.html.js"), meta: {"title":"项目四、五-小插曲"} }],
  ["/guide/theFirstInternship/gain9.html", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_gain9.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/gain9.html.js"), meta: {"title":"项目五——优惠券全套业务与样式污染"} }],
  ["/guide/theFirstInternship/", { loader: () => import(/* webpackChunkName: "guide_theFirstInternship_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/index.html.js"), meta: {"title":"收获一：Vue项目中@路径别名配置"} }],
  ["/guide/useVuepress/", { loader: () => import(/* webpackChunkName: "guide_useVuepress_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/index.html.js"), meta: {"title":"快速开始一个新项目并完成部署"} }],
  ["/guide/useVuepress/use_one.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_one.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_one.html.js"), meta: {"title":"代码的简单整体解读——config.js"} }],
  ["/guide/useVuepress/use_three.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_three.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_three.html.js"), meta: {"title":"其他文档的设计"} }],
  ["/guide/useVuepress/use_two.html", { loader: () => import(/* webpackChunkName: "guide_useVuepress_use_two.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/useVuepress/use_two.html.js"), meta: {"title":"代码的简单整体解读——首页"} }],
  ["/guide/youDontKnowJS/excerpt1.html", { loader: () => import(/* webpackChunkName: "guide_youDontKnowJS_excerpt1.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/youDontKnowJS/excerpt1.html.js"), meta: {"title":"你不知道的JS-摘录-作用域与闭包"} }],
  ["/guide/youDontKnowJS/excerpt2.html", { loader: () => import(/* webpackChunkName: "guide_youDontKnowJS_excerpt2.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/youDontKnowJS/excerpt2.html.js"), meta: {"title":"你不知道的JS-摘录-this与对象原型-1"} }],
  ["/guide/youDontKnowJS/excerpt3.html", { loader: () => import(/* webpackChunkName: "guide_youDontKnowJS_excerpt3.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/youDontKnowJS/excerpt3.html.js"), meta: {"title":"你不知道的JS-摘录-this与对象原型-2"} }],
  ["/guide/youDontKnowJS/", { loader: () => import(/* webpackChunkName: "guide_youDontKnowJS_index.html" */"D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/youDontKnowJS/index.html.js"), meta: {"title":"你不知道的JS-摘录-起步上路"} }],
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
