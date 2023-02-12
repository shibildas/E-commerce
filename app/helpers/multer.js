const multer =require('multer');

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
  }
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype]
      let uploadError = new Error('invalid image type')
      
      if(isValid){
        uploadError = null
      }
      console.log("INSIDE MULTER");
      cb(uploadError, './public/productimages')
    },
    filename: function (req, file, cb) {
      const filename = file.originalname.split(' ').join('-')
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`)
    }
  })
  const uploadOptions = multer({ storage:storage}).array('productsImages',10)
  const uploadLogo = multer({ storage:storage}).array('logoImages',10)
 
 module.exports= {uploadOptions,uploadLogo}