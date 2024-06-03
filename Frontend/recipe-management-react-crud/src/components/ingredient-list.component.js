import React from "react";
// import { useParams, useNavigate } from 'react-router-dom';
// import RecipeDataService from "../services/recipe.service";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';



const IngredientList = ({
  ingredients,
  onChangeIngredients,
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  darkOrLightMode,
  darkOrLightVariant
}) => {

  
  const UpBtnVisible = (index) => {
    if (index !== 0) {
      return (
        <Button  
          className="xs-btn"
          variant="outline-info"
          onClick={() => moveIngredientUp(index)}
        >
          <i className="bi bi-arrow-up-short"></i>
        </Button>    
      );
    }
  };

  const DownBtnVisible = (index) => {
    if (index !== (ingredients.length - 1)) {
      return (
        <Button 
          className="xs-btn mt-1"
          variant="outline-info"
          onClick={() => moveIngredientDown(index)}
        >
          <i className="bi bi-arrow-down-short"></i>
        </Button>
      );
    }
  };


    return (
        <Form.Group controlId="Ingredients" className="mb-4">
        <Form.Label className="ps-2">Ingredients</Form.Label>
        <ListGroup as="ul"         
          data-bs-theme={darkOrLightMode()}
          >
        {ingredients.map((ingredient, index) => (
          <ListGroup.Item 
            key={index}
            className="d-flex justify-content-between list-item-cont">
            <Form.Control 
              as="textarea"
              type="text"      
              className="w-75"                
              value={ingredient} 
              data-bs-theme={darkOrLightMode()}
              onChange={(e) => onChangeIngredients(index, e)}                    
            >
            </Form.Control>


            <Container className={`arrowContainer d-flex flex-column p-0 ${index === 0 ? 'justify-content-end' : ''}`}>
              {UpBtnVisible(index)}
              {DownBtnVisible(index)}
            </Container>

            <Button   
              variant={darkOrLightVariant()} 
              className="smaller-btn"                        
              onClick={(e) => removeIngredient(index)}
              >Remove</Button>
            
          </ListGroup.Item>                     
          
        ))}
        </ListGroup>
        <Row xs="auto" className="d-flex justify-content-end px-3 my-3">
          <Button 
            variant="outline-primary" 
            className="smaller-btn"
            onClick={(e) => addIngredient()}
          >Add Ingredient</Button>
          
        </Row>
      </Form.Group>

    );
};
export default IngredientList;