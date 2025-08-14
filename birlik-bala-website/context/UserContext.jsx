'use client';
import {createContext, useContext, useState, useEffect} from "react";


const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [user, setUser] = useState(null);

    useEffect(()=>{
        const savedUser = localStorage.getItem("username");
        if(savedUser) setUser(savedUser);
    }, []);

    const login = (userData) =>{
        setUser(userData);
        localStorage.setItem("username", userData.user.username);
    };

    const logout = () =>{
        setUser(null);
        localStorage.removeItem("username");
    }

    return(
        <UserContext.Provider value = {{user, login, logout}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);