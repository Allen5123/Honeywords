var express = require('express');
var path = require('path');
var router = express.Router();
var db = require('../db');
var mysql = require('mysql');
/* GET users listing. */
router.get('/', function(req, res, next) {
	res.sendFile('admin.html', {root:path.join(__dirname, '../public')});
});
router.get('/attacker', function(req, res, next) {
	res.send('<h1 style="color:Tomato;">You are attacker !!!</h1>');
});
router.get('/user', function(req, res, next) {
	res.send('<h1 style="color:green;">Login Successfully !!!</h1>');
});
router.get('/show', async (req, res, next) => {
	let SelectAll = async (tableName) => {
		try {
			const data = await db.query('SELECT * FROM ?;', [mysql.raw(tableName)]);
			return data;
		}
		catch (err) {
			console.log(err);
			throw 'SELECT '+ tableName +' ERROR';
		}
	}
	
	try {
		const userData = await SelectAll('user');
		const shadowData = await SelectAll('shadow');
		const honeycheckerData = await SelectAll('honeychecker');
		return res.json({status:'ok', userData:userData, shadowData:shadowData, honeycheckerData:honeycheckerData});
  	}
	catch (err) {
		console.log(err);
		return res.json({status:'error'});
	}
});
module.exports = router;
