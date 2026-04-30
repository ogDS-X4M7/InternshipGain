# 通信功能——websocket

`websocket`是一种全双工通信协议，它可以在客户端和服务器之间建立持久持久的连接，使用单个`TCP`连接。会发送心跳包，保持连接的持久性，防止连接因为长时间没有数据传输而被关闭。

限制上：
- 不提供加密功能，需要在应用层实现加密。
- 优化很重要，保持长连接需要服务器不断地维护和处理连接状态，需要优化性能。
- 不支持古老的浏览器。

单开一个页面来讲这个其实是以为会有很多内容，但实际`websocket`只是提供了一个简单的api，用于连接、发送消息、接收消息。

因此这里直接贴出简单的使用代码，附带少量的问题讲解(比如共用端口的冲突问题)

## 服务器端
这里使用`express`框架，引入`ws`模块，用于创建`websocket`服务器。
引入`http`模块，用于创建`http`服务器。

``` js
const express = require('express');
const ws = require('ws');
const http = require('http'); // 引入 Node 原生 HTTP 模块

const app = express();
const server = http.createServer(app);

// const socket = new ws.Server({ port: 8000 });
// WebSocket 挂载到总服务器上（复用 8000 端口）
const wss = new ws.Server({ server }); // 关键：不传 port，传 server 实例
const clients = [];
wss.on('connection', (socket) => {
    socket.send('WebSocket 连接成功（共用端口版）！');
    clients.push({ socket: socket });
    socket.on('message', (message) => {
        console.log('收到消息:' + message);
        socket.send('收到收到哈哈');
        clients.forEach((client) => {
            if (client.socket.readyState == 1) {// client.socket.readyState == ws.OPEN也一样，表示检查是否连接中
                client.socket.send(String(message)); // 群发，对话，记得转字符串
            }
        })
    });
    socket.on('close', () => {
        console.log('连接已关闭');
    })
});

app.all('/server', (request, response) => {
    //设置响应头，允许跨域
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');
    // 设置对象响应数据
    const data = {
        name: 'needjson'
    }
    // json将对象转字符串
    let str = JSON.stringify(data);
    // 设置响应体，发送数据只能为字符串类型
    response.send(str);
});

// app.listen(8000, () => {
server.listen(8000, () => {
    console.log('服务已经启动,8000端口监听中...');
})
```
### websocket的使用
从上面的代码可以看到，websocket的使用非常简单，只需要引入`ws`模块，创建一个`ws.Server`实例即可。
``` js
const ws = require('ws');
...
const wss = new ws.Server({ server });
```

后续则是监听`connection`事件，当有客户端连接时，会触发`connection`事件，参数为`socket`对象。这里的参数`socket`对象，是**服务器端**的与客户端连接的**实例**，包含了客户端的连接相关的信息（如客户端 IP、连接状态）。可以使用`socket`对象来发送消息、接收消息、关闭连接等。
``` js
wss.on('connection', (socket) => {...});
```

这里，我们监听了`message`事件，当客户端发送消息被(代表当前客户端连接的)**服务器端的实例**接收到时，会触发`message`事件，参数为`message`。
``` js
socket.on('message', (message) => {...});
```

同样的,就是服务器端监听了`close`事件，当客户端关闭连接时，会触发`close`事件。
``` js
socket.on('close', () => {...});
```

发送消息给客户端。
``` js
socket.send()
```
到这里，我们已经知道了`websocket`的基本使用，以及一些基本的事件监听和方法。更多的内容，可以参考[这里](https://www.runoob.com/html/html5-websocket.html)。

总结一下websocket的基本使用：
- 引入`ws`模块，创建一个`ws.Server`实例。
- 服务**器**实例监听`connection`事件，参数为`socket`对象，获取了(代表当前客户端连接的)服务**端**实例。
- 服务**端**实例监听`message`事件，`close`事件。
- 服务**端**实例可使用`send()`方法，发送消息给客户端。



#### <span style="color: green;">共用端口的冲突</span>
可以看到服务器监听`8000`端口，`websocket`也是监听`8000`端口。

那为什么不会冲突？其实已经可以关注到，这里为了共用端口，代码的写法是需要注意的，如果直接这么写是会出现冲突的：
``` js
const express = require('express');
const ws = require('ws');

const app = express();
const socket = new ws.Server({ port: 8000 });

app.listen(8000, () => {
    console.log('服务已经启动,8000端口监听中...');
})
```
因为这么写，会导致`http`服务器和`websocket`服务器都监听`8000`端口，两台服务器在监听同一个端口，是会冲突的。

[上面](#服务器端)的服务器引入了`http`去创建，如果只是`express`框架，其实直接`app.listen()`就可以了；(<span style="color: green;">app.listen(3000) 其实是 http.createServer(app).listen(3000) 的简化写法</span>)

其实这里<span style="color: green;">**用`http`就是为了创建总服务器，它能够分辨出`http`请求和`websocket`请求。**</span>(`websocket`请求是`http`请求的一种升级，只是升级了协议，其他都是一样的。会在请求头里携带`Upgrade: websocket`)

<span style="color: green;">**对于`http`请求，交给`Express`服务器处理，对于`websocket`请求，交给`websocket`服务器处理。**</span>

本质是：ws.Server相当于 “挂在总服务器上的一个插件”，而非独立占用端口。

## 客户端
前端使用`websocket`连接服务器端，非常简单，这里直接贴代码；
``` js
const socket = new WebSocket("ws://localhost:8000");
socket.onopen = function (e) {
    console.log('连接打开');
}
socket.onmessage = function (e) {
    console.log('收到服务端信息:' + e.data);
}
socket.onclose = function (e) {
    console.log('连接关闭');
}

function sendMes() {
    socket.send('hello,能收到吗？');
}
```
- 创建一个`WebSocket`实例，参数为`ws://localhost:8000`，这是连接服务器端的地址。(**ws开头很重要，这是协议**)
- 监听`open`事件，当连接打开时触发。
- 监听`message`事件，当收到服务端消息时触发。(**消息内容存放在`e.data`中**)
- 监听`close`事件，当连接关闭时触发。
- 创建函数`sendMes`，用于发送消息给服务端。

# socket.io的迁移使用

在项目开发完毕后，发现`socket.io`基于`websocket`简化，提供了很多方便的功能。[这里](https://socketio.node.org.cn/docs/v4/)是`socket.io`的文档，可以参考学习。

在
