# 白板项目

基础知识学习介绍完毕，终于到了讲解项目的阶段。

## 项目设计

首先讲一下项目设计，要设计一个会议白板，实现一个即时会议，不需要下载、注册、登录等，总体的框架上只需要一个进入会议的页面(首页)，以及会议室页面。

- 进入会议的页面，则分为创建会议/加入会议两种情况。
  - 创建会议：用户点击创建会议按钮，即可创建会议。（创建会议会自动生成一个会议码，用户可以将会议码分享给其他用户。）
  - 加入会议：用户需要输入会议码，点击加入会议按钮，即可加入会议。

- 会议室页面，则主要围绕会议白板展开；
    - 实时协作白板，支持多人同时绘制
    - 支持画笔、橡皮、文本、矩形、圆形、菱形、箭头等工具
    - 图形美化功能，自动识别和美化手绘图形
    - 语音转写功能，使用讯飞星火 API 实现实时语音转写
    - 会议摘要生成功能，基于白板内容和语音转写结果生成会议摘要
    - 文本输入功能：
      - 支持画布上直接生成文本框
      - 文本框大小调整和位置拖动
      - 文本自动换行，支持垂直排列
      - Enter键或确认按钮确认绘制
    - 会议室自动清理机制，基于最后活动时间清理无人使用的会议室

## 项目实现

围绕项目结构与设计功能，我们划分为以下几个模块进行讲解：
- 首页基础功能(会议创建与加入，请求/操作成功失败的消息提示)
- 会议页基础功能(连接开始会议，断开连接离开会议，会议室自动清理功能)
- 实时协作功能(websocket信息传输实现多人共享)
- 白板功能(绘制与图形美化功能,文本输入功能)
- 语音转写字幕功能
- 会议摘要生成功能

## 首页基础功能

先讲一讲基础功能，即会议创建与加入，请求/操作成功失败的消息提示。

### 首页前端实现

**页面结构与设计**

首页其实就是整个项目的页面展示，后面讲的白板页面其实就是一个`component`组件，由`v-if`指令来控制显示隐藏。因为页面结构组成简单，所以包括请求/操作成功失败的消息提示也只需要用`v-if`指令控制显隐的`div`即可实现；
```js
<!-- 会议室管理界面 -->
<div v-if="!isInMeeting" class="meeting-management">
    ...
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
</div>
<!-- 白板界面 -->
<div v-else class="whiteboard-container">
    ...
</div>
```
**会议基础功能**：

创建会议按钮，直接触发对应方法发送请求，获取会议码，进入会议室；

加入会议按钮，触发对应方法，依靠v-model绑定输入框，获取会议码发送请求，根据请求结果加入会议室/提示错误；<span style="color: green;">**需要注意的是，首页部分并没有真正的加入会议室**</span>，加入会议室开始会议是涉及到`websocket`连接的，项目设计中加入会议室是进入[会议室页面](#会议页前端实现)后才进行的连接操作，首页进行的操作其实只有校验会议室代码是否存在，决定是否进入会议室页面，仅此而已；因此这里发送请求只要发送会议室代码给后台检测一下是否有这个会议室即可。

因为非常简单，只是发送一些请求，所以这里就不贴出代码了。


### 首页后端实现
主要实现以下功能：
- 生成唯一的会议室代码
- 创建会议室
- 加入会议室

**唯一代码与创建会议室**

创建一个会议室管理类，用于管理所有的会议室。每个会议室都有一个唯一的会议室代码，用于标识会议室。

通过`map`来存储所有的会议室，键为会议室代码，值为会议室对象。生成唯一会议室代码时，检测`map`来确保唯一性；创建会议室的api就是调用这个方法，生成一个`code`，然后创建一个会议室对象(包含会议室代码、创建时间、最后活动时间、成员列表、画布状态、图形美化状态)，最后将会议室对象存储到`map`中，返回`code`给前端；
```js
class MeetingRoomManager {
  constructor() {
    this.rooms = new Map();
  }
  generateRoomCode() {
    let code;
    do {
      const length = Math.floor(Math.random() * 3) + 4;
      code = '';
      for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
      }
    } while (this.rooms.has(code));
    return code;
  }
  createRoom() {
    const code = this.generateRoomCode();
    const room = {
      code,
      createdAt: new Date(),
      lastActivityTime: new Date(),
      members: [],
      canvasState: [],
      beautifyState: null
    };
    this.rooms.set(code, room);
    return room;
  }
  getRoom(code) {
    return this.rooms.get(code);
  }
  joinRoom(code, socketId) {
    let room = this.rooms.get(code);
    if (!room || room.members.length === 0) {
      room = {
        code,
        createdAt: new Date(),
        lastActivityTime: new Date(),
        members: [],
        canvasState: [],
        beautifyState: null
      };
      this.rooms.set(code, room);
    }
    const exist = room.members.find(m => m.socketId === socketId);
    if (exist) return room;
    room.members.push({
      id: `user_${Date.now()}`,
      socketId,
      joinedAt: new Date(),
      nickname: `用户${Math.floor(Math.random() * 1000)}`
    });
    return room;
  }
  ...
}

// 创建会议API端点
app.post('/api/create-meeting', (req, res) => {
  try {
    const room = meetingRoomManager.createRoom();
    res.json({ success: true, roomCode: room.code });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
```
**加入会议室**

<span style="color: green;">**需要注意的是，首页部分并没有真正的加入会议室**</span>，加入会议室，开始会议是涉及到`websocket`连接的，项目设计中加入会议室是进入[会议室页面](#会议页前端实现)后才进行的连接操作，首页进行的操作其实只有校验会议室代码是否存在，决定是否进入会议室页面，仅此而已；api接口也只需要从`map`中get一下是否有请求时发送过来的会议室代码即可。

```js
class MeetingRoomManager {
    ...
    // 获取会议室
    getRoom(code) {
        return this.rooms.get(code);
    }
    ...
}

// 加入会议API端点
app.post('/api/join-meeting', (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json({ success: false, error: '缺少roomCode' });
    }
    const room = meetingRoomManager.getRoom(roomCode);
    if (!room) {
      return res.status(404).json({ success: false, error: '会议室不存在' });
    }
    res.json({ success: true, roomCode });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
```

## 会议页基础功能

继续讲会议页的基础功能，主要如下：
- 进入会议室(websocket连接)
- 离开会议室(websocket断开连接)
- 清理无人或长时间无活动的会议室

### 会议页基础功能前端实现
**进入会议室**

之前已经讲过，会议页是一个组件，由`v-if`指令来控制显示隐藏。当用户创建/加入会议室成功(会议室代码存在)，这个组件被显示出来，传入会议室代码作为props，在组件生命周期钩子中添加对应的连接逻辑(创建websocket连接，并做数据处理)
```js
export default {
  name: 'Whiteboard',
  props: {
    roomCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      ...
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.setupWebSocket();
  },
  beforeUnmount() {
    // 组件销毁时关闭 WebSocket 连接
    this.closeWebSocket();
  },
  ...
  methods: {
    setupCanvas() {
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
    },
    setupWebSocket() {
      try {
        // 使用传入的roomCode建立WebSocket连接
        console.log(`与会议室${this.roomCode}建立WebSocket连接`);
        this.socket = new WebSocket(`ws://192.168.118.168:8080?roomCode=${this.roomCode}`);

        this.socket.onopen = () => {
          console.log(`与会议室${this.roomCode}的WebSocket连接成功，readyState: ${this.socket.readyState}`);
          // 发送昵称信息到服务器
          this.sendWebSocketMessage('更新昵称', { nickname: this.nickname });
        };

        this.socket.onmessage = (event) => {
          ...数据处理逻辑
        };
        this.socket.onclose = () => {
          console.log(`WebSocket 已断开连接，会议室: ${this.roomCode}`);
        };

        this.socket.onerror = (error) => {
          console.error(`WebSocket 错误: ${error}`);
        };
      } catch (error) {
        console.error(`设置WebSocket连接时出错: ${error}`);
      }
    }
  }
}
```

**离开会议室，为清理会议室提供支持**

同理，离开会议室时需要断开连接，我们提供了离开会议的按钮，同时在组件的生命周期钩子中添加对应的断开连接逻辑(这个在[上面](#会议页前端实现)已经展示过)，这样的操作能够即使用户不点击离开会议按钮，也能及时断开与服务器的连接(这对于多人会议的消息传递，以及清理会议室的功能很重要)。

当然这里因为创建/加入会议都在父组件中实现，并且希望白板功能划分明确，离开会议的功能在父组件中实现，也就是首页，但是因为这是在进入会议后(进入会议页)的功能，又涉及到`websocket`连接，所以还是写到这里：

下面是父组件离开会议的代码：直接调整信号关闭组件，组件的卸载生命周期钩子会关闭websocket连接。
```js
leaveMeeting() {
  this.isInMeeting = false
  this.currentRoomCode = ''
  this.roomCode = ''
  console.log('离开会议成功');
}
```


### 会议页基础功能后端实现

下面来看代码，websocket连接直接挂钩的就是`进入会议室`和`离开会议室`功能；

**进入会议室**

```js
// WebSocket
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
  ...
});
```

这里我们监听upgrade事件；和之前直接监听connection事件不同，这是因为我们需要在握手前验证参数(会议室代码roomCode)是否存在，若不存在，`socket.destroy();`销毁连接。因此我们会需要一个握手前的“生命周期钩子”upgrade事件，来实现这里的校验；
``` js
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomCode = url.searchParams.get('roomCode');
  if (!roomCode) {
    socket.destroy();
    return;
  }
  ...
});
```
校验逻辑处理完毕了，那么接下来就是握手，仍然是使用监听connection事件来实现，**用handleUpgrade方法触发connection事件**。
``` js
wss.handleUpgrade(req, socket, head, (ws) => {
  wss.emit('connection', ws, req, roomCode);
});
```
<span style="color:green;">**简而言之，只是采用`upgrade`事件在握手前做一些校验，如果校验成功，才用`handleUpgrade`方法去触发`connection`事件；失败就销毁连接。**</span>

继续下面的内容，握手连接成功后，需要给每个用户(socket)分配id，这便于后续的消息传递。
``` js
// 为socket分配唯一ID
ws.id = `socket_${Date.now()}`;
ws.roomCode = roomCode;
meetingRoomManager.joinRoom(roomCode, ws.id);
clients.push(ws);
```
加入会议室的joinRoom之前没有展示，但是也很简单，逻辑上就是需要的话(无房间/旧空房间)新建房间，设置房间属性(创建时间，成员列表等)；创建成员，设置成员属性(昵称，加入时间等)，添加进房间成员列表，最后返回房间，很简单的常规代码，这里就不展示了；

可以看到按照上面的流程，我们就完成了**进入会议室**的功能；这里顺便讲一讲进入会议室后顺带会做的内容：**进入会议室后需要获取当前的白板内容，保障后进入会议的成员能够看到之前的白板内容**(至于这里用来发送传递的画布状态等信息是怎么处理的，在[后面](#)我们再讲解)，同时，**刚刚分配的socketId也需要发送给客户端**，方便后续的消息传递。
``` js
ws.send(JSON.stringify({
  type: 'canvasState',
  data: meetingRoomManager.getCanvasState(roomCode)
}));
ws.send(JSON.stringify({
  type: 'socketId',
  data: ws.id
}));
```

**离开与清空会议室**

最后我们来讲解一下离开会议室的功能：这部分功能很简单，其实就是前端关闭websocket连接，后端也需要清理对应的连接内容，包括语音，调用leaveRoom(减少房间成员数，移除成员，更新房间属性，为0则移除该房间)，和joinRoom一样很简单常规，这里就不展示了。
```js
wss.on('connection', (ws, req, roomCode) => {
  ...
  ws.on('close', () => {
    speechService?.close();
    meetingRoomManager.leaveRoom(ws.roomCode, ws.id);
    clients = clients.filter(c => c !== ws);
  });
  ws.on('error', () => { });
});
```
关于移除会议室，还做了一个兜底处理：
```js
class MeetingRoomManager {
  ...
  cleanupEmptyRooms() {
    const now = new Date();
    for (const [code, r] of this.rooms.entries()) {
      if (r.members.length === 0 || now - r.lastActivityTime > 10 * 60 * 1000) {
        this.rooms.delete(code);
      }
    }
  }
}
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务启动: http://192.168.248.168:${PORT}`);
  setInterval(() => meetingRoomManager.cleanupEmptyRooms(), 5 * 60 * 1000);
});
```
这个方法在服务端启动的位置定时调用，每5分钟调用一次。检查所有房间，如果房间成员数为0，或者最后活动时间超过10分钟，我们就移除该房间。这样能够及时清理空房间，避免资源浪费。

## 白板功能
接下来就是项目核心的白板功能了，这部分有非常丰富的内容，包括：
- 实时协作白板功能
  - 基础功能：画笔，橡皮，文本，形状，颜色，大小等
  - 通过websocket实现共享白板
- 美化白板操作
  - 手绘图形(矩形，圆，菱形，箭头)识别美化，以及对应的撤回实现
  - websocket同步美化与撤回美化

## 语音转写与会议摘要功能
这部分都是结合ai大模型实现，会讲解如何调用大模型，以及传递给大模型前的各种参数处理操作；
- 语音转写功能
  - 获取用户语音输入，处理音频数据
  - 调用大模型进行语音转写，处理返回文本结果
  - 实现字幕功能
- 会议摘要功能
  - 从会议中提取重要信息，生成会议摘要
  - 调用大模型进行会议摘要，处理返回文本结果
  - 可视化展示







### 实时协作白板功能
