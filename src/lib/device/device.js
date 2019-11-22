let { mac, sensorinfo, actuatinfo } = require('../../Server/model');
let querystring = require('querystring');
let { getRandom,forEach, getDate, trim, deepClone,readDataModel,writeDataModel,readTitle} = require('../../util/util');
let { socketData } = require('../../Server/SocketData');
let { control } = require('../../Server/ControlDevice');

module.exports = {
    addDevice: async (ctx, next) => {
        let device = ctx.request.body;
        device.username = ctx.session.userinfo.username;
        device.createtime = getDate();
        device.deviceid = getRandom(1000, 9999);

        await new Promise((resolve, reject) => {
            mac.create(device).then((res) => {
                resolve(res);
            }).catch((err) => {
                throw (err);
            });
        }).then((res) => {
            ctx.status = 302;
            ctx.redirect('/home');
        });
    },
    deleteDecide: async (ctx, next) => {
        let deletedevice = ctx.params;
        let data = JSON.parse(await readDataModel());
        forEach(data,(origin)=>{
            if(origin.username == ctx.session.userinfo.username){
              for(let x=0;x<origin.device.length;x++){
                  if(origin.device[x].deivceid==deletedevice.deivceid){
                    origin.device.splice(x,1);
                  }
              }
            }
        });
        await writeDataModel(data);
        await new Promise((resolve, reject) => {
            mac.destroy({
                where: {
                    deviceid: trim(deletedevice.deviceid)
                }
            }).then(() => {
                resolve();
            }, (err) => {
                throw (err)
            })
        }).then(() => {
            ctx.response.type = "json"
            ctx.response.body = {
                status: 1,
                data: 'success'
            }
        })

    },
    getDeviceInfo: async (ctx, next) => {
        /**
         * 首先检查socket.data中是否有该设备如果有该设备直接返回数据
         */
        let deviceid = trim(ctx.params.deviceid);
        let options = {};
        await forEach(socketData.sockets, (res) => {
            if (res.options.deviceid == deviceid && res.options.username == ctx.session.userinfo.username) {
                for (var prop in res.options) {
                    if (prop != 'socket') {
                        options[prop] = res.options[prop]
                    }
                }
                options.isOnline = true;
            }
        });
        if (!options.deviceid) {

            await mac.findAll({
                where: {
                    deviceid: deviceid,
                    username: ctx.session.userinfo.username
                }
            }).then((res) => {
                if (res.length > 0) {
                    options = res[0].dataValues
                    options.isOnline = false;
                    options.ip = "0.0.0.0"
                }
            }).catch((err) => {
                throw (err)
            })
        }
        await sensorinfo.findAll({
            where: {
                deviceid: deviceid,
                username: ctx.session.userinfo.username
            }
        }).then((res) => {
            options.sensorinfo = []
            if (res.length > 0) {
                forEach(res, (data) => {
                    options.sensorinfo.push(data.dataValues);
                })
            }
        }).catch((err) => {
            throw (err)
        })

        await actuatinfo.findAll({
            where: {
                deviceid: deviceid,
                username: ctx.session.userinfo.username
            }
        }).then((res) => {
            options.actuatinfo = []
            if (res.length > 0) {
                forEach(res, (data) => {
                    options.actuatinfo.push(data.dataValues);
                })
            }
        }).catch((err) => {
            throw (err)
        })
        await ctx.render('device/device.ejs', {
            options: options,
            title:await readTitle(ctx.session.userinfo.username),
            username: ctx.session.userinfo.username
        });
    },
    isOnLine: async (ctx, next) => {
        let deviceid = ctx.params.deviceid;
        if (!deviceid) {
            return;
        }
        ctx.body = {
            ip: socketData.getSocket(deviceid).ip,
            isOnline: socketData.getSocket(deviceid).state,
        }
    },
    addSensorData: async (ctx, next) => {
        let submitData = ctx.request.body;
        submitData.sensordatatype = submitData['data-type'];
        delete submitData['data-type'];
        submitData.sensorcreatetime = getDate();
        submitData.sensorid = getRandom(1000, 9999)

        await sensorinfo.create(submitData).then((res) => { ctx.status = 302; ctx.redirect(`/home/device/${submitData.deviceid}`) }).catch(() => { throw (err) })
    },
    addActuatData: async (ctx, next) => {
        let submitData = ctx.request.body;
        submitData.actuatdatatype = submitData['data-type'];
        delete submitData['data-type'];
        submitData.actuatcreatetime = getDate();
        submitData.actuatid = getRandom(1000, 9999);

        await actuatinfo.create(submitData).then((res) => { ctx.status = 302; ctx.redirect(`/home/device/${submitData.deviceid}`) }).catch(() => { throw (err) })
    },
    controlDevice: async (ctx, next) => {
        let submitinfo = ctx.params;
        let option = socketData.getSocket(submitinfo.deviceid);
        let returnClient = {
            status: 1,  //0 是代表控制失败
            data: '设备控制成功'
        }
        if (!option.state) {
            returnClient.status = 0;
            returnClient.data = '设备未上线请检查设备';
        }
        await control({
            socket: option.socket,
            cmd: submitinfo.cmd,
        });
        ctx.body = {
            status: 200,
            data: returnClient
        }
    },
    deleteAllSensorActuat: async (ctx, next) => {
        let deviceid = ctx.params.deviceid;
        let sensorres = await sensorinfo.destroy({ where: { deviceid: deviceid } });
        let actuatres = await actuatinfo.destroy({ where: { deviceid: deviceid } });
        let option = {
            state: false
        };
        if (sensorres > 0 || actuatres > 0) {
            option.state = true;
        } else {
            option.state = false;
        }
        ctx.body = {
            data: option
        }
    },
    createModel: async (ctx, next) => {
        let deviceid = ctx.params.deviceid || ctx.session.userinfo.username;
        await sensorinfo.findAll({
            where: {
                deviceid: deviceid
            }
        }).then(async (res) => {
            if (res.length <= 0) {
                ctx.body = {
                    status: 1,
                    data: '没有传感器请添加传感器后在生成数据模型'
                }
                return;
            }
            let data = await readDataModel();
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            let userflag = false;
            let deviceflag = false;
            forEach(data, (result) => {
                if (result.username === ctx.session.userinfo.username) {
                    userflag = true;
                    forEach(result.device, (device) => {
                        if (device.deviceid === deviceid) {
                            deviceflag = true;
                            delete sensorModel;
                            device['sensorModel'] = [];
                            forEach(res, (result) => {
                                let sensor = {};
                                let isTagData = {};
                                sensor['sensorname'] = result['sensorname'];
                                sensor['sensorident'] = result['sensorident'];
                                sensor['sensordatatype'] = result['sensordatatype'];
                                sensor['sensorid'] = result['sensorid'];
                                isTagData['state'] = false;
                                isTagData['odds'] = '';
                                sensor['isTagData'] = isTagData
                                device['sensorModel'].push(sensor);
                            });
                        }
                    });
                    if (!deviceflag) {
                        let device = {}
                        device['createtime'] = getDate();
                        device['deviceid'] = res[0].dataValues.deviceid;
                        device['devicename'] = res[0].dataValues.devicename;
                        device['sensorModel'] = [];
                        device['data'] = [];
                        forEach(res, (result) => {
                            let sensor = {};
                            let isTagData = {};
                            sensor['sensorname'] = result['sensorname'];
                            sensor['sensorident'] = result['sensorident'];
                            sensor['sensordatatype'] = result['sensordatatype'];
                            sensor['sensorid'] = result['sensorid'];
                            isTagData['state'] = false;
                            isTagData['odds'] = '';
                            sensor['isTagData'] = isTagData
                            device['sensorModel'].push(sensor);
                        });
                        result['device'].push(device);
                    }
                }
            });
            if (!userflag) {
                //统一从新设置模型
                let prop = {};
                prop['username'] = ctx.session.userinfo.username;
                prop['device'] = [];
                let device = {}
                device['createtime'] = getDate();
                device['deviceid'] = res[0].dataValues.deviceid;
                device['devicename'] = res[0].dataValues.devicename;
                device['sensorModel'] = [];
                device['data'] = [];
                forEach(res, (result) => {
                    let sensor = {};
                    let isTagData = {};
                    sensor['sensorname'] = result['sensorname'];
                    sensor['sensorident'] = result['sensorident'];
                    sensor['sensordatatype'] = result['sensordatatype'];
                    sensor['sensorid'] = result['sensorid'];
                    isTagData['state'] = false;
                    isTagData['odds'] = '';
                    sensor['isTagData'] = isTagData
                    device['sensorModel'].push(sensor);
                });
                prop['device'].push(device);
                data.push(prop);
            }
            await writeDataModel(data);
            ctx.body = {
                status: 1,
                data: "成功生成数据模型"
            }

        }).catch((err) => {
            throw err;
        })
    },
    getSensorDataInfo: async (ctx, next) => {
        let deviceid = ctx.params.deviceid || ctx.session.userinfo.username;
        let data = await readDataModel();
        let option = {};
        if (!data) {
            return;
        }
        forEach(JSON.parse(data), (result) => {
            forEach(result.device, (device) => {
                if (device['deviceid'] === deviceid) {
                    option = device;
                }
            })
        });
        ctx.body = {
            status: 1,
            data: option
        }
    },
    toDSensorDataPage: async (ctx, next) => {
        await ctx.render('device/datainfo.ejs', {
            title:await readTitle(ctx.session.userinfo.username),
            username: ctx.session.userinfo.username
        });
    },
    deleteAllData: async (ctx, next) => {
        let deivceid = ctx.params.deviceid;
        if (!deivceid) {
            return;
        }
        let flag = false;
        let data =JSON.parse(await readDataModel());
        forEach(data, (result) => {
            forEach(result.device, (device) => {
                if (device.deviceid === deivceid) {
                    flag = true;
                    device.data = [];
                }
            })
        });
        if (flag) {
            await writeDataModel(data);
            ctx.body = {
                status: 1,
                data: '清空数据成功'
            }
        } else {
            ctx.body = {
                status: 0,
                data: '清空数据失败,设备ID不存在,没有生成数据模型'
            }
        }


    }
}