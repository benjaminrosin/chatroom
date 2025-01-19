const express = require('express');
const router = express.Router();
const userList = require('../models/usersList');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
});

router.post('/', function(req, res, next) {
    if(userList.addUser(new userList.USER(req.body))){
    //if(true){
        res.render('login', { title: 'Login', msg: 'you are now registered'});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});
    }

})

router.post('/password', function(req, res, next) {
    if(userList.findUser(req.body.email.trim().toLowerCase())){
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: false, errorMsg: ''});
    }
})

module.exports = router;
