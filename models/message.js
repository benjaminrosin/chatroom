'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');
const USER = require('/models/user');

const Message = sequelize.define('Message', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false

        },

    },
    {
        modelName: 'Message',
    }
);


USER.User.hasMany(Message, {
    foreignKey: 'contact_id'
});

Message.belongsTo(USER.User, {
    foreignKey: 'contact_id'
});

module.exports = { Message };

