import React, { useState }  from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Link, useLocation  } from "react-router-dom";
import "./App.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import AddRecipe from "./components/addRecipe/add-recipe.component";
import Recipe from "./components/recipe/recipe.component";
import RecipeList from "./components/recipe-list.component";
import UserLogin from "./components/loginRegister/userLogin.component";
import UserRegister from "./components/loginRegister/userRegister.component";


import {useTheme} from './common/ThemeProvider';
import ThemeToggle from './common/ThemeToggle';


const App = () => {

  const location = useLocation(); 
  const { themeVariants } = useTheme();


  return (
        <Container fluid className="p-0">
          <Navbar 
            expand="sm"  
            // text={themeVariants.text} 
            data-bs-theme={themeVariants['data-bs-theme']}
          > 
            <Container fluid>
              <Navbar.Brand as={Link} to={"/recipes"}>Recipe Manager</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto" variant="underline" activeKey={location.pathname}>
                  <Nav.Link as={Link} to={"/recipes"} href={"/recipes"}>Recipes</Nav.Link>
                  <Nav.Link as={Link} to={"/add"} href={"/add"}>Add</Nav.Link>
                  <Nav.Link as={Link} to={"/login"} href={"/login"}>Login</Nav.Link>
                  <ThemeToggle />
                </Nav>
              </Navbar.Collapse>
            </Container>            
          </Navbar>

          
          
          <Container fluid className="page-container mt-5">
            <Routes>
              <Route path="/" element={<RecipeList />} />
              <Route path="/recipes" element={<RecipeList />} />
              <Route path="/add" element={<AddRecipe />} />
              <Route path="/recipes/:id" element={<Recipe />} />
              <Route path="/login/*" element={<UserLogin />} />
            </Routes>
          </Container>
        </Container>
  );
}

export default App;

