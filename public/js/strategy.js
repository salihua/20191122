/**
 * Strategy.js 策略控制类
 */
function Strategy(){
    this.OriginData = [
         
    ];
    //要渲染的数据 筛选时如此筛选便可
    this.DealWithData = [
       
    ];
     
    this.DOMElem = {
         strategyList:document.getElementsByClassName('strategy-list')[0],
         strategyUlElem:document.getElementsByClassName('strategy-ul')[0],
         imgIsopen:document.getElementsByClassName('img-isopen')[0],
         selectStrategyType:document.getElementsByClassName('select screen strategy-type')[0],
         selectDeviceName:document.getElementsByClassName('select screen device-name')[0],
         seacherInputElem:document.getElementsByClassName('screen-input')[0],
         btnAddStratrgyElem:document.getElementsByClassName('btn btn-add-device')[0],
         btnDeleteStrategyElem:document.getElementsByClassName('btn btn-delete all')[0],
         chooseStrategyElem:document.getElementsByClassName('choose-strategy'),
         defaultEleme:document.getElementsByClassName('default-style home-style')[0],
         pagerElem:document.getElementsByClassName('pager')[0],

         showDefaultElem:(dis1,dis2,classname)=>{
            this.DOMElem.strategyList.style.display = dis1;
            this.DOMElem.pagerElem.style.display = dis2;
            this.DOMElem.defaultEleme.className = classname;
         }

    }
    this.options = {
        panelNumber: 3,
        limit:3,
    }
    this.getData();

    this.select();
    this.seacher();
}
/**
 * 注册事件
 */
Strategy.prototype.bindEvent = function(){
    let choose = document.getElementsByClassName('choose-strategy');
    for(let x=0;x<choose.length;x++){
        choose[x].addEventListener('click',(e)=>{
            if(e.target.checked){
                e.target.isChecked = true;
            }else{
                e.target.isChecked = false;
            }
        })
    }
   this.DOMElem.btnAddStratrgyElem.addEventListener('click',(e)=>{

   })
   this.DOMElem.btnDeleteStrategyElem.addEventListener('click',(e)=>{
       let arr = [];
        forEach(Array.prototype.slice.call(choose),(e)=>{
             if(e.isChecked){
               arr.push(e.parentElement.nextElementSibling.children[1].children[0].lastElementChild.innerHTML)
             }
        });
       // console.log(arr);
        if(arr.length<=0){
            alert("请选择要删除的策略");
        }else{
            //调用ajax
            ajax({
                url:`/strategy/deletedata/?data=${arr}`,
                method:'GET',
                callbackSuccess:(resText,resXML)=>{
                     if(!resText){
                        return;
                     }
                     let data = JSON.parse(resText);
                     if(data.data===1){
                       window.location.href = `/strategy/toStrategyPage`;
                     }
                }
            })
        }
   })
}
/**
 * 发送ajax请求获取策略
 */
Strategy.prototype.getData = function(){
    ajax({
        url:`/strategy/getData`,
        callbackSuccess:(resText,resXML)=>{
            if(!resText){
               return;
            }
            let res = JSON.parse(resText);
            this.OriginData.push(res.data);
         
            this.mergeData();
            this.bindEvent();
        }
    })
}
/**
 * 处理数据
 */
Strategy.prototype.mergeData  = function(){
    let that = this;
    this.DealWithData = [];
    forEach(this.OriginData,(origin)=>{
        forEach(origin.device,(device)=>{
            that.sort(device.strategy);
            forEach(device.strategy,(strategy)=>{
                
                let prop = {};
                let condition = ``;
                let actuat = ``;
                let times = ``;
                prop['username'] = origin['username'];
                prop['deviceid'] = device['deviceid'];
                prop['devicename'] = device['devicename'];
                prop['strategyid'] = strategy['strategyid'];
                prop['createTime'] = strategy['createTime'];
                prop['isOpen'] = strategy['isOpen'];
                prop['type'] = strategy['type']
                if(strategy.isOpen){
                   prop['imgIsopenClass'] = 'img-isopen active';
                   prop['stateText'] = '已开启';
                }else{
                    prop['imgIsopenClass'] = 'img-isopen hidden';
                    prop['stateText'] = '未开启';
                }
                if(strategy['type']==='control'){
                    prop['strategytype'] = '设备控制';
                    
                    forEach(strategy.times,(time)=>{
                        if(time.isEveryOnce){
                            times +=`每次接收数据时执行; 定时执行:${time.time}`;
                        }
                        
                    })
                   
                    
                    forEach(strategy.sensors,(sensors)=>{
                        condition+=`${sensors.odds.replace(/a/g,sensors['sensorname'])}    `;
                    });
                    forEach(strategy.control,(control)=>{
                         if(control['cz']==='open'){
                             actuat += `打开 ${control['actuatname']}   `
                         }else if(control['cz']==='close'){
                            actuat += `关闭 ${control['actuatname']}   `
                         }
                    });
                }else if(strategy['type']==='tag'){
                    prop['strategytype'] = '数据标记';
                    forEach(strategy.sensors,(tag)=>{
                         condition +=`${tag.isTagData.odds.replace(/a/g,tag['sensorname'])}`
                    })
                }else{
                    prop['strategytype']='无';
                }
                prop['condition'] = condition;
                prop['action'] = actuat;
                prop['times'] = times;
                that.DealWithData.push(prop);
            });
            
        })
    });
    this.render(this.DealWithData);
}
/**
 * 设置分页
 */
Strategy.prototype.render = function(originArray){
    let that = this;
    if (!originArray || originArray.length <= 0) {
         this.DOMElem.showDefaultElem('none','none','default-style home-style active');
    } else {
        this.DOMElem.showDefaultElem('block','block','default-style home-style hidden');
        let pager = new Pager({
            total: originArray.length,
            panelNumber: this.options.panelNumber,
            limit: this.options.limit,
            onPageChange: function (page) {
                that.renderBody(page,originArray);
            }
        })
    }

}
/**
 * 渲染页面
 */
Strategy.prototype.renderBody = function(page,arr){
    let panel = this.options.panelNumber
    var end = page * panel; //40 40-38<10 && 2>0
    if (end - arr.length < panel && end - arr.length > 0) {

        end = (arr.length - ((page * panel) - (panel))) + (page * panel) - (panel);

    }
    this.DOMElem.strategyUlElem.innerHTML = '';
    for(let x = page * panel - panel; x < end; x++){
        let li =document.createElement('li');
        let lihtml = `
        <div class="green-head"></div>
            <div class="strategy-item">
        <div class="select-strategy">
            <input type="checkbox" name="" id="" class="choose-strategy">
        </div>
        <div class="strategy-info">
            <div class="condition">
                <div class="odds exe">条件: <span class="exe-data">${arr[x].condition}</span></div>
                <div class="action exe">动作: <span  class="exe-data">${arr[x].action}</span></div>
                <div class="time exe">时间: <span class="exe-data">${arr[x].times}</span></div>
            </div>
            <div class="other-info">
                <div class="strategyid str-info">
                    策略ID:
                    <span class="id-value">${arr[x].strategyid}</span>
                </div>
                <div class="strategy-type str-info">
                    策略类型:
                    <span class="type">${arr[x].strategytype}</span>
                </div>
                <div class="strategy-user str-info">
                    所属用户:
                    <span class="user">${arr[x].username}</span>
                </div>
                <div class="correlation-deviceid str-info">
                    关联设备ID:
                    <span class="device">${arr[x].deviceid}</span>
                </div>
                <div class="correlation-device str-info">
                    关联设备:
                    <span class="device">${arr[x].devicename}</span>
                </div>
                <div class="strategy-create-time str-info">
                    创建时间:
                    <span class="time">${arr[x].createTime}</span>
                </div>
            </div>
            <div class="isOpen">
                 <div class="${arr[x].imgIsopenClass}"></div>
                 <span class="state">${arr[x].stateText}</span>
            </div>
        </div>
       </div>
    `
    li.innerHTML = lihtml;
    this.DOMElem.strategyUlElem.appendChild(li);
    this.bindEvent();
    }

}
/**
 * 下拉菜单选择
 */
Strategy.prototype.select = function(){
    /**
     * 难点在于如何实现并行按按层级搜索
     */
    this.DOMElem.selectStrategyType.addEventListener('change',(e)=>{
        let selectVal = e.target.value;
        this.selectdata(selectVal);

    })
    this.DOMElem.selectDeviceName.addEventListener('change',(e)=>{
        let selectVal = e.target.value;
        this.selectdata(selectVal);
    });
}
Strategy.prototype.selectdata = function(selectVal){
    if(selectVal==='all'){
        this.render(this.DealWithData);
        return;
     }
     let result = filter(this.DealWithData, (res) => {
         return res['type'] == selectVal ? res : undefined;
     });
     if (result && result.length > 0) {
         this.render(result);
     }
}
/**
 * 搜索框搜索数据
 */
Strategy.prototype.seacher = function(){
   this.DOMElem.seacherInputElem.addEventListener('input',(e)=>{
       let data = e.target.value.toString();
     
       let result = filter(this.DealWithData, (res) => {
        /**
         * 多层判断支持设备名称设备ID 传感器id 传感器名称 优先匹配id
         */
        if (this.isMe(data,res['deviceid']) || this.isMe(data, res['strategyid'])) {
            return res;
        }
        
    });
    this.render(result);
   })
}
/**
 * 判断字符串中是否包含字串如果有返回true
 */
Strategy.prototype.isMe = function (origin, target) {
    if(target.toString().indexOf(origin.toString())===0){
        
        return true;
    }else{
        return false;
    }
}
Strategy.prototype.getTime = function (time) {
    let date = new Date(time);
    return date.getTime();
}
/**
 * 对数据进行排序默认按照时间降序排序
 */
Strategy.prototype.sort = function (arr) {
    for (var x = 0; x < arr.length - 1; x++) {
        for (var y = 0; y < arr.length - 1; y++) {
            if (this.componse(this.getTime(arr[y]['createTime']), this.getTime(arr[y + 1]['createTime']))) {
                var temp = arr[y];
                arr[y] = arr[y + 1];
                arr[y + 1] = temp;
            }
        }
    }
}
/**
 * 比较两个函数
 */
Strategy.prototype.componse = function (val1, val2, ) {
    let signal = this.fh || '<';
    if (signal == '<') {
        if (val1 < val2) {
            return true;
        } else {
            return false;
        }
    } else {
        if (val1 > val2) {
            return true;
        } else {
            return false;
        }
    }

}
let strategy = new Strategy();