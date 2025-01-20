const express = require('express');
const router = express.Router();
const userList = require('../models/usersList');
const REGISTER = 30;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
});

router.post('/', function(req, res, next) {
    console.log(13);
    if(!req.cookies.registerData){
        console.log('if cookie is not exsi')
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'session expired, please try again' });
    }
    else if (userList.addUser(new userList.USER(req.body)) ){
    //if(true){
        //delete cookie
        console.log('before delete')
        res.clearCookie('registerData')
        res.render('login', { title: 'Login', msg: 'you are now registered'});
    }
    else{
        console.log(26)
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});
    }
})
router.get('/password', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
})
router.post('/password', function(req, res, next) {
    if(userList.findUser(req.body.email.trim())){
        res.cookie('registerData',{
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName},{
            maxAge: 1000 * REGISTER
        });
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: false, errorMsg: ''});
    }
})

module.exports = router;
