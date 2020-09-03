# Excel 导出

Excel 导出文件，总体来说两个方案：

1. 使用 poi 等操作 excel 的库，写代码来创建 excel
2. 通过模板，填充数据的方式来创建 excel，例如 freemarker,ejs

如果只是简单的导出数据，不要求样式公式，可以直接使用库创建 excel，但在面对复杂的 excel 时，写模板填充数据的方式更加简单。

## 方案对比

以下是市面上的一些方案：

- **docx4j**：java 处理 word 和 excel 的 sdk，类似 poi，不支持模板处理
- **exceljs**：浏览器运行 excel api，好处是能保留样式。不支持模板处理
- **sheetjs**：可以浏览器运行，可以读取 SpreadsheetML，但是保存成 xls 的时候，样式丢失。商业版支持样式，价格预计`$750`
- **sail-sail/ejsExcel**：模板渲染。不过是 nodejs 实现，不支持浏览器运行。且模板语言比较难懂。

还有一些老项目：xelem、JODConverter、easyxls 都不适合

## 最终方案

:::tip 建议
如果没有 app 的情况下，建议把 excel 生成放到前端实现，原因是 js 更加灵活，后台只用提供数据就行
:::

### 简单数据导出

可以直接使用阿里的 [easyexcel](https://github.com/alibaba/easyexcel) 生成文件

更推荐的方案是，后台提供数据，前端通过使用 [exceljs](https://github.com/exceljs/exceljs) 直接从浏览器导出 excel

### 复杂 excel 导出

excel 分为 03 版和 07 版，即 xls 和 xlsx 的区分，这里我们只讨论 xlsx，xlsx 的本质是一个压缩包，例如有一个 `example.xlsx` 文件，修改文件名将其变为 `example.zip` ，然后解压该 zip 文件，就可以看到内部的目录了，所以我们的方案是分析 xlsx 内部的文件，制作一个模板，用数据渲染模板，然后重新打成一个 zip 并修改后缀名，给用户下载即可。

#### 具体实施方案

首先打开 excel，制作好一个有样式的模板，然后将其重命名为 zip 格式，解压获取到`sheet1.xml`，我们采用`ejs`模板语法将`sheet1.xml`书写好，然后重新塞回 zip 文件中，前端通过 ajax 获取这个 zip 包的二进制流，通过`jszip`这个库解压 zip，这样前端 js 就获取到了`sheet1.xml`这个文件，结合后台返回的数据，用`ejs`渲染好该模板，将渲染好的模板重新塞回 zip 中，最后前端实现这个 zip 的下载。

> 参考项目：[export-excel-demo](https://github.com/GoldSubmarine/export-excel-demo)

以下是一些帮助你分析 xlsx 文件的有用信息，重点关注 `Shared String` 和 `String` 的区别。

#### 目录结构

解压 excel 文件后，得到下面的文件目录：

- [Content_Types].xml 文件：列出了该工作簿下包含的各个部件信息。

  1. Type： 包含枚举 VSIX 包中的文件类型的子元素
  2. xmlns：(必选)使用此 [Content_Types].xml 文件的架构的位置
  3. Default：ZIP 压缩包每种文件类型的引用， Extension 值为 VSIX 包中的文件扩展名
  4. Override：不同类型文档内容的 XML 部件的引用， PartName 值为链接外部文件的位置
  5. ContentType：说明与文件扩展名相关联的内容类型

- \_rels：内含一个名为 .rels 的文件，包含关于该工作簿程序包的各文件关系。

  1. Id：唯一值，可以是任意字符串
  2. Type：包含各文件的关系类型
  3. Target：包含各文件的位置

- docProps：内含一个 app.xml 与一个 core.xml 分别定义工作簿的各元数据。

  1. app.xml 文件下定义了该文档的一些基本属性，包括但不限于“加密情况”、“工作簿名称”、“公司名称”、“应用程序版本”等
  2. core.xml 文件中定义的信息与 app.xml 类似，也是一些基础属性信息，更直观地说的话，就是通过右键“属性/详细信息”查看到信息

- xl：内含多个文件夹及文件，主要为描述该工作簿下各工作表的文件。

  1. sharedStrings.xml：记录表格中输入的各数据信息
  2. styles.xml：Excel 工作表中设置的各样式信息
  3. workbook.xml：定义工作簿中的各个部件信息
  4. printerSettings 文件夹下有一个 printerSettings1.bin 文件，主要是描述应用程序打印时如何打印文档的信息。
  5. theme 文件夹下包含工作簿主题的数据的 XML 文件。比如这里的 theme1.xml 。代码不贴了，没多大意义。
  6. worksheets 文件夹下主要是各个工作表的一些信息，sheet1.xml、sheet2.xml、sheet3.xml 里都是一些描述表的代码，这里就不细说了。同样该文件夹下又有一个 \_rels 文件夹，其中有个 sheet1.xml.rels 文件，用于说明该工作表下各文件的关系。

> 参考：[关于 Excel 文件结构与读写](https://testerhome.com/topics/6050)

#### row 结构

下面分析 sheet1.xml 文件的结构

在 sheetData 标签里，是一个`row`，结构如下：

```xml
<row r="1" spans="1:13" ht="45" customHeight="1">
 <c r="A1" s="26" t="s">
    <v>2</v>
 </c>
 <c r="B1" s="26" />
</row>
```

其中：

- `row` 的 `r` 表示 Row Index 第几行；`spans` 表示哪些列是非空的，是可选项；ht 表示`Row height`； `customHeight`表示`Row height`是否被手动设置过，1 表示是
- `c`表示`cell`（单元格）；`r` 表示 `Reference`, 单元格的位置；`s` 是 `Style Index`，样式估计存储在`styles.xml`里；`t`表示`Cell Data Type`，表示单元格的数据类型，是一个枚举。可选值有：

  - b (Boolean)
  - e (Error)
  - inlineStr (Inline String)。表示字符不在 `shared string table`里，这个类型的单元格，填充内容时，可以不用`v`标签
  - n (Number)
  - s (Shared String) 表示内容在`shared string table`，估计存储在`sharedStrings.xml`里
  - str (String) 表示内容是可以是一个公式（公式也可以是普通的字符串）

某些标签的属性不清楚可以参考这个：[SpreadsheetML (for .xlsx)](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/index.html)

分析完 row 的结构，我们可以写它的模板来填充内容。样式我们保持不变，不用关心。

需要注意的是：每个单元格的`Cell Data Type`都可以指定，因此，模板里原有的内容，可以继续用`Shared String`（excel 保存默认就是`Shared String`），我们自己填充数据的时候，可以选择`str`或者`inlineStr`。

#### 合并单元格

合并单元格定义如下：

```xml
<mergeCells count="2">
  <mergeCell ref="C4:C5" />
  <mergeCell ref="D4:D5" />
</mergeCells>
```

其中：`mergeCells`的`count`表示`mergeCell`子标签的数量。`mergeCell`标签里的`ref`表示的是 `cell Reference Range`

> SpreadsheetML 里 reference 有两种表示方式，一种是`A1`模式，字母表示列，数字表示行。另一种模式是`R1C1`模式，行和列都通过数字来表示。另外两种模式都可以指定相对位置，`A1`模式的相对位置不好懂，`R1C1`模式的相对位置，只要用`[]`把数字括起来就可以了。比如`RC[-3]:RC[-1]`，当 R 不指定数字时，表示整列。参考：[Reference Mode](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/ST_RefMode.html)、 [Cell References](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/Cell%20References.html)

合并单元格，需要我们手动指定哪些 cell 需要合并。

#### 自动换行

```xml
<!-- styles.xml -->
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1">
  <alignment wrapText="1" />
</xf>
```

设置 `<alignment wrapText="1" />` 样式以后，单元格中的文字能自动换行并能撑开高度；但是如果当前单元格为合并单元格，则只能换行，目前没有找到可以撑开高度的方法

#### 公式计算

当单元格有公式的时候，定义如下

```xml
<c r="E16" s="8">
    <f>SUM(E4:E15)</f>
    <v>6</v>
 </c>
```

这里除了有公式之外，还定义了一个`v`标签,这个 v 标签不是必须的，如果没有 excel 会重新计算的，因此我们可以删掉`<v>`。

另外，还需要注意 `calcChain.xml` 文件，这个文件跟公式计算有关，它记录了哪些单元格最后被计算了。它不是必须的，直接删除即可（不删掉可能报错），其他文件对该文件的引用记得也得删除哦。

> 参考： [Calculation Chain](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/Calculation%20Chain.html)

#### 打印设置

有时候 excel 里有打印设置，对于我们导出来说是没有用的，直接删掉。

> 参考：[Remove Existing PrinterSettings of Worksheets in Excel file](https://docs.aspose.com/display/cellsjava/Remove+Existing+PrinterSettings+of+Worksheets+in+Excel+file)
