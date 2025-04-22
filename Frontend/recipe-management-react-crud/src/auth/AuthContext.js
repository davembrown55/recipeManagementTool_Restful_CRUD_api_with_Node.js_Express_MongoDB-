import React, { createContext, useContext, useState } from 'react';
import useUserService from "../services/user.service";
import RecipeList from '../components/recipe-list.component';

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
      console.log(response);
      if (response === 401) {
        console.log('unauthorised');
        setUserRole(null);
        setUserName(null);
      } else {
        setUserRole(response.role);
        setUserName(response.username);
        console.log('verified');
      }
    } catch (e) {      
        if(typeof e.response.status !== 'undefined' && e.response.status === 401) {
            const message = 'Access Denied. Your login session may have expired.'; 
            console.log(message);
            setUserRole(null);
            setUserName(null);
            // throw message;
        } else {
            console.log('Error. User logged out');
            logoutUser();
            setUserRole(null);
            setUserName(null);
            // throw e;
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