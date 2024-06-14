// for real time chat we can use dff things like websocket, socket.io and many more-----
// if we talk aboult websocket ..it is not optimized and not very useful as compared to socket.io

//socket.io allowed me to send/emit messages by specifying an event name.
//In the case of socket.io a message from server will reach on all clients,
//in websockets I was forced to keep an array of all connections and loop through it to send messages to all clients.


import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/communicationModel.js";
import Message from "../models/messageModel.js";

const app = express();
const server = http.createServer(app);   // first create a http socket server---

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",// Allow requests from the frontend origin
        methods: ["GET", "POST"],
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    },
});

// now i want reciever get the message at instance(means when i click on send it immediatly update on reciever and as well as my side)
// for this we required sender socket id----
export const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId];  // we pass userid in hashmap to get their socket id-----
};


// we nee to store user id  in a server to detect which one is online----

// create hashmap...userid mapped with his socket id------
const userSocketMap = {}; // userId: socketId  // store user id------to identify which user is online or which one is not--

//io.on is used to cretate connection---------
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);// on each and every login (if the user is same also) the socket id is differnet generated..for every connection

    // to get user id..we sending as a query from our client/// then we are going to get this user id in context in frontend---

    const userId = socket.handshake.query.userId;

    // if user is not undefined then store this in hashmap-----
    if (userId !== "undefined") userSocketMap[userId] = socket.id;

    //io.emit is used to send event to every user----...here we inform to client that user is online-----
    // getonlineuser is name of event---
    /// we neeed to pass an array of user id...so to convert hashmap int an array we use object.keys--by this we are going to put the keys in the array
    // so array looks like this [1,2,3,4,5]
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // to listen a event for both client and server we use socket.on---
    // here we listen markmessage seen event from the reciever--
    // so ro this wee require conversation id and userid (reciever id)

    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            // in message model update all stuffs whose conversation id is matched with..and update seen = true
            // find all cmessages that mactches the conversation id-----
            await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
            // in communication model..we just only update one thing that is seen = true;;
            await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });
            // Now send event to a single user by using his socketid 
            io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
            // now sice u r sending this eveent now listen at client-------- in message container page-------
        } catch (error) {
            console.log(error);
        }
    });

    // handle disconnection-----------
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        // after diconnection or user logout delete userid from the hashmap----
        if (userId !== "undefined") delete userSocketMap[userId];
        // and again send new event by using emit----------------------
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("connect_error", (err) => {
        console.error(`Connection error: ${err.message}`);
    });
});

export { io, server, app };
