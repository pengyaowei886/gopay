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
    DEFINE: {
      PaiType: {
        NONE: 0,
        WL: 1,//乌龙
        YD: 2,//1对
        ED: 3,//2对
        ST: 4,//三条
        SZ: 5,//顺子
        TH: 6,//同花
        HL: 7,//葫芦
        TZ: 8,//铁支
        THS: 9,//同花顺
        WT: 10,//五同
        //特殊牌
        STH: 11,//三同花
        SSZ: 12,//三顺子
        LDB: 13,//六对半
        WDST: 14,//五对三条
        STST: 15,//四套三条
        SGCS: 16,//双怪冲三
        QX: 17,//全小
        QD: 18,//全大
        CYS: 19,//凑一色
        SFTX: 20,//三套炸弹、三分天下
        STHS: 21,//三同花顺
        SEHZ: 22,//十二皇族
        YTL: 23,//一条龙
        ZZQL: 24,//至尊清龙
        TZP: 25,//铁子牌
        THSBD: 26,//同花顺报道
        WTZ: 27//五同钻
      },
      GameState: {
        GAME_PREPARE: 0,
        GAME_START: 1,
        GAME_OVER: 2,
        GAME_COMPARE: 3,
      },
      GAME_TYPE: {
        GAME_NORMAL: 0,
        GAME_BWZ: 1,
        GAME_BB: 2,
        GAME_MP: 3,
      }
    }
  }
  return config;
};