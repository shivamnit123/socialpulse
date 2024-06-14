import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// check post model in which we create a model for replies ... in replies data consist of userprofilepic(user that will comment) username

// last reply means here..we check if this is the last reply then no divider is shown on ui..after that last comment or reply-----
const Comment = ({ reply, lastReply }) => {
    const navigate = useNavigate();

    return (
        <>
            <Flex gap={4} py={2} my={2} w={"full"}>
                <Avatar src={reply.userProfilePic} size={"sm"}
                    cursor={"pointer"}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${reply.username}`);
                    }}
                />
                <Flex gap={1} w={"full"} flexDirection={"column"}>
                    <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text fontSize='sm' fontWeight='bold' cursor={"pointer"}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/${reply.username}`);
                            }}>
                            {reply.username}
                        </Text>
                    </Flex>
                    <Text>{reply.text}</Text>
                </Flex>
            </Flex>
            {!lastReply ? <Divider /> : null}
        </>
    );
};

export default Comment;