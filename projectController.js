// import pool from "./db.js";
// import fs from "fs";
// import path from "path";

// // 📂 Define Upload Directory
// const uploadDir = "uploads/";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ✅ **Submit Project & Store in Database**
// export const submitProject = async (req, res) => {
//   try {
//     const { projectName, description, regNo } = req.body;
//     const pptFile = req.file;

//     if (!pptFile) {
//       return res.status(400).json({ message: "❌ PPT/PDF file is required!" });
//     }

//     // ✅ **Find `teamId` using `regNo` (Team Leader)**
//     const teamResult = await pool.query(
//       "SELECT team_id FROM teams WHERE reg_no = $1",
//       [regNo]
//     );

//     if (teamResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "❌ No team found for this user." });
//     }

//     const teamId = teamResult.rows[0].team_id;
//     const newFileName = `${teamId}${path.extname(pptFile.originalname)}`;
//     const filePath = path.join(uploadDir, newFileName);

//     // ✅ **Delete Old Submission (If Exists)**
//     const existingFile = await pool.query(
//       "SELECT ppt FROM projects WHERE team_id = $1",
//       [teamId]
//     );
//     if (existingFile.rows.length > 0) {
//       const oldFilePath = path.join(uploadDir, existingFile.rows[0].ppt);
//       if (fs.existsSync(oldFilePath)) {
//         fs.unlinkSync(oldFilePath);
//       }
//     }

//     // ✅ **Move New File & Save in DB**
//     fs.renameSync(pptFile.path, filePath);

//     await pool.query(
//       "INSERT INTO projects (team_id, project_name, description, ppt) VALUES ($1, $2, $3, $4) ON CONFLICT (team_id) DO UPDATE SET project_name = EXCLUDED.project_name, description = EXCLUDED.description, ppt = EXCLUDED.ppt",
//       [teamId, projectName, description, newFileName]
//     );

//     res.status(201).json({
//       message: "🎉 Project submitted successfully!",
//       projectName,
//       teamId,
//     });
//   } catch (error) {
//     console.error("❌ Error submitting project:", error);
//     res.status(500).json({ message: "❌ Server Error" });
//   }
// };

// // ✅ **Fetch Submitted Projects from `ideas` Table**
// export const fetchSubmittedProjects = async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM ideas");

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "❌ No submissions found." });
//     }

//     res.json(result.rows);
//   } catch (error) {
//     console.error("❌ Error fetching projects:", error);
//     res.status(500).json({ message: "❌ Server Error" });
//   }
// };
import pool from "./db.js";
import fs from "fs";
import path from "path";

// 📂 Ensure Upload Directory Exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ **Submit Project & Replace Old Submission**
export const submitProject = async (req, res) => {
   try {
     const { projectName, description, regNo } = req.body;
     const pptFile = req.file;

     if (!pptFile) {
        return res.status(400).json({ message: "❌ PPT/PDF file is required!" });
     }

     // 🔍 Fetch `team_id` from `teams` table using Leader's `regNo`
     const teamResult = await pool.query(
        "SELECT team_id FROM teams WHERE reg_no = $1",
        [regNo]
     );

     if (teamResult.rows.length === 0) {
        return res.status(400).json({ message: "❌ You are not a team leader!" });
     }

     const teamId = teamResult.rows[0].team_id;
     const fileExtension = path.extname(pptFile.originalname); // Get file extension (.ppt, .pdf, etc.)
     const newFileName = `${teamId}${fileExtension}`; // Save file with correct extension

     //const newFileName = `${teamId}.ppt`; // 📂 Save file as <team_id>.ppt

     // 🔍 Check if a project already exists for this team
     const checkProject = await pool.query(
        "SELECT ppt FROM projects WHERE team_id = $1",
        [teamId]
     );

     // 🗑 **Delete Old File (If Exists)**
     if (checkProject.rows.length > 0) {
        const oldFilePath = path.join(uploadDir, checkProject.rows[0].ppt);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
     }

     // 📂 **Move Uploaded File to `uploads/` Folder with New Name**
     const filePath = path.join(uploadDir, newFileName);
     fs.renameSync(pptFile.path, filePath);

     // ✅ **Insert/Update Project Submission**
    //  const result = await pool.query(
    //     `INSERT INTO projects (team_id, project_name, description, ppt) 
    //      VALUES ($1, $2, $3, $4) 
    //      ON CONFLICT (team_id) 
    //      DO UPDATE SET project_name = $2, description = $3, ppt = $4
    //      RETURNING *`,
         
    //     [teamId, projectName, description, newFileName]
    //  );
    const result = await pool.query(
      `INSERT INTO projects (team_id, project_name, description, ppt) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT ON CONSTRAINT unique_team 
       DO UPDATE SET project_name = EXCLUDED.project_name, 
                     description = EXCLUDED.description, 
                     ppt = EXCLUDED.ppt
       RETURNING *`,
      [teamId, projectName, description, newFileName]
  );
     res.status(201).json({
        message: "🎉 Project submitted successfully!",
        project: result.rows[0],
     });
   } catch (error) {
     console.error("❌ Error submitting project:", error);
     res.status(500).json({ message: "❌ Server Error" });
   }
};

// ✅ **Fetch Submitted Projects**
export const fetchSubmittedProjects = async (req, res) => {
   try {
     const result = await pool.query("SELECT * FROM projects");

     if (result.rows.length === 0) {
        return res.status(404).json({ message: "❌ No submissions found." });
     }

     res.json(result.rows);
   } catch (error) {
     console.error("❌ Error fetching projects:", error);
     res.status(500).json({ message: "❌ Server Error" });
   }
};
