import React, { useState, useEffect } from "react";
import useRecipeService from "../../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
// import { useTheme} from '../../common/ThemeProvider';
import IngredientList from "./ingredient-list.component";
import InstructionList from "./instruction-list.component";
import DietsList from "./diet-list.component";
import MealTypeList from "./mealType-list.component"


const UpdateRecipe = ({ currentRecipe,
                        setCurrentRecipe,
                        setPrevRecipeOnDB,
                        themeVariants,
                        prevRecipeOnDB,
                        isLoading, 
                        verify }) => {
    
    const [errors, setErrors] = useState({});  
    const [noChangesToRecipe, setNoChangesToRecipe] = useState(false);
    const [updateRecipeModal, setUpdateRecipeModal] = useState(false);
    const [deleteRecipeModal, setDeleteRecipeModal] = useState(false);
    const [serverCallError, setServerCallError] = useState(false);
    const [serverCallErrorMessage, setServerCallErrorMessage] = useState(null);
    const [serverCallSuccess, setServerCallSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const {update, remove } = useRecipeService();
    const navigate = useNavigate();

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

    useEffect(() => {
        if (message) {
          const submitMessage = document.getElementsByClassName("rcpMessageTxt");
    
          if (submitMessage.length > 0) {
            submitMessage[0].style.visibility = "visible";
            submitMessage[0].style.opacity = "1";
            submitMessage[0].style.transition = "visibility 0s linear 0s, opacity 1000ms"; // 700 
    
            const timerFadeOut = setTimeout(() => {
              if (submitMessage.length > 0) { 
                submitMessage[0].style.visibility = "hidden";
                submitMessage[0].style.opacity = "0";
                submitMessage[0].style.transition = "visibility 0s linear 300ms, opacity 1000ms";
              }
            }, 2500);      
    
            const timer = setTimeout(() => {
              setMessage("");
            }, 8000);
    
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
         setMessage("The Recipe was updated successfully!")
    
        } catch (e) {
          setServerCallError(true);
          setUpdateRecipeModal(true);

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
                msg: `Not authorised to update: ${currentRecipe.title}`
              });
            } else if (status === 404) {
              setServerCallErrorMessage({
                status: status,
                msg: `Recipe: ${currentRecipe.title} wasnt found in database`
              });
            } else {              
              setServerCallErrorMessage({
                status: status,
                msg: e.response.data.msg || `failed to update ${currentRecipe.title}`
              });
            }
          }

          // if (e.response.status === 401) {                  
          //   setServerCallErrorMessage({
          //     status:401,
          //     msg: `Not authorised to update: ${currentRecipe.title}`
          //   });
          // } else if (typeof(e.response.data.errors) !== 'undefined') {
          //   const Msg = e.response.data.errors.map((x) => {return x.msg}).join(', '); 
          //   setServerCallErrorMessage({
          //     status:400,
          //     msg:`Error: ${Msg}`
          //   });
          // } else if (e.response.status === 404) {
          //   setServerCallErrorMessage({
          //     status:404,
          //     msg: `Recipe: ${currentRecipe.title}, wasnt found in database`
          //   });
          // } else {
          //   setServerCallErrorMessage(`failed to update ${currentRecipe.title}`);
          // }     
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
    const hideUpdateRecipeModal = () => { 
        if (serverCallError && typeof serverCallErrorMessage.status !== 'undefined' 
            && serverCallErrorMessage.status === 401) {
          verify();
          navigate('/Recipes');
        } 
        setUpdateRecipeModal(false); 
        setServerCallError(false);
        setServerCallErrorMessage(null);
    };
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
          // hideUpdateRecipeModal();          

          // setMessage("The Recipe was updated successfully!");
          setMessage(response.msg);
          setPrevRecipeOnDB({...currentRecipe}); // update prevRecipeOnDB for next comparison    
          const {...recipe} = response.updatedRecipeData;
          if (!Array.isArray(recipe.ingredients)) {
            recipe.ingredients = [""];
          }
          if (!Array.isArray(recipe.instructions)) {
            recipe.instructions = [""];
          }
          if (!Array.isArray(recipe.diets)) {
            recipe.diets = [""];
          }
          if (!Array.isArray(recipe.mealTypes)) {
            recipe.mealTypes = [""];
          }      
          setCurrentRecipe({...recipe});    
        } catch (e) {
          // console.error(e);
          setServerCallError(true);      

          if(typeof e.response.status !== 'undefined' && [ 400, 401, 404, 500 ].find((i) => i === e.response.status)) {
            let status = e.response.status;
            if (status === 400 ) {
              if(typeof e.response.data.errors !== 'undefined') {
                  // Validation errors
                  // turn  [{ msg: 'foo' }, { msg: 'bar' }]  into  [ <p>foo</p>, <p>bar</p> ]
                  const errorMessage = e.response.data.errors.map((e, i) => (
                    <p key={i}>Error in {e.path} field: {e.msg}</p> 
                  )); 
                  setServerCallErrorMessage({
                    status: status,
                    msg: errorMessage
                  });
                } else {
                  setServerCallErrorMessage({
                    status: status,
                    msg: e.response.data.msg || `No valid fields to update`
                  });
                }                
            } else if (status === 401) {
              setServerCallErrorMessage({
                status: status,
                msg: `Not authorised to update: ${currentRecipe.title}`
              });
            } else if (status === 404) {
              setServerCallErrorMessage({
                status: status,
                msg: `Recipe: ${currentRecipe.title} wasnt found in database`
              });
            } else {              
              setServerCallErrorMessage({
                status: status,
                msg: e.response.data.msg || `failed to update ${currentRecipe.title}`
              });
            }
          }

          // if (e.response.status === 401) {        
          //   setServerCallErrorMessage(`Not authorised to update: ${currentRecipe.title}`);
          // } else if (typeof(e.response.data.errors) !== 'undefined') {
          //   const Msg = e.response.data.errors.map((x) => {return x.msg}).join(', '); 
          //   setServerCallErrorMessage(`Error: ${Msg}`);
          // } else if (e.response.status === 400) {
          //   setServerCallErrorMessage(`No valid fields to update`);
          // } else if (e.response.status === 404) {
          //   setServerCallErrorMessage(`Recipe: ${currentRecipe.title}, wasnt found in database`);
          // } else {
          //   setServerCallErrorMessage(`failed to update ${currentRecipe.title}`);
          // }     
        }    
    }

    const updateRecipeModalBodyContent = () => {
        if (noChangesToRecipe) {
          return `No changes to update!`;
        } else if (serverCallError) {
          return serverCallErrorMessage.msg;
        } else if (updateRecipeModal === false) {
          return null;
        } else if (message) {
          return message;
        }else {
          return `Are you sure you want to update: ${currentRecipe.title}?`;
        }  
    }
    const deleteRecipe = async() => {    
        try {
            await remove(currentRecipe.id);
            setServerCallSuccess(true);
        } catch (e) {
            setServerCallError(true);   
            
            if(typeof e.response.status !== 'undefined' && [ 400, 401, 404, 500 ].find((i) => i === e.response.status)) {
              let status = e.response.status;
              if (status === 400 ) {
                if(typeof e.response.data.errors !== 'undefined') {
                    // Validation errors
                    // turn  [{ msg: 'foo' }, { msg: 'bar' }]  into  [ <p>foo</p>, <p>bar</p> ]
                    const errorMessage = e.response.data.errors.map((e, i) => (
                      <p key={i}>Error in {e.path} field: {e.msg}</p>
                    )); 
                    setServerCallErrorMessage({
                      status: status,
                      msg: errorMessage
                    });
                  } else {
                    setServerCallErrorMessage({
                      status: status,
                      msg: e.response.data.msg || `Bad Request`
                    });
                  }                
              } else if (status === 401) {
                setServerCallErrorMessage({
                  status: status,
                  msg: `Not authorised to delete: ${currentRecipe.title}`
                });
              } else if (status === 404) {
                setServerCallErrorMessage({
                  status: status,
                  msg: `Recipe: ${currentRecipe.title} wasnt found in database`
                });
              } else {              
                setServerCallErrorMessage({
                  status: status,
                  msg: e.response.data.msg || `failed to delete ${currentRecipe.title}`
                });
              }
            }
            
            // if (e.response.status === 401) {        
            //     setServerCallErrorMessage(`Not authorised to delete: ${currentRecipe.title}`);
            // } else if (typeof(e.response.data.errors) !== 'undefined') {
            // const Msg = e.response.data.errors.map((x) => {return x.msg}).join(', '); 
            //     setServerCallErrorMessage(`Error: ${Msg}`);
            // } else if (e.response.status === 404) {
            //     setServerCallErrorMessage(`Recipe: ${currentRecipe.title}, wasnt found in database`);
            // } else {
            //     setServerCallErrorMessage(`failed to delete ${currentRecipe.title}`);
            // }      
        }
    }

    const showDeleteRecipeModal = () => setDeleteRecipeModal(true);

    const hideDeleteRecipeModal = () => {  
        if (serverCallError) {
          verify();
          navigate('/Recipes');
        } 
        setDeleteRecipeModal(false);    
        setServerCallError(false);
        setServerCallErrorMessage(null);
        // setDeleteRecipeModal(false);    
        if(serverCallSuccess) {
          setCurrentRecipe({
            id: null,
            title: "",
            description: "",
            published: false,
            cookingTimeMinutes: 0,
            ingredients: [""],
            instructions: [""], 
            diets: [""]
          })
          setServerCallSuccess(false);
          navigate('/Recipes');
        }
    }

    const deleteRecipeModalBodyContent = () => {
        if (serverCallError) {
          return serverCallErrorMessage.msg;
        } else if (serverCallSuccess) {
          return `Successfully deleted: ${currentRecipe.title}.`;
        } else if (deleteRecipeModal === false) {
          return null;
        } else {
          return `Are you sure you want to delete: ${currentRecipe.title}?`;
        }  
    }

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

    return(
        <Container fluid className="d-flex justify-content-center">
            {isLoading ? <Container className="d-flex justify-content-center gap-5 ps-0">
                          <Spinner animation="border" variant={themeVariants.text} />
                          <p>Loading...</p>        
                        </Container> 
            :
            currentRecipe ? (
                <Container className="mb-3 w-100 recipeCard">

                <Card.Title as="h4" className="recipeCardTitle">Edit Recipe </Card.Title>

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

                        <MealTypeList 
                            currentRecipe={currentRecipe}
                            setCurrentRecipe={setCurrentRecipe}
                            mealTypes={currentRecipe.mealTypes}
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
                            <Modal.Title >{serverCallError ?  'Error Deleting Recipe' : 'Delete Recipe'}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body >
                            {deleteRecipeModalBodyContent()}
                            </Modal.Body>
                            <Modal.Footer>
                            <Button variant="secondary" onClick={hideDeleteRecipeModal}>
                                Close
                            </Button>
                            {(serverCallError === true || serverCallSuccess === true) ? null : <Button variant="primary" onClick={(e) => deleteRecipe()}>Yes</Button> }
                                                    
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
                            <Modal.Title >{serverCallError ?  'Error Updating Recipe' : 'Update Recipe'}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body >
                            {updateRecipeModalBodyContent()}
                            {/* {noChangesToRecipe ? `No changes to update!`:
                            `Are you sure you want update: ${currentRecipe.title}?`}                       */}
                            </Modal.Body>
                            <Modal.Footer>
                            <Button 
                                variant={noChangesToRecipe ? "primary": "secondary"}
                                onClick={hideUpdateRecipeModal}>
                                Close
                            </Button>
                            {noChangesToRecipe === true || message || serverCallError == true ? null : <Button variant="primary" onClick={(e) => updateRecipe()}>Yes</Button> }
                            {/* {!noChangesToRecipe &&
                            <Button variant="primary" onClick={(e) => updateRecipe()}>Yes</Button>} */}
                            </Modal.Footer>
                        </Modal>  

                        </Row>   
                        <Container className="updateMessages"> 
                        <Row className="mt-3 btnDisableTxt">{btnDisabledTxt()}</Row> 
                        <Row className="mt-3  rcpMessageTxt" style={{color: '#198754'}}>{<p>{message}</p>}</Row> 
                        </Container> 
                    </Card.Body>

                </Container>
            ): (
                <div>
                  <br />
                  <p>Please select a Recipe...</p>
                </div>
            )
            
        }
        </Container>

    );
};
export default UpdateRecipe;



