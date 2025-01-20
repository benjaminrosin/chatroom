'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        unique: {args:true, msg: "Email already in use"},
        validate: {
            isEmail: {args: true,
                msg: 'E-mail address required'
            }
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        validate: {
            isAlpha: true,
            len: [3, 32]
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [3, 32]
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlphanumeric: true,
            len: [3, 32]
        }
    },
},
    {
        hooks: {
            beforeCreate(sequelize) {
                //hash password
                console.log('beforeCreate');
            }
        },
        modelName: 'User',
    }
);

/*
Contact.hasMany(Order, {
    foreignKey: 'contact_id'
});

Order.belongsTo(Contact, {
    foreignKey: 'contact_id'
});
*/
module.exports = { User };

//---------------------------------------------------------------------------------
/*module.exports = (function () {
    const users = [{email:"benjamin.rosin@gmail.com"}];

    class USER{
        constructor(reqBody) {
            this.email = reqBody.email;
            this.fname = reqBody.first_name;
            this.lname = reqBody.last_name;
            this.password = reqBody.password;
        }
        setPassword(password) {
            this.password = password;
        }
    }
    function addUser(user) {
        console.log(user);
        if (!findUser(user.email)){
            users.push(user);
            return true;
        }
        return false;
    }

    function findUser(email) {
        const val = users.some(user => user.email === email);
        console.log(val);
        console.log(users);
        return val;
    }

    return{
        USER,
        addUser,
        findUser,
    };
})();*/