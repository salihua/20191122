function UserInfo(){
    this.userinfo = {
        userid:9803,
        username:"admin",
        userphone:123456,
        useremail:"123456@qq.com"
    };
    this.DOMElem = {
        modifyPwd:document.getElementsByClassName('modify-pwd'),
        btnSureElem:document.getElementsByClassName('btn shure')[0],
        btnReboot:document.getElementsByClassName('btn reboot')[0],
        successElem:document.getElementsByClassName('success')[0],
        submitData:document.getElementsByClassName('submit-data')[0]
    }
    this.bindEvent();

}
UserInfo.prototype.bindEvent = function(){
    let that = this;
     this.DOMElem.btnSureElem.addEventListener('click',(e)=>{
         let pwd1 = this.DOMElem.modifyPwd[1];
         let pwd2 = this.DOMElem.modifyPwd[2];
         let flag = false;
         for (let x = 0; x < this.DOMElem.modifyPwd.length; x++) {
            this.DOMElem.modifyPwd[x].addEventListener('focus',(e)=>{
                e.target.style.borderColor = '#dedede'
            })
            if(this.DOMElem.modifyPwd[x].value==''){
                flag = true;
                this.DOMElem.modifyPwd[x].style.borderColor='#ff5000';
            }
         }
         if(pwd1.value != pwd2.value){
            flag = true;
            pwd1.style.borderColor ='#ff5000';
            pwd2.style.borderColor = '#ff5000'; 
         }
         if(!flag){
            ajax({
                url:`modifypwd/${pwd1.value}`,
                callbackSuccess:(resText)=>{
                    if(!resText){
                        return;
                    }
                    let data = JSON.parse(resText);
                    if(data.status==1){
                        that.DOMElem.successElem.style.display = 'block';
                        that.DOMElem.submitData.style.display = 'none'
                        setTimeout(()=>{
                            that.DOMElem.successElem.style.display= 'none';
                            that.DOMElem.submitData.style.display = 'block';
                            for (let x = 0; x < this.DOMElem.modifyPwd.length; x++) {
                                this.DOMElem.modifyPwd[x].value = '';
                            }
                        },2000)
                    }
                }
            })
         }
     })
     this.DOMElem.btnReboot.addEventListener('click',(e)=>{
        for (let x = 0; x < this.DOMElem.modifyPwd.length; x++) {
            this.DOMElem.modifyPwd[x].value = '';
        }
     })
}

let user = new UserInfo();