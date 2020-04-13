# Word 导出

相比于 Excel，Word 导出相对简单，一般就是纯文字，但是对字体、字号、样式等可能有要求

这里推荐使用 [docxtemplater](https://github.com/open-xml-templating/docxtemplater)，该库可以在浏览器中运行，所以前端先获取到准备好的模板，然后拿到后台的数据，两者一结合就可以生成好模板，供用户下载。

如果是较为复杂的 Word，还是采用分析 Word 内部代码制作模板的方法，套路同 Excel。
