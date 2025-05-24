import comp from "D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/theFirstInternship/index.html.vue"
const data = JSON.parse("{\"path\":\"/guide/theFirstInternship/\",\"title\":\"你不懂JS：入门与进阶\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"headers\":[],\"git\":{},\"filePathRelative\":\"guide/theFirstInternship/README.md\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
