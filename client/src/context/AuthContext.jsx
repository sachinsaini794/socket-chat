import {createContext, useCallback, useEffect, useState} from "react"
import { baseUrl, postRequest } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [registerErr, setRegisterErr] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [loginErr, setLoginErr] = useState(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        name:"",
        email:"",
        password:""
    });
    const [loginInfo, setLoginInfo] = useState({
        email:"",
        password:""
    });

    // console.log('user ', user);

    useEffect(() => {
        const user = localStorage.getItem("User");
        setUser(JSON.parse(user));
    },[]);

    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    },[]);

    const registerUser = useCallback( async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true)
        setRegisterErr(null);
       const response =  await postRequest(`${baseUrl}/users/register`, JSON.stringify(registerInfo))

       setIsRegisterLoading(false)

       if (response.error){
        return setRegisterErr(response);
       }
       localStorage.setItem("User", JSON.stringify(response));
       setUser(response);
       
    }, [registerInfo]);

    const logoutUser = useCallback(() => {
        localStorage.removeItem("User");
        setUser(null);
    },[]);

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    },[]);

    const loginUser = useCallback( async (e) => {
        e.preventDefault();
        setIsLoginLoading(true)
        setLoginErr(null);
        const response =  await postRequest(`${baseUrl}/users/login`, JSON.stringify(loginInfo))

        setIsLoginLoading(false)

       if (response.error){
        return setLoginErr(response);
       }

       localStorage.setItem("User", JSON.stringify(response));
       setUser(response);
    },[loginInfo]);

    return <AuthContext.Provider value={{ user, registerInfo, updateRegisterInfo, registerUser, registerErr, logoutUser, 
    updateLoginInfo, loginInfo, loginUser, loginErr, isLoginLoading }}>
        {children}
    </AuthContext.Provider>
}