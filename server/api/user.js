const express           = require('express');
const router            = express.Router();
const reply             = require('../helpers/response')
const authHelper        = require('../helpers/authHelper')
const authModel         = require('../model/authModel');
const moment            = require('moment')
const validationHelper  = require('../helpers/validationHelper');

const insertUser = async (req, res)=> {
    try{
        const { error } = validationHelper.validateRegistration(req.body)
        if (error) return reply.InvalidRequest(res,error)

        const checkValidity = await authHelper.checkExistingUser(req, res)
        if(checkValidity.isUserNameExist){
            return reply.sendMessage(res, 'USER_ALREADY_EXIST')
        }
        if(checkValidity.isEmailExist){
            return reply.sendMessage(res, 'EMAIL_ALREADY_EXIST')
        }
        const response = await authHelper.submitRegister(req, res)
        return reply.send(res, response)
    }
    catch(err){
        return reply.errorInternalServer(res,err)
    }
}

const deleteUser = async (req, res)=> {
    try{
        const { error } = validationHelper.validateDeleteUser(req.body)
        if (error) return reply.InvalidRequest(res,error)

        const checkValidity = await authHelper.checkExistingUser(req, res)
        if(!checkValidity.isUserNameExist){
            return reply.sendMessage(res, 'USER_NOT_FOUND')
        }
        
        const response = await authHelper.deleteUser(req, res)
        console.log(response)
        return reply.send(res, response)
    }
    catch(err){
        return reply.errorInternalServer(res,err)
    }
}


router.post('/delete', insertUser)
router.post('/submit', deleteUser)

module.exports = router;