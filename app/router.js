'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware, io } = app;
  let loginVerify = middleware.loginVerify({})//用户身份验证



  /****************** 个人信息*************** *************/
  //用户注册
  router.post('/register', controller.user.register);

  //用户登陆
  router.get('/login', controller.user.login);
  //用户查询基本信息
  router.get('/user/info', controller.user.query_user_info);

  /****************** 十三水 http *************** *************/
  //创建房间
  router.post('/sss/room/create', controller.sss.create_room);

  //进入房间
  router.post('/sss/room/join', controller.sss.join_room);

  /****************** 十三水 socket*************** *************/
  //登陆
  io.of('/sss').route('login', io.controller.sss.login);
  //游戏准备
  io.of('/sss').route('ready', io.controller.sss.ready);
  //游戏开始
  io.of('/sss').route('start', io.controller.sss.start);
  //比牌
  io.of('/sss').route('compare', io.controller.sss.compare);
  //比牌准备
  io.of('/sss').route('compare_ready', io.controller.sss.compare_ready)
  //回到大厅
  io.of('/sss').route('back_to_hall', io.controller.sss.back_to_hall)
  //解散房间
  io.of('/sss').route('dispress', io.controller.sss.dispress)
  //同意
  io.of('/sss').route('agree', io.controller.sss.agree)
  //拒绝
  io.of('/sss').route('reject', io.controller.sss.reject)
  //退出房间
  io.of('/sss').route('exit', io.controller.sss.exit)

  // //德州扑克socket
  // io.of('/dzpk').route('login', io.controller.dzpk.server);

}