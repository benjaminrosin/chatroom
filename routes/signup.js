const express = require('express');
const router = express.Router();
const users = require('../models/user');
const req = require("express/lib/request");


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
});
/*
try {
    const email = req.cookies.email.trim().toLowerCase();
    const fName = req.cookies.firstName.trim().toLowerCase();
    const lName = req.cookies.lastName.trim().toLowerCase();
    const password = req.body.password.trim().toLowerCase();

    await users.User.create({email: email, firstName: fName, lastName: lName, password: password})
}
catch(err) {

}
 */
router.post('/', function(req, res, next) {
    if(userList.addUser(new userList.USER(req.body))){
    //if(true){
        res.render('login', { title: 'Login', msg: 'you are now registered'});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});
    }

})
router.get('/password', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
})
router.post('/password', async function(req, res, next) {
    const email = req.body.email.trim().toLowerCase();
    const result = await users.User.findOne({where: {email: email}});
    if(!result){
        res.render('signup', { title: 'Signup' , startRegistration: false, errorMsg: ''});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'Email already in use'});
    }
})

module.exports = router;
