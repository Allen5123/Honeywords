var express = require('express');
var router = express.Router();
const accountController = require('../controller/accountController');
router.post('/signup', accountController.SignUp);

router.post('/login', accountController.Login);

router.post('/chgpw', accountController.ChangePassword);
module.exports = router;