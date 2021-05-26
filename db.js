var mysql = require('mysql');
var dbName = 'honeywords';
var dbInfo = {host:'localhost', database:dbName, user:'root', password:'samtucuers12', connectionLimit : 10};
var pool = mysql.createPool(dbInfo);
const numOfHw = 2;

async function Query(queryString, functionPointer) {
    let AuxQuery = (queryString) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                else {
                    connection.query(queryString, (error, results, field) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve({results:results, field:field});
                        }
                        connection.release();
                    });
                }
            });
        });
    };

    return await AuxQuery(queryString).then(functionPointer).catch((error) => {throw error;});
}

async function QueryPara(queryString, value, functionPointer) {
    let AuxQuery = (queryString) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                else {
                    connection.query(queryString, value, (error, results, field) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve({results:results, field:field});
                        }
                        connection.release();
                    });
                }
            });
        });
    };

    return await AuxQuery(queryString).then(functionPointer).catch((error) => {throw error;});
}

async function BuildTable() {
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
        await Query(userQuery, (retval)=>{console.log('After Create user Table')});
        await Query(shadowQuery, (retval)=>{console.log('After Create shadow Table')});
        await Query(honeyCheckerQuery, (retval)=>{console.log('After Create honeyChecker Table')});
    }
    catch (error) {
        throw error;
    }
}

async function InsertUser(username, psList, realHashPw) {
    let qry = 'INSERT INTO user VALUES(?';
    if (psList.length != numOfHw + 1) {
        throw 'Insert into user error';
    }
    else {
        for (let i = 0; i < psList.length + 1; ++i) {
            qry+=',?';
        }
        qry+=');';
        try {
            await QueryPara(qry, [username].concat(psList, [realHashPw]), (retval) => {
                console.log('After insert into User');
            });
        }
        catch (error) {
            throw error;
        }
    }
}

async function InsertShadow(username, hashList) {
    let qry = 'INSERT INTO shadow VALUES(?';
    if (hashList.length != numOfHw + 1) {
        throw 'Insert into shadow error';
    }
    else {
        for (let i = 0; i < hashList.length; ++i) {
            qry+=',?';
        }
        qry+=');';
        try {
            await QueryPara(qry, [username].concat(hashList), (retval) => {
                console.log('After insert into shadow');
            });
        }
        catch (error) {
            throw error;
        }
    }
}

async function InsertHoneyChecker(username, position) {
    let qryStr = 'INSERT INTO honeychecker VALUES(?,?);';
    try {
        await QueryPara(qryStr, [username, position.toString()], (retval) => {
            console.log('After insert into honeychecker');
        });
    }
    catch (error) {
        throw error;
    }
}

pool.getConnection((err, connection) => {
    console.log('Test Databse connection...');
    if (err) {throw err;}
    else {
        console.log('Database Connect Successfully!');
        connection.release();
    }
});
BuildTable();

module.exports = {pool:pool, Query:Query, QueryPara:QueryPara, BuildTable:BuildTable, numOfHw:numOfHw, InsertUser:InsertUser, InsertShadow:InsertShadow, InsertHoneyChecker:InsertHoneyChecker};