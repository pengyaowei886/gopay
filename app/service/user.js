const Service = require('egg').Service;


class UserService extends Service {
    /**
     * 用户完成注册
     * @param {*手机号} phone 
     * @param {*密码} password 
     * @param {*昵称} name 
     */
    async register(phone, password, name, param, pay_password) {
        let handerThis = this;
        const { ctx, app } = handerThis;

        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例
        let data = {};
        let res_exit = await db.collection('user').findOne({ phone: phone });
        if (res_exit) {//用户存在
            throw new Error("该用户已经注册过");
        } else {//用户不存在 生成token
            //验证短信验证码是否过期，是否正确
            let duanxin = await db.collection('duanxin').findOne({
                uid: phone, param: param, ctime: {
                    $lte: new Date(), //小于当前时间
                    $gte: new Date(new Date() - 1 * 1 * 1 * 60 * 1000) //大于当前时间-1分钟
                }
            });
            if (duanxin) {
                //删除短信数据库数据
                await db.collection('duanxin').deleteOne({ uid: phone });
                //获取自增序列
                let seqs = await handerThis.ctx.service.counter.getNextSequenceValue('user', 1); //获取自增序列
                let options = {
                    _id: seqs,
                    name: name,
                    phone: phone,
                    password: password,
                    pay_password: pay_password,
                    head_pic: "",
                    balance: 0,
                    // business_num: 0, //交易总次数
                    // star_num: 0, //评价总星星数
                    zhifubao: {},
                    weixin: {},
                    bank_card: {},
                    status: 1, //账号是否被冻结
                    ctime: new Date(),
                }
                //插入用户
                await db.collection('user').insertOne(options);
                let insert = {
                    _id: seqs,
                    order_num: 0,
                    sell: [],
                    buy: []
                }
                //插入用户交易记录表
                await db.collection('user_business').insertOne(insert);
                return data;
            } else {
                throw new Error("验证码错误或者超时");
            }

        }
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
    async login(account, password, ip) {
        let handerThis = this;
        const { ctx, app } = handerThis;

        let status = await this.ctx.service.user_sql.user_login(account, password);
        if (status) {
            let data = await this.ctx.service.user_sql.get_user_info(account);
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
            if (data.roomId) {
                //判断十三水房间是否存在
                let sss_room_exist = await this.ctx.service.sss_room_sql.room_is_exist(data.roomid);
                if (sss_room_exist) {

                    await this.ctx.service.user_sql.set_room_id_of_user(data.userid, data.roomid);
                    ret.roomid = data.roomid;
                    return ret;
                }
                //判断德州扑克房间是否存在
                let dzpk_room_exist = await this.ctx.service.dzpk_room_sql.room_is_exist(data.roomid);
                if (dzpk_room_exist) {
                    await this.ctx.service.user_sql.set_room_id_of_user(data.userid, data.roomid);
                    ret.roomid = data.roomid;
                    return ret;
                }
                await this.ctx.service.user_sql.set_room_id_of_user(data.userid, null);

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