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
这一段对引用的使用造成的结果出乎我的意料；这和之前讲到的`obj.foo`并不意味着`obj`拥有`foo`而只是引用直接相关，所以说关键就在于调用点所在的位置，如果`obj.foo`执行的话就是在`obj`环境下执行；

但是如果只是引用，就不会把`obj`环境一并带走了，会根据调用点到底是谁，这里的`fn()`是直接在全局下运行，调用点是全局，`this`当然就是全局，和调用点为'obj'的`obj.foo()`运行的当然效果不同；

同样的，无论是`setTimeout`的回调函数，还是函数传参，如果`obj.foo`没有得到立即执行而是被引用的话，结果就是调用点不再是`obj`而是`setTimeout`所在位置，后续调用的时候，就是在调用点下调用`foo`方法，像上面的`setTimeout( obj.foo, 100 );`在全局运行，那么`this`指向全局。

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

::: details 总结——相当重要的记忆理解
#### 这里的总结比较重要打个tag
非常全面的介绍，多方面介绍了`this`的特点以及如果修改、使用；

简要来说，默认绑定和隐含绑定讲的仍然是谁调用则指向谁的规则，其中默认绑定就是普通函数直接调用，理解为全局调用，this指向全局；隐含绑定提到了引用的内容，也就是调用点增加了调用的环境，注意引用并不会保留环境或者说调用点，而是要看之后调用的时候，调用点在哪里，则`this`指向哪里

明确绑定则是讲解使用`call`和`apply`方法，实现绑定`this`，也就是把方法绑定给对象，这样就能实现对象调用方法，`this`指向对象；延伸到硬绑定，也就是在函数内使用`call`或`apply`方法，进一步延伸封装扩展到`bind`，也就是可以自由输入参数来实现把各种方法绑定到各个对象之上的方法；当然总体核心都是`call`或`apply`方法

最后是new绑定，其实就是构造函数，使用构造函数的变量将成为对象，可以理解为该变量调用了构造函数，还是那句话，谁调用指向谁，那么构造函数的`this`当然都指向成为对象的该变量了。
:::

## 摘自第二章-一切皆有顺序

如果调用点上有多种规则都适用呢？这些规则一定有一个优先顺序，我们下面就来展示这些规则以什么样的优先顺序实施。

很显然，*默认绑定* 在四种规则中优先权最低的。所以我们先把它放在一边。

*隐含绑定* 和 *明确绑定* 哪一个更优先呢？我们来测试一下：

```js
function foo() {
	console.log( this.a );
}

var obj1 = {
	a: 2,
	foo: foo
};

var obj2 = {
	a: 3,
	foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

所以, *明确绑定* 的优先权要高于 *隐含绑定*，这意味着你应当在考察 *隐含绑定* 之前 **首先** 考察 *明确绑定* 是否适用。

::: details 个人理解
我感觉*明确绑定* 和 *隐含绑定*的优先权并不难想到，这部分内容摘抄也只是为了有实际例子增加说服力而已；

根据上面具体讲解的内容，或者直接看[总结](#这里的总结比较重要打个tag)也能知道，*隐含绑定*完全就只是一个环境调用而已，但*明确绑定*是使用了`call`，`apply`方法，把目前使用的方法绑定给对象，前面加上环境引用了也好，这个方法都是被直接交给对象执行，因此*明确绑定* 的优先权一定是要高于*隐含绑定*的

同样的道理是适配于`new`和*隐含绑定*的，因为使用`new`构造的对象也同样获取了方法，所以关于`new`和*隐含绑定*的比较部分我就不再摘抄，直接给出结论
:::

好了，*new 绑定* 的优先级要高于 *隐含绑定*。那么你觉得 *new 绑定* 的优先级较之于 *明确绑定* 是高还是低呢？

**注意：** `new` 和 `call`/`apply` 不能同时使用，所以 `new foo.call(obj1)` 是不允许的，也就是不能直接对比测试 *new 绑定* 和 *明确绑定*。但是我们依然可以使用 *硬绑定* 来测试这两个规则的优先级。

我们检验一下：

```js
function foo(something) {
	this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3
```

`bar` 是硬绑定到 `obj1` 的，但是*硬绑定*（到 `obj1`）的 `bar(..)` 调用 ***可以*** 被 `new` 所覆盖。因为 `new` 被实施，我们得到一个名为 `baz` 的新创建的对象，而且我们确实看到 `baz.a` 的值为 `3`。

如果你回头看看我们的“山寨”绑定帮助函数，这很令人吃惊：

```js
function bind(fn, obj) {
	return function() {
		fn.apply( obj, arguments );
	};
}
```

如果你推导这段帮助代码如何工作，会发现对于 `new` 操作符调用来说没有办法去像我们观察到的那样，将绑定到 `obj` 的硬绑定覆盖。

但是 ES5 的内建 `Function.prototype.bind(..)` 更加精妙，实际上十分精妙。这里是 MDN 网页上为 `bind(..)` 提供的（稍稍格式化后的）polyfill（低版本兼容填补工具）：

```js
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== "function") {
			// 可能的与 ECMAScript 5 内部的 IsCallable 函数最接近的东西，
			throw new TypeError( "Function.prototype.bind - what " +
				"is trying to be bound is not callable"
			);
		}

		var aArgs = Array.prototype.slice.call( arguments, 1 ),
			fToBind = this,
			fNOP = function(){},
			fBound = function(){
				return fToBind.apply(
					(
						this instanceof fNOP &&
						oThis ? this : oThis
					),
					aArgs.concat( Array.prototype.slice.call( arguments ) )
				);
			}
		;

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}
```

**注意：** 就将与 `new` 一起使用的硬绑定函数（参照下面来看为什么这有用）而言，上面的 `bind(..)` polyfill 与 ES5 中内建的 `bind(..)` 是不同的。因为 polyfill 不能像内建工具那样，没有 `.prototype` 就能创建函数，这里使用了一些微妙而间接的方法来近似模拟相同的行为。如果你打算将硬绑定函数和 `new` 一起使用而且依赖于这个 polyfill，应当多加小心。

允许 `new` 进行覆盖的部分是这里：

```js
this instanceof fNOP &&
oThis ? this : oThis

// ... 和：

fNOP.prototype = this.prototype;
fBound.prototype = new fNOP();
```

我们不会实际深入解释这个花招儿是如何工作的（这很复杂而且超出了我们当前的讨论范围），但实质上这个工具判断硬绑定函数是否是通过 `new` 被调用的（导致一个新构建的对象作为它的 `this`），如果是，它就用那个新构建的 `this` 而非先前为 `this` 指定的 *硬绑定*。

::: details 个人总结与理解
这部分内容相当有深度，个人认为从我的角度看（实际上这不严谨甚至可能有误，但对于记忆这部分内容还是有些作用的）：虽然`new foo.call(obj1)` 是不允许的，但是上面的测试其实也就是转折了一下然后完成了类似`new foo.call(obj1)`的内容，如果直接看`new foo.call(obj1)`，我会觉得foo.call(obj1)是在将foo绑定到obj上执行，但代码就像一层一层的括号向外执行，new的执行在最后，会将foo绑定到对象变量上，因此最终这个硬绑定会被覆盖是很合理的；

当然，实际上还是要看代码逻辑，原文讲的是硬绑定的函数底层实现中，就有关于允许 `new` 进行覆盖的相关设置，因此`new`能够进行覆盖合情合理；但正如原文所说，这很复杂而且超出了我们当前的讨论范围，因此这里也不细究
:::

为什么 `new` 可以覆盖 *硬绑定* 这件事很有用？

这种行为的主要原因是，创建一个实质上忽略 `this` 的 *硬绑定* 而预先设置一部分或所有的参数的函数（这个函数可以与 `new` 一起使用来构建对象）。`bind(..)` 的一个能力是，任何在第一个 `this` 绑定参数之后被传入的参数，默认地作为当前函数的标准参数（技术上这称为“局部应用（partial application）”，是一种“柯里化（currying）”）。

例如：

```js
function foo(p1,p2) {
	this.val = p1 + p2;
}

// 在这里使用 `null` 是因为在这种场景下我们不关心 `this` 的硬绑定
// 而且反正它将会被 `new` 调用覆盖掉！
var bar = foo.bind( null, "p1" );

var baz = new bar( "p2" );

baz.val; // p1p2
```

::: details 个人理解与思考
这部分内容和es6的设置默认参数有点像，比如我把代码改成这样也能实现相同的效果，不过总是要写`undefined`不太方便
```
function foo(p1="p1",p2) {
	this.val = p1 + p2;
}

var baz = new foo(undefined, "p2" );

baz.val; // p1p2
```
但`es6`设置默认参数可以实现绑定`p2`而跳过不绑定`p1`：`function foo(p1,p2="p2")`

但像上面的就没办法了，无论是`var bar = foo.bind( null, null ,"p1" );`还是`var bar = foo.bind( null, undefined ,"p1" );`都**不能**实现跳过`p1`只绑定`p2`的功能，`p1`会等于`'null'`或`'undefined'`，如果要强行实现的话只能自定义bind，那就已经非常麻烦了：

```
function foo(p1, p2) {
    this.val = p1 + p2;
}

// 自定义 bind 函数，跳过第一个参数，绑定第二个参数
Function.prototype.partialBind = function(thisArg, ...boundArgs) {
    const self = this;
    return function(...callArgs) {
        // 结合预绑定参数和调用时参数，跳过第一个调用参数
        const combinedArgs = [...boundArgs, ...callArgs.slice(1)];
        return self.apply(this instanceof self ? this : thisArg, combinedArgs);
    };
};

// 使用自定义 partialBind 跳过 p1，直接绑定 p2
var bar = foo.partialBind(null, undefined, "p2");

// 第一个参数会被跳过，p2 已经被预绑定
var baz = new bar("p1");

console.log(baz.val); // 输出: p1p2  
```
所以**除了**能够按顺序设置参数(必须条件)，并且对一个`foo`设置多个拥有不同参数的配置：比如`var bar = foo.bind( null, "p1" );`和`var bar2 = foo.bind( null, "p1" , "p2");`这样的情况，其他情况都更**推荐**`ES6`的写法

:::

### 判定 `this`

现在，我们可以按照优先顺序来总结一下从函数调用的调用点来判定 `this` 的规则了。按照这个顺序来问问题，然后在第一个规则适用的地方停下。

1. 函数是通过 `new` 被调用的吗（**new 绑定**）？如果是，`this` 就是新构建的对象。

    `var bar = new foo()`

2. 函数是通过 `call` 或 `apply` 被调用（**明确绑定**），甚至是隐藏在 `bind` *硬绑定* 之中吗？如果是，`this` 就是那个被明确指定的对象。

    `var bar = foo.call( obj2 )`

3. 函数是通过环境对象（也称为拥有者或容器对象）被调用的吗（**隐含绑定**）？如果是，`this` 就是那个环境对象。

    `var bar = obj1.foo()`

4. 否则，使用默认的 `this`（**默认绑定**）。如果在 `strict mode` 下，就是 `undefined`，否则是 `global` 对象。

    `var bar = foo()`

以上，就是理解对于普通的函数调用来说的 `this` 绑定规则 *所需的全部*。是的……几乎是全部。
::: details 个人理解与记忆
我还是那句话，谁调用就指向谁；同样的对于这些情况要理解到底是谁调用——这部分内容其实在上面的[总结](#这里的总结比较重要打个tag)就已经写了，这里也是从总结部分取出来，按这里原文写一份理解：

`new`是构造函数，使用构造函数的变量将成为对象，理解为**该变量调用**了构造函数，因此`var bar = new foo()`指向变量`bar`

明确绑定是`call`和`apply`方法，实现绑定`this`，也就是把方法绑定给对象，实现**对象调用**方法，因此`var bar = foo.call( obj2 )`指向`obj2`

隐含绑定是最经典的谁调用指向谁，`var bar = obj1.foo()`非常明显是`obj1`调用`foo`，当然指向`obj1`，当然，小心引用不会保留环境(调用点),而是要看调用时的调用点；

默认绑定还是谁调用指向谁的意思，`var bar = foo()`直接调用，就是在全局环境下调用了——`window`调用；
:::

## 摘自第二章-绑定的特例
### 被忽略的 `this`

如果你传递 `null` 或 `undefined` 作为 `call`、`apply` 或 `bind` 的 `this` 绑定参数，那么这些值会被忽略掉，取而代之的是 *默认绑定* 规则将适用于这个调用。

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo.call( null ); // 2
```

为什么你会向 `this` 绑定故意传递像 `null` 这样的值？

一个很常见的做法是，使用 `apply(..)` 来将一个数组散开，从而作为函数调用的参数。相似地，`bind(..)` 可以柯里化参数（预设值），也可能非常有用。

```js
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// 将数组散开作为参数
foo.apply( null, [2, 3] ); // a:2, b:3

// 用 `bind(..)` 进行柯里化
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2, b:3
```

这两种工具都要求第一个参数是 `this` 绑定。如果目标函数不关心 `this`，你就需要一个占位值，而且正如这个代码段中展示的，`null` 看起来是一个合理的选择。

**注意：** 虽然我们在这本书中没有涵盖，但是 ES6 中有一个扩散操作符：`...`，它让你无需使用 `apply(..)` 而在语法上将一个数组“散开”作为参数，比如 `foo(...[1,2])` 表示 `foo(1,2)` —— 如果 `this` 绑定没有必要，可以在语法上回避它。不幸的是，柯里化在 ES6 中没有语法上的替代品，所以 `bind(..)` 调用的 `this` 参数依然需要注意。

可是，在你不关心 `this` 绑定而一直使用 `null` 的时候，有些潜在的“危险”。如果你这样处理一些函数调用（比如，不归你管控的第三方包），而且那些函数确实使用了 `this` 引用，那么 *默认绑定* 规则意味着它可能会不经意间引用（或者改变，更糟糕！）`global` 对象（在浏览器中是 `window`）。

很显然，这样的陷阱会导致多种 *非常难* 诊断和追踪的 Bug。

#### 更安全的 `this`

也许某些“更安全”的做法是：为了 `this` 而传递一个特殊创建好的对象，这个对象保证不会对你的程序产生副作用。从网络学（或军事）上借用一个词，我们可以建立一个“DMZ”（非军事区）对象 —— 只不过是一个完全为空，没有委托（见第五，六章）的对象。

如果我们为了忽略自己认为不用关心的 `this` 绑定，而总是传递一个 DMZ 对象，那么我们就可以确定任何对 `this` 的隐藏或意外的使用将会被限制在这个空对象中，也就是说这个对象将 `global` 对象和副作用隔离开来。

因为这个对象是完全为空的，我个人喜欢给它一个变量名为 `ø`（空集合的数学符号的小写）。在许多键盘上（比如 Mac 的美式键盘），这个符号可以很容易地用 `⌥`+`o`（option+`o`）打出来。有些系统还允许你为某个特殊符号设置快捷键。如果你不喜欢 `ø` 符号，或者你的键盘没那么好打，你当然可以叫它任意你希望的名字。

无论你叫它什么，创建 **完全为空的对象** 的最简单方法就是 `Object.create(null)`（见第五章）。`Object.create(null)` 和 `{}` 很相似，但是没有指向 `Object.prototype` 的委托，所以它比 `{}` “空得更彻底”。

```js
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// 我们的 DMZ 空对象
var ø = Object.create( null );

// 将数组散开作为参数
foo.apply( ø, [2, 3] ); // a:2, b:3

// 用 `bind(..)` 进行 currying
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```

不仅在功能上更“安全”，`ø` 还会在代码风格上产生些好处，它在语义上可能会比 `null` 更清晰的表达“我想让 `this` 为空”。当然，你可以随自己喜欢来称呼你的 DMZ 对象。

:::details 简化与总结
原文写的太详细了，这里简化总结一下，另外*柯里化*这个词已经见过太多遍，但我总不记得是什么意思，这里写一下：核心思想是把接受多个参数的函数转换为一系列仅接受单一参数的函数。

原文这部分内容写的是，为了实现柯里化，我们会需要使用`bind`、`apply`时让`this`指向`null`，但是这样会变成默认绑定，可能会导致非常多意外的`bug`

因此为了更安全的`this`，就需要一个完全为空，没有委托的对象，随便自己命名，创建方式使用：`Object.create(null)`，它 和`{}`很相似，但是没有指向`Object.prototype`的委托，所以它比`{}`“空得更彻底”。

另外中间讲到ES6的扩展运算符，这个我很熟悉，但是原文主要就是说`apply`方法传入参数(指定对象、即首个参数以外的)可以传数组，可以理解为里面有自带的扩展运算符展开数组；但`bind`没有，不能输入数组，得一个一个参数输入
:::

### 间接

另外一个要注意的是，你可以（有意或无意地！）创建对函数的“间接引用（indirect reference）”，在那样的情况下，当那个函数引用被调用时，*默认绑定* 规则也会适用。

一个最常见的 *间接引用* 产生方式是通过赋值：

```js
function foo() {
	console.log( this.a );
}

var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };

o.foo(); // 3
(p.foo = o.foo)(); // 2
```

赋值表达式 `p.foo = o.foo` 的 *结果值* 是一个刚好指向底层函数对象的引用。如此，起作用的调用点就是 `foo()`，而非你期待的 `p.foo()` 或 `o.foo()`。根据上面的规则，*默认绑定* 适用。

提醒： 无论你如何得到适用 *默认绑定* 的函数调用，被调用函数的 **内容** 的 `strict mode` 状态 —— 而非函数的调用点 —— 决定了 `this` 引用的值：不是 `global` 对象（在非 `strict mode` 下），就是 `undefined`（在 `strict mode` 下）。

::: details 个人收获
这个地方让我觉得有点困惑的是`(p.foo = o.foo)();`这样的语句，并不知道`p.foo = o.foo`会返回什么被拿去执行，找了ai，了解如下：在表达式`(p.foo = o.foo)();`中，实际调用点是 (...)()，等价于直接调用函数，`this`指向全局对象（非严格模式）或`undefined`（严格模式）。

通过这个理解，答案就很显然了，它类似于隐含绑定中提到的隐含丢失，因为引用是不会保留环境(调用点)，因此`p.foo`拿到的是`foo`，不会包含`o`的环境，另外，`p.foo`也没有作为`p.foo()`执行，而是被返回，或者说被引用，也不会带有环境(调用点)

可以把语句`(p.foo = o.foo)();`化为：
```
p.foo = o.foo
x = p.foo
x()
```
`x`也是引用了`p.foo`，丢失`p`的环境(调用点)，于是最后执行的`x()`只需要观察`x`的调用点(环境)在哪里，可以看到是全局下执行，因此输出结果为`2`
:::


### 软化绑定（Softening Binding）

我们之前看到 *硬绑定* 是一种通过将函数强制绑定到特定的 `this` 上，来防止函数调用在不经意间退回到 *默认绑定* 的策略（除非你用 `new` 去覆盖它！）。问题是，*硬绑定* 极大地降低了函数的灵活性，阻止我们手动使用 *隐含绑定* 或后续的 *明确绑定* 来覆盖 `this`。

如果有这样的办法就好了：为 *默认绑定* 提供不同的默认值（不是 `global` 或 `undefined`），同时保持函数可以通过 *隐含绑定* 或 *明确绑定* 技术来手动绑定 `this`。

我们可以构建一个所谓的 *软绑定* 工具来模拟我们期望的行为。

```js
if (!Function.prototype.softBind) {
	Function.prototype.softBind = function(obj) {
		var fn = this,
			curried = [].slice.call( arguments, 1 ),
			bound = function bound() {
				return fn.apply(
					(!this ||
						(typeof window !== "undefined" &&
							this === window) ||
						(typeof global !== "undefined" &&
							this === global)
					) ? obj : this,
					curried.concat.apply( curried, arguments )
				);
			};
		bound.prototype = Object.create( fn.prototype );
		return bound;
	};
}
```

这里提供的 `softBind(..)` 工具的工作方式和 ES5 内建的 `bind(..)` 工具很相似，除了我们的 *软绑定* 行为。它用一种逻辑将指定的函数包装起来，这个逻辑在函数调用时检查 `this`，如果它是 `global` 或 `undefined`，就使用预先指定的 *默认值* （`obj`），否则保持 `this` 不变。它也提供了可选的柯里化行为（见先前的 `bind(..)` 讨论）。

我们来看看它的用法：

```js
function foo() {
   console.log("name: " + this.name);
}

var obj = { name: "obj" },
    obj2 = { name: "obj2" },
    obj3 = { name: "obj3" };

var fooOBJ = foo.softBind( obj );

fooOBJ(); // name: obj

obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2   <---- 看!!!

fooOBJ.call( obj3 ); // name: obj3   <---- 看!

setTimeout( obj2.foo, 10 ); // name: obj   <---- 退回到软绑定
```

软绑定版本的 `foo()` 函数可以如展示的那样被手动 `this` 绑定到 `obj2` 或 `obj3`，如果 *默认绑定* 适用时会退到 `obj`。

::: details 个人解析
这部分内容看起来太吓人了，原文的讲解并没有让我完全理解软绑定做了什么，不过经过向`AI`学习，我已经能够表达出让`AI`评价为“完全正确”的理解了：

要理解软绑定做了什么，有什么作用，需要对比原生的明确绑定：

原生`bind`绑定后，尝试使用隐含绑定或新的明确绑定都无法改变`this`的指向；
```
function foo() { console.log(this.a); }
var obj = { a: 2 };
var bar = foo.bind(obj);  // this 永远锁定为 obj
bar();                    // 2
bar.call({ a: 3 });       // 依然是 2（无法覆盖）
```
但使用`softbind`软绑定的话，只是让**默认绑定不奏效**：即`this`不会指向全局，而是软绑定指向的对象；但使用隐含绑定和新的明确绑定都能够**暂时性**地改变它`this`指向的对象。(这部分看原文给出得到例子)

有了上面我写的理解，就能很好地读懂最上面给出的`softbind`为什么那么写了
:::

## 摘自第二章-词法 `this`

我们刚刚涵盖了一般函数遵守的四种规则。但是 ES6 引入了一种不适用于这些规则特殊的函数：箭头函数（arrow-function）。

箭头函数不是通过 `function` 关键字声明的，而是通过所谓的“大箭头”操作符：`=>`。与使用四种标准的 `this` 规则不同的是，箭头函数从封闭它的（函数或全局）作用域采用 `this` 绑定。

我们来展示一下箭头函数的词法作用域：

```js
function foo() {
  // 返回一个箭头函数
	return (a) => {
    // 这里的 `this` 是词法上从 `foo()` 采用的
		console.log( this.a );
	};
}

var obj1 = {
	a: 2
};

var obj2 = {
	a: 3
};

var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, 不是3!
```

在 `foo()` 中创建的箭头函数在词法上捕获 `foo()` 被调用时的 `this`，不管它是什么。因为 `foo()` 被 `this` 绑定到 `obj1`，`bar`（被返回的箭头函数的一个引用）也将会被 `this` 绑定到 `obj1`。一个箭头函数的词法绑定是不能被覆盖的（就连 `new` 也不行！）。

最常见的用法是用于回调，比如事件处理器或计时器：

```js
function foo() {
	setTimeout(() => {
		// 这里的 `this` 是词法上从 `foo()` 采用
		console.log( this.a );
	},100);
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

虽然箭头函数提供除了使用 `bind(..)` 外，另外一种在函数上来确保 `this` 的方式，这看起来很吸引人，但重要的是要注意它们本质是使用广为人知的词法作用域来禁止了传统的 `this` 机制。

::: details 总结巩固
有点吓人了，突然发现自己对`this`还有理解不到位的地方；主要最吓人的是这部分在`vue`的学习过程中学过了，我有些遗忘混淆了；现在总结巩固一下：

正如原文所说，`ES6`引入了箭头函数，这里的`this`不再符合之前讲的四个规则了，不再是通过*明确的绑定确定*或*由调用点确定*了；而是在箭头函数中，获取箭头函数上下文作为`this`，也可以说是词法作用域；

比如原文的例子中，`foo`中`return`返回的是一个箭头函数，它在`foo`中，因此`this`会查找上下文，也就是找到`foo`的调用对象，又因为`foo.call(obj1)`绑定到了`obj1`上，`this`则指向`obj1`

让我再用`vue`的知识唤醒自己：

**`vue`管理的函数，不要使用箭头函数，否则`this`无法指向`vue`实例；但不是`vue`管理的函数：如`setTimeout`的回调函数、`ajax`的回调函数，都应该写成箭头函数：**

原因现在解释，一定注意**箭头函数的this指向本质是词法作用域**，这是重中之重；如果在`vue`管理的函数使用箭头函数，我们必须假设一个实际的情景来更好的讲解：
```
methods: {
    increment: () => {
      this.count++; // 这里的 `this` 不是组件实例，会报错或值不正确
    }
}
```
要注意到`methods`只是一个**对象，它不会被调用，没有作用域**的说法，因此箭头函数会继续向外寻找，捕获了全局作用域；

而不是`vue`管理的函数：如`setTimeout`的回调函数、`ajax`的回调函数写成箭头函数是这样：
```
mounted() {
    setTimeout(() => {
      console.log(this); // 正确指向组件实例
    }, 100);
  }
```
请注意`setTimeout`是执行的方法，做一个动作，它们在这里会**被放到函数里**作为逻辑成分，而**不是对象**，比如这里举例就被放到`mounted`当中，我们这里使用的箭头函数只是作为参数传给`setTimeout`，并不是在`setTimeout`中被定义，定义箭头函数的位置是`mounted`，因此箭头函数捕获作用域就在`mounted`中，显然`mounted`等这些函数方法，都是属于`vue`实例的，那么`this`也就能正确指向组件实例了

讲解完了使用箭头函数的结果，我们再说说不使用箭头函数会怎么样：

如果在`vue`管理的函数**不使用箭头函数**，也就是按照原句的意思，那么它就不属于**箭头函数的this指向**问题了，它又回归到动态匹配的规则当中，而作为`methods`中的方法，后续它当然是要被调用使用的，而调用它的对象，正是`vue`实例，这就属于四大规则中的隐含绑定了，那当然没有问题；

而不是`vue`管理的函数：如`setTimeout`的回调函数、`ajax`的回调函数如果**不写成箭头函数**，也就是和原句的意思反着来，那么和刚刚说的一样，它就不属于**箭头函数的this指向**问题了，它又回归到动态匹配的规则当中，谁调用指向谁，之前我们说“箭头函数只是作为参数传给`setTimeout`，并不是在`setTimeout`中被定义，定义箭头函数的位置是`mounted`，因此箭头函数捕获作用域就在`mounted`中”，但现在是动态匹配的规则，定义在哪已经不重要，重要的是调用在哪，我们可以看到它作为参数交给了`setTimeout`，后续就会到`setTimeout`的环境下调用，那当然就指向了`window`，这显然不会是我们想要的结果，因为我们需要指向`vue`实例

所以综合所有内容，我们可以得出**最关键**的地方在于：正常的`this`，属于四大规则，动态绑定，决定指向的是**在哪调用**

而箭头函数的`this`，不属于四大规则，静态绑定——词法作用域，决定指向的是**在哪定义**
:::






