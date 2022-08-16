const con     = require('../../config/db');
const moment  = require('moment')

const checkUser = (username) => {
    return new Promise( (resolve, reject)=> {
        con.query("SELECT * FROM the_users WHERE (username = '"+username+"' OR email = '"+username+"') ", function(err, rows){
            if(err){
                reject({ status:'error', message:err.code })
            }
            resolve(rows)
        })
    });
}

const checkUserLog = (payload) => {
    return new Promise( (resolve, reject)=> {
        con.query("SELECT * FROM the_registration_log WHERE (username = '"+payload.username+"' OR email = '"+payload.email+"' OR phone = '"+payload.phone+"') AND status = 0 ", function(err, rows){
            if(err){
                reject({ status:'error', message:err.code })
            }
            resolve(rows)
        })
    });
}

const checkEmail = (email) => {
    return new Promise( (resolve, reject)=> {
        con.query("SELECT * FROM the_users WHERE email = '"+email+"' ", function(err, rows){
            if(err){
                reject({ status:'error', message:err.code })
            }
            resolve(rows)
        })
    });
}

const checkPhone = (phone) => {
    return new Promise( (resolve, reject)=> {
        con.query("SELECT * FROM the_users WHERE phone LIKE '%"+phone+"' ", function(err, rows){
            if(err){
                reject({ status:'error', message:err.code })
            }
            resolve(rows)
        })
    });
}

const insertUser = (obj) => {
    return new Promise( (resolve, reject)=> {
        con.query("INSERT INTO the_users SET ? ", obj, function(err){
            if(err){
                reject(err.code)
            }
            resolve({ status:'success', message:'User already saved!' })
        })
    });
}

const insertLogUser = (obj) => {
    return new Promise( (resolve, reject)=> {
        con.query("INSERT INTO the_registration_log SET ? ", obj, function(err){
            if(err){
                reject(err.code)
            }
            resolve({ status:'success', message:'User already saved!' })
        })
    });
}

const deleteUser = (obj) => {
    return new Promise( (resolve, reject)=> {
        con.query("DELETE FROM the_users WHERE username = '"+obj+"' ", function(err){
            if(err){
                reject(err.code)
            }
            resolve({ status:'success', message:obj+' already deleted!' })
        })
    });
}

const getBirthdayUserTomorrow = () => {
    return new Promise( (resolve, reject)=> {
        const dateAdd = moment().add(1, 'd')
        const dateTomorrow = moment(dateAdd).format('MM-DD')
        con.query("SELECT firstname, lastname, username, email, location FROM the_users WHERE birthdate LIKE '%"+dateTomorrow+"' ", function(err, rows){
            if(err){
                reject(err.code)
            }
            resolve(rows)
        })
    });
}

const getBirthdayLog = () => {
    return new Promise( (resolve, reject)=> {
        const dateNow = moment().format('YYYY-MM-DD')
        let getHour = new Date()
            getHour = getHour.getHours()
            getHour = getHour < 10 ? '0'+getHour : getHour
        const timeNow = dateNow+" "+getHour+":"
        con.query("SELECT id, mailto, fullname, status, birthday_date FROM messages_log WHERE birthday_date = '"+dateNow+"' AND schedule_time LIKE '"+timeNow+"%' AND status = 0 ", function(err, rows){
            if(err){
                reject(err.code)
            }
            resolve(rows)
        })
    });
}

const getPendingBirthdayLog = () => {
    return new Promise( (resolve, reject)=> {
        const dateNow = moment().format('YYYY-MM-DD')
        con.query("SELECT id, mailto, fullname, status, birthday_date FROM messages_log WHERE birthday_date = '"+dateNow+"' AND status = 2", function(err, rows){
            if(err){
                reject(err.code)
            }
            resolve(rows)
        })
    });
}

const saveBirthdayLogs = (obj) => {
    return new Promise( (resolve, reject)=> {
        con.query("INSERT INTO messages_log SET ? ", obj, function(err){
            if(err){
                console.log("Error SQL "+err.code)
                reject(err.code)
            }
            resolve({ status:'success', message:'User already saved!' })
        })
    });
}

const updateStatusLog = (obj) => {
    return new Promise( (resolve, reject)=> {
        con.query("UPDATE messages_log SET status = "+obj.status+" WHERE id = '"+obj.id+"' AND mailto = '"+obj.mailto+"' ", (err)=>{
            if(err){
                console.log("Error SQL "+err.code)
                reject(err.code)
            }
            resolve({ status:'success', message:'User already saved!' })
        })
    });
}

const deleteLogUser = (obj) => {
    return new Promise( (resolve, reject)=> {
        con.query("DELETE FROM the_registration_log WHERE username = '"+obj+"' ", function(err){
            if(err){
                reject(err.code)
            }
            resolve({ status:'success', message:obj+' already deleted!' })
        })
    });
}

const updateRegistrationLogVerifCode = (username, token) => {
    return new Promise( (resolve, reject)=> {
        con.query("UPDATE the_registration_log SET status = 1, token_verification = '"+token+"' WHERE username = '"+username+"'", (err)=>{
            if(err){
                reject(err.code)
            }
            resolve({ status:'success', message:'User already saved!' })
        })
    });
}

const checkTokenLog = (token) => {
    return new Promise( (resolve, reject)=> {
        con.query("SELECT username, email, phone FROM the_registration_log WHERE token_verification = '"+token+"' ", (err, rows)=>{
            if(err){
                reject(err.code)
            }
            if(rows.length>0){
                resolve(rows[0])
            }else{
                resolve([])
            }
        })
    });
}

const activationSuccess = (username, email) => {
    return new Promise( (resolve, reject)=> {
        con.query("UPDATE the_users SET status = 1 WHERE username = '"+username+"' AND email = '"+email+"'", (err)=>{
            if(err){
                reject(err.code)
            }
            resolve({ status:'success', message:'ACTIVATION_SUCCESS' })
        })
    });
}

module.exports = {
    checkUser,
    checkUserLog,
    checkEmail,
    checkPhone,
    insertUser,
    insertLogUser,
    deleteUser,
    getBirthdayUserTomorrow,
    getBirthdayLog,
    getPendingBirthdayLog,
    saveBirthdayLogs,
    updateStatusLog,
    deleteLogUser,
    updateRegistrationLogVerifCode,
    checkTokenLog,
    activationSuccess
}