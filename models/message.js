'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');
//const USER = require('./user');

const Message = sequelize.define('Message', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
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

module.exports = Message;

