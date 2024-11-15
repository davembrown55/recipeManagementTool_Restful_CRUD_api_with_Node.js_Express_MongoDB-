import { useCallback } from 'react';
import http from '../http-common';
import { useAuth } from '../auth/AuthContext';

const useUserService = () => {
    const {verify} = useAuth;

    const getAll = useCallback(async (params) => {
        try {
          const response = await http.get('/auth/users/', { params, withCredentials: true });
          return response.data;
        } catch (error) {
          if(error.response.data === 'Unauthorized'){
            console.log('Unauthorized!!');
          } else {throw error;}
          
        }
      }, []);
    
      const get = useCallback(async (id) => {

        try {
          //id parameter is a string
          // const response = await http.get(`/auth/user/id?id=${id}`);

          const response = await http.post(`/auth/user/id`, id, {withCredentials: true });
          return response.data;
        } catch (error) {
            if(error.response.data === 'Unauthorized'){
              console.log('Unauthorized!!');
            } else if (typeof(error.response.data.errors) !== 'undefined'){
              const Msg = error.response.data.errors.map((x) => {return x.msg}); 
              console.log(Msg);
            } else {throw error;}
        }
      }, []);

      // Get user data with session id
      const getUserWithAuth = useCallback(async () => {
        try {
          const response = await http.get(`/auth/user-info`, { withCredentials: true });          
          // console.log('User Info:', response.data.sessionVerified);

        } catch (err) {          
          switch (err.response.data) {
            case 'Invalid token.':
              console.log(`Error fetching user info: Access Denied. Your login session may have expired.`)
              break;
            case 'Access denied.':
              console.log(`Error fetching user info: Access Denied. Invalid credentials`)
              break;
            default:
              console.log(`Error fetching user info: Access Denied.`)
              break;
          }
          
        }

      }, []);

      // User auth with server session
      const fetchSecureData = useCallback( async () => {
        try {
          const response = await http.get('auth/secure-data', { withCredentials: true });
          if (response.data.hasOwnProperty('sessionVerified')){
              const user = response.data.sessionVerified;
              return(user);
          } 
          // else if (response.data === 'Unauthorized') {
          //   return 'Access Denied. Your login session may have expired.'; 
          // }         
        } catch (err) {
          throw err;
        }
      }, []);

      const check = useCallback(async (params) => {
        if (params.hasOwnProperty('email')) {
          // console.log('params had email as key');
          try {
            const response = await http.post(`auth/user/checkEmail`, params);  
            return response.data;
          } catch (err) {
            throw err;
          }
        }
        if (params.hasOwnProperty('username')) {
          // console.log('params had username as key');        
          try {
            const response = await http.post(`auth/user/checkUsername`, params);
            return response.data;
          } catch (err) {
            throw err;
          }
        }
      }, []) 
    
      
      const register = useCallback(async (userRegDetails) => {
        try {
            const response = await http.post('auth/register', userRegDetails);
            return response;
        } catch (error) {
            throw error;            
        }
      }, []);

      const login = useCallback(async (userLoginDetails) => {
        try {
          const response = await http.post('auth/login', userLoginDetails, { withCredentials: true });
            return response;
        } catch (err) {
          throw err;
        }

      }, []);

      const logout = async () => {
        try {
          const response = await http.post('auth/logout', {}, { withCredentials: true });
          // console.log(response.data.message);
          return response;
          // Clear any UI-related state, redirect to login, etc.
        } catch (error) {
          // console.error('Logout failed:', error);
          return error;
        }
      };
    
      const adminUserUpdate = useCallback(async (data) => {
        try {
          const response = await http.patch('auth/admin/user-update', 
                                              data, { withCredentials: true } );
          console.log(response);
        } catch (e) {
          throw e;
        }
      }, []);

      const userUpdate = useCallback(async (data) => {
        try {
          const response = await http.patch('auth/profile-update', 
                                              data, { withCredentials: true } );
          console.log(response);
        } catch (e) {
          throw e;
        }       
      }, []);
    
      const adminRemoveUser = useCallback(async (id) => {
        try {
          const response = await http.delete('auth/admin/delete-user', 
                                              {data: {id: id},  withCredentials: true } );
          console.log(response);
        } catch (e) {
          throw e;
        }  
      }, []);

      const removeProfile = useCallback(async (id) => {
        try {
          const response = await http.delete('auth/delete-profile', 
                                              {data: {id: id},  withCredentials: true } );
          console.log(response);
        } catch (e) {
          throw e;
        }  
      }, []);


    return { getAll, get, register, login, check, adminUserUpdate, userUpdate, adminRemoveUser, removeProfile, getUserWithAuth,  fetchSecureData, logout };
};

export default useUserService;