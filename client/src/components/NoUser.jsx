import { Box, Text, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaUserFriends } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionIcon = motion(Box);

const NoUser = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    return (
        <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            p={5}
            textAlign="center"
            bg={isDark ? "#1e1e1e" : "gray.100"}
            borderRadius="md"
            shadow="md"
            m={5}
        >
            <MotionIcon
                as={FaUserFriends}
                fontSize="4xl"
                color="blue.500"
                mb={4}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <MotionText
                fontSize="2xl"
                fontWeight="bold"
                mb={2}
                color={isDark ? "white" : "black"}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
                Follow some users to see the feed
            </MotionText>
            <Text color={isDark ? "white" : "black"}>
                Your feed is empty. Start following people to see their posts here!
            </Text>
        </MotionBox>
    );
};

export default NoUser;
