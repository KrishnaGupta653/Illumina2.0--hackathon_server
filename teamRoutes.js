// // import express from "express";
// // import {
// //     createTeam,
// //     joinTeam,
// //     getTeamMembers,
// //     freezeTeam
// // } from "./teamController.js";

// // const router = express.Router();

// // router.post("/team", createTeam); // Create Team
// // router.post("/team/join", joinTeam); // Join Team
// // router.get("/team/members", getTeamMembers); // Fetch Team Members
// // router.post("/team/freeze", freezeTeam); // Freeze Team

// // export default router;

// import express from "express";
// import { createTeam, joinTeam, freezeTeam, getTeamMembers, checkIfLeader } from "./teamController.js";

// const router = express.Router();

// // ✅ Create a new team
// router.post("/team", createTeam);

// // ✅ Join a team
// router.post("/team/join", joinTeam);

// // ✅ Freeze a team
// router.post("/team/freeze", freezeTeam);

// // ✅ Get team members
// router.get("/team/members", getTeamMembers);

// // ✅ Check if user is team leader
// router.get("/team/check-leader", checkIfLeader);

// export default router;

// import express from "express";
// import { createTeam, joinTeam, getTeamMembers, freezeTeam } from "./teamController.js";

// const router = express.Router();

// router.post("/team", createTeam);
// router.post("/team/join", joinTeam);
// router.get("/team/members", getTeamMembers);
// router.post("/team/freeze", freezeTeam);
// //router.get("/team/check-user/:regNo", checkIfUserInTeam);

// export default router;

// import express from "express";
// import { createTeam, joinTeam, freezeTeam } from "./teamController.js";

// const router = express.Router();

// router.post("/create", createTeam);
// router.post("/join", joinTeam);
// router.post("/freeze", freezeTeam);

// export default router;

import express from "express";
import pool from "./db.js";

import {
  createTeam,
  fetchRegNoFromProfile,
  getTeamDetails,
  joinTeam,
  freezeTeam,
  leaveTeam
} from "./teamController.js";

const router = express.Router();

router.get("/fetch-regno/:email", fetchRegNoFromProfile);
router.post("/create", createTeam);
router.get("/details", getTeamDetails);
router.post("/join", joinTeam);
router.post("/freeze", freezeTeam);
router.post("/leave-team", leaveTeam);


router.get("/members/:teamId", async (req, res) => {
  const { teamId } = req.params;

  try {
    const result = await pool.query(
      "SELECT reg_no, participant_name FROM team_members WHERE team_id = $1",
      [teamId]
    );
    res.json({ members: result.rows });
  } catch (error) {
    console.error("❌ Error fetching team members:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
});

export default router;
