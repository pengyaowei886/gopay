'use strict';

const Controller = require('egg').Controller;
const md5 = require('md5');
class SssController extends Controller {
    //创建房间
    async create_room() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                sign: {//签名
                    type: 'string', required: true, allowEmpty: false
                },
                config: {
                    type: 'string', required: true, allowEmpty: false
                },
                gems: { //  房卡
                    type: 'int', required: true, llowEmpty: false
                },
                userId: { //  房卡
                    type: 'int', required: true, llowEmpty: false
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
        //逻辑判断
        try {
            let sign = ctx.request.body.sign;
            let userId = ctx.request.body.userId;
            let config = JSON.parse(ctx.request.body.config);
            let gems = ctx.request.body.gems;
            let room_key = app.config.info.room_key;
            let sign_md5 = md5(userId + conf + gems + room_key);
            if (sign_md5 != sign) {
                return handerThis.error('AUTH_FAILURE', "签名失败");
            }
            let data = await service.sss.create_room(gems, config);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
}

module.exports = SssController;
