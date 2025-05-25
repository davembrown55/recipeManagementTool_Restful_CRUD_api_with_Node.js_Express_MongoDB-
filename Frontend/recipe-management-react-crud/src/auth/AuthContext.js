import React, { createContext, useContext, useState } from 'react';
import useUserService from "../services/user.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { login, logout, fetchSecureData } = useUserService();

  // const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const loginUser = async (userData) => {    
    try {
      const response = await login(userData);  
      setUserRole(response.data.user.role);
      setUserName(response.data.user.username);
      return response;
    } catch (e) {
      throw e;
    }    
  };

  const logoutUser = async () => {
    try {
      const response = await logout();
      console.log(response.data.message);
      setUserRole(null);
      setUserName(null);
    } catch (e) {
      console.log(e);
    }
  };

  const verify = async () => {
    try {
      const response = await fetchSecureData();
      if (response === 401) {
          setUserRole(null);
          setUserName(null);
          return 'unauthorised';        
      } else {
        setUserRole(response.role);
        setUserName(response.username);
        return 'verified';
      }
    } catch (e) {      
        if(typeof e.response.status !== 'undefined' && e.response.status === 401) {
            const message = 'Access Denied. Your login session may have expired.'; 
            setUserRole(null);
            setUserName(null);
            return 'unauthorised'; 
            // throw message;
        } else {            
            logoutUser();
            setUserRole(null);
            setUserName(null);
            // throw e;
            return 'Error. User logged out';
        }            
    }    
  };   
  

  return (
    <AuthContext.Provider value={{ userName, userRole, loginUser, logoutUser, verify }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);