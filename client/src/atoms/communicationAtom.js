// create a global  state to store conversations---there is problem in create a state in chat page component then send props in conversation
// component then from conversation component to message container------this is bad practice..thats why we do this----
import { atom } from "recoil";

export const conversationsAtom = atom({
    key: "conversationsAtom",
    default: [],
});

// this state is very usefull-----
// when we click on conversation we want that the conversation is shown on message container..where we actual start our chatting-------

// we need 4 things to chat with other
// 1. conversation id 2. jisse chat kr rha hu uski id 3. uska username 4. uski pic
export const selectedConversationAtom = atom({
    key: "selectedConversationAtom",
    default: {
        _id: "",
        userId: "",
        username: "",
        userProfilePic: "",
    },
});