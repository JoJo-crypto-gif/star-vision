// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";

dotenv.config();
console.log("🔑 Loaded ENV:", {
  url: process.env.SUPABASE_URL,
  anon: !!process.env.SUPABASE_ANON_KEY,
  service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URL
  credentials: true
}));
app.use(express.json());

// connect to supabase
// Use the SUPABASE_ANON_KEY for all user-facing operations.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.send("Eye Clinic Backend is running 🚀");
});

// pass supabase into user routes
app.use("/users", userRoutes(supabase, supabaseAdmin));
app.use("/patients", patientRoutes(supabase, supabaseAdmin));

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});