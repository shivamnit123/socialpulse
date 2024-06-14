import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../atoms/communicationAtom";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ ownMessage, message }) => {
    const selectedConversation = useRecoilValue(selectedConversationAtom);  // to fetch reciever info----
    const user = useRecoilValue(userAtom);   // fetch current user id-----
    const [imgLoaded, setImgLoaded] = useState(false); // loading state for images [scroll behaviour jaise text ke sath ho rha tha vaise image ka sath nhi ho rha tha thats why this state is use---
    return (
        <>
            {ownMessage ? (    // ye hum hai---means user
                <Flex gap={2} alignSelf={"flex-end"}>

                    {message.text && (
                        <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
                            <Text color={"white"}>{message.text}</Text>
                            <Box
                                alignSelf={"flex-end"}
                                ml={1}
                                color={message.seen ? "blue.400" : ""}
                                fontWeight={"bold"}
                            >
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}
                    {message.img && !imgLoaded && (   // if image is not loaded then this skeleton will show and load the image in setimg load----
                        <Flex mt={5} w={"200px"}>
                            <Image
                                src={message.img}
                                hidden
                                onLoad={() => setImgLoaded(true)}
                                alt='Message image'
                                borderRadius={4}
                            />
                            <Skeleton w={"200px"} h={"200px"} />
                        </Flex>
                    )}

                    {message.img && imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} alt='Message image' borderRadius={4} />
                            <Box
                                alignSelf={"flex-end"}
                                ml={1}                          // check mark for image---------
                                color={message.seen ? "blue.400" : ""}
                                fontWeight={"bold"}
                            >
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}

                    <Avatar src={user.profilePic} w='7' h={7} />
                </Flex>
            ) : (     // aur ye reciever ------ message is an object and consist of text
                <Flex gap={2}>
                    <Avatar src={selectedConversation.profilePic} w='7' h={7} />
                    {message.text && (
                        <Text maxW={"350px"} bg={"gray.400"} p={1} borderRadius={"md"} color={"black"}>
                            {message.text}
                        </Text>
                    )}
                    {message.img && !imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image
                                src={message.img}
                                hidden
                                onLoad={() => setImgLoaded(true)}
                                alt='Message image'
                                borderRadius={4}
                            />
                            <Skeleton w={"200px"} h={"200px"} />
                        </Flex>
                    )}

                    {message.img && imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} alt='Message image' borderRadius={4} />
                        </Flex>
                    )}

                </Flex>
            )}
        </>
    );
};

export default Message;