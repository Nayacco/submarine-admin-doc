# 项目部署

## war 包

修改 `pom.xml` ，将 packaging 属性设置为 war

```xml
<groupId>cn.demo</groupId>
<artifactId>demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
<packaging>war</packaging>
```

修改启动类 `Application.java` ，使其继承 `SpringBootServletInitializer` ，并重写 configure 方法

```java
// Application.java
@SpringBootApplication
public class Application extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }
}
```

执行 `mvn clean package` 即可打包出 war 包

## jar 包

修改 `pom.xml` ，将 packaging 属性设置为 jar

```xml
<groupId>cn.demo</groupId>
<artifactId>demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
<packaging>jar</packaging>
```

添加 `spring-boot-maven-plugin` 依赖，它会自动帮你生成 `MANIFEST.MF` 文件到 jar 包中，使其变成一个可执行的 jar

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

执行 `mvn clean package` 即可打包出 jar 包

## 前端部署

前端有两种部署方式：一是放到 nginx 上，二是放到后端的 war or jar 包中。

常用的是放到 nginx 上，可以较为方便的配置缓存，转发规则等。如果项目场景简单，也可以直接放到后端项目里部署。

无论采用哪种方式，首先都要在前端进行生产环境配置，配置文件为 `.env.production` ，配置完成后，执行 `yarn build:prod` 即可将资源打包到 dist 目录下

### nginx 部署

放到 nginx 指定目录下，并根据项目实现，配置转发规则，可参考 [Build & Deploy](https://panjiachen.github.io/vue-element-admin-site/zh/guide/essentials/deploy.html)

### 嵌入后端部署

首先将 dist 目录拷贝到 `src/main/resource` 目录下，并将 dist 重命名为 static，然后配置 `WebSecurityConfig.java` 文件，将一些前端的访问路径加入白名单

```java
// WebSecurityConfig.java
antMatchers(
    securityConfig.getLoginPage(),
    "/druid/**",
    "/file/download/**",
    "/",
    "/static/**",
    "/**/favicon.ico"
).permitAll()
```
