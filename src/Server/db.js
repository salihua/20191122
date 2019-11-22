let Sequelize = require('sequelize');
let {config} = require('../config/Config');

let sequelize = new Sequelize(config.databases, config.username,config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = {
    sequelize
}