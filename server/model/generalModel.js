const con     			= require('../../config/db');

const menuList = (req) => {
    return new Promise( (resolve, reject)=> {
        con.query("SELECT * FROM the_menu ", function(err, rows){
            if(err){
                reject(err)
            }
            resolve(rows)
        })
    });
}

module.exports = {
    menuList
}