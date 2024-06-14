import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {   // user id comes from mongodb database after creation of user 
        expiresIn: "15d",                                          // generate token with the help of jwt secret key which is present in env file
    });

    res.cookie("jwt", token, {
        httpOnly: true, // more secure
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days   given in seconds
        sameSite: "strict", // CSRF   // no other site can access cookie----
    });

    return token;
};

export default generateTokenAndSetCookie;