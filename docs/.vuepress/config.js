import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  base: '/InternshipGain/',
  head: [
    ['link', { rel: 'icon', href: '/InternshipGain/bamaofavicon.ico' }] // 指向public目录下的favicon.ico
  ],
  lang: 'zh-CN',
  title: '本小八的实习收获',
  description: '记小八的首次实习',
  theme: defaultTheme({
    contributors: false,
    navbar: [
      { text: '首页', link: '/' },
      {
        text: '实习收获',
        children: [
          { text: '第一段实习', link: '/guide/theFirstInternship/' },
          { text: '第二段实习', link: '/guide/theSecondInternship/' },
          { text: 'vuepress的简单使用', link: '/guide/useVuepress/' },
          { text: '你不知道的JS摘录', link: '/guide/youDontKnowJS/' },
          { text: 'React + Taro 小程序开发简单学习', link: '/guide/AboutTaro/' },
        ],
      },
      { text: '关于作者', link: 'https://github.com/ogDS-X4M7' },
    ],
    // 可折叠的侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '第一段实习',
          collapsible: true,
          // 基于项目路径的 .md 或 .html 后缀是可以省略的。前缀可以是相对路径，等同于 `prefix: /reference/bundler/`
          prefix: 'theFirstInternship/',
          children: ['index', 'gain1', 'gain2', 'gain3', 'gain4', 'gain5', 'gain6', 'gain7', 'gain8', 'gain9', 'gain10'],
        },
        {
          text: '第二段实习',
          collapsible: true,
          prefix: 'theSecondInternship/',
          children: ['index'],
        },
        {
          text: 'Vuepress的简单使用',
          collapsible: true,
          prefix: 'useVuepress/',
          children: ['index', 'use_one', 'use_two', 'use_three'],
        },
        {
          text: '你不知道的JS摘录',
          collapsible: true,
          prefix: 'youDontKnowJS/',
          children: ['index', 'excerpt1', 'excerpt2'],
        },
        {
          text: 'React + Taro 小程序开发简单学习',
          collapsible: true,
          prefix: 'AboutTaro/',
          children: ['index', 'taro_one', 'taro_two', 'taro_three', 'taro_four', 'taro_five'],
        },
      ],
    },
  }),
  bundler: viteBundler(),
})