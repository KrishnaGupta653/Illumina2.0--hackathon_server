import pool from "./db.js"; // ✅ Database connection
import { validateProfileInputs } from "./validateProfile.js";
// ✅ 1️⃣ Get email from `login` table (user logs in)
export const getUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const result = await pool.query(
      "SELECT email FROM login WHERE lower(email) = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ email: result.rows[0].email });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching email." });
  }
};
// ✅ 2️⃣ Check if profile exists in `profiles` table
export const checkProfile = async (req, res) => {
  try {
    const { email } = req.params;

    // ✅ Optimized query: Just check existence, don't fetch full data
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM profiles WHERE email = $1",
      [email]
    );
    console.log("📌 Query Result:", result.rows[0]);
    //const exists = parseInt(result.rows[0].count) > 0;
    const isComplete = result.rows[0].count > 0;
    return res.status(200).json({ isComplete });
    //return res.status(200).json({ isComplete: exists });
  } catch (error) {
    console.error("❌ Error checking profile:", error);
    return res.status(500).json({ message: "Server error checking profile." });
  }
};

// ✅ 3️⃣ Save Profile Data
export const saveProfile = async (req, res) => {
  try {
    console.log("🔹 Received Data:", req.body);

    let {
      email,
      firstName,
      lastName,
      gender,
      regNo,
      block,
      phone,
      roomNumber,
      github,
    } = req.body;

    email = email.toLowerCase(); // ✅ Convert to lowercase

    // ✅ Debug: Check if this email already exists
    console.log("🔍 Checking if profile already exists for:", email);

    const checkQuery =
      "SELECT COUNT(*) AS count FROM profiles WHERE lower(email) = $1";
    const checkResult = await pool.query(checkQuery, [email]);

    console.log("📌 Query Result (Count):", checkResult.rows[0].count); // ✅ Debugging

    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log("⚠️ Profile already exists for:", email);
      return res
        .status(400)
        .json({ message: "Duplicate entry: Profile already exists!" });
    }

    // ✅ Insert new profile
    const insertQuery = `
          INSERT INTO profiles (email, first_name, last_name, gender, reg_no, block, phone, room_number, github)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
    await pool.query(insertQuery, [
      email,
      firstName,
      lastName,
      gender,
      regNo,
      block,
      phone,
      roomNumber,
      github,
    ]);

    console.log("✅ Profile saved successfully for:", email);
    res.status(201).json({ message: "Profile saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving profile:", error);

    if (error.code === "23505") {
      // PostgreSQL unique constraint error
      return res
        .status(400)
        .json({ message: "Duplicate entry: Profile already exists!" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};
