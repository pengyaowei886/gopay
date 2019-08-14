'use strict';

// had enabled by egg
// exports.static = true;
//参数验证插件
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.cluster = {
  enable: true,
  package: 'egg-cluster'
}

exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};
exports.io = {
  enable: true,
  package: 'egg-socket.io',
};