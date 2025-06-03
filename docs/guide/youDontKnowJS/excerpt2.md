# 你不知道的JS-摘录-this与对象原型
::: details 个人见解
对于`this`我个人是比较了解和熟悉的，所以可能摘抄内容不会太多，甚至重点会跑到其他内容上去
:::
## 摘自第一章-为什么要用this?
让我们试着展示一下 `this` 的动机和用途：

```js
function identify() {
	return this.name.toUpperCase();
}

function speak() {
	var greeting = "Hello, I'm " + identify.call( this );
	console.log( greeting );
}

var me = {
	name: "Kyle"
};

var you = {
	name: "Reader"
};

identify.call( me ); // KYLE
identify.call( you ); // READER

speak.call( me ); // Hello, I'm KYLE
speak.call( you ); // Hello, I'm READER
```
::: details 关于call
摘抄这一段我完全理解`this`的使用，但我对于`call`并不熟悉，这段代码运行结果是输出`Hello, I'm KYLE`和`Hello, I'm READER`；

`call`方法会以给定的`this`值和逐个提供的参数调用该函数(MDN定义)，它的传入参数第一个是绑定的对象，要调用该方法的对象，也是后续的`this`；如果后续还有第二、第三个参数的话，则是对应该方法所需的参数。

关于`this`我一直理解认为，谁调用参数，谁就是`this`。因此从上面的`call`方法定义，很容易明白这里的`this`就是第一个传入参数，`call`方法可以理解为就是被传入的第一个参数调用的，只是写法是`xxx.call(obj)`而已，算是一个格式比较特殊的方法吧。那么因此，对于`identify`调用后会`return`返回给调用者`me`和`you`，这样的东西当然不会有任何反应和输出；只是返回结果是他们的`name`修改为大写的字符串；而`speak`里再次调用`identify`，还将返回结果拼接成字符串打印出来，那当然就有输出了；所以运行结果是输出`Hello, I'm KYLE`和`Hello, I'm READER`；
:::

## 摘自第一章-什么是 `this`？
当一个函数被调用时，会建立一个称为执行环境的活动记录。这个记录包含函数是从何处（调用栈 —— call-stack）被调用的，函数是 *如何* 被调用的，被传递了什么参数等信息。这个记录的属性之一，就是在函数执行期间将被使用的 `this` 引用。

下一章中，我们将会学习寻找函数的 **调用点（call-site）** 来判定它的执行如何绑定 `this`。

## 摘自第二章-仅仅是规则
### 隐含绑定（Implicit Binding）

另一种要考虑的规则是：调用点是否有一个环境对象（context object），也称为拥有者（owning）或容器（containing）对象，虽然这些名词可能有些误导人。

考虑这段代码：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

obj.foo(); // 2
```

首先，注意 `foo()` 被声明然后作为引用属性添加到 `obj` 上的方式。无论 `foo()` 是否一开始就在 `obj` 上被声明，还是后来作为引用添加（如上面代码所示），这个 **函数** 都不被 `obj` 所真正“拥有”或“包含”。

然而，调用点 *使用* `obj` 环境来 **引用** 函数，所以你 *可以说* `obj` 对象在函数被调用的时间点上“拥有”或“包含”这个 **函数引用**。

不论你怎样称呼这个模式，在 `foo()` 被调用的位置上，它被冠以一个指向 `obj` 的对象引用。当一个方法引用存在一个环境对象时，*隐含绑定* 规则会说：是这个对象应当被用于这个函数调用的 `this` 绑定。

因为 `obj` 是 `foo()` 调用的 `this`，所以 `this.a` 就是 `obj.a` 的同义词。

::: details 个人见解
这一段讲得还是有点弯弯绕绕，就是说`obj`并不是真的有`foo()`函数，这是当然的，函数是引用类型，定义声明不在`obj`内，只能说`obj.foo()`只是暂时引用借用了一下，在`obj` 环境下调用了一下`foo()`；至于`this`问题，还是和我一直以来认为的一样，谁调用`this`就指向谁。这里是`obj`调用当然就指向`obj`，

下面的内容有点作用，相当于更深入理解一下谁调用指向谁的问题：`obj1.obj2.foo()`这样的的写法调用者是`obj2`
:::

只有对象属性引用链的最后一层是影响调用点的。比如：

```js
function foo() {
	console.log( this.a );
}

var obj2 = {
	a: 42,
	foo: foo
};

var obj1 = {
	a: 2,
	obj2: obj2
};

obj1.obj2.foo(); // 42
```

#### 隐含丢失（Implicitly Lost）

`this` 绑定最常让人沮丧的事情之一，就是当一个 *隐含绑定* 丢失了它的绑定，这通常意味着它会退回到 *默认绑定*， 根据 `strict mode` 的状态，其结果不是全局对象就是 `undefined`。

考虑这段代码：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var bar = obj.foo; // 函数引用！

var a = "oops, global"; // `a` 也是一个全局对象的属性

bar(); // "oops, global"
```

尽管 `bar` 似乎是 `obj.foo` 的引用，但实际上它只是另一个 `foo` 本身的引用而已。另外，起作用的调用点是 `bar()`，一个直白，毫无修饰的调用，因此 *默认绑定* 适用于这里。

这种情况发生的更加微妙，更常见，而且更意外的方式，是当我们考虑传递一个回调函数时：

```js
function foo() {
	console.log( this.a );
}

function doFoo(fn) {
	// `fn` 只不过 `foo` 的另一个引用

	fn(); // <-- 调用点!
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` 也是一个全局对象的属性

doFoo( obj.foo ); // "oops, global"
```

参数传递仅仅是一种隐含的赋值，而且因为我们在传递一个函数，它是一个隐含的引用赋值，所以最终结果和我们前一个代码段一样。

那么如果接收你所传递回调的函数不是你的，而是语言内建的呢？没有区别，同样的结果。

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` 也是一个全局对象的属性

setTimeout( obj.foo, 100 ); // "oops, global"
```

把这个粗糙的，理论上的 `setTimeout()` 假想实现当做 JavaScript 环境内建的实现的话：

```js
function setTimeout(fn,delay) {
  // （通过某种方法）等待 `delay` 毫秒
	fn(); // <-- 调用点!
}
```

正如我们刚刚看到的，我们的回调函数丢掉他们的 `this` 绑定是十分常见的事情。但是 `this` 使我们吃惊的另一种方式是，接收我们回调的函数故意改变调用的 `this`。那些很流行的 JavaScript 库中的事件处理器就十分喜欢强制你的回调的 `this` 指向触发事件的 DOM 元素。虽然有时这很有用，但其他时候这简直能气死人。不幸的是，这些工具很少给你选择。

不管哪一种意外改变 `this` 的方式，你都不能真正地控制你的回调函数引用将如何被执行，所以你（还）没有办法控制调用点给你一个故意的绑定。我们很快就会看到一个方法，通过 *固定* `this` 来解决这个问题。
::: details 非常棒且有用的一部分！
这一段对引用的使用造成的结果出乎我的意料；这和之前讲到的`obj.foo`并不意味着`obj`拥有`foo`而只是引用直接相关，所以说关键就在于`obj{foo:foo};`，而`foo`的声明定义在全局下。如果`obj.foo`执行的话就是在`obj`环境下执行；

但是如果是引用，就不会把`obj`环境一并带走了，这里的`fn = obj.foo`本质上是`fn = foo`，因为这里的`obj.foo`也是在引用`foo`（`foo`的声明定义不在`obj`内），这也就是为什么`fn()`和`obj.foo()`运行的效果不同了；

同样的，无论是`setTimeout`的回调函数，还是函数传参，如果`obj.foo`没有得到立即执行而是被引用的话，结果就是引用到了普通的`foo`，后续调用的时候，就是在全局环境下调用`foo`方法，那么`this`指向全局。

因此，这里的`obj.foo`并不会 “携带” `obj`，**重要知识：** 只有箭头函数会捕获定义时的`this`；普通函数的`this`始终取决于调用方式

如果还觉得疑惑，或许直接运行我调整后的这部分程序，并看到运行结果就明白了：
```
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var bar = obj.foo; 
obj.foo();         // 2
bar();             // undefined

var a = "oops, global"; 
obj.foo();         // 2
bar();             // oops, global
```
:::

### 明确绑定（Explicit Binding）
用我们刚看到的 *隐含绑定*，我们不得不改变目标对象使它自身包含一个对函数的引用，而后使用这个函数引用属性来间接地（隐含地）将 `this` 绑定到这个对象上。

但是，如果你想强制一个函数调用使用某个特定对象作为 `this` 绑定，而不在这个对象上放置一个函数引用属性呢？

JavaScript 语言中的“所有”函数都有一些工具（通过他们的 `[[Prototype]]` —— 待会儿详述）可以用于这个任务。具体地说，函数拥有 `call(..)` 和 `apply(..)` 方法。

绝大多数被提供的函数，当然还有你将创建的所有的函数，都可以访问 `call(..)` 和 `apply(..)`。

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

通过 `foo.call(..)` 使用 *明确绑定* 来调用 `foo`，允许我们强制函数的 `this` 指向 `obj`。

如果你传递一个简单基本类型值（`string`，`boolean`，或 `number` 类型）作为 `this` 绑定，那么这个基本类型值会被包装在它的对象类型中（分别是 `new String(..)`，`new Boolean(..)`，或 `new Number(..)`）。这通常称为“封箱（boxing）”。

**注意：** 就 `this` 绑定的角度讲，`call(..)` 和 `apply(..)` 是完全一样的。它们确实在处理其他参数上的方式不同，但那不是我们当前关心的。

不幸的是，单独依靠 *明确绑定* 仍然不能为我们先前提到的问题提供解决方案，也就是函数“丢失”自己原本的 `this` 绑定，或者被第三方框架覆盖，等等问题。

#### 硬绑定（Hard Binding）

但是有一个 *明确绑定* 的变种确实可以实现这个技巧。考虑这段代码：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

var bar = function() {
	foo.call( obj );
};

bar(); // 2
setTimeout( bar, 100 ); // 2

// `bar` 将 `foo` 的 `this` 硬绑定到 `obj`
// 所以它不可以被覆盖
bar.call( window ); // 2
```

我们来看看这个变种是如何工作的。我们创建了一个函数 `bar()`，在它的内部手动调用 `foo.call(obj)`，由此强制 `this` 绑定到 `obj` 并调用 `foo`。无论你过后怎样调用函数 `bar`，它总是手动使用 `obj` 调用 `foo`。这种绑定即明确又坚定，所以我们称之为 *硬绑定（hard binding）*

用 *硬绑定* 将一个函数包装起来的最典型的方法，是为所有传入的参数和传出的返回值创建一个通道：

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

var obj = {
	a: 2
};

var bar = function() {
	return foo.apply( obj, arguments );
};

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

另一种表达这种模式的方法是创建一个可复用的帮助函数：

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

// 简单的 `bind` 帮助函数
function bind(fn, obj) {
	return function() {
		return fn.apply( obj, arguments );
	};
}

var obj = {
	a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

由于 *硬绑定* 是一个如此常用的模式，它已作为 ES5 的内建工具提供：`Function.prototype.bind`，像这样使用：

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

var obj = {
	a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

`bind(..)` 返回一个硬编码的新函数，它使用你指定的 `this` 环境来调用原本的函数。

**注意：** 在 ES6 中，`bind(..)` 生成的硬绑定函数有一个名为 `.name` 的属性，它源自于原始的 *目标函数（target function）*。举例来说：`bar = foo.bind(..)` 应该会有一个 `bar.name` 属性，它的值为 `"bound foo"`，这个值应当会显示在调用栈轨迹的函数调用名称中。

#### API 调用的“环境”

确实，许多库中的函数，和许多在 JavaScript 语言以及宿主环境中的内建函数，都提供一个可选参数，通常称为“环境（context）”，这种设计作为一种替代方案来确保你的回调函数使用特定的 `this` 而不必非得使用 `bind(..)`。

举例来说：

```js
function foo(el) {
	console.log( el, this.id );
}

var obj = {
	id: "awesome"
};

// 使用 `obj` 作为 `this` 来调用 `foo(..)`
[1, 2, 3].forEach( foo, obj ); // 1 awesome  2 awesome  3 awesome
```

从内部来说，几乎可以确定这种类型的函数是通过 `call(..)` 或 `apply(..)` 来使用 *明确绑定* 以节省你的麻烦。

### `new` 绑定（`new` Binding）

第四种也是最后一种 `this` 绑定规则，要求我们重新思考 JavaScript 中关于函数和对象的常见误解。

JavaScript 拥有 `new` 操作符，而且使用它的代码模式看起来和我们在面向类语言中看到的基本一样；大多数开发者猜测 JavaScript 机制在做某种相似的事情。但是，实际上 JavaScript 的机制和 `new` 在 JS 中的用法所暗示的面向类的功能 *没有任何联系*。

首先，让我们重新定义 JavaScript 的“构造器”是什么。在 JS 中，构造器 **仅仅是一个函数**，它们偶然地与前置的 `new` 操作符一起调用。它们不依附于类，它们也不初始化一个类。它们甚至不是一种特殊的函数类型。它们本质上只是一般的函数，在被使用 `new` 来调用时改变了行为。

当在函数前面被加入 `new` 调用时，也就是构造器调用时，下面这些事情会自动完成：

1. 一个全新的对象会凭空创建（就是被构建）
2. *这个新构建的对象会被接入原形链（`[[Prototype]]`-linked）*
3. 这个新构建的对象被设置为函数调用的 `this` 绑定
4. 除非函数返回一个它自己的其他 **对象**，否则这个被 `new` 调用的函数将 *自动* 返回这个新构建的对象。

步骤 1，3 和 4 是我们当下要讨论的。我们现在跳过第 2 步，在第五章回过头来讨论。

考虑这段代码：

```js
function foo(a) {
	this.a = a;
}

var bar = new foo( 2 );
console.log( bar.a ); // 2
```

通过在前面使用 `new` 来调用 `foo(..)`，我们构建了一个新的对象并把这个新对象作为 `foo(..)` 调用的 `this`。 **`new` 是函数调用可以绑定 `this` 的最后一种方式**，我们称之为 *new 绑定（new binding）*。

::: details 总结
非常全面的介绍，多方面介绍了`this`的特点以及如果修改、使用；

简要来说，默认绑定和隐含绑定讲的仍然是谁调用则指向谁的规则，隐含绑定提到了引用的内容；

明确绑定则是讲解使用`call`和`apply`方法，实现绑定`this`，也就是把方法绑定给对象，这样就能实现对象调用方法，`this`指向对象；延伸到硬绑定，也就是在函数内使用`call`或`apply`方法，进一步延伸封装扩展到`bind`，也就是可以自由输入参数来实现把各种方法绑定到各个对象之上的方法；当然总体核心都是`call`或`apply`方法

最后是new绑定，时间关系后面再说了
:::


