import { SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import MessageContainer from "../components/MessageContainer";
import useShowToast from "../hooks/useShowToast";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/communicationAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/Context";
import AnimatedImage from "../components/AnimatedImage";

const ChatPage = () => {
    const showToast = useShowToast();
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const [searchingUser, setSearchingUser] = useState(false);
    const currentUser = useRecoilValue(userAtom);
    const { socket, onlineUsers } = useSocket();

    // check mark as seen update on your chats list---------

    useEffect(() => {
        // here we listen messageseen event as we know chat page is a component in which converstion and message container component is present
        // if socket isavailable then --once we get conversation id then update this with previous one
        socket?.on("messagesSeen", ({ conversationId }) => {
            setConversations((prev) => {
                const updatedConversations = prev.map((conversation) => { // this is going to be te new updated state
                    if (conversation._id === conversationId) {  //conversation._id : current conversation id--
                        return {
                            ...conversation,   // spread all converstion but change last message 
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true,
                            },
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        });
    }, [socket, setConversations]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await fetch("/api/messages/conversations");
                const data = await res.json();
                console.log(data);
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setConversations(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingConversations(false);
            }
        };

        getConversations();
    }, [showToast, setConversations]);

    // lets discus on to handle search bar---

    // check user route ..we write a route for get user profile in which a query is passed in req url---in query(username ,or id ) contain


    const handleConversationSearch = async (e) => {
        e.preventDefault();
        setSearchingUser(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);
            const searchedUser = await res.json();
            if (searchedUser.error) {
                showToast("Error", searchedUser.error, "error");
                return;
            }

            // check if search user and current user is not same-----
            const messagingYourself = searchedUser._id === currentUser._id;
            if (messagingYourself) {
                showToast("Error", "You cannot message yourself", "error");
                return;
            }

            // check if prveiously conversation is exist------

            const conversationAlreadyExists = conversations.find(
                (conversation) => conversation.participants[0] && conversation.participants[0]._id === searchedUser._id
            );

            // if this exist then set this selected conversation with this existed conversation-------
            if (conversationAlreadyExists) {
                setSelectedConversation({
                    _id: conversationAlreadyExists._id,
                    userId: searchedUser._id,
                    username: searchedUser.username,
                    userProfilePic: searchedUser.profilePic,
                });
                return;
            }
            //  a mock conversation is created -----in this we justtake those things that whihch create in conversation model----

            // lets understand what mock conversation is : suppose i want to chat with  a user first time----and that user is not shown in my chat
            // but i know his username ..when i write on serach field it gave me his user id profile pic and when i click on them it user shows
            // on message container and i am ready to chat with him....

            ///there is no backend for this-----
            const mockConversation = {
                mock: true,     // we know for creating a conversation  we need last maessage id and participants----
                lastMessage: {
                    text: "",
                    sender: "",  // starting me kisi ne baat nhi ki so empty text nd sender ----
                },
                _id: Date.now(),  // id me kucch bhi dal sakte ho ..i put here date(current date)
                participants: [      // now for participants we need of  search user id , username and userprofile
                    {
                        _id: searchedUser._id,
                        username: searchedUser.username,
                        profilePic: searchedUser.profilePic,
                    },
                ],
            };
            // also in conversation we  store conversations...so to add mock conversation we use mock =true to indicate---
            // in mesage container we first check if it is mock conversation it simply return other wies it gives error if we do not this

            // after this add this mock conversation in setconversations and spread previous conversation[-----]
            setConversations((prevConvs) => [...prevConvs, mockConversation]);
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setSearchingUser(false);
        }
    };

    return (
        <Box
            position={"absolute"}
            left={"50%"}
            w={{ base: "100%", md: "80%", lg: "750px" }}
            p={4}
            transform={"translateX(-50%)"}
        >
            <Flex
                gap={4}
                flexDirection={{ base: "column", md: "row" }}
                maxW={{
                    sm: "400px",
                    md: "full",
                }}
                mx={"auto"}
            >
                <Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"}>
                    <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
                        Your Chats
                    </Text>

                    <form onSubmit={handleConversationSearch}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input placeholder='Search for a user' onChange={(e) => setSearchText(e.target.value)} style={{ width: '200px' }} />
                            <Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>

                    {loadingConversations &&
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={"center"} p={"1"} borderRadius={"md"}>
                                <Box>
                                    <SkeletonCircle size={"10"} />
                                </Box>
                                <Flex w={"full"} flexDirection={"column"} gap={3}>
                                    <Skeleton h={"10px"} w={"80px"} />
                                    <Skeleton h={"8px"} w={"90%"} />
                                </Flex>
                            </Flex>
                        ))}
                    {!loadingConversations &&
                        conversations.map((conversation) => (
                            conversation.participants.length > 0 && (
                                <Conversation
                                    key={conversation._id}         // in each conversation we send a isonline (true/false) props to conversation component---
                                    //  onlineUsers checks wheter participants present in this array or  -----------
                                    isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                                    conversation={conversation}
                                />
                            )
                        ))}
                </Flex>

                {!selectedConversation._id && <AnimatedImage />}

                {selectedConversation._id && <MessageContainer />}
            </Flex>
        </Box>
    );
};

export default ChatPage;
