/*
means.js 工具类
name:lh
date:2019-7-16 15:19
*/

/*
封装insertAfter() 函数在节点后添加元素节点(添加的是元素节点不是节点)
date:2019-7-16
*/
Element.prototype.insertAfter = function (target, origin) {
    //参数说明 target:要插入的节点 origin:在哪个元素后面插入节点
    var nextElemNode = origin.nextElementSibling;  //获取源节点的下一个元素节点
    if (nextElemNode == null) {
        this.appendChild(target);
    } else {
        this.insertBefore(target, nextElemNode);
    }

}

/*
封装getScrollOffset() 函数用于获取滚动条的滚动距离返回x,y值(返回的是一个Object的对象值)
date:2019-7-16 22:20
*/
function getScrollOffset() {
    if (window.pageXOffset) {
        //用于W3C 支持的浏览器
        return {
            x: window.pageXOffset,
            y: window.pageYOffset,
        }
    } else {
        //用于IE8及其以下的浏览器
        return {
            x: document.body.scrollLeft + document.documentElement.scrollLeft,
            y: document.body.scrollTop + document.documentElement.scrollTop,
        }
    }
}

/*
封装getViewportOffset() 函数用于获取页面可视区域的大小(可视区域:不包括地址栏,控制台) 返回获取的宽度和高度
date:2019-7-16 22:47
*/
function getViewportOffset() {
    //W3C标准浏览器
    if (window.innerWidth) {
        return {
            w: window.innerWidth,
            h: window.innerHeight,
        }
    } else {
        //IE8及其以下浏览器 第一个是标准模式
        if (document.compatMode === "CSS1Compat") {
            return {
                w: document.documentElement.clientWidth,
                h: document.documentElement.clientHeight,
            }
        } else {
            //怪异模式
            return {
                w: document.body.clientWidth,
                h: document.body.clientHeight,
            }
        }
    }
}

/*
封装getStyle() 函数用于获取元素的css属性兼容IE及IE8.0以下浏览器 参数说明:elem:要获取的元素 prop:元素的那个属性
date:2019-7-18 12:49
*/
function getStyle(elem, prop) {
    if (window.getComputedStyle) {
        return window.getComputedStyle(elem, null)[prop];
    } else {
        return elem.currentStyle[prop];
    }
}

/*
封装addEven() 兼容性的事件处理函数IE浏览器的attachEvent的this指向的是elem 参数说明:elem:要监听的元素 handle:事件处理函数,type:事件类型
date:2019-7-18 15:09
*/
function addEven(elem, type, handle) {
    if (elem.addEventListener) {
        elem.addEventListener(type, handle, false);
    } else if (elem.attachEvent) {
        elem.attachEvent('on' + type, function () {
            handle.call(elem);
        });
    } else {
        elem['on' + type] = handle;
    }
}

/*
封装inherit() 函数实现继承(圣杯模式) 参数说明:Target 要继承的元素 Origin:源对象
date:2019-7-18 15:51
*/
function inherit(target, origin) {
    function F() { };
    F.prototype = origin.prototype;
    target.prototype = new F();
    target.prototype.contructor = Target;
    target.prototype.uber = origin.prototype;
}

/*
封装deepClone() 函数实现对象的深度克隆 参数说明:target:要克隆的对象 origin:数据源 target和origin 均是对象
date:2019-7-18 16:11
*/
function deepClone(target, origin) {
    var target = target || {},
        toStr = Object.prototype.toString;
    for (var prop in origin) {
        if (origin.hasOwnProperty(prop)) {
            if (origin[prop] !== null && typeof (origin[prop]) == "object") {
                //对象类型的数据 判断是数组还是对象
                if (toStr.call(origin[prop]) == "[object Array]") {
                    target[prop] = [];
                } else {
                    target[prop] = {};
                }
                deepClone(target[prop], origin[prop]);
            } else {
                //原型数据 直接添加
                target[prop] = origin[prop];
            }
        }
    }
}

/*
封装unique() 函数用于数组去重 返回一个新的没有重复值的数组(利用对象中key值不能重复的原理)
date:2019-7-18 16:23
*/
Array.prototype.unique = function () {
    var arr = [],
        len = this.length,
        temp = {};
    for (var x = 0; x < len; x++) {
        if (!temp[this[x]]) {
            temp[this[x]] = "abc";
            arr.push(this[x]);
        }
    }
    return arr;
}

/*
封装stringDuplication() 函数用于字符串去重 参数说明:str:需要去重的字符串
date:2019-7-18 16:35
*/
function stringDuplication(str) {
    var tempArr = [];
    if (str == "" || str == null) {
        console.log("字符串为空请从新传入!");
        return;
    }
    for (var x = 0; x < str.length; x++) {
        tempArr[x] = (str.charAt(x));
    }
    if (tempArr.length <= 0) {
        return;
    }
    return tempArr.unique();
}

/*
封装stopBubble() 函数用于取消事件冒泡 参数说明:event 要取消的事件
date:2019-7-18 22:04
*/
function stopBubble(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
}
/*
封装cancelHandle() 函数用于阻止默认事件(兼容IE)
date:2019-7-18 22:16
*/
function cancelHandle(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnVaule = false;
    }
}

/*
封装Pager() 对象用于实现页码插件 采用对象加原型链编程 使用时new Pager(obj{}) 生成一个对象并且传入参数,参数是可选的.
对象提供了onPagerChange() 的回调函数用于使用者添加ajax渲染页面
对象参数说明
1 total 总数据量
2 limit 每页要显示多少条数据
3 current 当前页码
4 firstText 首页字体
5 prevText 上一页
6 nextText 下一页
7 lastText 尾页
8 panelNumber 每个页面显示多少数字
9 container 容器
date:2019-7-20 14:48
*/
function Pager(options) {
    //配置一个默认参数 如果传入的数据为空可采用默认的配置
    var onDefaultOptions = {
        total: 0,
        limit: 1,
        container: document.querySelector('.pager'),
        current: 1,
        firstText: "首页",
        prevText: "上一页",
        nextText: "下一页",
        lastText: "尾页",
        panelNumber: 10,
        onPageChange: null,
    }
    //对传入的对象和默认配置进行数据比对
    this.options = Object.assign({}, onDefaultOptions, options);
    //渲染页面
    this.show();
    //注册事件
    this.addEvent();
}
//show() 用于渲染页面 每次改变都要从新渲染页面
Pager.prototype.show = function () {
    var page = this.options.current;
    if (this.options.onPageChange) {
        this.options.onPageChange(page);
    }
    //从新渲染时清空容器 
    this.options.container.innerHTML = "";
    //创建元素 添加disable 属性用于当当前页处于最前或最后是将首页,上一页,下一页尾页设置为不可点击
    var disabled = "";
    if (this.options.current === 1) {
        disabled === "disabled";
    }
    //创建首页
    this.createPagerItem("first " + disabled, this.options.firstText);
    //创建上一页
    this.createPagerItem("prev " + disabled, this.options.prevText);
    //创建数字页
    disabled = "";
    this.createPagerNumbers();
    //在次判断当前页是不是在尾页
    if (this.options.current === this.getPagerNumber()) {
        disabled = "disabled";
    }
    //下一页
    this.createPagerItem("next " + disabled, this.options.nextText);
    //尾页
    this.createPagerItem("last " + disabled, this.options.lastText);
    //创建最后的当前页/最大页
    var span = document.createElement("span");
    span.className = "pager-text pager-item"
    span.innerHTML = `<i class="current">${this.options.current}</i> / <i class="total">${this.getPagerNumber()}</i>`;
    this.options.container.appendChild(span);
}
//createPagerItem() 用于创建元素
Pager.prototype.createPagerItem = function (extralClassName, content) {
    //参数说明 extralClassName:要添加的类名 content:元素的字体
    //创建a元素
    var a = document.createElement('a');
    //添加css类名
    a.className = "pager-item " + extralClassName;
    a.innerText = content;
    //添加到容器
    this.options.container.appendChild(a);
}
//getPagerNumber() 计算页数获取尾页 total/limie
Pager.prototype.getPagerNumber = function () {
    return Math.ceil(this.options.total / this.options.limit);
}
//createPagerNumbers() 创建数字页码
Pager.prototype.createPagerNumbers = function () {
    //获取最小页码数和最大页码数
    var min = this.options.current - Math.floor(this.options.panelNumber / 2);
    if (min < 1) {
        min = 1;
    }
    var max = min + this.options.panelNumber - 1;
    if (max > this.getPagerNumber()) {
        max = this.getPagerNumber();
    }
    //创建元素
    for (var x = min; x <= max; x++) {
        var active = "";
        if (x == this.options.current) {
            active = "active";
        }
        this.createPagerItem("number " + active, x);
    }
}
//addEvent() 添加事件 当点击按钮实现改变
Pager.prototype.addEvent = function () {
    //使用事件委托 将事件注册在父组件上
    var that = this;
    this.options.container.addEventListener('click', function (e) {
        //改变this指向 这里的this指向的是容器 要改为对象
        //点击首页 使用class 类名进行识别点击了那个键 每个键的class都是不同的
        if (e.target.classList.contains("first")) {
            that.toPager(1);
        } else if (e.target.classList.contains("prev")) {
            that.toPager(that.options.current - 1);
        } else if (e.target.classList.contains("next")) {
            that.toPager(that.options.current + 1);
        } else if (e.target.classList.contains("last")) {
            that.toPager(that.getPagerNumber());
        } else if (e.target.classList.contains("number")) {
            that.toPager(+e.target.innerText);
        }

    }, false);
}
//toPager() 实现跳转
Pager.prototype.toPager = function (page) {
    //对page进行判断防止超界
    if (page < 1) {
        page = 1;
    }
    if (page > this.getPagerNumber()) {
        page = this.getPagerNumber();
    }
    if (this.options.current === page) {
        return;
    }
    //维护current
    this.options.current = page;
    //从新渲染页面
    this.show();

}

/*
封装CarouselImg() 对象实现3D轮播图
参数说明:
img:图片元素,translateleftx:左侧图片的距离 translatefightx:右侧图片距离 rotate:图片倾斜角度 translatez:中轴距离 time:轮播时间
date:2019-7-20 16:43
*/
function CarouselImg(options) {
    //设置参数
    var onDefaultOptions = {
        img: document.querySelector('img'),
        translateleftx: -150,
        translaterightx: 150,
        rotateleft: 30,
        rotateright: -30,
        translatez: 150,
        time: 1000,
    }
    this.options = Object.assign({}, onDefaultOptions, options);
    //定义三个对象内可以访问的变量
    var len = this.options.img.length,
        timer = 0,
        curDisplay = 0;
    //show() 显示页面函数    
    this.show = function () {
        var lIndex, rIndex;
        //计算中间值
        var mLen = Math.floor(len / 2);
        //循环修改值
        for (var x = 0; x < mLen; x++) {
            //计算左边的图片值
            lIndex = len + curDisplay - x - 1;
            //设置界限
            if (lIndex > len - 1) {
                lIndex -= len;
            }
            //修改图片的样式
            this.options.img[lIndex].style.transform = 'translateX(' + (this.options.translateleftx * (x + 1)) + 'px) rotateY(' + this.options.rotateleft + 'deg)';
            //计算右边图片的参数
            rIndex = curDisplay + x + 1;
            if (rIndex > len - 1) {
                rIndex -= len;
            }
            this.options.img[rIndex].style.transform = 'translateX(' + (this.options.translaterightx * (x + 1)) + 'px) rotateY(' + this.options.rotateright + 'deg)';
        }
        //修改中间图片的css属性
        img[curDisplay].style.transform = 'translateZ(' + this.options.translatez + 'px)';
    }
    //绑定事件 绑定单机,鼠标移入,鼠标移出事件
    this.bindEvent = function () {
        var img = this.options.img;
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (z) {
                img[z].onclick = function () {
                    curDisplay = z;
                    that.show();
                },
                    img[z].onmouseenter = function () {
                        //清除定时器
                        clearInterval(timer);
                    },
                    img[z].onmouseleave = function () {
                        that.play();
                    }
            }(i));
        }
    }
    //设置自动轮播事件
    this.play = function () {
        var time = this.options.time;
        var that = this;
        //使用定时器
        timer = setInterval(function () {
            if (curDisplay === len - 1) {
                curDisplay = 0;
            } else {
                curDisplay++;
            }
            that.show();
        }, time);
    }
    //初始化函数
    this.show();
    this.bindEvent();
    this.play();
}

/*
封装loadScript() 函数用于异步加载script.js 参数说明:script路径 callback:加载完的回调函数
date:2019-7-21 14:43
*/
function loadScript(url, callback) {
    var script = document.createElement('script');
    script.type = "text/javascript";
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "complete" || script.readyState == "loaded") {
                callback();
            }
        }
    } else {
        script.onload = function () {
            callback();
        }
    }
    //先绑定事件在加载文件
    script.src = url;
    document.head.appendChild(script);
}
/*
*/
function Sort() {
    this.bubbleRiseSort = function (arr) {
        var len = arr.length;
        for (var x = 0; x < len - 1; x++) {
            for (var y = 0; y < len - 1 - x; y++) {
                if (arr[y] > arr[y + 1]) {
                    var temp = arr[y];
                    arr[y] = arr[y + 1];
                    arr[y + 1] = temp;
                }
            }
        }
        return arr;
    }
    this.bubbleDropSort = function () {
        var len = arr.length;
        for (var x = 0; x < len - 1; x++) {
            for (var y = 0; y < len - 1 - x; y++) {
                if (!(arr[y] > arr[y + 1])) {
                    var temp = arr[y];
                    arr[y] = arr[y + 1];
                    arr[y + 1] = temp;
                }
            }
        }
        return arr;
    }
}

/**
 * ajax 发送HTTP请求函数 options:配置的参数,callback:执行成功或者失败调用的回调函数
 * @param {*} options 
 * @param {*} callback 
 */
function ajax(option) {
    var xhr = new XMLHttpRequest();
    /**
     * 默认的参数配置 如果有参数传递将会覆盖没有的话使用默认请求数据
     */
    var defaultOptions = {
        url: "",
        method: "GET",
        data: null,
        timeout: 3000,
        mimetype: "text/json; charset=utf-8",
        callbackSuccess:function(){},
        callbackStatusError:function(){},
        callbackError:function(){},
        callbackTimeOut:function(){}
    }
    let options = Object.assign({}, defaultOptions, option);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                options.callbackSuccess(xhr.responseText, xhr.responseXML);
            } else {
                options.callbackStatusError(xhr.status);
            }
        } else {
           
        }
    }
    xhr.ontimeout = function (e) {
        options.callbackTimeOut(e, xhr);
    }
    xhr.onerror = function (e) {
        options.callbackError(e, xhr);
    }
    xhr.timeout = options.timeout;
    xhr.open(options.method, options.url,true);
    if (options.method.toLocaleUpperCase() == "GET") {
        xhr.send();
    } else {
        if (!options.data) {
            console.log("要发送的数据为空");
            return;
        }
        var data = JSON.stringify(options.data);
        console.log(data);
        xhr.setRequestHeader("Content-type","application/json;charset=utf-8");
        xhr.send(data);
    }
    return xhr;
}

/**
 * 元素拖放
 * @param {*} elem 
 */
function drag(elem){
    var disX,disY;
    elem.onmousedown = function(e){
       
        disX = e.pageX-parseInt(elem.offsetLeft);
        disY = e.pageY-parseInt(elem.offsetTop);
        
        document.onmousemove = function(e){
            var e = e || window.e;
            elem.style.left = e.pageX-disX +"px";
            elem.style.top = e.pageY-disY+"px";
        }
        document.onmouseup = function(e){
            elem.onmousemove = null;
        }
    }
}

/**
 * 封装forEach 用于返回对象或者数组中的数据
 * @param {*} obj  要返回的数据源
 * @param {*} fn   回调函数
 */
let forEach = (obj, fn) => {
    let str = Object.prototype.toString;
    //判断传入的数据类型
    if (typeof (obj) !== 'object' || obj === null || obj==undefined) {
        console.log("参数不合法");
        return null;
    }
    for (let val of obj) {
        if (str.call(obj) === '[object Array]') {
            fn(val);
        } else if (str.call(obj) === '[object Object]') {
            if (obj.hasOwnProperty(val)) {
                fn(val, obj[val]);
            }
        } else {
            console.log("数据不合法");
        }
    }
}

/**
 * unless 如果值为false则执行fn
 * @param {*} predicate 
 * @param {*} fn 
 */

let unless = (predicate, fn) => {
    if (!predicate)
        fn();
}

/**
 * times 只有一个功能遍历数字然后把接收到的数据给fn
 * @param {*} times 
 * @param {*} fn 
 */
let times = (times, fn) => {
    for (let x = 0; x < times; x++) {
        fn(x);
    }
}

/**
 * tap函数接收一个value值并返回一个包含value的闭包函数
 * @param {*} value 
 */
let tap = (value) => {
    (fn) => (
        typeof (fn) === 'function' && fn(value),
        console.log(value)
    )
}

/**
 * unary
 * @param {*} fn 
 */
let unary = (fn) => fn.length === 1 ? fn : (arg) => (arg);

/**
 * 设置一次执行函数 只执行一次
 * @param {*} fn 
 */
let once = (fn) => {
    let done = false;
    return function () {
        return done ? undefined : ((done = true), fn.apply(this, arguments))
    }
}

/**
 * 使用递归计算阶乘
 * @param {*} n 
 */
let factorial = (n) => {
    if (n === 0) {
        return 1;
    }
    return n * factorial(n - 1)
}

/**
 * 封装map
 * @param {*} array 
 * @param {*} fn 
 */
let map = (array, fn) => {
    let results = [];
    for (let value of array)
        results.push(fn(value));
    return results;
}

/**
 * 封装filter
 * @param {*} array 
 * @param {*} fn 
 */
let filter = (array, fn) => {
    let results = [];
    for (let value of array)
        (fn(value)) ? results.push(value) : undefined
    return results;
}

let concatAll = (array, fn) => {
    let results = [];

}

/**
 * 封装reduce
 * @param {Array} array 
 * @param {function} fn 
 */
let reduce = (array, fn, initialValue) => {
    let accumlator;
    if (initialValue != undefined)
        accumlator = initialValue;
    else
        accumlator = array[0];
    if (initialValue === undefined)
        for (let x = 1; x < array.length; x++)
            accumlator = fn(accumlator, array[x]);
    else
        for (let value of array)
            accumlator = fn(accumlator, value);
    return [accumlator]
}

/**
 * 封装zip函数用于拼接数组
 * @param {*} leftArr 
 * @param {*} rightArr 
 * @param {*} fn 
 */
let zip = (leftArr, rightArr, fn) => {
    let index, results = [];
    for (index = 0; index < Math.min(leftArr.length, rightArr.length); index++)
        results.push(fn(leftArr[index], rightArr[index]));
    return results;
}

/**
 * 柯里化函数 只支持单个参数
 * @param {*} binaryFn 
 */
let curry = (binaryFn) => {

    if (typeof (binaryFn) !== "function") {
        throw Error('No function provided');
    }
    return function (firstArg) {
        return function (secondArg) {
            return binaryFn(firstArg, secondArg)
        }
    }
}

/**
 * 支持多个参数的柯里化函数
 * @param {*} fn 
 */
let curryArg = (fn) => {
    if (typeof (fn) !== 'function') {
        throw Error('No function provided');
    }
    return function curriedFn(...args) {
        if (args.length < fn.length) {
            return function () {
                return curriedFn.apply(null, args.concat([].slice.call(arguments)));
            }
        }
        return fn.apply(null, args);
    }
}

/**
 * 封装componse函数用于实现组合函数
 * @param {*} a 
 * @param {*} b 
 */
let componse = function (a, b) {
    return function (c) {
        return a(b(c))
    }
}

let componseN = (...fns) => {
    return (value) => {
        return reduce(fns.reverse(), (acc, fn) => fn(acc), value);
    }
}

/**
 * 封装pipe管道流函数其作用和compones一致只是参数顺序不同
 * @param  {...any} fns 
 */
let pipe = (...fns) => {
    return (value) => {
        return reduce(fns, (acc, fn) => fn(acc), value);
    }
}
/**
 * 封装偏函数
 * @param {*} fn 
 * @param  {...any} partialArgs 
 */
let partial = function (fn, ...partialArgs) {
    let args = partialArgs;
    return function (...fullArguments) {
        let arg = 0;
        for (let i = 0; i < args.length && arg < fullArguments.length; i++) {
            if (args[i] === undefined) {
                args[i] = fullArguments[arg++];
            }
        }
        return fn.apply(null, args);
    }
}

/**
 * 串的抽象数据类型 对串的操作进行封装 如果需要进行多个操作可以用componseN和pipe组合操作数据
 */

/**
 * 判断传入的字符串参数是否合法
 * @param {*} str 
 */
let isLegal = (str) => {
    if (str == null || str == undefined || typeof (str) != "string") {
        console.log("参数不合法");
        return false;
    } else {
        return true;
    }
}

//将cstr的值赋值给SeqString
let StrAssign = (SeqString, cstr) => {
    if (isLegal(SeqString) && isLegal(cstr)) {
        return SeqString += cstr;
    }else{
        return false;
    }
}

/**
 * 判断字符串是否为空
 * @param {*} SeqString 
 */
let isEmpty = (SeqString) => {
    if (!isLegal(SeqString)) {
        return null;
    }
    if (SeqString.length === 0) {
        return false;
    } else {
        return true;
    }
}

/**
 * 返回字符串的长度
 * @param {*} SeqString 
 */
let StrLength = (SeqString) => {
    if(!isLegal(SeqString)){
        return null;
    }
    return SeqString.length;
}

/**
 * 将origin的字符串数据赋值到target中不是复制引用
 * @param {*} target 
 * @param {*} origin 
 */
let StrCopy = (target, origin) => {
    if(!isLegal(target) && !isLegal(origin)){
       return null;
    }
    if(!isEmpty(origin)){
       console.log("源字符串为空");
       return null;
    }
    for(let x=0;x<origin.length;x++){
        target += origin.charAt(x);
    }
    return target;
}

/**
 * 返回字符串的ASCII值 返回一个数组
 * @param {*} target 
 */
let getASCII = (target)=>{
    if(!isLegal(target)){
       return null;
    }
    let arr = [];
    for(let x=0;x<target.length;x++){
        let ascii = target.charCodeAt(x);
        arr.push(ascii);
    }
    return arr;
}

/**
 * 函子
 */
let Container = function(val){
    this.value = val;
}

/**
 * 使用of静态函数返回Container 对象
 */
Container.of = function(value){
    return new Container(value);
}

/**
 * 使用map 处理数据后又将数据放回map
 */
Container.prototype.map = function(fn){
    return Container.of(fn(this.value))
}

/**
 * MayBe 函子
 */
let MayBe = function(val){
    this.value = val;
}
MayBe.of = function(val){
    return new MayBe(val);
}
MayBe.prototype.isNothing = function(){
    return (this.value===null || this.value===undefined);
}
MayBe.prototype.map = function(fn){
    return this.isNothing() ? MayBe.of(null) : MayBe.of(fn(this.value));
}

/**
 * Either 函子解决MayBe 函子map分支出错问题
 */

 let Nothing = function(val){
     this.value = val;
 }
 Nothing.of = function(val){
     return new Either(val);
 }
 Nothing.prototype.map = function(fn){
     return this;
 }
 let Some = function(val){
     this.value = val;
 }
 Some.of = function(val){
     return Some(val); 
 }
 Some.prototype.map = function(fn){
     return Some.of(fn(this.value));
 }

 let Either = {
     Nothing,
     Some:Some
 }

 /**
  * Monad 函子 解决深层次map嵌套问题 但是调用join只要数据流不为null则终止调用链
  */
 MayBe.prototype.join = function(){
     return this.isNothing()? MayBe.of(null) : this.value;
 }

 function trim(str){
    return str.replace(/(^\s*)|(\s*$)/g, ""); 
}
function getRandom(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}
function getDate(){
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}
