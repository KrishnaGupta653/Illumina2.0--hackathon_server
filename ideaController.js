// import pool from "./db.js";

// // 📌 List of Domains with Topics
// const ideaDomains = {
//   FinTech: [
//     "AI Fraud Detection",
//     "Crypto Payment Gateway",
//     "Automated Loan Approval",
//   ],
//   EdTech: [
//     "AI Tutoring System",
//     "Personalized Learning Path",
//     "Smart Exam Proctoring",
//   ],
//   HealthTech: [
//     "AI Disease Prediction",
//     "Wearable Health Monitoring",
//     "Telemedicine AI",
//   ],
//   AgriTech: [
//     "Smart Irrigation",
//     "AI Crop Disease Detection",
//     "Blockchain Supply Chain",
//   ],
//   CyberSecurity: [
//     "AI Phishing Detection",
//     "Passwordless Authentication",
//     "Zero Trust Security",
//   ],
//   RetailTech: [
//     "AI Product Recommendation",
//     "Smart Checkout System",
//     "Automated Inventory",
//   ],
//   TransportTech: [
//     "Smart Traffic Management",
//     "Autonomous Vehicle AI",
//     "Route Optimization",
//   ],
//   "AI & ML": [
//     "AI Music Generation",
//     "Deepfake Detection",
//     "AI Personal Assistant",
//   ],
//   MedTech: [
//     "AI Drug Discovery",
//     "AI Surgery Assistant",
//     "Patient Data Security",
//   ],
//   Environment: [
//     "AI for Climate Change",
//     "Smart Water Conservation",
//     "AI for Disaster Prediction",
//   ],
// };

// // export const getRandomIdea = (req, res) => {
// //     try {
// //         const domains = Object.keys(ideaDomains);
// //         const randomDomain = domains[Math.floor(Math.random() * domains.length)];
// //         res.json({ domain: randomDomain, topics: ideaDomains[randomDomain] });
// //     } catch (error) {
// //         res.status(500).json({ error: "Server Error" });
// //     }
// // };

// // export const setTeamIdea = async (req, res) => {
// //     const { teamId, ideaDomain, ideaTopic } = req.body;
// //     console.log("🔹 Received request:", { teamId, ideaDomain, ideaTopic });

// //     try {
// //         const teamCheck = await pool.query("SELECT * FROM teams WHERE team_id = $1", [teamId]);
// //         if (teamCheck.rowCount === 0) {
// //             return res.status(404).json({ message: "Team not found." });
// //         }

// //         if (teamCheck.rows[0].idea_topic) {
// //             return res.status(400).json({ message: "❌ Idea already assigned! You cannot change it." });
// //         }
// //         await pool.query(
// //             "UPDATE teams SET  idea_domain = $1, idea_topic = $2 WHERE team_id = $3 RETURNING *",
// //             [ ideaDomain, ideaTopic, teamId]
// //         );

// //         res.json({ message: "Idea assigned successfully!" });
// //     } catch (error) {
// //         console.error("❌ Database Error:", error);
// //         res.status(500).json({ message: "Failed to save idea." });
// //     }
// // };

// export const getRandomIdea = async (req, res) => {
//     try {
//         const { teamId } = req.query;

//         if (!teamId) {
//             return res.status(400).json({ message: "Team ID is required" });
//         }

//         // ✅ Check if the team already has an assigned idea_domain
//         const existingIdea = await pool.query("SELECT idea_domain FROM teams WHERE team_id = $1", [teamId]);

//         if (existingIdea.rows.length > 0 && existingIdea.rows[0].idea_domain) {
//             // ✅ If the idea_domain already exists, return it
//             return res.json({ domain: existingIdea.rows[0].idea_domain, topics: ideaDomains[existingIdea.rows[0].idea_domain] });
//         }

//         // ❌ Otherwise, generate a new idea domain
//         const domains = Object.keys(ideaDomains);
//         const randomDomain = domains[Math.floor(Math.random() * domains.length)];

//         // ✅ Ensure the team exists before updating
//         const teamCheck = await pool.query("SELECT team_id FROM teams WHERE team_id = $1", [teamId]);
//         if (teamCheck.rowCount === 0) {
//             return res.status(404).json({ message: "Team not found" });
//         }

//         // ✅ Save idea_domain in the teams table
//         await pool.query("UPDATE teams SET idea_domain = $1 WHERE team_id = $2", [randomDomain, teamId]);

//         res.json({ domain: randomDomain, topics: ideaDomains[randomDomain] });
//     } catch (error) {
//         console.error("❌ Error fetching idea:", error);
//         res.status(500).json({ message: "❌ Server Error" });
//     }
// };


// export const setTeamIdea = async (req, res) => {
//   const { teamId, ideaTopic } = req.body;
//   console.log("🔹 Received request:", { teamId, ideaTopic });

//   try {
//     const teamCheck = await pool.query(
//       "SELECT idea_domain, idea_topic FROM teams WHERE team_id = $1",
//       [teamId]
//     );

//     if (teamCheck.rowCount === 0) {
//       return res.status(404).json({ message: "❌ Team not found." });
//     }

//     if (!teamCheck.rows[0].idea_domain) {
//       return res
//         .status(400)
//         .json({ message: "❌ Idea domain not assigned yet!" });
//     }

//     if (teamCheck.rows[0].idea_topic) {
//       return res
//         .status(400)
//         .json({
//           message: "❌ Idea topic already assigned! You cannot change it.",
//         });
//     }

//     // 📝 Update only the idea topic, keeping the domain fixed
//     await pool.query(
//       "UPDATE teams SET idea_topic = $1 WHERE team_id = $2 RETURNING *",
//       [ideaTopic, teamId]
//     );

//     res.json({ message: "✅ Idea topic assigned successfully!" });
//   } catch (error) {
//     console.error("❌ Database Error:", error);
//     res.status(500).json({ message: "Failed to save idea." });
//   }
// };

import pool from "./db.js";

// 📌 List of Domains with Topics
const ideaDomains = {
    "FinTech": ["AI Fraud Detection", "Crypto Payment Gateway", "Automated Loan Approval"],
    "EdTech": ["AI Tutoring System", "Personalized Learning Path", "Smart Exam Proctoring"],
    "HealthTech": ["AI Disease Prediction", "Wearable Health Monitoring", "Telemedicine AI"],
    "AgriTech": ["Smart Irrigation", "AI Crop Disease Detection", "Blockchain Supply Chain"],
    "CyberSecurity": ["AI Phishing Detection", "Passwordless Authentication", "Zero Trust Security"],
    "RetailTech": ["AI Product Recommendation", "Smart Checkout System", "Automated Inventory"],
    "TransportTech": ["Smart Traffic Management", "Autonomous Vehicle AI", "Route Optimization"],
    "AI & ML": ["AI Music Generation", "Deepfake Detection", "AI Personal Assistant"],
    "MedTech": ["AI Drug Discovery", "AI Surgery Assistant", "Patient Data Security"],
    "Environment": ["AI for Climate Change", "Smart Water Conservation", "AI for Disaster Prediction"]
};

export const getRandomIdea = (req, res) => {
    try {
        const domains = Object.keys(ideaDomains);
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        res.json({ domain: randomDomain, topics: ideaDomains[randomDomain] });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const setTeamIdea = async (req, res) => {
    const { teamId, ideaDomain, ideaTopic } = req.body;
    console.log("🔹 Received request:", { teamId, ideaDomain, ideaTopic });

    try {
        const teamCheck = await pool.query("SELECT * FROM teams WHERE team_id = $1", [teamId]);
        if (teamCheck.rowCount === 0) {
            return res.status(404).json({ message: "Team not found." });
        }
        if (teamCheck.rows[0].idea_topic) {
            return res.status(400).json({ message: "❌ Idea already assigned! You cannot change it." });
        }
        await pool.query(
            "UPDATE teams SET  idea_domain = $1, idea_topic = $2 WHERE team_id = $3 RETURNING *",
            [ ideaDomain, ideaTopic, teamId]
        );

        res.json({ message: "Idea assigned successfully!" });
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ message: "Failed to save idea." });
    }
};
