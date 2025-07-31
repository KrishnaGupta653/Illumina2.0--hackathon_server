// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import profileRoutes from "./profileRoutes.js";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// //  Profile API Routes
// app.use('/api/team', teamRoutes);
// app.use("/api", profileRoutes);

// const PORT = process.env.PORT || 8001;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import pgClient from "./db.js"; // Database connection
// import profileRoutes from "./profileRoutes.js"; // Profile Routes
// import teamRoutes from "./teamRoutes.js"; // Team Routes

// dotenv.config();
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json()); // Enable JSON parsing

// // Routes
// app.use("/api", profileRoutes);
// app.use("/api/team", teamRoutes);

// // Handle invalid routes
// app.use((req, res) => {
//     res.status(404).json({ error: "Route Not Found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//     console.error("❌ Server Error:", err);
//     res.status(500).json({ error: "Internal Server Error", details: err.message });
// });

// // Start the server
// const PORT = process.env.PORT || 8001;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db.js";
import teamRoutes from "./teamRoutes.js";
import profileRoutes from "./profileRoutes.js";
import fillProfileRoutes from "./fillProfileRoutes.js";
import ideaRoutes from "./ideaRoutes.js"; // ✅ Make sure this is correctly imported
import projectRoutes from "./projectRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Register API Routes
app.use("/api/team", teamRoutes);
app.use("/api", profileRoutes);
app.use("/api", fillProfileRoutes);
app.use("/api/idea", ideaRoutes); // ✅ Ensure this is included
app.use("/api", projectRoutes);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
