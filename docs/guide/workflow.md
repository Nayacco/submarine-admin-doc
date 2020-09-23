# 工作流

目前比较出名的开源工作流框架大概有 4 个，分别是 Activiti/camunda/Flowable/Jbpmn，Activiti/camunda/Flowable 三个框架，几乎都是从 Jbpm4 之后衍生出来的。

camunda 公司早期是 Activiti 主要的代码贡献者之一，2012 年末，他们觉得 Activiti 太拘束于以文档为中心的工作流的需求，决定分裂出一个新的分支，即 camunda。

2017 期间 activiti 团队内部已经产生了重大的分歧，核心开发者均离职，在 Activiti6 的基础上，又分裂出一个分支，即 Flowable。

Activiti 的代码和 Flowable 有很大一部分是相同的，Activiti7 已经向云的方向发展，而 Flowable 则继续打磨细节，增加功能.

因为原有的核心开发者都转到了 Flowable，Flowable 的核心功能更加强大，所以这里我们选型 Flowable

## 概念

简单介绍一下 Flowable 的几个概念，首先我们在模型管理页面设计并保存好**模型**，即画好流程图，然后点击部署按钮，将流程图部署为一个**流程定义**，部署成功后就可以在流程管理界面看到该流程定义，也可以在发起申请界面提交申请了。用户每发起一个申请，就被称为一个**流程实例**，在我的申请界面看到的就是流程实例。流程图中画了很多审批节点，这些审批节点代表**任务**，我的代办、我的已办界面展现的都是审批节点，即任务。

## 后端设计

每次启动一个流程实例时，都会产生相应的**流程变量**（存在 act_ru_variable 表），这里我们预置好了一些流程变量，可查看 `ProcessVariable.class`，这些变量都可以在流程图中动态使用。

具体业务实体必须实现 `FlowBusi` 接口，其中 bizCode 为当前业务的编码（不一定和流程定义的 code 相同，可能一个流程定义被多个业务使用）

如果业务实体实现了 `FlowStatus` 接口，也就是业务表中有一个 `flow_status` 字段，当流程实例在流转时，该字段状态将被自动更新。

另外流程引擎每次流转时，都会抛出 `FlowEvent` 事件，具体业务可以通过监听事件完成一些操作，当然也可以在流程图中配置执行监听器。

## 前端设计

因为申请、审批、修订这三个界面的 form 部分是一样的，所以表单部分需要复用，于是前端进行了如下设计：每添加一个业务时，该业务只提供 form 部分，按钮弹窗都是由 formloader 提供，即由不同的 formloader 去加载 form 部分。这里我们实现好了 addFormloader 和 approveFormloader 两种，如果业务特殊，也可以自定义自己的 formloader，当点击 formloader 的按钮时，formloader 会触发 form.vue 的事件。

form.vue 需要提供一些自己的信息给 formloader 才能很好的展现表单，如下：

```js
export default {
  // 流程定义的标识
  name: "DestroySafeRecord",
  parentVariable: {
    // 自身 form 的宽度
    width: "1020px",
  },
};
```

注意画流程图时遵循首字母大写，且驼峰的写法，因为 eslint 会自动格式化组件的 name 为在这种形式。

```js
// form.vue
export default {
  mounted() {
    if (this.mode !== "add") {
      this.getFlowLeaveDetail();
    }
    // 保存按钮
    this.$on("save", () => this.save("save"));
    // 核准按钮
    this.$on("approve", (approveFormData) =>
      this.save("approve", approveFormData)
    );
    // 待办修订自身的form
    this.$on("revise", (reviseFormData) =>
      this.save("approve", reviseFormData)
    );
    // 如果要展现编辑历史，要监听此事件
    this.$on("data", (data) => this.handleData(data));
  },
};
```

目前实现的 formloader 会触发 form 组件的一些事件，如果是自定义的 formloader，也可以自定义事件。

所有的 form 都应该在 `register.js` 中注册

## 核准

ActTaskController 中实现好了通用的核准接口，即核准时不能修改表单数据，只能提交自己的核准意见和核准结果。如果核准人可以修改表单数据，或核准时要进行其他的业务操作，只能自己实现 approve 的 controller，先保存数据，然后调用 actTaskService.complete 方法。

## 流程图

### 流程变量

每个流程实例都有一些该 scope 的流程变量，这些流程变量可以在流程图中用 el 表达式的方式去使用它们，从而达到流程的动态性。

### 表单标识 key

每个任务节点都需要配置`表单标识key`，表示要打开界面的路由，这里我们模仿 http 路径的方式来定义它：`表单注册code + formLoader + 参数`。

- 表单注册 code，即 `form.vue` 中的 `name` 字段，表示当前任务节点要打开哪个 form
- formLoader，表示用哪种形式打开 form，目前已实现的有：add、approve、revise
- 参数，回传给 from 的参数

示例：`LeaveApply:add:userId=1&topic=2`

### 跳转条件

流程线可以通过配置跳转条件来控制流程的流向，跳转条件支持 el 表达式，例如：`${approveType == 'reject'}`

这里的 approveType 就是流程实例的一个变量，当流程流转到该节点时，先用流程变量替换掉 el 表达式中的内容，然后再创建该节点
