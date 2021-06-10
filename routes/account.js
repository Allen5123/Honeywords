var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var db = require('../db');
var honeyword = require('../honeyword');
var jwt = require('jsonwebtoken');
const PW_MIN_LENGTH = 5;
const JWTSK = 'zvoafnvonzvklsaxlemfeqfm';

router.post('/signup', async (req, res, next) => {
    let FindUser = async (username) => {
        let qryStr = 'SELECT * FROM user WHERE username=?;';
        await db.QueryPara(qryStr, [username], (retval) => {
            if (retval.results !== undefined && retval.results.length > 0) {
                throw username + ' has been used';
            }
        });
    }

    let HashPassword = async (psList) => {
        let hashList = [];
        for (let i = 0; i < psList.length; ++i) {
            hashList.push(await bcrypt.hash(psList[i], 5));
        }
        return hashList;
    }

    let Shuffle = (arr) => {
        for (let i = 0; i < 1000; ++i) {
            let randind1 = Math.floor(Math.random()*arr.length)%(arr.length);
            let randind2 = Math.floor(Math.random()*arr.length)%(arr.length);
            //swap
            let temp = arr[randind1];
            arr[randind1] = arr[randind2];
            arr[randind2] = temp;
        }
    }

    const {username, password} = req.body;
    if (!password || typeof password !== 'string') {
        return res.json({status : 'error', error : 'Invalid password'});
    }
    if (password.length < PW_MIN_LENGTH) {
        return res.json({status : 'error', error : 'password should be longer than ' + PW_MIN_LENGTH.toString()});
    }
    try {
        await FindUser(username);
        let pwList = (honeyword.ChaffByTailTweak(password, db.numOfHw));
        //add password to psList's front
        pwList.unshift(password);
        const hashList = await HashPassword(pwList);
        const realhashpw = hashList[0];
        await db.InsertUser(username, pwList, realhashpw);
        Shuffle(hashList);
        const position = hashList.findIndex((item) => {return item === realhashpw;}) + 1;
        await db.InsertShadow(username, hashList);
        await honeyword.HoneySet(username, position);
    }
    catch (err) {
        console.log(err);
        return res.json({status : 'error', error : 'SignUp Error'});
    }
    return res.json({status : 'ok'});
});

router.post('/login', async (req, res, next) => {
    let FindHashList = async (username) => {
        let qryStr = 'SELECT hashpw1';
        for (let i = 2; i <= db.numOfHw + 1; ++i) {
            qryStr+=(',hashpw'+i.toString());
        }
        qryStr+=' from shadow WHERE username=?;';
        return await db.QueryPara(qryStr, [username], (retval) => {
            if (retval.results !== undefined && retval.results.length > 0) {return retval;}
            else {throw 'User not\'t exist';}
        });
    }

    const {username, password} = req.body;
    if (!password || typeof password !== 'string') {
        return res.json({status:'error', error:'Invalid password'});
    }
    if (password.length < PW_MIN_LENGTH) {
        return res.json({status:'error', error:'password should be longer than ' + PW_MIN_LENGTH.toString()});
    }
    let token = '';
    try {
        const hashList = await FindHashList(username);
        let position = 0;
        //find password's position in shadow
        for (let i = 1; i <= db.numOfHw + 1; ++i) {
            let key = 'hashpw' + i.toString();
            if (await bcrypt.compare(password, hashList.results[0][key])) {
                position = i;
                break;
            }
        }
        switch (await honeyword.HoneyCheck(username, position)) {
            case'VALID':
                token = jwt.sign({username:username}, JWTSK);
                return res.json({status : 'VALID', data : token});
            case'TYPO':
                return res.json({status : 'TYPO'});
            case'ATTACK':
                return res.json({status : 'ATTACK'});
            default:
                throw 'Exception';
        }
    }
    catch (err) {
        console.log(err);
        return res.json({status : err});
    }
});

module.exports = router;