import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import Message from "./Message";
import MessageInput from "../components/MessageInput";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { conversationsAtom, selectedConversationAtom } from "../atoms/communicationAtom";
import useShowToast from "../hooks/useShowToast";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/Context";
import Bell from "../assets/notification/frontend_src_assets_sounds_message.mp3";
import { useNavigate } from "react-router-dom";
const MessageContainer = () => {
    const navigate = useNavigate();
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);  // here no need for global state to store message of 2 users so thats why we use usestate simply
    const currentUser = useRecoilValue(userAtom);       // fetch the current user from atom-----
    const setConversations = useSetRecoilState(conversationsAtom);
    const { socket } = useSocket();
    const messageEndRef = useRef(null);  // create a scrollmessagRef intailly null..but when sender send latest message it bind with that messsage and automatically scroll with the message

    // in order to listen an event we use socket.on both for client and server----------------
    useEffect(() => {
        socket.on("newMessage", (message) => {  //once u get the messaeg set the message with the previous one----
            // yha pr ek bug tha usi ke karan ye condition lagana pada
            // and bug is..when i want to send a message to tillu and in my message container booms chat is open so when i send a message this 
            // message is practiclly going to boom ..but it goes to tillu..so for this bug---we check this condition
            if (selectedConversation._id === message.conversationId) {
                setMessages((prev) => [...prev, message]);
            }

            // make notification sound if window is not focused-----
            if (!document.hasFocus()) {  // agar tum us samay vo tab open kr rkhe ho jis pr tum baat kr rhe ho dusro se tb bell nhi bajega
                const sound = new Audio(Bell);
                sound.play();
            }


            // update this last message to the recievr side--
            //problem ye aa rhi thi..when sender send the message rciever side message is shown on only message congtainer..not shown in your chat--
            setConversations((prev) => {
                // for each prev conversation we are going to check if conversatio id and conversation id of message we got from sender is equal
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,  // retur an object with conversation and spread conversation and update the last message---
                            lastMessage: {
                                text: message.text,
                                sender: message.sender,
                            },
                        };
                    }
                    // if it is not equal simply return----
                    return conversation;
                });
                return updatedConversations;
            });
        });
        // once the component is unmount we will remove that listener to this new message event----
        return () => socket.off("newMessage");
    }, [socket, selectedConversation, setConversations]);

    // now handle message seen event on frontend------
    // extract last message from the message 

    useEffect(() => {
        const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id; // check last message from sender (by using sender id) is not equal to current user id--
        if (lastMessageIsFromOtherUser) {  // if it is true then-
            socket.emit("markMessagesAsSeen", {    // send an event to to server---here we pass another object and in this--
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId,  // userid that we are chatting with him (reciever id)
            });
        } // after sending this event to server ..let listen on socket server------

        // after listen messageseeen event from server--check selected conversation id and conversation id that comes from server is equal or not
        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation._id === conversationId) {
                // if it is equal then update the message with the previous one
                setMessages((prev) => { //map it for each message..check is message is not seen previously then update it-----
                    const updatedMessages = prev.map((message) => {
                        if (!message.seen) {  //prev is nothing but just a state--
                            return {
                                ...message, // feetch the message
                                seen: true,   // update seen
                            };
                        }
                        return message;
                    });
                    return updatedMessages;
                });
            }
        });
    }, [socket, currentUser._id, messages, selectedConversation]);  //dependency array----


    // get all the messages b/w 2 user---------
    //here we need conversation id of other user ..so to get this when we select any conversation ...by this selection we get conversation id of that user----
    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true);
            setMessages([]);   // starting me message container empty dikhega----- 
            try {
                if (selectedConversation.mock) return;  // check first if this is mock conversation(means abhi tk ek baar bhi es user se baat nhi hui)
                const res = await fetch(`/api/messages/${selectedConversation.userId}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setMessages(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingMessages(false);
            }
        };

        getMessages();
    }, [showToast, selectedConversation.userId]);  // warning na de esliye -----

    // handling automaticalyy scroll behaviour..when sender send message the last message bind with refefrence and move smoothyly
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <Flex
            flex='70'
            bg={useColorModeValue("gray.200", "gray.dark")}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
        >
            {/* Message header---reciever profilepic and his username will show on header */}

            <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
                <Text display={"flex"} alignItems={"center"} onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${selectedConversation.username}`);
                }}>
                    {selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} />
                </Text>
            </Flex>

            <Divider />

            <Flex flexDir={"column"} gap={4} my={4} p={2} height={"400px"} overflowY={"auto"}>

                {loadingMessages &&
                    [...Array(5)].map((_, i) => (   // jb tk load ho rha hai tb tk loading skeleton show hoga------
                        <Flex
                            key={i}
                            gap={2}
                            alignItems={"center"}
                            p={1}
                            borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={7} />}
                            <Flex flexDir={"column"} gap={2}>
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                            </Flex>
                            {i % 2 !== 0 && <SkeletonCircle size={7} />}
                        </Flex>
                    ))}


                {!loadingMessages &&   // when loading is false----then message will show
                    messages.map((message) => (
                        <Flex                           // for message component we pass 2 tings first is key and 2nd is own message---
                            key={message._id}
                            direction={"column"}    // here own message is decide on the basis of if current user is equal to 
                            // it checks if message is the last message in container...then it call messageendref 
                            ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}
                        >
                            <Message message={message} ownMessage={currentUser._id === message.sender} />
                        </Flex>                  // by using this own message we decide our message is flex end and reciever message is flex start---
                    ))}
            </Flex>
            {/*send setMessage as a prop so that from message input when we got message we print here*/}
            <MessageInput setMessages={setMessages} />
        </Flex>
    );
};

export default MessageContainer;