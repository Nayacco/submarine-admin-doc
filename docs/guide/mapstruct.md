# Bean 转换

每张表都会生成一个 entity 和一个 dto，这就涉及到它们互相转换的问题。

## 调研比较

可以使用 spring 提供的 BeanUtils.copyProperties() 进行拷贝属性，但是这种做法不能进行嵌套转换，而且我们也不希望专门写代码来进行转换，更想把转换的逻辑抽离出来，所以调研了一些转换工具

|         工具包         | 需要编写 Mapper | 支持 Map | 支持 List、Set |         类型转换         | 性能 |
| :--------------------: | :-------------: | :------: | :------------: | :----------------------: | :--: |
|         Selma          |       是        |    否    |       否       |       需要手写转换       | 极高 |
|       MapStruct        |       是        |    否    |       否       | 支持常用类型和复杂表达式 | 极高 |
| BeanUtils（yangtu222） |       否        |    否    |       是       |       需要手写转换       | 极高 |
|          mica          |       否        |    是    |       是       |  是用 Spring 的类型转换  | 极高 |
|         Spring         |       否        |    否    |       否       |          不支持          |  高  |
|         hutool         |       否        |    是    |       否       |          不支持          |  高  |

还有非常重要的一点是，如果是嵌套的结构，比如 List 里面套 List\<User>，而 User 有一个字段是 password，显然我们不想把密码暴露出去，MapStruct 能帮你把嵌套的结构都转成相应的 Dto，有时一些特殊的转换逻辑，例如 userList 转 userIds，我们可以把这种逻辑写在 Mapstruct 文件里，实现转换逻辑和业务代码的分离，所以最终选择 MapStruct

具体使用参看[官方文档](https://mapstruct.org/)

## 配置

首先在 idea 中安装 mapstruct 的插件，然后再 pom 中添加以下配置：

```xml
<!-- properties -->

<properties>
    <java.version>1.8</java.version>
    <org.mapstruct.version>1.3.1.Final</org.mapstruct.version>
</properties>

<!-- dependency -->

<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>${org.mapstruct.version}</version>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>${org.mapstruct.version}</version>
    <scope>provided</scope>
</dependency>

<!-- plugin -->

<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.0</version>
    <configuration>
        <source>${java.version}</source>
        <target>${java.version}</target>
        <compilerArgs>
            <compilerArg>-Amapstruct.unmappedTargetPolicy=IGNORE</compilerArg>
        </compilerArgs>
    </configuration>
</plugin>
```

可以在 plugin 中进行全局配置，即 compilerArgs 参数，这里把不匹配的字段设为忽略
