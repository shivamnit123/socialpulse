import React from "react";
import { motion } from "framer-motion";
import { Box, Text } from "@chakra-ui/react";


const NoPosts = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
        >
            <Box
                p={6}
                marginTop={5}
                borderWidth={1}
                borderRadius="lg"
                textAlign="center"
                bgGradient="linear(to-r, gray.600, gray.900)"
                color="white"
                boxShadow="lg"
            >
                <Text fontSize="2xl" fontWeight="bold">
                    You have not posted anything yet.
                </Text>
            </Box>
        </motion.div>
    );
};

export default NoPosts;
