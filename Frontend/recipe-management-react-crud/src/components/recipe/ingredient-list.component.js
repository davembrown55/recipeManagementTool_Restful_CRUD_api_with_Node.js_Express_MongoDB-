import React from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';



const IngredientList = ({
  ingredients,
  currentRecipe,
  setCurrentRecipe,
  setErrors,
  themeVariants,
  errors
  
}) => {

  const onChangeIngredients = (index, e) => {
    const newIngredient = e.target.value;
     // Update the ingredients array
    const newIngredients = currentRecipe.ingredients.map((ingredient, i) => {
      return i === index ? newIngredient : ingredient;
    });
    setCurrentRecipe({ ...currentRecipe, ingredients: newIngredients });

    // Destructure errors, excluding the specific ingredientError object and add to validationErrors    
    const { ingredientsError = {}, ...validationErrors } = errors ;

    // Create a copy of ingredientsError without any current index errors
    const { [`${index}`]: removedError, ...newIngredientsError } = ingredientsError || {};

    const newIngredientErrorEmpty = Object.keys(newIngredientsError).length === 0;

    if (newIngredient.trim().length === 0) {
      // Failed validation add new error to validationErrors.ingredientsError
      validationErrors.ingredientsError = { ...newIngredientsError, [index]: 'Field Empty' };
    } else if (!newIngredientErrorEmpty && newIngredient.trim().length > 0) {
      // passed validation and there are other existing ingredientErrors. 
      // replace validationErrors.ingredientsError ensuring no error messages for this index.
      validationErrors.ingredientsError = newIngredientsError; 
    }

    setErrors(validationErrors);
  }

  const removeIngredient = (index) => {
    if(currentRecipe.ingredients.length > 0) {
      if(window.confirm("Are you sure you want to remove this ingredient?")) {
        const newIngredients = currentRecipe.ingredients.filter((ingredient, i) => i !== index);  
        setCurrentRecipe({ ...currentRecipe, ingredients: newIngredients});
      }
    }
  }

  const addIngredient = () => {
    if(currentRecipe.ingredients.length > 0 && 
    currentRecipe.ingredients[currentRecipe.ingredients.length -1].trim() !== "" ) {
      const newIngredients = [... currentRecipe.ingredients, ""];
      setCurrentRecipe({ ...currentRecipe, ingredients: newIngredients});
    } else {
      alert("Please fill in the last ingredient before adding a new one.");
    }
  }

  const moveIngredientUp = (index) => {    
    if(currentRecipe.ingredients[index].trim() !== ""){
      const toMoveUp = currentRecipe.ingredients[index];
      const toMoveHere = currentRecipe.ingredients[index -1];
      const newIngredients = [... currentRecipe.ingredients];

      newIngredients[index-1] = toMoveUp;
      newIngredients[index] = toMoveHere;      
      setCurrentRecipe({...currentRecipe, ingredients: newIngredients});      
    } else {
      alert("There is no ingredient here yet.")
    }
    
  }  

  const moveIngredientDown = (index) => {
    if(currentRecipe.ingredients[index].trim() !== ""){
      const toMoveDown = currentRecipe.ingredients[index];
      const toMoveHere = currentRecipe.ingredients[index +1];
      const newIngredients = [... currentRecipe.ingredients];

      newIngredients[index+1] = toMoveDown;
      newIngredients[index] = toMoveHere;  
      setCurrentRecipe({...currentRecipe, ingredients: newIngredients});      
    } else {
      alert("There is no ingredient here yet.")
    }
  }


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