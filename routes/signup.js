const express = require('express');
const router = express.Router();
const users = require('../models/user');
const {ValidationErrorItem} = require("sequelize");
const REGISTER = 30;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
});

router.post('/', async function(req, res, next) {
    if(!req.cookies.registerData){
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'session expired, please try again' });
    }
    else {
        try {
            const registerData = JSON.parse(req.cookies.registerData);

            const email = registerData.email.trim().toLowerCase();
            const fName = registerData.firstName.trim().toLowerCase();
            const lName = registerData.lastName.trim().toLowerCase();
            const password = req.body.password.trim().toLowerCase();

            await users.User.create({email: email, firstName: fName, lastName: lName, password: password});

            res.render('login', {title: 'Login', msg: 'you are now registered'});
        }
        catch(err) {
            if (err.errors[0] instanceof ValidationErrorItem) {
                console.log(err.errors[0]);
                res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: err.errors[0].message});
            }
            else{
                console.log(err);
                res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: "cannot signup, please try again later."});
            }
        }
    }
})
router.get('/password', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: 'row 49'});
})
router.post('/password', async function(req, res, next) {
    const email = req.body.email.trim().toLowerCase();
    const result = await users.User.findOne({where: {email: email}});

    if(!result){
        res.cookie('registerData',
            JSON.stringify({
                email: email,
                firstName: req.body.first_name.trim().toLowerCase(),
                lastName: req.body.last_name.trim().toLowerCase()
            }),
            {
                maxAge: 1000 * REGISTER, // Set cookie expiration
            }
        );
        res.render('signup', { title: 'Signup' , startRegistration: false, errorMsg: ''});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'Email already in use'});
    }
})

module.exports = router;
