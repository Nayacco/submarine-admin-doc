# 工作流

简介activiti、flowable、cam关系

## 后端设计

具体业务实体要实现flowevent接口，其中code为流程定义的标识，每张表都冗余一下processInstanceId，后续查询业务数据时，根据该字段查询，而不是业务表的id.

另外流程引擎每次流转时，都会抛出flowevent事件，具体业务可以通过监听事件完成一些操作。

预置了流程的变量和task的变量，
applyUserId
status
approverId：审批节点的人
formKey:没有用流程定义的code，因为没有动态性

## 前端表单复用设计

前端需要两种界面，一种是新增的界面，另一种是核准时的界面，所以为了复用表单前端进行了如下设计：每添加一个业务时，该业务只提供form部分，按钮弹窗都是由formloader提供，即由不同的formloader去加载form部分。这里我们实现好了addFormloader和approveFormloader两种，如果业务特殊，也可以自定义自己的formloader，当点击formloader的按钮时，formloader会触发form.vue的事件。

form.vue需要自己的一些信息，formloader才能很好的展现

```js
export default {
  // 流程定义的标识
  name: 'DestroySafeRecord',
  parentVariable: {
    // 自身 form 的宽度
    width: '1020px'
  }
}
```

注意画流程图时遵循首字母大写，且驼峰的写法，因为eslint会自动格式化组件的name为在这种形式。

```js
// form.vue
export default {
  mounted() {
    if (this.mode !== 'add') {
      this.getFlowLeaveDetail()
    }
    this.$on('add', () => this.save('add'))
    this.$on('approve', () => this.save('approve'))
  }
}
```

目前实现的formloader会触发form组件的add和approve事件，如果是自定义的formloader，也可以自定义事件。

所有的form都应该在register.js中注册

## 核准

ActTaskController中实现好了通用的核准接口，即核准时不能修改表单数据，只能提交自己的核准意见和核准结果。如果核准人可以修改表单数据，只能自己实现approve的controller，先保存数据，然后调用actTaskService.complete方法。
