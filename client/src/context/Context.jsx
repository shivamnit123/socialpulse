// one common way to implement a socket is to create context

import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext(); // crete socket context----

export const useSocket = () => {  // create hook 
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const user = useRecoilValue(userAtom);

    useEffect(() => {
        const socket = io("http://localhost:4000", {
            query: {
                userId: user?._id,   ///here if u r logged in.
            },
        });


        setSocket(socket);
        // once we connect our application----lets listen the event that comes from the server i.e getonline user
        // socket.on means(it listens event ...both in client and server)


        socket.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);  // set this to our state
        });

        socket.on("connect_error", (err) => {
            console.error(`connect_error due to ${err.message}`);
        });
        // once the connection is disconnect---then socket will close---
        return () => socket && socket.close();
    }, [user?._id]);

    console.log(onlineUsers, "online user");
    //any value that will put here oncce we wrap our application
    return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
    // socket instance(means we connect socket server)  --------------------
};
