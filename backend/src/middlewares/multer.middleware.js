import multer from "multer"

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, "./public/temp")
   },
   filename: function (req, file, cb) {
     cb(null, file.originalname)
   }
 })
 
 export const upload = multer({ 
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024  // 500MB in bytes
    }
});