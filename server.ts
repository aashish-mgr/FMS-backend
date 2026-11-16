import app from "./src/app";
import dotenv from 'dotenv'
dotenv.config();

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`app is listening on ${port}`);
});