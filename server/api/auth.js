const express           = require('express');
const router            = express.Router();
const reply             = require('../helpers/response')
const authHelper        = require('../helpers/authHelper')
const authModel         = require('../model/authModel');
const moment            = require('moment')
const encrypter         = require('object-encrypter');
const engineCrypt       = encrypter('F2FpRoERP321', {ttl: true});
const bcrypt            = require('bcrypt');
const salt              = bcrypt.genSaltSync(10);
const validationHelper  = require('../helpers/validationHelper');

const defaultToken = async (req, res)=> {
    try{
        if(!req.body.username && !req.body.email){
            return reply.badParameter(res, 'username or email')
        }else if(!req.body.password){
            return reply.badParameter(res, 'password')
        }
        await authHelper.checkUser(req, res)
    }
    catch(err){
        console.log("error disini", err)
        return reply.errorInternalServer(res,err)
    }
}

const actionLogin = async (req, res)=> {
    try{
        if(!req.body.username && !req.body.email){
            return reply.badParameter(res, 'username or email')
        }else if(!req.body.password){
            return reply.badParameter(res, 'password')
        }
        const response = await authHelper.checkUserLogin(req, res)
        return reply.send(res, response)
    }
    catch(err){
        console.log("error disini", err)
        return reply.errorInternalServer(res,err)
    }
}

const actionCheckRegister = async (req, res)=> {
    try{
        const { error } = validationHelper.validateRegistration(req.body)
        if (error) return reply.InvalidRequest(res,error)

        const checkValidity = await authHelper.checkExistingUser(req, res)
        if(checkValidity.isUserNameExist){
            return reply.badRequest(res, 'USER_ALREADY_EXIST')
        }
        if(checkValidity.isEmailExist){
            return reply.badRequest(res, 'EMAIL_ALREADY_EXIST')
        }
        if(checkValidity.isPhoneExist){
            return reply.badRequest(res, 'PHONE_ALREADY_EXIST')
        }

        // Check Log
        console.log("Ready To Save Log")
        const checkLog = await authHelper.checkLogUser(req, res)
        if(checkLog.isUserExist){
            return reply.badRequest(res, 'USER_ON_REGISTER')
        }

        await authModel.insertLogUser(req.body)
        const response = {
            token : engineCrypt.encrypt(req.body, 500000)
        }
        return reply.send(res, response)
    }
    catch(err){
        return reply.errorInternalServer(res,err)
    }
}

const actionSubmitRegister = async (req, res)=> {
    try{
        const { error } = validationHelper.validateSubmitRegistration(req.body)
        if (error) return reply.InvalidRequest(res,error)

        if(req.body.password !== req.body.confirm_password){
            return reply.badRequest(res, "INVALID_PASSWORD")
        }

        const response = await authHelper.submitSelfRegister(req, res)
        return reply.send(res, response)
    }catch(err){
        return reply.errorInternalServer(res,err)
    }
}

const verificationToken = async (req, res)=> {
    try{
        const { error } = validationHelper.validateTokenActivation(req.query)
        if (error) return reply.InvalidRequest(res,error)

        const response = await authHelper.checkTokenActivation(req, res)
        return reply.send(res, response)
    }catch(err){
        return reply.errorInternalServer(res,err)
    }
}


router.post('/login', actionLogin)
router.post('/register/check', actionCheckRegister)
router.post('/register/submit', actionSubmitRegister)
router.get('/verification', verificationToken)
router.post('/get-token', defaultToken)

module.exports = router;