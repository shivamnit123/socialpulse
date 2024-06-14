import path from "path";  // this is inbuilt node module-----
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import ConnectDB from "./db/ConnectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoute.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoute.js";
import { app, server } from "./socket/socket.js";

// we already create app in sockket.js------so need for this=---
///const app = express();


ConnectDB();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



// console.log(PORT);
// understand middleware---it is a function that works bet req and res
app.use(express.json({ limit: '10mb' }));// it parse req data to json format

app.use(express.urlencoded({ extended: true, limit: '10mb' }))  // it parse encoded data which is present in url and convert it into json //parse form data

app.use(cookieParser()); // get the cookie from request and set cookie inside reponse

// routes-------------

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/messages", messageRoutes);

// lets disuss--  for frontend url : local host 3000 and for backend : local host 4000---
// for production  i want i run frontend and backen in locl host 4000 url..so that no cors error happen----and we esasily deployy
//lets see how is this possible---


const port = 4000;
//const port = 4000;
//console.log(process.env.PORT);
const __dirname = path.resolve();
//server static assets only if in production----

// if u write in terminal npm start it goes for production----
if (process.env.NODE_ENV.trim() === "production") {
    app.use(express.static(path.join(__dirname, "/client/dist")));

    // react app
    app.get("*", (req, res) => {  // here * means wheenever we hit other than above given 3 routes..so we will like to serve our react application---
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    });
}


// instead of app.listen we will just listen our http server that we created---------
server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})
// now we able to handle http request and socket related thing------