import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useFollowunFollow from "../hooks/useFollowunFollow";

// it take user object as a prop fro userlist
const SuggestedUser = ({ user }) => {
    //    const following = false;
    //  const updating = false;
    const { handleFollowUnfollow, following, updating } = useFollowunFollow(user);
    return (
        <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
            {/* left side */}
            <Flex gap={2} as={Link} to={`${user.username}`}>
                <Avatar src={user.profilePic} />
                <Box>
                    <Text fontSize={"sm"} fontWeight={"bold"}>
                        {user.username}
                    </Text>
                    <Text color={"gray.light"} fontSize={"sm"}>
                        {user.name}
                    </Text>
                </Box>
            </Flex>
            {/* right side */}
            <Button
                size={"sm"}
                color={following ? "black" : "white"}
                bg={following ? "white" : "blue.400"}
                onClick={handleFollowUnfollow}
                isLoading={updating}
                _hover={{
                    color: following ? "black" : "white",
                    opacity: ".8",
                }}
            >
                {following ? "Unfollow" : "Follow"}
            </Button>
        </Flex>
    );
};

export default SuggestedUser;
