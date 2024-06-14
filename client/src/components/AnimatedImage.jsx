import { motion } from 'framer-motion';
import { GiConversation } from 'react-icons/gi';

const AnimatedImage = () => {
    const conversationIconVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, scale: 1.2, transition: { duration: 1.5, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.5 } },
    };

    const textVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 1, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}
            variants={conversationIconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div variants={textVariants}>
                <GiConversation size={100} />
            </motion.div>
            <motion.p variants={textVariants} fontSize={20}>
                Select a conversation to start messaging
            </motion.p>
        </motion.div>
    );
};

export default AnimatedImage;