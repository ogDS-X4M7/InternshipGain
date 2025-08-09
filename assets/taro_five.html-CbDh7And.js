import{_ as n,c as e,d as a,o as i}from"./app-DkcWcFp2.js";const l={};function c(d,s){return i(),e("div",null,s[0]||(s[0]=[a(`<h1 id="个人页——支持登录-更新头像昵称-查看历史、点赞、收藏-支持退出登录" tabindex="-1"><a class="header-anchor" href="#个人页——支持登录-更新头像昵称-查看历史、点赞、收藏-支持退出登录"><span>个人页——支持登录，更新头像昵称，查看历史、点赞、收藏，支持退出登录</span></a></h1><h2 id="登录与微信绑定" tabindex="-1"><a class="header-anchor" href="#登录与微信绑定"><span>登录与微信绑定</span></a></h2><p>个人页的功能可以说是这个项目里最复杂的一部分，用户的登录是直接和微信绑定的，由于微信登录的各种限制和当前微信头像，昵称获取方法的不断调整，在这个过程中有很多的问题需要小心和避免。</p><p>首先要使用微信登录需要用户的授权，而且这个授权必须要用户确认。之前使用的API已经弃用，<strong>具体的内容可以去看源代码里面me.jsx的useEffect中注释掉的部分，有对应代码和讲解</strong>。</p><p>微信用户的唯一id是他内部的一个openid，那我们获取这个open ID需要向微信官方提供的一个对应链接发送请求并且在链接中携带对应的参数。包括APP ID、APP secret和临时code，其中APP ID和secret也就是小程序的ID和小程序密钥，在微信平台登陆后可以查看获取，后端配置在文件里就可以了。但是临时code就需要用户确认获取。因此需要做一个登录的弹窗，让用户确认授权。来获取这个临时code。然后将这个临时code传给后端，后端根据APP ID，APP secret和临时code向微信官方链接发送请求来获取微信账号对应的唯一的openID。通过这个open ID后端能够判断用户是否已有账号，并且返回这个账号对应的信息，如果用户没有注册过账号，则根据他的open ID生成注册一个新的账号并返还给用户，同时还会生成token返回。</p><p>前端需要根据后端返回来的账号信息更新页面的内容，用户未登陆时页面只有一个提示登录的卡片，登陆后则有用户的头像，昵称卡片，以及个人页所有的功能界面按钮。因此需要更新界面原本有的功能，并且根据信息显示用户头像，昵称，用户登录这里还包括一个token的存储，并且根据token可以实现自动登录，当然如果token失效则需要重新登陆。我们之前提到的用户收藏需要准确校验。在用户登陆后也需要根据token及时向后端发送请求来获取更新用户的收藏信息。</p><p>个人页面的设计上遇到过很多问题，先来看一下整个页面的代码：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;View className=&#39;me&#39; ref={ref}&gt;</span>
<span class="line">    &lt;AtMessage /&gt;</span>
<span class="line">    &lt;View ref={loginRef} onClick={OpenModal}&gt;</span>
<span class="line">        {</span>
<span class="line">            needAuth</span>
<span class="line">                ? &lt;View className=&#39;userInfo &#39;&gt;</span>
<span class="line">                    &lt;AtAvatar className=&#39;userAvatar&#39; circle image=&#39;https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132&#39;&gt;&lt;/AtAvatar&gt;</span>
<span class="line">                    &lt;Text className=&#39;userName&#39;&gt;点击登录&lt;/Text&gt;</span>
<span class="line">                &lt;/View&gt;</span>
<span class="line">                : &lt;View&gt;</span>
<span class="line">                    &lt;View className=&#39;userInfo&#39; onClickCapture={updateInfo}&gt;</span>
<span class="line">                        &lt;AtAvatar className=&#39;userAvatar&#39; circle image={userAvatarUrl} &gt;&lt;/AtAvatar&gt;</span>
<span class="line">                        &lt;Text className=&#39;userName&#39;&gt;{userName}&lt;/Text&gt;</span>
<span class="line">                    &lt;/View&gt;</span>
<span class="line">                    &lt;AtGrid data={</span>
<span class="line">                        [</span>
<span class="line">                            {</span>
<span class="line">                                image: require(&#39;../../assets/images/like.png&#39;),</span>
<span class="line">                                value: &#39;我点赞的&#39;</span>
<span class="line">                            },</span>
<span class="line">                            {</span>
<span class="line">                                image: require(&#39;../../assets/images/collection.png&#39;),</span>
<span class="line">                                value: &#39;我的收藏&#39;</span>
<span class="line">                            },</span>
<span class="line">                            {</span>
<span class="line">                                image: require(&#39;../../assets/images/look.png&#39;),</span>
<span class="line">                                value: &#39;浏览历史&#39;</span>
<span class="line">                            },</span>
<span class="line">                            {</span>
<span class="line">                                image: require(&#39;../../assets/images/about.png&#39;),</span>
<span class="line">                                value: &#39;关于作者&#39;</span>
<span class="line">                            },</span>
<span class="line">                            {</span>
<span class="line">                                image: require(&#39;../../assets/images/edit.png&#39;),</span>
<span class="line">                                value: &#39;修改头像昵称&#39;</span>
<span class="line">                            },</span>
<span class="line">                            {</span>
<span class="line">                                image: require(&#39;../../assets/images/exit.png&#39;),</span>
<span class="line">                                value: &#39;退出登录&#39;</span>
<span class="line">                            }</span>
<span class="line">                        ]</span>
<span class="line">                    } onClick={handleGridClick} /&gt;</span>
<span class="line">                &lt;/View&gt;</span>
<span class="line">        }</span>
<span class="line">    &lt;/View&gt;</span>
<span class="line">    &lt;AtModal</span>
<span class="line">        isOpened={isOpened}</span>
<span class="line">        title=&#39;授权提醒&#39;</span>
<span class="line">        cancelText=&#39;取消&#39;</span>
<span class="line">        confirmText=&#39;授权&#39;</span>
<span class="line">        onClose={handleClose}</span>
<span class="line">        onCancel={handleCancel}</span>
<span class="line">        onConfirm={handleConfirm}</span>
<span class="line">        content=&#39;获取您的登录许可&#39;</span>
<span class="line">    /&gt;</span>
<span class="line">    ......</span>
<span class="line"></span>
<span class="line">&lt;/View&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>结构上来说看起来还是比较简单的，但是注意到第二层的view上是被放置了一个onclick事件，它对应了一个打开模态框的方法，这个模态框就是用户授权登录的模态框，当用户授权登录后，这个onclick事件显然应该被移除,使用dom去移除事件监听的时候出现了第一个问题。</p><h3 id="dom移除onclick事件监听无效" tabindex="-1"><a class="header-anchor" href="#dom移除onclick事件监听无效"><span>dom移除onclick事件监听无效</span></a></h3><p><a href="#dom%E7%9B%91%E5%90%AC%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88">这两个dom相关问题最后有简单的解决方案，点击查看</a></p><p>如果我使用移除click，那么点击事件并不会被移除，还继续存在，对后续造成干扰，这显然不是我想要的，但我并没有想明白原因，我打印实例对象，注意到：实例对象身上并没有click的监听，而是有tap的监听，于是我选择尝试修改为移除tap，尽管控制台在这个情况下，非常幽默地给出没有tap的监听，因此不会移除的警告；但最后的效果是，监听被移除了，登陆成功后，点击不会再弹窗</p><p>当然，我也尝试过改为ontap，这样让移除tap显得理所当然，结果就是改为ontap，并不能像onclick一样被点击激活，ontap是经过taro编译后的结果，但采用dom移除监听的方法taro并不能编译成tap，因此只能自己提前写成移除tap，尽管会被警告，但它是唯一有效的解决方案。</p><p>移除监听的事件结束了，但是很快又遇到了第二个问题。</p><h3 id="点击触发的组件在移除onclick的view中全部失效——冒泡与捕获" tabindex="-1"><a class="header-anchor" href="#点击触发的组件在移除onclick的view中全部失效——冒泡与捕获"><span>点击触发的组件在移除onclick的view中全部失效——冒泡与捕获</span></a></h3><p><a href="#dom%E7%9B%91%E5%90%AC%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88">这两个dom相关问题最后有简单的解决方案，点击查看</a></p><p>把具有点击触发的组件放到之前有过onclick的view里似乎都会失效，因此我把按钮拿出来，果然可以使用了，但我尝试点击<code>&lt;Text className=&#39;userName&#39; onClick={updateInfo}&gt;微信用户&lt;/Text&gt;</code>，虽然没有反应，但点完<code>&lt;Text className=&#39;userName&#39; onClick={updateInfo}&gt;微信用户&lt;/Text&gt;</code>，再去点击放在外面能够正常使用的<code>&lt;AtButton onClick={updateInfo}&gt;修改/更新信息&lt;/AtButton&gt;</code>，我发现：控制台先打印了10个“尝试使用抽屉”，再换行打印一个“尝试使用抽屉”；</p><p>这意味着我点击<code>&lt;Text className=&#39;userName&#39; onClick={updateInfo}&gt;</code>是有反应的，只是似乎被什么东西阻塞住无法进行下去，当我点击能够正常使用的<code>&lt;AtButton onClick={updateInfo}&gt;修改/更新信息&lt;/AtButton&gt;</code>时它们就被释放出来了。</p><p>当然，这个问题最后被解决了，关键在于两个修改：</p><p>在OpenModal函数中添加了e.stopPropagation()；将onClick改为onClickCapture；</p><p>这两个修改都与 React/Taro 的事件处理机制密切相关。冒泡和捕获是基础的概念，不赘述：</p><p>由于内外层的View都有点击事件，这会导致两个问题：</p><ol><li><p>事件冲突：内外层的点击事件相互干扰；</p></li><li><p>事件阻塞：外层事件可能阻止内层事件的正常处理</p></li></ol><p>显然这跟之前第一个问题是有关系，尽管事件监听的确被移除，但是也确实有相应的警告，也许因为监听名义上真的还存在，导致出现了一些阻塞的干扰，因此，当我在内部使用onclick，冒泡，随后被 外层的onclick阻塞住。</p><p>因为onclick默认是冒泡阶段处理的，因此内部改为onClickCapture，并不难理解，顾名思义，把它改为捕获阶段执行，那么，就不会等冒泡的时候阻塞了；</p><p>当然，因为外部移除本身存在问题，所以它不应该被激活，那么就应该给外部设置阻止内部冒泡：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const OpenModal = useCallback((e) =&gt; {</span>
<span class="line">    // 阻止事件冒泡，避免影响内部元素的事件处理</span>
<span class="line">    e.stopPropagation();</span>
<span class="line">    setIsOpened(true);</span>
<span class="line">}, [setIsOpened]);</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>e是内部的事件，也就是内部onclick被点击，会因为e.stopPropagation();而不冒泡，从而不激活外部的onclick，这样也避免出现阻塞；</p><p>一个阻止冒泡激活外部有故障的onclick；另一个把执行阶段调整到捕获阶段，这样即使冒泡被阻止也能正常激活内部的onclick。这个问题就解决了</p><p>至于阻塞后，点击外部配置的按钮为什么能释放，原因可能比较复杂：</p><p>这涉及<strong>事件队列清空与批量处理机制</strong>：</p><p>当点击另一个元素时，会触发新的事件流，此时可能触发队列清空机制；其中最有可能的就是React 的合成事件系统，它会在更新阶段统一处理事件队列</p><p><strong>合成事件的底层实现</strong>：</p><p>React 为了性能优化，将原生事件（如 click）包装成合成事件（SyntheticEvent），并统一绑定到根节点（document 或 container）。所有事件触发后不会立即执行，而是先存入 React 维护的事件队列，等待 React 的更新周期统一处理。</p><p><strong>事件队列的清空与批量执行逻辑</strong>：</p><p>当点击新元素时，会触发以下流程：</p><p>新事件入队：React 捕获到新点击事件，生成合成事件并加入队列。</p><p>批量更新机制：React 在事件处理阶段（如 componentDidUpdate 前）会开启一个 事务（Transaction），将队列中的所有事件批量执行。</p><p>队列清空：事件处理完毕后，队列会被清空，避免重复执行。</p><p><strong>案例说明</strong>：</p><p>假设快速点击元素 A 三次，再点击元素 B：点击 A 时，三次点击事件被存入 React 的事件队列，但未立即执行（因 React 异步更新特性）。点击 B 时，React 触发新的事件处理流程，检测到队列中有未处理的事件（三次 A 的点击），会将 A 的三次事件和 B 的事件一起批量执行，表现为 “积攒事件一次性触发”。</p><p><strong>总结分析：</strong></p><p>因此，之前冒泡而导致阻塞，外部onclick事件虽然造成阻塞，但阻塞到后面，点击其他事件，就进入批量执行了；批量执行显然是忽视了阻塞的外部onclick，由于前面特殊的操作，显然这个名存实亡的奇特事件的处理流程也变得不同寻常</p><h2 id="支持更新用户头像昵称-支持获取微信头像昵称" tabindex="-1"><a class="header-anchor" href="#支持更新用户头像昵称-支持获取微信头像昵称"><span>支持更新用户头像昵称，支持获取微信头像昵称</span></a></h2><p>前面提过，微信之前的获取用户信息的API废弃，现在是把获取用户信息的功能也废弃了，转而改为了这种获取用户头像昵称的特定写法比如这里的open-type和input里面的type、Class，这些新的使用方法由微信官方提供，在官方文档可以查看。需要注意的是微信提供的特定解法是针对原生组件的，像这里就曾经尝试过使用Taro的按钮组件，最后并没有成功获取用户微信的信息。</p><p>这里使用AtDrawer抽屉承载这部分功能：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;AtDrawer</span>
<span class="line">    show={showDrawer}</span>
<span class="line">    mask</span>
<span class="line">    right</span>
<span class="line">    onClose={() =&gt; setShowDrawer(false)} // 添加关闭回调</span>
<span class="line">&gt;</span>
<span class="line">    {/* 注意open-type=&quot;chooseAvatar&quot; 和 chooseAvatar={onChooseAvatar} 被绑定在 Button 组件上无效，Button是Taro组件，</span>
<span class="line">    open-type=&quot;chooseAvatar&quot; 是微信小程序的特殊属性，微信小程序的 chooseAvatar 事件需要绑定在 原生组件 上 */}</span>
<span class="line">    &lt;View className=&#39;updateTitle&#39;&gt;点击更新您的头像和昵称&lt;/View&gt;</span>
<span class="line">    &lt;button</span>
<span class="line">        className=&quot;avatar-wrapper&quot;</span>
<span class="line">        open-type=&quot;chooseAvatar&quot;</span>
<span class="line">        onChooseAvatar={onChooseAvatar} // 直接使用onChooseAvatar，Taro会自动转换为bind:chooseavatar</span>
<span class="line">    &gt;</span>
<span class="line">        &lt;Image className=&quot;avatar&quot; src={userAvatarUrlTemp} /&gt;</span>
<span class="line">    &lt;/button&gt;</span>
<span class="line">    &lt;input type=&quot;nickname&quot; class=&quot;weui-input&quot; placeholder=&quot;请输入昵称&quot; value={userNameTemp} onInput={handleUserNameChange} /&gt;</span>
<span class="line">    &lt;View className=&#39;updateButton&#39;&gt;</span>
<span class="line">        &lt;AtButton onClick={confirmUpdateInfo}&gt;提交&lt;/AtButton&gt;</span>
<span class="line">    &lt;/View&gt;</span>
<span class="line">    &lt;View className=&#39;updateButton&#39;&gt;</span>
<span class="line">        &lt;AtButton onClick={cancelUpdateInfo}&gt;取消&lt;/AtButton&gt;</span>
<span class="line">    &lt;/View&gt;</span>
<span class="line">&lt;/AtDrawer&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="支持查看历史浏览、点赞、收藏——三功能代码复用的区分" tabindex="-1"><a class="header-anchor" href="#支持查看历史浏览、点赞、收藏——三功能代码复用的区分"><span>支持查看历史浏览、点赞、收藏——三功能代码复用的区分</span></a></h2><p>查看历史浏览，点赞，收藏的功能都是高度近似的。因此新建一个视频列表页可以供这三个功能复用。区分这三个页面的内容除了调用对应的三个函数，还在页面跳转的同时在链接中传递了标志参数，用于调整不同类型视频列表页的样式，如页面标题。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">// grid设置宫格对应方法</span>
<span class="line">    function handleGridClick(item, index) {</span>
<span class="line">        // console.log(&#39;点击了宫格:&#39;, item.value, &#39;索引:&#39;, index);</span>
<span class="line">        switch (item.value) {</span>
<span class="line">            case &#39;我点赞的&#39;:</span>
<span class="line">                getLikes()</span>
<span class="line">                break;</span>
<span class="line">            case &#39;我的收藏&#39;:</span>
<span class="line">                getCollections();</span>
<span class="line">                break;</span>
<span class="line">            case &#39;浏览历史&#39;:</span>
<span class="line">                getHistory()</span>
<span class="line">                break;</span>
<span class="line">            case &#39;关于作者&#39;:</span>
<span class="line">                break;</span>
<span class="line">            case &#39;修改头像昵称&#39;:</span>
<span class="line">                updateInfo()</span>
<span class="line">                break;</span>
<span class="line">            case &#39;退出登录&#39;:</span>
<span class="line">                setExitTip(true)</span>
<span class="line">                break;</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    async function getHistory() {</span>
<span class="line">        let res = await videoStore.getHistory();</span>
<span class="line">        console.log(res)</span>
<span class="line">        Taro.navigateTo({</span>
<span class="line">            url: \`/pages/historyVideo/historyVideo?fromSignal=0\`,</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    async function getLikes() {</span>
<span class="line">        let res = await videoStore.getLikes();</span>
<span class="line">        console.log(res)</span>
<span class="line">        Taro.navigateTo({</span>
<span class="line">            url: \`/pages/historyVideo/historyVideo?fromSignal=1\`,</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    async function getCollections() {</span>
<span class="line">        let res = await videoStore.getCollections();</span>
<span class="line">        console.log(res)</span>
<span class="line">        Taro.navigateTo({</span>
<span class="line">            url: \`/pages/historyVideo/historyVideo?fromSignal=2\`,</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="支持查看历史浏览、点赞、收藏——三功能代码复用的实现" tabindex="-1"><a class="header-anchor" href="#支持查看历史浏览、点赞、收藏——三功能代码复用的实现"><span>支持查看历史浏览、点赞、收藏——三功能代码复用的实现</span></a></h2><p>上面提到的参数，在视频列表页的相关实现是：</p><p>在useEffect中获取链接的params参数，判别是哪个视频列表页要展示，从仓库中获取该页面要展示的视频列表，底部样式根据参数展示不同内容</p><h3 id="视频列表页——useeffect的回调函数是async产生报错" tabindex="-1"><a class="header-anchor" href="#视频列表页——useeffect的回调函数是async产生报错"><span>视频列表页——useEffect的回调函数是async产生报错</span></a></h3><p>（视频列表页是额外设计的一个页面，但是它不是像首页、短视频播放页、个人页这些tab页。因此虽然它是一个独立的页面，但是由于与个人页的功能紧密相关，放在个人页的介绍内一并讲解）</p><p>在这里useEffect在实现的时候尝试过使用async回调函数，这了一些意料之外的bug：</p><p>如果useEffect的回调函数如果直接使用async会导致，页面能进入，但是退出时会报错c is not a function，程序崩溃：</p><p>原因如下：async 函数会隐式返回一个 Promise，而 useEffect 期望的返回值是一个清理函数（或不返回任何值）；因此，当组件卸载时，React 会发现拿到一个promise返回，导致程序崩溃；</p><p>当然也可能是 组件卸载时异步操作尚未完成，导致资源释放异常；</p><p>总而言之,useEffect 的回调函数不能是 async；如果实在需要异步,那也应该在回调内部写async,而不能让回调成为async</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const HistoryVideo = forwardRef(({ videoStore }, ref) =&gt; {</span>
<span class="line">    ......</span>
<span class="line">    // 因为发现历史、点赞、收藏页面具有高度重复性，因此集合到一起写，通过外部传入对应标志信号fromSignal来判断要展示历史还是点赞收藏</span>
<span class="line">    // 这里设置状态信号接收</span>
<span class="line">    const [fromSignal, setFromSignal] = useState(-1);</span>
<span class="line">    // 设置统一的视频展示列表，根据状态信号切换</span>
<span class="line">    const [videoList, setVideoList] = useState([])</span>
<span class="line">    useEffect(() =&gt; {</span>
<span class="line">        // console.log(&#39;Page loaded&#39;)</span>
<span class="line">        let fromSignal = Taro.getCurrentInstance().router.params.fromSignal;</span>
<span class="line">        // 参数fromSignal从个人页面点击进入时传入,因为是navigate链接的params参数，因此通过如上方式从路由里获取</span>
<span class="line">        setFromSignal(fromSignal);</span>
<span class="line">        if (fromSignal === &#39;0&#39;) {</span>
<span class="line">            // 初次使用是undefined，不能读取长度，因此要额外设置空数组</span>
<span class="line">            if(videoStore.history){</span>
<span class="line">                setVideoList(videoStore.history)</span>
<span class="line">            }else{</span>
<span class="line">                setVideoList([])</span>
<span class="line">            }</span>
<span class="line">        } else if (fromSignal === &#39;1&#39;) {</span>
<span class="line">            // 初次使用是undefined，不能读取长度，因此要额外设置空数组</span>
<span class="line">            if(videoStore.likes){</span>
<span class="line">                setVideoList(videoStore.likes)</span>
<span class="line">            }else{</span>
<span class="line">                setVideoList([])</span>
<span class="line">            }</span>
<span class="line">        } else {</span>
<span class="line">            // 初次使用是undefined，不能读取长度，因此要额外设置空数组</span>
<span class="line">            if(videoStore.collections){</span>
<span class="line">                setVideoList(videoStore.collections)</span>
<span class="line">            }else{</span>
<span class="line">                setVideoList([])</span>
<span class="line">            }</span>
<span class="line">        }</span>
<span class="line">    }, [refresh])</span>
<span class="line"></span>
<span class="line">    ......</span>
<span class="line"></span>
<span class="line">    return (</span>
<span class="line">        &lt;View&gt;</span>
<span class="line">            {</span>
<span class="line">                fromSignal === &#39;0&#39;</span>
<span class="line">                    ? &lt;View&gt;</span>
<span class="line">                        &lt;View className=&#39;historyVideoTitle&#39;&gt;浏览历史&lt;/View&gt;</span>
<span class="line">                        &lt;AtButton onClick={clearHistory} &gt;清空浏览历史记录&lt;/AtButton&gt;</span>
<span class="line">                    &lt;/View&gt;</span>
<span class="line">                    : fromSignal === &#39;1&#39;</span>
<span class="line">                        ? &lt;View className=&#39;historyVideoTitle&#39;&gt;我的点赞&lt;/View&gt;</span>
<span class="line">                        : &lt;View className=&#39;historyVideoTitle&#39;&gt;我的收藏&lt;/View&gt;</span>
<span class="line">            }</span>
<span class="line">            {</span>
<span class="line">              ......</span>
<span class="line">            }</span>
<span class="line">        &lt;/View&gt;</span>
<span class="line">    )</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="视频列表页——点击列表中项目跳转播放页——播放页的复用" tabindex="-1"><a class="header-anchor" href="#视频列表页——点击列表中项目跳转播放页——播放页的复用"><span>视频列表页——点击列表中项目跳转播放页——播放页的复用</span></a></h3><p>用户点击列表中的视频查看时，跳转对应的视频播放页同样可以复用之前的短视频播放页。注意复用的短视频播放页是tab页，所以需要使用switchTab。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">async function handleClickVideo(clickUrl) {</span>
<span class="line">    const res = await videoStore.playHistory(clickUrl, fromSignal) // fromSignal设置信号，从播放页退出能回到对应的历史、点赞、收藏页面</span>
<span class="line">    if (res) {</span>
<span class="line">        // 注意navigateTo只能跳转非tab页面，这里使用会报错，得用switchTab来切换tab页面</span>
<span class="line">        Taro.switchTab({</span>
<span class="line">            url: \`/pages/shortvideo/shortvideo\`,</span>
<span class="line">            // ? url = \${ clickUrl }</span>
<span class="line">        })</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">......</span>
<span class="line">{</span>
<span class="line">    videoList.length</span>
<span class="line">        ?</span>
<span class="line">        &lt;View&gt;</span>
<span class="line">            {</span>
<span class="line">                // 在热点列表中使用过hotItem来处理map的点击，这里只有url，就不必要再弄组件，而且也展示第二种解决方案</span>
<span class="line">                videoList.map((url) =&gt;</span>
<span class="line">                    &lt;View className=&#39;historybox&#39; key={url} onClick={() =&gt; handleClickVideo(url)}&gt;</span>
<span class="line">                        &lt;View className=&#39;videobox&#39;&gt;没有封面&lt;/View&gt;</span>
<span class="line">                        &lt;View className=&#39;textContent&#39;&gt;</span>
<span class="line">                            &lt;Text className=&#39;videoTitle&#39;&gt;该视频没有标题&lt;/Text&gt;</span>
<span class="line">                            &lt;Text className=&#39;videoUpper&#39;&gt;该视频没有作者&lt;/Text&gt;</span>
<span class="line">                        &lt;/View&gt;</span>
<span class="line">                    &lt;/View&gt;)</span>
<span class="line">            }</span>
<span class="line">        &lt;/View&gt;</span>
<span class="line">        :</span>
<span class="line">        &lt;View className=&#39;nohistory&#39;&gt;</span>
<span class="line">            &lt;Text&gt;还没有任何记录哦&lt;/Text&gt;</span>
<span class="line">        &lt;/View&gt;</span>
<span class="line">}</span>
<span class="line">......</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="视频列表页——支持清空历史浏览记录" tabindex="-1"><a class="header-anchor" href="#视频列表页——支持清空历史浏览记录"><span>视频列表页——支持清空历史浏览记录</span></a></h2><p>其实在之前的代码已经展示过，这里的useEffect是根据refresh刷新信号来判断页面的重载，是因为除了页面的重新挂载，还有一个清空历史记录的功能需要刷新页面的内容。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const HistoryVideo = forwardRef(({ videoStore }, ref) =&gt; {</span>
<span class="line">    // 设置信号重载页面 实现清空历史记录后的刷新效果</span>
<span class="line">    const [refresh, setRefresh] = useState(false);</span>
<span class="line">    const [fromSignal, setFromSignal] = useState(-1);</span>
<span class="line">    const [videoList, setVideoList] = useState([])</span>
<span class="line">    useEffect(() =&gt; {</span>
<span class="line">      ......</span>
<span class="line">      if (fromSignal === &#39;0&#39;) {</span>
<span class="line">          // 初次使用是undefined，不能读取长度，因此要额外设置空数组</span>
<span class="line">          if(videoStore.history){</span>
<span class="line">              setVideoList(videoStore.history)</span>
<span class="line">          }else{</span>
<span class="line">              setVideoList([])</span>
<span class="line">          }</span>
<span class="line">      }</span>
<span class="line">      ......</span>
<span class="line">    }, [refresh])</span>
<span class="line"></span>
<span class="line">    async function clearHistory() {</span>
<span class="line">        const res = await videoStore.clearHistory()</span>
<span class="line">        if (res.code === 200) {</span>
<span class="line">            setRefresh(!refresh)</span>
<span class="line">        }</span>
<span class="line">        console.log(res.msg)</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    return (</span>
<span class="line">        &lt;View&gt;</span>
<span class="line">            {</span>
<span class="line">                fromSignal === &#39;0&#39;</span>
<span class="line">                    ? &lt;View&gt;</span>
<span class="line">                        &lt;View className=&#39;historyVideoTitle&#39;&gt;浏览历史&lt;/View&gt;</span>
<span class="line">                        &lt;AtButton onClick={clearHistory} &gt;清空浏览历史记录&lt;/AtButton&gt;</span>
<span class="line">                    &lt;/View&gt;</span>
<span class="line">                    : fromSignal === &#39;1&#39;</span>
<span class="line">                        ? &lt;View className=&#39;historyVideoTitle&#39;&gt;我的点赞&lt;/View&gt;</span>
<span class="line">                        : &lt;View className=&#39;historyVideoTitle&#39;&gt;我的收藏&lt;/View&gt;</span>
<span class="line">            }</span>
<span class="line">            ......</span>
<span class="line">        &lt;/View&gt;</span>
<span class="line">    )</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="支持退出登录" tabindex="-1"><a class="header-anchor" href="#支持退出登录"><span>支持退出登录</span></a></h2><p>点击退出登录时显示弹窗提示，用户确认退出，则移除存储的token，并且重新设置权限信号为true，展示无权限时的页面内容，当然最后关闭弹窗（设置弹窗显示信号为false）</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">// 退出登录</span>
<span class="line">function exitLogin() {</span>
<span class="line">    console.log(&#39;退出&#39;)</span>
<span class="line">    loginRef.current.addEventListener(&#39;tap&#39;, OpenModal)</span>
<span class="line">    Taro.removeStorageSync(&#39;token&#39;)</span>
<span class="line">    setNeedAuth(true);</span>
<span class="line">    setExitTip(false)</span>
<span class="line">}</span>
<span class="line">&lt;AtModal</span>
<span class="line">    isOpened={exitTip}</span>
<span class="line">    title=&#39;退出提示&#39;</span>
<span class="line">    cancelText=&#39;取消&#39;</span>
<span class="line">    confirmText=&#39;确定&#39;</span>
<span class="line">    onClose={handleClose}</span>
<span class="line">    onCancel={handleCancel}</span>
<span class="line">    onConfirm={exitLogin}</span>
<span class="line">    content=&#39;您确定要退出吗&#39;</span>
<span class="line">/&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="支持自动登录——个人页展示登录态内容-自动使用登录后功能" tabindex="-1"><a class="header-anchor" href="#支持自动登录——个人页展示登录态内容-自动使用登录后功能"><span>支持自动登录——个人页展示登录态内容，自动使用登录后功能</span></a></h2><p>项目实现了自动登录功能，登陆态和未登陆态的区别最主要是用户账号本地存储是否有token：一些需要登陆后使用的功能是通过发送请求时携带本地存储的token，由服务器校验后返回对应的请求结果实现。对于像个人页这种登录和未登录态存在显示内容上的区别的页面。则通过设置权限信号来区分两种页面的内容。自动登录则是在进入页面时检测本地存储的token。如果本地存储有token，则携带该token发送登录请求，自动登录请求成功则修改权限信号展示登录页面。自动登录请求失败，一般是因为用户本地存储的token过期，则提示登录状态过期，提示用户自行操作重新登陆。</p><p>下面是个人页自动登录并展示登录后页面的实现：</p><p>在页面挂载时尝试获取用户本地存储的token，如果能够获取则尝试自动登录。登陆成功则更新显示用户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const Me = forwardRef(({ userStore, videoStore }, ref) =&gt; {</span>
<span class="line">    // 权限信号，用于设置个人页面登录前后内容展示</span>
<span class="line">    const [needAuth, setNeedAuth] = useState(true);</span>
<span class="line">    ......</span>
<span class="line">    // 用户头像url</span>
<span class="line">    const [userAvatarUrl, setUserAvatarUrl] = useState(&#39;https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132&#39;)</span>
<span class="line">    // 用户昵称</span>
<span class="line">    const [userName, setUserName] = useState(&#39;微信用户&#39;)</span>
<span class="line">    // 临时url，用于填写抽屉修改信息</span>
<span class="line">    const [userAvatarUrlTemp, setUserAvatarUrlTemp] = useState(&#39;https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132&#39;)</span>
<span class="line">    // 临时昵称，填写抽屉修改信息</span>
<span class="line">    const [userNameTemp, setUserNameTemp] = useState(userName)</span>
<span class="line">    let token = &#39;&#39;;</span>
<span class="line"></span>
<span class="line">    useEffect(async () =&gt; {</span>
<span class="line">        ......</span>
<span class="line">        token = Taro.getStorageSync(&#39;token&#39;)</span>
<span class="line">        if (token) {</span>
<span class="line">            // 有token说明登陆过，可以自动登录</span>
<span class="line">            let autoLoginResult = await userStore.autoLogin(token);</span>
<span class="line">            // console.log(autoLoginResult.data);</span>
<span class="line">            if (autoLoginResult.data.code === 200) {</span>
<span class="line">                setUserAvatarUrl(autoLoginResult.data.data.userAvatarUrl)</span>
<span class="line">                setUserName(autoLoginResult.data.data.userName)</span>
<span class="line">                // 把更新抽屉中的头像和昵称也一起设置，注意这里不能用setUserNameTemp(userName)，异步执行会导致出问题</span>
<span class="line">                setUserAvatarUrlTemp(autoLoginResult.data.data.userAvatarUrl)</span>
<span class="line">                setUserNameTemp(autoLoginResult.data.data.userName)</span>
<span class="line">                // 记得显示内容就得切换为权限页面了</span>
<span class="line">                if (loginRef.current) {</span>
<span class="line">                    loginRef.current.removeEventListener(&#39;tap&#39;, OpenModal)</span>
<span class="line">                    console.log(&#39;移除成功&#39;)</span>
<span class="line">                }</span>
<span class="line">                setNeedAuth(false);</span>
<span class="line">            } else {</span>
<span class="line">                // 如果自动登录失败，说明token过期，那么应该重新登陆</span>
<span class="line">                Taro.removeStorageSync(&#39;token&#39;)</span>
<span class="line">                console.log(autoLoginResult.data.msg)</span>
<span class="line">                Taro.atMessage({</span>
<span class="line">                    // message: &#39;登录状态失效，请重新登录&#39;,</span>
<span class="line">                    message: autoLoginResult.data.msg,</span>
<span class="line">                    type: &#39;error&#39;</span>
<span class="line">                })</span>
<span class="line">            }</span>
<span class="line">        }</span>
<span class="line">    }, [])</span>
<span class="line">......</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="注意setstate的异步更新" tabindex="-1"><a class="header-anchor" href="#注意setstate的异步更新"><span>注意setState的异步更新</span></a></h3><p>注意到这里抽屉和个人页都存有一份用户头像和昵称的信息。当自动登录成功获取用户信息后，需要将得到的信息分别交给抽屉和个人页，不能先设置个人页，然后将个人页的信息交给抽屉。也不能先设置抽屉，然后将抽屉的信息交给个人页。这是因为<strong>react的setstate的更新是异步执行的</strong>，如果像刚刚说的那样操作那么设置完之后的个人页或者抽屉信息是并没有实时更新、同步更新的，这个时候再将它们交给对方就会出现对方只能拿到还未完成设置的空白信息，所以说必须将自动登录请求成功后得到的信息分别交给抽屉和个人页。</p><p><strong>setState 的异步更新会在当前代码块执行完毕后、下一次 DOM 更新周期前触发</strong></p><p>上面的表述可能还不够严谨细致专业化，<strong>准确来说</strong>：微信小程序<strong>setState的渲染</strong>，并且<strong>setState的同个词法作用域闭包</strong>下<strong>捕获的是其渲染前的值</strong>，<strong>异步渲染后不更新</strong>，因此<strong>永远不要立刻使用刚setState设置完的值</strong>，要使用的话使用其数据源，而不是state： 和上面也可以说是一个意思，就比如先set个人页，然后set抽屉，个人页捕获请求值，但抽屉捕获了空值，最后异步渲染的时候，个人页当然拿到正常的请求值正常更新，但它自己更新不会影响当时抽屉已经捕获的空白的值，因此抽屉仍然拿着当初捕获的空值去更新自己，那最后更新完就不可能是想要的请求值了。</p><h3 id="自动登录的后台实现" tabindex="-1"><a class="header-anchor" href="#自动登录的后台实现"><span>自动登录的后台实现</span></a></h3><p>当然，自动登录很重要的部分还跟后端有关，因为需要提供根据token查询唯一用户的功能</p><p>我主要是通过使用cache，也就是redis缓存用户信息，并设置为可以通过token获取用户id、头像、昵称，因此可以使用token发送请求获取用户信息实现自动登录。</p><h3 id="token获取用户信息注意事项" tabindex="-1"><a class="header-anchor" href="#token获取用户信息注意事项"><span>token获取用户信息注意事项</span></a></h3><p>token获取用户信息的使用是相当广泛的，最常使用的就是通过token获取userid，再根据userid去做需要的请求和操作，比如更新浏览历史记录、点赞、收藏，都是根据用户发送请求时提交的token在redis里匹配用户的userid。再根据userid查到数据库中匹配的信息去增、删、改。</p><p>其中，因为查询用户使用的userid是ObjectId类型，而从redis里根据token获取的是字符串类型，所以还需要先转换才能查，转换方式：const userid = mongoose.Types.ObjectId(data.userid);</p><h2 id="dom监听解决方案" tabindex="-1"><a class="header-anchor" href="#dom监听解决方案"><span>dom监听解决方案</span></a></h2><p>原本的事件监听从ref放到下一层的卡片上，让事件监听随组件标签销毁进行同步销毁，无需手动对dom操作移除，避免了一系列bug</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line"> &lt;View ref={loginRef}&gt;</span>
<span class="line">{</span>
<span class="line">    needAuth</span>
<span class="line">        ? &lt;View className=&#39;userInfo &#39; onClick={OpenModal}&gt;</span>
<span class="line">            ......</span>
<span class="line">            &lt;/View&gt;</span>
<span class="line">        : &lt;View&gt;</span>
<span class="line">            ......</span>
<span class="line">            &lt;/View&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="原理与原因分析" tabindex="-1"><a class="header-anchor" href="#原理与原因分析"><span>原理与原因分析：</span></a></h3><p>在小程序开发中，尽量避免直接操作 DOM，这是由小程序的运行机制和框架设计决定的，主要原因如下：</p><ol><li>小程序的 “双线程” 架构限制直接 DOM 操作</li></ol><p>小程序采用 渲染层（WebView） 和 逻辑层（JSCore） 分离的双线程架构：</p><p>逻辑层负责业务逻辑（如数据处理、事件响应），无法直接访问渲染层的 DOM/BOM。</p><p>渲染层负责页面渲染，两者通过 数据通信 同步状态（类似 React/Vue 的数据驱动思想）。</p><p>直接操作 DOM 的代码（如 document.getElementById、window.scrollTo 等）在逻辑层中会失效，且可能导致线程通信混乱，引发渲染异常。</p><ol start="2"><li>框架设计鼓励 “数据驱动” 而非 “DOM 操作”</li></ol><p>主流小程序框架（微信小程序原生框架、Taro、UniApp 等）均采用 数据驱动视图 的模式：</p><p>开发者通过修改 data 中的数据，框架自动更新对应的视图（类似 React 的 setState 或 Vue 的 v-model）。</p><p>直接操作 DOM 会绕过框架的状态管理，导致 数据与视图不一致，增加调试难度（例如手动修改 DOM 后，数据未同步，下次更新会覆盖手动修改的结果）。</p><ol start="3"><li>性能与兼容性问题</li></ol><p>性能损耗：小程序对 DOM 操作的支持有限，频繁手动操作 DOM 可能导致渲染层与逻辑层通信频繁，引发页面卡顿。</p><p>跨端兼容性：如果使用 Taro 等跨端框架，直接 DOM 操作可能在不同平台（微信、支付宝、H5 等）表现不一致，违背 “一套代码多端运行” 的初衷。</p>`,102)]))}const t=n(l,[["render",c]]),r=JSON.parse('{"path":"/guide/AboutTaro/taro_five.html","title":"个人页——支持登录，更新头像昵称，查看历史、点赞、收藏，支持退出登录","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"登录与微信绑定","slug":"登录与微信绑定","link":"#登录与微信绑定","children":[{"level":3,"title":"dom移除onclick事件监听无效","slug":"dom移除onclick事件监听无效","link":"#dom移除onclick事件监听无效","children":[]},{"level":3,"title":"点击触发的组件在移除onclick的view中全部失效——冒泡与捕获","slug":"点击触发的组件在移除onclick的view中全部失效——冒泡与捕获","link":"#点击触发的组件在移除onclick的view中全部失效——冒泡与捕获","children":[]}]},{"level":2,"title":"支持更新用户头像昵称，支持获取微信头像昵称","slug":"支持更新用户头像昵称-支持获取微信头像昵称","link":"#支持更新用户头像昵称-支持获取微信头像昵称","children":[]},{"level":2,"title":"支持查看历史浏览、点赞、收藏——三功能代码复用的区分","slug":"支持查看历史浏览、点赞、收藏——三功能代码复用的区分","link":"#支持查看历史浏览、点赞、收藏——三功能代码复用的区分","children":[]},{"level":2,"title":"支持查看历史浏览、点赞、收藏——三功能代码复用的实现","slug":"支持查看历史浏览、点赞、收藏——三功能代码复用的实现","link":"#支持查看历史浏览、点赞、收藏——三功能代码复用的实现","children":[{"level":3,"title":"视频列表页——useEffect的回调函数是async产生报错","slug":"视频列表页——useeffect的回调函数是async产生报错","link":"#视频列表页——useeffect的回调函数是async产生报错","children":[]},{"level":3,"title":"视频列表页——点击列表中项目跳转播放页——播放页的复用","slug":"视频列表页——点击列表中项目跳转播放页——播放页的复用","link":"#视频列表页——点击列表中项目跳转播放页——播放页的复用","children":[]}]},{"level":2,"title":"视频列表页——支持清空历史浏览记录","slug":"视频列表页——支持清空历史浏览记录","link":"#视频列表页——支持清空历史浏览记录","children":[]},{"level":2,"title":"支持退出登录","slug":"支持退出登录","link":"#支持退出登录","children":[]},{"level":2,"title":"支持自动登录——个人页展示登录态内容，自动使用登录后功能","slug":"支持自动登录——个人页展示登录态内容-自动使用登录后功能","link":"#支持自动登录——个人页展示登录态内容-自动使用登录后功能","children":[{"level":3,"title":"注意setState的异步更新","slug":"注意setstate的异步更新","link":"#注意setstate的异步更新","children":[]},{"level":3,"title":"自动登录的后台实现","slug":"自动登录的后台实现","link":"#自动登录的后台实现","children":[]},{"level":3,"title":"token获取用户信息注意事项","slug":"token获取用户信息注意事项","link":"#token获取用户信息注意事项","children":[]}]},{"level":2,"title":"dom监听解决方案","slug":"dom监听解决方案","link":"#dom监听解决方案","children":[{"level":3,"title":"原理与原因分析：","slug":"原理与原因分析","link":"#原理与原因分析","children":[]}]}],"git":{"updatedTime":1754150424000,"contributors":[{"name":"X4M7","username":"X4M7","email":"1415808154@qq.com","commits":2,"url":"https://github.com/X4M7"}],"changelog":[{"hash":"ac92fcc2ab19fe7a149e4e2a4d6cbd45fbf4a8ca","time":1754150424000,"email":"1415808154@qq.com","author":"X4M7","message":"补充对dom操作导致bug的最终正确完美解决方案的讲解，原解决方案部分提供链接跳转"},{"hash":"8e61c918405d118e4df6ba6aa7830a9067521d4d","time":1754139660000,"email":"1415808154@qq.com","author":"X4M7","message":"react+taro小程序项目文档基本完成"}]},"filePathRelative":"guide/AboutTaro/taro_five.md"}');export{t as comp,r as data};
