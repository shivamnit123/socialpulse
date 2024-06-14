import {
    Flex,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/communicationAtom";
import useShowToast from "../hooks/useShowToast";
import usePreviewImg from "../hooks/usePreviewImg";
const MessageInput = ({ setMessages }) => {
    const [messageText, setMessageText] = useState("");  // make a state  for text message when we click on  input the mesage store in a state--
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom);  // for sending message we need reciever id----and conversation id--
    const setConversations = useSetRecoilState(conversationsAtom); // to update the your chats (conversation)--weh we send message to recievr
    const imageRef = useRef(null);                 // i want it will also update as a last meesage on (your chats)----
    const { onClose } = useDisclosure();
    const [isSending, setIsSending] = useState(false); //preventing from user to click multiple times-----
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
    // by useing this hook we render images in this application----it return handlechange function setimg state---and img url

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText && !imgUrl) return;   // if there is no text message it will return-----
        // agar user ne ek baar click kr diya aur uska response nhi aaya aur again click kr diya aise 2 3 baar then ye return kr jayega
        if (isSending) return;
        setIsSending(true);
        try {
            const res = await fetch("/api/messages", {   // seemessage routes i make a sendmeessage routes for sending message---
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({     // req body contains 3 things  recipient id (reciever id) and a text message ans image
                    message: messageText,
                    recipientId: selectedConversation.userId,
                    img: imgUrl,
                }),
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            console.log(data);
            setMessages((messages) => [...messages, data]);  // spread all the previous message and add new message----

            // updte in (your chat) from previous message to new message----
            // by checking conversation id and selected conversation id..if they match then we update the last message
            // calling in set conversation and mapped on prev conversation---
            setConversations((prevConvs) => {
                const updatedConversations = prevConvs.map((conversation) => {
                    if (conversation._id === selectedConversation._id) {
                        return {
                            ...conversation,   // first spread all previous conversation and then add last message---
                            lastMessage: {
                                text: messageText,
                                sender: data.sender,
                            },
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
            setMessageText("");
            setImgUrl("");
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsSending(false);
        }
    };
    return (
        <Flex gap={2} alignItems={"center"}>
            <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
                <InputGroup>
                    <Input
                        w={"full"}
                        placeholder='Type a message'
                        onChange={(e) => setMessageText(e.target.value)}
                        value={messageText}
                    />
                    <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
                        <IoSendSharp />
                    </InputRightElement>
                </InputGroup>
            </form>
            <Flex flex={5} cursor={"pointer"}>
                <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
                <Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
            </Flex>     {/* handleimage change function is coming from prevew image hoook */}
            <Modal
                isOpen={imgUrl}  // if there isimgurl then the modal is open
                onClose={() => {
                    onClose();
                    setImgUrl("");
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex mt={5} w={"full"}>
                            <Image src={imgUrl} />
                        </Flex>
                        <Flex justifyContent={"flex-end"} my={2}>
                            {!isSending ? (
                                <IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
                            ) : (
                                <Spinner size={"md"} />
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default MessageInput;