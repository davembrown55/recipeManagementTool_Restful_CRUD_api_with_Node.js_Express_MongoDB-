import React, { useState, useEffect }  from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import {  Link, useLocation } from 'react-router-dom';
import { useAuth }  from './auth/AuthContext';
import ProtectedRoutes from './auth/ProtectedRoutes';
import ProtectedRoutesAdmin from './auth/ProtectedRoutesAdmin';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import AddRecipe from "./components/addRecipe/add-recipe.component";
import Recipe from "./components/recipe/recipe.component";
import RecipeList from "./components/recipeLists/recipe-list.component";
import UserLogin from "./components/loginRegister/userLogin.component";
import AdminPanel from "./components/admin/adminPanel.component";
import UserProfile from "./components/userProfile/userProfile.component";
import Logout from "./auth/logout";
import {useTheme} from './common/ThemeProvider';
import { Container, Button, Nav, Navbar, Spinner  } from "react-bootstrap";
import GetNavLinks from "./components/navbars/links";


const App = () => {
  const { themeVariants } = useTheme();
  const location = useLocation(); 
  const { userRole, verify } = useAuth();
  const [isLoading, setIsLoading] = useState(true);


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
  }, []);
  
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center gap-5 ps-0">
        <Spinner animation="border" variant={themeVariants.text} />
        <p>Loading...</p>        
      </Container>

    );    
  }

  return (
    <Container fluid className="p-0">
          <Navbar 
            expand="sm"  
            data-bs-theme={themeVariants['data-bs-theme']}
          >          
            <Container fluid>
              <Navbar.Brand as={Link} to={"/recipes"}>Recipe Manager</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                {GetNavLinks(userRole, location)}
              </Navbar.Collapse>
            </Container>            
          </Navbar>

          <Container fluid className="page-container mt-5">            
              <Routes>
                <Route path="/" element={<RecipeList type='all'/>} />
                <Route path="/recipes" element={<RecipeList type='all'/>} />
                <Route path="/recipes/:id" element={<Recipe />} />
                <Route element={<ProtectedRoutes/>}>
                  <Route path="/my-recipes/" element={<RecipeList type='mine' />}  />
                  <Route path="/add" element={<AddRecipe />}  />                  
                  <Route path="/userProfile" element={<UserProfile />}  />           
                </Route >
                <Route element={<ProtectedRoutesAdmin/>}>
                  <Route path="/admin" element={<AdminPanel />}  />
                </Route>
                <Route path="/login/*" element={<UserLogin />} />
                <Route path="*" element={<h1 style = {{padding:'30px', margin: '0 auto', textAlign: 'center'}}>404: There's nothing here!</h1>} />
                <Route path="/logout" element={<Logout />} />
              </Routes>           
          </Container>
    </Container> 
  );
}

export default App;

