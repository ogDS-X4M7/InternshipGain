import "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/highlighter-helper/lib/client/styles/base.css"
import "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/plugin-prismjs/lib/client/styles/nord.css"
import "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/highlighter-helper/lib/client/styles/line-numbers.css"
import "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-highlight.css"
import "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/highlighter-helper/lib/client/styles/collapsed-lines.css"
import { setupCollapsedLines } from "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/highlighter-helper/lib/client/index.js"
import "D:/A-Myvuepress/InternshipGain/node_modules/@vuepress/highlighter-helper/lib/client/styles/code-block-title.css"

export default {
  setup() {
    setupCollapsedLines()
  }
}
