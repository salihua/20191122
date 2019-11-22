
function main() {
    let form = Array.prototype.slice.call(document.getElementsByClassName('form-login'));
    let inputData = Array.prototype.slice.call(document.getElementsByClassName('input-data'));
    let btnAddDevice =Array.prototype.slice.call(document.getElementsByClassName("btn-add-device"));
    let addDeviceForm =Array.prototype.slice.call(document.getElementsByClassName("add-device-form"));
    let closeForm =Array.prototype.slice.call(document.getElementsByClassName("close-form"));
    let deleteSensorActuat = Array.prototype.slice.call(document.getElementsByClassName("delete-sensor-actuat"));
    let username = document.getElementsByClassName("device-username")[0];
    let deviceid = document.getElementsByClassName("device-deviceid")[0];
    let isOnlineElem = document.getElementsByClassName('iconfront icon isOnline')[0];
    let textMessageElem = document.getElementsByClassName('text message');
    let checkboxElem = document.getElementsByClassName('m_switch');
    let deviceipElem =document.getElementsByClassName('text deviceaddress')[0];
    let deviceNameElem = document.getElementsByClassName('text device-devicename')[0];
    let createModelElem = document.getElementsByClassName('btn btn-createmodel')[0];
    let loadingdataModelElem = document.getElementsByClassName('loadingdata-model')[0];
    let loadingMsgElem = document.getElementsByClassName('loading-msg')[0];
    let btnHisDataElem = document.getElementsByClassName('btn btn-hisdata')[0];
    function init() {
        checkinput();
        bindEvent();
        deviceOperation();
        pageJump();
        deviceControl();
        train();
        createModel()
    }
    /**
     * 校验提交的表单数据
     */
    function checkinput() {
        forEach(form, (form) => {
            form.addEventListener('submit', function (e) {
               let arr = [];
               for(let x=0;x<e.srcElement.length;x++){
                   if(e.srcElement[x].classList.contains('input-data')){
                        arr.push(e.srcElement[x]);
                   }
               }
                forEach(arr, function (input) {
                    if (input.value == "") {
                        input.classList.add("active");
                        e.preventDefault();
                    }
                });
                
            });
        })
        forEach(inputData, function (input) {
            (function (i) {
                i.addEventListener('focus', function (e) {
                    if (e.target.classList.contains("active")) {
                        e.target.classList.remove("active");
                    }
                })
                i.addEventListener('blur', function (e) {
                    if (e.target.value == "") {
                        e.target.classList.add("active");
                    }
                })
            }(input))
        });
    }
    /**
     * 为DOM绑定事件 绑定单机打开提交框提交数据
     */
    function bindEvent() {
        let returnHome = document.getElementsByClassName('btn btn-return-pagr home')[0];
        let deleteAll = document.getElementsByClassName('btn btn-delete all')[0];
        let inputDataTwo = null;
        forEach(btnAddDevice,(btn)=>{
            btn.addEventListener('click',function(e){
                let formTc =e.target.parentElement.parentElement.nextElementSibling;
                console.log(formTc);
                formTc.classList.add('active');
                //动态的添加两个节点数据
                dynamicAddFormData(formTc);
                inputDataTwo= Array.prototype.slice.call(document.getElementsByClassName('input-data'));
            })
        })
        forEach(closeForm,(btn)=>{
            btn.addEventListener('click',function(e){
                let baf = e.target.parentElement.parentElement.parentElement;
                if(baf.classList.contains("active")){
                   baf.classList.remove("active");
                }
                //移除添加的节点
                forEach(inputDataTwo,(id)=>{
                 
                    if(id.type=="hidden"){
                        var p = id.parentElement;
                        p.removeChild(id);
                    }
                })
                
            })
        })
        //删除传感器
        forEach(deleteSensorActuat,(bsa)=>{
            bsa.addEventListener('click',function(e){

            })
        });
        if(returnHome){
            returnHome.addEventListener('click',function(e){
                window.location.href ='/home'
            })
        }
        if(deleteAll){
           deleteAll.addEventListener('click',function(e){
               ajax({
                   url:`/home/device/deleteAll/${deviceid.innerHTML}`,
                   callbackSuccess:function(resText){
                       if(!resText){
                          return;
                       }
                       let option = JSON.parse(resText);
                       if(option.data.state){
                          window.location.href=`/home/device/${deviceid.innerHTML}`
                       }
                   }
               })
           })
        }
        if(btnHisDataElem){
           btnHisDataElem.addEventListener('click',(e)=>{
              window.location.href=`/home/device/toPage/${deviceid.innerHTML}`
           });
        }
    }
    /**
     * 对设备的操作包括删除和修改
     */
    function deviceOperation() {
        let deleteBtn = Array.prototype.slice.call(document.getElementsByClassName("btn-delete")) || [];
        let updateBtn = Array.prototype.slice.call(document.getElementsByClassName("btn-modify")) || [];
        let addDeviceForm = document.getElementsByClassName("add-device-form")[0];
        forEach(deleteBtn, (elem) => {
            elem.addEventListener('click', function (e) {
                let deviceid = getElem(e.target, 1).innerHTML;
                ajax({
                    url: `/home/delete/${deviceid}`,
                    callbackSuccess: function (resText, resXML) {
                        let res = JSON.parse(resText);
                        
                        if (res.data == "success") {
                            window.location.href = "/home"
                        }
                    }
                });
            });
        });
        forEach(updateBtn, (elem) => {
            elem.addEventListener('click', function (e) {
                let id = getElem(e.target, 1).innerHTML;
                addDeviceForm.classList.add("active");
            })
        })
    }
    /**
     * 返回数据元素在节点树
     */
    function getElem(origin, index) {
        let elem = origin.parentElement.parentElement.children[index].lastElementChild;
        return elem;
    }

    /**
     * 当点击设备名时跳转到设备信息页
     */
    function pageJump() {
        let devicename = Array.prototype.slice.call(document.getElementsByClassName("device-name headline"));
        forEach(devicename, (elem) => {
            elem.addEventListener('click', function (e) {
                let url = "";
                let deviceid = e.target.nextElementSibling.children[1].lastElementChild.innerHTML;
                if (!deviceid) {
                    return;
                }
                url = `/home/device/${trim(deviceid)}`;
                window.location.href = url;
            });
        })
    }

    /**
     * 用于在表单提交前动态的添加一些数据
     * @param {Element} elem 
     */
    function dynamicAddFormData(elem){
        if(username && deviceid){
            
            let dynamicForm = elem.children[1];
            createElem(dynamicForm,'input','type','hidden',username.innerHTML,'name','username','input-data');
            createElem(dynamicForm,'input','type','hidden',deviceid.innerHTML,'name','deviceid','input-data');
            createElem(dynamicForm,'input','type','hidden',deviceNameElem.innerHTML,'name','devicename','input-data')
        }
    }
    
    function createElem(origin,elemTye,protoLX,protoValue,text,porto1,proto2,calssname){
        let elem = document.createElement(elemTye);
        elem.setAttribute(protoLX,protoValue);
        elem.setAttribute(porto1,proto2);
        elem.setAttribute('class',calssname)
        elem.value = text;
        origin.appendChild(elem);
    }
    /**
     * 设备控制函数
     */
    function deviceControl(){
       let m_switch =arrayLinkToArray(document.getElementsByClassName('m_switch'));
       forEach(m_switch,(res)=>{
           res.addEventListener('change',function(e){
               let elem = e.target;
               let present = elem.parentElement.parentElement.children;
               let actuatcmd =trim(present[5].innerHTML).split('/');
               let open = trim(actuatcmd[0]);
               let close= trim(actuatcmd[1]);
               if(elem.checked){
                   sendCmd(`/home/device/controlDevice/${trim(deviceid.innerHTML)}/${open}`,e)
               }else{
                   sendCmd(`/home/device/controlDevice/${trim(deviceid.innerHTML)}/${close}`,e)
               }
           });
       });
    }
    function sendCmd(url,e){
        ajax({
            url:url,
            callbackSuccess:function(resText,resXML){
                modifyMsg(resText,e);
            }
        })
    }
    function arrayLinkToArray(target){
       return Array.prototype.slice.call(target)
    }
    /**
     * 用于处理设备上线或者下线时的DOM改变问题
     */
    function modifyMsg(res,e){
        let elemMsg = getElem(e.target,8);
        if(!res){
            return;
        }
        let formatData = JSON.parse(res);
        if(formatData.data.status==0){
            elemMsg.className="text message red";
            e.target.disabled = "disable";
        }else if(formatData.data.status==1){
            e.target.removeAttribute('disabled')
            elemMsg.className="text message green"; 
        }
        elemMsg.innerHTML = formatData.data.data;
    }
    function train(){
        setInterval(function(e){
            if(deviceid){
                ajax({
                    url:`/home/device/isOnLine/${deviceid.innerHTML}`,
                    callbackSuccess:function(resText,resXML){
                        if(!resText){
                           return;
                        }
                        let isOnlines = JSON.parse(resText);
                        if(isOnlines.isOnline){
                            isOnlineElem.className="iconfront icon isOnline shangx";
                            isOnlineElem.nextElementSibling.innerHTML="设备在线";
                            deviceipElem.innerHTML = isOnlines.ip;
                        }else{
                            isOnlineElem.className="iconfront icon isOnline xiax";
                            isOnlineElem.nextElementSibling.innerHTML="设备已下线";
                            deviceipElem.innerHTML='0.0.0.0'
                        }
                        for(var x=0;x<checkboxElem.length;x++){
                            if(isOnlines.isOnline){
                                textMessageElem[x].innerHTML="*设备已上线可以操作";
                                textMessageElem[x].className = 'text message green';
                                checkboxElem[x].removeAttribute('disabled');
                            }else{
                                textMessageElem[x].innerHTML="*设备未上线不能操作";
                                textMessageElem[x].className = 'text message red';
                                checkboxElem[x].setAttribute('disabled','disabled');
                            }
                        }
                    }
                })
            }
            
        },10000)
    }
    /**
     * 用于生成模型
     */
    function createModel(){
        if(!createModelElem){
            return;
        }
        createModelElem.addEventListener('click',function(e){
            
            loadingdataModelElem.className = 'loadingdata-model active';
            ajax({
                url:`/home/device/createModel/${trim(deviceid.innerHTML)}`,
                callbackSuccess:function(resText,rexXML){
                    if(!resText){
                        return;
                    }
                   
                    let res = JSON.parse(resText);
                    
                    loadingMsgElem.innerHTML=res.data;
                    setTimeout(function(){
                        loadingdataModelElem.className = 'loadingdata-model';
                    },1000)
                   
                }
            })
        })
    }
    init();
}
main();

