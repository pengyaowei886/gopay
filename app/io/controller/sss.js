const Controller = require('egg').Controller;


class SssController extends Controller {


    async join() {
        const { ctx, app } = this;


        const data = ctx.args[0];

        // let room_key = app.config.info.room_key;
        let userid = data.userid;
        let roomId = data.roomid;
        let socket = ctx.socket;
        // let sign = data.sign;


       

        socket.join(roomId, () => {
            let socketroom = app.io.of("/sss").adapter.rooms[roomId];
            console.log(socketroom);
            socket.broadcast.to(roomId).emit('new_user_comes_push', "xixi"); // 通知所有 包括自己
        })
    }



    //await app.io.of("/sss").emit('new_user_comes_push', "xixi"); //通知所有 包括自己
    // await socket.to(roomId).emit('new_user_comes_push', userData); //不通知




    //用户登录
    async login() {
        const { ctx, app } = this;

        // const data = ctx.args[0];

        // // let room_key = app.config.info.room_key;
        // let userid = data.userid;
        // let roomId = data.roomid;
        // let sign = data.sign;

        let socket = this.ctx.socket;
        // console.log(roomId);
        // console.log(userid);
        // console.log(sign);
        // //检验参数合法性
        // if (token == null || roomId == null || sign == null) {
        //     console.log(1);
        //     await ctx.socket.emit('login_result', { errcode: 1, errmsg: "invalid parameters" });
        //     return;
        // }
        // //检查参数是否被篡改
        // let md5_sign = md5(roomId + userid + room_key);
        // if (md5_sign != sign) {
        //     console.log(2);
        //     socket.emit('login_result', { errcode: 2, errmsg: "login failed. invalid sign!" });
        //     return;
        // };

        let room_is_exist = await this.ctx.service.sssRoomSql.room_is_exist(roomId);
        //给socket 赋值
        if (room_is_exist) {
            socket.id = userid;
            console.log(socket.id)
            //进入房间
            await socket.join(roomId, () => {
                console.log(socket.rooms);
            })

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

            await socket.emit('login_result', ret);
            //通知当前房间其它客户端
            let socketroom = app.io.of("/sss").adapter.rooms[roomId];
            console.log(socketroom)

            // await socket.broadcast.emit('new_user_comes_push', userData);
            //  let arr= Object.keys(socketroom.sockets)
            //  for(let i in arr){
            //      if(socket.id==arr[i]){ //自己不广播
            //      }else{
            //          console.log("要广播了，速速后退")
            //            console.log(`${arr[i]}`)
            //          await socket.to(`${arr[i]}`).emit('new_user_comes_push', userData);
            //          //await app.io.to(arr[i]).emit('new_user_comes_push', userData);
            //      }
            //  }
            //await socket.broadcast.emit('new_user_comes_push', userData); // 通知所有 包括自己
            await app.io.of("/sss").emit('new_user_comes_push', userData); //通知所有 包括自己
            // await socket.to(roomId).emit('new_user_comes_push', userData); //不通知
            // await socket.disconnect();
        } else {

            let ret = {
                errcode: 2,
                errmsg: "room is not exist"
            };
            await socket.emit('login_result', ret);
        }

    }
    //回到大厅
    async 	back_to_hall() {
        let userid = this.ctx.socket.id;
        //清除座位信息
        await this.ctx.service.userSql.delete_user_seat(userid);
        //断开socket
        await this.ctx.socket.disconnect(true);
    }
    //游戏准备
    async ready() {

        // const data = this.ctx.args[0];
        let roomid = this.ctx.socket.rooms.room;
        let userid = this.ctx.socket.id;
        // 判断是否可以准备
        let room_info = await this.ctx.service.sssRoomSql.get_room_data(roomid);
        if (room_info.status == 0) { //游戏进行中 不能准备
            return
        } else {
            await this.ctx.service.sssRoomSql.update_user_status(userid, 1);
        }
    }
}


module.exports = SssController;