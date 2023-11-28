const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');


// Configure Cloudinary using your credentials
cloudinary.config({
  cloud_name: 'dwvjyn8yo',
  api_key: '412924234812823',
  api_secret: 'nry5eRyeyjb8usxORCqNWs3BQvQ',

});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ['jpg', 'png',"jpeg" ],
    folder: 'product', 
  },
});

module.exports = multer({ storage });