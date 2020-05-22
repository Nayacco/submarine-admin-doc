# 异常捕获

系统中的异常需要统一的捕获，并以统一的格式返给前端，下面来谈一谈如何统一处理异常，本项目使用的第二种处理方式

## @ControllerAdvice

@ControllerAdvice，是 Spring3.2 提供的新注解

- @ControllerAdvice 是一个 @Component，用于定义@ExceptionHandler，@InitBinder 和@ModelAttribute 方法，适用于所有使用 @RequestMapping 方法。
- Spring4 之前，@ControllerAdvice 在同一调度的 Servlet 中协助所有控制器。Spring4 已经改变：@ControllerAdvice 支持配置控制器的子集，而默认的行为仍然可以利用。
- 在 Spring4 中， @ControllerAdvice 通过 annotations(), basePackageClasses(), basePackages()方法定制用于选择控制器子集。

简单来说就是给所有的 Controller 加上统一的 @ExceptionHandler 或 @InitBinder 或 @ModelAttribute 处理。

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理所有不可知的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity handleException(Exception e){
        log.error("服务器异常：{}", e);
        return new ResponseEntity<>("服务器异常，请稍后重试", HttpStatus.BAD_REQUEST);
    }

    /**
     * 处理数组越界异常
     */
    @ExceptionHandler(ArrayIndexOutOfBoundsException.class)
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR,reason = "数组越界")
    public void handleAccessDeniedException(ArrayIndexOutOfBoundsException e){
        log.error("数组越界：{}", e.getMessage());
    }

    /**
     * 业务代码错误
     */
    @ExceptionHandler(value = ServiceException.class)
    public ResponseEntity serviceException(ServiceException e) {
        log.error("业务代码错误：{}", e.getMessage());
        return new ResponseEntity<>("业务代码错误：", HttpStatus.BAD_REQUEST);
    }
}
```

@RestControllerAdvice 是 @ControllerAdvice 的增强，类似于 @RestController

上面的代码中可以看到通过 @RestControllerAdvice 注解，将上面的三种异常处理加到了所有的 controller 上，这样就能捕获所有能到达 controller 层的异常。

缺点是 Controller 之前的异常无法捕获（比如 Filter）

以上只是 demo 展示，最佳实战请见另一篇博客 [spring 统一异常处理](https://goldsubmarine.github.io/2019/09/08/spring-%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/)

## spring 底层的 API

这里我们采用 spring 更底层的 API 处理，即所有错误都会转发到 `/error` 路径的 Controller 上。

自定义实现可以参考 spring 的 `BasicErrorController` 类，本项目的实现为 `GlobalErrorController`，它捕获到所有的异常后，如果是我们自定义的 ServiceException 则直接返回，如果是前端参数反序列化错误，则返回“参数绑定错误”，其他异常则返回“内部异常”
