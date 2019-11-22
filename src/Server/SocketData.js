/**
 * SocketData.js
 */

 let {forEach} = require('../util/util');

 let socketData ={
     sockets:[],
     /**
      * 当设备下线时删除下线的设备
      * @param {string} mac 
      */
     removeSocket:function(mac){
         for(let x=0;x<this.sockets.length;x++){
            if(this.sockets[x].options.mac==mac){
                console.log("设备以及删除");
               this.sockets.splice(x,1);
            }
         }
     },
     /**
      * 根据设备id查询设备是否在线 如果在线返回true 否则false
      * @param {int} deviceid 
      */
     getSocket:function(deviceid){
         let option ={
             state:false,
             socket:null
         };
        forEach(this.sockets,(socket)=>{
            if(socket.options.deviceid==deviceid){
                option.state = true;
                option.socket = socket.options.socket;
                option.ip = socket.options.ip;
            }
        });
         return option;
     }  
 }
 module.exports = {
     socketData,

 }