const {User} = require('../models/user')
const bcrypt = require("bcrypt");
const users = require("../models/user");
const REGISTER = 30;

exports.newLogin = function(req, res) {
    res.render('login', { title: 'Login', msg: '', errMsg: ''});
}

exports.loginValidation = async(req, res) => {
    const user = await User.findOne({where:{email: req.body.email.trim().toLowerCase()}});

    if (user){
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            req.session.user = {
                id: user.id,
                isLoggedIn: true
            };
            req.session.lastUpdated = new Date();
            res.redirect('chatroom');
        }
        else{
            res.render('login', { title: 'Login', msg: '', errMsg: "wrong password"});
        }
    }
    else{
        res.render('login', { title: 'Login', msg: '', errMsg: "cannot find user"});
    }
}

exports.newSignup = async(req, res) => {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
}

exports.checkEmailAvailability = async (req, res) => {
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
}

exports.register = async(req, res) => {
    if(!req.cookies.registerData){
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'session expired, please try again'});
    }
    else {
        try {
            const registerData = JSON.parse(req.cookies.registerData);

            const email = registerData.email.trim().toLowerCase();
            const fName = registerData.firstName.trim().toLowerCase();
            const lName = registerData.lastName.trim().toLowerCase();
            const password = req.body.password.trim().toLowerCase();

            res.clearCookie('registerData');
            await users.User.create({email: email, firstName: fName, lastName: lName, password: password});

            res.render('login', {title: 'Login', msg: 'you are now registered', errMsg: ''});
        }
        catch(err) {
            if (Array.isArray(err)) {
                console.log(err.errors[0]);
                res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: err.errors[0].message});
            }
            else{
                console.log(err);
                res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: "cannot signup, please try again later."});
            }
        }
    }
}