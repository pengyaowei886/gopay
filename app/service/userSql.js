const Service = require('egg').Service;



class UserSqlService extends Service {
    //用户注册
    async create_user(account, password) {
        const mysql = this.app.mysql;
        let jiamiacc = Buffer.from(account).toString('base64');
        let user = await mysql.select('t_users', { where: { account: jiamiacc } });
        if (user.length == 0) {
            // let jiaminame = Buffer.from(name).toString('base64');
            let jiamipsw = Buffer.from(password).toString('base64');
            let result = await mysql.insert('t_users', {
                account: jiamiacc,
                password: jiamipsw,
                coins: 0,
                gems: 0,//房卡
                sex: 0,//
                ctime: new Date().getTime()
            });
            if (result.affectedRows == 1) {
                return true
            }
        } else {
            throw new Error("账号已被占用");
        }
    }
    //  用户登录
    async user_login(account, password) {
        const mysql = this.app.mysql;
        let new_pass = Buffer.from(password).toString('base64');
        let new_account = Buffer.from(account).toString('base64');
        let user = await mysql.select('t_users', { where: { account: new_account, password: new_pass } });
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
            let jiaminame = Buffer.from(name).toString('base64');
            let result = await mysql.update('user', {
                userid: userid,
                name: jiaminame,
                sex: sex,
                headimg: headimg
            });
            if (result.affectedRows == 1) {
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
        let user = await mysql.select('t_users', { where: { userid: userid } });
        if (user.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    //根据id查询用户数据
    async get_user_data_by_id(userid) {
        const mysql = this.app.mysql;
        let user = await mysql.select('t_users', { where: { userid: userid }, columns: ['userid', 'account', 'name', 'headimg', 'coins', 'gems', 'roomid'] });
        if (user.length > 0) {
            //对name进行解密

            // user[0].name = Buffer.from(user[0].name, 'base64').toString()
            user[0].account = Buffer.from(user[0].account, 'base64').toString()
            return user[0];
        } else {
            throw new Error("查询用户数据失败");
        }
    }
    //根据account查询用户数据
    async get_user_data_by_account(account) {
        const mysql = this.app.mysql;
        let new_account = Buffer.from(account).toString('base64');
        let user = await mysql.select('t_users', { where: { account: new_account }, columns: ['userid', 'account', 'name', 'headimg', 'coins', 'gems', 'roomid'] });
        if (user.length > 0) {
            //对name进行解密
            // user[0].name = Buffer.from(user[0].name, 'base64').toString();
            user[0].account = Buffer.from(user[0].account, 'base64').toString()
            return user[0];
        } else {
            throw new Error("查询用户数据失败");
        }
    }

    //查询用户是否有对局
    async get_user_seat(userid) {
        const mysql = this.app.mysql;
        let res = await mysql.select('t_user_join_room', { where: { userid: userid }, colmuns: ['roomid'] });
        if (res.length > 0) {
            return res[0].roomid;
        } else {
            return false;
        }
    }
    //删除用户座位信息
    async delete_user_seat(userid) {
        const mysql = this.app.mysql;
        let res = await mysql.delete('t_user_join_room', { userid: userid });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
}
module.exports = UserSqlService;