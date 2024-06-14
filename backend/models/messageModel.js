//  lets discuss first  what is the needs for this model----and also what are the requirements for this model---

// for each mesaage----
// 1.
// we require conversation id which comes from communication model----

//2.sender id---

//3.
// text ---
// conversation id ki need esliye padi..man lo 2 frnd bahut din  baad baat kiye..to unki previous conversation jo hui thi vo khi store rhegi unki
// conversation id ke naam se----

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Communication" },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        seen: {
            type: Boolean,
            default: false
        },
        img: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;


