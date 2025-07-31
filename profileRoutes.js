// import express from "express";
// import { submitProject, fetchSubmittedProjects } from "./projectController.js";
// import multer from "multer";
// import fs from "fs";
// import path from "path";

// const router = express.Router();

// // 📂 Ensure 'uploads/' folder exists before saving files
// const uploadDir = "uploads/";
// if (!fs.existsSync(uploadDir)) {
//      fs.mkdirSync(uploadDir, { recursive: true });
// }

// // 🗂 **Multer Configuration (Store Files in 'uploads/')**
// const storage = multer.diskStorage({
//      destination: (req, file, cb) => {
//          cb(null, uploadDir);
//      },
//      filename: (req, file, cb) => {
//          cb(null, `${Date.now()}-${file.originalname}`);
//      },
// });

// const upload = multer({ storage });

// // 🚀 **Route for submitting a project**
// router.post("/submit-project", upload.single("ppt"), submitProject);

// // 🚀 **Route to fetch all submitted projects**
// router.get("/fetch-projects", fetchSubmittedProjects);

// export default router;
import express from "express";
import { submitProject, fetchSubmittedProjects } from "./projectController.js";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// 📂 Ensure `uploads/` folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
     fs.mkdirSync(uploadDir, { recursive: true });
}

// 🗂 **Multer Configuration for File Uploads**
const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, uploadDir);
     },
     filename: (req, file, cb) => {
         cb(null, `${Date.now()}-${file.originalname}`);
     },
});

const upload = multer({ storage });

// 🚀 **Route for submitting a project**
router.post("/submit-project", upload.single("ppt"), submitProject);

// 🚀 **Route to fetch all submitted projects**
router.get("/fetch-projects", fetchSubmittedProjects);

export default router;
