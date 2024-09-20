import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { useTheme} from '../../common/ThemeProvider';
import IngredientList from "./ingredient-list.component";
import InstructionList from "./instruction-list.component";

const Recipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
  });  

  const [currentRecipe, setCurrentRecipe] = useState({
    id: null,
    title: "",
    description: "",
    published: false,
    cookingTimeMinutes: 0,
    ingredients: [""],
    instructions: [""]

  });

  const [message, setMessage] = useState("");
  
  useEffect(() => {
    getRecipe(id);
  }, [id]);

  useEffect(() => {
    if (message) {
      const submitMessage = document.getElementsByClassName("rcpMessageTxt");
      submitMessage[0].style.visibility = "visible";
      submitMessage[0].style.opacity = "1";
      submitMessage[0].style.transition = "visibility 0s linear 0s, opacity 700ms"; 

      const timerFadeOut = setTimeout(() => {
        submitMessage[0].style.visibility = "hidden";
        submitMessage[0].style.opacity = "0";
        submitMessage[0].style.transition = "visibility 0s linear 300ms, opacity 1000ms";
      }, 2500);      

      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer, timerFadeOut);
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
    const cookingTimeMinutes = e.target.value;
    setCurrentRecipe({ ...currentRecipe, cookingTimeMinutes });

    // create a validationErrors obj from errors without any cookTimeError objects
    const {cookTimeError, ...validationErrors} = errors;    

    //validation
    if (isNaN(cookingTimeMinutes)) {      
      validationErrors.cookTimeError = 'Please enter a valid number.';
    }  else if (cookingTimeMinutes.trim().length === 0 ){
      validationErrors.cookTimeError = 'Field Empty';
    } 

    setErrors(validationErrors);
  };


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


const onChangeInstructions = (index, e) => {
  const newInstruction = e.target.value;
   // Update the instructions array
  const newInstructions = currentRecipe.instructions.map((instruction, i) => {
    return i === index ? newInstruction : instruction;
  });
  setCurrentRecipe({ ...currentRecipe, instructions: newInstructions });
  
  // Destructure errors, excluding the specific instructionError object and add to validationErrors    
  const { instructionsError = {}, ...validationErrors } = errors ;

  // Create a copy of instructionsError without any current index errors
  const { [`${index}`]: removedError, ...newInstructionsError } = instructionsError || {};

  const newInstructionErrorEmpty = Object.keys(newInstructionsError).length === 0;

  if (newInstruction.trim().length === 0) {
    // Failed validation add new error to validationErrors.instructionsError
    validationErrors.instructionsError = { ...newInstructionsError, [index]: 'Field Empty' };
  } else if (!newInstructionErrorEmpty && newInstruction.trim().length > 0) {
    // passed validation and there are other existing instructionErrors. 
    // replace validationErrors.instructionsError ensuring no error messages for this index.
    validationErrors.instructionsError = newInstructionsError; 
  }

  setErrors(validationErrors);
}

const removeInstruction = (index) => {
  if(currentRecipe.instructions.length > 0) {
    if(window.confirm("Are you sure you want to remove this instruction?")) {
      const newInstructions = currentRecipe.instructions.filter((instruction, i) => i !== index);  
      setCurrentRecipe({ ...currentRecipe, instructions: newInstructions});
    }
  }
}

const addInstruction = () => {
  if(currentRecipe.instructions.length > 0 && 
  currentRecipe.instructions[currentRecipe.instructions.length -1].trim() !== "" ) {
    const newInstructions = [... currentRecipe.instructions, ""];
    setCurrentRecipe({ ...currentRecipe, instructions: newInstructions});
  } else {
    alert("Please fill in the last instruction before adding a new one.");
  }
}


const moveInstructionUp = (index) => {    
  if(currentRecipe.instructions[index].trim() !== ""){
    const toMoveUp = currentRecipe.instructions[index];
    const toMoveHere = currentRecipe.instructions[index -1];
    const newInstructions = [... currentRecipe.instructions];

    newInstructions[index-1] = toMoveUp;
    newInstructions[index] = toMoveHere;      
    setCurrentRecipe({...currentRecipe, instructions: newInstructions});      
  } else {
    alert("There is no instruction here yet.")
  }
  
}  

const moveInstructionDown = (index) => {
  if(currentRecipe.instructions[index].trim() !== ""){
    const toMoveDown = currentRecipe.instructions[index];
    const toMoveHere = currentRecipe.instructions[index +1];
    const newInstructions = [... currentRecipe.instructions];

    newInstructions[index+1] = toMoveDown;
    newInstructions[index] = toMoveHere;  
    setCurrentRecipe({...currentRecipe, instructions: newInstructions});      
  } else {
    alert("There is no instruction here yet.")
  }
}

//


  const getRecipe = (id) => {
    RecipeDataService.get(id)
      .then((response) => {
        const recipe = response.data;
        if (!Array.isArray(recipe.ingredients)) {
          recipe.ingredients = [""];
        }
        if (!Array.isArray(recipe.instructions)) {
          recipe.instructions = [""];
        }
        setCurrentRecipe(recipe);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const updatePublished = (status) => {
    const data = {
      id: currentRecipe.id,
      title: currentRecipe.title,
      description: currentRecipe.description,
      published: status,
    };

    RecipeDataService.update(currentRecipe.id, data)
      .then((response) => {
        setCurrentRecipe({ ...currentRecipe, published: status });
        console.log(response.data);
        setMessage("The Recipe was updated successfully!")
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const updateRecipe = () => {
    if (Object.keys(errors).length = 0) {return;} // Stop the function if validation fails
   
    if(window.confirm("Are you sure you want to update this recipe?")) {
      RecipeDataService.update(currentRecipe.id, currentRecipe)
        .then((response) => {
          console.log(response.data);
          setMessage("The Recipe was updated successfully!");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  const deleteRecipe = () => {
    if(window.confirm("Are you sure you want to delete this recipe?")) {
      RecipeDataService.delete(currentRecipe.id)
        .then((response) => {
          console.log(response.data);
          navigate('/Recipes');
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  const { themeVariants } = useTheme(); 

  const btnDisabledTxt = () => {
    if (Object.keys(errors).length === 0){}

    if (Object.keys(errors).length > 0) {
      let valFailMessage = {errMess: "Update Disabled. Please amend:"};

      for (const [key, value] of Object.entries(errors)) {
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
        }
      }
      return  Object.keys(valFailMessage).map((item,index) => {
        return (<p key={index} >{valFailMessage[item]}</p>)
      })
    }
  }
  


  return (
    // <Container> {/* temporary container */}
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
                    onChangeIngredients={onChangeIngredients}
                    addIngredient={addIngredient}
                    removeIngredient={removeIngredient}
                    moveIngredientUp={moveIngredientUp}
                    moveIngredientDown={moveIngredientDown}
                    themeVariants={themeVariants}
                    errors={errors}
                  />

                <InstructionList 
                    instructions={currentRecipe.instructions}
                    onChangeInstructions={onChangeInstructions}
                    addInstruction={addInstruction}
                    removeInstruction={removeInstruction}
                    moveInstructionUp={moveInstructionUp}
                    moveInstructionDown={moveInstructionDown}
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
                      // disabled  
                      readOnly                    
                      // isInvalid={!!} 
                    >
                    </Form.Control>
                </Form.Group>


              </Form>

                <Row xs="auto" className="justify-content-center gap-3">
                  {currentRecipe.published ? (
                      <Button
                        onClick={() => updatePublished(false)}
                        className="btn-warning"
                        disabled={Object.keys(errors).length > 0} // disable update button if val failed and error object not empty
                      >Make Private 
                      </Button>
                      ) : (
                      <Button
                        className="btn-success"
                        onClick={() => updatePublished(true)}
                        disabled={Object.keys(errors).length > 0} // disable update button if val failed and error object not empty
                      >Publish 
                      </Button>

                    )}
                    <Button
                    className="btn-danger"
                    onClick={() => deleteRecipe()}
                      >Delete
                    </Button>
                    <Button
                    className="primary"
                    disabled={Object.keys(errors).length > 0} // disable update button if val failed and error object not empty
                        onClick={() => updateRecipe()}
                      >Update
                    </Button>                  
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
  // </Container>
  );
};

export default Recipe;
