# 一些有意思的小问题

项目的讲解已经结束，这里是后续做优化，已经回顾之前开发过程遇到的一些问题。

## canvas大小与移动端适配

会议白板项目是绘制、通信的项目，那么对于坐标其实是很敏感的。canvas的特性要求我们为它输入的width和height其实也是它的分辨率，绘制时需要坐标，如果对canvas做简单的缩放，那么坐标就会失效。举个简单的例子，如果缩小到80%，那么你在canvas画布坐标(100,100)上绘制时，实际绘制的位置就是(80,80)，这会导致看起来绘制的线段出现在鼠标位置的左上部，没有“画笔”的实际效果。

解决的思路也很简单，可以给定宽度和高度，给定比例进行控制，比如宽高2:1，白板给分辨率1600,800，宽高设置100%，100%，代码中获取媒体屏幕宽高，计算与实际分辨率1600,800的比例，然后在缩放时，根据缩放比例，将canvas的width和height除以缩放比例，就可以实现移动端适配。(可以利用具象的例子去思考问题，比如刚刚到100->80，如何计算坐标让绘制内容能显示在正确的鼠标位置下，其实就可以反乘回来，100->80是因为缩小到80%，你在(100,100)绘制，白板原本也想在(100,100)为你绘制内容，但是因为缩放到80%，你看起来是屏幕的(80,80)，那么就是需要你去考虑缩放了80%后，外层的(100,100)到底是原本白板的哪个位置，答案是100*5/4，也就是(125,125)，需要按比例提交给白板才能够得到正确的画面内容)

当然我到开发完毕才想到这个问题，之前没有考虑到移动端的适配。而坐标已经涉及太多功能，因此后续不再考虑做这个缩放比例的计算，直接采用了一个简单的方案，我对外层设置了百分比的max-width和max-height，设置了对应比例，然后对白板提供固定的分辨率，也不做缩放，只在容器上添加overflow: auto;通过滚动条让小屏幕用户能看到内容，从而实现相对粗糙的移动端适配。

## 撤销美化的重构


## socket.io的迁移使用
项目开发完成后，需要考虑优化方面的功能。其中一项就是websocket弱网状态下的断线重连等问题，综合考虑下直接迁移为`socket.io`。下面可以来看看迁移的改动对比，也能从中学习socket.io的使用。

## 一、前端改动对比

### 1. 导入依赖

**原生WebSocket**（无需额外导入）
```javascript
// 直接使用浏览器原生API
```

**Socket.IO**
```javascript
import { io } from 'socket.io-client';
```

---

### 2. 建立连接

**原生WebSocket**
```javascript
// 使用传入的roomCode建立WebSocket连接
console.log(`与会议室${this.roomCode}建立WebSocket连接`);
this.socket = new WebSocket(`ws://192.168.2.9:8080?roomCode=${this.roomCode}`);

this.socket.onopen = () => {
  console.log(`与会议室${this.roomCode}的WebSocket连接成功，readyState: ${this.socket.readyState}`);
  this.sendWebSocketMessage('updateNickname', { nickname: this.nickname });
};
```

**Socket.IO**
```javascript
console.log(`与会议室${this.roomCode}建立Socket.IO连接`);
this.socket = io('http://192.168.2.9:8080', {
  query: { roomCode: this.roomCode },
  transports: ['websocket', 'polling'],
  reconnection: true,           // 启用自动重连
  reconnectionDelay: 1000,      // 重连延迟1秒
  reconnectionDelayMax: 5000,   // 最大重连延迟5秒
  reconnectionAttempts: Infinity // 无限次重连
});

this.socket.on('connect', () => {
  console.log(`与会议室${this.roomCode}的Socket.IO连接成功`);
  this.sendWebSocketMessage('updateNickname', { nickname: this.nickname });
});
```

**主要区别：**
- 协议从 `ws://` 改为 `http://`（Socket.IO内部处理协议切换）
- 参数通过 `query` 对象传递，而不是URL参数
- 新增重连配置选项
- 事件名从 `onopen` 改为 `connect`

---

### 3. 消息监听

**原生WebSocket**
```javascript
this.socket.onmessage = (event) => {
  try {
    if (event.data instanceof ArrayBuffer) {
      // 处理二进制数据
      this.playAudioData(new Int16Array(event.data));
      return;
    }
    
    const data = JSON.parse(event.data);
    if (data.type === 'canvasState') {
      // 处理画布状态
      this.elements = data.data;
      this.redrawCanvas();
    } else if (data.type === 'draw') {
      // 处理绘制
      this.elements.push(data.data);
      this.redrawCanvas();
    } else if (data.type === 'error') {
      console.error(`WebSocket错误: ${data.message}`);
    }
  } catch (error) {
    console.error(`处理WebSocket消息时出错: ${error}`);
  }
};
```

**Socket.IO**
```javascript
this.socket.on('canvasState', (data) => {
  console.log(`收到canvasState消息，元素数量: ${data.length}`);
  this.elements = data;
  this.redrawCanvas();
});

this.socket.on('draw', (data) => {
  console.log(`收到draw消息`);
  this.elements.push(data);
  this.redrawCanvas();
});

this.socket.on('audio', (data) => {
  console.log(`收到音频数据，长度: ${data.byteLength}`);
  this.playAudioData(new Int16Array(data));
});
```

**主要区别：**
- 不再需要手动解析JSON，Socket.IO自动处理
- 不再需要判断是否是二进制数据，分开监听不同事件
- 直接使用 `socket.on('事件名', callback)` 监听，更清晰直观
- 每个事件独立处理，代码结构更清晰

---

### 4. 消息发送

**原生WebSocket**
```javascript
sendWebSocketMessage(type, data) {
  if (this.socket && this.socket.readyState === WebSocket.OPEN) {
    console.log(`Sending WebSocket message: ${type}, data length: ${JSON.stringify(data).length}`);
    this.socket.send(JSON.stringify({ type, data }));
  } else {
    console.error('WebSocket not open, readyState:', this.socket ? this.socket.readyState : 'null');
  }
}

// 发送音频数据
this.socket.send(mergedData.buffer);
```

**Socket.IO**
```javascript
sendWebSocketMessage(type, data) {
  if (this.socket && this.socket.connected) {
    console.log(`Sending Socket.IO message: ${type}`);
    this.socket.emit(type, data);
  } else {
    console.error('Socket.IO not connected');
  }
}

// 发送音频数据
this.socket.emit('audio', mergedData.buffer);
```

**主要区别：**
- 使用 `emit()` 替代 `send()`
- 不再需要手动JSON序列化，Socket.IO自动处理
- 连接状态检查从 `readyState === WebSocket.OPEN` 改为 `socket.connected`
- 二进制数据通过专用事件发送，更清晰

---

### 5. 连接状态监听

**原生WebSocket**
```javascript
this.socket.onclose = () => {
  console.log(`WebSocket 已断开连接，会议室: ${this.roomCode}`);
};

this.socket.onerror = (error) => {
  console.error(`WebSocket 错误: ${error}`);
};
```

**Socket.IO**
```javascript
this.socket.on('disconnect', (reason) => {
  console.log(`Socket.IO 已断开连接，原因: ${reason}`);
  if (reason === 'io server disconnect') {
    console.log('服务器主动断开连接，需要手动重连');
  }
});

this.socket.on('connect_error', (error) => {
  console.error(`Socket.IO 连接错误: ${error}`);
});

this.socket.on('reconnect', (attemptNumber) => {
  console.log(`Socket.IO 重连成功，尝试次数: ${attemptNumber}`);
});

this.socket.on('reconnect_error', (error) => {
  console.error(`Socket.IO 重连失败: ${error}`);
});

this.socket.on('reconnect_failed', () => {
  console.error('Socket.IO 重连失败');
});
```

**主要区别：**
- `onclose` 改为 `disconnect`
- 新增重连相关事件监听
- 提供更详细的连接错误信息

---

### 6. 关闭连接

**原生WebSocket**
```javascript
closeWebSocket() {
  if (this.socket) {
    try {
      this.socket.close(1000, 'User left meeting');
      console.log('WebSocket connection closed');
    } catch (error) {
      console.error('Error closing WebSocket connection:', error);
    }
  }
}
```

**Socket.IO**
```javascript
closeWebSocket() {
  if (this.socket) {
    try {
      this.socket.disconnect();
      console.log('Socket.IO connection closed');
    } catch (error) {
      console.error('Error closing Socket.IO connection:', error);
    }
  }
}
```

---

## 二、后端改动对比

### 1. 导入依赖

**原生WebSocket**
```javascript
const WebSocket = require('ws');
```

**Socket.IO**
```javascript
const { Server } = require('socket.io');
```

---

### 2. 初始化服务器

**原生WebSocket**
```javascript
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomCode = url.searchParams.get('roomCode');
  if (!roomCode) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req, roomCode);
  });
});
```

**Socket.IO**
```javascript
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});
```

**主要区别：**
- 不再需要手动处理 `upgrade` 事件
- 内置CORS支持，配置更简单
- 直接通过 `query` 获取参数

---

### 3. 连接处理

**原生WebSocket**
```javascript
wss.on('connection', (ws, req, roomCode) => {
  ws.id = `socket_${Date.now()}`;
  ws.roomCode = roomCode;
  meetingRoomManager.joinRoom(roomCode, ws.id);
  clients.push(ws);

  ws.send(JSON.stringify({
    type: 'canvasState',
    data: meetingRoomManager.getCanvasState(roomCode)
  }));
  ws.send(JSON.stringify({
    type: 'socketId',
    data: ws.id
  }));

  // ... 消息处理
});
```

**Socket.IO**
```javascript
io.on('connection', (socket) => {
  const roomCode = socket.handshake.query.roomCode;
  
  if (!roomCode) {
    socket.disconnect();
    return;
  }

  socket.roomCode = roomCode;
  meetingRoomManager.joinRoom(roomCode, socket.id);
  
  socket.join(roomCode); // 加入Socket.IO房间

  socket.emit('canvasState', meetingRoomManager.getCanvasState(roomCode));
  socket.emit('socketId', socket.id);

  // ... 消息处理
});
```

**主要区别：**
- 参数通过 `socket.handshake.query` 获取
- Socket.ID自动生成，无需手动创建
- 使用 `socket.join(roomCode)` 加入房间（Socket.IO内置房间功能）
- 发送消息使用 `socket.emit()`，无需手动JSON序列化

---

### 4. 消息监听

**原生WebSocket**
```javascript
ws.on('message', (data, isBinary) => {
  try {
    if (isBinary) {
      if (speechService?.isConnected) {
        speechService.sendAudio(data);
      }
      meetingRoomManager.broadcastToRoom(roomCode, data, ws.id);
      return;
    }
    
    const parsed = JSON.parse(data.toString());
    if (parsed.type === 'draw') {
      const s = meetingRoomManager.getCanvasState(roomCode);
      s.push(parsed.data);
      meetingRoomManager.updateCanvasState(roomCode, s);
      meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
        type: 'draw',
        data: parsed.data
      }), ws.id);
    } else if (parsed.type === 'text') {
      // ...
    }
  } catch (e) {
    // ...
  }
});
```

**Socket.IO**
```javascript
socket.on('draw', (data) => {
  const s = meetingRoomManager.getCanvasState(roomCode);
  s.push(data);
  meetingRoomManager.updateCanvasState(roomCode, s);
  socket.to(roomCode).emit('draw', data);
});

socket.on('text', (data) => {
  const s = meetingRoomManager.getCanvasState(roomCode);
  s.push(data);
  meetingRoomManager.updateCanvasState(roomCode, s);
  socket.to(roomCode).emit('text', data);
});

socket.on('audio', (data) => {
  if (speechService?.isConnected) {
    speechService.sendAudio(data);
  }
  socket.to(roomCode).emit('audio', data);
});
```

**主要区别：**
- 不再需要判断是否是二进制数据
- 不再需要手动JSON解析
- 每个事件独立监听，代码更清晰
- Socket.IO自动处理数据类型

---

### 5. 房间广播

**原生WebSocket**
```javascript
// 需要自己实现broadcastToRoom方法
broadcastToRoom(roomCode, data, excludeId) {
  const room = this.rooms.get(roomCode);
  if (!room) return;
  room.members.forEach(m => {
    if (m.socketId !== excludeId) {
      const ws = clients.find(c => c.id === m.socketId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  });
}

// 使用
meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
  type: 'draw',
  data: parsed.data
}), ws.id);
```

**Socket.IO**
```javascript
// Socket.IO内置房间功能，直接使用
socket.to(roomCode).emit('draw', data);

// 广播给所有人（包括发送者）
io.to(roomCode).emit('transcriptionResult', { data: t, speaker: nick });
```

**主要区别：**
- 不需要自己维护clients数组
- 不需要自己实现广播逻辑
- `socket.to()` 广播给房间内其他人
- `io.to()` 广播给房间内所有人

---

### 6. 断开连接

**原生WebSocket**
```javascript
ws.on('close', () => {
  speechService?.close();
  meetingRoomManager.leaveRoom(ws.roomCode, ws.id);
  clients = clients.filter(c => c !== ws);
});

ws.on('error', () => {});
```

**Socket.IO**
```javascript
socket.on('disconnect', () => {
  speechService?.close();
  meetingRoomManager.leaveRoom(roomCode, socket.id);
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
});
```

**主要区别：**
- 不再需要手动从clients数组移除
- Socket.IO自动管理连接状态

---

## 三、Socket.IO优势总结

| 功能 | 原生WebSocket | Socket.IO |
|------|--------------|-----------|
| 自动重连 | 需要手动实现 | ✅ 内置支持 |
| 心跳检测 | 需要手动实现 | ✅ 内置支持 |
| 房间管理 | 需要手动实现 | ✅ 内置支持 |
| 广播功能 | 需要手动实现 | ✅ 内置支持 |
| 二进制数据 | 需要手动处理 | ✅ 自动处理 |
| JSON序列化 | 需要手动处理 | ✅ 自动处理 |
| 跨浏览器兼容 | 有限支持 | ✅ 完善支持 |
| 降级策略（长轮询） | 无 | ✅ 支持 |
| CORS配置 | 需要手动处理 | ✅ 内置支持 |

---

## 四、核心API对比速查

### 前端API

| 操作 | 原生WebSocket | Socket.IO |
|------|--------------|-----------|
| 创建连接 | `new WebSocket(url)` | `io(url, options)` |
| 连接成功 | `socket.onopen` | `socket.on('connect')` |
| 断开连接 | `socket.onclose` | `socket.on('disconnect')` |
| 发送消息 | `socket.send(data)` | `socket.emit(event, data)` |
| 监听消息 | `socket.onmessage` | `socket.on(event, callback)` |
| 检查连接 | `socket.readyState === WebSocket.OPEN` | `socket.connected` |
| 关闭连接 | `socket.close()` | `socket.disconnect()` |

### 后端API

| 操作 | 原生WebSocket (ws) | Socket.IO |
|------|-------------------|-----------|
| 创建服务器 | `new WebSocket.Server()` | `new Server(httpServer)` |
| 连接处理 | `wss.on('connection', (ws) => {})` | `io.on('connection', (socket) => {})` |
| 获取参数 | 手动解析URL | `socket.handshake.query` |
| 发送消息 | `ws.send(data)` | `socket.emit(event, data)` |
| 监听消息 | `ws.on('message', (data) => {})` | `socket.on(event, (data) => {})` |
| 加入房间 | 需要手动实现 | `socket.join(room)` |
| 广播消息 | 需要手动实现 | `socket.to(room).emit(event, data)` |
| 全房间广播 | 需要手动实现 | `io.to(room).emit(event, data)` |
| 断开连接 | `ws.on('close', () => {})` | `socket.on('disconnect', () => {})` |
