import  React, { useState, useEffect } from 'react';
import {  Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner, Container } from 'react-bootstrap';
import { useTheme } from '../common/ThemeProvider';


const ProtectedRoutesAdmin = () => {
  const { userRole, verify } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { themeVariants } = useTheme();

  // check user session every time this component is rendered
  useEffect(() => {
    const doVerify = async () => {
      try {
        await verify();
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false); 
      }
    };
    doVerify();
  }, [verify, userRole]);

  // Render a loading state while verifying the role
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center gap-5 ps-0">
        <Spinner animation="border" variant={themeVariants.text} />
        <p>Loading...</p>        
      </Container>

    );
    
  }

  return  userRole === 'admin' ? <Outlet /> : <Navigate as={Link} to={'/login/existingUser'} />;

  };


export default ProtectedRoutesAdmin;