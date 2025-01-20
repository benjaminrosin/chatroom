const express = require('express');
const router = express.Router();
const users = require('../models/user');
const bcrypt = require("bcrypt");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login', msg: '', errMsg: ''});
});

router.post('/', async function(req, res, next) {
    const user = await users.User.findOne({where:{email: req.body.email.trim().toLowerCase()}});

    if (user){
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            //session
            res.redirect('chatroom');
        }
        else{
            res.render('login', { title: 'Login', msg: '', errMsg: "wrong password"});
        }
    }
    else{
        res.render('login', { title: 'Login', msg: '', errMsg: "cannot find user"});
    }

});
module.exports = router;
