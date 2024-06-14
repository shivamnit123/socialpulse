import { Button, Flex, useColorMode, Link as ChakraLink, IconButton, Spacer } from '@chakra-ui/react';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import { Link as RouterLink } from "react-router-dom";
import { AiFillHome } from 'react-icons/ai';
import { RxAvatar } from "react-icons/rx";
import authScreenAtom from '../atoms/authAtom';
import { FiLogOut } from 'react-icons/fi';
import useLogout from '../hooks/useLogout';
import { BsFillChatQuoteFill } from 'react-icons/bs';
import { MdOutlineSettings } from "react-icons/md";
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const user = useRecoilValue(userAtom);
    const setAuthScreen = useSetRecoilState(authScreenAtom);
    const logout = useLogout();

    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            paddingY={4}
            paddingX={8}
            marginTop={4} // Added margin top
        >
            <Flex alignItems="center">
                {user && (
                    <ChakraLink as={RouterLink} to='/'>
                        <AiFillHome size={24} />
                    </ChakraLink>
                )}
                <Spacer marginLeft={4} /> {/* Added gap */}
            </Flex>
            <IconButton
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
                variant="outline"
                size="md"
                colorScheme="brand"
                aria-label="Toggle color mode"
            />
            <Flex alignItems="center">
                {user && (
                    <>
                        <ChakraLink as={RouterLink} to={`/${user.username}`} marginRight={4}>
                            <RxAvatar size={24} />
                        </ChakraLink>
                        <ChakraLink as={RouterLink} to={`/chat`} marginRight={4}>
                            <BsFillChatQuoteFill size={20} />
                        </ChakraLink>
                        <ChakraLink as={RouterLink} to={`/settings`} marginRight={4}>
                            <MdOutlineSettings size={20} />
                        </ChakraLink>
                        <Button size={"xs"} onClick={logout}>
                            <FiLogOut size={20} />
                        </Button>
                    </>
                )}
            </Flex>
        </Flex>
    );
};

export default Header;
