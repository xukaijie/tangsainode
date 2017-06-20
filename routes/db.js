'use strict'
const mongoose = require('mongoose')
// 连接mongodb
var conn = mongoose.connect('mongodb://47.52.112.187/tangsai');

/*conn.on('error', function(error) {
    console.log(error);
});*/

var prod = new mongoose.Schema({

    name:String,
    parent:String,
    root:String,
    img:String,
    ctime:String,
    descp:String,
    feature:Array,
    special:Array
})

/*var subprod = new mongoose.Schema({

    name:String,
    child:Boolean,
    parent:String

})*/


var prodModel = conn.model('detailprods',prod);

/*
var subprodModel = conn.model('subprods',subprod);
*/

module.exports = {prodModel:prodModel};




