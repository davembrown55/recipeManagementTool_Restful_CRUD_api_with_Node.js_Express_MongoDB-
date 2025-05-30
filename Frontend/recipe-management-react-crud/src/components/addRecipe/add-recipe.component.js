import React, { useState, useEffect } from "react";
import useRecipeService from "../../services/recipe.service";
import {useNavigate} from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import {Container, ListGroup} from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { useTheme} from '../../common/ThemeProvider';
import IngredientList from "./ingredient-list.addR.component";
import InstructionList from "./instruction-list.addR.component";
import DietsList from "./diet-list.addR.component";
import MealTypeList from "./mealType-list.addR.component";
import { useAuth } from "../../auth/AuthContext";

const AddRecipe = () => {
const { userRole, userName, verify } = useAuth();
const [currentRecipe, setCurrentRecipe] = useState({
    id: null,
    title: "",
    description: "",
    published: false,
    cookingTimeMinutes: 0,
    ingredients: [""],
    instructions: [""], 
    diets: [""], 
    mealTypes: [""]
});

const {create} = useRecipeService();
const [unauthorisedModal, setUnauthorisedModal] = useState(false);
const [serverCallErrorMessage, setServerCallErrorMessage] = useState(null);
const [serverCallError, setServerCallError] = useState(false);
const [published, setPublished] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [errors, setErrors] = useState({
  recipeEmpty: "Recipe Empty",
  initialTitleError: "Title field empty",
  initialDescriptionError: "Description field empty",
  initialCookingTimeError: "Cooking time set to zero"
}); 
const navigate = useNavigate();

const hideUnauthorisedModal = () => {      
    setUnauthorisedModal(false);  
    if (typeof serverCallErrorMessage.status !== 'undefined' 
        && serverCallErrorMessage.status === 401) {
          verify(); 
          navigate('/Recipes');
        }    
    setServerCallErrorMessage(null);
    setServerCallError(false);
}

useEffect(() => {       
    const {recipeEmpty, noInstructions, noIngredients,  ...validationErrors} = errors;
    if (currentRecipe.title.trim().length === 0 &&
    currentRecipe.description.trim().length === 0 &&
    (currentRecipe.cookingTimeMinutes === 0 || currentRecipe.cookingTimeMinutes === null) &&
    (currentRecipe.ingredients.length === 0 || 
      (currentRecipe.ingredients.length === 1 && currentRecipe.ingredients[0].trim() === "" )) &&
    (currentRecipe.instructions.length ===  0 ||
       (currentRecipe.instructions.length === 1 && currentRecipe.instructions[0].trim() === "")) 
    ) {      
      validationErrors.recipeEmpty = 'Recipe Empty';  
    } else {
      if(currentRecipe.instructions.length === 0 || 
        (currentRecipe.instructions.length === 1 && currentRecipe.instructions[0].trim() === "")) {
          validationErrors.noInstructions = 'No instructions. Please add some.';
      }
      if(currentRecipe.ingredients.length === 0 || 
        (currentRecipe.ingredients.length === 1 && currentRecipe.ingredients[0].trim() === "")) {
          validationErrors.noIngredients = 'No ingredients. Please add some.';
      }
    }
    setErrors(validationErrors);  
}, [currentRecipe.title, currentRecipe.description, currentRecipe.cookingTimeMinutes, 
  currentRecipe.ingredients, currentRecipe.instructions]);

const hideSubmitRecipeModal = () => {
    resetRecipe();
    setSubmitted(false);
}

const resetRecipe = () => {
    setCurrentRecipe({
        id: null,
        title: "",
        description: "",
        published: false,
        cookingTimeMinutes: 0,
        ingredients: [""],
        instructions: [""], 
        diets: [""], 
        mealTypes: [""]
    });
    
}

const updatePublished = (status) => {
  const published = status;
  setCurrentRecipe({ ...currentRecipe, published });
}

const goToRecipeList = () => {    
    navigate('/Recipes');
}

const onChangeTitle = (e) => {
    const title = e.target.value;
    setCurrentRecipe({ ...currentRecipe, title });

    const {titleError, initialTitleError, ...validationErrors} = errors;  
    if (title.trim().length === 0 ){
        validationErrors.titleError = 'Field Empty'; 
    } 
    setErrors(validationErrors);    
};

const onChangeDescription = (e) => {
    const description = e.target.value;    
    setCurrentRecipe({ ...currentRecipe, description });

    const {descriptionError, initialDescriptionError, ...validationErrors} = errors;
    if (description.trim().length === 0 ){
        validationErrors.descriptionError = 'Field Empty';
    } 
    setErrors(validationErrors);
};

const onChangeCookingTimeMinutes = (e) => {  
    const cookingTimeMinutes = parseInt(e.target.value, 10) || 0;

    setCurrentRecipe({ ...currentRecipe, cookingTimeMinutes });
    // create a validationErrors obj from errors without any cookTimeError objects
    const {cookTimeError, initialCookingTimeError, ...validationErrors} = errors;  
    //validation
    if (isNaN(cookingTimeMinutes)) {      
        validationErrors.cookTimeError = 'Please enter a valid number.';
    }  else if (cookingTimeMinutes <= 0){
        validationErrors.cookTimeError = 'Field Empty or invalid cooking time.';
    } 
    setErrors(validationErrors);
};

const checkArraysForEmptyFields = () => {
  const newDietArray = currentRecipe.diets.filter((diet, i) => diet.trim() !== "" );
  const newMealTypeArray = currentRecipe.mealTypes.filter((mt, i) => mt.trim() !== "" );
  const updatedRecipe = {...currentRecipe, diets:newDietArray, mealTypes:newMealTypeArray};
    return updatedRecipe;

}

// Save recipe to the database
const saveRecipe = async () => {  
  try{
    // dont include diets if empty
    const data = checkArraysForEmptyFields();
    const response = await create(data);    
    setSubmitted(true);
    resetRecipe();
  } catch (e) {
    // if(e.response.status === 401 ) {
    //   setUnauthorisedModal(true);
    // } else {
    //   verify();
    // }
    //
    if(typeof e.response.status !== 'undefined' && [ 400, 401, 404, 500 ].find((i) => i === e.response.status)) {
      
      let status = e.response.status;
      if (status === 400 && typeof e.response.data.errors !== 'undefined') {
          // Validation errors
          // turn  [{ msg: 'foo' }, { msg: 'bar' }]  into  [ <p>foo</p>, <p>bar</p> ]
          const errorMessage = e.response.data.errors.map((e, i) => (
            <p key={i}>Error in {e.path} field: {e.msg}</p>
        )); 
        setServerCallErrorMessage({
          status: status,
          msg: errorMessage
        });
      } else if (status === 401) {
        setServerCallErrorMessage({
          status: status,
          msg: e.response.data.msg || `Not authorised to add recipe: ${currentRecipe.title}`
        });
      } else if (status === 404) {
        setServerCallErrorMessage({
          status: status,
          msg: e.response.data.msg || `404: Not found`
        });
      } else {              
        setServerCallErrorMessage({
          status: status,
          msg: e.response.data.msg || `failed to add ${currentRecipe.title}`
        });
      }
      setUnauthorisedModal(true);
      setServerCallError(true);
    } else {
      verify();
    }
    //


  }
}

const { themeVariants } = useTheme(); 

const btnDisabledTxt = () => {
    if (Object.keys(errors).length === 0){}

    if (Object.keys(errors).length > 0) {
    let valFailMessage = {errMess: "Unable to submit."};

    for (const [key, value] of Object.entries(errors)) {
      if (typeof errors.recipeEmpty === "undefined") {
        switch (key) {
          case 'titleError': 
              valFailMessage.titleError = `Title: ${value}`
              console.log(JSON.stringify(errors));
              break;
          case 'descriptionError': 
              valFailMessage.descriptionError = `Decription: ${value}`
              break;
          case 'cookTimeError': 
              valFailMessage.cookTimeError = `Cooking Time: ${value}`
              break;
          case 'ingredientsError': 
              for (const [key, value] of Object.entries(errors.ingredientsError)) {
              let ixInList = parseInt(key) + 1;
              let newKey = `ingredient${key}Error`
              valFailMessage[newKey] = `Ingredient (${(ixInList)}): ${value}`;
              }
              break;
          case 'instructionsError': 
              for (const [key, value] of Object.entries(errors.instructionsError)) {
              let ixInList = parseInt(key) + 1;
              let newKey = `instructions${key}Error`
              valFailMessage[newKey] = `Instruction (${(ixInList)}): ${value}`;
              }
              break;
          case 'initialTitleError':              
                valFailMessage.InitialTitleEmpty = `${value}.`              
              break;            
          case 'initialDescriptionError':              
                valFailMessage.InitialDescriptionEmpty = `${value}.`              
              break;            
          case 'initialCookingTimeError':                        
                valFailMessage.InitialCookingTimeEmpty = `${value}.`              
              break;
          case 'noInstructions':
                valFailMessage.noInstructions = `${value}`
              break;
          case 'noIngredients':
                valFailMessage.noIngredients = `${value}`
              break;
        }
      } else if (key === "recipeEmpty" ){
        valFailMessage.recipeEmpty = `${value}. Nothing to add to database yet.`
      }
    }
    return  Object.keys(valFailMessage).map((item,index) => {
        return (<p key={index} >{valFailMessage[item]}</p>)
    })
    }
}

return (
<Container className="d-flex justify-content-center">

    {submitted ? (
        <Modal
        show={submitted}
        onHide={hideSubmitRecipeModal}
        backdrop="static"
        keyboard={false}
        data-bs-theme={themeVariants['data-bs-theme']}       
        className={themeVariants.variant}
        centered
        >
        <Modal.Header  closeButton >
        <Modal.Title >New Recipe: {currentRecipe.title} submitted successfully!</Modal.Title>
        </Modal.Header>
        <Modal.Body >
        Add another? 
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={(e) => goToRecipeList()}>No</Button>
        <Button variant="primary" onClick={(e) => hideSubmitRecipeModal()}>Yes</Button>
        </Modal.Footer>
        </Modal>  
        
    ) : (
        
        <Col xs={12} md={10} lg={8} className="d-flex justify-content-center">
          <Modal
              show={unauthorisedModal}
              onHide={hideUnauthorisedModal}
              backdrop="static"
              keyboard={false}
              data-bs-theme={themeVariants['data-bs-theme']}       
              className={themeVariants.variant}
              centered
          >
              <Modal.Header  closeButton >
              <Modal.Title >{serverCallError && typeof serverCallErrorMessage.status !== 'undefined' && serverCallErrorMessage.status === 401 ? 'Unauthorised' : 'Error'}</Modal.Title>
              </Modal.Header>
              <Modal.Body >
                {(serverCallError && typeof serverCallErrorMessage.msg !== 'undefined') && serverCallErrorMessage.msg } {/*Access Denied*/}
              </Modal.Body>
              <Modal.Footer>
              <Button variant="secondary" onClick={hideUnauthorisedModal}>
                  Close
              </Button>    
              </Modal.Footer>
            </Modal>  
        <Card 
            bg={themeVariants.variant === 'dark'  &&  'dark'} 
            key={themeVariants.variant}
            text={themeVariants.text}
            className="mb-3 w-100 recipeCard"
          >
            <Card.Title as="h4" className="recipeCardTitle">Add Recipe</Card.Title>
            <Card.Body>
              <Form>
                <Form.Group controlId="title" className="mb-4">
                  <Form.Label className="ps-2">Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentRecipe.title} 
                      data-bs-theme={themeVariants['data-bs-theme']}    
                      onChange={onChangeTitle}
                      isInvalid={!!errors.titleError} 
                      placeholder="Enter Title"
                    >
                    </Form.Control>
                    <Form.Control.Feedback className="" type="invalid">
                      {errors.titleError}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="description" className="mb-4">
                  <Form.Label className="ps-2">Description</Form.Label>
                    <Form.Control
                      type="text"                      
                      value={currentRecipe.description} 
                      data-bs-theme={themeVariants['data-bs-theme']}
                      onChange={onChangeDescription}
                      isInvalid={!!errors.descriptionError} 
                      placeholder="Enter Description"
                    >
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.descriptionError}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="CookingTime" className="mb-4">
                  <Form.Label className="ps-2">Cooking time in minutes</Form.Label>
                    <Form.Control
                      type="text"                      
                      value={currentRecipe.cookingTimeMinutes} 
                      data-bs-theme={themeVariants['data-bs-theme']}
                      onChange={onChangeCookingTimeMinutes}
                      className="responsive-width-form"
                      isInvalid={!!errors.cookTimeError}                        
                    >
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.cookTimeError}
                    </Form.Control.Feedback>
                </Form.Group>

                <IngredientList 
                    ingredients={currentRecipe.ingredients}
                    currentRecipe={currentRecipe}
                    setCurrentRecipe={setCurrentRecipe}     
                    setErrors={setErrors}
                    themeVariants={themeVariants}
                    errors={errors}
                  />

                <InstructionList 
                    currentRecipe={currentRecipe}
                    setCurrentRecipe={setCurrentRecipe}
                    instructions={currentRecipe.instructions}
                    setErrors={setErrors}
                    themeVariants={themeVariants}
                    errors={errors}
                  />

                <DietsList 
                    currentRecipe={currentRecipe}
                    setCurrentRecipe={setCurrentRecipe}
                    diets={currentRecipe.diets}
                    themeVariants={themeVariants}
                    errors={errors}
                  />
                
                <MealTypeList 
                    currentRecipe={currentRecipe}
                    setCurrentRecipe={setCurrentRecipe}
                    mealTypes={currentRecipe.mealTypes}
                    themeVariants={themeVariants}
                  />

                <Form.Group className="mb-5">
                  <Form.Label className="ps-2">Status</Form.Label>
                    <ListGroup 
                    as="ul"         
                    variant={themeVariants.variant} 
                    data-bs-theme={themeVariants['data-bs-theme']}        
                    >
                      <ListGroup.Item                         
                        variant={themeVariants.variant}
                        className="d-flex justify-content-between list-item-cont responsiveStatus"
                      >                                
                        <Container className="changeStatusContainer">
                          <p className="text-start">Publish recipe now?</p>  
                          
                          <Button
                            className="primary smaller-btn"
                            onClick={() => updatePublished(true)}
                          >Yes</Button>
                          <Button 
                            variant="secondary smaller-btn"
                            onClick={() => updatePublished(false)}
                          >No</Button>
                        </Container> 
                        <Container className="publishStatusContainer">                        
                          <Form.Control
                              type="text"
                              value={currentRecipe.published ? "Publish" : "Pending"} 
                              data-bs-theme={themeVariants['data-bs-theme']}
                              className="publishStatusWidth"                      
                              readOnly          
                            >
                          </Form.Control>
                        </Container>  
                      </ListGroup.Item> 
                    </ListGroup>
                  </Form.Group>
              </Form>

                <Row xs="auto" className="justify-content-center gap-3">
                       <Button 
                        onClick={saveRecipe} 
                        disabled={Object.keys(errors).length > 0}
                        className="btn btn-success">
                         Submit
                       </Button>
                </Row>   
                <Container className="updateMessages"> 
                  <Row className="mt-3 btnDisableTxt">{btnDisabledTxt()}</Row> 
                </Container> 
            </Card.Body>
          </Card>

        </Col>
    )}      
    </Container>

  );
};

export default AddRecipe;
