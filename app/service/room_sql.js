const Service = require('egg').Service;



class RoomSqlService extends Service {


    //判断房间是否存在
    async room_is_exist(roomid) {
        const mysql = this.app.mysql;
        let room = await mysql.select('t_rooms', { where: { id: roomid } });
        if (room.length > 0) {
            return true;
        } else {
            return false;
        }
    }
}
module.exports = RoomSqlService;