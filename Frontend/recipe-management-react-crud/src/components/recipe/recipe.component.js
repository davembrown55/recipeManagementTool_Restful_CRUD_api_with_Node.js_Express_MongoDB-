import React, { useState, useEffect, useCallback } from "react";
import useRecipeService from "../../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';
import IngredientList from "./ingredient-list.component";
import InstructionList from "./instruction-list.component";
import DietsList from "./diet-list.component";

const Recipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});  

  const { get, update, remove } = useRecipeService();

  const [currentRecipe, setCurrentRecipe] = useState({
    id: null,
    title: "",
    description: "",
    published: false,
    cookingTimeMinutes: 0,
    ingredients: [""],
    instructions: [""], 
    diets: [""]
  });

  const [prevRecipeOnDB, setPrevRecipeOnDB] = useState({
    id: null,
    title: "",
    description: "",
    published: false,
    cookingTimeMinutes: 0,
    ingredients: [""],
    instructions: [""], 
    diets: [""]
  });



  useEffect(() => {       
    const {recipeEmpty, noInstructions, noIngredients,  ...validationErrors} = errors;
    if (currentRecipe.title.trim().length === 0 &&
    currentRecipe.description.trim().length === 0 &&
    (currentRecipe.cookingTimeMinutes === 0 || currentRecipe.cookingTimeMinutes === null) &&
    (currentRecipe.ingredients.length === 0 || (currentRecipe.ingredients.length === 1 && currentRecipe.ingredients[0].trim() === "" )) &&
    (currentRecipe.instructions.length ===  0 || (currentRecipe.instructions.length === 1 && currentRecipe.instructions[0].trim() === "")) 
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



  const [noChangesToRecipe, setNoChangesToRecipe] = useState(false);
  const [updateRecipeModal, setUpdateRecipeModal] = useState(false);
  const [deleteRecipeModal, setDeleteRecipeModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {   
    const getRecipe = async (idParam) => {
      try {
        const data = await get(idParam);
        const {...recipe} = data;
        
        if (!Array.isArray(recipe.ingredients)) {
          recipe.ingredients = [""];
        }
        if (!Array.isArray(recipe.instructions)) {
          recipe.instructions = [""];
        }
        setCurrentRecipe({ ...recipe});
        setPrevRecipeOnDB({...recipe});  
  
      } catch (e) {
        console.error(e);
      }
    };

    getRecipe(id);

  }, [id]);

  useEffect(() => {
    if (message) {
      const submitMessage = document.getElementsByClassName("rcpMessageTxt");

      if (submitMessage.length > 0) {
        submitMessage[0].style.visibility = "visible";
        submitMessage[0].style.opacity = "1";
        submitMessage[0].style.transition = "visibility 0s linear 0s, opacity 700ms"; 

        const timerFadeOut = setTimeout(() => {
          if (submitMessage.length > 0) { 
            submitMessage[0].style.visibility = "hidden";
            submitMessage[0].style.opacity = "0";
            submitMessage[0].style.transition = "visibility 0s linear 300ms, opacity 1000ms";
          }
        }, 2500);      

        const timer = setTimeout(() => {
          setMessage("");
        }, 3000);

        return () => {
          clearTimeout(timer);
          clearTimeout(timerFadeOut);

        }
      }
    }
  }, [message]);


  const onChangeTitle = (e) => {
    const title = e.target.value;
    setCurrentRecipe({ ...currentRecipe, title });

    const {titleError, ...validationErrors} = errors;  
    if (title.trim().length === 0 ){
      validationErrors.titleError = 'Field Empty';
    } 
    setErrors(validationErrors);    
  };

  const onChangeDescription = (e) => {
    const description = e.target.value;    
    setCurrentRecipe({ ...currentRecipe, description });

    const {descriptionError, ...validationErrors} = errors;
    if (description.trim().length === 0 ){
      validationErrors.descriptionError = 'Field Empty';
    } 
    setErrors(validationErrors);
  };


  const onChangeCookingTimeMinutes = (e) => {
    const cookingTimeMinutes = parseInt(e.target.value, 10) || 0;
    setCurrentRecipe({ ...currentRecipe, cookingTimeMinutes }); // Parse the input value to an integer

    // create a validationErrors obj from errors without any cookTimeError objects
    const {cookTimeError, ...validationErrors} = errors;    

    //validation
    if (isNaN(cookingTimeMinutes)) {      
      validationErrors.cookTimeError = 'Please enter a valid number.';
    }  else if (cookingTimeMinutes <= 0) {
      validationErrors.cookTimeError = 'Field Empty or invalid cooking time.';
    } 
    setErrors(validationErrors);
  };


  const updatePublished = async (status) => {
    try {
      const data = {
        id: currentRecipe.id,
        published: status
      };
      
     const response = await update(currentRecipe.id, data);

     setCurrentRecipe({ ...currentRecipe, published: status });
     setPrevRecipeOnDB({ ...currentRecipe, published: status });
     console.log(response);
     setMessage("The Recipe was updated successfully!")

    } catch (e) {
      console.error(e);
    }
  };

  
  function isObjEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false;
    }
  
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) return false;
  
    for (let key of keys1) {
      if (!keys2.includes(key) || !isObjEqual(obj1[key], obj2[key])) {
        return false;
      }
    }  
    return true;
  }

  const showUpdateRecipeModal = () => {
    setNoChangesToRecipe(isObjEqual(currentRecipe, prevRecipeOnDB));
    setUpdateRecipeModal(true); 
  } 
  const hideUpdateRecipeModal = () => setUpdateRecipeModal(false);

  const checkDietsForEmptyFields = () => {
    const newDietArray = currentRecipe.diets.filter((diet, i) => diet.trim() !== "" );
    const updatedRecipe = {...currentRecipe, diets:newDietArray};
    return updatedRecipe;  
  }
  const updateRecipe = async () => {
    if(Object.keys(errors).length !== 0) {return;} // Stop the function if validation fails    
    try{
      const recipeData = checkDietsForEmptyFields();

      const response = await update(currentRecipe.id, recipeData);
      console.log(response);
      setMessage("The Recipe was updated successfully!");
      setPrevRecipeOnDB({...currentRecipe}); // update prevRecipeOnDB for next comparison    

    } catch (e) {
      console.error(e);
    }
    hideUpdateRecipeModal();
  }

  const deleteRecipe = async() => {    
    try {
      const response = await remove(currentRecipe.id);
      console.log(response);
      navigate('/Recipes');
    } catch (e) {
      console.error(e);
    }
  }

  const showDeleteRecipeModal = () => setDeleteRecipeModal(true);  
  const hideDeleteRecipeModal = () => setDeleteRecipeModal(false);


  const { themeVariants } = useTheme(); 

  const btnDisabledTxt = () => {
    if (Object.keys(errors).length === 0){}

    if (Object.keys(errors).length > 0) {
      let valFailMessage = {errMess: `Unable to update '${currentRecipe.title}'.`};

      for (const [key, value] of Object.entries(errors)) {
        if (typeof errors.recipeEmpty === "undefined") {
          switch (key) {
            case 'titleError': 
              valFailMessage.titleError = `Title: ${value}`
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
            case 'noIngredients': 
              valFailMessage.noIngredients = `${value}`
              break;
            case 'noInstructions': 
              valFailMessage.noInstructions = `${value}`
              break;            
          } 
        }
        else if (key === "recipeEmpty" ){
          valFailMessage.recipeEmpty = `${value}. Nothing to add to database yet.`
        }        
      }
      return  Object.keys(valFailMessage).map((item,index) => {
        return (<p key={index} >{valFailMessage[item]}</p>)
      })
    }
  }
  


  return (
    
    <Container fluid className="d-flex justify-content-center">
      <Col xs={12} sm={12} md={10} lg={8} className="d-flex justify-content-center">

        {currentRecipe ? (
          <Card 
            bg={themeVariants.variant === 'dark' ? 'dark' : ''}
            key={themeVariants.variant}
            text={themeVariants.text}
            className="mb-3 w-100 recipeCard"
          >
            <Card.Title as="h4" className="recipeCardTitle">Recipe </Card.Title>
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

                <Form.Group className="mb-5">
                  <Form.Label className="ps-2">Status</Form.Label>
                  <Form.Control
                      type="text"
                      value={currentRecipe.published ? "Published" : "Pending"} 
                      data-bs-theme={themeVariants['data-bs-theme']}
                      className="responsive-width-form"                    
                      readOnly                    
                    >
                    </Form.Control>
                </Form.Group>


              </Form>

                <Row xs="auto" className="justify-content-center gap-3">
                  {currentRecipe.published ? (
                      <Button
                        onClick={() => updatePublished(false)}
                        className="btn-warning"
                        disabled={Object.keys(errors).length > 0} 
                      >Make Private 
                      </Button>
                      ) : (
                      <Button
                        className="btn-success"
                        onClick={() => updatePublished(true)}
                        disabled={Object.keys(errors).length > 0} 
                      >Publish 
                      </Button>

                    )}
                    <Button
                    className="btn-danger"
                    onClick={() => showDeleteRecipeModal()}
                      >Delete
                    </Button>

                    <Modal
                    show={deleteRecipeModal}
                    onHide={hideDeleteRecipeModal}
                    backdrop="static"
                    keyboard={false}
                    data-bs-theme={themeVariants['data-bs-theme']}       
                    className={themeVariants.variant}
                    centered
                  >
                    <Modal.Header  closeButton >
                      <Modal.Title >Delete Recipe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                      Are you sure you want to delete: {currentRecipe.title}?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={hideDeleteRecipeModal}>
                        Close
                      </Button>
                      <Button variant="primary" onClick={(e) => deleteRecipe()}>Yes</Button>
                    </Modal.Footer>
                  </Modal>  

                    <Button
                    className="primary"
                    disabled={Object.keys(errors).length > 0} // disable update button if val failed and error object not empty
                        onClick={() => showUpdateRecipeModal()}
                      >Update
                    </Button>
              
                    <Modal
                    show={updateRecipeModal}
                    onHide={hideUpdateRecipeModal}
                    backdrop="static"
                    keyboard={false}
                    data-bs-theme={themeVariants['data-bs-theme']}       
                    className={themeVariants.variant}
                    centered
                  >
                    <Modal.Header  closeButton >
                      <Modal.Title >Update Recipe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                      {noChangesToRecipe ? `No changes to update!`:
                       `Are you sure you want update: ${currentRecipe.title}?`}                      
                    </Modal.Body>
                    <Modal.Footer>
                      <Button 
                        variant={noChangesToRecipe ? "primary": "secondary"}
                        onClick={hideUpdateRecipeModal}>
                        Close
                      </Button>
                      {!noChangesToRecipe &&
                      <Button variant="primary" onClick={(e) => updateRecipe()}>Yes</Button>}
                    </Modal.Footer>
                  </Modal>  

                </Row>   
                <Container className="updateMessages"> 
                  <Row className="mt-3 btnDisableTxt">{btnDisabledTxt()}</Row> 
                  <Row className="mt-3  rcpMessageTxt">{<p>{message}</p>}</Row> 
                </Container> 
            </Card.Body>
          </Card>
        ) : (
            <div>
              <br />
              <p>Please click on a Recipe...</p>
            </div>
        )}  
     </Col>
    </Container>        
  
  );
};

export default Recipe;
