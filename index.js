let {tcpServer} = require('./src/Server/TCPServer');
let koa = require('koa');
let bodyparser = require('koa-bodyparser');
let views = require('koa-views');
let static = require('koa-static');
let path = require('path');
let {routers} = require('./src/router/router');
let app = new koa();
let session = require('koa-session');

let sessionConfig = {
    key: 'koa:sess', // cookie key (默认koa：sess)
    maxAge: 1*24*60*60000, // cookie的过期时间,毫秒，默认为1天
    overwrite: true, // 是否覆盖    (默认default true)
    httpOnly: false, // cookie是否只有服务器端可以访问,默认为true
    signed: true, // 签名默认true
    rolling: false, // 在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false, // (boolean) 会话即将到期时,续订会话
}
app.keys=['输入自己的秘钥']
app.use(session(sessionConfig,app));

app.use(views(__dirname+'/views',{
    map:{html:'ejs'}
}));
app.use(static(path.join(__dirname,'/public')));
app.use(bodyparser());


app.use(async (ctx,next)=>{
    if(ctx.session.userinfo && ctx.url=="/"){
       ctx.status = 302;
       ctx.redirect('/home');
    }else if(!ctx.session.userinfo && ctx.method=="GET"){
        if(ctx.url !="/"){
           ctx.status = 302;
           ctx.redirect('/');
        }else{
            await next();
        }
    }else{
        await next();
    }
   
});

routers(app);
app.listen(8080);
tcpServer();