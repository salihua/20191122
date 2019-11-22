let querystring = require('querystring');
let {loginmodel,mac} = require('../../Server/model');
let info = require('../device/device');
let { getRandom, getDate, trim, deepClone, parsePostData,readTitle } = require('../../util/util');

module.exports = {
    index: async (ctx, next) => {
        await ctx.render('login/login.ejs', {
            title: "数据监测中心",
            usermsg:'',
            pwdmsg:''
        })
    },
    login: async (ctx, next) => {
        let loginData =ctx.request.body;
        await new Promise((resolve,reject)=>{
            loginmodel.findAll({
                where: {
                    username: loginData.username,
                    password: loginData.password,
                }
            }).then((res)=>{
                if(res.length>0){
                   resolve(res[0].dataValues);
                }else{
                    reject();
                }
            })
            
        }).then((res)=>{
            ctx.session.userinfo =res;
            ctx.status = 302
            ctx.redirect('/home');
        },async (err)=>{
            await ctx.render('login/login.ejs',{
                title:"数据监测中心",
                usermsg:"* 用户名错误",
                pwdmsg:"* 密码错误"
            })
        })
    },
    home: async (ctx, next) => {
        let deviceinfo = [];
        await new Promise((resolve,reject)=>{
            mac.findAll({
                where:{
                    username:ctx.session.userinfo.username
                }
            }).then((res) => {
                for (let x = 0; x < res.length; x++) {
                    deviceinfo.push(res[x].dataValues);
                }
                resolve(deviceinfo);
            }).catch((err) => {
                throw(err);
            });
        }).then(async (res)=>{
            await ctx.render('home/home.ejs',{
                title:await readTitle(ctx.session.userinfo.username),
                deviceinfo:res,
                username:ctx.session.userinfo.username
            })
        })
    },
    gutOutLogin:async (ctx,next)=>{
        delete ctx.session.userinfo;
        ctx.status = 302
        ctx.redirect('/');
    },
    getUserInfo:async (ctx,next)=>{
       await ctx.render('user/userinfo.ejs',{
           title:await readTitle(ctx.session.userinfo.username),
           username:ctx.session.userinfo.username,
           userinfo:ctx.session.userinfo
       })
    },
    modifyUserPwd:async (ctx,next)=>{
        
        let userpwd = ctx.params.pwd;
        let status = 1;
        await loginmodel.update({password:userpwd},{
            where:{
                username:ctx.session.userinfo.username
            }
        }).then(()=>{
            status=1;
        }).catch((err)=>{
            status = 0;
            throw err;
        });
        ctx.body = {
            status:status,
            data:1
        }
    }
}