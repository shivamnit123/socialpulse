//  lets discuss first  what is the needs for this model----and also what are the requirements for this model---

//1.
// we know converation is happen b/w 2 people one is sender and other is reciever--
// so both are logged in user...
// so we easily get both sender and reciver user id from user model

//2.
// when converssation is happen there is converation id......

//3.
//we have last message for each conversations-----which is an object that contain text and sender id---


import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        lastMessage: {
            text: String,
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
        seen: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// Note the model name here
const Conversation = mongoose.model("Communication", communicationSchema);

export default Conversation;
