const createError 	  = require('http-errors');
const express 		  = require('express');
const bodyParser      = require('body-parser');
const path 	       = require('path');
const logger 		  = require('morgan');
const cookieParser 	  = require('cookie-parser');
const session         = require('express-session');
const mysql           = require('mysql');               //// Add SQL
const app             = express();
const cron            = require('node-cron');
const reply             = require('./server/helpers/response')
const authHelper        = require('./server/helpers/authHelper')
const authModel         = require('./server/model/authModel');
const moment            = require('moment')

app.disable('x-powered-by');

app.use(session({ 
     name: 'fatih',
     secret: '123456cat',
     key: 'faTech',
     resave: false,
     saveUninitialized: true,
     cookie: { maxAge: 3600000 * 4 }
}))

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.raw({inflate:true, limit: '100kb', type: 'application/json'}))

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.text({ type: 'text/plain' }));
app.use(bodyParser.urlencoded({ extended: false }));

const indexRouter     = require('./server/api/index');
const authRouter      = require('./server/api/auth');
const userRouter      = require('./server/api/user');

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use((err, res)=> {
    if(err){
        res.status(404).send({status:404, message:"REQUEST_NOT_FOUND"})
    }
});

cron.schedule('0 */1 * * *', async (req, res) => {
     try{
         let getHourNow = new Date()
             getHourNow = getHourNow.getHours()
         const response = {}

         // Save logs birthday data for tomorrow
         if(getHourNow === 0 || getHourNow === '00'){
             const dataBirthdayUsers = await authModel.getBirthdayUserTomorrow(req, res)
             await authHelper.saveBirthdayLogs(dataBirthdayUsers) 
         }

         // get birthday schedule for current time
         const getLogBirthday   = await authModel.getBirthdayLog(res)
         const sendMessage = await authHelper.sendBirthdayMessage(getLogBirthday, res)
               response.message_log = sendMessage
         
         // get birthday email failed
         const getPendingMessage   = await authModel.getPendingBirthdayLog(res)
         const sendPendingMessage  = await authHelper.sendBirthdayMessage(getPendingMessage, res)
               response.pending_log = sendPendingMessage
         return reply.send(res, response)
     }
     catch(err){
         return reply.errorInternalServer(res,err)
     }
}, {timezone:'America/New_York'});
   
module.exports = app;