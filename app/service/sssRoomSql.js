const Service = require('egg').Service;

const querystring = require('querystring')

class SssRoomSqlService extends Service {


    //判断房间是否存在
    async room_is_exist(roomid) {
        const mysql = this.app.mysql;
        let room = await mysql.select('t_sss_rooms', { where: { id: roomid } });
        if (room.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    //创建房间
    async create_room(params) {
        const mysql = this.app.mysql;
        let uuid = new Date().getTime() + params.roomid;
        let room = await mysql.insert('t_sss_rooms', {
            uuid: uuid, id: params.roomid, peo_num: params.peo_num, ctime: new Date().getTime(), ju_num: params.ju_num, fangfei_type: params.fangfei_type,
            moshi: params.moshi, is_mapai: params.is_mapai, type: params.type, need_gems: params.need_gems, fangzhu_gems: params.fangzhu_gems, cuid: params.userid, turn: 0,
            status: 1
        });
        if (room.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //安排用户坐下
    async set_user_seat(userid, roomId, seatIndex, type, ) {
        const mysql = this.app.mysql;
        if (this.room_is_exist(roomId)) {
            let host = this.ctx.request.host;
            let ip = host.split(":")[0];
            let user_info = await this.ctx.service.userSql.get_user_data_by_id(userid);

            let res = await mysql.insert('t_user_join_room', {
                userid: userid, roomid: roomId, seat_index: seatIndex, type: type, ctime: new Date().getTime(), online: 1, score: 0, ready: 0, ip: ip, name: user_info.name, headimg: user_info.headimg
            })
            if (res.affectedRows == 1) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error("房间不存在");
        }
    }
    //删除房间
    async delete_room(roomId) {
        const mysql = this.app.mysql;
        let res = await mysql.delete('t_sss_rooms', { id: roomId });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //获取房间信息
    async get_room_data(roomId) {
        const mysql = this.app.mysql;

        let rows = await mysql.select('t_sss_rooms', { where: { id: roomId } });
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("查询房间信息失败");
        }
    }
    //更新房间数据
    async update_room_data(roomId) {
        const mysql = this.app.mysql;

        let rows = await mysql.select('t_sss_rooms', { where: { id: roomId } });
        if (rows.length > 0) {
            //判断局数
            if (rows[0].ju_num > rows[0].turn) {
                let res = mysql.select('t_sss_rooms', { turn: rows[0].turn + 1, status: 0 }, { where: { id: roomId } });
                if (res.affectedRows == 1) {
                    return true;
                } else {
                    throw new Error("修改房间信息失败");
                }
            } else {
                return false;
            }
        } else {
            throw new Error("查询房间信息失败");
        }
    }

    //获取坐位配置信息
    async get_seat_data(roomId) {
        const mysql = this.app.mysql;
        let res = await mysql.select('t_user_join_room', { where: { roomid: roomId } });
        return res
    }
    //判断自己是否在房间中
    async is_user_in_room(userid, roomId) {
        const mysql = this.app.mysql;

        let res = await mysql.select('t_user_join_room', { where: { roomid: roomId, userid: userid } });
        if (res.length > 0) {
            return true
        } else {
            return false
        }
    }
    //清除用户座位信息
    async del_user_seat(userid) {
        const mysql = this.app.mysql;
        let res = await mysql.select('t_user_join_room', { where: { userid: userid } });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //修改用户游戏状态
    async update_user_status(userid, status) {
        const mysql = this.app.mysql;
        let res = await mysql.update('t_user_join_room', { ready: status }, { where: { userid: userid } });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }

    //获取用户对局记录
    async get_user_score(roomid) {
        const mysql = this.app.mysql;
        let res = await mysql.select('t_user_join_room', { where: { roomid: roomid }, columns: ['score', 'userid'] });
        if (res.length > 0) {
            return res;
        } else {
            throw new Error("查询对局信息失败");
        }
    }
    //修改用户对局信息
    async update_user_game(userid) {
        const mysql = this.app.mysql;
        let res = await mysql.update('t_user_join_room', { ready: 0, card: "", td: "", zd: "", wd: "" }, { where: { userid: userid } });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //修改房间游戏状态
    async update_room_status(roomid, status) {
        const mysql = this.app.mysql;
        let res = await mysql.update('t_sss_rooms', { status: status }, { where: { id: roomid } });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //判断房间能否进行游戏
    async  game_can_running(roomid) {
        let room_info = await this.get_room_data(roomid);
        if (room_info.status == 1) {
            let user_seat_data = await this.get_seat_data(roomid);
            for (let i in user_seat_data) {
                if (user_seat_data[i].ready != 1) {
                    return false
                }
            }
            //可以开始
            return true;
        } else {
            return false
        }
    }
    //判断房间能否开始比牌
    async  game_can_compare(roomid) {
        let room_info = await this.get_room_data(roomid);
        if (room_info.status == 2) {
            let user_seat_data = await this.get_seat_data(roomid);
            for (let i in user_seat_data) {
                if (user_seat_data[i].ready != 2) {
                    return false
                }
            }
            //可以开始
            return true;
        } else {
            return false
        }
    }
    //将每个人的牌存入数据库
    async update_user_pai(info, roomid) {
        const mysql = this.app.mysql;
        let sql1 = "";
        let value = "";
        for (let i = 0; i < info.length; i++) {
            if (i == info.length - 1) {
                let pai = JSON.stringify(info[i].card);
                sql1 += ` when  ${info[i].userid} then '${pai}' end  `;
                value += `${info[i].userid} `;
                break;
            }
            let pai = JSON.stringify(info[i].card);
            sql1 += ` when  ${info[i].userid} then '${pai}' `;
            value += `${info[i].userid} , `
        }
        let sql = "update t_user_join_room  set card = case userid " + sql1 + `  where  roomid = ${roomid} and userid in ( ${value})  `
        let res = await mysql.query(sql);
        if (res.affectedRows == info.length) {
            return true;
        } else {
            throw new Error("将用户手牌插入数据库失败");
        }
    }
    // //修改用户对局信息
    // async update_user_game(info) {
    //     const mysql = this.app.mysql;

    //     if (res.affectedRows == info.length) {
    //         return true;
    //     } else {
    //         throw new Error("将用户手牌插入数据库失败");
    //     }
    // }
    //扣除用户房费
    async kouchu_user_gems(roomid) {
        const mysql = this.app.mysql;
        // let room_info = await this.get_room_data(roomid);
        let user_data = await this.get_seat_data(roomid);
        let userid = "";
        for (let i in user_data) {
            if (i == user_data.length - 1) {
                userid = `${user_data[i].userid}  `
            }
            userid = `${user_data[i].userid} , `
        }
        //暂定一局2个房卡
        let sql = `update t_users set gems = gems - 2 where userid in  ( ${userid} )`;
        let res = await mysql.query(sql);
        if (res.affectedRows == user_data.length) {
            return true;
        } else {
            return false;
        }
    }
    //判断用户的牌是否被动过手脚
    async user_card_true(userid, cardtool) {
        const mysql = this.app.mysql;
        let card_info = await mysql.select('t_user_join_room', { where: { userid: userid }, columns: ['card'] })
        let card = card_info[0].card;
        let card_new = JSON.parse(card.slice(0, card.length));
        if (cardtool.td.length == 3 && cardtool.zd.length == 5 && cardtool.wd.length == 5) {
            let td = 0;
            for (let t in cardtool.td) {
                for (let i = 0; i < 3; i++) {
                    if (this.ctx.service.tools.equals(card_new[i], cardtool.td[t])) {
                        td++;
                        break;
                    }
                }
            }
            let zd = 0;
            for (let z in cardtool.zd) {
                for (let i = 3; i < 8; i++) {
                    if (this.ctx.service.tools.equals(card_new[i], cardtool.zd[z])) {
                        zd++;
                        break;
                    }
                }
            }
            let wd = 0;
            for (let w in cardtool.wd) {
                for (let i = 8; i < 13; i++) {
                    if (this.ctx.service.tools.equals(card_new[i], cardtool.wd[w])) {
                        wd++;
                        break;
                    }
                }
            }
            if (td == 3 && zd == 5 && wd == 5) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    //将用户组好的牌存入数据库
    async save_user_card(userid, cardtool) {
        const mysql = this.app.mysql;
        let res = await mysql.update('t_user_join_room', {
            td: JSON.stringify(cardtool.td),
            zd: JSON.stringify(cardtool.zd),
            wd: JSON.stringify(cardtool.wd),
        }, { where: { userid: userid } });
        if (res.affectedRows == 1) {
            return true;
        } else {
            return false;
        }
    }
    //查询该房间内所有用户的牌
    async get_all_user_card(roomid) {
        const mysql = this.app.mysql;
        let card_info = await mysql.select('t_user_join_room', { where: { roomid: roomid }, columns: ['td', 'zd', 'wd', 'userid'] })
        if (card_info.length > 0) {

            for (let i in card_info) {
                card_info[i].td = JSON.parse(card_info[i].td);
                card_info[i].zd = JSON.parse(card_info[i].zd);
                card_info[i].wd = JSON.parse(card_info[i].wd);
            }
            return card_info;
        } else {
            throw new Error("查询用户的牌失败");
        }
    }

}
module.exports = SssRoomSqlService;