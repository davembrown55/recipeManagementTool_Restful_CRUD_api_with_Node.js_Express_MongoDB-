import { useCallback } from 'react';
import http from '../http-common';

const useUserService = () => {
    const getAll = useCallback(async (params) => {
        try {
          const response = await http.get('/auth/users/', { params });
          return response.data;
        } catch (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
      }, []);
    
      const get = useCallback(async (id) => {

        try {
          //id parameter is a string
          const response = await http.get(`/auth/user/id?id=${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching recipe with id ${id}:`, error);
          throw error;
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
            // console.error('Registration failed:', error);
            // return error;
            throw error;
            
        }
      }, []);

      const login = useCallback(async (userLoginDetails) => {
        try {
          const response = await http.post('auth/login', userLoginDetails);
            return response;
        } catch (err) {
          throw err;
        }

      }, []);
    
      const update = useCallback(async (id, data) => {
        // try {
        //   const response = await http.put(`/recipes/${id}`, data);
        //   return response.data;
        // } catch (error) {
        //   console.error(`Error updating recipe with id ${id}:`, error);
        //   throw error;
        // }
      }, []);
    
      const remove = useCallback(async (id) => {
        // try {
        //   const response = await http.delete(`/recipes/${id}`);
        //   return response.data;
        // } catch (error) {
        //   console.error(`Error deleting recipe with id ${id}:`, error);
        //   throw error;
        // }
      }, []);


    return { getAll, get, register, login, check, update, remove };
};

export default useUserService;