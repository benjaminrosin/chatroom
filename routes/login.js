const express = require('express');
const router = express.Router();
const users = require('../models/user');
const bcrypt = require("bcrypt");

/* GET home page. */
router.get('/', function(req, res) {
    res.render('login', { title: 'Login', msg: '', errMsg: ''});
});

router.post('/', async function(req, res) {
    const user = await users.User.findOne({where:{email: req.body.email.trim().toLowerCase()}});

    if (user){
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            req.session.user = {
                id: user.id,
                email: user.email,
                isLoggedIn: true
            };
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

router.get('/logout', function(req, res) {
    req.session.destroy((err) => {
        if(err) {
            console.log("Error destroying session:", err);
            return res.redirect('/chatroom');
        }
        // Redirect to login page after successful logout
        res.redirect('/login');
    });
});
module.exports = router;
