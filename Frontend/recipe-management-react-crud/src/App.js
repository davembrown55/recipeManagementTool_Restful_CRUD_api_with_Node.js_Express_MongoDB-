import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import AddRecipe from "./components/add-recipe.component";
import Recipe from "./components/recipe-new.component";
import RecipeList from "./components/recipe-list.component";

import { withRouter } from './common/with-router';




class App extends Component {
  render() {

    const { location } = this.props.router;

    const highlightRecipesNavEmptyPath = () => location.pathname == '/' ? "/recipes" : location.pathname;
    

    return (
      
      <Container fluid className = "p-0">   

        <Navbar expand="lg" bg="dark" data-bs-theme="dark"> 
          <Container fluid>
            <Navbar.Brand as={Link} to={"/recipes"}>Recipe Management Tool</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" variant="underline" activeKey={highlightRecipesNavEmptyPath()} > 
              <Nav.Link as={Link} to={"/recipes"} href={"/recipes"}>Recipes</Nav.Link>
              <Nav.Link as={Link} to={"/add"} href={"/add"}>Add</Nav.Link>
            </Nav>
            </Navbar.Collapse>

          </Container>            
        </Navbar>          
        
        <Container fluid className = "mt-5">         
          <Routes>
            <Route path="/" element={<RecipeList/>} />
            <Route path="/recipes" element={<RecipeList/>} />
            <Route path="/add" element={<AddRecipe/>} />
            <Route path="/recipes/:id" element={<Recipe />} />
          </Routes>        
        </Container>      

      </Container>
      
    );
  }
}


export default withRouter(App);

