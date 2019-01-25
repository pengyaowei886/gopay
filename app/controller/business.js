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
                    type: 'string', required: true, allowEmpty: false
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
                    type: 'int', required: true, allowEmpty: false
                },
                num: { //币种数量
                    type: 'int', required: true, allowEmpty: false
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
            let type = ctx.request.query.type;
            let num = ctx.request.query.num;
            let data = await service.business.query_order_likeList(type, num);
            return handerThis.succ(data);
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
            let id = ctx.request.body.id;
            let data = await service.business.query_news_list(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    async query_news_info(){
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
}
module.exports = BusinessController