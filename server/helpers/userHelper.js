const express 			= require('express');
const router  			= express.Router();
const moment            = require('moment')
const encrypter         = require('object-encrypter');
const engineCrypt       = encrypter('F2FpRoERP321', {ttl: true});
const reply             = require('../helpers/response')
const mailHelper        = require('../helpers/mailHelper')
const authModel         = require('../model/authModel');
const timezoneConfig    = require('../../assets/timezone.json');

const checkExistingUser = async (req) => {
    try{
        const checkUsername = await authModel.checkUser(req.body.username)
        const data = { isUserNameExist:false, isEmailExist:false }
        if(checkUsername.length > 0){
            data.isUserNameExist = true
        }
        if(req.body.email){
            const checkEmail    = await authModel.checkEmail(req.body.email)
            if(checkEmail.length > 0){
                data.isEmailExist = true
            }
        }
        return data
        
    }catch(error){
        throw new Error(error)
    }
}

const submitRegister = async (req, __res) => {
    try{
        const username = req.body.username.replace(' ', '')
        const dataUser = req.body
              dataUser.username = username
        return await authModel.insertUser(dataUser)
    }catch(error){
        throw new Error(error)
    }
}

const deleteUser = async (req) => {
    try{
        const username = req.body.username
        return await authModel.deleteUser(username)
    }catch(error){
        throw new Error(error)
    }
}

const getUserBirthDateToday = async (req) => {
    try{
        const username = req.body.username
        return await authModel.deleteUser(username)
    }catch(error){
        throw new Error(error)
    }
}

const saveBirthdayLogs = async (data)=>{
    try{
        let success_log = 0
        let error_log = 0
        data.forEach(async (item) => {
            item.fullname    = item.firstname+" "+item.lastname
            const location = item.location.toLowerCase()
            const getTimezone = timezoneConfig.countries.filter(x => x.name.toLowerCase() === location).map(x => x.timezone_offset);
            const timezone = parseFloat(getTimezone)
            const getTzDifferent = timezone - 9 + (9-timezone)
            let   newTimezone = moment().format('YYYY-MM-DD 09:00:00')
                  newTimezone = moment(newTimezone).utcOffset(getTzDifferent).add(1, 'd')
            console.log(newTimezone)
            const dataLog = {
                mailto:         item.email,
                fullname:   item.fullname,
                birthday_date:   moment(newTimezone).format("YYYY-MM-DD"),
                status: 0,
                schedule_time: moment(newTimezone).format("YYYY-MM-DD HH:mm:ss") //2022-08-13 13:00:00
            }
            const statuslog = await authModel.saveBirthdayLogs(dataLog)
            if(statuslog.status === 'success') {
                success_log++
            }else{
                error_log++
            }
        });
        return { status:'success', success_log, error_log }
    }catch(error){
        throw new Error(error)
    }
}

const sendBirthdayMessage = async (data)=>{
    let receiver = 0
    data.forEach(async (item) => {
        receiver++
        const mailMessage = {
            title:      "Happy Birthday!",
            text:       "Happy Birthday, "+item.fullname+"!",
            messages:   "Hi "+item.fullname+"! This is your birthday. Wish You All The Best, God Bless You!"
        }
        await mailHelper.sendMail(item, mailMessage)
    });
    return { send_email:'Birthday Message sent to '+receiver+' receiver' }
}


module.exports = {
    checkExistingUser,
    submitRegister,
    deleteUser,
    getUserBirthDateToday,
    saveBirthdayLogs,
    sendBirthdayMessage,
    checkUser
}