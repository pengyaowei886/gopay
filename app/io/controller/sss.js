const Controller = require('egg').Controller;
const md5 = require('md5');

class SssController extends Controller {
    async login() {
        const { ctx, app } = this;

        const data = ctx.args[0];

        let room_key = app.config.info.room_key;
        let token = data.token;
        let roomId = data.roomid;
        let time = data.time;
        let sign = data.sign;

        console.log(roomId);
        console.log(token);
        console.log(time);
        console.log(sign);
        //检验参数合法性
        if (token == null || roomId == null || sign == null || time == null) {
            console.log(1);
            await ctx.socket.emit('login_result', { errcode: 1, errmsg: "invalid parameters" });
            return;
        }
        //检查参数是否被篡改
        let md5 = md5(roomId + token + time + room_key);
        if (md5 != sign) {
            console.log(2);
            socket.emit('login_result', { errcode: 2, errmsg: "login failed. invalid sign!" });
            return;
        }
        //检查房间合法性
        var userId = tokenMgr.getUserID(token);
        userMgr.sendMsg(userId, 'limit_login', 0);
        userMgr.disconnectSocket(userId);
        userMgr.bind(userId, socket);
        socket.userId = userId;

    }
}

module.exports = SssController;