import dotenv from "dotenv";
import express from  "express"
import cors from "cors"
import {createServer} from "http";

dotenv.config();
const app = express();
app.use(cors());
const httpServer = createServer(app);


const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});

