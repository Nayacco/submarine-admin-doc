# lombok 注意事项

Lombok 简化了 java 又臭又长的代码，平时还使用建造者这样的写法，写起来清晰很多。但是在实际使用中也遇到不少坑，以下为注意事项

## 建造者的问题

我们都知道给实体添加 `@Builder` 后就可以使用建造者，但如果实体发生了继承，例如继承了 `BaseEntity` ，却无法建造 `BaseEntity` 中的属性。于是 Lombok 推出了 `@SuperBuilder` 注解（该注解还处于实验阶段），在父类和子类上都添加改注解，就可以一起建造父类和子类的属性。

```java
@Data
@SuperBuilder(toBuilder = true)
public class Parent {
    private int id;
    private String name;
}

@Data
@SuperBuilder
public class Child extends Parent {
    private String ext;
}

Child c1 = Child.builder()
                .id(1)
                .name("名称")
                .ext("子类属性ext")
                .build();
```

Lombok 在 1.18.2 中支持了改注解，idea 的 Lombok 插件也已支持该注解。

## ToString 和 EqualsAndHashCode 的问题

如果实体发生了继承，默认情况下 `@ToString` 和 `@EqualsAndHashCode` 都不会将父类的属性加入计算，如果要将父类属性也加入计算，可以配置 `callsuper` 的值为 true：`@ToString(callSuper=true)` 和 `@EqualsAndHashCode(callSuper=true)`

但是每个实体都这样写太过麻烦，并且@Data 注解也失去了意义，Lombok 还支持全局统一的配置，新建 lombok.config 配置文件，加入以下信息：

```js
config.stopBubbling=true
lombok.equalsAndHashCode.callSuper=call
lombok.toString.callSuper=call
```

**注意：** 在低版本的 Lombok 中，lombok.toString.callSuper=call 不生效，经过测试 在 1.18.8 中可以使用

## lombok.config 配置文件作用范围

`lombok.config` 配置文件只对父类目录下的所有 `java` 文件才生效，所以在 spring 项目中，无法将配置文件放在 resource 文件夹下，需要放在 `src/main/java` 文件夹下，或者和启动类放在一起。

Lombok 不仅适用于 spring 项目，它适用于所有的 java 项目，所以对作用范围进行这样的设定。

## 配合 mapstruct 使用

mapstruct 提供了配合 lombok 的使用方式，即 mapstruct 生成的代码为建造者
