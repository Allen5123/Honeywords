var mysql = require('mysql');
require('dotenv').config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;
var pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
});
const numOfHw = 3;

const query = async (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(new Error(err));
            connection.query(sql, params, (err, result) => {
                connection.release();
                if (err) reject(new Error(err));
                resolve(result);
            });
        });
    });
};

let BuildTable = async () => {
    let createTableQuery = (numOfHw_) => {
        let userQuery = 'CREATE TABLE IF NOT EXISTS user (username VARCHAR(20),password VARCHAR(30)';
        let shadowQuery = 'CREATE TABLE IF NOT EXISTS shadow (username VARCHAR(20)';
        for (let i = 1; i <= numOfHw_ + 1; ++i) {
            if (i <= numOfHw_) {
                userQuery+=(',hw' + i.toString() + ' VARCHAR(30)');
            }
            shadowQuery+=(',hashpw' + i.toString() + ' VARCHAR(100)');
        }
        userQuery+=',realhashpw VARCHAR(100),PRIMARY KEY(username))ENGINE=INNODB;';
        shadowQuery+=',PRIMARY KEY(username),FOREIGN KEY(username) REFERENCES user(username) ON DELETE CASCADE)ENGINE=INNODB;';
        let honeyCheckerQuery = 'CREATE TABLE IF NOT EXISTS honeychecker (username VARCHAR(20),position INT,PRIMARY KEY(username),FOREIGN KEY(username) REFERENCES user(username) ON DELETE CASCADE)ENGINE=INNODB;';
        return {userQuery, shadowQuery, honeyCheckerQuery};
    }

    const {userQuery, shadowQuery, honeyCheckerQuery} = createTableQuery(numOfHw);
    try {
        await query(userQuery, []);
        await query(shadowQuery, []);
        await query(honeyCheckerQuery, []);
        console.log('SetUp successfully!');
    }
    catch (error) {
        throw error;
    }
}

let InsertUser = async (username, psList, realHashPw) => {
    let qry = 'INSERT INTO user VALUES(?';
    if (psList.length !== numOfHw + 1) {
        throw 'Insert into user error';
    }
    else {
        for (let i = 0; i < psList.length + 1; ++i) {
            qry+=',?';
        }
        qry+=');';
        try {
            await query(qry, [username].concat(psList, [realHashPw]));
        }
        catch (error) {
            throw error;
        }
    }
}

 let InsertShadow = async (username, hashList) =>{
    let qry = 'INSERT INTO shadow VALUES(?';
    if (hashList.length !== numOfHw + 1) {
        throw 'Insert into shadow error';
    }
    else {
        for (let i = 0; i < hashList.length; ++i) {
            qry+=',?';
        }
        qry+=');';
        try {
           await query(qry, [username].concat(hashList));
        }
        catch (error) {
            throw error;
        }
    }
}

let InsertHoneyChecker = async (username, position) => {
    let qryStr = 'INSERT INTO honeychecker VALUES(?,?);';
    try {
       await query(qryStr, [username, position.toString()]);
    }
    catch (error) {
        throw error;
    }
}

let SetUp = async () => {
    try {
        pool.getConnection((err, connection) => {
            console.log('Test Database connection...');
            if (err) {
                throw err;
            }
            else {
                console.log('Database Connect Successfully!');
                connection.release();
            }
        });
        await BuildTable();
    } 
    catch (err) {
        if (err) {console.log('SetUp Error\n', err);}
        else {console.log(res);}
    }
}

SetUp();

module.exports = {pool:pool, query:query, BuildTable:BuildTable, numOfHw:numOfHw, InsertUser:InsertUser, InsertShadow:InsertShadow, InsertHoneyChecker:InsertHoneyChecker};