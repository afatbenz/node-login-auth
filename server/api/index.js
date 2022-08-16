const express           = require('express');
const router            = express.Router();
const reply             = require('../helpers/response')
const authHelper        = require('../helpers/authHelper')
const mailer            = require('../helpers/mailHelper')
const moment            = require('moment')
const encrypter         = require('object-encrypter');
const engineCrypt       = encrypter('F2FpRoERP321', {ttl: true});
const auth              = require('../helpers/authHelper')

router.get('/sys', async (res)=> {
    try{
        return reply.send(res, "OK")
    }
    catch(error){
        return reply.errorInternalServer(res,error)
    }
})

module.exports = router;