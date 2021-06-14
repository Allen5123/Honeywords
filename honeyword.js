var db = require('./db');

exports.ChaffByTailTweak = (password, n) => {
    const tail = 3, specialCharList = ['~', '!', '#', '$', '%', '&', '*', '+', '-', '@'];
    let pslist = [];
    for (let i = 0; i < n; ++i) {
        let hw = password.substring(0, password.length - tail);
        for (let j = tail; j > 0; --j) {
            let randomNum = 0, c = '\0';
            if ((/[a-z]/).test(password[password.length-j])) {
                randomNum = Math.floor((Math.random()*26))%26;
                c = String.fromCharCode(randomNum + 97);
            }
            else if ((/[A-Z]/).test(password[password.length-j])) {
                randomNum = Math.floor((Math.random()*26))%26;
                c = String.fromCharCode(randomNum + 65);
            }
            else if ((/[0-9]/).test(password[password.length-j])) {
                randomNum = Math.floor((Math.random()*10))%10;
                c = String.fromCharCode(randomNum + 48);
            }
            else {
                c = specialCharList[Math.floor((Math.random()*specialCharList.length))%specialCharList.length];
            }
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
        let qryStr = 'SELECT position FROM honeychecker WHERE username=?;';
        try {
            let res = await db.query(qryStr, [username]);
            return (res[0]['position'] === position)? 'VALID' : 'ATTACK';
        }
        catch (err) {
            throw err;
        }
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