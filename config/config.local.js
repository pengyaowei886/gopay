'use strict';
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536805618764_2318';

  //add your config here
  config.middleware = ['loginVerify'];

  //安全验证
  config.security = {
    csrf: {
      enable: false
    }
  };
  //请求格式和是否跨域
  config.cors = {
    allowMethods: 'GET,POST,PUT,DELETE',
    credentials: true
  }
  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '127.0.0.1',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '159370',
      // 数据库名
      database: 'sss'
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };


  config.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/sss': {
        connectionMiddleware: ['conn'],
        packetMiddleware: [],
      },
      '/dzpk': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
  };
  config.cluster = {
    listen: {
      port: 7001,
      hostname: '127.0.0.1',
      // https:{
      //   key:"D:/work/ssl/0_xingyumeng.com.key",
      //   cert:"D:/worssl/1_xingyumeng.com_bundle.pem"
      //  }
    },

  };
  config.info = {
    room_key: "~!@#$(*&^%$&",
  };

  return config;
};