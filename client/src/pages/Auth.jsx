import { useRecoilValue } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import LoginPage from "../components/LoginPage";
import SignupPage from "../components/SignupPage";

// currently which page are u in..

const Auth = () => {
    const authScreenState = useRecoilValue(authScreenAtom);

    return <>{authScreenState === "login" ? <LoginPage /> : <SignupPage />}</>;
};

export default Auth;