import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
    try {
        // get token from cookies-----
        const token = req.cookies.jwt; //...jwt is used b/c jwt string is used to set the cookie 

        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // decode the token  by verifying with secret key which is present in env file

        const user = await User.findById(decoded.userId).select("-password"); // now after decode check user in data base by decoded user id that is comes from payload---

        req.user = user;    /// update user in request object

        next(); // next function or middleware called
    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};

export default protectRoute;