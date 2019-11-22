

/**
 * AddStrategy.js 控制策略的添加和删除
 */
function AddStrategy() {
    this.OriginData = [
       
    ];
    this.DealWidth = [];
    this.DOMElem = {
        deviceNameElem: document.getElementsByClassName('device-name')[0],
        sensorsElem: document.getElementsByClassName('sensors')[0],
        actuatElem: document.getElementsByClassName('strategy-action')[0],
        actionElem: document.getElementsByClassName('action')[0],
        condElem: document.getElementsByClassName('cond small')[0],
        iconAddSensorElem: document.getElementsByClassName('add icon-sensor')[0],
        iconJianshaoSensorElem: document.getElementsByClassName('jianhao icon-sensor'),
        iconAddActuatElem: document.getElementsByClassName('add icon-actuat')[0],
        iconJianshaoActuatElem: document.getElementsByClassName('jianhao icon-actuat'),
        iconAddTimeElem: document.getElementsByClassName('add icon-time')[0],
        iconJianshaoTimeElem: document.getElementsByClassName('jianhao icon-time'),
        modelElem: document.getElementsByClassName('model'),
        btnShure: document.getElementsByClassName('btn shure')[0],
        inputElem: document.getElementsByTagName('input'),
        selectElem: document.getElementsByClassName('select'),
        typeElem: document.getElementsByClassName('strategy-type')[0],
        tagDisableElem: document.getElementsByClassName('tag-disable')
    }
    this.getModelData();
   
    this.bindEvent();
}
AddStrategy.prototype.getModelData = function(){
    this.OriginData = [];
    ajax({
        url:`/stratrgy/getStrategyModel`,
        callbackSuccess:(resText)=>{
            if(!resText){
               return;
            }
            let data = JSON.parse(resText).data;
            this.OriginData = data;
            console.log(this.OriginData);
            this.renderDeviceName();
        }

    })
}
/**
 * 绑定事件
 */
AddStrategy.prototype.bindEvent = function () {
    this.addElemModel(this.DOMElem.iconAddSensorElem, this.DOMElem.iconJianshaoSensorElem);
    this.addElemModel(this.DOMElem.iconAddActuatElem, this.DOMElem.iconJianshaoActuatElem);
    this.addElemModel(this.DOMElem.iconAddTimeElem, this.DOMElem.iconJianshaoTimeElem);

    this.DOMElem.typeElem.addEventListener('change', (e) => {
        let val = this.returnSelectData(e.target);
        if (val == 'tag') {
            this.isEnable('disabled', 'disabled', this.DOMElem.tagDisableElem);
        } else {
            this.isEnable('disabled', 'enable', this.DOMElem.tagDisableElem);
        }
    });

    this.DOMElem.btnShure.addEventListener('click', (e) => {
        let typeData = this.returnSelectData(this.DOMElem.typeElem);
        let flag = true;
        if (typeData == 'control' || typeData=='all') {
            for (let x = 0; x < this.DOMElem.selectElem.length; x++) {
                this.DOMElem.selectElem[x].addEventListener('focus', (e) => {
                    e.target.style.borderColor = 'rgb(221, 221, 221)';
                });
                let val = this.returnSelectData(this.DOMElem.selectElem[x]);

                if (!this.isAll(val)) {
                    flag = false;
                    this.DOMElem.selectElem[x].style.border = '1px solid #d9534f';
                } 
            };
            for (let y = 0; y < this.DOMElem.inputElem.length; y++) {
                this.DOMElem.inputElem[y].addEventListener('focus', (e) => {
                    e.target.style.borderColor = 'rgb(221, 221, 221)';
                })
                let val = this.DOMElem.inputElem[y].value;
                if (val == "") {
                    flag = false;
                    this.DOMElem.inputElem[y].style.borderColor = '#d9534f';
                }
            }
            if(flag){
                this.comdingData();
            }
            
        }else{
            this.comdingTagData();
        }

    });

}
/**
 * 用于发送数据
 */
AddStrategy.prototype.sendData = function(data){
    console.log(data)
       ajax({
          url:`/strategy/addStrategy`,
          method:'POST',
          data:{data:data},
          callbackSuccess:function(resText,resXML){
                if(!resText){
                    return;
                }
               window.location.href = '/strategy/toStrategyPage';
          }
      })

}
/**
 * 负责聚合数据标记的数据
 */
AddStrategy.prototype.comdingTagData = function () {
      let prop = {};
      let sensors = [];
      let strategy = [];
      let device =[];
      let other = {};
      let sensorsVal = this.getSensorsData().sensors
      other['devicename'] = this.getDeviceData().devidename;
      other['deviceid'] = this.getDeviceData().deviceid;
      prop['strategyid'] = getRandom(1000, 9999);
      prop['createTime'] = getDate();
      prop['isOpen'] = true;
      prop['type'] = this.getTypeData().type;
      for(let x=0;x<sensorsVal.length;x++){
          let isTagData = {};
          let item = {};
          item['sensorname'] = sensorsVal[x].sensorname;
          item['sensorident'] = sensorsVal[x].sensorident;
          isTagData['state'] = true;
          isTagData['odds'] = sensorsVal[x].odds;
          item['isTagData'] = isTagData;
          sensors.push(item);
      }
      prop['sensors'] = sensors
      strategy.push(prop);
      other['strategy'] = strategy;
      device.push(other);
     
      this.sendData(device);
}
/**
 * 聚合数据提交给后台 将获取数据的函数拆分为5个函数分别负责获取自己的数据然后生成json格式给聚合函数
 * comdingData() 只负责聚合设备控制的数据
 */
AddStrategy.prototype.comdingData = function () {
    let prop = {};
    let device = [];
    let submitdata = {};
    let strategy = [];
    let item = {};
    prop['devicename'] = this.getDeviceData().devidename;
    prop['deviceid'] = this.getDeviceData().deviceid;
    item['strategyid'] = getRandom(1000, 9999);
    item['createTime'] = getDate();
    item['isOpen'] = true;
    item['type'] = this.getTypeData().type;
    item['conns'] = this.getSensorsData().conns;
    item['times'] = this.getTimesData().times;
    item['sensors'] = this.getSensorsData().sensors;
    item['control'] = this.getActuatsData().actuats;
    strategy.push(item);
    prop['strategy'] = strategy;
    device.push(prop);
   
    this.sendData(device);
}
/**
 * 获取用户选择的设备名
 */
AddStrategy.prototype.getDeviceData = function () {
    let val = this.returnSelectData(document.getElementsByClassName('device-name')[0]);
    let state = false;
    let obj = {}
    if (!this.isAll(val)) {
        return;
    }
    forEach(this.OriginData, (origin) => {
        if (origin.deviceid == parseInt(val)) {
            state = true;
            obj.state = state;
            obj.deviceid = val;
            obj.devidename = origin.devicename;
        }
    });
    return obj;
}
/**
 * 获取策略类型
 */
AddStrategy.prototype.getTypeData = function () {
    let val = this.returnSelectData(document.getElementsByClassName('strategy-type')[0]);
    if (!this.isAll(val)) {
        return;
    }
    return {
        type: val
    }
}
/**
 * 获取提交的传感器数据
 */
AddStrategy.prototype.getSensorsData = function () {
    let s = [];
    let conns = [];
    let sensors = document.getElementsByClassName('sensors');
    let oper = document.getElementsByClassName('operation');
    let inputVal = document.getElementsByClassName('valNumber');
    let conds = document.getElementsByClassName('cond');
    let odds = ``;
    let that = this;

    for (let x = 0; x < sensors.length; x++) {
        let val = this.returnSelectData(sensors[x]);
        let operval = that.returnSelectData(oper[x]);
        let inputval = inputVal[x].value;
        if (this.isAll(val) && this.isAll(operval)) {
            forEach(this.OriginData, (origin) => {
                forEach(origin.sensorModel, (model) => {
                    if (val == model.sensorident) {
                        let prop = {};
                        prop['sensorname'] = model.sensorname;
                        prop['sensorident'] = model.sensorident;

                        prop['odds'] = `a ${operval} ${inputval}`;
                        odds = `a ${operval} ${inputval}`;
                        let c = that.returnSelectData(conds[x]);
                        if (c != 'con') {
                            conns.push(c);
                        }
                        s.push(prop);
                    }
                })
            });
        }
    }
    return {
        sensors: s,
        conns: conns,
        odds:odds
    }

}
/**
 * 获取执行器数据
 */
AddStrategy.prototype.getActuatsData = function () {
    let strategyAction = document.getElementsByClassName('strategy-action');
    let action = document.getElementsByClassName('action');
    let actuats = [];
    for (let x = 0; x < strategyAction.length; x++) {
        let strategyActionVal = this.returnSelectData(strategyAction[x]);
        let actionVal = this.returnSelectData(action[x]);
        if (this.isAll(strategyActionVal) && this.isAll(actionVal)) {
            forEach(this.OriginData, (origin) => {
                forEach(origin.actuats, (actuat) => {
                    if (actuat.actuatid == parseInt(strategyActionVal)) {
                        let prop = {};
                        prop['actuatid'] = actuat.actuatid;
                        prop['actuatident'] = actuat.actuatident;
                        prop['actuatname'] = actuat.actuatname;
                        prop['cz'] = actionVal;
                        if (actionVal == 'open') {
                            prop['cmd'] = actuat.cmdopen;
                        } else {
                            prop['cmd'] = actuat.cmdclose;
                        }
                        actuats.push(prop);
                    }
                })
            });
        }
    }
    return {
        actuats: actuats
    }
}
/**
 * 获取时间
 */
AddStrategy.prototype.getTimesData = function () {
    let timesElem = document.getElementsByClassName('strategy-time');
    let inputDateElem = document.getElementsByClassName('date');
    let inputTimeElem = document.getElementsByClassName('time');
    let times = [];
    for (let x = 0; x < timesElem.length; x++) {
        let isEveryVal = this.returnSelectData(timesElem[x]);
        let dateVal = inputDateElem[x].value;
        let timeVal = inputTimeElem[x].value;
        if (this.isAll(isEveryVal) && dateVal != "" && timeVal != "") {
            let prop = {};
            if(isEveryVal=='isEveryOnce'){
                prop['isEveryOnce'] = true;
            }else{
                prop['isEveryOnce'] = false;
            }
           
            prop['time'] = `${dateVal} ${timeVal}`;
            times.push(prop);
        }
    }
    return {
        times: times
    }

}
/**
 * 用于同一设置元素的开启和关闭
 */
AddStrategy.prototype.isEnable = function (origin, target, elem) {
    for (let x = 0; x < elem.length; x++) {
        elem[x].removeAttribute(origin);
        elem[x].setAttribute(target, target);
    }
}
/**
 * 统一函数
 */
AddStrategy.prototype.addElemModel = function (add, del) {
    add.addEventListener('click', (e) => {
        let divelem = e.target.previousElementSibling;
        let oneSeletElem = divelem.children[0].innerHTML;
        let one = document.createElement('div');
        one.className = `cases`;
        one.innerHTML = oneSeletElem;
        divelem.appendChild(one);
        for (let x = 0; x < del.length; x++) {
            del[x].addEventListener('click', (e) => {
                let parent = e.target.parentElement;
                parent.parentElement.removeChild(parent);
            })
        };
    });
}
/**
 * 想染页面
 */
AddStrategy.prototype.renderDeviceName = function () {
    this.DOMElem.deviceNameElem.innerHTML = ``;
    let elem = `<option value="all">==选择设备==</option>`;
    forEach(this.OriginData, (origin) => {
        elem += `<option value="${origin.deviceid}">${origin.devicename}</option>`
    });
    this.DOMElem.deviceNameElem.innerHTML = elem;
    this.isEnable("disabled", "disabled", this.DOMElem.modelElem);
    this.DOMElem.deviceNameElem.addEventListener('change', (e) => {
        this.renderSensors();
        let val = this.returnSelectData(this.DOMElem.deviceNameElem);
        if (!this.isAll(val)) {
            this.isEnable("disabled", "disabled", this.DOMElem.modelElem);
        } else {
            this.isEnable("disabled", "enable", this.DOMElem.modelElem);
        }
    })
}
/**
 * 渲染传感器
 */
AddStrategy.prototype.renderSensors = function () {
    let val = this.returnSelectData(this.DOMElem.deviceNameElem);
    this.DOMElem.sensorsElem.innerHTML = ``;
    this.DOMElem.actuatElem.innerHTML = ``;
    if (!this.isAll(val)) {
        this.DOMElem.sensorsElem.innerHTML = `<option value="all">==选择传感器==</option>`;
        this.DOMElem.actuatElem.innerHTML = `<option value="all">==选择执行器==</option>`;
        return;
    }
    let elem = `<option value="all">==选择传感器==</option>`;
    let actuatelem = `<option value="all">==选择执行器==</option>`;
    forEach(this.OriginData, (origin) => {
        if (parseInt(origin.deviceid) === parseInt(val)) {
            forEach(origin.sensorModel, (model) => {

                elem += `<option value="${model.sensorident}">${model.sensorname}</option>`;
            });
            forEach(origin.actuats, (actuat) => {
                actuatelem += `<option value="${actuat.actuatid}">${actuat.actuatname}</option>`
            })
        }
    });
    this.DOMElem.sensorsElem.innerHTML = elem;
    this.DOMElem.actuatElem.innerHTML = actuatelem;
}
/**
 * 渲染执行器
 */
AddStrategy.prototype.renderActuat = function () {

}
/**
 * 获取下拉菜单的数据
 */
AddStrategy.prototype.returnSelectData = function (elem) {
    let index = elem.selectedIndex;
    let val = elem.options[index].value;
    return val;
}
/**
 * 判断是否是All
 */
AddStrategy.prototype.isAll = function (val) {
    if (val === 'all') {
        return false;
    } else {
        return true;
    }
}
let addStrategy = new AddStrategy();