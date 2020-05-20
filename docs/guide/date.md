# 日期处理

## 使用 Java8 日期

Java8 新的日期类型对时区和类型之间转换都能友好支持，所以我们采用 `LocalDateTime`

## 国际化情况下的日期使用

前后端之间传递的都是 unix 时间戳，unix 时间戳指的是零时区 1970-1-1 起所经过的秒数，所以后端接收到时间戳后，把它转换为一个东八区的 `LocalDateTime` ，这样后台系统就不用再考虑时区的问题，因为在系统的最前方反序列化的过程中已经完成了时区的转换，系统内部所有的时间都是东八区的，包括数据库。

后端给前端反数据时，将 `LocalDateTime` 转换为时间戳，前端获取到时间戳后，根据时区转换成相应的时间展示给用户。

:::tip 建议
在不需要国际化的情况下，后端可以以 `yyyy-MM-dd HH:mm:ss` 的形式返给前端，方便前端展示
:::

## 代码实现

```java
@JsonComponent
public class DateFormatConfig {

    private DateFormatConfig() {}

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 日期格式化为字符串
     */
    public static class DateJsonSerializer extends JsonSerializer<LocalDateTime> {
        @Override
        public void serialize(LocalDateTime localDateTime, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
            jsonGenerator.writeString(dateTimeFormatter.format(localDateTime));
        }
    }

    /**
     * 解析日期字符串
     * 同时支持 yyyy-MM-dd HH:mm:ss 和 时间戳
     */
    public static class DateJsonDeserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException {
            String value = jsonParser.getText();

            String dateTimeFormat = "yyyy-MM-dd HH:mm:ss";
            String timeStampFormat = "^\\d+$";

            if(StringUtils.isEmpty(value)) {
                return null;
            }
            if(value.matches(dateTimeFormat)) {
                return LocalDateTime.parse(value, dateTimeFormatter);
            }
            if(value.matches(timeStampFormat)) {
                return LocalDateTime.ofInstant(Instant.ofEpochSecond(Long.parseLong(value)), ZoneId.of(GlobalConst.TIME_ZONE_ID));
            }
            return null;
        }
    }
}
```
