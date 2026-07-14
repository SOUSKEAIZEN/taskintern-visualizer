import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiRoutes from "./routes/api";

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(bodyParser.json());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`[Judge API] Server is running on port ${PORT}`);
});
