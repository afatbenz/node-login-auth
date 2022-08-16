const express 			= require('express');
const router  			= express.Router();
const moment            = require('moment')
const encrypter         = require('object-encrypter');
const engineCrypt       = encrypter('F2FpRoERP321', {ttl: true});
const reply             = require('../helpers/response')
const mailHelper        = require('../helpers/mailHelper')
const authModel         = require('../model/authModel');
const timezoneConfig    = require('../../assets/timezone.json');

const msisdnFormat = async (msisdn) => {
    try{
        if(msisdn.substring(0,3) === '+62'){
            msisdn = msisdn.slice(0,3)
        }
        if(msisdn.substring(0,2) === '62' || msisdn.substring(0,2) === '08'){
            msisdn = msisdn.slice(0,2)
        }
        return msisdn
    }
    catch(err){
        res.status(500).send({message:`Internal Server Error`})
    }
}


module.exports = {
    msisdnFormat
}