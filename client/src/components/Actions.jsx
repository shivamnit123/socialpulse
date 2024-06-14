import {
    Box,
    Button,
    Flex,
    FormControl,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtoms";
const Actions = ({ post }) => {       //post: post_ when we doin this it creates a problem.. here post is state
    const user = useRecoilValue(userAtom);
    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    // const [post, setPosts] = useState(post_);  // and we make another state from depending on that ..so when the setposts is updated it only render
    const [reply, setReply] = useState("");   //  this action component not parent component from where the props is coming------so this was bad practice
    const [isLiking, setIsLiking] = useState(false);
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [isReplying, setIsReplying] = useState(false);
    const showToast = useShowToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleLikeAndUnlike = async () => {
        if (!user) return showToast("Error", "You must be logged in to like a post", "error");
        if (isLiking) return;
        setIsLiking(true);
        try {
            const res = await fetch("/api/posts/like/" + post._id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (data.error) return showToast("Error", data.error, "error");

            if (!liked) {
                // add the id of the current user to post.likes array
                // if current post id is matched with that post id (post which are going to like)then add user data in likes array
                const addlikeduser = posts.map((p) => {
                    if (p._id === post._id)    // post._id = current post id
                    {
                        return { ...p, likes: [...p.likes, user._id] }
                    }
                    return p;  // other wise return post as it is------
                })
                setPosts(addlikeduser);

            } else {
                // remove the id of the current user from post.likes array
                const addlikeduser = posts.map((p) => {
                    if (p._id === post._id)    // post._id = current post id
                    {
                        return { ...p, likes: p.likes.filter((id) => id !== user._id) }   // remove current user
                    }
                    return p;  // other wise return post as it is------
                })
                setPosts(addlikeduser);
            }
            setLiked(!liked);
        } catch (error) {
            showToast("Error", error.message, "error");
        }
        finally {
            setIsLiking(false);
        }
    };
    const handleReply = async () => {
        if (!user) return showToast("Error", "You must be logged in to reply to a post", "error");
        if (isReplying) return;
        setIsReplying(true);
        try {
            const res = await fetch("/api/posts/reply/" + post._id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: reply }),
            });
            const data = await res.json();
            if (data.error) return showToast("Error", data.error, "error");
            // same for reply also----------------
            const addreplyuser = posts.map((p) => {
                if (p._id === post._id)    // post._id = current post id
                {
                    return { ...p, replies: [...p.replies, data] }   // reply is arry of objects in post model thats my data is sent as object
                }                                                    // it contains user id userprofilepic text ----------
                return p;  // other wise return post as it is------
            })
            setPosts(addreplyuser);
            showToast("Success", "Reply posted successfully", "success");
            onClose();
            setReply("");
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsReplying(false);
        }

    };


    return (
        <Flex flexDirection='column'>
            <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
                <svg
                    aria-label='Like'
                    color={liked ? "rgb(237, 73, 86)" : ""}
                    fill={liked ? "rgb(237, 73, 86)" : "transparent"}
                    height='19'
                    role='img'
                    viewBox='0 0 24 22'
                    width='20'
                    style={{ cursor: 'pointer' }}
                    onClick={handleLikeAndUnlike}
                >

                    <path
                        d='M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z'
                        stroke='currentColor'
                        strokeWidth='2'
                    ></path>
                </svg>

                <svg
                    aria-label='Comment'
                    color=''
                    fill=''
                    height='20'
                    role='img'
                    viewBox='0 0 24 24'
                    width='20'
                    style={{ cursor: 'pointer' }}
                    onClick={onOpen}
                >
                    <title>Comment</title>
                    <path
                        d='M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
                        fill='none'
                        stroke='currentColor'
                        strokeLinejoin='round'
                        strokeWidth='2'
                    ></path>
                </svg>

            </Flex>

            <Flex gap={2} alignItems={"center"}>
                <Text color={"gray.light"} fontSize='sm'>
                    {post.replies.length} replies
                </Text>
                <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
                <Text color={"gray.light"} fontSize='sm'>
                    {post.likes.length} likes
                </Text>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <Input
                                placeholder='Reply goes here..'
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' size={"sm"} mr={3} isLoading={isReplying} onClick={handleReply}>
                            Reply
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default Actions;
