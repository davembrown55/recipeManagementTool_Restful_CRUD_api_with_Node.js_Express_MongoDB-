import { React, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import RecipeList from '../components/recipe-list.component';

const Logout = () => {
  const { logoutUser, userName, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userName !== null && userRole !== null) {
      logoutUser();
      navigate("/recipes");
    } else {
      console.log('no user detected');
      navigate("/recipes");
    }
  }, [userName, userRole, logoutUser, navigate]);

  return null;
  
};

export default Logout;