/**
 * ControlDevice.js
 */

 function control(options){
     if(!options.socket || options.cmd==undefined){
        console.log("命令或者socket为空");
        return;
     }
     options.socket.write(options.cmd);
 }

 module.exports = {
     control
 }