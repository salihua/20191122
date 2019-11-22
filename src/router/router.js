let router = require('koa-router')();
let bodyparser = require('koa-bodyparser');
let querystring = require('querystring');
let user = require('../lib/user/user');
let device = require('../lib/device/device');
let strategy = require('../lib/strategy/strategy');

/**
 * Setting router 
 * @param {*} app 
 */
function routers(app) {
    app.use(bodyparser());
    app.use(router.routes());
    app.use(router.allowedMethods());

    router.get('/',user.index);

    router.post('/check',user.login);

    router.get('/home',user.home);

    router.get('/getUserInfo',user.getUserInfo)

    router.get('/getOutLogin',user.gutOutLogin);

    router.get('/modifypwd/:pwd',user.modifyUserPwd)

    router.post('/home/adddevice',device.addDevice);

    router.get('/home/delete/:deviceid',device.deleteDecide);

    router.get('/home/update/:mac');

    router.get('/home/device/:deviceid',device.getDeviceInfo);

    router.get('/home/device/isOnLine/:deviceid',device.isOnLine);

    router.post('/home/device/addSensor',device.addSensorData);

    router.post('/home/device/addActuat',device.addActuatData);

    router.get('/home/device/controlDevice/:deviceid/:cmd',device.controlDevice);

    router.get('/home/device/deleteAll/:deviceid',device.deleteAllSensorActuat);

    router.get('/home/device/createModel/:deviceid',device.createModel);

    router.get('/home/device/datainfo/:deviceid',device.getSensorDataInfo);

    router.get('/home/device/toPage/:deviceid',device.toDSensorDataPage);

    router.get('/home/device/deleteAllData/:deviceid',device.deleteAllData);

    /**
     * 策略部分
     */
    router.get('/strategy/toStrategyPage',strategy.toStrategyPage);
    router.get('/strategy/toAddStrategyPage',strategy.toAddStrategyPage)
    router.get('/strategy/deletedata',strategy.deleteStrategy);
    router.get('/strategy/getData',strategy.getStrategyData);
    router.post('/strategy/addStrategy',strategy.addStrategyData);
    router.get('/stratrgy/getStrategyModel',strategy.getStrategyModel)

}
module.exports ={
    routers,
}
