# 日期处理

## 使用 Java8 日期

Java8 新的日期类型对时区和类型之间转换都能友好支持，所以我们采用 `LocalDateTime`

:::warning 注意
如果 mybatis core 低于 3.4.5 版本，需要手动引入 `mybatis-typehandlers-jsr310` 用于映射转换  
本项目为高版本，无需引入
:::

## 国际化情况下的日期使用

前后端之间传递的都是 unix 时间戳，unix 时间戳指的是零时区 1970-1-1 起所经过的秒数，所以后端接收到时间戳后，把它转换为一个东八区的 `LocalDateTime` ，这样后台系统就不用再考虑时区的问题，因为在系统的最前方反序列化的过程中已经完成了时区的转换，系统内部所有的时间都是东八区的，包括数据库。

后端给前端反数据时，将 `LocalDateTime` 转换为时间戳，前端获取到时间戳后，根据时区转换成相应的时间展示给用户。

:::tip 建议
在不需要国际化的情况下，后端可以以 `yyyy-MM-dd HH:mm:ss` 的形式返给前端，方便前端展示
:::

## 代码实现

对于通过 @requestBody 反序列化的对象，可以使用 Jackson 提供的全局解析方式：

```java
@JsonComponent
public class DateFormatConfig {

    private DateFormatConfig() {}

    private static final DateTimeFormatter dateTimeFormatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** 日期格式化为字符串 */
    public static class DateJsonSerializer extends JsonSerializer<LocalDateTime> {

        @Override
        public void serialize(
                LocalDateTime localDateTime,
                JsonGenerator jsonGenerator,
                SerializerProvider serializerProvider)
                throws IOException {
            jsonGenerator.writeString(dateTimeFormatter.format(localDateTime));
        }
    }

    /** 解析日期字符串 */
    public static class DateJsonDeserializer extends JsonDeserializer<LocalDateTime> {

        @Override
        public LocalDateTime deserialize(
                JsonParser jsonParser, DeserializationContext deserializationContext)
                throws IOException {
            String value = jsonParser.getText();

            String dateTimeFormat = "yyyy-MM-dd HH:mm:ss";
            String timeStampFormat = "^\\d+$";

            if (StringUtils.isEmpty(value)) {
                return null;
            }
            if (value.matches(dateTimeFormat)) {
                return LocalDateTime.parse(value, dateTimeFormatter);
            }
            if (value.matches(timeStampFormat)) {
                return LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(Long.parseLong(value)),
                        ZoneId.of(GlobalConst.TIME_ZONE_ID));
            }
            return null;
        }
    }
}
```

对于直接 param 映射的对象，需要配合 @InitBinder 和  @ControllerAdvice 注解重写反序列化逻辑，如下：

```java
// ParamFormatConfig.java
@Component
public class ParamFormatConfig implements Converter<String, LocalDateTime> {

    private static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final String DATE_FORMAT_REGEXP = "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}";
    private static final String TIME_STAMP_FORMAT_REGEXP = "^\\d+$";
    private static final DateTimeFormatter dateTimeFormatter =
            DateTimeFormatter.ofPattern(DATE_FORMAT);

    // param格式化（http url）
    @Override
    public LocalDateTime convert(@Nullable String value) {
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        if (value.matches(DATE_FORMAT_REGEXP)) {
            return LocalDateTime.parse(value, dateTimeFormatter);
        }
        if (value.matches(TIME_STAMP_FORMAT_REGEXP)) {
            return LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(Long.parseLong(value)),
                    ZoneId.of("+8"));
        }
        throw new ServiceException(ResultStatus.FORMAT_ERROR);
    }
}

// ControllerHandler.java
@ControllerAdvice
public class ControllerHandler {

    @Resource private ParamFormatConfig paramFormatConfig;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        GenericConversionService genericConversionService =
                (GenericConversionService) binder.getConversionService();
        if (genericConversionService != null) {
            genericConversionService.addConverter(paramFormatConfig);
        }
    }
}
```

本项目把他们合并写在 `DateFormatConfig.java` 和 `ControllerHandler.java` 中，具体见代码详情
