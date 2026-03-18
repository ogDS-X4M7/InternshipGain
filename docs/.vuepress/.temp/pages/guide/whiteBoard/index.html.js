import comp from "D:/A-Front-end/A-Vuepress/InternshipGain/docs/.vuepress/.temp/pages/guide/whiteBoard/index.html.vue"
const data = JSON.parse("{\"path\":\"/guide/whiteBoard/\",\"title\":\"关于whiteBoard\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"headers\":[{\"level\":2,\"title\":\"功能特性\",\"slug\":\"功能特性\",\"link\":\"#功能特性\",\"children\":[]},{\"level\":2,\"title\":\"技术栈\",\"slug\":\"技术栈\",\"link\":\"#技术栈\",\"children\":[]}],\"git\":{},\"filePathRelative\":\"guide/whiteBoard/README.md\"}")
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
