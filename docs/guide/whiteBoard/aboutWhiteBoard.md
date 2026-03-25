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

**（结合ai讲解学习）**

这里我们监听upgrade事件；

给每个用户(socket)分配id，这便于后续的消息传递。
``` js
// 为socket分配唯一ID
ws.id = `socket_${Date.now()}`;
```
加入会议室的joinRoom之前没有展示，但是也很简单，逻辑上就是需要的话(无房间/旧空房间)新建房间，设置房间属性(创建时间，成员列表等)；创建成员，设置成员属性(昵称，加入时间等)，添加进房间成员列表，最后返回房间，很简单的常规代码，这里就不展示了；

可以看到按照上面的流程，我们就完成了**进入会议室**的功能；这里顺便讲一讲进入会议室后顺带会做的内容：**进入会议室后需要获取当前的白板内容，保障后进入会议的成员能够看到之前的白板内容**(至于这里用来发送传递的画布状态等信息是怎么处理的，在[后面](#)我们再讲解)，同时，刚刚分配的socketId也需要发送给客户端，方便后续的消息传递。

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










```javascript
// 会议室管理
class MeetingRoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // 生成4-6位随机数字作为会议室快捷号
  generateRoomCode() {
    let code;
    do {
      // 生成4-6位随机数字
      const length = Math.floor(Math.random() * 3) + 4; // 4-6位
      code = '';
      for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
      }
    } while (this.rooms.has(code)); // 确保唯一性
    return code;
  }

  // 创建会议室
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

  // 加入会议室
  joinRoom(code, socketId) {
    let room = this.rooms.get(code);

    // 检查会议室是否存在且为空
    if (room && room.members.length === 0) {
      // 如果会议室存在但为空，创建一个新的空会议室
      console.log(`Meeting room ${code} is empty, creating new one`);
      room = {
        code,
        createdAt: new Date(),
        lastActivityTime: new Date(),
        members: [],
        canvasState: [],
        beautifyState: null
      };
      this.rooms.set(code, room);
    } else if (!room) {
      // 如果会议室不存在，创建一个新的
      room = {
        code,
        createdAt: new Date(),
        lastActivityTime: new Date(),
        members: [],
        canvasState: [],
        beautifyState: null
      };
      this.rooms.set(code, room);
      console.log(`Meeting room ${code} created for new join`);
    } else {
      // 更新最后活动时间
      room.lastActivityTime = new Date();
    }

    // 检查是否已加入
    const existingMember = room.members.find(member => member.socketId === socketId);
    if (existingMember) {
      return room;
    }

    // 添加新成员
    const member = {
      id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      socketId,
      joinedAt: new Date(),
      nickname: `用户${Math.floor(Math.random() * 1000)}`
    };
    room.members.push(member);
    return room;
  }

  // 离开会议室
  leaveRoom(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) {
      console.log(`Room ${code} not found`);
      return;
    }

    console.log(`Leaving room ${code}, current members: ${room.members.length}`);
    room.members = room.members.filter(member => member.socketId !== socketId);
    console.log(`After leaving, members left: ${room.members.length}`);

    // 如果会议室为空，删除会议室
    if (room.members.length === 0) {
      console.log(`Room ${code} is empty, deleting`);
      this.rooms.delete(code);
      console.log(`Meeting room ${code} deleted as all members left`);
    }
  }

  // 定期检查并清理无人或长时间无活动的会议室
  cleanupEmptyRooms() {
    const now = new Date();
    const timeout = 10 * 60 * 1000; // 10分钟超时
    let deletedRooms = 0;

    for (const [code, room] of this.rooms.entries()) {
      // 检查会议室是否为空或长时间无活动
      const isEmpty = room.members.length === 0;
      const isInactive = now - room.lastActivityTime > timeout;

      if (isEmpty || isInactive) {
        console.log(`Cleaning up room ${code} - ${isEmpty ? 'empty' : 'inactive'}`);
        this.rooms.delete(code);
        deletedRooms++;
      }
    }

    if (deletedRooms > 0) {
      console.log(`Cleaned up ${deletedRooms} rooms`);
    }
  }
}
```

**API 端点**：
**离开会议**：

```javascript
// 离开会议API端点
app.post('/api/leave-meeting', (req, res) => {
  try {
    const { roomCode, socketId } = req.body;

    if (!roomCode || !socketId) {
      return res.status(400).json({ success: false, error: 'Room code and socketId are required' });
    }

    // 从会议室中移除用户
    meetingRoomManager.leaveRoom(roomCode, socketId);

    res.json({ success: true, message: 'Left meeting successfully' });
  } catch (error) {
    console.error('Error leaving meeting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 会议室自动清理功能

为了避免资源浪费，系统实现了会议室自动清理机制：

**实现原理**：

- 定期检查所有会议室的状态
- 清理条件：
  1. 会议室为空（没有成员）
  2. 会议室长时间无活动（超过10分钟）
- 清理频率：每5分钟执行一次

**核心代码**：

```javascript
// 定期检查并清理无人或长时间无活动的会议室
cleanupEmptyRooms() {
  const now = new Date();
  const timeout = 10 * 60 * 1000; // 10分钟超时
  let deletedRooms = 0;

  for (const [code, room] of this.rooms.entries()) {
    // 检查会议室是否为空或长时间无活动
    const isEmpty = room.members.length === 0;
    const isInactive = now - room.lastActivityTime > timeout;

    if (isEmpty || isInactive) {
      console.log(`Cleaning up room ${code} - ${isEmpty ? 'empty' : 'inactive'}`);
      this.rooms.delete(code);
      deletedRooms++;
    }
  }

  if (deletedRooms > 0) {
    console.log(`Cleaned up ${deletedRooms} rooms`);
  }
}

// 启动定时清理任务
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // 每5分钟检查并清理一次无人的会议室
  setInterval(() => {
    meetingRoomManager.cleanupEmptyRooms();
  }, 5 * 60 * 1000);
  console.log('Empty room cleanup scheduled every 5 minutes');
});
```

#### 技术要点

1. **会议室代码生成**：
   - 生成4-6位随机数字作为会议室代码
   - 确保代码的唯一性，避免重复
2. **会议室状态管理**：
   - 使用 Map 数据结构存储会议室信息
   - 每个会议室包含成员列表、画布状态等信息
   - 跟踪会议室的最后活动时间，用于判断是否需要清理
3. **WebSocket 连接**：
   - 当用户加入会议时，建立 WebSocket 连接
   - 连接时发送当前画布状态给新用户
   - 断开连接时从会议室中移除用户
4. **错误处理**：
   - 前端处理网络错误和服务器返回的错误
   - 后端处理各种异常情况，确保系统稳定运行
5. **用户体验**：
   - 加入和创建会议时显示成功或错误提示
   - 会议创建成功后自动显示会议代码
   - 提示信息自动消失，不干扰用户操作

### 实时协作白板功能
