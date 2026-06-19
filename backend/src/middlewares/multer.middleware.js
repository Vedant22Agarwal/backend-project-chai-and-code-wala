import multer from "multer";

// user se file leke temp mein store kr rahe h using multer - copy code from multer npm github
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // file -> file is here
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // different name
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
