// 'use client';
// import { createContext, useContext, useState, useEffect } from "react";

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // const data = async() =>{

//   //   try{
//   //     const response = await fetch("http://localhost:8080/api/v1/auth/user-info", {
//   //       credentials: "include"
//   //     })
//   //     console.log(response)
//   //   }catch(error){
//   //     console.error(error)
//   //   }

//   // }
//   // data()

//   const login = (userData) => {
//     setUser(userData.user);

//     document.cookie = `username=${encodeURIComponent(userData.user.username)}; path=/;`;

//     document.cookie = `access_token=${userData.access_token}; path=/;`;
//   };

//   const logout = () => {
//     setUser(null);
//     document.cookie = "username=; Max-Age=0; path=/";
//     document.cookie = "access_token=; Max-Age=0; path=/";
//   };

//   return (
//     <UserContext.Provider value={{ user, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);
