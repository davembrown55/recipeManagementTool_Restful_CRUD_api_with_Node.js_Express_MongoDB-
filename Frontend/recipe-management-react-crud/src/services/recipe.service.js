import { useCallback } from 'react';
import http from '../http-common';

const useRecipeService = () => {
  const getAll = useCallback(async (params, searchType, listType) => {  
    params.listType = listType;
    if (searchType === 'advanced') {      
      try {
        const response = await http.post('/recipes/advancedSearch', params, { withCredentials: true }) 
        return response.data;
      } catch (error) {
        // console.error('Error fetching recipes:', error);
        throw error;
      }
    } else {
      try {
        const response =  await http.get('/recipes', { params,  withCredentials: true }); 
        return response.data;
      } catch (error) {
        // console.error('Error fetching recipes:', error);
        throw error;
      }
    }
  }, []);

  const get = useCallback(async (id) => {
    try {
      const response = await http.get(`/recipes/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {      
      if (error.response.status === 401) {        
        return { 
          status: error.response.status, 
          message: error.response.data 
        };
      }

      // console.error(`Error fetching recipe with id ${id}:`, error);
      // throw error;
    }
  }, []);

  const create = useCallback(async (data) => {
    try {
      const response = await http.post('/recipes', data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }, []);

  const update = useCallback(async (id, data) => {
    try {
      const response = await http.patch(`/recipes/${id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      // console.error(`Error updating recipe with id ${id}:`, error);
      throw error;
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      const response = await http.delete(`/recipes/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      // console.error(`Error deleting recipe with id ${id}:`, error);
      throw error;
    }
  }, []);  
  

  return { getAll, get, create, update, remove };
};

export default useRecipeService;
