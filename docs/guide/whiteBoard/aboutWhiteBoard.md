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

## 首页前端实现

### 页面结构与设计

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
### 会议基础功能

创建会议按钮，直接触发对应方法发送请求，获取会议码，进入会议室；

加入会议按钮，触发对应方法，依靠v-model绑定输入框，获取会议码发送请求，根据请求结果加入会议室/提示错误；<span style="color: green;">**需要注意的是，首页部分并没有真正的加入会议室**</span>，加入会议室开始会议是涉及到`websocket`连接的，项目设计中加入会议室是进入[会议室页面](#会议页前端实现)后才进行的连接操作，首页进行的操作其实只有校验会议室代码是否存在，决定是否进入会议室页面，仅此而已；因此这里发送请求只要发送会议室代码给后台检测一下是否有这个会议室即可。

因为非常简单，只是发送一些请求，所以这里就不贴出代码了。


## 首页后端实现
主要实现以下功能：
- 生成唯一的会议室代码
- 创建会议室
- 加入会议室

### 唯一代码与创建会议室

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
### 加入会议室

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

## 会议页基础功能前端实现
### 进入会议室

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

### 离开会议室，为清理会议室提供支持

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


## 会议页基础功能后端实现

下面来看代码，websocket连接直接挂钩的就是`进入会议室`和`离开会议室`功能；

### 进入会议室

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

### 离开与清空会议室

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
  console.log(`✅ 服务启动: http://192.168.153.168:${PORT}`);
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

让我们一点一点讲解：

## 实时协作白板基础功能

这部分设计的功能众多，代码也比较多，因此对于每个部分功能分开讲解，分开展示，以便理解和阅读。这部分功能也是直接交由前端实现，因此贴出的代码也都是前端代码。
### 画笔与橡皮功能
其实画笔功能在[之前的文档](./aboutCanvas#简单的白板实现)已经讲过，不过这里采取的是另一种分段的写法；对于简单的白板绘制确实是那样会更好，但因为我们的项目需求对于每一笔画都需要记录，甚至需要操作(比如美化、撤销等)，因此这里采取分段记录，即起始坐标，结束坐标都做记录并绘制；至于为什么橡皮功能也一起讲解，其实是因为<span style="color:green;">**橡皮功能的实现完全可以用画笔的逻辑来完成，橡皮可以看作是白色的画笔，逻辑复用就能够起到相同的效果**</span>；

首先是常规的canvas画板，监听四个事件处理画笔绘制：同时白板需要工具栏，用于切换不同的画笔工具。
```js
<canvas
  ref="canvas"
  :width="width"
  :height="height"
  @mousedown="startDrawing"
  @mousemove="draw"
  @mouseup="stopDrawing"
  @mouseleave="stopDrawing"
></canvas>
<div class="toolbar">
  <button @click="setTool('pen')" :class="{ active: currentTool === 'pen' }">画笔</button>
  <button @click="setTool('eraser')" :class="{ active: currentTool === 'eraser' }">橡皮</button>
  <button @click="setTool('text')" :class="{ active: currentTool === 'text' }">文本</button>
  <button @click="setTool('mouse')" :class="{ active: currentTool === 'mouse' }">鼠标</button>
  <button @click="setTool('rectangle')" :class="{ active: currentTool === 'rectangle' }">矩形</button>
    <button @click="setTool('circle')" :class="{ active: currentTool === 'circle' }">圆形</button>
    <button @click="setTool('diamond')" :class="{ active: currentTool === 'diamond' }">菱形</button>
    <button @click="setTool('arrow')" :class="{ active: currentTool === 'arrow' }">箭头</button>
    <input type="color" v-model="color" />
    <span>笔画粗细:</span>
    <input type="range" v-model="lineWidth" min="1" max="10" />
    <span>{{ lineWidth }}px</span>
    <span>字体大小:</span>
    <input type="range" v-model="fontSize" min="8" max="48" />
    <span>{{ fontSize }}px</span>
    <button @click="clearCanvas">清空</button>
    <button @click="exportCanvas">导出</button>
    <button @click="toggleSpeechRecognition" :class="{ active: isRecording }">
      {{ isRecording ? '停止录音' : '开始录音' }}
    </button>
    <button @click="beautifyShape">美化图形</button>
    <button @click="undoBeautify" :disabled="!originalElements">撤销美化</button>
    <button @click="generateSummary">生成摘要</button>
    <button @click="printTranscriptionHistory">打印发言内容</button>
  <div class="nickname-container">
    <span v-if="!showNicknameInput">{{ nickname }} <button @click="showNicknameInput = true">修改</button></span>
    <div v-else class="nickname-input">
      <input v-model="nickname" @keyup.enter="saveNickname" @blur="saveNickname" placeholder="输入昵称" />
      <button @click="saveNickname">保存</button>
      <button @click="showNicknameInput = false">取消</button>
    </div>
  </div>
</div>
```
下面是与实现功能相关的方法：

`setTool`方法：是用于标记当前使用的工具，比如画笔，橡皮，文本等，根据选择的工具不同，白板上的处理逻辑也需要相应的变化；

`startDrawing`方法：可以看到我们<span style="color:green;">记录了起始坐标，结束坐标，并且将绘制图形的点都收集起来</span>，这是为了后续的[识别美化功能](#)的实现；在上面的绑定事件中，可以看到该方法绑定监听了`mousedown`事件，这意味着不只是绘制动作，其他在画板上点击开始的动作都会经过这个方法，这也是决定后续执行逻辑的关键，所以也能看到方法内执行一些判断；

可以看到判断确认是我们画笔/橡皮动作时，除了常规的设置一个绘制信号以外，还<span style="color:green">为每一笔分配一个唯一的strokeId，使用socketId作为前缀</span>，这么做也是为了后续识别笔画进行美化，<span style="color:green">**请注意这里的一笔是指一次绘制完成，即一次鼠标按下到抬起，不是lineTo的意思；同时这里使用独立的socketId来生成唯一的strokeId，(socket和stroke很像但是不一样哈)，是为了区分多个用户各自绘制的内容**</span>

<a id="flag"></a>
`draw`方法：根据开始坐标和当前坐标绘制线段，然后和`startDrawing`方法类似更新坐标(更新起始坐标实现连续绘制)，记录绘制图形点；<span style="color:green;">将绘制内容保存进入`elements`数组，这是后面也经常用到的数组，用于记录画板上绘制的所有内容，可以支持画板内容全部重绘，这是很重要的功能，能够支持很多操作([后面](#图形绘制功能)会讲到)</span>

`stopDrawing`方法：画笔和橡皮都已经在draw方法中逐段保存，因此这里只需要重置绘制信号，设置为false即可；如果是其他图形可能会需要做重绘处理，就放在下面讲解啦
```js
export default {
  ...,
  methods: {
    setTool(tool) {
      this.currentTool = tool;
      this.isDrawing = false;
      this.isAddingText = false;
    },
    startDrawing(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.startX = e.clientX - rect.left;
      this.startY = e.clientY - rect.top;
      this.lastX = this.startX;
      this.lastY = this.startY;
      
      // 清空绘制点数组，准备收集新图形的点
      this.drawingPoints = [{ x: this.startX, y: this.startY }];
      
      if (this.currentTool === 'text' || this.currentTool === 'mouse') {
        // 检查是否点击了调整手柄
        ......
      } else {
        this.isDrawing = true;
        // 为每一笔分配一个唯一的strokeId，使用socketId作为前缀
        this.strokeId++;
        this.currentStrokeId = `${this.socketId}_${this.strokeId}`;
      }
    },
    draw(e) {
      if (!this.isDrawing && !this.isAddingText) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      // 实时更新结束坐标
      this.lastX = currentX;
      this.lastY = currentY;
      
      if ((this.currentTool === 'text' || this.currentTool === 'mouse') && this.isAddingText) {
        ......
      } else if (this.currentTool === 'pen') {
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        // 保存画笔绘制的内容到elements数组
        const element = {
          type: 'pen',
          startX: this.startX,
          startY: this.startY,
          lastX: currentX,
          lastY: currentY,
          color: this.color,
          lineWidth: this.lineWidth,
          strokeId: this.currentStrokeId
        };
        this.elements.push(element);
        
        // 收集绘制点用于图形识别
        this.drawingPoints.push({ x: currentX, y: currentY });
        
        // 发送到服务器
        this.sendWebSocketMessage('draw', element);
        
        // 更新起点坐标，实现连续绘制
        this.startX = currentX;
        this.startY = currentY;
      } else if (this.currentTool === 'eraser') {
        // 橡皮功能：绘制白色线条覆盖原有内容
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = this.lineWidth * 2; // 橡皮宽度是线条的2倍
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        // 保存橡皮绘制的内容到elements数组
        const element = {
          type: 'eraser',
          startX: this.startX,
          startY: this.startY,
          lastX: currentX,
          lastY: currentY,
          lineWidth: this.lineWidth * 2
        };
        this.elements.push(element);
        
        // 发送到服务器
        this.sendWebSocketMessage('draw', element);
        
        // 更新起点坐标，实现连续擦除
        this.startX = currentX;
        this.startY = currentY;
      } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'diamond' || this.currentTool === 'arrow') {
        ......
      }
    },
    stopDrawing() {
      if (this.isDrawing) {
        if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
          // 画笔和橡皮都已经在draw方法中逐段保存，不需要额外处理
        } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'diamond' || this.currentTool === 'arrow') {
          ......
        }
        this.isDrawing = false;
      } else if (this.isAddingText) {
        ......
      }
    },
    ...
  },
  ...
}
```

### 图形绘制功能
接下来我们来介绍下图形绘制功能，包括矩形、圆形、菱形、箭头：

设计上是用户点击工具栏上的图形图标，然后在画布上绘制对应的图形。画布上点击确定图形开始位置，<span style="color: green;">拖动改变图形大小</span>，最后松开鼠标绘制完成。也就是确认位置，<span style="color: green;">最后预览确认大小</span>，最后绘制完成。

代码层面，工具栏按钮部分已经在[上面代码](#画笔与橡皮功能)中展示过，这里不再重复；

`startDrawing`方法：与上面画笔与橡皮功能没有差异，不再重复；

`draw`方法：根据用户选择不同图形工具，进行不同的处理：这部分其实涉及到上面提到的预览，随着用户拖动鼠标，我们需要实时更新绘制图形大小，这实现的时候就需要高频重绘来支持，这个时候就体现上面记录画布元素的作用，有元素的坐标与大小信息，能够根据坐标与大小信息来支持重绘图形。

```js
draw(e) {
  if (!this.isDrawing && !this.isAddingText) return;
  
  const rect = this.canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  // 实时更新结束坐标
  this.lastX = currentX;
  this.lastY = currentY;
  
  if ((this.currentTool === 'text' || this.currentTool === 'mouse') && this.isAddingText) {
    ......
  } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'diamond' || this.currentTool === 'arrow') {
    // 清空画布并重新绘制所有元素
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.redrawElements();
    
    // 绘制当前图形
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    
    if (this.currentTool === 'rectangle') {
      this.ctx.beginPath();
      this.ctx.rect(
        Math.min(this.startX, currentX),
        Math.min(this.startY, currentY),
        Math.abs(currentX - this.startX),
        Math.abs(currentY - this.startY)
      );
      this.ctx.stroke();
    } else if (this.currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(currentX - this.startX, 2) + Math.pow(currentY - this.startY, 2)
      );
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (this.currentTool === 'diamond') {
      const centerX = (this.startX + currentX) / 2;
      const centerY = (this.startY + currentY) / 2;
      const width = Math.abs(currentX - this.startX) / 2;
      const height = Math.abs(currentY - this.startY) / 2;
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - height);
      this.ctx.lineTo(centerX + width, centerY);
      this.ctx.lineTo(centerX, centerY + height);
      this.ctx.lineTo(centerX - width, centerY);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (this.currentTool === 'arrow') {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      // 绘制箭头
      const angle = Math.atan2(currentY - this.startY, currentX - this.startX);
      const arrowLength = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(currentX, currentY);
      this.ctx.lineTo(
        currentX - arrowLength * Math.cos(angle - Math.PI / 6),
        currentY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.moveTo(currentX, currentY);
      this.ctx.lineTo(
        currentX - arrowLength * Math.cos(angle + Math.PI / 6),
        currentY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.stroke();
    }
  }
},
```
接下来得详细讲讲各个图形的绘制实现：

**矩形**:

使用rect方法绘制一个矩形，核心参数是左上角坐标和矩形的宽高；所需的信息很简单，用户点击开始的坐标，和当前用户光标所在坐标；但用户光标所在位置也可能比开始坐标更小，所以需要取最小值作为左上角坐标，宽高则是取二者之差的绝对值；
```js
if (this.currentTool === 'rectangle') {
  this.ctx.beginPath();
  this.ctx.rect(
    Math.min(this.startX, currentX),
    Math.min(this.startY, currentY),
    Math.abs(currentX - this.startX),
    Math.abs(currentY - this.startY)
  );
  this.ctx.stroke();
}
```

**圆形**：

使用arc方法绘制一个圆形，核心参数是圆心坐标和半径；我们以用户点击开始的坐标为圆心，计算当前用户光标所在坐标与起始坐标的距离，得到半径，绘制一个完整的圆；
```js
else if (this.currentTool === 'circle') {
  const radius = Math.sqrt(
    Math.pow(currentX - this.startX, 2) + Math.pow(currentY - this.startY, 2)
  );
  this.ctx.beginPath();
  this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
  this.ctx.stroke();
}
```

**菱形**：

使用lineTo方法绘制一个菱形，可以理解为和绘制矩形类似，取矩形四边中点为菱形顶点；计算图形中点，矩形宽高，基于中点计算四个顶点，使用lineTo方法绘制四个顶点的线段即可；
```js
else if (this.currentTool === 'diamond') {
  const centerX = (this.startX + currentX) / 2;
  const centerY = (this.startY + currentY) / 2;
  const width = Math.abs(currentX - this.startX) / 2;
  const height = Math.abs(currentY - this.startY) / 2;
  
  this.ctx.beginPath();
  this.ctx.moveTo(centerX, centerY - height);
  this.ctx.lineTo(centerX + width, centerY);
  this.ctx.lineTo(centerX, centerY + height);
  this.ctx.lineTo(centerX - width, centerY);
  this.ctx.closePath();
  this.ctx.stroke();
}
```

**箭头**：

首先绘制线段，然后根据线段方向绘制箭头，线段方向通过计算当前用户光标所在坐标与起始坐标的角度，得到线段方向：
- Math.atan2(y, x) ：计算从原点到点(x, y)的角度，参数是 (终点Y - 起点Y, 终点X - 起点X)，返回值是弧度制，范围是[-π, π]

箭头长度为10，箭头角度为60度(上下各30度)，理解计算方法也很简单，先假设不要这30度，那么计算移动长度10的线段，那么就是沿着原线段移动10个单位，x坐标当然就是currentX - arrowLength * Math.cos(angle)；y坐标当然就是currentY - arrowLength * Math.sin(angle)；那么箭头不过就是顺时针旋转30度，逆时针旋转30度的两个线段，所以+/- Math.PI / 6 就是箭头的角度；
```js
else if (this.currentTool === 'arrow') {
  this.ctx.beginPath();
  this.ctx.moveTo(this.startX, this.startY);
  this.ctx.lineTo(currentX, currentY);
  this.ctx.stroke();
  // 绘制箭头
  const angle = Math.atan2(currentY - this.startY, currentX - this.startX);
  const arrowLength = 10;
  this.ctx.beginPath();
  this.ctx.moveTo(currentX, currentY);
  this.ctx.lineTo(
    currentX - arrowLength * Math.cos(angle - Math.PI / 6),
    currentY - arrowLength * Math.sin(angle - Math.PI / 6)
  );
  this.ctx.moveTo(currentX, currentY);
  this.ctx.lineTo(
    currentX - arrowLength * Math.cos(angle + Math.PI / 6),
    currentY - arrowLength * Math.sin(angle + Math.PI / 6)
  );
  this.ctx.stroke();
}
```



`stopDrawing`方法：
停止绘画，保存当前绘制元素到elements数组中，同时发送到服务器；draw中实现的预览效果其实停止也可以，但在这里重新绘制更贴合逻辑，所以清除画布，再绘制所有元素作为结束；
```js
stopDrawing() {
  if (this.isDrawing) {
    if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
      // 画笔和橡皮都已经在draw方法中逐段保存，不需要额外处理
    } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'diamond' || this.currentTool === 'arrow') {
      // 保存图形元素
      const element = {
        type: this.currentTool,
        startX: this.startX,
        startY: this.startY,
        lastX: this.lastX,
        lastY: this.lastY,
        color: this.color,
        lineWidth: this.lineWidth
      };
      this.elements.push(element);
      // 发送到服务器
      this.sendWebSocketMessage('draw', element);
      // 重新绘制所有元素
      // 注意绘制矩形等图形因为生成预览图形并不是真实绘制，因此需要存入elements再使用redrawElements重绘；
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.redrawElements();
    }
    this.isDrawing = false;
  } else if (this.isAddingText) {
    // 文本框创建、调整或拖动完成
    ......
  }
},
```

### 文本绘制功能
注意到在上面的代码展示中经常会看到文本绘制部分的判断逻辑，的确，因为项目中实现的文本绘制功能比较复杂，支持文本框创建，大小调整，字体大小调整等功能；因此需要和使用的判断逻辑会比较多；

下面来看代码：

**文本框的实际绘制**

<span style="color: green">**有一个很重要的点是，canvas并不能绘制文本输入框，所以实际上文本框的绘制是基于textarea，我们在template中写好一个文本框，由信号控制显隐(反正不会同时存在两个文本框)；这里方法也只是在对文本框绑定的属性做初始化/更新，事实上的文本框绘制与canvas无关，canvas只是绘制一些矩形让文本框显示出来**</span>
```js
<div v-if="currentTool === 'text' && isAddingText" class="text-input-wrapper" :style="{ left: textbox.x + 'px', top: textbox.y + 'px' }">
  <div class="text-input-container" :style="{ width: textbox.width + 'px', height: textbox.height + 'px' }">
    <textarea 
      ref="textInput" 
      v-model="textbox.content" 
      @input="updateTextPreview"
      @keyup.enter="finishTextInput"
      @blur="handleTextareaBlur"
      placeholder="输入文本，按Enter键或点击确认按钮绘制"
      :style="{ fontSize: textbox.fontSize + 'px' }"
      rows="4"
    />
  </div>
  <div class="text-input-button" style="pointer-events: auto;">
    <button @click.stop="finishTextInput">确认</button>
  </div>
</div>
```

**三大方法——只是属性的动态调整**

`startDrawing`方法：<span style="color: green">文本框属性初始化</span>；同样记录当前点击的坐标，准备收集新图形的点；如果没有其他信号，且当前工具是文本框，则开始创建文本框，进行初始化；(其实其他很多逻辑都是没有用的，因为实现文本框大小调整就足够了，拖拽那些可以说作废，直接看最后一个else if的逻辑即可)
```js
startDrawing(e) {
  const rect = this.canvas.getBoundingClientRect();
  this.startX = e.clientX - rect.left;
  this.startY = e.clientY - rect.top;
  this.lastX = this.startX;
  this.lastY = this.startY;
  
  // 清空绘制点数组，准备收集新图形的点
  this.drawingPoints = [{ x: this.startX, y: this.startY }];
  
  if (this.currentTool === 'text' || this.currentTool === 'mouse') {
    // 检查是否点击了调整手柄
    const resizeHandleSize = 8;
    const handleX = this.textbox.x + this.textbox.width - resizeHandleSize / 2;
    const handleY = this.textbox.y + this.textbox.height - resizeHandleSize / 2;
    
    if (this.isAddingText && 
        this.startX >= handleX && 
        this.startX <= handleX + resizeHandleSize && 
        this.startY >= handleY && 
        this.startY <= handleY + resizeHandleSize) {
      // 开始调整文本框大小
      this.textbox.isResizing = true;
      this.textbox.isDragging = false;
      this.textbox.resizeHandle = 'bottomRight';
    } else if (this.isAddingText && 
               this.startX >= this.textbox.x && 
               this.startX <= this.textbox.x + this.textbox.width && 
               this.startY >= this.textbox.y && 
               this.startY <= this.textbox.y + this.textbox.height) {
      // 开始拖动文本框
      this.textbox.isDragging = true;
      this.textbox.isResizing = false;
      this.textbox.dragOffsetX = this.startX - this.textbox.x;
      this.textbox.dragOffsetY = this.startY - this.textbox.y;
    } else if (this.currentTool === 'text') {
      // 开始创建文本框
      this.isAddingText = true;
      this.textbox.x = this.startX;
      this.textbox.y = this.startY;
      this.textbox.width = 200;
      this.textbox.height = 100;
      this.textbox.content = '';
      this.textbox.fontSize = this.fontSize;
      this.textbox.isResizing = false;
      this.textbox.isDragging = false;
      this.textbox.resizeHandle = null;
    }
  } else {
    ......
  }
},
```

`draw`方法：鼠标移动，随之动态调整文本框大小，isDragging/isResizing的逻辑依旧可以直接忽视；直接看最后一个else即可，动态调整文本框大小，Math.max确保最小尺寸为50*30，调整预览过程依旧依靠重绘实现；
```js
draw() {
  if (!this.isDrawing && !this.isAddingText) return;
  
  const rect = this.canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  // 实时更新结束坐标
  this.lastX = currentX;
  this.lastY = currentY;
  
  if ((this.currentTool === 'text' || this.currentTool === 'mouse') && this.isAddingText) {
    if (this.textbox.isDragging) {
      // 拖动文本框
      this.textbox.x = currentX - this.textbox.dragOffsetX;
      this.textbox.y = currentY - this.textbox.dragOffsetY;
    } else if (this.textbox.isResizing) {
      // 调整文本框大小
      this.textbox.width = Math.max(50, currentX - this.textbox.x);
      this.textbox.height = Math.max(30, currentY - this.textbox.y);
    } else {
      // 创建文本框时调整大小
      this.textbox.width = Math.max(50, currentX - this.textbox.x);
      this.textbox.height = Math.max(30, currentY - this.textbox.y);
    }
    
    // 清空画布并重新绘制所有元素
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.redrawElements();
    
    // 绘制文本框
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeRect(this.textbox.x, this.textbox.y, this.textbox.width, this.textbox.height);
    
    // 绘制调整手柄
    const resizeHandleSize = 8;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.textbox.x + this.textbox.width - resizeHandleSize,
      this.textbox.y + this.textbox.height - resizeHandleSize,
      resizeHandleSize,
      resizeHandleSize
    );
    
    // 不再提前绘制文本内容，只在textarea中显示
  }
  ......
}
```

`stopDrawing`方法：鼠标松开，结束绘制，对于文本框而言抬起鼠标并没有什么影响，因为我们的设定是输入文字，enter/点击确认结束，这里的stopDrawing实际上不会结束draw方法对文本框的动态大小调整，因为这本身就只是文本框的一个中间阶段；
```js
stopDrawing() {
  if (this.isDrawing) {
    if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
      // 画笔和橡皮都已经在draw方法中逐段保存，不需要额外处理
    } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'diamond' || this.currentTool === 'arrow') {
      ......
  } else if (this.isAddingText) {
    // 文本框创建、调整或拖动完成
    if (this.textbox.isResizing) {
      // 调整完成，重置调整状态
      this.textbox.isResizing = false;
      this.textbox.resizeHandle = null;
    } else if (this.textbox.isDragging) {
      // 拖动完成，重置拖动状态
      this.textbox.isDragging = false;
    }
    
    // 保持isAddingText为true，显示文本输入界面
    // 重新绘制画布，显示文本框
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.redrawElements();
    
    // 绘制文本框
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeRect(this.textbox.x, this.textbox.y, this.textbox.width, this.textbox.height);
    
    // 绘制调整手柄
    const resizeHandleSize = 8;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.textbox.x + this.textbox.width - resizeHandleSize,
      this.textbox.y + this.textbox.height - resizeHandleSize,
      resizeHandleSize,
      resizeHandleSize
    );
  }
},
```

**文本框功能逻辑的实现**

<span style="color: green;">经过上面的解析，我们能很明确知道**startDrawing、draw、stopDrawing方法只是在对文本框的属性做一些初始化，动态调整，动态绘制的操作，文本框的实际实现是在template自己写，更多的逻辑也是在methods方法里编写**，接下来我们来讲解这些逻辑方法：</span>

我们肯定知道文本框的功能逻辑是输入、确认、以及绘制到白板上要实现与预览效果一致(比如换行等)，它们可不是在那三个方法中去实现的，让我们来看代码：（最主要的是wrapText方法和finishTextInput方法）

已经知道文本框输入文本内容是基于textarea实现，所以输入更新的逻辑我们不需要关心，这里的`updateTextPreview`方法，实际上什么也没做；

`wrapText`方法：实现文本换行，这是非常重要核心的方法，根据文本框宽度和字体大小，将文本内容按单词或字符换行，返回换行后的文本数组。

`cancelTextInput`方法：取消文本输入，清空文本框，关闭，重绘。

`handleTextareaBlur`方法：当textarea失去焦点时，如果是点击确认按钮则不做特殊处理，否则执行`cancelTextInput`方法。

`finishTextInput`方法：确认文本输入，保存进入`elements`数组，触发重绘(因为进入了elements数组，所以这次重绘才是真正将文本内容绘制到白板上)；

```js
updateTextPreview() {
  // 实时更新画布上的文本预览
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.redrawElements();
  
  // 绘制文本框
  this.ctx.strokeStyle = this.color;
  this.ctx.lineWidth = this.lineWidth;
  this.ctx.strokeRect(this.textbox.x, this.textbox.y, this.textbox.width, this.textbox.height);
  
  // 绘制调整手柄
  const resizeHandleSize = 8;
  this.ctx.fillStyle = this.color;
  this.ctx.fillRect(
    this.textbox.x + this.textbox.width - resizeHandleSize,
    this.textbox.y + this.textbox.height - resizeHandleSize,
    resizeHandleSize,
    resizeHandleSize
  );
  
  // 不再提前绘制文本内容，只在textarea中显示
},
wrapText(text, maxWidth, fontSize) {
  const lines = [];
  
  this.ctx.font = `${fontSize}px Arial`;
  
  // 检查文本框是否非常窄，需要垂直排列
  const singleCharWidth = this.ctx.measureText('A').width;
  if (maxWidth < singleCharWidth * 2) {
    // 文本框非常窄，每个字符单独占一行
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
        lines.push(text[i]);
      }
    }
    return lines;
  }
  
  // 正常情况，按单词换行
  let currentLine = '';
  const words = text.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // 检查单个单词是否已经超过最大宽度
    const wordWidth = this.ctx.measureText(word).width;
    if (wordWidth > maxWidth) {
      // 单个单词超过最大宽度，需要按字符换行
      let currentWordLine = '';
      for (let j = 0; j < word.length; j++) {
        const char = word[j];
        const testLine = currentWordLine + char;
        const testWidth = this.ctx.measureText(testLine).width;
        if (testWidth <= maxWidth) {
          currentWordLine = testLine;
        } else {
          if (currentWordLine) {
            lines.push(currentWordLine);
          }
          currentWordLine = char;
        }
      }
      if (currentWordLine) {
        lines.push(currentWordLine);
      }
    } else {
      // 单个单词未超过最大宽度，按单词换行
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = this.ctx.measureText(testLine).width;
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
},
cancelTextInput() {
  this.isAddingText = false;
  this.textbox.content = '';
  // 清空画布并重新绘制所有元素，隐藏文本框
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.redrawElements();
},
handleTextareaBlur(event) {
  // 检查是否是因为点击确认按钮而导致的blur事件
  const target = event.relatedTarget;
  if (target && target.closest && target.closest('.text-input-button')) {
    // 点击了确认按钮，不执行取消操作
    return;
  }
  // 其他情况，执行取消操作
  this.cancelTextInput();
},
finishTextInput() {
  if (this.textbox.content) {
    // 保存文本到elements数组
    const element = {
      type: 'text',
      x: this.textbox.x,
      y: this.textbox.y,
      width: this.textbox.width,
      height: this.textbox.height,
      text: this.textbox.content,
      color: this.color,
      fontSize: this.textbox.fontSize
    };
    this.elements.push(element);
    
    // 发送到服务器
    this.sendWebSocketMessage('text', element);
    
    // 添加到转录历史
    this.transcriptionHistory.push(this.textbox.content);
  }
  this.isAddingText = false;
  this.textbox.content = '';
  // 清空画布并重新绘制所有元素，隐藏文本框
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.redrawElements();
},
```

finishTextInput方法的核心其实也是触发重绘，而wrapText方法则负责实现文本换行，这个方法实际上就是在重绘中才触发的，因此我们在最后这里再对这部分内容进行详解：

**wrapText详解**：

首先上来处理了一个情况(测试中遇到过)，当文本框特别窄(比如用户希望每个字符都占一行，就有可能出现)，如果不做这部分判断，会出现直接一行显示的情况，没有任何换行效果；因此上来就检测，如果文本框非常窄，就直接按字符换行输出即可；

接下来将文本处理，分割为单词，进行单词换行；遍历单词数组，判断当前单词是否超过最大宽度，如果超过最大宽度，就按字符换行(如果当前行有内容，则先打印当前行，清空当前行，再进行字符换行)

(字符换行：即遍历单词字符尝试进入当前行，直到超过最大宽度，就打印当前行，清空当前行，然后将当前字符作为下一行开头)：

如果不超过最大宽度，就按单词换行(尝试把单词添加到当前行后比较当前行宽度是否超过最大宽度，如果超过最大宽度，之前的内容进入lines换行，当前单词成为下一行开头；不超过则继续当前行，进入下一个单词；)；

通过上面的单词换行，字符换行，我们得到一个按行排列的文本数组，将它返回出去；
```js
wrapText(text, maxWidth, fontSize) {
  const lines = [];
  
  this.ctx.font = `${fontSize}px Arial`;
  
  // 检查文本框是否非常窄，需要垂直排列
  const singleCharWidth = this.ctx.measureText('A').width;
  if (maxWidth < singleCharWidth * 2) {
    // 文本框非常窄，每个字符单独占一行
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
        lines.push(text[i]);
      }
    }
    return lines;
  }
  
  // 正常情况，按单词换行
  let currentLine = '';
  const words = text.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // 检查单个单词是否已经超过最大宽度
    const wordWidth = this.ctx.measureText(word).width;
    if (wordWidth > maxWidth) {
      // 单个单词超过最大宽度，需要按字符换行
      // 如果前面有单词，直接打印前面的单词，当前字符成为下一行开头
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      
      let currentWordLine = '';
      for (let j = 0; j < word.length; j++) {
        const char = word[j];
        const testLine = currentWordLine + char;
        const testWidth = this.ctx.measureText(testLine).width;
        if (testWidth <= maxWidth) {
          currentWordLine = testLine;
        } else {
          if (currentWordLine) {
            lines.push(currentWordLine);
          }
          currentWordLine = char;
        }
      }
      if (currentWordLine) {
        lines.push(currentWordLine);
      }
    } else {
      // 单个单词未超过最大宽度，按单词换行
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = this.ctx.measureText(testLine).width;
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
},
```

**绘制文本**
在内容添加到elements数组中，重绘将会把文本内容绘制到白板上，这个过程中会调用上面讲的wrapText方法，对文本进行换行处理，得到按行排列的文本数组；然后绘制：

绘制时，通过element元素收集的起点坐标(x,y)，计算每一行文本，并根据这个坐标来绘制文本；
```js
redrawElements() {
  this.elements.forEach(element => {
    if (element.type === 'eraser') {
      ......
    } else {
      this.ctx.strokeStyle = element.color;
      this.ctx.lineWidth = element.lineWidth;
      
      if (element.type === 'pen') {
        ......
      } else if (element.type === 'text') {
        this.ctx.fillStyle = element.color;
        // 使用element.fontSize作为字体大小，如果没有则使用默认值16
        const fontSize = element.fontSize || 16;
        this.ctx.font = `${fontSize}px Arial`;
        
        // 处理多行文本，考虑文本框宽度自动换行
        const lines = this.wrapText(element.text, element.width - 20, fontSize);
        const lineHeight = fontSize * 1.2;
        lines.forEach((line, index) => {
          this.ctx.fillText(line, element.x + 10, element.y + 30 + index * lineHeight);
        });
      }
    }
  });
},
```

### 颜色与大小
这个其实是最简单的，其实在上面的代码中很容易注意到，各种内容绘制前都是会获取当前的颜色与大小进行绘制的，这里直接贴出我们怎么设置颜色与大小的代码：通过input的type可以很轻松地实现，结合vue的v-model绑定就完成了；
```js
<input type="color" v-model="color" />
<span>笔画粗细:</span>
<input type="range" v-model="lineWidth" min="1" max="10" />
<span>{{ lineWidth }}px</span>
<span>字体大小:</span>
<input type="range" v-model="fontSize" min="8" max="48" />
<span>{{ fontSize }}px</span>
```


## 实时协作白板共享实现

已经讲完白板基础功能的实现，也讲过websocket的通信使用，现在来讲讲我们的白板信息，以及用户在白板上进行的各种操作都是如何在会议中通信传递的：

通信的过程很简单：发送方记录操作并发送，服务器接受并广播，接收方解析操作并执行；下面我们根据这三个过程来讲解白板操作的共享实现：

### 发送操作
先来讲讲操作信息，其实所谓的<span style="color: green;">操作信息</span>就是白板上新增了什么内容，我们记录下来，这能够帮助我们传递信息，执行重绘，美化等操作，说到这里其实就很明显了，<span style="color: green;">就是elements中的记录</span>；我们每执行一次操作，就会记录下操作信息，同时就可以发送出去；

将操作信息发送到服务器的动作其实在上面的代码中已经经常调用了，就是sendWebSocketMessage：比如绘制线段，使用橡皮擦，在draw方法中一段一段保存的，就在draw方法中保存element进入elements数组中，同时发送到服务器；
```js
const element = {
  type: this.currentTool,
  startX: this.startX,
  startY: this.startY,
  lastX: this.lastX,
  lastY: this.lastY,
  color: this.color,
  lineWidth: this.lineWidth
};
this.elements.push(element);
// 发送到服务器
this.sendWebSocketMessage('draw', element);
```
同样的，绘制图形，则是在图形预览完毕，用户确认绘制时，存入elements数组中，同时发送到服务器；那么它的发送阶段就是在`stopDrawing`方法中；

绘制文本，是要在用户`enter`确认或点击确认键后，才完成彻底输入，才存入elements数组中，同时发送到服务器；那么它的发送逻辑就要写进`finishTextInput`方法中了；

这些代码在对应功能的讲解中其实都有，这里就只简单贴了绘制线段的代码；毕竟核心不在于刚刚讲的如何记录和发送时机，这些也都是之前具体讲解代码中有的，核心是发送方法的实现：

```js
export default {
  ......
  methods: {
    ......
    sendWebSocketMessage(type, data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log(`Sending WebSocket message: ${type}, data length: ${JSON.stringify(data).length}`);
        this.socket.send(JSON.stringify({ type, data }));
      } else {
        console.error('WebSocket not open, readyState:', this.socket ? this.socket.readyState : 'null');
      }
    },
    ......
  },
  ......
}
```
可以看到并不复杂，就是判断下websocket是否打开，如果是，就发送消息，将type和data打包成json字符串发送，告知接收方操作类型和数据；如果不是，就报错；

### 服务器接收并广播
从上面的发送操作我们可以知道是通过websocket发送消息的，那么服务器当然是通过websocket去接收，从逻辑上我们很容易了解到，服务器在这里只是起一个中转站，将收到的消息广播给其他用户的作用，因此它的逻辑并不复杂；

```js
wss.on('connection', (ws, req, roomCode) => {
  ......
  ws.on('message', (data, isBinary) => {
    try {
      if (isBinary) {
        ......
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
      }
      if (parsed.type === 'text') {
        const s = meetingRoomManager.getCanvasState(roomCode);
        s.push(parsed.data);
        meetingRoomManager.updateCanvasState(roomCode, s);
        meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
          type: 'text',
          data: parsed.data
        }), ws.id);
      }
      if (parsed.type === 'clear') {
        meetingRoomManager.updateCanvasState(roomCode, []);
        meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
          type: 'clear'
        }), ws.id);
      }
      ......
    } catch (e) { }
  });
  ......
})
```
可以看到，服务器会根据获取到的data的type判断消息类型，将它们存入服务器端的canvasState中，然后广播接收到的消息；那么让我们来讲讲这里的核心，`broadcastToRoom`方法：
```js
class MeetingRoomManager {
  ......
  broadcastToRoom(code, msg, excludeId) {
    const room = this.rooms.get(code);
    if (!room) return;
    room.members.forEach(m => {
      if (m.socketId !== excludeId) {
        const ws = clients.find(c => c.id === m.socketId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(msg);
        }
      }
    });
  }
}
```
可以看到非常简单，因为服务器端存放有参会用户的socketId，所以只需要遍历所有参会用户，除了当前发送消息的用户，其他都获取socketId，找到对应的websocket，如果存在且打开，就发送消息即可；

至于前面讲到服务器会把消息数据存入canvasState中的原因，这其实在之前基础功能讲到过，就是当有新用户加入会议室，新用户是需要获取之前的白板信息的，这不可能通过其他用户来发送，在服务器端存储一份，并在新用户加入时，直接发送给新用户是最好的方案，因此服务器也需要存储并实时更新一份canvasState；

在这里我们也把获取canvasState，以及更新updateCanvasState方法的代码贴出来：并没有什么难度，只是一个简单的数组；
```js
class MeetingRoomManager {
  ......
  updateCanvasState(code, state) {
    const room = this.rooms.get(code);
    if (room) {
      room.canvasState = state;
      room.lastActivityTime = new Date();
    }
  }
  getCanvasState(code) {
    return this.rooms.get(code)?.canvasState || [];
  }
  ......
}
```
### 用户接收端接收并处理
服务器广播后，其他用户会收到信息，并处理，绘制到他们的白板上，让我们来看具体实现：
```js
export default {
  ......
  methods: {
    ......
    setupWebSocket() {
      try {
        // 使用传入的roomCode建立WebSocket连接
        ......
        this.socket.onmessage = (event) => {
          try {
            // 检查是否是二进制数据（音频数据）
            if (event.data instanceof ArrayBuffer) {
              ......
              return;
            }
            
            console.log(`收到WebSocket消息: ${event.data}`);
            const data = JSON.parse(event.data);
            if (data.type === 'canvasState') {
              console.log(`收到canvasState消息，元素数量: ${data.data.length}`);
              this.elements = data.data;
              this.redrawCanvas();
              console.log(`canvasState消息已处理`);
            } else if (data.type === 'draw') {
              console.log(`收到draw消息: ${data.data}`);
              this.elements.push(data.data);
              this.redrawCanvas();
            } else if (data.type === 'text') {
              console.log(`收到text消息: ${data.data}`);
              this.elements.push(data.data);
              this.redrawCanvas();
            } else if (data.type === 'clear') {
              console.log(`收到clear消息`);
              this.elements = [];
              this.ctx.clearRect(0, 0, this.width, this.height);
            } else if (data.type === 'beautify') {
              ......
            } ......
          } catch (error) {
            console.error(`处理WebSocket消息时出错: ${error}`);
          }
        };
      } catch (error) {
        console.error(`设置WebSocket连接时出错: ${error}`);
      }
    },
    ......
  },
  ......
}
```
可以看到这里的操作也并不复杂，只需要根据消息类型判断，存储进入用户的elements数组中，依靠重绘功能，就能绘制到白板上；可以看到很多地方都是依靠重绘功能实现的，和[之前所说一样，重绘功能的确是非常重要的功能](#flag)

## 美化白板识别算法
接下来让我们来讲讲美化白板识别算法；识别算法主要在后端实现；前端负责发送手绘信息，接受后端返回的美化图形，并对原图形进行替换；

### 美化白板前端实现——图形信息收集与替换
前端方面，绑定按钮，用户点击美化按钮后调用方法beautifyShape，实现美化功能；

**首先检测用户是否绘制了一个图形，（至少3个点），如果没有绘制，就提示用户绘制一个图形；**

**为了实现撤销美化，需要备份一份originalElements；**

根据之前收集的信息，drawingPoints，strokeId都是非常重要的信息；因为美化功能需要解决两个关键问题：
1. 识别并获取要被美化的图形、内容，并且发送给服务器分析；(drawPoints)
2. 识别并获取要被美化的图形、内容，替换为服务器返回的美化图形；(strokeId)

drawPoints会记录下用户最后一次绘制的所有点(只有pen类型元素才会记录点，可以在startDraw中看到清空记录，draw方法中pen类型才记录)，所以要求是用户刚刚手绘一个图形，并点击美化按钮，才会执行美化；**我们发送这些点到服务器，服务器会根据点识别出用户的绘制，然后返回美化后的图形；**

**获取后端返回的美化结果，如果识别成功(不是pen类型)，就对原图形进行替换**；替换的实现手段是依靠strokeId，因为手绘内容其实是被分解成非常多段的pen元素，我们难以获取出来进行替换，strokeId可以标识出用户最后一笔画的内容，因为同一笔画使用的都是相同的strokeId；依靠它，就能够**将所有与当前绘制相关的pen元素移除，然后添加美化后的图形元素(即添加到elements数组中，触发重绘完成美化)**；

当然，**美化也需要同步到服务器的canvasState中，因此会发送一个beautify消息到服务器，服务器消息，包含strokeId和新的美化元素**
```js
async beautifyShape() {
  if (this.drawingPoints.length < 3) {
    this.showToastMessage('请先绘制一个图形', 'info');
    return;
  }
  
  try {
    // 保存原始元素和当前strokeId，用于撤销美化
    this.originalElements = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      strokeId: this.currentStrokeId
    };
    
    const response = await fetch('http://192.168.153.168:8080/api/recognize-shape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points: this.drawingPoints })
    });
    
    const result = await response.json();
    if (result.success) {
      const beautifiedShape = result.shape;
      
      // 只有当识别成功且不是pen类型时才进行美化
      if (beautifiedShape.type !== 'pen') {
        // 移除与当前绘制相关的所有pen元素（使用strokeId）
        const elementsBefore = this.elements.length;
        if (this.currentStrokeId) {
          this.elements = this.elements.filter(element => !(element.type === 'pen' && element.strokeId === this.currentStrokeId));
        }
        console.log(`移除了 ${elementsBefore - this.elements.length} 个pen元素`);
        
        // 添加美化后的图形
        const newElement = {
          ...beautifiedShape,
          color: this.color,
          lineWidth: this.lineWidth
        };
        this.elements.push(newElement);
        
        // 发送美化消息到服务器，包含strokeId和新的美化元素
        console.log('发送美化消息:', {
          strokeId: this.currentStrokeId,
          newElement: newElement
        });
        this.sendWebSocketMessage('beautify', {
          strokeId: this.currentStrokeId,
          newElement: newElement
        });
            
        // 重新绘制画布
        this.redrawCanvas();
      } else {
        // 如果识别为pen类型，不进行美化，清除原始元素的保存
        this.originalElements = null;
        // 显示提示
        this.showToastMessage('无法识别为规则图形，保持原始绘制', 'info');
      }
    } else {
      console.error('图形美化失败:', result.error);
      // 如果美化失败，清除原始元素的保存
      this.originalElements = null;
    }
  } catch (error) {
    console.error('发送图形数据失败:', error);
    // 如果发生错误，清除原始元素的保存
    this.originalElements = null;
  }
},
```

### 美化白板后端实现(美化算法)
前端在这部分的实现主要就是支持识别图形和替换图形，现在来讲讲在后端实现的美化算法：

这里是请求的接口实现，可以看到是先调用了ShapeRecognitionService的recognizeShape方法，来识别用户绘制的图形(同时实现美化)，再调用beautifyShape方法，调整返回格式(按照前端存储元素格式返回)；
```js
app.post('/api/recognize-shape', (req, res) => {
  try {
    const { points } = req.body;
    const s = new ShapeRecognitionService();
    res.json({ success: true, shape: s.beautifyShape(s.recognizeShape(points)) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
```

<span style="color: green;">**recognizeShape的实现：(识别+美化)**</span>

这部分内容比较多，需要慢慢讲；大体上的思路是：
1. 计算图形的基本属性，如中心点、边界框、面积、周长、长宽比等。
2. 基于几何特征识别图形，通过调整识别图形算法的阈值，来提高识别的准确率，同时调整识别的顺序，放在前面识别的图形，比如圆，矩形，算法设计时就会提高识别的精度，增加识别手段，提高准确度，避免识别为其他图形。
3. 对识别后的图形进行美化，比如调整颜色、宽度等，来符合用户的绘制意图。
<a id="recognizeShape"></a>

```js
recognizeShape(points) {
  try {
    // 计算图形的基本属性
    const center = this.calculateCenter(points);
    const boundingBox = this.calculateBoundingBox(points);
    const area = this.calculateArea(points);
    const perimeter = this.calculatePerimeter(points);
    const aspectRatio = (boundingBox.width / boundingBox.height);

    // 基于几何特征识别图形
    if (this.isCircle(points, center, area, perimeter)) {
      // 计算中心点
      const centerX = boundingBox.x + boundingBox.width / 2;
      const centerY = boundingBox.y + boundingBox.height / 2;

      // // 计算所有点到中心点的平均距离，作为半径
      // let totalDistance = 0;
      // for (const point of points) {
      //   const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
      //   totalDistance += distance;
      // }

      // // 使用平均距离作为半径，确保美化后的圆形大小与用户绘制的一致
      // const radius = totalDistance / points.length;
      const radius = boundingBox.width / 2;
      return {
        type: 'circle',
        center: { x: centerX, y: centerY },
        radius: radius,
        confidence: 0.9
      };
    } else if (this.isRectangle(points, boundingBox, aspectRatio)) {
      return {
        type: 'rectangle',
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
        confidence: 0.85
      };
    } else if (this.isDiamond(points, boundingBox, aspectRatio)) {
      return {
        type: 'diamond',
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
        confidence: 0.85
      };
    } else if (this.isArrow(points)) {
      return {
        type: 'arrow',
        start: points[0],
        end: points[points.length - 1],
        confidence: 0.8
      };
    } else {
      return {
        type: 'pen',
        points: points,
        confidence: 1.0
      };
    }
  } catch (error) {
    console.error('Error recognizing shape:', error);
    return {
      type: 'pen',
      points: points,
      confidence: 1.0
    };
  }
}
```
可以看到，<span style="color: green;">这里大部分的逻辑都是根据图形基本属性进行了美化调整，这里贴出来主要是提供一个框架去帮助我们按顺序理解代码，只需要看大概框架，不需要看具体逻辑，逻辑是很简单的。可以最后再回来看，甚至不需要专门讲解；</span>识别和美化都需要先计算图形的基本属性，所以让我们来先看看这些属性计算方法是如何实现的，才能更好理解识别图形的逻辑：

<span style="color: green;">**计算图形的基本属性**</span>

求中心点：不难理解，这里就是计算所有点的x坐标和y坐标的平均值，作为图形的中心点。
```js
// 计算中心点
calculateCenter(points) {
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return { x, y };
}
```

求边界框：这里就是计算所有点的x坐标和y坐标的最小值和最大值，可以得到图形的边界框。
```js
// 计算边界框
calculateBoundingBox(points) {
  const xValues = points.map(p => p.x);
  const yValues = points.map(p => p.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
```

求面积：这里就是计算所有点的坐标，作为图形的面积。算法是鞋带定理，可以求任意多边形的面积。
```js
calculateArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += (p1.x * p2.y) - (p2.x * p1.y);
  }
  return Math.abs(area) / 2;
}
```
核心思想是图形相减，可以建立一个坐标系，在坐标系上画一个四边形，取任意两点结合垂直线段到x轴的长度，两点连线，两垂点连线，围成梯形，计算面积。

顺时针取点四次，就会发现这个图形的面积是两个梯形减去另外两个梯形；以梯形面积公式计算(上底+下底)*高/2，化简可以得到鞋带公式；

下面是几张示意图：

![鞋带定理](./images/xiedai1.png)
![鞋带定理](./images/xiedai2.png)
![鞋带定理](./images/xiedai3.png)


求周长：这里就是顺时针两两取点计算距离，累加起来，作为图形的周长。
```js
// 计算周长
calculatePerimeter(points) {
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    perimeter += distance;
  }
  return perimeter;
}
```

求两点之间的距离：这里就是计算两点之间的距离，平方开根起到取绝对值的作用。
```js
// 计算两点之间的距离
calculateDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
```




<span style="color: green;">**计算图形的识别算法**</span>

基本属性的计算都已经讲完了，接下来让我们看看怎么根据基本属性识别图形：

- 圆形：
```js
// 判断是否为圆形
isCircle(points, center, area, perimeter) {
  // 计算圆的理论周长
  const radius = Math.sqrt(area / Math.PI);
  const expectedPerimeter = 2 * Math.PI * radius;

  // 检查周长与理论值的差异
  const perimeterRatio = perimeter / expectedPerimeter;
  return perimeterRatio > 0.8 && perimeterRatio < 1.2;
}
```
可以看到圆形的识别算法是根据周长与理论周长的差异来判断的，如果差异在0.8到1.2之间，就认为是圆形。这是因为我们美化识别的封闭图形像矩形，菱形，这些不均衡的，边数少的图形面积与周长的差异会比较大，因为我们的周长面积都是按照标准圆形去计算的，这些图形越不像圆，差别就会越大。而我们识别的图形与圆相差很大，即使是正方形也很难识别，所以，我们通过判断周长与理论周长的差异，来判断图形是否为圆形，是简单又有效的方法。

- 矩形：
```js
// 判断是否为矩形
isRectangle(points, boundingBox, aspectRatio) {
  // 检查边界框的长宽比和点的分布
  if (aspectRatio < 0.2 || aspectRatio > 5.0 || points.length <= 4) {
    return false;
  }

  // 检测水平和垂直线条
  const horizontalVerticalScore = this.detectHorizontalVerticalLines(points);

  // 矩形应该有明显的水平和垂直线条
  return horizontalVerticalScore > points.length * 0.4;
}

// 检测水平和垂直线条
detectHorizontalVerticalLines(points) {
  let score = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];

    // 计算线段的角度
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

    // 检查是否接近水平或垂直
    // 水平：0度或180度
    // 垂直：90度或270度
    if (Math.abs(angle) < 15 || Math.abs(angle - 180) < 15 ||
      Math.abs(angle - 90) < 15 || Math.abs(angle - 270) < 15) {
      score++;
    }
  }

  return score;
}
```
这里贴出了两个方法，一个识别矩形，另一个则是识别水平和垂直线条。这个识别水平垂直的方法主要是为了区分矩形和菱形。因为菱形的水平和垂直线段数量会更少。

可以看到矩形的主要特征是长宽比在0.2到5.0之间，多边形，水平和垂直线段数量比较多，这里是统计点数大于40%。垂直水平线段的识别逻辑也很简单，顺时针取点，两点连线计算角度，如果角度在0度或180度之间，或者在90度或270度之间，就认为是垂直水平线段，增加对应的统计点数，最后返回点数。

- 菱形：
```js
// 判断是否为菱形
isDiamond(points, boundingBox, aspectRatio) {
  // 检查点的数量和长宽比
  if (points.length < 4) return false;

  // 计算标准菱形中心点
  const centerX = boundingBox.x + boundingBox.width / 2;
  const centerY = boundingBox.y + boundingBox.height / 2;

  // 计算标准菱形四个顶点（底部可以不用算）
  const topPoint = { x: centerX, y: boundingBox.y };
  const rightPoint = { x: boundingBox.x + boundingBox.width, y: centerY };
  const leftPoint = { x: boundingBox.x, y: centerY };
  // 标准菱形系数：只有正负两种，还是相反数，因此算一个就够用了;
  const k = (topPoint.y - leftPoint.y) / (topPoint.x - leftPoint.x);
  // 预期距离阈值，以对角线平均值的0.15为参考
  const inDistance = (boundingBox.width + boundingBox.height) / 2 * 0.25;

  // 根据标准菱形的四个顶点，生成标准菱形四条边的坐标函数
  const edges = (x, y) => {
    let distance;
    if (x >= topPoint.x) {
      let dist1 = Math.abs(k * (x - leftPoint.x) + leftPoint.y - y);
      let dist2 = Math.abs(-k * (x - leftPoint.x) + leftPoint.y - y);
      distance = Math.min(dist1, dist2);
    } else {
      let dist1 = Math.abs(k * (rightPoint.x - x) + rightPoint.y - y);
      let dist2 = Math.abs(-k * (x - rightPoint.x) + rightPoint.y - y);
      distance = Math.min(dist1, dist2);
    }
    return distance < inDistance;
  }

  // 检查点是否接近标准菱形
  let symmetryScore = 0;

  for (const point of points) {
    if (edges(point.x, point.y)) {
      symmetryScore++;
    }
  }
  // 检测水平和垂直线条，菱形应该较少
  const horizontalVerticalScore = this.detectHorizontalVerticalLines(points);
  return symmetryScore > points.length * 0.25 &&
    horizontalVerticalScore < points.length * 0.4;
}
```
可以看到菱形的识别方法是直接模拟标准菱形，对所有点检测是否在或接近标准菱形的边，统计数量从而判断是否为菱形。

模拟标准菱形直接计算中心点，根据中心点外加边界可得顶点。计算斜率k(相反数就够用)，再依靠斜率+左顶点和右顶点得到四条边所有点的坐标。对于检查点，根据x坐标计算对应的标准y坐标，再比较检查点y坐标与标准y坐标，距离在误差内则增加统计点；

最后检测水平和垂直线条，符合菱形的特征的统计点超过25%，水平和垂直线条低于40%则认为是菱形。

- 箭头：
```js
isArrow(points) {
  // 检查点的数量
  if (points.length < 3) return false;

  // 简化箭头识别逻辑
  // 1. 计算起点到终点的距离
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const distance = this.calculateDistance(startPoint, endPoint);

  // 2. 计算所有点到起点-终点连线的平均距离
  let totalDistance = 0;
  for (const point of points) {
    totalDistance += this.distanceToLine(point, startPoint, endPoint);
  }
  const avgDistance = totalDistance / points.length;

  // 3. 箭头的特征：大部分点应该靠近起点-终点连线
  // 平均距离与总距离的比例应该较小
  const distanceRatio = avgDistance / (distance + 0.001);

  return distanceRatio < 0.3
}

// 计算点到直线的距离
distanceToLine(point, lineStart, lineEnd) {
  const A = lineEnd.y - lineStart.y;
  const B = lineStart.x - lineEnd.x;
  const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;
  return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
}
```
可以看到箭头识别的逻辑用到了点到直线的距离，用于判断点是否靠近起点-终点连线。求出了所有点到起点-终点连线的平均距离，起点到终点连线距离(即箭头的直线部分)，平均距离远小于直线部分，就认为是箭头。

这些识别逻辑了解完了，现在可以回去[上面](#recognizeShape)看看美化逻辑了，实际上非常简单，看两眼就知道，只是根据点的坐标外加识别出来的图形提供了预期的格式，不需要讲解了。


**beautifyShape的实现：(格式调整)**
可以看到美化图形的方法是根据美化后返回的图形信息，按照前端调整格式，返回调整后的图形信息。
```js
// 美化图形
beautifyShape(shape) {
  switch (shape.type) {
    case 'circle':
      return {
        type: 'circle',
        startX: shape.center.x - shape.radius,
        startY: shape.center.y - shape.radius,
        lastX: shape.center.x + shape.radius,
        lastY: shape.center.y + shape.radius
      };
    case 'diamond':
      return {
        type: 'diamond',
        startX: shape.x,
        startY: shape.y,
        lastX: shape.x + shape.width,
        lastY: shape.y + shape.height
      };
    case 'rectangle':
      return {
        type: 'rectangle',
        startX: shape.x,
        startY: shape.y,
        lastX: shape.x + shape.width,
        lastY: shape.y + shape.height
      };
    case 'arrow':
      return {
        type: 'arrow',
        startX: shape.start.x,
        startY: shape.start.y,
        lastX: shape.end.x,
        lastY: shape.end.y
      };
    default:
      return shape;
  }
}
```


## websocket同步与撤回美化实现
上面的代码讲完了后端美化算法的实现，前端怎么发送信息和接收美化后的信息以及对应的处理也已经讲完。接下来我们要讲讲各用户之间是如何实现同步与撤回美化功能的。因为这些美化信息还需要同步；其实有了前后端通信，以及前面的websocket通信内容，不难想到还是美化操作前后端通信时实现的“存放入elements数组”的操作，增加一个广播来实现；其他用户端的处理逻辑和美化请求用户的处理逻辑相同，接收到服务端发送来的对应处理逻辑，做替换操作即可；

不过光这么说还是不够，让我们来看实际实现：(我们依旧按照前端实现和后端实现来讲)

### 前端实现
前端部分，我们需要讲：
- 美化后各个接收客户端处理美化信息操作的实现；
- 撤回美化的请求客户端需要实现的内容(请求发送，本地处理)；
- 撤回美化后的各个接收客户端处理操作的实现；

让我们来看代码实现：
```js
setupWebSocket() {
  try {
    // 使用传入的roomCode建立WebSocket连接
    console.log(`与会议室${this.roomCode}建立WebSocket连接`);
    this.socket = new WebSocket(`ws://192.168.153.168:8080?roomCode=${this.roomCode}`);
    
    this.socket.onopen = () => {
      console.log(`与会议室${this.roomCode}的WebSocket连接成功，readyState: ${this.socket.readyState}`);
      // 发送昵称信息到服务器
      this.sendWebSocketMessage('updateNickname', { nickname: this.nickname });
    };
    
    this.socket.onmessage = (event) => {
      try {
        // 检查是否是二进制数据（音频数据）
          ......
          return;
        }
        
        console.log(`收到WebSocket消息: ${event.data}`);
        const data = JSON.parse(event.data);
        if (data.type === 'canvasState') {
          console.log(`收到canvasState消息，元素数量: ${data.data.length}`);
          this.elements = data.data;
          this.redrawCanvas();
          console.log(`canvasState消息已处理`);
        } else if (data.type === 'draw') {
          ......
        } else if (data.type === 'beautify') {
          console.log(`收到beautify消息: ${data.data}`);
          // 处理来自服务器的美化操作
          const { strokeId, newElement } = data.data;
          
          // 移除与当前绘制相关的所有pen元素（使用strokeId）
          if (strokeId) {
            this.elements = this.elements.filter(element => !(element.type === 'pen' && element.strokeId === strokeId));
          }
          
          // 添加美化后的元素
          this.elements.push(newElement);
          
          // 重新绘制画布
          this.redrawCanvas();
        } else if (data.type === 'socketId') {
          ......
        } else if (data.type === 'undoBeautify') {
          // 处理撤销美化操作
          console.log(`收到undoBeautify消息: ${data.data}`);
          // 撤销美化操作，移除美化后的元素，恢复原始状态
          // 由于我们没有保存原始状态，这里需要重新获取画布状态
          // 服务器会广播canvasState消息，所以这里不需要做任何操作
          // 只需要等待canvasState消息即可
          console.log(`收到undoBeautify消息，等待canvasState更新`);
        } else if (data.type === 'errorBeautify') {
          // 处理撤销美化错误
          this.errorUndoBeautify = true;
          this.showToastMessage(data.data, 'error');
        }
      } catch (error) {
        console.error(`处理WebSocket消息时出错: ${error}`);
      }
    };
  }
}
```
**接收客户端处理美化信息操作的实现**

可以看到从服务端收到beautify消息后，会根据消息内容，移除与当前绘制相关的所有pen元素（使用strokeId），并添加美化后的元素。最后，重新绘制画布，和刚刚上面讲的完全一致。


**撤回美化后的各个接收客户端处理操作的实现**

可以看到上面代码中也包含了处理撤销美化操作的实现，因此我们就先提前讲了，可以看到撤销美化操作是通过获取“原始状态”来实现的，而其他接收客户端并不会有这个原始状态，是等待服务器继续推送canvasState消息，显然这是直接传递了整个画布信息，接收后直接替换本地elements数组，然后重绘即可；


**撤回美化的请求客户端需要实现的内容(请求发送，本地处理)**

我们再返回来讲撤销美化请求的发送，发送请求方都做了些什么：
```js
undoBeautify() {
  if (this.originalElements) {
    // 显示确认弹窗
    const userConfirmed = confirm('撤销美化会将画面恢复到上一次美化前的状态，美化后添加的内容会被清除。确定要继续吗？');
    console.log('用户确认状态:', userConfirmed);
    if (userConfirmed) {
      // 发送撤销美化指令到服务器，包含strokeId
      const strokeId = this.originalElements.strokeId;
      this.sendWebSocketMessage('undoBeautify', { strokeId });
      // 等待服务器处理完成
      setTimeout(() => {
        // 只有当前用户是房间最新美化操作才能撤回
        if(!this.errorUndoBeautify){
          // 恢复原始元素
          this.elements = this.originalElements.elements;
          // 重新绘制画布
          this.redrawCanvas();
          console.log('已执行撤销美化操作');
        }
        this.errorUndoBeautify = false;
        // 清空原始元素的保存
          this.originalElements = null;
      }, 1000);
    } else {
      console.log('用户取消了撤销美化操作');
    }
  } else {
    console.log('没有可撤销的美化操作');
  }
},
```
可以看到撤销美化操作的实现，先确认用户是否要撤销，然后发送撤销美化指令到服务器，等待服务器处理完成，最后根据服务器返回的结果，判断是否成功撤销美化操作。

从提示的内容也可以知道，我们的<span style="color:green">**撤销美化操作是只撤回最新的美化操作，并且撤回会清空该美化操作后添加的内容，而考虑到多人合作，很有可能出现其他用户也新增了美化操作**</span>，如果随意撤回，容易造成意料之外的结果，因此设置了<span style="color:green">settimeout去等待后端的返回结果来判断是否能够进行撤回，而不是直接恢复</span>；

不论能或不能，原始元素的保存都应该清空了(能则回退，不再需要；不能则以后都不能，也不再需要)；回退是利用之前保存的原始元素进行替换实现；与[美化实现中的内容](#美化白板前端实现——图形信息收集与替换)呼应；


### 后端实现
后端方面，需要实现一个接口，用于接收前端发送的撤销美化指令，判断是否能够成功撤销回该美化操作。能则执行并广播canvasState消息，否则返回失败结果和原因。
```js
wss.on('connection', (ws, req, roomCode) => {
  ......
  ws.on('message', (data, isBinary) => {
    try {
      ......
      if (parsed.type === 'undoBeautify') {
        const room = meetingRoomManager.getRoom(roomCode);
        const { strokeId } = parsed.data;
        if (room?.beautifyState) {
          // 因为可能有多用户操作，如果用户申请撤回美化的操作不是当前最新的美化操作，则驳回，
          // 否则其他用户的美化操作会因为撤回而直接移除
          if (strokeId !== room.beautifyState.strokeId) {
            ws.send(JSON.stringify({
              type: 'errorBeautify',
              data: '其他用户已执行美化操作，撤回可能带来意外结果，建议您选择橡皮擦拭重绘'
            }));
            return;
          } else {
            meetingRoomManager.updateCanvasState(roomCode, room.beautifyState.originalState);
            room.beautifyState = null;
            meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
              type: 'canvasState',
              data: meetingRoomManager.getCanvasState(roomCode)
            }), ws.id);
          }
        }
      }
    } catch (e) { }
  });
})
```
可以看到通过strokeId来判断最新美化操作是否是当前用户的，不是则驳回，是则执行撤销美化操作，通过以前存储的originalState来实现撤销(更新canvasState)，随后广播发送canvasState消息，通知其他用户更新画布。至于使用的方法[之前](#服务器接收并广播)已经讲过,不再赘述。

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

接下来让我们慢慢讲解：
## 语音转写功能
这部分内容的代码量比较大，而且之前我对这方面的知识并不熟悉，这里按序慢慢讲解：

### 获取用户语音输入
首先把获取用户语音输入的代码放出来：
```js
async startRecording() {
  try {
    // 检查浏览器是否支持媒体设备API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('浏览器不支持媒体设备API');
    }
    // 请求16kHz采样率的音频流
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        sampleSize: 16
      }
    });
    
    // 创建音频上下文，设置采样率为16kHz
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    });
    const source = audioContext.createMediaStreamSource(stream);
    
    // 创建脚本处理器，用于获取音频数据
    // 16kHz采样率，缓冲区大小设置为1024（最接近640的2的幂）
    const processor = audioContext.createScriptProcessor(1024, 1, 1);
    
    // 发送开始转写的消息
    this.sendWebSocketMessage('startTranscription', {});
    
    // 音频数据缓冲区
    let audioBuffer = [];
    
    // 处理音频数据
    processor.onaudioprocess = (event) => {
      if (this.isRecording) {
        const inputData = event.inputBuffer.getChannelData(0);
        // 转换为16位PCM格式
        const pcmData = this.float32ToInt16(inputData);
        // 将音频数据添加到缓冲区
        audioBuffer.push(pcmData);
      }
    };
    
    // 每400ms发送一次音频数据
    const sendInterval = setInterval(() => {
      if (this.isRecording && audioBuffer.length > 0 && this.socket && this.socket.readyState === WebSocket.OPEN) {
        // 合并缓冲区中的音频数据
        const mergedData = new Int16Array(audioBuffer.reduce((total, buffer) => total + buffer.length, 0));
        let offset = 0;
        audioBuffer.forEach(buffer => {
          mergedData.set(buffer, offset);
          offset += buffer.length;
        });
        
        // 发送音频数据到服务器
        this.socket.send(mergedData.buffer);
        
        // 清空缓冲区
        audioBuffer = [];
      }
    }, 400);
    
    // 保存定时器ID，用于停止录音时清除
    this.sendInterval = sendInterval;
    
    // 连接音频节点
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    this.isRecording = true;
    this.audioContext = audioContext;
    this.processor = processor;
    this.stream = stream;
    
    // 启动缓冲区处理定时器，每3秒检查一次
    this.bufferTimer = setInterval(() => {
      this.mergeTranscriptionResults();
    }, 3000);
    
    console.log('开始录音');
    console.log('启动转录缓冲区处理定时器');
    
  } catch (error) {
    console.error('录音失败:', error);
    this.showToastMessage('录音失败，请检查麦克风权限', 'error');
  }
},
```
可以看到这些功能基本都是通过浏览器的媒体设备API来实现的，包括获取用户语音输入、处理音频数据、调用大模型进行语音转写、处理返回文本结果、实现字幕功能等。这些api对我来说比较陌生，让我们逐个讲解：
#### 代码讲解(实质是巨量音频api讲解)
还有少量api调用在[下面](#音频api讲解补充)

**navigator.mediaDevices.getUserMedia**:

来看mdn的文档介绍：

`MediaDevices.getUserMedia() 会提示用户给予使用媒体输入的许可，媒体输入会产生一个MediaStream，里面包含了请求的媒体类型的轨道。此流可以包含一个视频轨道（来自硬件或者虚拟视频源，比如相机、视频采集设备和屏幕共享服务等等）、一个音频轨道（同样来自硬件或虚拟音频源，比如麦克风、A/D 转换器等等），也可能是其他轨道类型。`

`它返回一个 Promise 对象，成功后会resolve回调一个 MediaStream 对象。若用户拒绝了使用权限，或者需要的媒体源不可用，promise会reject回调一个 PermissionDeniedError 或者 NotFoundError 。`

navigator.mediaDevices.getUserMedia 是一个 Web API，用于 请求用户授权访问媒体设备 （如摄像头和麦克风）。它是 WebRTC（Web Real-Time Communication）技术的一部分，主要用于在浏览器中获取实时媒体流。

基本功能
- 获取媒体流 ：访问用户的摄像头和/或麦克风
- 用户授权 ：自动弹出权限请求，需要用户手动允许
- 返回Promise ：成功时返回 MediaStream 对象，失败时返回错误
- 实时数据 ：获取的是实时的媒体流数据
```js
// 请求16kHz采样率的音频流
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: {
    sampleRate: 16000,
    channelCount: 1,
    sampleSize: 16
  }
});
```
这里配置的参数与我们的音频转写有关:

`sampleRate`: 音频采样率，单位是Hz（赫兹）,是语音识别的标准采样率，表示每秒采集的音频样本数，大多数语音转写服务（如讯飞API）都要求这个采样率

`channelCount`: 音频通道数，示音频是单声道(1)还是立体声(2),语音识别只需要单声道数据，单声道数据量是立体声的一半，传输更高效，大多数语音转写服务只处理单声道音频

`sampleSize`: 音频采样位深度，单位是位(bit)，表示每个音频样本的精度。16位是语音识别的标准位深度，提供足够的动态范围（约96dB）来捕捉语音细节，与大多数语音转写服务的要求一致



**window.AudioContext与createMediaStreamSource**

window.AudioContext ：Web Audio API 的核心对象，用于处理和分析音频数据(window.webkitAudioContext是适配浏览器的兼容性写法)

createMediaStreamSource(stream) ：将之前获取的媒体流（ stream ）转换为 AudioContext 可处理的音频源节点（音频源节点是音频处理链路的起点）

createScriptProcessor：创建脚本处理器，实时获取、处理音频数据，可以分析、进行数据转换 ：通过回调函数实时访问音频缓冲区中的数据，还可以对音频数据进行自定义处理；可以分析音频的频率、振幅等特性，也能将音频数据转换为适合传输的格式。<span style="color:green;">注意：createScriptProcessor其实已经弃用，被 AudioWorklet 和 AudioWorkletNode 接口替代。如果未来还有应用场景，替换掉</span>
```js
// 创建音频上下文，设置采样率为16kHz
const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 16000
});
const source = audioContext.createMediaStreamSource(stream);

// 创建脚本处理器，用于获取音频数据
// 16kHz采样率，缓冲区大小设置为1024（最接近640的2的幂）
const processor = audioContext.createScriptProcessor(1024, 1, 1);
```
`sampleRate`: 设置音频上下文的采样率，与之前getUserMedia的设置（16kHz采样率）保持一致

`createScriptProcessor`的参数：
- 1024 ：缓冲区大小（单位：样本数），表示每次处理的音频样本数量，选择1024是因为它是最接近640的2的幂(采样率为16000Hz时，640个样本对应的时长是：640 ÷ 16000 = 0.04秒（40毫秒），40毫秒是语音处理的一个常见帧长，既能保证实时性，又能提供足够的语音信息)，缓冲区大小会影响音频处理的延迟和性能
- 1 ：输入声道数，与之前设置的单声道保持一致
- 1 ：输出声道数，保持与输入声道数一致


**processor.onaudioprocess和getChannelData**

这部分代码临时存储采集到的音频数据，等待后续处理和发送，因为并不是每次采集完就要发送出去，缓存后再发效果可能更好；

`processor.onaudioprocess`：音频处理器回调函数设置，这个回调函数每当音频缓冲区填满时触发（约每1024个样本触发一次，至于为什么是1024，是因为上面createScriptProcessor设置参数1024）

`event.inputBuffer.getChannelData(0)` ：获取第0声道（单声道）的音频数据

`float32ToInt16(inputData)` ：将32位浮点音频数据转换为16位PCM格式(具体实现在下面的代码中)
```js
// 音频数据缓冲区
let audioBuffer = [];

// 处理音频数据
processor.onaudioprocess = (event) => {
  if (this.isRecording) {
    const inputData = event.inputBuffer.getChannelData(0);
    // 转换为16位PCM格式
    const pcmData = this.float32ToInt16(inputData);
    // 将音频数据添加到缓冲区
    audioBuffer.push(pcmData);
  }
};
```
之所以会有float32ToInt16函数，是因为：
- Web Audio API 采集的原始音频数据是 32位浮点格式 （范围：-1.0 到 1.0）
- 语音识别API 通常要求 16位PCM格式 （范围：-32768 到 32767）

PCM (Pulse Code Modulation) 脉冲编码调制，是一种将模拟信号转换为数字信号的方法：

1. 16位 ：表示每个音频样本用16位二进制数表示
   - 范围：-32768 到 32767（2^15 = 32768）
   - 分辨率：能够表示65536个不同的音频幅度级别
   - 动态范围：约96分贝（每增加1位，动态范围增加6分贝）
2. PCM格式的特点 ：
   - 无损编码：直接存储音频样本值，没有压缩
   - 广泛支持：几乎所有音频设备和API都支持
   - 标准格式：语音识别API通常要求使用16位PCM格式
```js
float32ToInt16(buffer) {
  const length = buffer.length;
  const result = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return result;
},
```
const result = new Int16Array(length); 创建一个整数数组(用于存储转换后的16位PCM格式的数据，Int16Array 就是一个严格限定只能存 16 位有符号整数的专用数组，它不是普通的 JS 数组，是为高性能、省内存、处理二进制数据而生的类型化数组，存储数据时会自动转换为16位有符号整数格式，即-32768到32767)
const s = Math.max(-1, Math.min(1, buffer[i])); 确保值在-1到1之间
负数处理 ： s < 0 ? s * 0x8000
  - 0x8000是32768的十六进制表示
  - 负数乘以32768得到-32768到0之间的值
- 正数处理 ： s * 0x7FFF
  - 0x7FFF是32767的十六进制表示
  - 正数乘以32767得到0到32767之间的值

**typedArray.set(array, offset)**

这个实际上并不是音频api，但也是我不懂的，第一次看到的时候还以为是数组的set方法，但是它不是数组的set方法，而是typedArray的set方法，用于将一个数组的元素复制到当前数组的指定位置。
- 将源数组的数据复制到目标 TypedArray 中
- 从指定的偏移量开始复制
- 是一种高效的二进制数据复制方法

可以看到这里是设置一个定时器，每400ms发送一次音频消息给服务器；这里的一些转换与上面学习的内容高度紧密结合，让我们来讲讲：
1. 首先合并缓冲区的音频数据，我们仍然创建一个Int16Array数组，用于存储合并后的音频数据，正如上面所说，严格限定只能存 16 位有符号整数，通过reduce计算这个数组的长度，buffer的长度则需要我们溯源audioBuffer，它在上面音频处理器回调函数中收集16位PCM格式的音频数据，而回调函数是缓冲区满触发，因此每个buffer的长度就是一个缓冲区大小，都是1024个样本。
2. 然后使用typedArray的set方法，将每个buffer的音频复制到合并后的数组中，偏移量从0开始，每次复制一个buffer的长度，偏移量增加buffer的长度。最后讲这个合并后的数组的二进制数据(mergedData.buffer)发送到服务器，由服务器处理；

<span style="color: green;">**这里可能引出一个问题，mergedData.buffer是从哪来的？**</span>

其实mergedData 是 Int16Array，它天生自带一个名叫.buffer的属性，是JS语法自带的。Int16Array只是一层 “视图”，真正的二进制数据存在buffer里。WebSocket的.send()方法不认识Int16Array，认识二进制原始数据：ArrayBuffer；因此这里发送的是buffer。

<span style="color: green;">**附上一个重点知识：websocket的send只能发送字符串、ArrayBuffer、Blob类型的数据**</span>

```js
// 每400ms发送一次音频数据
const sendInterval = setInterval(() => {
  if (this.isRecording && audioBuffer.length > 0 && this.socket && this.socket.readyState === WebSocket.OPEN) {
    // 合并缓冲区中的音频数据
    const mergedData = new Int16Array(audioBuffer.reduce((total, buffer) => total + buffer.length, 0));
    let offset = 0;
    audioBuffer.forEach(buffer => {
      mergedData.set(buffer, offset);
      offset += buffer.length;
    });
    
    // 发送音频数据到服务器
    this.socket.send(mergedData.buffer);
    
    // 清空缓冲区
    audioBuffer = [];
  }
}, 400);
```

**source.connect和processor.connect**

`source.connect(processor)`：将音频源连接到音频处理器

`processor.connect(audioContext.destination)`：将音频处理器连接到音频上下文的音频输出

这里可以顺便联系一下上面的一些问题，因为到这里基本就结束了，剩下的无非是设置属性，合并获取服务器端返回结果(这部分我们[后面](#mergeTranscriptionResults)再讲)<a id="bufferTimer"></a>
```js
this.isRecording = true;
this.audioContext = audioContext;
this.processor = processor;
this.stream = stream;

// 启动缓冲区处理定时器，每3秒检查一次
this.bufferTimer = setInterval(() => {
  this.mergeTranscriptionResults();
}, 3000);
```
#### 逻辑梳理与概念讲解 <span style="color: green;">（**重要**）</span>
首先梳理一下开始录音这部分代码的逻辑，就是：
1. 创建音频流
2. 创建音频上下文
3. 创建音频源和音频处理器
4. 连接音频节点
5. 启动缓冲区处理定时器，每3秒检查一次

对于我们这种初学者，肯定会想知道这些步骤具体都是怎么回事，音频流是什么，音频上下文是什么，这些都在做什么？现在我们来梳理：

每个步骤其实是环环相扣的，不过首先我们还是得先知道<span style="color: green;">**概念**</span>：
- `音频流`：就是从麦克风获取的音频数据流，它包含了音频数据的采样率、采样位数、声道数等信息。
- `音频上下文`：总控，各种功能都会基于它展开。
- `音频源`：音频数据的来源，比如麦克风、音频文件等。所以可以看到是音频上下文创建音频源，参数用的是音频流。意思就是往总控制室里接入麦克风信息，作为音频数据的源头
- `音频处理器`：音频数据的处理单元，用于对音频数据进行处理，可以看到回调函数中批量处理1024个样本的音频数据为16位PCM格式。

<span style="color: green;">**连接关系**</span>：可以看到最后这里音频源连接到音频处理器，音频处理器连接到音频上下文的音频输出，那么一切就都通畅了：

在总控制室(音频上下文)里：音频源(麦克风输入音频流信息)->音频处理器(批量转换16位PCM格式，这里省略定时器批量收集)->音频上下文的音频输出(扬声器/耳机：发送到服务器或播放)

**下次接着写，这里讲完音频api和开始录音的所有内容了，发送数据到服务器了，然后就是服务器再去请求大模型得到转写结果，websocket的onmessage接收服务器获取结果存入转录缓冲区，然后就对应上这里mergeTranscriptionResults函数操作转录缓冲区，下次接着快速写完停止录音，然后就转后端讲接收音频数据怎么处理，怎么发送请求大模型，最后再回来前端讲接收数据处理与字幕显示**
### 停止录音(关闭麦克风)
上面讲完了开始录音(开启麦克风)，这里顺便把停止录音(关闭麦克风)一起讲了：
```js
stopRecording() {
  if (this.isRecording) {
    // 发送停止转写的消息
    this.sendWebSocketMessage('stopTranscription', {});
    
    // 清除发送定时器
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }
    
    // 关闭音频处理
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isRecording = false;
    
    // 清除缓冲区处理定时器
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer);
      this.bufferTimer = null;
      console.log('停止转录缓冲区处理定时器');
    }
    
    // 最后一次合并转录结果
    this.mergeTranscriptionResults();
    
    console.log('停止录音');
    
  }
},
```
可以看到主要就是一些善后操作，发送关闭语音转写的信息，关闭音频处理节点，关闭音频流，关闭音频上下文之类的；清空各类定时器，并且进行最后一次合并转录结果(这部分逻辑涉及到服务端语音转写后返回的结果处理，所以在[后面](#)再讲)。但是毕竟和前面的开始录音讲解的语音api高度紧密相关，因此这里补充讲解：
#### 音频api讲解补充
**processor.disconnect**

很好理解，就是关闭音频处理节点，断开音频处理器与音频上下文的连接，防止内存泄漏。

**this.stream.getTracks().forEach(track => track.stop());**

这部分需要讲解一下这里的代码是什么意思：其实是把所有轨道都关闭，因为音频流是一个实时的流，不能像视频流那样直接关闭，需要关闭所有轨道，才能关闭音频流。所以这里需要遍历所有轨道，关闭每个轨道。

为什么关闭音频流需要这么复杂，而开启音频流却那么简单？

这是因为navigator.mediaDevices.getUserMedia() 是一个 高级API ，它封装了底层的复杂操作：
1. 权限管理 ：自动弹出权限请求对话框
2. 设备选择 ：自动选择默认麦克风
3. 参数配置 ：根据指定的参数（如采样率、声道数）配置音频设备
4. 流创建 ：返回一个完整的 MediaStream 对象
这些操作被浏览器内部处理，所以对开发者来说看起来很简单。

关闭音频流需要更细致的操作，主要原因是：
1. 资源释放：
   - 麦克风是系统资源，需要明确释放
   - 不释放会导致其他应用无法使用麦克风
   - 浏览器会一直显示麦克风正在使用的指示
2. 流的组成：
   - MediaStream 可能包含多个轨道（tracks）
   - 即使只请求了音频，也可能包含多个音频轨道
   - 每个轨道都需要单独停止
3. 底层设计：
   - 音频设备的控制是基于轨道（track）的
   - 停止整个流不会自动停止所有轨道
   - 需要显式停止每个轨道以确保资源释放

**this.audioContext.close();**

很好理解，就是关闭音频上下文，释放资源。

那么到此为止，关闭录音的内容就讲完了。


### 服务端处理音频数据(大模型请求)
现在可以开始讲解前端收集音频数据到服务端，服务端是如何处理，并且调用大模型实现语音转写的：

首先来看接收消息部分的内容：
#### 大体框架
```js
wss.on('connection', (ws, req, roomCode) => {
  ......
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
      ......
      if (parsed.type === 'startTranscription') {
        if (!speechService) {
          speechService = new SpeechService();
        }
        speechService.connect(t => {
          const room = meetingRoomManager.getRoom(roomCode);
          const nick = room?.members.find(m => m.socketId === ws.id)?.nickname || '未知';
          meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
            type: 'transcriptionResult',
            data: t,
            speaker: nick
          }));
        }, console.error, () => { });
      }
      if (parsed.type === 'stopTranscription') speechService?.sendEnd();
      ......
    } catch (e) { }
  });
  ......
})
```
可以看到分辨音频消息是通过isBinary参数来判断的，这个参数是ws自带的参数，能够自动识别，无需前端传递；在这里如果是二进制数据，就是音频数据，否则就是json字符串。我们有一个speechService对象，用于处理语音数据(这个我们稍后马上来讲解)，同时将这部分音频广播给其他用户，实现语音通话；

当前端开启麦克风，则会发送语音转写的websocket消息(startTranscription)，可以看到SpeechService对象在这里创建，并且连接，调用了一些连接方法，并进行广播，这部分因为涉及SpeechService对象，所以还是先不展开讲解；[后面](#connect)会把这部分代码再专门提出来讲解的。

当前端关闭麦克风，则会发送语音转写的websocket消息(stopTranscription)，可以看到SpeechService对象在这里调用sendEnd方法，断开连接，广播给语音通话的结束；

#### SpeechService讲解(处理数据与大模型请求)
可以看到转写解析的逻辑基本都是在这个对象结构内实现的，外部只能看到调用方法获取结果，实际怎么<span style="color:green">**通过websocket连接具体都封装在这里面(因为本身前后端通信就是依靠websocket，封装起来看起来不会那么乱)**</span>，那么现在来详解：
```js
const WebSocket = require('ws');
const crypto = require('crypto');
const config = require('./config');

class SpeechService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.callbacks = {
      onResult: null,
      onError: null,
      onClose: null
    };
  }

  // 生成WebSocket连接参数
  generateWsUrl() {
    const { appId, apiKey, apiSecret, url } = config.xfyun;

    // 生成UTC时间戳，格式：2025-09-04T15:38:07+0800
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const offsetSign = offset < 0 ? '+' : '-';
    const formattedOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}${offsetMinutes.toString().padStart(2, '0')}`;

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const utc = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;

    // 构造参数对象
    const params = {
      appId: appId,
      accessKeyId: apiKey,
      utc: utc,
      lang: 'autodialect',
      audio_encode: 'pcm_s16le',
      samplerate: 16000
    };

    // 对参数按key进行升序排序
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

    // 生成baseString
    let baseString = '';
    for (const [key, value] of Object.entries(sortedParams)) {
      baseString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
    }
    baseString = baseString.slice(0, -1); // 移除最后一个&符号

    // 生成signature
    const hmac = crypto.createHmac('sha1', apiSecret);
    hmac.update(baseString);
    const signature = hmac.digest('base64');

    // 构造最终的WebSocket URL
    let wsUrl = `${url}?`;
    for (const [key, value] of Object.entries(sortedParams)) {
      wsUrl += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
    }
    wsUrl += `signature=${encodeURIComponent(signature)}`;

    return wsUrl;
  }

  // 连接到讯飞API
  connect(onResult, onError, onClose) {
    this.callbacks.onResult = onResult;
    this.callbacks.onError = onError;
    this.callbacks.onClose = onClose;

    const wsUrl = this.generateWsUrl();
    console.log('Connecting to:', wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log('Connected to XFYun API');
      this.isConnected = true;
    });

    this.ws.on('message', (data) => {
      this.handleMessage(data);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    this.ws.on('close', () => {
      console.log('Disconnected from XFYun API');
      this.isConnected = false;
      if (this.callbacks.onClose) {
        this.callbacks.onClose();
      }
    });
  }

  // 发送音频数据
  sendAudio(audioData) {
    if (!this.isConnected) return;

    // 发送提取出的音频数据
    if (audioData && audioData.length > 0) {
      this.ws.send(audioData, { binary: true });
    }
  }

    // 发送提取出的音频数据
    if (audioData && audioData.length > 0) {
      this.ws.send(audioData, { binary: true });
    }
  }

  // 发送结束标志
  sendEnd() {
    if (!this.isConnected) return;

    // 生成唯一的sessionId
    const sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    // 发送结束标志，符合文档要求的格式
    const endMessage = JSON.stringify({ end: true, sessionId: sessionId });
    console.log('发送结束标志:', endMessage);
    this.ws.send(endMessage);
  }

  // 处理讯飞API返回的消息
  handleMessage(data) {
    try {
      console.log('收到讯飞API消息:', data);
      // 尝试解析JSON数据
      const result = JSON.parse(data);

      console.log('解析后的消息:', result);

      // 检查消息格式
      if (result.msg_type === 'action') {
        const actionData = result.data;
        if (actionData.action === 'started') {
          console.log('连接成功:', actionData);
        } else if (actionData.action === 'end') {
          console.log('会话结束:', actionData);
          if (actionData.code !== '0') {
            console.error('API错误:', actionData);
            if (this.callbacks.onError) {
              this.callbacks.onError(actionData);
            }
          }
        } else {
          console.log('未知动作类型:', actionData);
        }
      } else if (result.msg_type === 'result') {
        const resultData = result.data;
        // 处理不同格式的返回结果
        if (resultData.text) {
          // 直接返回文本
          const text = resultData.text;
          console.log('转写结果:', text || '无内容');
          if (this.callbacks.onResult) {
            this.callbacks.onResult(text);
          }
        } else if (resultData.cn && resultData.cn.st && resultData.cn.st.rt) {
          // 处理嵌套格式的返回结果
          const rt = resultData.cn.st.rt;
          if (rt && rt.length > 0) {
            let text = '';
            rt.forEach(item => {
              if (item.ws && item.ws.length > 0) {
                item.ws.forEach(ws => {
                  if (ws.cw && ws.cw.length > 0) {
                    ws.cw.forEach(cw => {
                      if (cw.w) {
                        text += cw.w;
                      }
                    });
                  }
                });
              }
            });
            console.log('转写结果:', text || '无内容');
            if (this.callbacks.onResult) {
              this.callbacks.onResult(text);
            }
          } else {
            console.log('转写结果: 无内容');
            if (this.callbacks.onResult) {
              this.callbacks.onResult('');
            }
          }
        } else {
          console.log('转写结果: 无内容');
          if (this.callbacks.onResult) {
            this.callbacks.onResult('');
          }
        }
      } else {
        console.log('未知消息类型:', result);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      console.error('原始消息:', data);
    }
  }

  // 关闭连接
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = SpeechService;
```
代码很多，让我们按照逻辑进行梳理，前端发送信息，首先是发送开始语音转写的请求，然后处理音频数据，缓冲区满发送请求转文字，最后结束转文字；因此最开始服务端会收到开始请求，创建SpeechService对象，connect连接；那么我们先来看连接的方法以及相关的内容：

<span style="color:green">**说白了SpeechService对象就是在处理讯飞api的websocket连接，我们会根据各个步骤拆解来讲都需要做什么，现在是websocket的外部结构，监听各个事件，调用不同方法**</span>

```js
// 连接到讯飞API
connect(onResult, onError, onClose) {
  this.callbacks.onResult = onResult;
  this.callbacks.onError = onError;
  this.callbacks.onClose = onClose;

  const wsUrl = this.generateWsUrl();
  console.log('Connecting to:', wsUrl);
  this.ws = new WebSocket(wsUrl);

  this.ws.on('open', () => {
    console.log('Connected to XFYun API');
    this.isConnected = true;
  });

  this.ws.on('message', (data) => {
    this.handleMessage(data);
  });

  this.ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  });

  this.ws.on('close', () => {
    console.log('Disconnected from XFYun API');
    this.isConnected = false;
    if (this.callbacks.onClose) {
      this.callbacks.onClose();
    }
  });
}
```
可以看到，<span style="color:green">connect方法中传入了三个回调函数</span>，分别是onResult、onError、onClose，接着<span style="color:green">生成了wsUrl，然后创建一个WebSocket对象，与讯飞API进行websocket连接</span>，设置open事件、message事件、error事件、close事件；这些回调函数分别在事件中使用，<span style="color:green">onResult没有直接显示，实际上被放到了handleMessage方法中使用，作用是获取转写结果后需要执行的逻辑，onError处理错误，onClose处理关闭连接；</span>
<a id="connect"></a>

这时候我们返回去看之前的connect方法的调用就很清晰了：
```js
speechService.connect(t => {
  const room = meetingRoomManager.getRoom(roomCode);
  const nick = room?.members.find(m => m.socketId === ws.id)?.nickname || '未知';
  meetingRoomManager.broadcastToRoom(roomCode, JSON.stringify({
    type: 'transcriptionResult',
    data: t,
    speaker: nick
  }));
}, console.error, () => { });
```
这里就是建立连接到讯飞api，onResult获取转写结果之后，将内容进行广播，广播到房间中的所有成员(前面的逻辑是在找到对应的房间，并且在广播信息中添加当前说话的用户昵称)；遇到错误就打印；关闭不做额外操作；

注意到连接到讯飞api是生成了wsUrl，然后创建一个WebSocket对象，与讯飞API进行websocket连接；那么为什么需要自己生成一个url呢？这其实是讯飞API的websocket地址，需要自己生成，因为讯飞API的websocket地址是动态的，需要根据用户id和密钥来生成。这在官方文档中是有说明的，那么接下来我们来看看如何生成讯飞API的websocket地址。

<span style="color:green">**如何连接讯飞api(生成讯飞API的websocket地址)**</span>

```js
// 生成WebSocket连接参数
generateWsUrl() {
  const { appId, apiKey, apiSecret, url } = config.xfyun;

  // 生成UTC时间戳，格式：2025-09-04T15:38:07+0800
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = Math.abs(offset % 60);
  const offsetSign = offset < 0 ? '+' : '-';
  const formattedOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}${offsetMinutes.toString().padStart(2, '0')}`;

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const utc = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;

  // 构造参数对象
  const params = {
    appId: appId,
    accessKeyId: apiKey,
    utc: utc,
    lang: 'autodialect',
    audio_encode: 'pcm_s16le',
    samplerate: 16000
  };

  // 对参数按key进行升序排序
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});

  // 生成baseString
  let baseString = '';
  for (const [key, value] of Object.entries(sortedParams)) {
    baseString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
  }
  baseString = baseString.slice(0, -1); // 移除最后一个&符号

  // 生成signature
  const hmac = crypto.createHmac('sha1', apiSecret);
  hmac.update(baseString);
  const signature = hmac.digest('base64');

  // 构造最终的WebSocket URL
  let wsUrl = `${url}?`;
  for (const [key, value] of Object.entries(sortedParams)) {
    wsUrl += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
  }
  wsUrl += `signature=${encodeURIComponent(signature)}`;

  return wsUrl;
}
```
这部分逻辑是在生成讯飞API的websocket地址时，需要根据用户id和密钥来生成。这些内容在[官方文档](https://www.xfyun.cn/doc/spark/asr_llm/rtasr_llm.html#_1-%E6%A6%82%E8%BF%B0)中都有说明。我们就是按照文档要求在做，这里我把原本文档的内容贴出来：
```
2.1 握手阶段
websocket 协议带参请求：
wss://office-api-ast-dx.iflyaisol.com/ast/communicate/v1?{请求参数}

常见的实际生产的一个 ws 握手请求的 url 示例如下，含义为实时转写 pcm 格式 16000 采样率的实时转写结果：
wss://office-api-ast-dx.iflyaisol.com/ast/communicate/v1?accessKeyId=bb1542cda0ab4696031e2f3244206479&appId=27cc644f&uuid=664e7e56f779492ca75a58839914164b&utc=2025-09-04T15%3A38%3A07%2B0800&audio_encode=pcm_s16le&lang=autodialect&samplerate=16000&signature=4PuTRjRmWbJecdZQoANVA4I9B0s%3D

#请求参数格式
key1=value1&key2=value2…（key 和 value 都需要进行 urlencode）
```
可以看到需要携带参数accessKeyId，appId，uuid，utc，lang，audio_encode，samplerate，signature。

其中，accessKeyId是用户id，appId是应用id，uuid是用户id，lang是语言，audio_encode是音频编码，samplerate是采样率，这些都是我们可以确定的，比如id是从讯飞api控制台注册用户获取，我们保存到项目的config文件中(敏感信息)，而lang，audio_encode，samplerate我们本就是参照官方的例子，实时转写 pcm 格式 16000 采样率，因此不需要改动；

只有utc是UTC时间戳，signature是签名，这两个需要我们处理。这整个方法也的确就是在生成，处理这个问题：
```js
// 生成UTC时间戳，格式：2025-09-04T15:38:07+0800
const now = new Date();
const offset = now.getTimezoneOffset();
const offsetHours = Math.abs(Math.floor(offset / 60));
const offsetMinutes = Math.abs(offset % 60);
const offsetSign = offset < 0 ? '+' : '-';
const formattedOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}${offsetMinutes.toString().padStart(2, '0')}`;

const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');
const seconds = now.getSeconds().toString().padStart(2, '0');

const utc = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;
```

首先是生成UTC时间戳，格式：2025-09-04T15:38:07+0800，可以看到我们调用了`now.getTimezoneOffset()`方法，来获取当前<span style="color:green">时间的时区偏移量，单位是分钟</span>。这个可能平时用的比较少，就是用来计算最后那个“+0800”的；因此说是偏移量；根据它的正负我们可以知道应该使用“+”还是“-”。

另外还有一个`padStart(2, '0')`方法，它能够确保数字是两位数，不足前面补0，非常实用；

最后就是很常规的时间获取，拼接，就不赘述了；

接下来是生成signature，同样来看看文档：
```
signature 生成

获取 baseString，步骤如下：

将所有请求参数（不包含 signature）按参数名进行升序排序
对每个参数的键和值分别进行 URL 编码
按照 "编码后的键=编码后的值&" 的格式拼接所有参数
移除最后一个多余的 "&" 符号，得到 baseString
示例: accessKeyId=XXX&appId=XXX&lang=cn&utc=2025-03-24T00%3A01%3A19%2B0800&uuid=edf53e32-6533-4d6a-acd3-fe4df14ee332
以 accessKeySecret 为密钥，对 baseString 进行 HmacSHA1 加密，得到二进制字节数组

对 HmacSHA1 加密后的字节数组进行 Base64 编码，得到最终的 signature

示例: IrrzsJeOFk1NGfJHW6SkHUoN9CU=
```
可以看到signature的生成逻辑在官方文档那个中写的很明确，先是根据我们的链接参数升序排序，拼接baseString，然后以 accessKeySecret为密钥，对baseString进行HmacSHA1加密，得到二进制字节数组，最后对这个数组进行Base64编码即可；

那么我们的代码就直接按照官方文档的指示完成就可以了：
```js
// 构造参数对象
const params = {
  appId: appId,
  accessKeyId: apiKey,
  utc: utc,
  lang: 'autodialect',
  audio_encode: 'pcm_s16le',
  samplerate: 16000
};
// 对参数按key进行升序排序
const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
  acc[key] = params[key];
  return acc;
}, {});

// 生成baseString
let baseString = '';
for (const [key, value] of Object.entries(sortedParams)) {
  baseString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
}
baseString = baseString.slice(0, -1); // 移除最后一个&符号

// 生成signature
const hmac = crypto.createHmac('sha1', apiSecret);
hmac.update(baseString);
const signature = hmac.digest('base64');

// 构造最终的WebSocket URL
let wsUrl = `${url}?`;
for (const [key, value] of Object.entries(sortedParams)) {
  wsUrl += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
}
wsUrl += `signature=${encodeURIComponent(signature)}`;

return wsUrl;
```
可以看到我们先准备了参数对象，然后新建一个对象(排序后参数)，对参数对象取key，对key进行升序排序，reduce读取升序排序的数组，通过key读取参数对象的value，给排序后对象赋值，得到一个排序后的参数对象(这样做是因为对象不能直接排序，只能新建一个对象，通过key来排序最可靠)；

排序后我们就要拼接baseString了，根据文档提示，按需将key，value编码，拼接起来；最后记得移除最后一个‘&’；

接着就是通过`crypto.createHmac`方法，以apiSecret为密钥对baseString进行`HmacSHA1`加密，得到二进制字节数组，最后对这个数组进行Base64编码`hmac.digest('base64');`就得到了signature；

最后将这些参数拼接起来，就得到了讯飞API的websocket地址；

<span style="color:green">**如何发送请求到讯飞api(发送音频信息给讯飞api处理)**</span>

上面的connect中还调用了handleMessage方法，来处理讯飞api返回的结果(还记得我们是从connect中延伸出来的吗哈哈)；但是按照逻辑，连接讯飞api，应该是发送消息给讯飞api，然后才是处理返回结果，因此我们先跳过handleMessage方法，[后面]再讲；接下来，前端开始发送音频数据，服务端接收到后进行处理，也就是sendAudio方法；那么我们来看这个方法以及相关的内容：
```js
// 发送音频数据
sendAudio(audioData) {
  if (!this.isConnected) return;

  // 发送提取出的音频数据
  if (audioData && audioData.length > 0) {
    this.ws.send(audioData, { binary: true });
  }
}
```
这个方法的调用在[大体框架](#大体框架)里，当speechService连接成功，也就是讯飞与服务器websocket连接成功后，对于前端发送的音频数据，会调用sendAudio方法，来发送音频数据给讯飞api处理。前端发送的音频数据我们就不多说了，16位pcm编码，采样率16000，单声道，通过websocket从前端发送到服务端，又由服务端发送到讯飞api，这里直接将音频数据发送出去即可。
```js
wss.on('connection', (ws, req, roomCode) => {
  ......
  ws.on('message', (data, isBinary) => {
    try {
      if (isBinary) {
        if (speechService?.isConnected) {
          speechService.sendAudio(data);
        }
        ...
      }
    }
  })
})
```
之前曾经多写过websocket帧解析的逻辑，实际上毫无必要，因为调用了ws库，已经自动解析(ws.onmessage事件会自动解析websocket帧，只有直接从TCP裸连接收到数据，才需要手动解析WebSocket帧)。

<span style="color:green">**如何解析讯飞api返回的结果**</span>

最后我们来看看handleMessage方法，这其实就是与讯飞api通信时获取到讯飞api返回的结果的解析过程：

这部分内容仍然需要看官方文档的指引，现在让我们来看看官方文档是怎么说的：
```
2.3 返回结果说明
返回结果为 JSON 格式，具体字段说明如下：

参数	类型	说明
action	string	结果标识：started 握手，result 结果，error 异常
code	string	结果码（见错误码）
data	string	结果数据
desc	string	描述
sid	string	会话 ID

2.3.1 转写结果
字段	含义	详细描述
data.cn.st.bg	句子开始时间	
data.cn.st.ed	句子结束时间	
data.cn.st.rt.ws.cw.w	词识别内容	具体的转写结果
data.cn.st.rt.ws.cw.lg	转写识别的语言	lang 为 autominor 时返回当前识别的语言
data.cn.st.rt.ws.cw.wp	词标识	n-普通词；s-顺滑词；p-标点；g-分段标识
data.cn.st.rt.ws.cw.wb	词开始时间	
data.cn.st.rt.ws.cw.we	词结束时间	
data.cn.st.rt.ws.cw.rl	角色分离标识	只有角色分离功能打开时出现，角色切换时变化（rl=1/2/3... 表示切换到该说话人；rl=0 表示继续上一说话人）
data.cn.st.type	结果类型标识	0-确定性结果；1-中间结果
data.seg_id	返回消息号	从 0 开始
data.cn、data.cn.st	音频段结果	无实际意义，按此结构解析
data.cn.st.rt	返回音频转写结果	音频转写结果内容从此字段解析
data.ls	是否为转写最终结果	true 表示最后一帧，false 表示非最后一帧
#2.3.2 返回结果示例
正常结果：
{
    "msg_type": "result",
    "res_type": "asr",
    "data": {
        "seg_id": 0,
        "cn": {
            "st": {
                "rt": [
                    {
                        "ws": [
                            {
                                "cw": [
                                    {
                                        "w": "项",
                                        "wp": "n",
                                        "rl": 0,
                                        "lg": "cn"
                                    }
                                ],
                                "wb": 15,
                                "we": 64
                            },
                            {
                                "cw": [
                                    {
                                        "w": "兽",
                                        "wp": "n",
                                        "lg": "cn"
                                    }
                                ],
                                "wb": 65,
                                "we": 95
                            },
                            {
                                "cw": [
                                    {
                                        "w": "南",
                                        "wp": "n",
                                        "lg": "cn"
                                    }
                                ],
                                "wb": 96,
                                "we": 147
                            }
                        ]
                    }
                ],
                "bg": 930,
                "type": "0",
                "ed": 2590
            }
        },
        "ls": false
    }
}
异常结果：
{
    "data": {
        "desc": "功能异常",
        "detail": {
            "domain": "ist_ed_test"
        },
        "fnType": "ast",
        "normal": false
    },
    "msg_type": "result",
    "res_type": "frc"
}
```
没什么重要内容，直接根据返回的结果来解析，即主要获取data.cn.st.rt.ws.cw.w；按结构解析即可；
```js
// 处理讯飞API返回的消息
handleMessage(data) {
  try {
    console.log('收到讯飞API消息:', data);
    // 尝试解析JSON数据
    const result = JSON.parse(data);

    console.log('解析后的消息:', result);

    // 检查消息格式
    if (result.msg_type === 'action') {
      const actionData = result.data;
      if (actionData.action === 'started') {
        console.log('连接成功:', actionData);
      } else if (actionData.action === 'end') {
        console.log('会话结束:', actionData);
        if (actionData.code !== '0') {
          console.error('API错误:', actionData);
          if (this.callbacks.onError) {
            this.callbacks.onError(actionData);
          }
        }
      } else {
        console.log('未知动作类型:', actionData);
      }
    } else if (result.msg_type === 'result') {
      const resultData = result.data;
      // 处理不同格式的返回结果
      if (resultData.text) {
        // 直接返回文本
        const text = resultData.text;
        console.log('转写结果:', text || '无内容');
        if (this.callbacks.onResult) {
          this.callbacks.onResult(text);
        }
      } else if (resultData.cn && resultData.cn.st && resultData.cn.st.rt) {
        // 处理嵌套格式的返回结果
        const rt = resultData.cn.st.rt;
        if (rt && rt.length > 0) {
          let text = '';
          rt.forEach(item => {
            if (item.ws && item.ws.length > 0) {
              item.ws.forEach(ws => {
                if (ws.cw && ws.cw.length > 0) {
                  ws.cw.forEach(cw => {
                    if (cw.w) {
                      text += cw.w;
                    }
                  });
                }
              });
            }
          });
          console.log('转写结果:', text || '无内容');
          if (this.callbacks.onResult) {
            this.callbacks.onResult(text);
          }
        } else {
          console.log('转写结果: 无内容');
          if (this.callbacks.onResult) {
            this.callbacks.onResult('');
          }
        }
      } else {
        console.log('转写结果: 无内容');
        if (this.callbacks.onResult) {
          this.callbacks.onResult('');
        }
      }
    } else {
      console.log('未知消息类型:', result);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    console.error('原始消息:', data);
  }
}
```
当然还是需要根据result.msg_type来判断是转写结果还是其他连接会话信息(比如开始，结束等)；如果result.msg_type是result，那么就根据resultData.cn.st.rt.ws.cw.w来解析；最后记得使用外部传入的回调函数this.callbacks.onResult(text);来返回结果，我们要靠这个实现广播效果呢哈哈。

### 用户端数据处理与字幕显示
我们讲完了用户端处理并发送音频数据，又讲完服务端接收数据，与讯飞api交互，最后发送给用户端；现在我们来讲讲用户端如何处理数据，显示字幕。

只说了语音转写功能，我们其实这部分是会顺便实现<span style="color:green">**语音通话**</span>功能的，正如[之前](#大体框架)里面的代码中，服务端收到音频信息，是会广播播放的；

可以看到下面的代码里，如果收到二进制数据(音频数据),我们会直接播放`this.playAudioData(new Int16Array(event.data));`回看之前的代码，通过websocket只能发送ArrayBuffer，而playAudioData需要的是Int16Array，因此这里需要转换一下。<span style="color:green">**因为ArrayBuffer只是一段内存，没有格式、没有结构。套上new Int16Array()告诉播放器：这段二进制是16位PCM音频，把这段二进制数据，按16位有符号整数格式去解析，才能正常播放**</span>
```js
export default {
  ......
  methods: {
    ......
    setupWebSocket() {
      try {
        this.socket.onmessage = (event) => {
          try {
            // 检查是否是二进制数据（音频数据）
            if (event.data instanceof ArrayBuffer) {
              console.log(`收到音频数据，长度: ${event.data.byteLength}`);
              // 处理音频数据
              this.playAudioData(new Int16Array(event.data));
              return;
            } else if (event.data instanceof Blob) {
              console.log(`收到音频数据，大小: ${event.data.size}`);
              // 将 Blob 转换为 ArrayBuffer
              event.data.arrayBuffer().then(arrayBuffer => {
                console.log(`Blob转换为ArrayBuffer，长度: ${arrayBuffer.byteLength}`);
                this.playAudioData(new Int16Array(arrayBuffer));
              }).catch(error => {
                console.error(`Blob转换为ArrayBuffer失败:`, error);
              });
              return;
            }
            
            console.log(`收到WebSocket消息: ${event.data}`);
            const data = JSON.parse(event.data);
            if (data.type === 'canvasState') {
              ......
            } 
            ......
            else if (data.type === 'transcriptionResult') {
              // 处理语音转写结果
              console.log(`收到语音转写结果: ${data.data || '无内容'} from ${data.speaker || '未知'}`);
              const speaker = data.speaker || '未知';
              const transcription = data.data || '';
              console.log(`当前转写内容: ${transcription || '无内容'} 发言人: ${speaker}`);
              
              // 将转写结果添加到缓冲区
              if (transcription) {
                this.transcriptionBuffer.push({ text: transcription, speaker: speaker, timestamp: Date.now() });
                console.log('添加到转录缓冲区:', transcription, '发言人:', speaker);
              }
              
              // 更新用户转录结果
              if (transcription) {
                this.userTranscriptions[speaker] = transcription;
                
                // 清除之前的定时器
                if (this.transcriptionTimers[speaker]) {
                  clearTimeout(this.transcriptionTimers[speaker]);
                }
                
                // 设置新的定时器，5秒后清除该用户的字幕
                this.transcriptionTimers[speaker] = setTimeout(() => {
                  delete this.userTranscriptions[speaker];
                  delete this.transcriptionTimers[speaker];
                }, 5000); // 5000ms = 5秒
              }
            } else if (data.type === 'transcriptionError') {
              // 处理语音转写错误
              console.error(`语音转写错误: ${data.data}`);
              this.showToastMessage(`语音转写错误: ${data.data}`, 'error');
            }
            ......
          } catch (error) {
            console.error(`处理WebSocket消息时出错: ${error}`);
          }
        };
      }
    }
  }
}
```
接下来根据获取到的转写结果(transcriptionResult)，进行处理和显示字幕；还记得后端websocket连接讯飞api时，回调函数中将转写结果与用户昵称等合并起来，一起广播；就是为了这里解析出来，然后能够实现在字幕前添加发言人昵称的效果；可以看到我们还将转写结果添加到了缓冲区，这个我们[稍后](#mergeTranscriptionResults)就讲；这里涉及到字幕实现的内容，也许需要回顾一下前端在字幕功能上实现的写法：
```js
<div class="multi-subtitle-container">
  <div v-for="(transcription, speaker) in userTranscriptions" :key="speaker" class="subtitle-container">
    <div class="subtitle">
      <span class="speaker-name">{{ speaker }}:</span> {{ transcription }}
    </div>
  </div>
</div>
```
可以看到我们根据userTranscriptions对象，来遍历每个用户的转写结果，然后根据speaker来添加发言人昵称。最后将结果显示在字幕上。所以再看到上面的内容就能更好地理解了：当有转写结果时，获取转写结果+转写昵称，添加到userTranscriptions对象中，这样v-for就会及时识别响应式变化，实时显示字幕；同时我们设置定时器，5秒后，删除该用户的字幕，而且在前面添加检测并删除定时器的机制，这是因为字幕转写是实时的，这里可能需要用一个例子来解释：实时语音转写并不只是把一段录音发送上去，然后解析回来。而是连续地解析，例如，用户发言“生活就像海洋”，那么发送音频信号以及收到的解析可能随时间分为三条：
- 0-0.4s:生活
- 0.4-0.8s:生活就像
- 0.8-1.2s:生活就像海洋

这也是因为用户看到的字幕结果应该是“生活”→“生活就像”→“生活就像海洋”；而不是生活，就像，海洋，这样的字幕效果很差；因此讯飞api的语音转写功能返回的结果是自动连续的，那么对于我们处理的人来说就不需要拼接了，直接替换为新的转写内容即可，非常方便。因此每次收到新的转写结果，我们检测并删除定时器，替换转写结果，并重新定时5s，5s后字幕自动消失，防止挡住视野，同时删除对应的定时器。

<a id="mergeTranscriptionResults"></a>
讲完了字幕的实现，我们可以回来讲一下刚刚提到的，转写结果添加到了缓冲区的实现和原因，这其实是为了支持后面的[会议摘要功能](#会议摘要功能)。简单来说，会议摘要需要我们把会议内容发送给大模型，大模型才能够帮我们总结；因此我们需要实时整理转写结果，同样也是因为上面提到的字幕连续功能，会导致我们收到的消息有很多冗余：
- 0-0.4s:生活
- 0.4-0.8s:生活就像
- 0.8-1.2s:生活就像海洋

如果直接收集了发送出去，那大模型会觉得参会人员口吃(开玩笑)，但是确实效果不好，也浪费token。因此我们设计缓冲区，定时处理整理这些转写结果。还记得在[前面](#bufferTimer)这部分稍微往前一点的代码中，是提到过这个缓冲区定时器的，现在是时候讲解了：

```js
// 合并缓冲区中的转录结果
mergeTranscriptionResults() {
  if (this.transcriptionBuffer.length === 0) return;
  
  // 按时间排序
  this.transcriptionBuffer.sort((a, b) => a.timestamp - b.timestamp);

  // 带有时间的结果数组
  const textWIthTime = [];
  
  // 按发言人分组，携带时间信息
  const groupedBySpeaker = {};
  this.transcriptionBuffer.forEach(item => {
    if (item.text && item.text.trim() !== '') {
      if (!groupedBySpeaker[item.speaker]) {
        groupedBySpeaker[item.speaker] = [];
      }
      groupedBySpeaker[item.speaker].push(item);
    }
  });
  
  // 按发言人分组对转录结果进行去重，多人发言内容同时去重的话太过混乱
  for (const speaker in groupedBySpeaker) {
    const items = groupedBySpeaker[speaker];
    // 去除前缀重复的内容，只保留最长的版本
    const uniqueItems = this.removePrefixDuplicates(items);
    
    // 将去重后的结果添加到时间结果数组
    uniqueItems.forEach(item => {
      textWIthTime.push(item);
    });
  }

  // 时间结果数组中存储了携带时间、去重完毕的发言结果，排序后提取文本内容
  textWIthTime.sort((a, b) => a.timestamp - b.timestamp);
  textWIthTime.forEach(item => {
    const transcriptionItem = { speaker: item.speaker, text: item.text };
    if (this.transcriptionHistory.length === 0) {
      // 如果历史记录为空，直接添加
      this.transcriptionHistory.push(transcriptionItem);
      console.log('添加到转录历史:', transcriptionItem);
    } else {
      const lastItem = this.transcriptionHistory[this.transcriptionHistory.length - 1];
      
      // 检查是否是同一个发言人
      if (lastItem.speaker === item.speaker) {
        // 检查当前文本是否是历史记录最后一条的前缀
        if (this.isPrefixWithPunctuation(item.text, lastItem.text)) {
          // 如果是前缀，不添加
          console.log('当前文本是历史记录最后一条的前缀，不添加:', item.text);
        } 
        // 检查历史记录最后一条是否是当前文本的前缀
        else if (this.isPrefixWithPunctuation(lastItem.text, item.text)) {
          // 如果是前缀，替换历史记录最后一条
          this.transcriptionHistory[this.transcriptionHistory.length - 1] = transcriptionItem;
          console.log('替换历史记录最后一条:', transcriptionItem);
        } 
        // 如果不是前缀关系，且不完全重复，添加到历史记录
        else if (lastItem.text !== item.text) {
          this.transcriptionHistory.push(transcriptionItem);
          console.log('添加到转录历史:', transcriptionItem);
        }
      } else {
        // 不同发言人，直接添加
        this.transcriptionHistory.push(transcriptionItem);
        console.log('添加到转录历史:', transcriptionItem);
      }
    }
  });
  
  // 清空缓冲区
  this.transcriptionBuffer = [];
},

// 去除前缀重复的内容，只保留最长的版本
removePrefixDuplicates(items) {
  if (items.length <= 1) return items;
  
  // 按长度降序排序，必须携带时间信息这里才能按照长度去排序，否则会破坏时间顺序
  // 长度排序是为了方便后续的前缀检查，最长的先进入数组，确保前缀检查时，最长的文本在数组的前面，不需要替换
  items.sort((a, b) => b.text.length - a.text.length);
  
  const uniqueItems = [];
  
  for (let i = 0; i < items.length; i++) {
    const currentItem = items[i];
    let isPrefix = false;
    
    // 检查是否是已添加文本的前缀（忽略标点符号）
    for (let j = 0; j < uniqueItems.length; j++) {
      if (this.isPrefixWithPunctuation(currentItem.text, uniqueItems[j].text  )) {
        isPrefix = true;
        break;
      }
    }
    
    if (!isPrefix) {
      uniqueItems.push(currentItem);
    }
  }
  
  return uniqueItems;
},

// 检查text1是否是text2的前缀（忽略所有标点符号）
isPrefixWithPunctuation(text1, text2) {
  // 去除所有标点符号和空白字符
  const cleanText1 = text1.replace(/[\p{P}\s]+/gu, '');
  const cleanText2 = text2.replace(/[\p{P}\s]+/gu, '');
  
  // 检查cleanText1是否是cleanText2的前缀
  return cleanText2.startsWith(cleanText1);
},
```
可以看到逻辑还是比较复杂的，在处理多人发言转写，并且转写内容重复，时间分片缓冲处理时，需要考虑多个方面，包括但不限于：
- 转写结果去重时，需要移除标点符号的影响，比如两个相同的转写结果，其中一个开头带了一个句号，虽然不同，也需要去重；
- 因为按时间分片处理，两个相同的转写结果可能被划分到两个缓冲区，因此需要添加对上一个缓冲区最后一个转写结果的去重判断；

可以看到mergeTranscriptionResults逻辑中主要是将转写结果添加到transcriptionHistory数组中，通过时间排序，按发言人分组对发言内容进行处理并汇总到textWIthTime，之后进行时间排序保障发言顺序，最后比对上一个时间切片的最后一句转写结果进行最后去重，并将结果添加到transcriptionHistory数组中。

<span style="color:green">**简而言之：根据发言人分组，分组后对发言内容去重并汇总，对汇总结果时间排序，最后进行补充逻辑处理，存入转写历史的结果数组中。**</span>

详细来看，分组后，对每个人的发言内容，执行removePrefixDuplicates逻辑，removePrefixDuplicates会对发言内容根据长度降序排序，确保最长的文本在数组的前面，这样就不需要替换，省去一部分逻辑。<span>**但这么做会破坏时间顺序，这也是为什么我们要携带时间信息，并且最后汇总后时间排序**</span>；长度排序后会进行前缀检查，遍历所有文本，如果有前缀，那么最长的肯定已经在数组中，直接忽视，无前缀则进入结果数组，最后将结果数组返回；

前缀检查使用的是isPrefixWithPunctuation函数，它的逻辑非常简单，核心是startsWith方法，不过在此之前，我们<span style="color:green">**需要预防转写结果中标点符号和空白字符的干扰**</span>，因此函数逻辑中会先移除所有标点符号和空白字符，然后再使用startsWith方法检查text1是否是text2的前缀。

得到去重完毕后的时间结果数组textWIthTime，我们对这个数组进行时间排序，确保每个发言人的转写结果按时间顺序排列。最后，我们对这个数组进行补充逻辑处理，<span style="color:green">**因为有可能出现两个相同的转写结果被划分到两个时间片里，需要我们发信啊去重，因此要获取上一个时间切片的最后一句转写结果，与当前时间切片的第一句转写结果进行比较，看看相互的前缀关系，保留更长的一条，**</span>没有前缀关系则直接存入转写历史的结果数组中。

至此，转写结果的前端处理与字幕显示就完全结束了。也讲解了mergeTranscriptionResults的实现，这其实不能算是字幕相关的内容，它主要是为了下面的会议摘要功能的实现提供数据基础。那么后面我们就只需要看会议摘要功能是怎么利用这些数据调用大模型生成会议摘要的。


## 会议摘要功能
### 会议摘要功能前端实现
会议生成摘要的功能主要是后端实现，前端就负责展示：
```js
......
<button @click="generateSummary">生成摘要</button>
......
<div v-if="summary" class="summary-container">
  <h4>会议摘要:</h4>
  <div class="summary-content" v-html="summary"></div>
  <button @click="clearSummary">清空摘要</button>
</div>
```
生成摘要的方法也正如之前所说，先合并转录结果，保障收集信息(发言内容)的实时性和准确性，再提取白板内容，最后向服务端发送请求，将白板内容与发言内容都发送出去，后端去调用大模型生成摘要，最后根据结果展示摘要。
```js
async generateSummary() {
  try {
    // 先合并转录结果
    this.mergeTranscriptionResults();
    // 提取白板内容
    const whiteboardContent = this.elements.map(element => {
      if (element.type === 'text') {
        return `文本: ${element.text}`;
      } else if (element.type === 'rectangle') {
        return '矩形图形';
      } else if (element.type === 'circle') {
        return '圆形图形';
      } else if (element.type === 'diamond') {
        return '菱形图形';
      } else if (element.type === 'arrow') {
        return '箭头图形';
      } else if (element.type === 'pen') {
        return '手绘图形';
      }
      return '';
    }).filter(Boolean).join('\n');
    
    if (!whiteboardContent) {
      this.showToastMessage('白板内容为空，请先添加内容', 'info');
      return;
    }
    
    const response = await fetch('http://192.168.153.168:8080/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        whiteboardContent,
        transcriptionHistory: this.transcriptionHistory.map(item => {
          if (typeof item === 'object' && item.text) {
            return `${item.speaker}: ${item.text}`;
          }
          return item;
        }).join('\n')
      })
    });
    
    const result = await response.json();
    if (result.success) {
      this.summary = result.summary;
    } else {
      console.error('生成摘要失败:', result.error);
    }
  } catch (error) {
    console.error('发送数据失败:', error);
  }
},
clearSummary() {
  this.summary = '';
},
```
### 会议摘要功能后端实现
真正与大模型交互的是后端，后端会根据前端发送的白板内容与发言内容，调用大模型生成会议摘要。让我们来看接口
```js
app.post('/api/generate-summary', async (req, res) => {
  try {
    const s = new SummaryService();
    const sum = await s.generateSummary(req.body.whiteboardContent, req.body.transcriptionHistory);
    res.json({ success: true, summary: sum });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
```
可以看到和语音转写功能实现类似，都会new一个对象，将另外的websocket连接内容封装在对象中实现；那么接下来我们来看会议摘要大模型的连接实现(SummaryService);
```js
const WebSocket = require('ws');
const CryptoJS = require('crypto-js');
const config = require('./config');

class SummaryService {
  constructor() {
    this.appId = config.xfyun.appId;
    this.apiKey = config.xfyun.apiKey;
    this.apiSecret = config.xfyun.apiSecret;
  }

  // 生成会议摘要
  async generateSummary(whiteboardContent, transcriptionHistory) {
    return new Promise(async (resolve, reject) => {
      try {
        // 生成WebSocket连接URL
        const wsUrl = await this.generateWebSocketUrl();

        // 构建请求数据
        const requestData = {
          header: {
            app_id: this.appId,
            uid: 'user_' + Date.now()
          },
          parameter: {
            chat: {
              domain: '4.0Ultra',
              temperature: 0.5,
              max_tokens: 32768
            }
          },
          payload: {
            message: {
              text: [
                {
                  role: 'system',
                  content: '你是一个会议摘要助手，需要根据语音转写记录和白板内容生成会议摘要，包括核心结论、待办事项等。'
                },
                {
                  role: 'user',
                  content: `请根据以下内容生成会议摘要：\n\n语音转写记录：${transcriptionHistory}\n\n白板内容：${whiteboardContent}`
                }
              ]
            }
          }
        };

        // 建立WebSocket连接
        const ws = new WebSocket(wsUrl);

        let summary = '';
        let isComplete = false;

        ws.on('open', () => {
          // 发送请求
          ws.send(JSON.stringify(requestData));
        });

        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data);

            // 处理响应
            if (response.header.code === 0) {
              // 提取摘要内容
              if (response.payload && response.payload.choices && response.payload.choices.text) {
                response.payload.choices.text.forEach(item => {
                  summary += item.content;
                });
              }

              // 检查是否完成
              if (response.header.status === 2) {
                isComplete = true;
                ws.close();
                resolve(summary);
              }
            } else {
              console.error('API Error:', response.header.message);
              ws.close();
              reject(new Error(response.header.message));
            }
          } catch (error) {
            console.error('Error parsing response:', error);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        ws.on('close', () => {
          if (!isComplete) {
            reject(new Error('WebSocket connection closed before completing'));
          }
        });

        // 超时处理
        setTimeout(() => {
          if (!isComplete) {
            ws.close();
            reject(new Error('Request timeout'));
          }
        }, 60000);

      } catch (error) {
        console.error('Error generating summary:', error);
        resolve('生成摘要失败，请重试。');
      }
    });
  }

  // 生成WebSocket连接URL
  async generateWebSocketUrl() {
    return new Promise((resolve, reject) => {
      try {
        const apiKey = this.apiKey;
        const apiSecret = this.apiSecret;
        const url = config.xfyun.spark.url;
        const host = new URL(url).host;
        const date = new Date().toGMTString();
        const algorithm = 'hmac-sha256';
        const headers = 'host date request-line';
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v4.0/chat HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        const authorization = Buffer.from(authorizationOrigin).toString('base64');
        const finalUrl = `${url}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
        resolve(finalUrl);
      } catch (error) {
        reject(error);
      }
    });
  }

  // 生成模拟摘要
  getMockSummary(whiteboardContent, transcriptionHistory) {
    return `# 会议摘要\n\n## 核心结论\n1. 会议讨论了项目的整体架构设计\n2. 确定了技术栈选型：前端使用Vue.js，后端使用Node.js\n3. 制定了项目开发计划，分为三个阶段\n\n## 待办事项\n1. 完成前端白板组件的开发\n2. 实现实时通信功能\n3. 集成AI语音转写和图形识别功能\n4. 进行系统测试和性能优化\n\n## 会议参与者\n- 前端开发团队\n- 后端开发团队\n- 产品经理\n\n会议时间：${new Date().toLocaleString()}`;
  }
}

module.exports = SummaryService;
```
可以看到相对来说代码比较简单，没有什么处理逻辑，只是按照[官方文档](https://www.xfyun.cn/doc/spark/general_url_authentication.html)生成动态的WebSocket连接URL，然后websocket连接，其中有一些配置，比如大模型提示词等，让我们来结合官方文档逐步讲解：

#### 生成WebSocket连接URL
稍微看两眼generateSummary就会注意到前几个步骤就需要我们生成url，因此先讲generateWebSocketUrl，让我们先来看看官方文档在生成url方面的文档：
```
1.2 鉴权参数
参数	类型	必须	说明	示例
host	string	是	请求的主机	aichat.xf-yun.com(使用时需替换为实际使用的接口地址)
date	string	是	当前时间戳，采用RFC1123格式，时间偏差需控制在300s内	Fri, 05 May 2023 10:43:39 GMT
GET	string	是	请求方式	/v1.1/chat HTTP/1.1
authorization	string	是	base64编码的签名信息	参考下方生成方式
最终url需要的参数如上，下方以Python为例进行鉴权参数的生成示例，开发者如果使用其它开发语言可以按照相同时间戳和apikey等常量来逐步生成参数和下方示例比对，确保鉴权步骤无误

#1.2.1 date参数生成规则
from datetime import datetime
from time import mktime
from wsgiref.handlers import format_date_time

cur_time = datetime.now()
date = format_date_time(mktime(cur_time.timetuple()))
# 假使生成的date和下方使用的date = Fri, 05 May 2023 10:43:39 GMT

#1.2.2 authorization参数生成规则
1）到控制台获取APIKey 和APISecret参数

2）利用上方的date动态拼接生成字符串tmp，这里以星火url为例，实际使用需要根据具体的请求url替换host和path。

tmp = "host: " + "spark-api.xf-yun.com" + "\n"
tmp += "date: " + date + "\n"
tmp += "GET " + "/v1.1/chat" + " HTTP/1.1"
"""上方拼接生成的tmp字符串如下
host: spark-api.xf-yun.com
date: Fri, 05 May 2023 10:43:39 GMT
GET /v1.1/chat HTTP/1.1
"""

3）利用hmac-sha256算法结合APISecret对上一步的tmp签名，获得签名后的摘要tmp_sha。

import hmac
import hashlib
# 此处假设APISecret = MjlmNzkzNmZkMDQ2OTc0ZDdmNGE2ZTZi 
tmp_sha = hmac.new(self.APISecret.encode('utf-8'), tmp.encode('utf-8'), 						digestmod=hashlib.sha256).digest()
"""此时生成的tmp_sha结果如下
b'\xcf\x98\x07v\xed\xe9\xc5Ux\x0032\x93\x8e\xbb\xc0\xe5\x83C\xda\xba\x05\x0c\xd1\xdew\xccN7?\r\xa4'
"""

4）将上方的tmp_sha进行base64编码生成signature

import base64
signature = base64.b64encode(tmp_sha).decode(encoding='utf-8')
"""此时生成的结果如下
z5gHdu3pxVV4ADMyk467wOWDQ9q6BQzR3nfMTjc/DaQ==
"""

5）利用上面生成的signature，拼接下方的字符串生成authorization_origin

# 假设步骤1控制台获取的APIKey=addd2272b6d8b7c8abdd79531420ca3b
authorization_origin = f"api_key=\"{api_key}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"{signature}\""
"""此时生成的authorization_origin字符串如下
api_key="addd2272b6d8b7c8abdd79531420ca3b", algorithm="hmac-sha256", headers="host date request-line", signature="z5gHdu3pxVV4ADMyk467wOWDQ9q6BQzR3nfMTjc/DaQ="
"""

6）最后再将上方的authorization_origin进行base64编码,生成最终的authorization

authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
"""此时生成的authorization如下
YXBpX2tleT0iYWRkZDIyNzJiNmQ4YjdjOGFiZGQ3OTUzMTQyMGNhM2IiLCBhbGdvcml0aG09ImhtYWMtc2hhMjU2IiwgaGVhZGVycz0iaG9zdCBkYXRlIHJlcXVlc3QtbGluZSIsIHNpZ25hdHVyZT0iejVnSGR1M3B4VlY0QURNeWs0Njd3T1dEUTlxNkJRelIzbmZNVGpjL0RhUT0i
"""

#1.2.3 生成最终url
将鉴权参数组合成最终的键值对，并urlencode生成最终的握手url。开发者可先根据上面的步骤一步步进行参数校验，确保生成的参数无误。

from urllib.parse import urlencode

v = {
		"authorization": authorization, # 上方鉴权生成的authorization
        "date": date,  # 步骤1生成的date
    	"host": "spark-api.xf-yun.com" # 请求的主机名，根据具体接口替换
}
url = "wss://spark-api.xf-yun.com/v1.1/chat?" + urlencode(v)
"""生成的最终url如下
wss://spark-api.xf-yun.com/v1.1/chat?authorization=YXBpX2tleT0iYWRkZDIyNzJiNmQ4YjdjOGFiZGQ3OTUzMTQyMGNhM2IiLCBhbGdvcml0aG09ImhtYWMtc2hhMjU2IiwgaGVhZGVycz0iaG9zdCBkYXRlIHJlcXVlc3QtbGluZSIsIHNpZ25hdHVyZT0iejVnSGR1M3B4VlY0QURNeWs0Njd3T1dEUTlxNkJRelIzbmZNVGpjL0RhUT0i&date=Fri%2C+05+May+2023+10%3A43%3A39+GMT&host=spark-api.xf-yun.com
"""
```
结合官方文档，我们再回去看代码，就会更加清晰：

首先我们将所需的信息，包括用户id、应用id、密钥、时间戳、请求方式、请求url等，都封装在config中，方便调用与保密；然后根据官方文档的要求：

date参数是GMT格式，那么我们js刚好有toGMTString()方法，可以直接调用生成；
```js
const date = new Date().toGMTString();
```

接着是authorization参数，根据官方文档可以看到首先是tmp字符串的拼接，需要host、date、请求方式GET /v1.1/chat HTTP/1.1；对于js可以直接使用模版字符串实现：
```js
const host = new URL(url).host;
const date = new Date().toGMTString();
......
const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v4.0/chat HTTP/1.1`;
```

然后是利用hmac-sha256算法结合APISecret对上一步的tmp签名，并进行base64编码生成signature
```js
const apiSecret = this.apiSecret;
......
const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v4.0/chat HTTP/1.1`;
const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
const signature = CryptoJS.enc.Base64.stringify(signatureSha);
```

然后利用signature，拼接字符串生成authorization_origin，这里在上面提前定义，写起来简约美观一些；然后将authorization_origin进行base64编码生成最终的authorization
```js
const algorithm = 'hmac-sha256';
const headers = 'host date request-line';
......
const signature = CryptoJS.enc.Base64.stringify(signatureSha);
const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
const authorization = Buffer.from(authorizationOrigin).toString('base64');
```

最后得到所有需要的信息，拼接就能得到最终url，当然，作为url参数，需要encodeURIComponent编码一下
```js
const finalUrl = `${url}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
```

#### 请求大模型
<span style="color:green">**请求参数的配置——对话内容**</span>

有了url建立websocket连接，可以发送请求和接收响应了，但在此之前我们需要准备一下请求参数(对话内容)，这部分在另一个[官方文档](https://www.xfyun.cn/doc/spark/Web.html#_1-%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E)中，这部分内容很简单，直接贴官方示例：
```
3.1 请求示例
# 参数构造示例如下
{
        "header": {
            "app_id": "12345",
            "uid": "12345"
        },
        "parameter": {
            "chat": {
                "domain": "generalv3.5",
                "temperature": 0.5,
                "max_tokens": 1024, 
            }
        },
        "payload": {
            "message": {
                # 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
                # 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
                "text": [
                    #如果传入system参数，需要保证第一条是system
                    {"role":"system","content":"你现在扮演李白，你豪情万丈，狂放不羁；接下来请用李白的口吻和用户对话。"} #设置对话背景或者模型角色
                    {"role": "user", "content": "你是谁"} # 用户的历史问题
                    {"role": "assistant", "content": "....."}  # AI的历史回答结果
                    # ....... 省略的历史对话
                    {"role": "user", "content": "你会做什么"}  # 最新的一条问题，如无需上下文，可只传最新一条问题
                ]
        }
    }
}
```
根据需要我们进行配置，参数的意思在官方文档有详解，这里大致了解一下：

首先需要的就是appid，这个我们已经封装在config中，直接调用；uid非必填，随便用时间生成都行；

parameter.chat部分主要配置模型相关参数，
- `domain: '4.0Ultra',`表示我们使用的是4.0Ultra模型；
- temperature是核采样阈值：取值越高随机性越强，即相同的问题得到的不同答案的可能性越大；取值范围 (0，1] ，默认值0.5；
- max_tokens很好理解，就是模型回答的tokens的最大长度；

payload.message.text部分就是提示词：

- role必填，很好理解是角色，system用于设置对话背景（仅Max、Ultra版本支持）；user表示是用户的问题；assistant表示AI的回复
- content是用户和AI的对话内容
```js
text: [
  {
    role: 'system',
    content: '你是一个会议摘要助手，需要根据语音转写记录和白板内容生成会议摘要，包括核心结论、待办事项等。'
  },
  {
    role: 'user',
    content: `请根据以下内容生成会议摘要：\n\n语音转写记录：${transcriptionHistory}\n\n白板内容：${whiteboardContent}`
  }
]
```
像我们这里就配置了对话背景；然后配置用户问题，将前端传过来的语音转写记录，白板内容拼接起来，作为用户问题发送给大模型；

<span style="color:green">**websocket连接**</span>

到这里我们就完成了请求参数的配置，接下来就是建立websocket连接发送请求和接收响应了。直接根据url连接，将请求参数(对话内容)直接发送；
```js
// 建立WebSocket连接
const ws = new WebSocket(wsUrl);

let summary = '';
let isComplete = false;

ws.on('open', () => {
  // 发送请求
  ws.send(JSON.stringify(requestData));
});
```
websocket连接我们已经做了不少，并不困难，主要还是需要从官方文档中了解返回数据，才知道如何处理：

这是官方文档给出的响应示例
```
4.1响应示例
在不返回检索信源的情况下，大模型流式返回结构如下：

# 接口为流式返回，此示例为最后一次返回结果，开发者需要将接口多次返回的结果进行拼接展示
{
    "header":{
        "code":0,
        "message":"Success",
        "sid":"cht000cb087@dx18793cd421fb894542",
        "status":2
    },
    "payload":{
        "choices":{
            "status":2,
            "seq":0,
            "text":[
                {
                    "content":"我可以帮助你的吗？",
                    "role":"assistant",
                    "index":0
                }
            ]
        },
        "usage":{
            "text":{
                "question_tokens":4,
                "prompt_tokens":5,
                "completion_tokens":9,
                "total_tokens":14
            }
        }
    }
}
```
参数的意思在官方文档都有详解，我这里只简要讲核心：
- response.header.code：表示请求是否成功，0表示成功，其他值表示失败；
- response.header.status：表示响应是否完成，取值为`[0,1,2]`；0代表首次结果；1代表中间结果；2代表最后一个结果；
- response.payload.choices.text：是一个数组，内部对象表示大模型的回复数据结构，包含一些格式，比如role角色等，**主要关注content属性是回复的文本内容**；
```js
ws.on('message', (data) => {
  try {
    const response = JSON.parse(data);

    // 处理响应
    if (response.header.code === 0) {
      // 提取摘要内容
      if (response.payload && response.payload.choices && response.payload.choices.text) {
        response.payload.choices.text.forEach(item => {
          summary += item.content;
        });
      }

      // 检查是否完成
      if (response.header.status === 2) {
        isComplete = true;
        ws.close();
        resolve(summary);
      }
    } else {
      console.error('API Error:', response.header.message);
      ws.close();
      reject(new Error(response.header.message));
    }
  } catch (error) {
    console.error('Error parsing response:', error);
  }
});
```
因此我们需要做的就是判断请求是否成功，成功则从中获取回复的文本内容，再额外判断请求是否完成，完成则关闭连接，否则继续接收响应。

剩下的一些关于websocket的close，error，超时处理等简单内容我们就不再讲解了，直接看上面的代码就能很好理解；那么至此这个项目所有内容都讲解完毕，大模型返回的内容前端如何处理展示在[前面](#会议摘要功能前端实现)也已经讲过，前端本身就是fetch直接从后端请求到内容，然后同步到响应式变量展示的，不再重复讲。

这篇项目讲解已经写了很多内容，甚至只写在一个页面感觉有些太长了，后续也许我自己还会多次重新看，然后优化一些表达和调整格式，让它们更美观。

