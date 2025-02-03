'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');
const bcrypt = require("bcrypt");
const {hashSync} = require("bcrypt");
//const USER = require('./user');

const Message = sequelize.define('Message', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
            set(text) {
                const encoded = text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                this.setDataValue('content', encoded);
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

