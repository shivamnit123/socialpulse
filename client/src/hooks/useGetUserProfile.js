import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";

const useGetUserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();
    const showToast = useCallback(useShowToast(), []);

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/users/profile/${username}`);
                if (!res.ok) throw new Error("User not found");

                const data = await res.json();
                console.log("Fetched data:", data);

                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                if (data.isFrozen) {
                    setUser(null);
                } else {
                    setUser(data);
                }
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [username, showToast]);

    return { loading, user };
};

export default useGetUserProfile;
