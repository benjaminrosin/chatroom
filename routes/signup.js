const express = require('express');
const router = express.Router();
const users = require('../models/user');
const REGISTER = 30;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
});
/*

 */
router.post('/', async function(req, res, next) {
    console.log(13);
    if(!req.cookies.registerData){
        console.log('if cookie is not exsi')
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'session expired, please try again' });
    }
    else {
        try {
            const email = req.cookies.registerData.email.trim().toLowerCase();
            const fName = req.cookies.registerData.firstName.trim().toLowerCase();
            const lName = req.cookies.registerData.lastName.trim().toLowerCase();
            const password = req.body.password.trim().toLowerCase();

            await users.User.create({email: email, firstName: fName, lastName: lName, password: password});

            res.render('login', {title: 'Login', msg: 'you are now registered'});
        }
        catch(err) {
            res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: err.message});
        }
        /*if (userList.addUser(new userList.USER(req.body))) {
            //if(true){
            //delete cookie
            console.log('before delete')
            res.clearCookie('registerData')
            res.render('login', {title: 'Login', msg: 'you are now registered'});
        } else {
            console.log(26)
            res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: 'email already in use'});
        }*/
    }
})
router.get('/password', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
})
router.post('/password', async function(req, res, next) {
    const email = req.body.email.trim().toLowerCase();
    const result = await users.User.findOne({where: {email: email}});

    if(!result){
        res.cookie('registerData',{
            email: email,
            firstName: req.body.first_name.trim().toLowerCase(),
            lastName: req.body.last_name.trim().toLowerCase()},
            {
                maxAge: 1000 * REGISTER
            }
        );
        res.render('signup', { title: 'Signup' , startRegistration: false, errorMsg: ''});

        /*router.post('/password', function(req, res, next) {
    if(userList.findUser(req.body.email.trim())){

        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});*/
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'Email already in use'});
    }
})

module.exports = router;
