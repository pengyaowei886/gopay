'use strict';

const Controller = require('../core/baseController');

const fs = require('fs');
const path = require('path');
// const awaitWriteStream = require('await-stream-ready').write;
// const sendToWormhole = require('stream-wormhole');

class UserController extends Controller {
    /**
     * 用户完成注册
     */
    async register() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                account: {
                    type: 'string', required: true, allowEmpty: false
                },
                password: {
                    type: 'string', required: true, allowEmpty: false
                },
                // headimg: {
                //     type: 'string', required: true, allowEmpty: false
                // },
                // name: {
                //     type: 'string', required: true, allowEmpty: false
                // }
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //逻辑判断
        try {
            let handerThis = this;
            const { ctx, app, service } = handerThis;
     
            let account = ctx.request.body.account;
            let password = ctx.request.body.password;
            // let headimg = ctx.request.body.headimg;
            // let name = ctx.request.body.name;
            let data = await ctx.service.user.register(account, password);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }

    /**
     * 用户登陆
     */
    async login() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                account: {//字符串 必填 不允许为空字符串 
                    type: 'string', required: true, allowEmpty: false
                },
                password: {//字符串 必填 不允许为空字符串 
                    type: 'string', required: true, allowEmpty: false
                }
            }, ctx.request.query);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //逻辑处理
        try {
            let account = ctx.request.query.account;
            let password = ctx.request.query.password;
            let host=ctx.request.host;
            let ip=host.split(':')[0];
          
            let data = await service.user.login(account,password,ip);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 修改密码
     */
    async update_pw() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                new_password: {//字符串 必填 不允许为空字符串 
                    type: 'string', required: true, allowEmpty: false
                },
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //逻辑处理
        try {
            let uid = handerThis.user().uid;
            let password = ctx.request.body.new_password;
            let data = await service.user.update_pw(uid, password);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 修改昵称
     */
    async update_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                new_name: {//字符串 必填 允许为空字符串 
                    type: 'string', required: true, allowEmpty: true
                },
                head_pic: {//字符串 必填 允许为空字符串 
                    type: 'string', required: true, allowEmpty: true
                },
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //逻辑处理
        try {
            let uid = handerThis.user().uid;
            let name = ctx.request.body.new_name;
            let head_pic = ctx.request.body.head_pic;
            if (!name && head_pic) {
                let data = await service.user.update_info(uid, null, head_pic);
                return handerThis.succ(data);
            }
            if (name && !head_pic) {
                let data = await service.user.update_info(uid, name, null);
                return handerThis.succ(data);
            }
            if (!name && !head_pic) {
                throw new Error("参数有误");
            }
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 查询用户基本资料
     */
    async query_user_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;

        //逻辑处理
        try {
            let uid = handerThis.user().uid;
            let data = await service.user.query_user_info(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 查询用户支付信息
     */
    async query_pay_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                type: {//字符串 必填 不允许为空字符串 
                    type: 'string', required: false, allowEmpty: false
                },
            }, ctx.request.query);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //逻辑处理
        try {
            let uid = handerThis.user().uid;
            let type = Number(ctx.request.query.type);
            if (type) {
                let data = await service.user.query_pay_info(uid, type);
                return handerThis.succ(data);
            } else {
                let data = await service.user.query_pay_info(uid, null);
                return handerThis.succ(data);
            }

        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 用户上传支付信息
     */
    async save_pay_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                type: {//字符串 必填 不允许为空字符串 
                    type: 'int', required: true, allowEmpty: false
                },
                info: {
                    type: 'object', required: true, allowEmpty: false
                }
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //逻辑处理
        try {
            let uid = handerThis.user().uid;
            let type = ctx.request.body.type;
            let info = ctx.request.body.info;
            let data = await service.user.save_pay_info(uid, type, info);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
      * 上传图片
      */
    async uoloadImg() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        // const stream = await ctx.getFileStream();
        // 文件名:随机数+时间戳+原文件后缀
        // path.extname(stream.filename).toLocaleLowerCase()为后缀名（.jpg,.png等）
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                imgData: {//字符串 必填 不允许为空字符串 
                    type: 'string', required: true, allowEmpty: false
                }
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        try {
            const filename = Math.random().toString(36).substr(2) + new Date().getTime() + ".png";
            const target = path.join(this.config.baseDir, 'app/public/img', filename);
            let data = {};
            // // 生成一个文件写入 文件流
            var writeStream = fs.createWriteStream(target);

            // 异步把文件流 写入
            var imgData = ctx.request.body.imgData;
            //过滤data:URL
            var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
            var dataBuffer = Buffer.from(base64Data, 'base64');
            await writeStream.write(dataBuffer, 'utf-8');
            data.url = "http://192.168.1.11:80/public/img/" + filename;
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }

    }

}
module.exports = UserController;