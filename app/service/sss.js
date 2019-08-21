const Service = require('egg').Service;



class SssSqlService extends Service {

    //创建房间
    async create_room(params) {
        let roomid = this.service.tools.generateRoomId();
        console.log(roomid)
        params.roomid = roomid;
        if (params.fangfei_type == 1) { // 付费选择 1 房主自费 2 aa
            let res = await this.service.userSql.get_user_data_by_id(params.userid);
            if (res.gems < params.fangzhu_gems) {
                throw new Error("房卡不足")
            }
        }
        await this.service.sssRoomSql.create_room(params)
        return {};
    }
    //进入房间
    async enter_room(roomid, userid) {

        let is_in_room = await this.service.sssRoomSql.is_user_in_room(userid, roomid);
        if (is_in_room) {
            return {};
        }

        let room_info = await this.service.sssRoomSql.get_room_data(roomid);
        let user_info = await this.service.userSql.get_user_data_by_id(userid);
        let seat_info = await this.service.sssRoomSql.get_seat_data(roomid);

        //房费aa的时候，加入房间需要检测是否有钻石
        if (room_info.fangfei_type == 2) {
            //aa
            if (user_info.gews < room_info.need_gews) {
                //安排坐下
                throw new Error("房卡不足")
            }
        }
        if (seat_info.length > 0) { //有人
            let seats = []
            for (let i = 0; i < seat_info.length; i++) {
                seats.push(seat_info[i].seat_index);
            }
            for (let i = 1; i <= room_info.peo_num; i++) {
                if (seats.indexOf(i) < 0) {
                    //安排坐下
                    await this.service.sssRoomSql.set_user_seat(user_info.userid, roomid, i, 1);
                    break;
                }
                if (i == room_info.peo_num) {
                    if (seats.indexOf(i) < 0) {
                        throw new Error("房间已满")
                    } else {
                        //最后一个位置 安排坐下
                        await this.service.sssRoomSql.set_user_seat(user_info.userid, roomid, i, 1);
                        return {};
                    }
                }
            }
        } else { //空房间
            await this.service.sssRoomSql.set_user_seat(user_info.userid, roomid, 1, 1);
            return {}
        }
    }
}
module.exports = SssSqlService;