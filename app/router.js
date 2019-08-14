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


  /****************** 十三水 http *************** *************/
  //创建房间
  router.post('/sss/room/create', controller.sss.create_room);

  //进入房间
  router.post('/sss/room/join', controller.sss.join_room);
  /****************** 十三水 socket*************** *************/
  // //十三水socket
  // io.of('/sss').route('login', io.controller.sss.login);


  // //德州扑克socket
  // io.of('/dzpk').route('connection', io.controller.dzpk.server);

}