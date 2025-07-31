import pgPool from "./db.js";
import { validateProfileInputs } from "./validateProfile.js"; // ✅ Import validation function

// ✅ Fetch Profile by Email
export const getProfile = async (req, res) => {
    const { email } = req.params;

    try {
        console.log("🔍 Searching for profile:", email);
        const result = await pgPool.query("SELECT * FROM profiles WHERE email = $1", [email]);

        console.log("🛠 Query Result:", result.rows);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.json(result.rows[0]); // ✅ Return profile data
    } catch (error) {
        console.error("❌ Database Query Error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

// ✅ Update Profile by Email (Handle Multiple Errors)
export const updateProfile = async (req, res) => {
    const { email } = req.params;
    const { firstName, lastName, gender, regNo, block, phone, roomNumber, github } = req.body;

    try {
        console.log("📩 Received Update Request for:", email);
        console.log("📨 Data Received:", req.body);

        // ✅ Validate Inputs (Check all errors at once)
        const errors = validateProfileInputs(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors }); // Send ALL validation errors
        }

        // ✅ Check if user exists
        const userExists = await pgPool.query("SELECT * FROM profiles WHERE email = $1", [email]);
        if (userExists.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log("✅ Profile exists, proceeding to update...");

        // ✅ Update Query
        const updateResult = await pgPool.query(
            `UPDATE profiles 
             SET first_name=$1, last_name=$2, gender=$3, reg_no=$4, block=$5, phone=$6, room_number=$7, github=$8 
             WHERE email=$9 RETURNING *`,
            [firstName, lastName, gender, regNo, block, phone, roomNumber, github, email]
        );

        console.log("🛠 Update Query Result:", updateResult.rows);

        if (updateResult.rowCount === 0) {
            return res.status(400).json({ error: "Failed to update profile." });
        }

        res.json({ message: "Profile updated successfully!", updatedProfile: updateResult.rows[0] });

    } catch (error) {
        console.error("❌ Database Query Error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};
