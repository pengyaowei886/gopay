const Service = require('egg').Service;
const crypto = require('crypto');
class UserService extends Service {
    /**
     * 用户完成注册
     * @param {*手机号} phone 
     * @param {*密码} password 
     * @param {*昵称} name 
     */
    async register(phone, password, name, param) {
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
                //获取自增序列
                let seqs = await handerThis.ctx.service.counter.getNextSequenceValue('user', 1); //获取自增序列
                let options = {
                    _id: seqs,
                    name: name,
                    phone: phone,
                    password: password,
                    head_pic:"",
                    // business_num: 0, //交易总次数
                    // star_num: 0, //评价总星星数
                    status: 1, //账号是否被冻结
                    ctime: new Date(),
                }
                //插入用户
                await db.collection('user').insertOne(options);
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
        let url = "https://open.ucpaas.com/ol/sms/sendsms"
        let param = Math.ceil(Math.random() * 1000000000 % 9).toString() + Math.ceil(Math.random() * 1000000000 % 9) + Math.ceil(Math.random() * 1000000000 % 9) + Math.ceil(Math.random() * 1000000000 % 9);
        let requestData = {
            sid: "",
            token: "",
            appid: "",
            templateid: "", //短信模板id
            param: param, //四位短信验证码
            mobile: phone,
            uid: "",
        }
        //请求云之讯短信接口
        let return_data = await ctx.curl(url, {
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        })
        //判断code
        if (return_data.code === 0) {
            await db.collection('duanxin').insertOne({ uid: phone, param: param, ctime: new Date() });
            return null
        } else {
            throw new Error("获取验证码失败");
        }
    }
    /**
     * 用户登陆
     * @param {手机号} phone 
     */
    async login(phone, password) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库WLWord
        let data = {};
        const key = Buffer.from(app.config.GOPAY.key, 'utf8');//16位 对称公钥
        const iv = Buffer.from(app.config.GOPAY.iv, 'utf8');  //偏移量
        let res_exit = await db.collection('user').findOne({ phone: phone, password: password });
        if (res_exit) {//用户存在
            let token = await db.collection('token').findOne({ uid: res_exit._id });
            if (!token) {//如果token不存在
                let encryptedText = crypto.createCipheriv("aes-128-cbc", key, iv);
                encryptedText.update(password);
                let token = encryptedText.final("hex");
                //将token存入数据库
                await db.collection('token').insertOne({ uid: seqs, token: token });
                data.token = token;
                return data;
            } else {
                data.token = token.token;
                return data;
            }
        } else {
            throw new Error("账号和密码有误");
        }
    }
    /**
    * 用户修改密码
    * @param {手机号} phone 
    */
    async update_pw(uid, password) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库WLWord
        console.log(app.config.GOPAY);
        const key = Buffer.from(app.config.GOPAY.key, 'utf8');//16位 对称公钥
        const iv = Buffer.from(app.config.GOPAY.iv, 'utf8');  //偏移量
        let data = {};
        let res_exit = await db.collection('user').findOne({ _id: uid });
        if (res_exit) {
            //修改密码
            await db.collection('user').updateOne({ _id: uid }, { $set: { password: password } });
            let encryptedText = crypto.createCipheriv("aes-128-cbc", key, iv);
            encryptedText.update(password);
            let token = encryptedText.final("hex");
            await db.collection("token").updateOne({ uid: uid }, { $set: { token: token } });
            data.token = token;
            return data;
        } else {
            throw new Error("用户不存在");
        }
    }
}
module.exports = UserService;