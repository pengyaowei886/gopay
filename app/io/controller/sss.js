const Controller = require('egg').Controller;


class SssController extends Controller {


    async login() {
        const { ctx, app } = this;
        const data = ctx.args[0];
        try {
            let userid = data.userid;
            let roomId = data.roomid;
            let socket = ctx.socket;
            //给socket赋值
            socket.userid = userid;
            socket.roomid = roomId;
            let room_is_exist = await this.ctx.service.sssRoomSql.room_is_exist(roomId);
            //给socket 赋值
            if (!room_is_exist) {
                let ret = {
                    errcode: 2,
                    errmsg: "room is not exist"
                };
                await socket.emit('login_result', ret);
            }
            let seat_info = await this.ctx.service.sssRoomSql.get_seat_data(roomId);
            let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomId);
            let userData = null;
            let seats = [];
            for (var i = 0; i < seat_info.length; i++) {
                let rs = seat_info[i]
                seats.push({
                    userid: rs.userid,
                    ip: rs.ip,
                    score: rs.score,
                    name: rs.name,
                    online: rs.online,
                    headimg: rs.headimg,
                    ready: rs.ready,
                    seatindex: rs.seat_index
                });
                if (userid == rs.userid) {
                    userData = seats[i];
                }
            }
            //通知前端
            let ret = {
                errcode: 0,
                errmsg: "ok",
                data: {
                    roomid: roomId,
                    conf: room_info,
                    seats: seats
                }
            };
            socket.join(roomId, () => {
                let socketroom = app.io.of("/sss").adapter.rooms[roomId];
                console.log(socketroom);
                //通知当前客户端
                socket.emit('login_result', ret);
                //通知当前房间其它客户端
                socket.broadcast.to(roomId).emit('new_user_comes_push', userData);
            })
        } catch (error) {
            socket.emit('error', error.message);
        }

        // let room_key = app.config.info.room_key;


    }

    //回到大厅
    async 	back_to_hall() {

        let userid = this.ctx.socket.userid;
        // 清除座位信息
        await this.ctx.service.userSql.delete_user_seat(userid);
        // 断开socket
        await this.ctx.socket.disconnect(true);
    }
    //游戏准备
    async ready() {

        // const data = this.ctx.args[0];

        let socket = this.ctx.socket;
        let userid = socket.userid;
        let roomid = socket.roomid;


        //如果aa，判断房卡是否足够
        let user_info = await this.ctx.service.userSql.get_user_data_by_id(userid, 1);
        // 判断是否可以准备
        let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomid);
        //游戏对局数没用完而且处于待准备状态

        //游戏已经开始 不能准备
        if (room_info.status == 2) {
            return
        }
        //房费不足，直接返回
        if (room_info.info.fangfei_type == 2) {
            if (user_info.gems < 2) {
                return
            }
        }
        //更新用户游戏状态
        await this.ctx.service.sssRoomSql.update_user_status(userid, 1);
        //更改房间状态
        await this.ctx.service.sssRoomSql.update_room_status(roomid, 1);
        //广播给其他客户端
        socket.broadcast.to(roomid).emit('user_ready_push', { userid: userid, ready: true });
        //判断该用户准备能否开始游戏
        let can_run = this.ctx.service.sssRoomSql.game_can_running(roomid);
        if (can_run) {
            //通知房间内所有用户游戏可以开始
            socket.to(roomid).emit('game_can_run', { userid: userid });
        }



    }
    //游戏开始
    async start() {
        let socket = this.ctx.socket;
        let roomid = socket.roomid;
        let userid = socket.userid;
        //获取本房间玩法信息
        let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomid);
        //获取座位信息
        let seat_info = await this.ctx.service.sssRoomSql.get_seat_data(roomid);


        //洗牌
        let cardtool = await this.ctx.service.sssGame.xipai(room_info);
        //发牌
        let user_card = await this.ctx.service.sssGame.fapai(cardtool, seat_info);
        let data = [];
        let self_data;
        for (let i in user_card) {
            if (user_card[i].userid != userid) {
                data.push({
                    userid: user_card[i].userid,
                    card: user_card[i].card
                })
            } else {
                self_data = user_card[i].card
            }
        }
        //将每个人的牌存入数据库
        await this.ctx.service.sssRoomSql.update_user_pai(user_card, roomid);
        //更改房间状态
        await this.ctx.service.sssRoomSql.update_room_status(roomid, 2);
        //其他人的牌
        socket.broadcast.to(roomid).emit('other_card', data);
        //自己的牌
        socket.emit('self_card', self_data);
    }

    //比牌准备
    async compare_ready() {

        let socket = this.ctx.socket;
        let userid = socket.userid;
        let roomid = socket.roomid;

        const cardtool = this.ctx.args[0];

        // 查询房间游戏状态
        let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomid);
        //游戏进行中
        if (room_info.status == 2) {
            let card_true = await this.ctx.service.sssRoomSql.user_card_true(userid, cardtool)
            //判断用户的牌是否被更改
            if (card_true) {
                //将用户牌存入数据库
                await this.ctx.service.sssRoomSql.save_user_card(userid, cardtool);
                //更新用户游戏状态
                await this.ctx.service.sssRoomSql.update_user_status(userid, 2);
                //广播给其他客户端（牌已经配好）
                socket.broadcast.to(roomid).emit('user_pai_ready_push', { userid: userid, ready: true });
                //判断该用户准备能否开始比牌
                let can_run = await this.ctx.service.sssRoomSql.game_can_compare(roomid);
                if (can_run) {
                    //通知房间内所有用户可以开牌
                    socket.to(roomid).emit('game_pai_can_compare', { userid: userid });
                }
            }
        } else {
            return
        }
    }

    // 比牌
    async compare() {
        const socket = this.ctx.socket;
        try {
            let roomid = socket.roomid;
            //查询该房间内所有用户的牌
            let user_card = await this.ctx.service.sssRoomSql.get_all_user_card(roomid);
            //比牌
            let compare = await this.ctx.service.sssGame.compare(user_card);
            //比牌结果通知到房间内所有用户
            socket.to(roomid).emit('compare_result', compare);
            //修改房间对局信息
            let res = await this.ctx.service.sssRoomSql.update_room_data(roomid);
            if (res) {
                let userid = [];
                for (let i in user_card) {
                    userid.push(user_card[i].userid)
                }
                //修改用户对局信息
                await this.ctx.service.sssRoomSql.update_user_game(userid);
            } else { //对局已经打完
                let result = await this.ctx.service.sssRoomSql.get_user_score(roomid);
                //通知所有用户游戏结束,并将对局结果广播
                socket.to(roomid).emit('game_over', result);
            }
        } catch (error) {
            socket.emit('error', error.message);
        }
    }

    // 退出房间
    async exit() {

        const socket = this.ctx.socket;
        let roomid = socket.roomid;
        let userid = socket.userid;
        // 判断是否可以退出
        let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomid);
        if (room_info.status == 2) {  //游戏进行中不能退出
            return
        }
        //是房主只能走解散房间
        if (room_info.cuid == userid) {
            return
        }
        //通知其它玩家，有人退出了房间
        socket.broadcast.to(roomid).emit('user_exit', { userid: userid });
        //通知自己
        socket.emit('exit_result');
        // 清除座位信息
        await this.ctx.service.userSql.delete_user_seat(userid);
        // 断开socket
        await this.ctx.socket.disconnect(true);
    }
    //用户断开连接
    async disconnect() {
        const socket = this.ctx.socket;
        let roomid = socket.roomid;
        let userid = socket.userid;
        //通知其它玩家，有人退出了房间
        socket.broadcast.to(roomid).emit('user_disconnect', { userid: userid });
    }


    //房主解散房间
    async   dispress() {
        const socket = this.ctx.socket;
        let roomid = socket.roomid;
        let userid = socket.userid;
        //判断游戏状态，游戏中不能直接解散，需要进行投票
        let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomid);
        if (room_info.status == 2) {  //游戏进行中不能解散
            //通知其它玩家，有人请求解散房间
            socket.broadcast.to(roomid).emit('request_room_dispress', { userid: userid });
            return
        }

        //删除房间信息
        await this.ctx.service.sssRoomSql.delete_room(roomid);
        //删除玩家座位信息

        //保存玩家对局记录并把对局记录返回给客户端

        //通知其它玩家，房主解散了房间
        socket.broadcast.to(roomid).emit('room_dispress', { userid: userid });
    }

    //同意解散
    async   agree() {
        const socket = this.ctx.socket;
        let count = this.ctx.service.sssRoomSql.get_seat_data(roomid);
        socket.agree += 1;
        //一半人及以上同意就解散
        if (socket.agree >= count.length / 2) {
            socket.agree = 0;
            socket.reject = 0;
            socket.to(roomid).emit('room_dispress_result', { result: true });
        }
        //通知其它玩家投票意见
        socket.broadcast.to(roomid).emit('user_dispress_result', { userid: userid, result: true });
    }
    //拒绝解散
    async reject() {
        let count = this.ctx.service.sssRoomSql.get_seat_data(roomid);
        socket.reject += 1;
        //一半人及以上不同意就不能解散
        if (socket.reject > count.length / 2) {
            socket.agree = 0;
            socket.reject = 0;
            socket.to(roomid).emit('room_dispress_result', { result: false });
        }
        //通知其它玩家投票意见
        socket.broadcast.to(roomid).emit('user_dispress_result', { userid: userid, result: false });
    }
}
module.exports = SssController;