export const siteData = JSON.parse("{\"base\":\"/InternshipGain/\",\"lang\":\"zh-CN\",\"title\":\"本小八的实习收获\",\"description\":\"记小八的首次实习\",\"head\":[[\"link\",{\"rel\":\"icon\",\"href\":\"/bamaofavicon.ico\"}]],\"locales\":{}}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateSiteData) {
    __VUE_HMR_RUNTIME__.updateSiteData(siteData)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ siteData }) => {
    __VUE_HMR_RUNTIME__.updateSiteData(siteData)
  })
}
