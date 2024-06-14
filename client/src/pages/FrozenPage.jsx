import {
    Button,
    Text,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";
import { useRef } from "react";

const MotionButton = motion(Button);
const MotionAlertDialogOverlay = motion(AlertDialogOverlay);
const MotionAlertDialogContent = motion(AlertDialogContent);

export const FrozenPage = () => {
    const showToast = useShowToast();
    const logout = useLogout();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();

    const freezeAccount = async () => {
        try {
            const res = await fetch("/api/users/freeze", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (data.error) {
                return showToast("Error", data.error, "error");
            }
            if (data.success) {
                await logout(false); // call logout without showing logout success toast
                showToast("Success", "Your account has been frozen", "success");
            }
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            onClose();
        }
    };

    return (
        <VStack
            spacing={4}
            align="center"
            justify="center"
            height="100vh"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            as={motion.div}
            marginTop={-10}
        >
            <Text
                fontSize="2xl"
                fontWeight="bold"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                as={motion.div}
            >
                Freeze Your Account
            </Text>
            <Text
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                as={motion.div}
            >
                You can unfreeze your account anytime by logging in.
            </Text>
            <MotionButton
                size="lg"
                colorScheme="red"
                onClick={onOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
                Freeze
            </MotionButton>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                motionPreset="slideInBottom"
            >
                <MotionAlertDialogOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <MotionAlertDialogContent
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Freeze Account
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to freeze your account? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <MotionButton
                                colorScheme="red"
                                onClick={freezeAccount}
                                ml={3}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                Freeze
                            </MotionButton>
                        </AlertDialogFooter>
                    </MotionAlertDialogContent>
                </MotionAlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};
