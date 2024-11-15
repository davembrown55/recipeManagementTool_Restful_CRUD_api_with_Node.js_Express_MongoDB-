
import React from "react";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav } from "react-bootstrap";
import ThemeToggle from '../../common/ThemeToggle';

 const GetNavLinks = (userRole, location) => {
    switch (userRole) {
      case 'user':
        return (
          <Nav className="me-auto userNav" variant="underline" activeKey={location.pathname}>
            <Nav.Link as={Link} to={"/recipes"} href={"/recipes"}>All Recipes</Nav.Link>
            <Nav.Link as={Link} to={"/my-recipes"} href={"/my-recipes"}>My Recipes</Nav.Link>
            <Nav.Link as={Link} to={"/add"} href={"/add"}>New Recipe</Nav.Link>                  
            <Nav.Link as={Link} to={"/userProfile"} href={"/userProfile"}>Me</Nav.Link>
            <Nav.Link as={Link} to={"/logout"} href={"/logout"}>Logout</Nav.Link>
            <ThemeToggle />
          </Nav>
        );
      case 'admin':
        return (
          <Nav className="me-auto userNav" variant="underline" activeKey={location.pathname}>
            <Nav.Link as={Link} to={"/recipes"} href={"/recipes"}>All Recipes</Nav.Link>
            <Nav.Link as={Link} to={"/my-recipes"} href={"/my-recipes"}>My Recipes</Nav.Link>
            <Nav.Link as={Link} to={"/add"} href={"/add"}>New Recipe</Nav.Link>                  
            <Nav.Link as={Link} to={"/userProfile"} href={"/userProfile"}>Me</Nav.Link>
            <Nav.Link as={Link} to={"/admin"} href={"/admin"}>Admin</Nav.Link>
            <Nav.Link as={Link} to={"/logout"} href={"/logout"}>Logout</Nav.Link>            
            <ThemeToggle />
          </Nav>
        );
      case null :
        return (
          <Nav className="me-auto userNav" variant="underline" activeKey={location.pathname}>
            <Nav.Link as={Link} to={"/recipes"} href={"/recipes"}>All Recipes</Nav.Link>
            <Nav.Link as={Link} to={"/login"} href={"/login"}>Login</Nav.Link>
            <ThemeToggle />
          </Nav>
        );
      default: 
        return (
          <Nav className="me-auto userNav" variant="underline" activeKey={location.pathname}>
            <Nav.Link as={Link} to={"/recipes"} href={"/recipes"}>All Recipes</Nav.Link>
            <Nav.Link as={Link} to={"/login"} href={"/login"}>Login</Nav.Link>
            <ThemeToggle />
          </Nav>
        );
    }
  };

  export default GetNavLinks;