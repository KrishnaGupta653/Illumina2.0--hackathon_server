import pool from "./db.js";
import { generateHashCode } from "./hashGenerator.js";

// ✅ Fetch regNo from profiles table using email
export const fetchRegNoFromProfile = async (req, res) => {
  const { email } = req.params;
  console.log("📥 Incoming request to fetch regNo for:", email);

  try {
    const result = await pool.query(
      "SELECT reg_no FROM profiles WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("❌ Profile not found for email:", email);
      return res
        .status(404)
        .json({ message: "❌ Profile not found for this email." });
    }

    console.log("✅ Found regNo:", result.rows[0].reg_no);
    res.json({ regNo: result.rows[0].reg_no });
  } catch (error) {
    console.error("❌ Database Error in fetchRegNoFromProfile:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
};

// ✅ Create Team (auto fetches regNo via email, inserts into teams + team_members)
export const createTeam = async (req, res) => {
  const { email, teamName } = req.body;
  console.log(
    "📥 Incoming request to create team for:",
    email,
    "with team name:",
    teamName
  );

  try {
    // 1️⃣ Fetch regNo & participant name from profiles
    const profileResult = await pool.query(
      "SELECT reg_no, first_name, last_name FROM profiles WHERE email = $1",
      [email]
    );

    if (profileResult.rows.length === 0) {
      return res.status(400).json({
        message: "❌ Profile not found. Please complete your profile first.",
      });
    }

    const { reg_no, first_name, last_name } = profileResult.rows[0];
    const participantName = `${first_name} ${last_name}`;
    console.log("✅ Fetched regNo:", reg_no, "for email:", email);

    // 2️⃣ Check if user is already in a team
    const memberCheck = await pool.query(
      "SELECT * FROM team_members WHERE reg_no = $1",
      [reg_no]
    );
    if (memberCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "❌ You are already part of a team." });
    }

    // 3️⃣ Check if team name already exists
    const teamCheck = await pool.query(
      "SELECT * FROM teams WHERE team_name = $1",
      [teamName]
    );
    if (teamCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "❌ Team name is already taken." });
    }

    // 4️⃣ Generate 8-digit team hash code
    const teamHash = generateHashCode();

    // 5️⃣ Insert into teams table
    const teamInsert = await pool.query(
      `INSERT INTO teams (team_name, reg_no, team_hash, is_frozen) 
             VALUES ($1, $2, $3, false) RETURNING team_id`,
      [teamName, reg_no, teamHash]
    );
    const teamId = teamInsert.rows[0].team_id;
    console.log("✅ Team created with ID:", teamId);

    // 6️⃣ Insert into team_members table (leader entry)
    await pool.query(
      `INSERT INTO team_members (team_id, reg_no, participant_name, team_name) 
             VALUES ($1, $2, $3, $4)`,
      [teamId, reg_no, participantName, teamName]
    );

    res.status(201).json({
      message: "✅ Team created successfully!",
      teamId,
      teamCode: teamHash,
    });
  } catch (error) {
    console.error("❌ Error in createTeam:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
};

// ✅ Check if user is already in a team (for CreateTeam page load)
export const checkIfUserInTeam = async (req, res) => {
  const { regNo } = req.params;
  console.log("📥 Checking if user with regNo exists in a team:", regNo);

  try {
    const member = await pool.query(
      "SELECT team_id FROM team_members WHERE reg_no = $1",
      [regNo]
    );

    if (member.rows.length > 0) {
      const team = await pool.query(
        "SELECT team_hash FROM teams WHERE team_id = $1",
        [member.rows[0].team_id]
      );
      return res.json({
        inTeam: true,
        teamId: member.rows[0].team_id,
        teamCode: team.rows[0].team_hash,
      });
    }

    res.json({ inTeam: false });
  } catch (error) {
    console.error("❌ Error in checkIfUserInTeam:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
};
export const getTeamDetails = async (req, res) => {
  try {
    const { regNo } = req.query;
    if (!regNo) {
      return res
        .status(400)
        .json({ message: "❌ Registration number is required." });
    }
    const memberResult = await pool.query(
      "SELECT team_id FROM team_members WHERE reg_no = $1",
      [regNo]
    );

    if (memberResult.rows.length === 0) {
      // Not in team
      console.log("❌ User is not in any team.");
      return res.json({ inTeam: false });
    }

    const teamId = memberResult.rows[0].team_id;

    const teamResult = await pool.query(
      "SELECT team_name, team_hash,reg_no, is_frozen, idea_domain, idea_topic FROM teams WHERE team_id = $1",
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return res.json({ inTeam: false }); // Safety fallback
    }

    const { team_name, team_hash, reg_no, is_frozen, idea_domain, idea_topic } =
      teamResult.rows[0];
    res.json({
      inTeam: true,
      teamId: teamId,
      teamName: team_name,
      teamCode: team_hash,
      teamLeaderRegNo: reg_no, // ✅ Add this to response
      isFrozen: is_frozen, // ✅ Add this to response
      assignedIdea: idea_domain
        ? { domain: idea_domain, selectedTopic: idea_topic }
        : null, // ✅ Return assigned idea if exists
    });
  } catch (error) {
    console.error("❌ Error fetching team details:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
};

export const joinTeam = async (req, res) => {
  console.log("🔗 Incoming Join Request:", req.body);

  const { regNo, hashCode } = req.body;
  console.log("📥 Incoming Join Request:", { regNo, hashCode });

  try {
    // 1️⃣ Fetch team by hash code & check if frozen
    const teamQuery = await pool.query(
      "SELECT team_id, team_name, is_frozen FROM teams WHERE team_hash = $1",
      [hashCode.trim()] // Handle accidental spaces
    );

    if (teamQuery.rows.length === 0) {
      return res.status(400).json({ message: "❌ Invalid Team Hash Code." });
    }

    const { team_id, team_name, is_frozen } = teamQuery.rows[0];

    // 2️⃣ Reject if team is frozen
    if (is_frozen) {
      console.log("🚫 Team is frozen. Cannot join.");
      return res.status(400).json({
        message: "❌ Team is already frozen. No new members can join.",
      });
    }
    // ✅ Check current team size
    const memberCountResult = await pool.query(
      "SELECT COUNT(*) FROM team_members WHERE team_id = $1",
      [team_id]
    );
    const currentMemberCount = parseInt(memberCountResult.rows[0].count, 10);

    if (currentMemberCount >= 5) {
      return res
        .status(400)
        .json({ message: "❌ Team is already full (Max 5 members)." });
    }

    // 3️⃣ Check if user is already part of some team
    const memberCheck = await pool.query(
      "SELECT * FROM team_members WHERE reg_no = $1",
      [regNo]
    );
    if (memberCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "❌ You are already part of a team." });
    }

    // 4️⃣ Fetch participant name from profiles
    const profileQuery = await pool.query(
      "SELECT first_name, last_name FROM profiles WHERE reg_no = $1",
      [regNo]
    );
    if (profileQuery.rows.length === 0) {
      return res.status(400).json({
        message: "❌ Profile not found. Please complete your profile first.",
      });
    }

    const { first_name, last_name } = profileQuery.rows[0];
    const participantName = `${first_name} ${last_name}`;

    // 5️⃣ Add member to team
    await pool.query(
      "INSERT INTO team_members (team_id, reg_no, participant_name, team_name) VALUES ($1, $2, $3, $4)",
      [team_id, regNo, participantName, team_name]
    );

    res.json({ message: "✅ Successfully joined the team!" });
  } catch (error) {
    console.error("❌ Error joining team:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
};

// export const freezeTeam = async (req, res) => {
//   const { teamId } = req.body;

//   try {

//     const result = await pool.query(
//       "UPDATE teams SET is_frozen = true WHERE team_id = $1",
//       [teamId]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "❌ Team not found." });
//     }

//     res.json({ message: "✅ Team frozen successfully!" });
//   } catch (error) {
//     console.error("❌ Error freezing team:", error);
//     res.status(500).json({ message: "❌ Server Error" });
//   }
// };

export const freezeTeam = async (req, res) => {
  const { teamId } = req.body;

  try {
    // ✅ Check current team size
    const memberCountResult = await pool.query(
      "SELECT COUNT(*) FROM team_members WHERE team_id = $1",
      [teamId]
    );
    const currentMemberCount = parseInt(memberCountResult.rows[0].count, 10);

    if (currentMemberCount < 3) {
      return res.status(400).json({
        message: "❌ At least 3 members are required to freeze the team.",
      });
    }

    await pool.query("UPDATE teams SET is_frozen = true WHERE team_id = $1", [
      teamId,
    ]);

    res.json({ message: "✅ Team frozen successfully!" });
  } catch (error) {
    console.error("❌ Error freezing team:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
};
export const leaveTeam = async (req, res) => {
  const { regNo } = req.body;

  try {
      // Fetch team details for this member
      const teamResult = await pool.query(
          "SELECT team_id FROM team_members WHERE reg_no = $1",
          [regNo]
      );

      if (teamResult.rows.length === 0) {
          return res.status(400).json({ message: "❌ You are not in any team!" });
      }

      const teamId = teamResult.rows[0].team_id;

      // Check if the user is the team leader
      const leaderCheck = await pool.query(
          "SELECT reg_no FROM teams WHERE team_id = $1",
          [teamId]
      );

      if (leaderCheck.rows.length > 0 && leaderCheck.rows[0].reg_no === regNo) {
          return res.status(403).json({ message: "❌ Team leader cannot leave the team!" });
      }

      // Remove the user from team_members
      await pool.query(
          "DELETE FROM team_members WHERE reg_no = $1",
          [regNo]
      );

      res.json({ message: "✅ Successfully left the team!" });
  } catch (error) {
      console.error("❌ Error leaving team:", error);
      res.status(500).json({ message: "❌ Server Error" });
  }
};

