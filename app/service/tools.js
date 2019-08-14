const Service = require('egg').Service;



class ToolsSqlService extends Service {


    //随机生成房间号
    generateRoomId() {
        var roomId = "2";
        for (var i = 0; i < 5; ++i) {
            roomId += Math.floor(Math.random() * 10);
        }
        //return "222222";
        return roomId;
    }

}
module.exports = ToolsSqlService;