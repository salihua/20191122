let { mac, sensorinfo, actuatinfo } = require('../../Server/model');
let querystring = require('querystring');
let { getRandom, getDate, trim, deepClone, parsePostData,readTitle,forEach } = require('../../util/util');
let { socketData } = require('../../Server/SocketData');

let { control } = require('../../Server/ControlDevice');
let fs = require('fs');
let path = require('path');
let url = require('url');

module.exports = {
    toStrategyPage: async (ctx, next) => {
        await ctx.render('strategy/strategy.ejs', {
            title:await readTitle(ctx.session.userinfo.username),
            username: ctx.session.userinfo.username
        });
    },
    toAddStrategyPage: async (ctx, next) => {
        await ctx.render('strategy/strategyadd.ejs', {
            title:await readTitle(ctx.session.userinfo.username),
            username: ctx.session.userinfo.username
        });
    },
    getStrategyData: async (ctx, next) => {
        let data = await fs.readFileSync(path.join(__dirname, '../../../data/strategy.json'), { encoding: 'utf-8' });

        let arr = {};
        forEach(JSON.parse(data), (result) => {
            if (result.username === ctx.session.userinfo.username) {
                arr = result
            }
        });
        ctx.body = {
            status: 1,
            data: arr
        }

    },
    deleteStrategy: async (ctx, next) => {
        let strategy = (ctx.req._parsedUrl.query).split('=')[1].toString();
        if (strategy.indexOf(',')) {
            arr = strategy.split(',');
        } else {
            arr.push(strategy);
        }
        let data = JSON.parse(await fs.readFileSync(path.join(__dirname, '../../../data/strategy.json'), { encoding: 'utf-8' }));
        forEach(data, (result) => {
            forEach(result.device, (device) => {
                for (let x = 0; x < arr.length; x++) {
                    for (let k = 0; k < device.strategy.length; k++) {
                        if (device.strategy[k].strategyid == arr[x]) {
                            device.strategy.splice(k, 1);
                        }
                    }
                };
            });
        });
        await fs.writeFileSync(path.join(__dirname, '../../../data/strategy.json'), JSON.stringify(data));

        ctx.body = {
            status: 1,
            data: 1
        }
    },
    addStrategyData: async (ctx, next) => {
        let data = ctx.request.body.data;
        //读取json文件
        let strategyJSON = JSON.parse(await fs.readFileSync(path.join(__dirname, '../../../data/strategy.json'), { encoding: 'utf-8' }));
        let modelsJSON = JSON.parse(await readDataModel());
        let userflag = false;
        let deviceflag = false;

        forEach(strategyJSON, (origin) => {
            forEach(origin.device, (device) => {
                if (device.deviceid == data[0].deviceid) {
                    deviceflag = true;
                }
            })

        })
        if (!deviceflag) {
            let prop = {};
            prop['devicename'] = data[0].devicename;
            prop['deviceid'] = data[0].deviceid;
            prop['strategy'] = [];
            forEach(strategyJSON, (origin) => {
                if (origin.username == ctx.session.userinfo.username) {
                    origin.device.push(prop);
                }
            })
        }
        forEach(strategyJSON, (origin) => {
            //先将数据添加到策略文件中
            if (origin.username == ctx.session.userinfo.username) {
                userflag = true;
                forEach(origin.device, (device) => {
                    if (device.deviceid == data[0].deviceid) {
                        forEach(data[0].strategy, (strategy) => {
                            device.strategy.push(strategy);
                            //同时将标记数据的内容写入data中
                            if (strategy.type == 'tag') {
                                forEach(modelsJSON, (model) => {
                                    if (model.username == ctx.session.userinfo.username) {
                                        forEach(model.device, (devicemodel) => {
                                            if (data[0].deviceid == devicemodel.deviceid) {
                                                forEach(strategy.sensors, (sensors) => {
                                                    forEach(devicemodel.sensorModel, (sensormodel) => {
                                                        if (sensormodel.sensorident == sensors.sensorident) {
                                                            sensormodel.isTagData = sensors.isTagData
                                                        }
                                                    })

                                                })


                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        });
        await fs.writeFileSync(path.join(__dirname, '../../../data/strategy.json'), JSON.stringify(strategyJSON));
        await writeDataModel(modelsJSON);
        if (!userflag) {
            let prop = {};
            prop['username'] = ctx.session.userinfo.username;
            prop['device'] = data;
            strategyJSON.push(prop);
            forEach(data[0].strategy, (strategy) => {
                if (strategy.type == 'tag') {
                    forEach(modelsJSON, (model) => {
                        if (model.username == ctx.session.userinfo.username) {
                            forEach(model.device, (devicemodel) => {
                                if (data[0].deviceid == devicemodel.deviceid) {
                                    forEach(devicemodel.sensorModel, (sensormodel) => {
                                        forEach(strategy.sensors, (sensors) => {
                                            if (sensormodel.sensorident == sensors.sensorident) {
                                                sensormodel.isTagData = sensors.isTagData
                                            }
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
            })
            await fs.writeFileSync(path.join(__dirname, '../../../data/strategy.json'), JSON.stringify(strategyJSON));
            await writeDataModel(modelsJSON);

        }
        ctx.body = {
            status: 1,
            data: 1
        }
    },
    getStrategyModel: async (ctx, next) => {
        let sensorModel = JSON.parse(await readDataModel());
        let devices = [];

        //提取数据库数据
        await actuatinfo.findAll({
            where: {
                username: ctx.session.userinfo.username
            }
        }).then((res) => {
            if (res.length <= 0) {
                return;
            }
            forEach(sensorModel, (model) => {
                if (model.username == ctx.session.userinfo.username) {
                    forEach(model.device, (device) => {
                        let prop = {};
                        let actuats = [];
                        prop['createtime'] = device.createtime;
                        prop['deviceid'] = device.deviceid;
                        prop['devicename'] = device.devicename;
                        prop['sensorModel'] = device.sensorModel;
                        //提取数据库中的执行器
                        forEach(res, (result) => {
                            if (result.dataValues.deviceid == device.deviceid) {
                                let item = {};
                                item['actuatident'] = result.dataValues.actuatident;
                                item['actuatid'] = result.dataValues.actuatid;
                                item['actuatname'] = result.dataValues.actuatname;
                                item['cmdopen'] = result.dataValues.actuatopen;
                                item['cmdclose'] = result.dataValues.actuatclose;
                                actuats.push(item);
                            }
                        });
                        prop['actuats'] = actuats;
                        devices.push(prop);
                    });
                }
            });
        });
        ctx.body = {
            status: 1,
            data: devices
        }
    }
}