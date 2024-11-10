import { useState } from "react";
import useShowToast from "./useShowToast";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";

// in this user we check current user id is present or not..and return true or false on the basis  of this
const useFollowunFollow = (user) => {
    // fetch current user id
    const currentUser = useRecoilValue(userAtom);
    //  current status of following ...current user is followed or not---..thats why in intial state it checks---
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
    // only used for buffering..when we click on button then its started..untill all process is not done..
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();

    const handleFollowUnfollow = async () => {
        // check currebnt user is logged in or not
        if (!currentUser) {
            showToast("Error", "Please login to follow", "error");
            return;
        }
        if (updating) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/users/follow/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            // so there are 2 options i.e follow or unfollow..suppose if it is already follow..then after click it becomes unfollowed

            if (following) {
                showToast("Success", `Unfollowed ${user.name}`, "success");
                user.followers.pop(); // simulate removing from followers
            } else {
                showToast("Success", `Followed ${user.name}`, "success");
                user.followers.push(currentUser?._id); // simulate adding to followers
            }
            setFollowing(!following);

            console.log(data);
        } catch (error) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    return { handleFollowUnfollow, updating, following };
};

export default useFollowunFollow;