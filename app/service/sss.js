const Service = require('egg').Service;



class SssSqlService extends Service {

    //创建房间
    async create_room(userId, config, gems) {
        let roomid = this.service.tools.generateRoomId();
        if (config.fufeixuanze == 1) { // 付费选择 1 房主自费 2 aa
            let res = this.service.user_sql.get_user_data(userId);
            if (res.gems >= gems) {
                await this.service.sss_sql.create_room(roomid, config, gems, new Date().getTime())
                return null;
            } else {
                throw new Error("房卡不足")
            }
        }
    }

}
module.exports = SssSqlService;