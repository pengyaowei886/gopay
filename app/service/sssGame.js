const Service = require('egg').Service;



class SssGameService extends Service {


    //洗牌
    async xipai(info) {
        // const info = {
        //     wp: 1,
        //     arrType: [1, 2, 3, 4]
        // }

        // 根据人数 生成所需的牌的数量
        let arrType = [];
        for (let i = 1; i <= info.peo_num; i++) {
            arrType.push(i % 4);
        }

        let cardtool = [];
        //1黑桃,2红心,3方块,4梅花,5王牌
        for (let i = 0; i < arrType.length; i++) {
            for (let j = 1; j < 14; j++) {
                let card = {
                    type: arrType[i],
                    value: j
                }
                cardtool.push(card);
            }
        }
        let length = cardtool.length;
        //打乱牌池顺序（洗牌）
        for (var i = 0; i < length; i++) {
            var lastIndex = length - 1 - i;
            var index = Math.floor(Math.random() * lastIndex);
            var t = cardtool[index];
            cardtool[index] = cardtool[lastIndex];
            cardtool[lastIndex] = t;
        }
        if (info.wp == 1) {
            //将王牌插入
            let dawang = Math.floor(Math.random() * 51)
            let xiaowang = Math.floor(Math.random() * 51)
            if (dawang == xiaowang) {
                xiaowang = dawang + 1;
            }
            cardtool.splice(dawang, 0, { type: 5, value: 2 })
            cardtool.splice(xiaowang, 0, { type: 5, value: 1 });
        }
        return cardtool;
    }
    //发牌
    async fapai(cardtool, info) {

        // let info = {
        //     seat: [{
        //         userid: 37
        //     }, { userid: 41 }]
        // }
console.log(info.length)
        for (let i = 0; i < info.length; i++) {
            info[i].card = cardtool.slice(13 * i, 13 * (i + 1));
        }
        return info;
    }
}
module.exports = SssGameService;