import React, {useState} from "react";
import { Button, Form, ListGroup, Container, Row, ModalDialog } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';


const IngredientList = ({
  ingredients,
  currentRecipe,
  setCurrentRecipe,
  setErrors,
  themeVariants,
  errors
  
}) => {

  const [removeIngModal, setRemoveIngModal] = useState(false);
  const [nothingToMoveModal, setNothingToMoveModal] = useState(false);
  const [stopAddIngModal, setStopAddIngModal] = useState(false); 
  const [currentIndex, setcurrentIndex] = useState(null);

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
  const showRemoveIngModal = (index) => { 
      setcurrentIndex(index);
      setRemoveIngModal(true);
  }
  const hideRemoveIngModal = () => setRemoveIngModal(false);

  const delBtnVisible = (index) => {
    if(index > 0){
      return(
        <Button     
        variant='outline-danger'
        className="ing-smaller-btn border-0"      
        onClick={(e) => showRemoveIngModal(index)}
        > 
          <i className="bi bi-trash"></i>
        </Button>
  )}}

  const addBtnVisible = (index) => {
        if (currentRecipe.ingredients.length === 0 ) {
            return (
                <Button 
                variant='outline-success'
                className="ing-smaller-btn border-0" 
                onClick={(e) => addIngredient()}
                >
                    <i className="bi bi-plus-square"></i>
                </Button>
            )      
        } else if (currentRecipe.ingredients[index].trim().length > 0 
                    && index === currentRecipe.ingredients.length -1) {
                return (
                    <Button 
                    variant='outline-success'
                    className="ing-smaller-btn border-0" 
                    onClick={(e) => addIngredient()}
                    >
                        <i className="bi bi-plus-square"></i>
                    </Button>
                )
        }           
  }

  const removeIngredient = (index) => {
      if(currentRecipe.ingredients.length > 0) {        
        const newIngredients = currentRecipe.ingredients.filter((ingredient, i) => i !== currentIndex);  
        setCurrentRecipe({ ...currentRecipe, ingredients: newIngredients});

        //remove any error object associated with deleted field
        const {ingredientsError = {}, ...validationErrors } = errors;
        const { [`${currentIndex}`]: removedError, ...newIngredientsError } = ingredientsError || {};  
        if (Object.keys(newIngredientsError).length > 0 ){
          validationErrors.ingredientsError = newIngredientsError;
        }      
        setErrors(validationErrors);  

        hideRemoveIngModal();
        setcurrentIndex(null);
      }
  }
 

  const showStopAddIngModal = () => { 
    setStopAddIngModal(true);
  };

  const hideStopAddIngModal = () => setStopAddIngModal(false);

  const addIngredient = () => {
    if((currentRecipe.ingredients.length > 0 && 
    currentRecipe.ingredients[currentRecipe.ingredients.length -1].trim() !== "") 
     || currentRecipe.ingredients.length === 0 ) {
      const newIngredients = [ ...currentRecipe.ingredients, ""];
      setCurrentRecipe({ ...currentRecipe, ingredients: newIngredients});
      //create error for new empty field
      const { ...validationErrors } = errors;
      validationErrors.ingredientsError = { [currentRecipe.ingredients.length]: 'Field Empty' };
      setErrors(validationErrors);    
    } else {
      showStopAddIngModal();
    }
  }

  const showNothingToMoveModal = () => { 
    // setcurrentIndex(index);
    setNothingToMoveModal(true);
  }
  const hideNothingToMoveModal = () => setNothingToMoveModal(false);

  const moveIngredientUp = (index) => {    
    if(currentRecipe.ingredients[index].trim() === "" ||
    currentRecipe.ingredients[index -1].trim() === ""){
      showNothingToMoveModal(index);     
    } else {
      const toMoveUp = currentRecipe.ingredients[index];
      const toMoveHere = currentRecipe.ingredients[index -1];
      const newIngredients = [... currentRecipe.ingredients];

      newIngredients[index-1] = toMoveUp;
      newIngredients[index] = toMoveHere;      
      setCurrentRecipe({...currentRecipe, ingredients: newIngredients}); 
    }
    
  }  

  const moveIngredientDown = (index) => {
    if(currentRecipe.ingredients[index].trim() === "" ||
    currentRecipe.ingredients[index +1].trim() === ""){
      showNothingToMoveModal(index);     
    } else {
      const toMoveDown = currentRecipe.ingredients[index];
      const toMoveHere = currentRecipe.ingredients[index +1];
      const newIngredients = [... currentRecipe.ingredients];

      newIngredients[index+1] = toMoveDown;
      newIngredients[index] = toMoveHere;  
      setCurrentRecipe({...currentRecipe, ingredients: newIngredients}); 
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

              <Modal
                  show={nothingToMoveModal}
                  onHide={hideNothingToMoveModal}
                  backdrop="static"
                  keyboard={false}
                  data-bs-theme={themeVariants['data-bs-theme']}       
                  className={themeVariants.variant}
                  centered
                >
                  <Modal.Header  closeButton >
                    <Modal.Title >Unable to move Ingredient</Modal.Title>
                  </Modal.Header>
                  <Modal.Body >
                    Field Empty. Please add ingredient before moving.
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="primary" onClick={hideNothingToMoveModal}>
                      OK
                    </Button>
                  </Modal.Footer>
                </Modal>
            </Container>

            <Container className="ingBtnContainer">    
              {delBtnVisible(index)} 
              {addBtnVisible(index)}
                <Modal
                  show={removeIngModal}
                  onHide={hideRemoveIngModal}
                  backdrop="static"
                  keyboard={false}
                  data-bs-theme={themeVariants['data-bs-theme']}       
                  className={themeVariants.variant}
                  centered
                >
                  <Modal.Header  closeButton >
                    <Modal.Title >Remove Ingredient</Modal.Title>
                  </Modal.Header>
                  <Modal.Body >
                    {typeof  currentRecipe.ingredients[currentIndex] === "undefined" ? 
                    `` 
                      : currentRecipe.ingredients[currentIndex].trim().length === 0 ? 
                        `Are you sure you want to remove this ingredient` :  
                        `Are you sure you want to remove '${currentRecipe.ingredients[currentIndex]}'?`}                   
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={hideRemoveIngModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={(e) => removeIngredient()}>Yes</Button>
                  </Modal.Footer>
                </Modal>
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

            <Modal
              show={stopAddIngModal}
              onHide={hideStopAddIngModal}
              backdrop="static"
              keyboard={false}
              data-bs-theme={themeVariants['data-bs-theme']}       
              className={themeVariants.variant}
              centered
            >
              <Modal.Header  closeButton >
                <Modal.Title >Unable to add Ingredient</Modal.Title>
              </Modal.Header>
              <Modal.Body >
                Please fill in the last ingredient field before adding a new one
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={hideStopAddIngModal}>
                  OK
                </Button>
              </Modal.Footer>
            </Modal>
          
        </Row>
      </Form.Group>

    );
};
export default IngredientList;