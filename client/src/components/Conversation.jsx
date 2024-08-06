import {
    Avatar,
    AvatarBadge,
    Box,
    Flex,
    Image,
    Stack,
    Text,
    WrapItem,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/communicationAtom";


const Conversation = ({ conversation, isOnline }) => {
    // console.log(conversation)
    const reciever = conversation.participants[0]; // fetch receiver id that recieve text-----(we remove one particpants check message controller)
    const currentUser = useRecoilValue(userAtom);  // fetch current user from atom----
    const lastMessage = conversation.lastMessage;  // fetch last message from conversation------
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const colorMode = useColorMode();
    // there is a problem in backend thats why i compare here --------- 
    // console.log("selectedConverstion", selectedConversation);
    if (!reciever) return null;
    return (
        <Flex
            gap={4}
            alignItems={"center"}
            p={"1"}
            _hover={{
                cursor: "pointer",
                bg: useColorModeValue("gray.600", "gray.dark"),
                color: "white",
            }}
            borderRadius={"md"}
            onClick={() => setSelectedConversation({   //when i click on (your messages) it opens in message contair and we can start our chatting---
                _id: conversation._id,  // we know that for conversation we need conversation id of 2 user
                userId: reciever._id,   // reciever who recieves the mesage 
                userProfilePic: reciever.profilePic, // reciever profilepic and username
                username: reciever.username,
                mock: conversation.mock,
            }
            )}
            // when u click on any conversation---that conversation is dark mode--seems diffrent---
            bg={
                selectedConversation?._id === conversation._id ? (colorMode === "light" ? "gray.400" : "gray.600") : ""
            }
        >
            <WrapItem>
                <Avatar
                    size={{
                        base: "xs",
                        sm: "sm",
                        md: "md",
                    }}
                    src={reciever.profilePic}
                >
                    {isOnline ? <AvatarBadge boxSize='1em' bg='green.500' /> : ""}
                </Avatar>
            </WrapItem>

            <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight='700' display={"flex"} alignItems={"center"}>
                    {reciever.username}   <Image src='/verified.png' w={4} h={4} ml={1} />
                </Text>
                <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
                    {currentUser._id === lastMessage.sender ? ( // agar current user ne last message bheja hoga sender ko then show hoga check mark
                        <Box color={lastMessage.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : (
                        ""
                    )}
                    {lastMessage.text.length > 18
                        ? lastMessage.text.substring(0, 18) + "..."
                        : lastMessage.text || <BsFillImageFill size={16} />}
                </Text>
            </Stack>
        </Flex>
    );
};

export default Conversation;