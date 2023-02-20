const  fs  = require('fs');
const  path  = require('path');
const sharp = require('sharp');




module.exports = {
    randomGen: (length)=>{
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
},
    uploadimage: async function(req,toDir,prefix,crop){
        return new Promise( async(resolve,reject)=>{
            
            let dataToReturn = {message:'No data is available!', error:'No error'}
            const tempPath = req.file.path;
            const newFileName = prefix+this.randomGen(15)+path.extname(req.file.originalname).toLowerCase();
            const targetPath = path.join(__dirname, "../../public/uploads/"+toDir+"/"+newFileName);
            const ext = path.extname(req.file.originalname).toLowerCase();
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                
                if(crop){
                    this.cropImage.call(mainFunctions,tempPath,targetPath,cropImgCB.bind(this))
                    function cropImgCB(err){
                        if (err) {
                            dataToReturn.error = err;
                            reject(new Error('Internal server error detucted!'));
                        }
                        // this.deleteFile(tempPath) //NOT WORKING :)
                    }
                }else{
                    fs.renameSync(tempPath, targetPath, function(err) {
                        if (err) {
                            dataToReturn.error = err;
                            reject(new Error('Internal server error detucted!'));
                        } 
                    });
                }
                dataToReturn.message = 'File uploaded successfully!'
                dataToReturn.imageName = newFileName;
                resolve(dataToReturn)
            } else {
                fs.unlinkSync(tempPath, err => {
                    if (err) {
                        reject( new Error('Internal server error detucted!'));
                    }
                });
                reject(new Error('Invalid file format, only images are supported!'));
            }
        })
    },
    cropImage: function(path, topath, cb){
        sharp(path)
            .resize({
              width: 300,
              height: 300
            }).toFile(topath, function(err) {
                if(err){
                    cb(err)
                }else{
                    cb()
                }
            });
    },
    deleteFile: function(path){
        fs.unlinkSync(path, err => {
            if (err) {
                console.log(err);
            }
        });
    },
}