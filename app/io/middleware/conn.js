module.exports = app => {
    return async (ctx, next) => {
        //验证签名
        ctx.socket.emit('res', 'connected!');
        await next();
        // execute when disconnect.

    };
};