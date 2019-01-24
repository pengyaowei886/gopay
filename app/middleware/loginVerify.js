
let Verify = function (options) {
    return async function loginVerify(ctx, next) {
        //测试人物信息
        ctx.session['user'] = { uid: 3, open_id: 'slkdkfskddkf', user_name: 'yixiaosheng' };
        await next();
        //上线时要测一下 token用户是否存在，token放请求头里面（前端做）
    }
}
module.exports = Verify
