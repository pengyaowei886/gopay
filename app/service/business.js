const Service = require('egg').Service;
class BusinessService extends Service {
    /**
     * 用户发布卖币信息
     */
    async sell_coin(uid, type, num) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例
        let data = {};
        //账号未被冻结，且余额足够
        let res_money = await db.collection('user').findOne({ _id: uid, status: 1, balance: { $gte: num } });
        if (res_money) {
            //扣除账号余额
            await db.collection('user').updateOne({ _id: uid }, { $inc: { balance: -num } });
            //将订单插入系统交易表
            //获取自增序列
            let seqs = await handerThis.ctx.service.counter.getNextSequenceValue('business', 1);
            let options = {
                _id: seqs,
                sell_uid: uid,
                buy_uid: null,
                type: type,
                money: num,
                is_succ: 0,//是否卖出
                ctime: new Date(),
                utime: null
            }
            //插入系统订单表
            await db.collection('business').insertOne(options);
            //插入用户交易记录表
            let options_self = {
                $addToSet: {
                    sell: {
                        _id: seqs,//交易单号id，
                        is_read: 0, //是否阅读 0未阅读 1 已阅读
                        is_succ: 0 //是否交易成功
                    }
                }
            }
            await db.collection('user_business').updateOne({ _id: uid }, options_self);
            return data;
        } else {
            throw new Error("发布失败");
        }
    }
    /**
 * 用户下架货币
 */
    async delete_coin(uid, id) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例
        let data = {};
        //删除总记录
        let result = await db.collection('business').findOne({ _id: id });
        await db.collection('business').deleteOne({ _id: id });
        //恢复余额
        await db.collection('user').updateOne({ _id: id }, { $inc: { balance: result.money } });
        let options = {
            $pull: {
                "sell._id": id
            }
        }
        //修改用户订单表
        await db.collection('user_business').updateOne({ _id: uid }, options);
        return data;
    }
    /**
     * 查看卖币列表
     */
    async query_order_list() {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例
        let data = { info: [] };
        let option = {
            projection: {
                money: 1,
                type: 1,
                sell_uid: 1
            }
        }
        //查询卖币数量，卖币方式
        let result = await db.collection('business').find({ is_succ: 0 }, option).sort({ ctime: -1 }).toArray();

        let uid = [];
        for (let i in result) {
            uid.push(result[i].sell_uid);
        }
        //查询用户头像和昵称
        let info = await db.collection('user').find({ _id: { $in: uid } }, { projection: { name: 1, head_pic: 1 } }).sort({ ctime: -1 }).toArray();

        //查询成交数量
        let order_num = await db.collection('user_business').find({ _id: { $in: uid } }, { projection: { order_num: 1, _id: 1 } }).toArray();

        for (let i in result) {
            for (let j in order_num) {
                for (let r in info) {
                    if (result[i].sell_uid === order_num[j]._id && order_num[j]._id === info[r]._id) {
                        data.info.push({
                            name: info[r].name,
                            head_pic: info[r].head_pic,
                            money: result[i].money,
                            type: result[i].type,
                            order_num: order_num[j].order_num
                        })
                        break;
                    }

                }
            }
        }
        return data;
    }
    /**
       * 模糊查询卖币列表
       */
    async query_order_likeList(type, num) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例
        let data = { info: [] };
        let option = {
            projection: {
                money: 1,
                type: 1,
                sell_uid: 1
            }
        }
        //查询卖币数量，卖币方式
        let result = await db.collection('business').find({ is_succ: 0, type: type, money: num }, option).sort({ ctime: -1 }).toArray();
        let uid = [];
        for (let i in result) {
            uid.push(result[i].sell_uid);
        }
        //查询用户头像和昵称
        let info = await db.collection('user').find({ _id: { $in: uid } }, { projection: { name: 1, head_pic: 1 } }).sort({ ctime: -1 }).toArray();

        //查询成交数量
        let order_num = await db.collection('user_business').find({ _id: { $in: uid } }, { projection: { order_num: 1, _id: 1 } }).toArray();

        for (let i in result) {
            for (let j in order_num) {
                for (let r in info) {
                    if (result[i].sell_uid === order_num[j]._id && order_num[j]._id === info[r]._id) {
                        data.info.push({
                            name: info[r].name,
                            head_pic: info[r].head_pic,
                            money: result[i].money,
                            type: result[i].type,
                            order_num: order_num[j].order_num
                        })
                        break;
                    }

                }
            }
        }
        return data;
    }
    /**用户完成买币
     * 
     * @param {*} uid 
     * @param {*} id 
     */
    async buy_coin(uid, id) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例 
        let data = {};
        let exist = await db.collection('business').findOne({ _id: id, is_succ: 0 });
        if (exist) {
            //更新系统交易记录表(必须原子操作)
            let result = await db.collection('business').findOneAndUpdate({ _id: id }, { $set: { buy_uid: uid, utime: new Date(), is_succ: 1 } });
            //更新买家数据 
            await db.collection('user').updateOne({ _id: uid }, { $inc: { balance: result.value.money } });
            await db.collection('user_business').updateOne({ _id: uid }, { $push: { buy: { _id: id } } });
            //更新卖家数据,成交量加1
            let option = {
                $inc: { order_num: 1 },
                $set: {
                    "sell.$.is_succ": 1
                }
            }
            await db.collection('user_business').updateOne({ _id: result.value.sell_uid, 'sell._id': id }, option);
            return data;
        } else {
            throw new Error("该卖单不存在");
        }
    }
    /**用户查看通知列表
     * @param {*} uid 
     * @param {*} id 
     */
    async query_news_list(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例 
        let data = { info: [] };
        let result = await db.collection('user_business').findOne({ _id: uid }, { projection: { sell: 1 } });
        let id = [];
        for (let i in result.sell) {
            if (result.sell[i].is_succ == 1 && result.sell[i].is_read == 0) {
                id.push(result.sell[i]._id);
            }
        }

        let info = await db.collection('business').find({ _id: { $in: id } }, { sort: { utime: 1 } }).toArray();
        let new_id = [];
        for (let i in info) {
            new_id.push(info[i].buy_uid);
        }
        let user_info = await db.collection('user').find({ _id: { $in: new_id } }, { projection: { name: 1, head_pic: 1 } }).toArray();
        for (let i in user_info) {
            for (let j in info) {
                if (info[j].buy_uid == user_info[i]._id) {
                    data.info.push({
                        name: user_info[i].name,
                        head_pic: user_info[i].head_pic,
                        money: info[j].money,
                        id: info[j]._id,
                        utime: info[j].utime
                    });
                    break;
                }
            }
        }
        return data;
    }
    /**用户查看通知具体详情
     * @param {*} uid 
     * @param {*} id 
     */
    async query_news_info(uid, id) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例 
        let data = {};
        let result = await db.collection('user_business').findOne({ _id: uid });
        // let buy_name = await db.collection('user').findOne({ _id: result.buy_coin }, { projection: { name: 1 } });
        await db.collection('user_business').updateOne({ _id: uid, 'sell._id': id }, { $set: { 'sell.$.is_read': 1 } });
        // data.sell_coin = buy_name.name;
        // data.money = result.money;
        // data.utime = result.utime;
        return data;
    }
    /**
   * 用户查看交易记录
   */
    async query_business(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例 
        let data = {
            sell: [],
            buy: []
        };
        //查询卖币信息
        let result_sell = await db.collection('business').find({ sell_uid: uid, is_succ: 1 }, { sort: { ctime: -1 } }).toArray();


        let uid_array = [];
        for (let j in result_sell) {
            uid_array.push(result_sell[j].buy_uid);
        }
        //查询买方姓名
        let res_uid = await db.collection('user').find({ _id: { $in: uid_array } }, { projection: { _id: 1, name: 1, head_pic: 1 } }).toArray();
        for (let k in result_sell) {
            for (let i in res_uid) {
                if (result_sell[k].buy_uid === res_uid[i]._id) {
                    data.sell.push({
                        money: result_sell[k].money,
                        type: result_sell[k].type,
                        buy_name: res_uid[i].name,
                        head_pic: res_uid[i].head_pic,
                        ctime: result_sell[k].ctime,
                        utime: result_sell[k].ctime
                    })
                    break;
                }
            }
        }

        //查询卖币信息
        let result_buy = await db.collection('business').find({ buy_uid: uid }, { sort: { ctime: -1 } }).toArray();
        let sell_uid = [];
        for (let u in result_buy) {
            sell_uid.push(result_buy[u].sell_uid);
        }
        let sell_name = await db.collection('user').find({ _id: { $in: sell_uid } }, { projection: { _id: 1, name: 1 } }).toArray();
        for (let y in result_buy) {
            for (let s in sell_name) {
                if (result_buy[y].sell_uid === sell_name[s]._id) {
                    data.buy.push({
                        money: result_sell[i].money,
                        type: result_sell[i], type,
                        sell_name: result[k].name,
                        head_pic: result[k].head_pic,
                        utime: result_sell[i].utime,
                    })
                }
                break;
            }

        }
        return data;

    }
    /**
 * 用户查看未成交卖单信息
 */
    async query_dissucc_record(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GOPAY')['db'];//获取数据库实例 
        let data = {
            info: []
        };
        let result = await db.collection('business').find({ sell_uid: uid, is_succ: 0 }, {
            projection: {
                _id:0,
                money: 1,
                type: 1,
                ctime: 1
            }
        }).toArray();
           data.info=result;
           return data;

    }
}
module.exports = BusinessService