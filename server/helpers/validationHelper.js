const express             = require('express');
const router              = express.Router();
const Joi = require('@hapi/joi');

const validateRegistration = (data) => {
    const schema = Joi.object({
        fullname: Joi.string().required(),
        username: Joi.string().min(5).required(),
        email: Joi.string().min(5).email().required(),
        phone: Joi.string().min(10).required(),
        birth_date: Joi.string().required()
    });
    return schema.validate(data);
};

const validateSubmitRegistration = (data) => {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().required(),
        confirm_password: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateTokenActivation = (data) => {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    return schema.validate(data);
};

const validateDeleteUser = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(5).required()
    });
    return schema.validate(data);
};
  
module.exports = {
    validateRegistration,
    validateSubmitRegistration,
    validateDeleteUser,
    validateTokenActivation
}