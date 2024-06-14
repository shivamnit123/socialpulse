import React from 'react';
import { Flex, Box, Text, keyframes, useColorMode } from '@chakra-ui/react';

const bounce = keyframes`
  from { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  to { transform: translateY(0); }
`;

const NotFoundPage = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    return (
        <Flex
            direction="column"
            justify="center"
            align="center"
            height="100vh"
            backgroundColor={isDark ? "#1e1e1e" : "white"}
        >
            <Box
                animation={`${bounce} 1s infinite`}
                fontSize="6xl"
                fontWeight="bold"
                color={isDark ? "white" : "black"}
            >
                404
            </Box>
            <Text fontSize="2xl" mt={4} color={isDark ? "white" : "black"}>
                Oops! User not found.
            </Text>
            <Text mt={2} color={isDark ? "white" : "black"}>
                The page you're looking for doesn't exist.
            </Text>
        </Flex>
    );
};

export default NotFoundPage;
