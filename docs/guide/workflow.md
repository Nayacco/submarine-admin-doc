# 工作流

目前比较出名的开源工作流框架大概有 4 个，分别是 Activiti/camunda/Flowable/Jbpmn，Activiti/camunda/Flowable 三个框架，几乎都是从 Jbpm4 之后衍生出来的。

camunda 公司早期是 Activiti 主要的代码贡献者之一，2012 年末，他们觉得 Activiti 太拘束于以文档为中心的工作流的需求，决定分裂出一个新的分支，即 camunda。

2017 期间 activiti 团队内部已经产生了重大的分歧，核心开发者均离职，在 Activiti6 的基础上，又分裂出一个分支，即 Flowable。

Activiti 的代码和 Flowable 有很大一部分是相同的，Activiti7 已经向云的方向发展，而 Flowable 则继续打磨细节，增加功能，又因为原有的核心开发者都转到了 Flowable，所以这里我们选型 Flowable

## 概念

简单介绍一下 Flowable 的几个概念，首先我们在模型管理页面设计并保存好**模型**，即画好流程图，然后点击部署按钮，将流程图部署为一个**流程定义**，部署成功后就可以在流程管理界面看到该流程定义，也可以在发起申请界面提交申请了。用户每发起一个申请，就被称为一个**流程实例**，在我的申请界面看到的就是流程实例。流程图中画了很多审批节点，这些审批节点代表**任务**，我的代办、我的已办界面展现的都是审批节点，即任务。

## 后端设计

每次启动一个流程实例时，都会产生相应的**流程变量**（存在 act_ru_variable 表），这里我们预置好了一些流程变量，可查看 `ProcessVariableDTO.class`，这些变量都可以在流程图中动态使用。举个栗子：

具体业务实体要实现 flowevent 接口，其中 code 为流程定义的标识，每张表都冗余一下 processInstanceId，后续查询业务数据时，根据该字段查询，而不是业务表的 id.

另外流程引擎每次流转时，都会抛出 flowevent 事件，具体业务可以通过监听事件完成一些操作。

预置了流程的变量和 task 的变量，
applyUserId
status
approverId：审批节点的人
formKey:没有用流程定义的 code，因为没有动态性

## 前端表单复用设计

前端需要两种界面，一种是新增的界面，另一种是核准时的界面，所以为了复用表单前端进行了如下设计：每添加一个业务时，该业务只提供 form 部分，按钮弹窗都是由 formloader 提供，即由不同的 formloader 去加载 form 部分。这里我们实现好了 addFormloader 和 approveFormloader 两种，如果业务特殊，也可以自定义自己的 formloader，当点击 formloader 的按钮时，formloader 会触发 form.vue 的事件。

form.vue 需要自己的一些信息，formloader 才能很好的展现

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
    this.$on("add", () => this.save("add"));
    this.$on("approve", () => this.save("approve"));
  },
};
```

目前实现的 formloader 会触发 form 组件的 add 和 approve 事件，如果是自定义的 formloader，也可以自定义事件。

所有的 form 都应该在 register.js 中注册

## 核准

ActTaskController 中实现好了通用的核准接口，即核准时不能修改表单数据，只能提交自己的核准意见和核准结果。如果核准人可以修改表单数据，只能自己实现 approve 的 controller，先保存数据，然后调用 actTaskService.complete 方法。
