const Service = require('egg').Service;


class UserService extends Service {
    /**
     * 用户完成注册
     * @param {*手机号} phone 
     * @param {*密码} password 
     * @param {*昵称} name 
     */
    async register(account, password, name, headimg) {
        let handerThis = this;
        const { ctx, app } = handerThis;


        await ctx.service.userSql.create_user(account, password, name, headimg);
        return {};
    }
    /**
     * 用户注册请求短信验证码
     * @param {手机号} phone 
     */
    async req_dx(phone) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库WLWord
        let data = {};
        // let url = "https://open.ucpaas.com/ol/sms/sendsms"
        // let param = Math.ceil(Math.random() * 1000000000 % 9).toString() + Math.ceil(Math.random() * 1000000000 % 9) + Math.ceil(Math.random() * 1000000000 % 9) + Math.ceil(Math.random() * 1000000000 % 9);
        // let requestData = {
        //     sid: "",
        //     token: "",
        //     appid: "",
        //     templateid: "", //短信模板id
        //     param: param, //四位短信验证码
        //     mobile: phone,
        //     uid: "",
        // }
        // //请求云之讯短信接口
        // let return_data = await ctx.curl(url, {
        //     method: "POST",
        //     json: true,
        //     headers: {
        //         "content-type": "application/json",
        //     },
        //     body: JSON.stringify(requestData)
        // })
        //判断code
        // if (return_data.code === 0) {
        //     await db.collection('duanxin').insertOne({ uid: phone, param: param, ctime: new Date() });
        //     return null
        // } else {
        //     throw new Error("获取验证码失败");
        // }
        await db.collection('duanxin').insertOne({ uid: phone, param: "6666", ctime: new Date() });
        return data;

    };

    /**
     * 用户登陆
     *
     */
    async login(account, password,ip) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let status = await this.ctx.service.userSql.user_login(account, password);
        if (status) {
            let data = await this.ctx.service.userSql.get_user_data_by_account(account);
            let ret = {
                account: data.account,
                userid: data.userid,
                name: data.name,
                coins: data.coins,
                gems: data.gems,
                ip: ip,
                sex: data.sex,
            };
            //判断用户是否有对局
            let user_seat_exist = await this.ctx.service.userSql.get_user_seat(data.userid);
            if (user_seat_exist) {
                let user_room_exist = await this.ctx.service.sssRoomSql.room_is_exist(user_seat_exist);
                if (user_room_exist) {
                    ret.roomid = user_seat_exist;
                    return ret
                } else {
                    let del = await this.ctx.service.userSql.delete_user_seat(data.userid);
                    if (del) {
                        return ret;
                    } else {
                        throw new Error("删除座位信息失败")
                    }
                }
            } else {
                return ret;
            }
        }
    }

    /**
    * 用户修改基本信息
    * 
    */
    async update_user_info(userid, name, headimg, sex) {

        await this.ctx.service.user_sql.update_user_info(userid, name, sex, headimg);
        return null;
    }

    /**
    * 查询用户基本信息
    * 
    */
    async query_user_info(uid) {

    }

}
module.exports = UserService;