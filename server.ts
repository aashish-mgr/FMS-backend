import app from "./src/app";
import dotenv from 'dotenv'
dotenv.config();

app.listen(3000,() => {
    console.log("app is listening on 3000 port");
})