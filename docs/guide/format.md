# 代码格式化

统一的代码风格有助于维护项目的发展，不让它变得糟糕，特别在有些较为复杂的逻辑，或较长、较深的嵌套写法时，开发人员手动都不能很好的换行缩进，所以需要一款自动格式化代码的工具。

在前端领域，限制代码风格已经非常普及和成熟，常用的方案是 eslint + prettier ，本项目的前端目前只使用了 eslint，就已经有非常不错的效果，有需要也可以加入 prettier，不再过多赘述，相关文章非常的多。

这里我们只讨论后端的代码格式化。

## 方案对比

代码格式化有多种方案，总体分为两类：强格式化和弱格式化

- 强格式化：能对包排序、智能换行、统一缩进、空行移除等，这类工具有 `google-java-format` 和 `prettier`

- 弱格式化：只能根据简单编辑器规则格式化代码，常见的方式是自己配置一个 `idea-style.xml` 或 `eclipse-style.xml` 放在某些 maven plugin 下，这类工具效果往往较差，不符合我们的预期，例如阿里的 p3c、checkstyle(只校验)等

我们选用强格式化工具，下面对两者进行比较.

## google-java-format

google-java-format 是一种规范，也就是对各种场景应该如何格式化代码进行讨论，并制定规则。而[google-java-format](https://github.com/google/google-java-format) 是对该规范的一种实现。

它在 java 领域经历了充分的讨论，并且应用十分广泛，各类 IDE 插件、maven 插件都能较好的支持。但是实际使用中有一些缺点：

- 不支持自定义规则，其中最大的问题是每行的最大长度强制限制为 100 个字符，遇到 stream 这种比较长的嵌套链式写法，会把代码切割的非常非常碎，直接影响了代码的阅读。
- 限定 100 个字符原因是：在 13 寸的屏幕下，横向不会出现滚动条，直接就能看到所有代码，但是办公环境往往使用 24 寸显示器，限定 100 个字符使屏幕右侧产生一大块的空白，没有有效利用屏幕空间。

综上，这里我们没有采用 google-java-format，因为它的缺点直接影响了代码的阅读，问题十分严重。

通过测试，限定 120 个字符对于屏幕的利用率和代码折行都能达到一个不错的效果，**所以这里我们采用 prettier**

## prettier

[prettier](https://github.com/prettier/prettier) 是 facebook 开发的格式化代码工具，在前端有广泛的使用，同时它架构上采用插件机制，通过插件实现了几乎所有语言的格式化，是当下非常热门的代码格式化工具。

prettier 相比于 google-java-format 也有一个缺点，就是无法移除无效引用（unused import），不过该缺点还好，不算大问题

这里我们采用它的 java 实现 [prettier-java](https://github.com/jhipster/prettier-java)

首先在 pom 中引入 plugin 插件

```xml
<plugin>
    <groupId>com.hubspot.maven.plugins</groupId>
    <artifactId>prettier-maven-plugin</artifactId>
    <version>0.10</version>
    <configuration>
        <prettierJavaVersion>0.8.0</prettierJavaVersion>
    </configuration>
</plugin>
```

然后在根目录对添加自定义规则文件 `.prettierrc.yml`

```yml
# .prettierrc.yml
overrides:
  - files:
      - "*.java"
    options:
      printWidth: 120
      tabWidth: 4
      useTabs: false
      endOfLine: "lf"
```

执行 `mvn prettier:write` 即可格式化项目代码

## git hook

每次手动格式化是不现实的，我们期望每次提交代码时，无感的自动格式化代码。所以这里采用 git hook 的机制，git hook 默认位置为 `.git/hooks` 下，该配置无法实现 git 同步，所以我们在项目根目录创建 hooks 文件夹，并添加 `pre-commit` 文件如下(参考[Shell script](https://prettier.io/docs/en/precommit.html#option-5-shell-script))：

```bash
#!/bin/sh
# git config core.hooksPath hooks
echo '[git hook] executing maven spotless:write before commit'

mvn -f "./pom.xml" com.hubspot.maven.plugins:prettier-maven-plugin:write

changed_java_files=$(git diff --cached --name-only --diff-filter=ACMR | grep ".*java$" )

if [ -n "$changed_java_files" ]; then
    git add $changed_java_files
fi

RESULT=$?

exit $RESULT
```

该位置的 hook 文件并不能生效，需要手动执行 `git config core.hooksPath ./hooks` 命令才能生效，这里采用一个 maven 插件帮我们自动执行

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
    <version>3.0.0</version>
    <executions>
        <execution>
            <id>config git hooks</id>
            <phase>initialize</phase>
            <goals>
                <goal>exec</goal>
            </goals>
            <configuration>
                <executable>git</executable>
                <commandlineArgs>config core.hooksPath hooks</commandlineArgs>
            </configuration>
        </execution>
    </executions>
</plugin>
```

可以看到配置了 `<phase>initialize</phase>`，每次执行 maven compile 时，都会触发该命令，从而使 hook 生效（其实只要执行过一次就行）
