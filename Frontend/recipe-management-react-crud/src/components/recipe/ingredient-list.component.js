import React from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';



const IngredientList = ({
  ingredients,
  onChangeIngredients,
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  themeVariants,
  errors
  
}) => {


  const UpBtnVisible = (index) => {
    if (index !== 0) {
      return (
        <Button  
          className="xs-btn"
          variant={themeVariants.variant === 'dark' ? "outline-info" : "info"} 
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
          variant={themeVariants.variant === 'dark' ? "outline-info" : "info"}
          onClick={() => moveIngredientDown(index)}
        >
          <i className="bi bi-arrow-down-short"></i>
        </Button>
      );
    }
  };

  const ingredientIsVal = (index) => {
    if (typeof errors.ingredientsError === "undefined") {      
      return false;
    }
    
    if (typeof errors.ingredientsError[index] === "undefined") {
      return false;
    } else if (typeof errors.ingredientsError[index] !== "undefined") {
      return true;
    }

  }

    return (
        <Form.Group controlId="Ingredients" className="mb-4">
        <Form.Label className="ps-2">Ingredients</Form.Label>
        <ListGroup 
          as="ul"         
          variant={themeVariants.variant} 
          data-bs-theme={themeVariants['data-bs-theme']}
          numbered
          >
        {ingredients.map((ingredient, index) => (
          <ListGroup.Item 
            key={index}
            variant={themeVariants.variant}
            className="d-flex justify-content-between list-item-cont">
              
            <Form.Group className="ingTextArea" >
            <Form.Control 
              as="textarea"
              type="text"      
              value={ingredient} 
              data-bs-theme={themeVariants['data-bs-theme']}
              onChange={(e) => onChangeIngredients(index, e)}        
              isInvalid={ingredientIsVal(index)}
            >
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.ingredientsError !== undefined && errors.ingredientsError[`${index}`]  }
            </Form.Control.Feedback> 
            </Form.Group> 

            <Container className="ingControlContainer d-flex p-0">
            <Container className={`arrowContainer d-flex flex-column p-0 ${index === 0 ? 'justify-content-end' : ''}`}>
              {UpBtnVisible(index)}
              {DownBtnVisible(index)}
            </Container>

            <Container className="ingBtnContainer">          
              <Button   
                variant={themeVariants.variant === 'dark' ? "outline-danger" : "danger"} 
                className="ing-smaller-btn border-0"                   
                onClick={(e) => removeIngredient(index)}
                > 
                  {/* <i className="bi bi-x-octagon h6"></i> */}
                  <i className="bi bi-trash"></i>
                </Button>
            </Container> 

            </Container>
          </ListGroup.Item>                     
          
        ))}
        </ListGroup>
        <Row xs="auto" className="d-flex justify-content-end px-3 my-3">
          <Button 
            variant= {themeVariants.variant === 'dark' ? "outline-primary" : "primary"}
            className="smaller-btn"
            onClick={(e) => addIngredient()}
          >Add Ingredient</Button>
          
        </Row>
      </Form.Group>

    );
};
export default IngredientList;