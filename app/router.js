'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  let loginVerify=middleware.loginVerify({})//用户身份验证

//用户注册请求短信验证码
router.get('/gopay/app/user/register/duanxin',controller.user.req_dx);
//用户完成注册（并验证短信验证码）
router.post('/gopay/app/user/register',controller.user.register);
//用户登陆
router.get('/gopay/app/user/login',controller.user.login);
//用户修改密码
router.put('/gopay/app/user/password',loginVerify,controller.user.update_pw);
//修改昵称和头像

//查看用户基本信息

//上传微信，支付宝二维码图片

//上传银行卡信息


//查看卖币列表
router.get('/gopay/app/user/order/list',loginVerify,controller.business.query_order_list);
//按条件检索卖币列表
router.get('/gopay/app/user/order/like',loginVerify,controller.business.query_order_likeList);
//发布卖币信息
router.post('/gopay/app/user/sell',loginVerify,controller.business.sell_coin);
//用户完成购买(事务操作)
router.put('/gopay/app/user/buy',loginVerify,controller.business.buy_coin);
//查看用户交易记录
router.get('/gopay/app/user/business',loginVerify,controller.business.query_business);
//用户查看通知列表
router.get('/gopay/app/user/news/list',loginVerify,controller.business.query_news_list);
//用户查看通知具体详情
router.get('/gopay/app/user/news',loginVerify,controller.business.query_news_info);
}