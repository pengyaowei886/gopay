
let Verify = function (options) {
    return async function loginVerify(ctx, next) {
//登陆或者注册放过token检测
        if (ctx.request.url.indexOf('/gopay/app/user/login') >= 0 || ctx.request.url.indexOf('/gopay/app/user/register') >= 0||ctx.request.url.indexOf('/gopay/app/user/erweima')) {
            await next();
        } else {
                    //解析token 获得uid
            let db = ctx.app.mongo.get('GOPAY')['db'];//获取数据库实例
            let token = ctx.request.header.token;
            let result = await db.collection('token').findOne({ token: token });//数据库要加索引，待优化
            if (result) {
                ctx.session['user'] = { uid: result.uid };
            } else {
                function error(desc) {
                    ctx.status = 200;
                    let msg = desc;
                    ctx.body = {
                        code: 1000,
                        msg: msg,
                        data: null,
                    };
                }
                return error("认证失败")
            }
            await next();
        }

        // ctx.session['user'] = { uid: 3 };
    }
}
module.exports = Verify
