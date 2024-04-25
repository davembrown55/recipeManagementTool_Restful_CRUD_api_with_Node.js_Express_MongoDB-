import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import AddRecipe from "./components/add-recipe.component";
import Recipe from "./components/recipe.component";
import RecipeList from "./components/recipe-list.component";



class App extends Component {
  render() {
    return (
      <div>

          <Navbar expand="lg" bg="dark" data-bs-theme="dark"> 
          <Container fluid>
            <Navbar.Brand href={"/recipes"}>Recipe Management Tool</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" variant="underline" > {/* defaultActiveKey={"/recipes"} */} 
              <Nav.Link href={"/recipes"} >Recipes</Nav.Link>
              <Nav.Link href={"/add"} >Add</Nav.Link>
            </Nav>
            </Navbar.Collapse>

          </Container>            
        </Navbar>          
        

        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<RecipeList/>} />
            <Route path="/recipes" element={<RecipeList/>} />
            <Route path="/add" element={<AddRecipe/>} />
            <Route path="/recipes/:id" element={<Recipe/>} />
          </Routes>
        </div>
      </div>
      
    );
  }
}

export default App;

