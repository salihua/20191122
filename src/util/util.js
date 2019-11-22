let fs = require('fs');
let path = require('path');

/**
 * get date
 */
function getDate(){
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

/**
 * get random
 * @param {*} min 
 * @param {*} max 
 */
function getRandom(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}

/**
 * 格式化字符串 去除字符串前后的空格
 * @param {string} str 
 */
function trim(str){
    return str.replace(/(^\s*)|(\s*$)/g, ""); 
}

/**
 * 遍历数组
 * @param {*} obj 
 * @param {*} fn 
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
let getAll=async (option,callback)=>{
    await option.table.findAll({
        where:option.where
    }).catch((res)=>{
        callback(res);
    }).catch((err)=>{
        throw(err)
    })
 }

 /**
  * 深度克隆对象
  * @param {*} target 
  * @param {*} origin 
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
/**
 * 专门用于读取data中的model的数据
 */
async function  readDataModel(){ 
    let data =await fs.readFileSync(path.join(__dirname,'../../data/data.json'),{ encoding: 'utf-8' });
    return data;
}
async function writeDataModel(data){
    let rs =await fs.writeFileSync(path.join(__dirname,'../../data/data.json'),JSON.stringify(data));
    return rs;
}
async function readTitle(username){
    let data =JSON.parse(await fs.readFileSync(path.join(__dirname,'../../data/style.json'),{ encoding: 'utf-8' }));
    let title  ='';
    forEach(data,(origin)=>{
         if(origin.username==username){
            title = origin.title;
         }
    });
    return title;
    
}
function parsePostData(ctx){
    // 利用ES6的语法new一个Promise对象，其中传递两个值，resolve是成功的，而reject是失败的
    return new Promise((resolve,reject)=>{
        try{
            // 对获取到的值进行处理
            let postdata="";
            ctx.req.on('data',(data)=>{
                postdata += data
            })
            ctx.req.addListener("end",function(){
                console.log(postdata);
                resolve(postdata);
            })
        }catch(error){
            // 把错误的信息返回出去
            reject(error);
        }
    });
}
module.exports ={
    getDate,
    getRandom,
    trim,
    forEach,
    getAll,
    deepClone,
    readDataModel,
    writeDataModel,
    parsePostData,
    readTitle
}