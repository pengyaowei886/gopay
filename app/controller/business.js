const Controller = require('../core/baseController');

class BusinessController extends Controller {
    /**
     * 用户发布卖币信息
     */
    async sell_coin() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                type: {   //1微信 2支付宝 3银行卡
                    type: 'int', required: true, allowEmpty: false
                },
                num: { //币种数量
                    type: 'int', required: true, allowEmpty: false
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
            let uid = handerThis.user().uid;
            let type = ctx.request.body.type;
            let num = ctx.request.body.num;
            let data = await service.business.sell_coin(uid, type, num);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }

    }
    /**
 * 用户下架货币
 *   
 *  
 * */
    async delete_coin() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                id: {   //卖单id
                    type: 'int', required: true, allowEmpty: false
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
            let uid = handerThis.user().uid;
            let id = ctx.request.body.id;
            let data = await service.business.delete_coin(uid, id);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }

    }
    /**
     * 查看卖币列表
     */
    async query_order_list() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;

        try {
            let data = await service.business.query_order_list();
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 模糊查询卖币列表
     */
    async query_order_likeList() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                type: { //类型
                    type: 'string', required: true, allowEmpty: false
                },
                num: { //币种数量
                    type: 'string', required: true, allowEmpty: true
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
        try {
            let type = Number(ctx.request.query.type);
            let num = Number(ctx.request.query.num);
            if (!num) {
                let data = await service.business.query_order_likeList(type, null);
                return handerThis.succ(data);
            } else {
                let data = await service.business.query_order_likeList(type, num);
                return handerThis.succ(data);
            }

        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 用户完成买币
     */
    async buy_coin() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                id: {   //订单id
                    type: 'int', required: true, allowEmpty: false
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
            let uid = handerThis.user().uid;
            let id = ctx.request.body.id;
            let data = await service.business.buy_coin(uid, id);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 用户查看消息列表
     */
    async query_news_list() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        try {
            let uid = handerThis.user().uid;
            let data = await service.business.query_news_list(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 用户查看通知具体详情
     */
    async query_news_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                id: {   //通知id
                    type: 'int', required: true, allowEmpty: false
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
            let uid = handerThis.user().uid;
            let id = ctx.request.body.id;
            let data = await service.business.query_news_info(uid, id);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
    * 用户查看交易记录
    */
    async query_business() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        try {
            let uid = handerThis.user().uid;
            let type = Number(ctx.request.query.type);
            let data = await service.business.query_business(uid, type);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 查看用户未成交卖单列表
     */
    async query_dissucc_record() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        try {
            let uid = handerThis.user().uid;
            let type = Number(ctx.request.query.type);
            let data = await service.business.query_dissucc_record(uid, type);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 用户请求二维码路径
     */
    async succ_erweima() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        try {
            let uid = handerThis.user().uid;
            let data = {};
            data.url = "http://192.168.1.11:80/gopay/app/user/saoyisao?busi_uid=" + uid;
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 扫一扫转账
     */
    async sao_business() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                uid: {   //通知id
                    type: 'string', required: true, allowEmpty: false
                },
                busi_uid: {   //通知id
                    type: 'string', required: true, allowEmpty: false
                },
                money: {
                    type: 'string', required: true, allowEmpty: false
                },
                pay_password: {
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
        try {
            let uid = Number(ctx.request.query.uid);
            let busi_uid = Number(ctx.request.query.busi_uid);
            let money = Number(ctx.request.query.money);
            let pay_password = ctx.request.query.pay_password;

            let data = await service.business.sao_business(busi_uid, uid, money, pay_password);
            // return handerThis.succ(data);
            if (JSON.stringify(data) === "{}") {
                ctx.response.body=
                    " <!DOCTYPE html>" +
                    '<html lang="en">' + "<head>" + '<meta charset="UTF-8">' + '   <meta name="viewport" content="width=device-width, initial-scale=1.0">' + 
                    '  <meta http-equiv="X-UA-Compatible" content="ie=edge">'+
                    '<title> Document</title >'+'</head >'+'<body>'+' <div style="text-align:center; font-size:80px">转账成功</div>'+
                    '     </body>'+'</html >'

                                
                //  ctx.response.redirect('http://192.168.1.11/public/business/success.html');
            } else {
                ctx.response.body=
                " <!DOCTYPE html>" +
                '<html lang="en">' + "<head>" + '<meta charset="UTF-8">' + '   <meta name="viewport" content="width=device-width, initial-scale=1.0">' + 
                '  <meta http-equiv="X-UA-Compatible" content="ie=edge">'+
                '<title> Document</title >'+'</head >'+'<body>'+' <div style="text-align:center;">转账成功</div>'+
                '     </body>'+'</html >'
            }
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
}
module.exports = BusinessController