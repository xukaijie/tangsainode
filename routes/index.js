var express = require('express');
var router = express.Router();
var fs=require('fs');
var formidable = require("formidable");


const prodModel = require('./db.js').prodModel;



/* GET home page. */
router.get('/', function(req, res, next) {
/*
  res.json({a:3})
*/

  res.json({src:'/Users/xukaijie/Desktop/logo.jpg'})
    return;

});


router.get('/img', function(req, res, next) {


    res.json({src:'/Users/xukaijie/Desktop/logo.jpg'})

    return;

});




router.post('/product_list', function(req, res, next) {



    var body = JSON.parse(req.body);

    var root = body.root;

    var parent = body.parent;

    var currentpage = parseInt(req.query.currentpage);

    var pagesize = parseInt(req.query.pagesize);

    var pagenum = 1;


    if(parent == 'ALL' || parent == 'All'){

        var query = prodModel.find({root:root},{name:1,img:1,_id:0});

    }else{

        var query = prodModel.find({root:root,parent:parent},{name:1,img:1,feature:1,_id:0});

    }

    query.exec(function(err,result){

        console.log(result)
    })

    query.count(function(err, count) {

        if (err){

            res.json({err:1})
        }else{

            var skip = (currentpage-1)*pagesize;

            pagenum = Math.ceil( count/pagesize)

            query.skip(skip).limit(pagesize).exec(function(err, items) {

                if (err){

                    res.json({err:1})
                }else{

                    res.json({err:0,data:items,currentpage:currentpage,pagenum:pagenum})

                }
            });

        }

        return;

    });


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


router.post('/product_detail', function(req, res, next) {


    var body = JSON.parse(req.body);

    var root = body.root;

    var name = body.name;


    prodModel.find({root:root,name:name},{feature:1,special:1,descp:1,img:1,sub_img_list:1,_id:0},(err,result)=>{

        if (err){

            res.json({err:1})
        }else{

            res.json({err:0,data:result[0]})
        }

    });

    return;
})

router.post('/delete', function(req, res, next) {


    var body = JSON.parse(req.body);

    var root = body.root;

    var name = body.name;


    prodModel.remove({root:root,name:name},(err,result)=>{

        if (err){

            res.json({err:1})
        }else{

            res.json({err:0})
        }

    });

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

           var rootname = fields.root.replace(/ /g,'');
           var parentname = fields.parent.replace(/ /g,'');;
           var name = fields.name.replace(/ /g,'');;

           var url = '/var/www/html/images/';

           var imgName = parentname == ''? rootname+"_"+name:rootname+"_"+parentname+"_"+name;

            var imgName_base64 = new Buffer(imgName).toString('base64');

            if (imgName_base64.length > 100){

                imgName_base64 = imgName_base64.subString(0,100);
            }

            var imgName_1 = imgName_base64+'.png';

            var url_save = url+imgName_1;

           fs.renameSync(oldpath,url_save);

           var ftArray =[];

           ftArray = fields.feature.split("_");

           var spArray = [];

           spArray = fields.special.split("_");


           /*处理子图片*/


           var sub_img_list = [];

           var num = fields.subfile_num;


           for (var i = 0; i<num;i++){

               var key = 'filedata'+(i+1);
               var sub_img_path = files[key].path;

               var name_1 = imgName_base64+'_sub_file_'+i;

               var name = url+name_1+'.png';


               fs.renameSync(sub_img_path,name);

               sub_img_list.push('/images/'+name_1+'.png');

           }



            var json = {

                root: fields.root,
                parent:fields.parent,
                name:fields.name,
                img:'/images/'+imgName_base64+'.png',
                sub_img_list:sub_img_list,
                ctime:Date.now(),
                descp:fields.descp,
                feature:ftArray,
                special:spArray
            }

/*
            var mongooseEntity = new prodModel({root:fields.root,name:fields.name},json,true);
*/


            prodModel.update({root:fields.root,parent:fields.parent,name:fields.name},json,{upsert:true},(err,result)=> {


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
