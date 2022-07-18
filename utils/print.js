const util = require('util')

const print = (objeto) => {
    console.log(util.inspect(objeto,false,12,true))
}    

module.exports = print;