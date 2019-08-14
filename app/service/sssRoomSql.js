const Service = require('egg').Service;



class SssRoomSqlService extends Service {


    //判断房间是否存在
    async room_is_exist(roomid) {
        const mysql = this.app.mysql;
        let room = await mysql.select('t_sss_rooms', { where: { id: roomid } });
        if (room.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    //创建房间
    async create_room(params) {
        const mysql = this.app.mysql;
        let uuid = new Date().getTime() + params.roomid;
        let room = await mysql.insert('t_sss_rooms', {
            uuid: uuid, id: params.roomid, peo_num: params.peo_num, ctime: new Date().getTime(), ju_num: params.ju_num, fangfei_type: params.fangfei_type,
            moshi: params.moshi, is_mapai: params.is_mapai, type: params.type, need_gems: params.need_gems, fangzhu_gems: params.fangzhu_gems, cuid: params.userid, turn: 0
        });
        if (room.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //安排用户坐下
    async set_user_seat(userid, roomId, seatIndex, type) {
        const mysql = this.app.mysql;
        if (this.room_is_exist(roomId)) {
            let res = await mysql.insert('t_user_join_room', {
                userid: userid, roomid: roomId, seat_index: seatIndex, type: type, ctime: new Date().getTime()
            })
            if (res.affectedRows == 1) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error("房间不存在");
        }
    }
    //删除房间
    async delete_room(roomId) {
        const mysql = this.app.mysql;
        let res = await mysql.delete('t_sss_rooms', { id: roomId });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //获取房间信息
    async get_room_data(roomId) {
        const mysql = this.app.mysql;

        let rows = await mysql.select('t_sss_rooms', { where: { id: roomId } });
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("查询房间信息失败");
        }
    }
    //获取坐位配置信息
    async get_seat_data(roomId) {
        const mysql = this.app.mysql;

        let res = await mysql.select('t_user_join_room', { where: { roomid: roomId } });
        return res
    }
    //判断自己是否在房间中
    async is_user_in_room(userid, roomId) {
        const mysql = this.app.mysql;

        let res = await mysql.select('t_user_join_room', { where: { roomid: roomId, userid: userid } });
        if (res.length > 0) {
            return true
        } else {
            return false
        }
    }
}
module.exports = SssRoomSqlService;