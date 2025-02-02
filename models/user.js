'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const {hashSync} = require("bcrypt");
const Message = require('./message');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        unique: {args:true, msg: "Email already in use"},
        validate: {
            isEmail: {args: true, msg: "E-mail address required"}
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        validate: {
            isAlpha: {args: true, msg: "First name must consist of letters"},
            len: {args: [3, 32], msg: "Length must be between 3, 32"}
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: {args: true, msg: "Last name must consist of letters"},
            len: {args: [3, 32], msg: "Length must be between 3, 32"}
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlphanumeric: {args: true, msg: "Password can contain only alphanumeric characters."},
            len: {args: [3, 32], msg: "Length must be between 3, 32"}
        }
    },
},
    {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSaltSync(10, 'a');
                user.password = hashSync(user.password, salt);

            }
        },
        modelName: 'User',
    }
);

User.hasMany(Message, {
    foreignKey: 'user_id'
});

Message.belongsTo(User, {
    foreignKey: 'user_id'
});

/*
Contact.hasMany(Order, {
    foreignKey: 'contact_id'
});

Order.belongsTo(Contact, {
    foreignKey: 'contact_id'
});
*/
module.exports = { User, Message};

