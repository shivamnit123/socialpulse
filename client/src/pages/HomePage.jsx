import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Posts from "../components/Posts";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtoms";
import UserList from "../components/UserList";
import NoUser from "../components/NoUser";


// home page hum post dikhayenge vo users ke jinko hum follow krte hai-----------------------------------
const HomePage = () => {
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();
    useEffect(() => {
        const getFeedPosts = async () => {
            setLoading(true);
            setPosts([]);   // ye esliye kiya when we click on home ---first we see post then we see home page..thats why we keep setpost empty here
            try {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setPosts(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };
        getFeedPosts();
    }, [showToast, setPosts]);

    return (
        <Flex gap='10' alignItems={"flex-start"}>
            <Box flex={70}>
                {!loading && posts.length === 0 && <NoUser />}

                {loading && (
                    <Flex justify='center'>
                        <Spinner size='xl' />
                    </Flex>
                )}

                {posts.map((post) => (   //it send 3 things to the post component post id post and posted by----------------------
                    <Posts key={post._id} post={post} postedBy={post.postedBy} />
                ))}
            </Box>
            <Box
                flex={30}
                display={{
                    base: "none",
                    md: "block",
                }}
            >
                <UserList />
            </Box>
        </Flex>
    );
};

export default HomePage;