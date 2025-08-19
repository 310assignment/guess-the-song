//entry point for the Express server
// This file sets up the server, handles routes, and integrates with the Spotify API client

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import kpopRoutes from "./routes/kpopRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// K-Pop endpoints
app.use("/api/kpop", kpopRoutes);

// tiny error handler
app.use((err, _req, res, _next) => {
  const status = err?.response?.status || 502;
  const msg =
    err?.response?.data?.error?.message || err?.message || "Upstream error";
  res.status(status).json({ error: msg });
});

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
