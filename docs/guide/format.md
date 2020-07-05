# 代码格式化

目前有两种格式化代码的方案，google-java-format 和 prettier，这里我们选择 google-java-format

## prettier

[prettier-java](https://github.com/jhipster/prettier-java)，使用说明见 maven plugin

目前该插件无法自动注册 git hook，所以要手动注册，在项目根目录的 `.githooks` 文件夹内编写好了脚本，执行 `git config core.hooksPath .githooks` 即可注册成功

他也无法移除无用的包

## google-java-format

统一的代码风格有助于维护项目，这里采用 [google-java-format](https://github.com/google/google-java-format) 对项目的代码风格进行格式化，它可以对过长的行进行换行、注释优化、无效引用去除、统一缩进距离等

刚开始使用可能有些地方不符合我们的习惯，但是明显有些地方，代码整洁舒适很多。

为确保格式化的工作强制且自动完成，我们使用 [git-code-format-maven-plugin](https://github.com/Cosium/git-code-format-maven-plugin)，该 maven 包是对 `google-java-format` 的封装，它主要做两件事：

1. 自动在 git 中注册 hook，确保所有提交的代码都是统一风格
2. 每次 `mvn compile` 时都会对项目的代码进行格式化
3. 格式化失败且不符合风格，就禁止提交

该插件有一个 bug，就是在同一个文中混用 LF 和 CRLF 的时候，校验会失败，所以在项目根目录增加了 `.gitattributes` 文件，限制本项目只能使用 `LF` 作为换行符，其实本身混用就可能造成问题，所以建议 git 全局设置为 LF 换行：

```bash
git config --global core.autocrlf input
git config --global core.safecrlf true
git config --global core.eol lf
```

把编辑器的默认换行也设置成 LF ，idea 的设置位置为 `File => Settings => Editor => Code Style => Line Separator`，这样新增加的文件换行符就是 LF 了

对于已有的项目，想要把所有的文件改成 LF 换行，可以在 idea 中左键选中项目根文件夹，然后点击 `File => File ProperTies => Line Separator` 即可全局更改成功

也可以修改 idea 的默认格式风格为 google-java-format ，配合 `Action Save` 插件，每次保存时自动格式化代码，这样就能提前看到最后格式化完的代码，而不是提交时依靠 git hook 格式化，可能最后的代码格式会超出你的预期。这里不要安装 google-java-format 插件，因为它无法自定义配置，且无法对导入的包排序，所以可以执行下载 [intellij-java-google-style](https://raw.githubusercontent.com/google/styleguide/gh-pages/intellij-java-google-style.xml)，并修改文件内容（如下），缩进 4 格，最后导入到 idea 中 `File => Settings => Editor => Code Style`.

```xml
<codeStyleSettings language="CSS">
    <indentOptions>
        <option name="INDENT_SIZE" value="4" />
        <option name="CONTINUATION_INDENT_SIZE" value="4" />
        <option name="TAB_SIZE" value="4" />
    </indentOptions>
</codeStyleSettings>
```

## checkstyle

[checkstyle](https://github.com/checkstyle/checkstyle)
