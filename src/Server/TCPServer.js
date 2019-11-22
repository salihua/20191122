/**
 * TCPServer.js 
 */

let net = require('net');
let { mac, devicedata } = require('./model');
let querystring = require('querystring');
let { ServerModel } = require('./ServerModel');
let { socketData } = require('./SocketData');
let { getDate, forEach, deepClone } = require('../util/util');
let { exceData } = require('./exceData');
let { serverConfig } = require('../config/Config');
let fs = require('fs');
let path = require('path');
/**
 * Create TCP Server use reciver data
 */
function tcpServer() {
    let server = net.createServer((socket) => {
        let model = new CreateModel(socket);
    });
    server.on('connection', (socket) => {
        
    });
    server.on('error',(error)=>{
       console.log(error);
    })
    server.listen({
        host: serverConfig.ip,
        port: serverConfig.port,
    }, () => {
        console.log("Sever Start Success");
    })
}
/**
 * Create ServerModel Object
 * @param {*} socket 
 */
function CreateModel(socket) {
    let indexState = 0;
    socket.on('data', (chunk) => {
        let data = chunk.toString();
        if (data.indexOf(':') > 1 && `${data}`.indexOf("{") < 0 && indexState === 0) {
            this.macaddress = data.split(':').join('');
            this.queryMac(this.macaddress);
        } else if (this.flag) {
            this.handData(data, this.macaddress);
        } else {
            socket.write('close');
            socket.end();
        }
    })
    socket.on('close', () => {
        this.flag = false;
        indexState = 0;
        socketData.removeSocket(this.macaddress);
    })
    socket.on('error',(error)=>{
        socket.end();
        
    })
    
    socket.setTimeout(60000);
    socket.on('timeout', () => {
        socket.write('close');
        socket.end();
    });
    
    this.ip = socket.address().address + ":" + socket.address().port;

    this.queryMac = function (option) {

        let that = this;
        mac.findOne({ where: { mac: option } }).then((res) => {
            if (res == null) {
                this.flag = false;
                socket.write('mac fail');
                socket.write('close');
                socket.end();
                return;
            }
            indexState = 1;
            let macdata = res.dataValues;
            macdata.socket = socket;
            macdata.date = getDate();
            macdata.ip = this.ip;

            that.userconn = macdata
            socketData.sockets.push(new ServerModel(macdata));

            this.flag = true;
            socket.write('mac ok');
        }).catch((err) => {
            console.log(err);
        })
    }
    this.handData = function (option, macdata) {
        if (!option) {
            return;
        }
        option = `${option}`;
        if (this.isJSON(option)) {
            if (option.indexOf('{') >= 0) {
                option = JSON.parse(option);
                this.data = option;
                let that = this;
                fs.readFile(path.join(__dirname, '../../data/data.json'), { encoding: 'utf-8' }, (err, data) => {
                    if (err) {
                        throw err;
                    }
                    let formatData = JSON.parse(data);
                    
                    forEach(formatData, (res) => {
                        if (res.username == that.userconn.username) {
                            forEach(res.device, (res) => {
                                if (res.deviceid == that.userconn.deviceid) {
                                    let prop = {}
                                    forEach(res.sensorModel, (res) => {
                                        for (let val in option) {
                                            if (val === res['sensorident']) {
                                                prop[val] = option[val]
                                            }
                                        }
                                        prop.date = getDate();
                                    });
                                    res.data.push(prop);
                                }
                            })
                        }
                    })
                    fs.writeFile(path.join(__dirname, '../../data/data.json'), JSON.stringify(formatData), (err) => {
                        if (err) {
                            socket.write('fail');
                            throw err;
                        }
                        socket.write('ok');
                        console.log("数据写入成功");
                    })
                });
                this.checkData();
            }
        }

    }
}

/**
 *用于校验数据 配合策略使用将接口留出来
 */
CreateModel.prototype.checkData = function () {
    let that = this;
    let strategyJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/strategy.json'), { encoding: 'utf-8' }));
    
    forEach(strategyJSON, (strategy) => {
        if (this.userconn.username == strategy.username) {
            forEach(strategy.device, (device) => {
                if (parseInt(device.deviceid) == that.userconn.deviceid) {
                    forEach(device.strategy, (strategy) => {
                        if (strategy.type == 'control') {
                          
                            that.checkTime(strategy.times, strategy.sensors,strategy.control, strategy.conns)
                        }
                    })
                }
            })
        }
    });
}
/**
 * 检查表达式
 */
CreateModel.prototype.isShure = function (cond) {
    if (eval(cond)) {
        return true
    } else {
        return false;
    }
}
/**
 * 发送命令
 */
CreateModel.prototype.sendCmd = function (cmd) {
    let that = this;
    setTimeout(function () {
         that.userconn.socket.write(cmd);
    }, 200)
}
/**
 * 校验时间以及发送数据
 */
CreateModel.prototype.checkTime = function (times, sensors, control, conns) {
    /**
     * 如果是每次执行则不校验 如果不是则校验
     */
    let that = this;
    forEach(times, (time) => {
        if (time.isEveryOnce) {
            //直接执行命令 聚合数据 
           
            if(this.isShure(this.getConds(sensors, conns))){
                forEach(control,(actuat)=>{
                    this.sendCmd(actuat.cmd);
                })
            }
        } else {
            //获取时间 时间差为40s 当前时间-添加的时间>0 && 差值要小于40s
            let seconds = this.getTime(time.time);
            let newseconds = new Date().getTime();
            let cha = newseconds - seconds;
            if ((cha) < 0) {
                return;
            }
            if (cha > 0 && cha < 40000) {
               //执行
               if(this.isShure(this.getConds(sensors, conns))){
                forEach(control,(actuat)=>{
                    this.sendCmd(actuat.cmd);
                })
            }
            }
        }
    })
}
/**
 * 获取time距离的毫秒数
 */
CreateModel.prototype.getTime = function (time) {
    let date = new Date(time);
    return date.getTime();
}
/**
 * 组合条件
 */
CreateModel.prototype.getConds = function (sensors, conns) {
    let that = this;
    let len = sensors.length;
    let cond = ``;
    let index = len;
    forEach(sensors, (sensor) => {
        for (let val in that.data) {
            if (val == sensor['sensorident']) {
                cond += `${sensor.odds.replace(/a/g, this.data[val])} ${conns[len - index]} `;
                index--;
            }
        }
    });
    return cond.replace(/undefined/g, '');
}
/**
 * 用于校验数据是否是JSON数据
 */
CreateModel.prototype.isJSON = function (str) {
    try {
        let obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}
module.exports = {
    tcpServer
}
