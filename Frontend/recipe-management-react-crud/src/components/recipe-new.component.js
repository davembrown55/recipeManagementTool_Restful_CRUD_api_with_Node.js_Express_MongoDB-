import React, { useState, useEffect } from "react";
import RecipeDataService from "../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import ThemeProvider from 'react-bootstrap/ThemeProvider'

import IngredientList from "./ingredient-list.component";

const Recipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  
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
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);



  const onChangeTitle = (e) => {
    const title = e.target.value;
    setCurrentRecipe({ ...currentRecipe, title });
  };

  const onChangeDescription = (e) => {
    const description = e.target.value;
    setCurrentRecipe({ ...currentRecipe, description });
  };

  const onChangeCookingTimeMinutes = (e) => {
    const cookingTimeMinutes = e.target.value;
    setCurrentRecipe({ ...currentRecipe, cookingTimeMinutes });
    if (isNaN(cookingTimeMinutes) || cookingTimeMinutes === "" ) {
      setErrors({ maxCookingTime: 'Please enter a valid cooking time' });
    } else {
      setErrors({});
    }
  };

  const onChangeIngredients = (index, e) => {
    const newIngredient = e.target.value;
    const newIngredients = currentRecipe.ingredients.map((ingredient, i) => {
      if (i === index) {
        return newIngredient;
      }
      return ingredient;
    });    
    setCurrentRecipe({ ...currentRecipe, ingredients: newIngredients });
  }

  const removeIngredient = (index) => {
    if(currentRecipe.ingredients.length > 0) {
      if(window.confirm("Are you sure you want top remove this ingredient?")) {
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

  const validateInput = () => {
    let isValid = true;
    let validationErrors = {};
    
    if (isNaN(currentRecipe.cookingTimeMinutes) || currentRecipe.cookingTimeMinutes === "") {
      isValid = false;
      validationErrors['maxCookingTime'] = 'Please enter a valid cooking time';
    }   

    setErrors(validationErrors);
    return isValid;
  };

  const getRecipe = (id) => {
    RecipeDataService.get(id)
      .then((response) => {
        const recipe = response.data;
        if (!Array.isArray(recipe.ingredients)) {
          recipe.ingredients = [""];
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
    if (!validateInput()) {return;} // Stop the function if validation fails
   
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
  };

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
  };

  const darkOrLightMode = (e) => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark"
  } else {return "light"}
  
  }

const darkOrLightVariant = (e) => {
  if (darkOrLightMode() === "dark") {
    return "outline-warning"
  } else if (darkOrLightMode() === "light")  {
      return "outline-danger"
  } else {return "outline-primary"}
}


  return (
    // <Container> {/* temporary container */}
    <Container fluid className="d-flex justify-content-center">
      <Col xs={12} sm={12} md={9} lg={6} className="d-flex justify-content-center">
        {currentRecipe ? (
          <Card 
            bg={darkOrLightMode()}
            key={darkOrLightMode()}
            text={darkOrLightMode() === 'light' ? 'dark' : 'white'}            
            className="p-3 mb-3 w-100"
          >
            <Card.Title as="h4" className="ps-2">Recipe </Card.Title>
            <Card.Body>
              <Form>
                <Form.Group controlId="title" className="mb-4">
                  <Form.Label className="ps-2">Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentRecipe.title} 
                      data-bs-theme={darkOrLightMode()}
                      onChange={onChangeTitle}
                      // isInvalid={!!} 
                    >
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="description" className="mb-4">
                  <Form.Label className="ps-2">Description</Form.Label>
                    <Form.Control
                      type="text"                      
                      value={currentRecipe.description} 
                      data-bs-theme={darkOrLightMode()}
                      onChange={onChangeDescription}
                      // isInvalid={!!} 
                    >
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="CookingTime" className="mb-4">
                  <Form.Label className="ps-2">Cooking time in minutes</Form.Label>
                    <Form.Control
                      type="number"                      
                      value={currentRecipe.cookingTimeMinutes} 
                      data-bs-theme={darkOrLightMode()}
                      onChange={onChangeCookingTimeMinutes}
                      className="responsive-width-form"
                      isInvalid={!!errors.maxCookingTime}                       
                    >
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.maxCookingTime}
                    </Form.Control.Feedback>
                </Form.Group>

                <IngredientList 
                    ingredients={currentRecipe.ingredients}
                    onChangeIngredients={onChangeIngredients}
                    addIngredient={addIngredient}
                    removeIngredient={removeIngredient}
                    moveIngredientUp={moveIngredientUp}
                    moveIngredientDown={moveIngredientDown}
                    darkOrLightMode={darkOrLightMode}
                    darkOrLightVariant={darkOrLightVariant}
                  />

                {/* <Form.Group controlId="Ingredients" className="mb-4">
                  <Form.Label className="ps-2">Ingredients</Form.Label>
                  <ListGroup as="ul" 
                    data-bs-theme={darkOrLightMode()}
                    >
                  {currentRecipe.ingredients.map((ingredient, index) => (
                    <ListGroup.Item 
                      key={index}
                      className="d-flex justify-content-between">
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
                </Form.Group> */}
                

                <Form.Group className="mb-5">
                  <Form.Label className="ps-2">Status</Form.Label>
                  <Form.Control
                      type="text"
                      value={currentRecipe.published ? "Published" : "Pending"} 
                      data-bs-theme={darkOrLightMode()}
                      className="responsive-width-form"                      
                      disabled                      
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
                      >Make Private 
                      </Button>
                      ) : (
                      <Button
                        className="btn-success"
                        onClick={() => updatePublished(true)}
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
                        onClick={() => updateRecipe()}
                      >Update
                    </Button>                  
                </Row>   
                <Row className="mt-3 py-3 ps-2">{<p>{message}</p>}</Row> 
                
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
