var db = require('./db');
const tail = 3;

exports.ChaffByTailTweak = (password, n) => {
    let pslist = [];
    for (let i = 0; i < n; ++i) {
        let hw = password.substring(0, password.length-tail);
        for (let j = 0; j < tail; ++j) {
            let randNum = Math.floor(Math.random()*1000);
            let c = '\0';
            switch (randNum % 3) {
                case 0: //Uppercase
                    c = String.fromCharCode((Math.floor((Math.random()*100))%26) + 65);
                    break;
                case 1: //lowercase
                    c = String.fromCharCode((Math.floor((Math.random()*100))%26) + 97);
                    break;
                case 2: //number
                    c = (Math.floor((Math.random()*100))%10).toString();
                    break;
            };
            hw+=c;
        }
        pslist.push(hw);
    }
    return pslist;
};

exports.HoneySet = async (username, position) => {
    try {
        await db.InsertHoneyChecker(username, position);
    }
    catch (error){
        throw error;
    }
}

exports.HoneyCheck = async (username, position) => {
    let AuxHoneyCheck = async (username, position) => {
        let ret = '';
        let qryStr = 'SELECT position FROM honeychecker WHERE username=?;';
        await db.QueryPara(qryStr, [username], (retval) => {
            ret = (retval.results[0]['position'] === position)? 'VALID' : 'ATTACK';
        });
        return ret;
    }

    let ret = 'TYPO';
    if (position == 0) {
        //avoid Timing-attack;
        await AuxHoneyCheck(username, 1);
    }
    else {
        ret = await AuxHoneyCheck(username, position);
    }
    return ret;
}