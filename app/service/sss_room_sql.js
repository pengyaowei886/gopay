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
    async create_room(roomId, conf, create_time) {
        const mysql = this.app.mysql;
        let uuid = new Date().getTime() + roomId;
        let baseInfo = JSON.stringify(conf);
        let room = await mysql.insert('t_sss_rooms', {
            uuid: uuid, id: roomId, base_info: baseInfo,  create_time: create_time
        });
        if (room.affacted == 1) {
            return true;
        } else {
            return false;
        }
    }
    //更新房间座位信息
    async update_seat_info(roomId, seatIndex, userId, icon, name) {
        const mysql = this.app.mysql;
        //防止sql注入
        let sql = `UPDATE t_sss_rooms SET user_id${seatIndex} = ${mysql.escape(userId)},user_icon${seatIndex} = ${mysql.escape(icon)},user_name${seatIndex} = ${mysql.escape(name)} WHERE id = ${mysql.escape(roomId)}`;
        let res = await mysql.query(sql);
        console.log(res);
        if (res.affacted == 1) {
            return true;
        } else {
            return false;
        }
    }
    //删除房间
    async delete_room(roomId) {
        const mysql = this.app.mysql;
        let res = await mysql.delete('t_sss_rooms', { id: roomId });
        if (res.affacted == 1) {
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
            rows[0].user_name0 = new Buffer(rows[0].user_name0, 'base64').toString();
            rows[0].user_name1 = new Buffer(rows[0].user_name1, 'base64').toString();
            rows[0].user_name2 = new Buffer(rows[0].user_name2, 'base64').toString();
            rows[0].user_name3 = new Buffer(rows[0].user_name3, 'base64').toString();
            rows[0].user_name4 = new Buffer(rows[0].user_name4, 'base64').toString();
            rows[0].user_name5 = new Buffer(rows[0].user_name5, 'base64').toString();
            return res[0];
        } else {
            throw new Error("查询房间信息失败");
        }
    }
    //获取房间uuid
    async get_room_uuid(roomId) {
        const mysql = this.app.mysql;
        let res = await mysql.select('t_sss_rooms', { where: { id: roomId }, columns: ['uuid'] });
        if (res.length > 0) {
            return res[0].uuid;
        } else {
            throw new Error("查询房间uuid失败");
        }
    }
}
module.exports = SssRoomSqlService;