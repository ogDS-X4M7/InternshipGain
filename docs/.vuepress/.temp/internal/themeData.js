export const themeData = JSON.parse("{\"contributors\":false,\"navbar\":[{\"text\":\"首页\",\"link\":\"/\"},{\"text\":\"实习收获\",\"children\":[{\"text\":\"第一段实习\",\"link\":\"/guide/theFirstInternship/\"},{\"text\":\"未来的第二段实习\",\"link\":\"/guide/theSecondInternship/\"},{\"text\":\"vuepress的简单使用\",\"link\":\"/guide/useVuepress/\"},{\"text\":\"你不知道的JS摘录\",\"link\":\"/guide/youDontKnowJS/\"},{\"text\":\"React + Taro 小程序开发简单学习\",\"link\":\"/guide/AboutTaro/\"}]},{\"text\":\"关于作者\",\"link\":\"https://github.com/ogDS-X4M7\"}],\"sidebar\":{\"/guide/\":[{\"text\":\"第一段实习\",\"collapsible\":true,\"prefix\":\"theFirstInternship/\",\"children\":[\"index\",\"gain1\",\"gain2\",\"gain3\",\"gain4\",\"gain5\",\"gain6\",\"gain7\"]},{\"text\":\"第二段实习\",\"collapsible\":true,\"prefix\":\"theSecondInternship/\",\"children\":[\"index\"]},{\"text\":\"Vuepress的简单使用\",\"collapsible\":true,\"prefix\":\"useVuepress/\",\"children\":[\"index\",\"use_one\",\"use_two\",\"use_three\"]},{\"text\":\"你不知道的JS摘录\",\"collapsible\":true,\"prefix\":\"youDontKnowJS/\",\"children\":[\"index\",\"excerpt1\",\"excerpt2\"]},{\"text\":\"React + Taro 小程序开发简单学习\",\"collapsible\":true,\"prefix\":\"AboutTaro/\",\"children\":[\"index\",\"taro_one\",\"taro_two\",\"taro_three\",\"taro_four\",\"taro_five\"]}]},\"locales\":{\"/\":{\"selectLanguageName\":\"English\"}},\"colorMode\":\"auto\",\"colorModeSwitch\":true,\"logo\":null,\"repo\":null,\"selectLanguageText\":\"Languages\",\"selectLanguageAriaLabel\":\"Select language\",\"sidebarDepth\":2,\"editLink\":true,\"editLinkText\":\"Edit this page\",\"lastUpdated\":true,\"contributorsText\":\"Contributors\",\"notFound\":[\"There's nothing here.\",\"How did we get here?\",\"That's a Four-Oh-Four.\",\"Looks like we've got some broken links.\"],\"backToHome\":\"Take me home\",\"openInNewWindow\":\"open in new window\",\"toggleColorMode\":\"toggle color mode\",\"toggleSidebar\":\"toggle sidebar\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateThemeData) {
    __VUE_HMR_RUNTIME__.updateThemeData(themeData)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ themeData }) => {
    __VUE_HMR_RUNTIME__.updateThemeData(themeData)
  })
}
