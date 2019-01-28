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

  config.mongo = {
    clients: {
      GOPAY: {
        host: '127.0.0.1',
        port: '51234',
        name: 'gopay',
        user: '',
        password: '',
        options: {useNewUrlParser: true},
      }
    }
  };
   //token加密方式
  config.GOPAY={
     key : '9vApxLk5G3PAsJrM', //16位 对称公钥
     iv : 'FnJL7EDzjqWjcaY9',  //偏移量
  }
  config.cluster= {
    listen: {
      port: 80,
      hostname: '127.0.0.1',
      // https:{
      //   key:"D:/work/ssl/0_xingyumeng.com.key",
      //   cert:"D:/worssl/1_xingyumeng.com_bundle.pem"
      //  }
    },
    
  };

  return config;
};