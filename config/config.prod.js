'use strict';
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536805618764_2318';

  // add your config here
  config.middleware = ['loginVerify'];

  //安全验证
  config.security = {
    csrf: {
      enable: false //暂不开
    }
  };
  //请求格式和是否跨域
  config.cors = {
    allowMethods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
    origin: '*'
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

  //token加密方式
  config.GOPAY = {
    key: '9vApxLk5G3PAsJrM', //16位 对称公钥
    iv: Date.now() * 1000,  //16位 偏移量
  };
  config.cluster = {
    listen: {
      port: 7001,
      hostname: '172.17.0.17  ',
      // https:{
      //   key:"D:/work/ssl/0_xingyumeng.com.key",
      //   cert:"D:/worssl/1_xingyumeng.com_bundle.pem"
      //  }
    },

  };
  return config;
};