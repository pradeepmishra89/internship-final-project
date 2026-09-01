import express from "express"
import cors from "cors";
import { router } from "./backend/routes/UserRouter.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.get("/", (req, res) => {
    res.send("Backend is running successfully");
});
app.use('/api',router)


app.use(express.json());


const port = process.env.PORT || 3000;


app.listen(port, () => console.log(`Server is running on ${port}`));