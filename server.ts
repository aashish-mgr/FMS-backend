import app from "./src/app";
import dotenv from 'dotenv'
import {connectDb} from "./src/config/database"
dotenv.config();

const port = Number(process.env.PORT) || 3000;
const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
  console.log(`app is listening on ${port}`);
});
}

startServer();

