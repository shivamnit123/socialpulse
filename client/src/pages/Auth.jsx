import { useRecoilValue } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import LoginPage from "../components/LoginPage";
import SignupPage from "../components/SignupPage";

const Auth = () => {
    const authScreenState = useRecoilValue(authScreenAtom);

    return <>{authScreenState === "login" ? <LoginPage /> : <SignupPage />}</>;
};

export default Auth;