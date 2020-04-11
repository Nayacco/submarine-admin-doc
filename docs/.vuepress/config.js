module.exports = {
    title: 'submarine', // 设置网站标题
    base: '/submarine-admin-doc/',
    description: '快速开发，早点下班', //描述
    locales: { '/': { lang: 'zh-CN' }},
    //dest: './dist',   // 设置输出目录
    // port: 2333, //端口
    head: [
      ['link', { rel: 'icon', href: '/logo.png' }]
    ],
    define: {
      env: process.env.NODE_ENV,
    },
    themeConfig: { //主题配置
      // 添加导航栏
      nav: [
        { text: '主页', link: '/' }, // 导航条
        { text: '指南', link: '/guide/' },
        {
          text: '知识库',
          items: [
            { text: 'Vue', link: 'https://cn.vuejs.org/index.html' },
            { text: 'element-ui', link: 'https://element.eleme.io' },
          ]
        },
        { text: 'Github', link: 'https://github.com/GoldSubmarine/submarine-admin-backend' }
      ],
      // 为以下路由添加侧边栏
      sidebar:{
        '/guide/': [
          {
            title: '指南',
            collapsable: false,
            children: [
              '',
              'getting-started',
            //   'table',
            //   'button',
            //   'select',
            //   'globalConfig',
            ]
          },
        ]
      }
    },
    markdown: {
      // markdown-it-anchor 的选项
      anchor: { permalink: true },
      // markdown-it-toc 的选项
      toc: { includeLevel: [1, 2, 3, 4] }
    }
  }