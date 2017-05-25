var express = require('express');
var router = express.Router();
var fs=require('fs');
var formidable = require("formidable");


const prodModel = require('./db.js').prodModel;
const subprodModel = require('./db.js').subprodModel;



/* GET home page. */
router.get('/', function(req, res, next) {
/*
  res.json({a:3})
*/

  res.json({src:'/Users/xukaijie/Desktop/logo.jpg'})
    return;

  console.log("#######")

});


router.get('/img', function(req, res, next) {


    res.json({src:'/Users/xukaijie/Desktop/logo.jpg'})

    return;

    console.log("#######")

});


router.get('/product_list', function(req, res, next) {

    var root = req.query.root;

    var parent = req.query.parent;

    prodModel.find({root:root,parent:parent},(err,result)=>{

        if (err) {
            console.log(err)
        }
        else{


            res.json({data:result})
        }
    })

})


router.get('/subProduct', function(req, res, next) {


    var name = req.query.name;

    subprodModel.find({parent:name},{name:1,_id:0},(err,result)=>{


        if (err) {
            console.log(err)
        }
        else{

            res.json({data:result})
    }
    })


    return;


})




router.post('/upload',function(req,res,next){

    var form = new formidable.IncomingForm();

    form.encoding = 'utf-8';

    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2*1024*1024; //内存大小
    form.maxFilesSize= 5*1024*1024;//文件字节大小限制，超出会报错err
    form.parse(req, function(err, fields, files) {

        if (err){

            console.log(err);
            res.json({err:1,"message":"error"});
            return;
        }else{


           var oldpath = files.filedata.path;

           var rootname = req.query.root;
           var parentname = req.query.parent;
           var name = req.query.name;


           console.log(parentname);

           var url = '/Users/xukaijie/Desktop/node/demo/images/';

           var imgName = parentname == ''? rootname+"_"+name:rootname+"_"+parentname+"_"+name

            imgName = imgName+'.png';

            url = url+imgName;

           fs.renameSync(oldpath,url);

            var json = {

                root:rootname,
                parent:parentname,
                name:name,
                img:url
            }

            var mongooseEntity = new prodModel(json);

            mongooseEntity.save((err,result)=> {


                if (err) {
                    console.log(err)
                }
                else {

                    console.log(result)
                    res.json({err: 0})
                }
            });

            return;

        }

    });

})



module.exports = router;
