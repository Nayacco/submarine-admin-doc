# WebSocket

使用过 socket-io 和 spring 提供的 WebSocket 后，果断选择 socket-io，这里采用 netty 的实现版本 [netty-socketio](https://github.com/mrniko/netty-socketio)

## 优势

socket-io 提供房间、广播等概念，可以方便的创建 IM 聊天等功能，并且该协议有多种通讯方式，在客户端不支持 websocket 的情况下（IE），自动采用 http 轮询的方式。

## 缺点

它采用了一些自定义实时传输协议，标准的 WebSocket 客户端不能直接连接到 Socket.io 服务器，要求客户端与服务器端均须使用该框架，不过 socket-io 提供了多种语言版本的客户端，如：swift、js、dart、java、c++

netty 和 tomcat 不属于同一容器，所以无法和 http 共用一个端口，详情见[issue](https://github.com/mrniko/netty-socketio/issues/267)

## 认证

socket 连接时需要进行认证，有以下两种方案：

### url 参数

在连接的 url 上携带 token 参数，后端获取到 token 后进行校验，详情见[文档](https://socket.io/docs/client-api/#With-query-option)

```js
// 前端

const socket = io({
  query: {
    token: "cde"
  }
});

// 重新连接时更新token
socket.on("reconnect_attempt", () => {
  socket.io.opts.query = {
    token: "fgh"
  };
});
```

```java
// 后端
// com.htnova.common.socket.SocketConfig
new AuthorizationListener() {
    @Override
    public boolean isAuthorized(HandshakeData data) {
        // 如果采用url参数机制
        String authToken = data.getSingleUrlParam(authorizationHeader);
        log.info("连接参数：{} = {}", authorizationHeader, authToken);
        return true;
    }
}
```

缺点是自己要维护一套 token 的签发认证机制，不能利用现有维护好的 cookie/session 机制

当然你也可以选择把 cookie 设为非 httpOnly，这样前端获取到 cookie 后，放在 url 上传过来

### cookie

websocket 的实现的是先发送一个 http 请求，头字段 `Connection: Upgrade` 表示希望把当前 http 升级为 socket，服务端解析后当前通道就被升级了

因为建立连接的时候是一个 http，所以浏览器依然会自动带上 cookie，后端从 header 中解析出 cookie，然后从 spring-security 中解析出 session 就行了，相比于 url 参数的方案，该 cookie 仍然为 httpOnly，所以更安全，具体代码如下：

```java
// 后端
// com.htnova.common.socket.SocketConfig
new AuthorizationListener() {
    @Override
    public boolean isAuthorized(HandshakeData data) {
        // 如果采用cookie机制
        String sessionId = AuthUtil.getSessionId(data.getHttpHeaders().get("cookie"));
        Session session = sessionRepository.findById(sessionId);
        log.info("session：{}", session);
        return true;
    }
}
```

并且 socket-io 本身重连不需要二次验证也是靠 cookie 实现的，可以发现 socket-io 往浏览器写入了一个 cookie，重连时只要 cookie 在后端的 session 中，就允许连接

::: warning 注意

- 确保 spring security 设置的 cookie 的 path 和 socket 连接时的 path 一致
- 建议使用火狐调试，chrome 虽然也发送了 cookie ，但是不显示在控制台
:::

## 启动和关闭

netty 和 tomcat 不属于同一个容器，所以 netty 要单独启动，结束时也要单独关闭，这里采用 Servlet 生命周期的注解来实现：

```java
// com.htnova.common.socket.SocketServerInit
@Service
public class SocketServerInit {

    @Resource
    private SocketIOServer socketIOServer;

    @PostConstruct
    public void start() {
        log.info("SocketIO Server starting...");
        socketIOServer.start();
    }

    @PreDestroy
    public void stop() {
        log.info("SocketIO Server stopping...");
        socketIOServer.stop();
        log.info("SocketIO Server stopped.");
    }
}
```

## 拦截器

```java
package com.htnova.common.socket;

@Slf4j
@Service
public class SocketServerInit {

    @Resource
    private SocketIOServer socketIOServer;

    /**
     * 客户端建立连接
     */
    @OnConnect
    public void onConnect(SocketIOClient client) {
        String uuid = client.getSessionId().toString();
        String ip = client.getRemoteAddress().toString();
        String sessionId = AuthUtil.getSessionId(
            client.getHandshakeData().getHttpHeaders().get("cookie")
        );
        //加入仓库的房间
        client.joinRoom("default_room");
        log.info("设备建立连接 IP: {} UUID: {} token: {}", ip, uuid, authToken);
    }

    /**
     * 客户端断开连接
     */
    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        String uuid = client.getSessionId().toString();
        String ip = client.getRemoteAddress().toString();
        log.info("设备断开连接 IP: {} UUID: {}", ip, uuid);
    }
}
```

## 监听和推送

```java
@Slf4j
@Controller
public class SocketController {

    @Resource
    private SocketIOServer socketIOServer;

    // 监听前端的事件
    @OnEvent("/hello")
    public void onEvent(SocketIOClient client, AckRequest ackRequest, String msg) {
        log.info("client {} AckRequest {} msg {}", client, ackRequest, msg);
        client.sendEvent("/word", "hello word!");
        socketIOServer.getRoomOperations("default_room").sendEvent("/broadcast", "广播消息");
    }

    // 房间广播消息
    public void broadcast() {
        socketIOServer.getRoomOperations("default_room").sendEvent("/broadcast", "广播消息");
    }
}
```
