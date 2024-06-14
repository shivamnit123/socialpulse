import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import Posts from "../components/Posts";
import postsAtom from "../atoms/postsAtoms";
import { useRecoilState } from "recoil";
import NotFoundPage from "../components/NotFoundPage";
import { motion } from "framer-motion";
import NoPosts from "../components/NoPosts";

const UserPage = () => {
    const { user, loading } = useGetUserProfile();
    const { username } = useParams();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const showToast = useShowToast();
    const [fetchingPosts, setFetchingPosts] = useState(true);

    useEffect(() => {
        const getPosts = async () => {
            if (!user) return;
            setFetchingPosts(true);
            try {
                const res = await fetch(`/api/posts/user/${username}`);
                const data = await res.json();
                console.log(data);
                setPosts(data);
            } catch (error) {
                setPosts([]);
                showToast("Error", error.message, "error");
            } finally {
                setFetchingPosts(false);
            }
        };

        getPosts();
    }, [username, showToast, setPosts, user]);

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner size={"xl"} />
            </Flex>
        );
    }

    if (!user && !loading) return <NotFoundPage />;

    return (
        <>
            <UserHeader user={user} />

            {fetchingPosts && (
                <Flex justifyContent={"center"} my={12}>
                    <Spinner size={"xl"} />
                </Flex>
            )}

            {!fetchingPosts && posts.length === 0 && <NoPosts />}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {posts.map((post) => (
                    <Posts key={post._id} post={post} postedBy={post.postedBy} />
                ))}
            </motion.div>
        </>
    );
};

export default UserPage;
