/**
 * model.js 
 */

let sequelizes = require('sequelize');
let {sequelize} = require('./db');

let mac= sequelize.define('mac', {
    id:{
       type:sequelizes.INET,
       'primaryKey': true
    },
    username: sequelizes.STRING,
    mac:sequelizes.STRING,
    createtime:sequelizes.STRING,
    deviceid:sequelizes.INET,
    devicename:sequelizes.STRING,
    describe:sequelizes.STRING
}, {
    timestamps: false,
    charset: 'utf8',
});

let devicedata = sequelize.define('devicedata',{
    id:{
        type:sequelizes.INET,
        'primaryKey': true
     },
     mac:sequelizes.STRING,
     time:sequelizes.STRING,
     temp:sequelizes.STRING,
     humi:sequelizes.STRING,
     fire:sequelizes.INET,
     somke:sequelizes.INET,
     position:sequelizes.STRING
},{
    timestamps: false,
    charset: 'utf8',
})

let loginmodel = sequelize.define('user',{
    id:{
        type:sequelizes.INET,
        'primaryKey': true
     },
     username:sequelizes.STRING,
     password:sequelizes.STRING,
     phone:sequelizes.STRING,
     mail:sequelizes.STRING,
     userid:sequelizes.STRING
},{
    timestamps: false,
    charset: 'utf8',
})
let sensorinfo =sequelize.define('sensorinfo',{
    id:{
        type:sequelizes.INET,
        'primaryKey': true
     },
     username:sequelizes.STRING,
     deviceid:sequelizes.STRING,
     sensorname:sequelizes.STRING,
     sensorident:sequelizes.STRING,
     sensordatatype:sequelizes.STRING,
     sensorid:sequelizes.STRING,
     devicename:sequelizes.STRING,
     sensorcreatetime:sequelizes.STRING,
    
},{
    timestamps: false,
    charset: 'utf8',
})

let actuatinfo = sequelize.define('actuatinfo',{
    id:{
        type:sequelizes.INET,
        'primaryKey': true
     },
     username:sequelizes.STRING,
     deviceid:sequelizes.STRING,
     actuatname:sequelizes.STRING,
     actuatident:sequelizes.STRING,
     actuatdatatype:sequelizes.STRING,
     actuatid:sequelizes.STRING,
     actuatopen:sequelizes.STRING,
     actuatclose:sequelizes.STRING,
     actuatcreatetime:sequelizes.STRING,
},{
    timestamps: false,
    charset: 'utf8',
})

module.exports= {
    mac,
    devicedata,
    loginmodel,
    sensorinfo,
    actuatinfo
}