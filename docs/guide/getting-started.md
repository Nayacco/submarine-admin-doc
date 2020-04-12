# 快速开始

## 后端

```bash
# 克隆项目
git clone https://github.com/GoldSubmarine/submarine-admin-backend.git
```

将 `sql` 文件夹下的 `base.sql` 初始化到数据库，并正确配置 `application-dev.yml` 中的数据库信息

::: tip 建议
自身的业务开发建议在 `com.htnova` 下新建一个包，方便后续对本项目进行升级
:::

## 前端

```bash
# 克隆项目
git clone https://github.com/GoldSubmarine/submarine-admin-frontend.git

# 进入项目目录
cd submarine-admin-frontend

# 配置国内镜像
yarn config set registry https://registry.npm.taobao.org
yarn config set sass_binary_site https://npm.taobao.org/mirrors/node-sass/

# 安装依赖
yarn

# 本地开发 启动项目
yarn dev
```

::: tip 建议
确保安装了 node > 8.0
推荐使用 yarn 安装
:::

## 调试

前端启动后，打开 `http://localhost:9528/` ，管理员账户为 admin，密码为 123456

前端本地相当于起了一个web服务，并把前端的请求转发到后端，可以在 `vue.config.js` 中配置 `proxy.target` 到指定的后端服务上
