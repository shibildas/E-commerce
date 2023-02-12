
const Swal = require('sweetalert2');
module.exports={

    CheckError:async (req, res, next) => {
        try {
            const { files } = req;
      if (!files) {
          Swal.fire({
          title: 'Error',
          text: 'Please upload images',
          icon: 'error',
        });
        return res.status(400).send({ error: 'Please upload images' });
    }
    
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dimensions = await sharp(file.path)
        .metadata()
        .then((metadata) => ({
            width: metadata.width,
            height: metadata.height,
        }));
        
        if (dimensions.width > 800 || dimensions.height > 800) {
            Swal.fire({
                title: 'Error',
                text: 'File size too big',
                icon: 'error',
            });
            return res.status(400).send({ error: 'File size too big' });
        }
  
        // Save the file to disk or S3 etc
        // ...
    }
    
      Swal.fire({
          title: 'Success',
          text: 'Files uploaded',
          icon: 'success',
        });
        return res.status(200).send({ success: 'Files uploaded' });
    } catch (err) {
        next(err);
    }
  }
}