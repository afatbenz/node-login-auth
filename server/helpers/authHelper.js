const express 			= require('express');
const router  			= express.Router();
const moment            = require('moment')
const encrypter         = require('object-encrypter');
const engineCrypt       = encrypter('F2FpRoERP321', {ttl: true});
const bcrypt            = require('bcrypt');
const salt              = bcrypt.genSaltSync(10);
const reply             = require('../helpers/response')
const mailHelper        = require('../helpers/mailHelper')
const generalHelper     = require('../helpers/generalHelper')
const authModel         = require('../model/authModel');
const timezoneConfig    = require('../../assets/timezone.json');
const { empty } = require('@hapi/joi/lib/base');

const checkUserLogin = async (req, res) => {
    try{
        const username      = req.body.username
        const password      = req.body.password
        const checkDBUser   = await authModel.checkUser(username)
        if(checkDBUser.length > 0){
            bcrypt.compare(password, checkDBUser[0].password, async (err, valid) => {
                console.log(valid, checkDBUser[0].password)
                if(valid){
                    console.log("Masuuk")
                    const expireTime    = parseInt(moment().format('x')) + (30*60*1000)
                    const dataToEncrypt = { profile:checkDBUser[0], expireTime }
                    return {
                        status: 'LOGIN_SUCCESS',
                        token: engineCrypt.encrypt(dataToEncrypt, 1800000)
                    };
                }else{
                    console.log("Tidak Valid")
                    return reply.sendMessage(res, 'INVALID_PASSWORD')
                }
            })
        }else{
            return reply.sendMessage(res, 'USER_NOT_FOUND')
        }
    }
    catch(err){
        res.status(500).send({message:`Internal Server Error`})
    }
}

const checkExistingUser = async (req) => {
    try{
        const checkUsername = await authModel.checkUser(req.body.username)
        const data = { isUserNameExist:false, isEmailExist:false, isPhoneExist:false }
        if(checkUsername.length > 0){
            data.isUserNameExist = true
        }
        // check email
        const checkEmail    = await authModel.checkEmail(req.body.email)
        if(checkEmail.length > 0){
            data.isEmailExist = true
        }
        // check phone
        const msisdn        = generalHelper.msisdnFormat(req.body.phone)
        const checkPhone    = await authModel.checkPhone(msisdn)
        if(checkPhone.length > 0){
            data.isPhoneExist = true
        }
        return data
    }catch(error){
        throw new Error(error)
    }
}

const checkLogUser = async (req) => {
    try{
        const checkLog = await authModel.checkUserLog(req.body)
        const data = { isUserExist:false}
        if(checkLog.length > 0){
            data.isUserExist = true
        }
        return data
    }catch(error){
        throw new Error(error)
    }
}

const submitSelfRegister = async (req, _res) => {
    try{
        const data     = engineCrypt.decrypt(req.body.token);
        const password = bcrypt.hashSync(req.body.password, salt)
        const username = data.username.replace(' ', '')
        const dataUser = {
            fullname:   data.fullname,
            username:   username,
            email:      data.email,
            phone:      data.phone,
            birth_date: data.birth_date,
            password,
            created_by: 0,
            created_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            status: 0
        }

        // Send verification Email
        const payloadVerification = {
            fullname:   data.fullname,
            username:   data.username.replace(' ', ''),
            email:      data.email,
            phone:      data.phone
        }
        const tokenVerification = engineCrypt.encrypt(payloadVerification, 500000)
        await mailHelper.sendVerificationEmail(data, tokenVerification)
        await authModel.updateRegistrationLogVerifCode(data.username, tokenVerification)
        
        // Insert User to DB
        const response = await authModel.insertUser(dataUser)
        response.message = 'Your registration has been successfully'
        return response;
    }catch(error){
        throw new Error(error)
    }
}

const checkTokenActivation = async(req, res)=> {
    try{
        const token = req.query.token.split(' ').join('+')
        const checkTokenLog = await authModel.checkTokenLog(token)
        if(checkTokenLog === []){
            return reply.sendMessage(res, 'INVALID_TOKEN')
        }
        
        // Decrypt Token
        const decryptToken = engineCrypt.decrypt(token)
        if(!decryptToken) {
            throw new Error("INVALID_TOKEN_OR_EXPIRED")
        }

        // Compare DB and Decrypted Token
        console.log("Compare ...")
        if(checkTokenLog.username === decryptToken.username && checkTokenLog.email === decryptToken.email && checkTokenLog.phone === decryptToken.phone){
            return authModel.activationSuccess(decryptToken.username, decryptToken.email)
        }
        throw new Error("INVALID_TOKEN_OR_EXPIRED")
    }catch(error){
        throw new Error(error)
    }
}


module.exports = {
    checkExistingUser,
    checkLogUser,
    submitSelfRegister,
    checkUserLogin,
    checkTokenActivation
}