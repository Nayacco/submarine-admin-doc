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

最后选择了 MapStruct

具体使用参看[官方文档](https://mapstruct.org/)

## 注意事项

lombok 中已经提过配合使用的问题，下面贴一下具体配置：

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
