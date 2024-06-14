import Conversation from "../models/communicationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

// to get all the mesaages b/w two user -----
// we need other user id that comes from req url..

async function getMessages(req, res) {
    const { otherUserId } = req.params; // fetch userid using params------
    const userId = req.user._id;       // fetch curr user id from req body----
    try {
        const conversation = await Conversation.findOne({    // now find conversations b/w this 2 user-----b/w me and other
            participants: { $all: [userId, otherUserId] },
        });

        // if conversation is not exist b/w us...then simpl return-----

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        //find mesaaage in message model-----
        // since if u got all the mesage---the sort so that u get oldest meszage at the top and newest at the bottom

        const messages = await Message.find({
            conversationId: conversation._id,
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// if u want to get all conversations of a particular user---------------------

// to fetch all conversation we find in communication model---in this find we just want that find all conversation of this user id inside that participant

async function getConversations(req, res) {
    const userId = req.user._id;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username profilePic",
        });

        // Filter out the current user from each conversation's participants array

        // remove the current user from the participants array...ye hum esliye kr rhe hai..
        //jb your message me list aati hai to mere sare dost ke message 
        const filteredConversations = conversations.map((conversation) => {
            const otherParticipants = conversation.participants.filter(
                (participant) => participant._id.toString() !== userId.toString()
            );
            return {
                ...conversation.toObject(), // Ensure conversion to plain JS object
                participants: otherParticipants,
            };
        });

        res.status(200).json(filteredConversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// we want to send mesage to reciever ----
async function sendMessage(req, res) {
    try {
        const { recipientId, message } = req.body;   // it comes from client
        let { img } = req.body;
        const senderId = req.user._id;   // we are the sender..

        // first check if conversation is already exist--  we know in communication model we have partocipants in which two ids sender and reciever
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },   //b/w us and reciever----
        });

        // if this conversation is not exist then create new conversation-------so there are 2 fields 1st is participants and last mesage
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            });
            await conversation.save();   // now save this conversation---
        }
        // handle image----

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;  // it provides cloudinary img url--------
        }



        // now create data base-------
        //we have 3  things in communication model conversation id ,sender id and text(coming from client)
        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message,
            img: img || "",

        });

        await Promise.all([      // update last conversation message  from the previous one-----
            newMessage.save(),   //jaise hum whatsapp kholte hai aur last mesage dikhta hai sbhi ke chats ka------
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            }),
        ]);

        // fetch reciever socket id which we create in socket.js------
        //  here we are going to get recipient socket id
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage); // io.to is a method which is used to send event to a single user----
        }   // it takes socket user id as a paramater---------

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { sendMessage, getMessages, getConversations };