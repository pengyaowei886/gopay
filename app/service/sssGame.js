const Service = require('egg').Service;



class SssGameService extends Service {



  
    
     
    

    //洗牌
    async xipai(info) {
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
    //同花
    isTongHua(arrPai) {
        var len = arrPai.length;
        var type = arrPai[0].type;
        for (var i = 1; i < len; i++) {
            if (arrPai[i].type !== type) {
                return false;
            }
        }
        return true;
    };
    //顺子
    isShunZi(arrPai) {
        var len = arrPai.length;
        for (var i = 0; i < len - 1; i++) {
            var value1 = arrPai[i].value;
            var value2 = arrPai[i + 1].value;
            if (value1 - value2 !== 1) {
                return false;
            }
        }
        return true;
    };
    //比牌
    comparPai(arrPai1, arrPai2) {
        var type1 = Compare.getType(arrPai1);
        var type2 = Compare.getType(arrPai2);
        if (type1 > type2) {
            return 1;
        }
        else if (type1 === type2) {
            return Compare.compareSameType(arrPai1, arrPai2, type1);
        }
        else {
            return -1;
        }
    };
    //相同牌型比较
    compareSameType(arrPai1, arrPai2, type) {
        if (type === 6) {	//同花单独处理
            for (let i = 0; i < arrPai1.length; i++) {
                if (arrPai1[i].value > arrPai2[i].value) {
                    return 1;
                }
                else if (arrPai1[i].value < arrPai2[i].value) {
                    return -1;
                }
            }
            return 0;
        }
        var analyseData1 = analysePai(arrPai1);
        var analyseData2 = analysePai(arrPai2);
        var tpInfo1 = analyseData1.tongPai;
        var tpInfo2 = analyseData2.tongPai;
        tpInfo1.sort(function (a, b) { return (b.count - a.count) });
        tpInfo2.sort(function (a, b) { return (b.count - a.count) });
        var sanPai1 = analyseData1.sanPai;
        var sanPai2 = analyseData2.sanPai;
        var resultValue = 0;
        var tpLen1 = tpInfo1.length;
        var tpLen2 = tpInfo2.length;
        if (tpLen1 === tpLen2) {
            for (var i = 0; i < tpLen1; i++) {
                resultValue = comparDX(tpInfo1[i].value, tpInfo2[i].value);
                if (0 !== resultValue) {
                    return resultValue;
                }
            }
        }

        var spLen1 = sanPai1.length;
        var spLen2 = sanPai2.length;
        if (spLen1 === spLen2) {
            for (var i = 0; i < spLen1; i++) {
                resultValue = comparDX(sanPai1[i].value, sanPai2[i].value);
                if (0 !== resultValue) {
                    return resultValue;
                }
            }
        }
        return 0;
    };
    //获取牌类型
    getType = function (arrPai) {
        var isSTST = function (tongPai) {
            for (var i = 0; i < tongPai.length; i++) {
                if (tongPai[i].count !== 3) {
                    return false;
                }
            }
            return true;
        };

        var isSTH = function (arrPai) {
            var len = arrPai.length;
            if (len !== 13) {
                return false;
            }
            var result = [];

            for (var i = 0; i < 4; i++) {
                var count = 0;
                for (var j = 0; j < len; j++) {
                    if (arrPai[j].type === i) {
                        ++count;
                    }
                }
                if (count > 0) {
                    result.push({ type: i, count: count });
                }
            }

            result.sort(function (a, b) {
                return (a.count - b.count);
            });

            if (result.length >= 4) {
                return false;
            }
            else if (result.length === 3) {
                if (result[0].count === 3
                    && result[1].count === 5
                    && result[2].count === 5) {
                    return true;
                }
                return false;
            }
            else if (result.length === 2) {
                if (result[0].count === 3
                    && result[1].count === 10) {
                    return true;
                }
                return false;
            }
            else {
                return false;
            }
        }
        //同花
        var isST = function (arrTPInfo) {
            for (var i = 0; i < arrTPInfo.length; i++) {
                if (arrTPInfo[i].count === 3) {
                    return true;
                }
            }
            return false;
        }

        var isWTZ = function (arrPai) {
            var analyseData = analysePai(arrPai);
            var tongPai = analyseData.tongPai;
            var sanPai = analyseData.sanPai;
            if (sanPai.length >= 1) {
                return false;
            }
            for (var i = 0; i < tongPai.length; i++) {
                if (tongPai[i].count === 5) {
                    return true;
                }
            }
            return false;
        }
        //铁支
        var isTZP = function (tongPai) {
            var bZhaDan = false;
            for (var i = 0; i < tongPai.length; i++) {
                if (tongPai[i].count === 4) {
                    bZhaDan = true;
                }
            }
            if (!bZhaDan) {
                return false;
            }
            var duiziCount = 0;
            for (var i = 0; i < tongPai.length; i++) {
                if (tongPai[i].count >= 2) {
                    duiziCount++;
                }
            }
            if (bZhaDan && duiziCount === 5) {
                return true;
            }
            else {
                return false;
            }
        }
        //三分天下
        var isSFTX = function (arrTPInfo) {
            var count = 0;
            for (var i = 0; i < arrTPInfo.length; i++) {
                if (arrTPInfo[i].count === 4) {
                    count++;
                }
            }
            return count === 3 ? true : false;
        }

        var type = 0;
        var analyseData = analysePai(arrPai);
        var tongPai = analyseData.tongPai;
        var sanPai = analyseData.sanPai;
        var paiLen = arrPai.length;
        var tpLen = tongPai.length;
        var spLen = sanPai.length;
        var bTonhua = Compare.isTongHua(arrPai);
        var bShunzi = Compare.isShunZi(arrPai);
        var bSSZ = Compare.isSSZ(arrPai, false, false);
        var bSTHS = Compare.isSSZ(arrPai, true, false);
        var bTHSBD = Compare.isSSZ(arrPai, false, true);
        if (3 === paiLen) {
            if (tpLen === 1 && spLen === 0) {
                type = PaiType.ST;
            }
            else if (tpLen === 1 && spLen === 1) {
                type = PaiType.YD;
            }
            else {
                type = PaiType.WL;
            }
        }
        else if (5 === paiLen) {
            if (tpLen === 1 && spLen === 0) {	//是否五同？
                return PaiType.WT;
            }
            else if (bTonhua && bShunzi) {
                return PaiType.THS;
            }
            else if (spLen === 1 && tpLen === 1) {
                return PaiType.TZ;
            }
            else if (tpLen === 2 && spLen === 0) {
                type = PaiType.HL;
            }
            else if (bTonhua) {
                type = PaiType.TH;
            }
            else if (bShunzi) {
                type = PaiType.SZ;
            }
            else if (isST(tongPai)) {
                type = PaiType.ST;
            }
            else if (2 === tpLen && 1 === spLen) {
                type = PaiType.ED;
            }
            else if (1 === tpLen && 3 === spLen) {
                type = PaiType.YD;
            }
            else {
                type = PaiType.WL;
            }
        }
        else if (13 === arrPai.length) {
            if (bTonhua && bShunzi) {
                type = PaiType.ZZQL;
            }
            else if (bShunzi) {
                type = PaiType.YTL;
            }
            //三同花顺
            else if (bSTHS) {
                type = PaiType.STHS;
            }
            else if (isSFTX(tongPai)) {
                type = PaiType.SFTX;
            }
            else if (isWTZ(arrPai, true)) {
                type = PaiType.WTZ;
            }
            else if (bTHSBD) {
                type = PaiType.THSBD;
            }
            else if (bSSZ) {
                type = PaiType.SSZ;
            }
            else if (isTZP(tongPai, true)) {
                type = PaiType.TZP;
            }
            else if (bTonhua) {
                type = PaiType.CYS;
            }
            else if (arrPai[paiLen - 1].value >= 8) {
                type = PaiType.QD;
            }
            else if (arrPai[0].value < 8) {
                type = PaiType.QX;
            }
            else if (isSTST(arrPai)) {
                type = PaiType.STST;
            }
            else if (tpLen === 6 && (spLen === 1)) {
                type = PaiType.LDB;
            }
            else if (isSTH(arrPai)) {
                type = PaiType.STH;
            }
            else {
                type = PaiType.WL;
            }
        }
        else {
            type = PaiType.WL;
        }
        return type;
    };

    //比牌 并计算积分
    async compare(user_cards) {

        for (let i in user_cards) {
            for (let j in user_cards) {
                //自己的牌不比较
                if (user_cards[i].userid == user_cards[j].userid) {
                    continue;
                } else {
                    //比较头墩

                }
            }
        }
    }
}
module.exports = SssGameService;