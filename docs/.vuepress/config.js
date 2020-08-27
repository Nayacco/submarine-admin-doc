module.exports = {
    title: 'submarine', // 设置网站标题
    base: '/submarine-admin-doc/',
    description: '人生苦短，早点下班', //描述
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
            {
              text: '项目',
              items: [
                { text: 'submarine-admin-backend', link: 'https://github.com/GoldSubmarine/submarine-admin-backend' },
                { text: 'submarine-admin-frontend', link: 'https://github.com/GoldSubmarine/submarine-admin-frontend' },
              ]
            },
            {
              text: '库文档',
              items: [
                { text: 'Vue', link: 'https://cn.vuejs.org/index.html' },
                { text: 'element-ui', link: 'https://element.eleme.io' },
                { text: 'mapstruct', link: 'https://mapstruct.org' },
                { text: 'socket-io', link: 'https://socket.io' },
                { text: 'netty-socketio', link: 'https://github.com/mrniko/netty-socketio' },
                { text: 'xcrud', link: 'https://github.com/GoldSubmarine/xcrud' },
                { text: 'xcrud-generator', link: 'https://github.com/GoldSubmarine/xcrud-generator' },
              ]
            }
          ]
        },
        { text: 'Github', link: 'https://github.com/GoldSubmarine/submarine-admin-backend' }
      ],
      // 为以下路由添加侧边栏
      sidebar:{
        '/guide/': [
          {
            title: '基础',
            collapsable: false,
            children: [
              '',
              'getting-started',
              'jwt',
              'lombok',
              'mapstruct',
              'exception',
              'date'
            ]
          },
          {
            title: '功能',
            collapsable: false,
            children: [
              'deploy',
              'format',
              'generator',
              'socket',
              'excel',
              'word',
              'i18n',
              'file',
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