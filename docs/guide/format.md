# 代码格式化

统一的代码风格有助于维护项目，这里采用 [google-java-format](https://github.com/google/google-java-format) 对项目的代码风格进行格式化，它可以对过长的行进行换行、注释优化、无效引用去除、统一缩进距离等

刚开始使用可能有些地方不符合我们的习惯，但是明显有些地方，代码整洁舒适很多。

为确保格式化的工作强制且自动完成，我们使用 [git-code-format-maven-plugin](https://github.com/Cosium/git-code-format-maven-plugin)，该 maven 包是对 `google-java-format` 的封装，它主要做两件事：

1. 自动在 git 中注册 hook，确保所有提交的代码都是统一风格
2. 每次 `mvn compile` 时都会对项目的代码进行格式化
3. 格式化失败且不符合风格，就禁止提交

::: warning 注意
如果配置了阿里云的镜像，首次格式化可能会失败，你可以做以下尝试：

1. 手动执行 `mvn git-code-format:format-code -Dgcf.globPattern=**/*`
2. 如果上述步骤仍然失败，则去除掉阿里云的镜像，重复执行第一步
:::
