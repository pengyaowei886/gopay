const Service = require('egg').Service;



class UserSqlService extends Service {
    //用户注册
    async create_user(account, name, sex, headimg) {
        const mysql = this.app.mysql;
        let user = await mysql.select('user', { where: { account: account } });
        if (user.length == 0) {
            let jiaminame = Buffer(name).toString('base64');
            let result = await mysql.insert('user', {
                name: jiaminame,
                coins: 0,
                gems: 0,//房卡
                sex: sex,//
                headimg: headimg
            });
            if (result.affected == 1) {
                return true
            }
        } else {
            throw new Error("账号已被占用");
        }
    }
    //  用户登录
    async user_login(account, password) {
        const mysql = this.app.mysql;
        let new_pass = Buffer(password).toString('base64');
        let user = await mysql.select('user', { where: { account: account, password: new_pass } });
        if (user.length > 0) {
            return true
        } else {
            throw new Error("账号或者密码错误");
        }
    }
    //用户修改信息
    async update_user_info(userid, name, sex, headimg) {
        const mysql = this.app.mysql;
        if (this.user_is_exist(userid)) {
            let jiaminame = Buffer(name).toString('base64');
            let result = await mysql.update('user', {
                userid: userid,
                name: jiaminame,
                sex: sex,
                headimg: headimg
            });
            if (result.affected == 1) {
                return true
            } else {
                throw new Error("修改失败");
            }
        } else {
            throw new Error("用户不存在");
        }
    }

    //判断用户是否存在
    async user_is_exist(userid) {
        const mysql = this.app.mysql;
        let user = await mysql.select('user', { where: { userid: userid } });
        if (user.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    //查询用户数据
    async get_user_data(userid) {
        const mysql = this.app.mysql;
        let user = await mysql.select('user', { where: { userid: userid }, colmuns: ['userid', 'account', 'name', 'headimg', 'coins', 'gems', 'roomid'] });
        if (user.length > 0) {
            //对name进行解密
            user[0].name = new Buffer(user[0].name, 'base64').toString();
            console.log(user[0]);
            return user[0];
        } else {
            throw new Error("查询用户数据失败");
        }
    }

    //设置用户所在房间号
    async set_room_id_of_user(userid, roomid) {
        const mysql = this.app.mysql;
        let res = await mysql.update('t_user', { userid: userid, roomid: roomid });
        if (res.affacted == 1) {
            return true;
        } else {
            throw new Error("设置用户所在房间号失败");
        }
    }


}
module.exports = UserSqlService;