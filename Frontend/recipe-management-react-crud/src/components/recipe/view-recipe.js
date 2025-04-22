import React, { useState, useEffect } from "react";
import { Spinner,  Container, Card, ListGroup } from 'react-bootstrap';

const ViewRecipe = ({
                    currentRecipe,
                    themeVariants,
                    isLoading
                    }) => {

                      

    return (
        <Container fluid className="d-flex justify-content-center">
  
          { isLoading ? <Container className="d-flex justify-content-center gap-5 ps-0">
                          <Spinner animation="border" variant={themeVariants.text} />
                          <p>Loading...</p>        
                        </Container> 
            :
            
              currentRecipe ? (
            
              <Container className="mb-3 w-100 recipeCard">
              <Card.Title as="h4"  className="recipeCardTitle mb-4">{currentRecipe.title}</Card.Title>

               <Card.Body>
                <Card.Subtitle data-bs-theme={themeVariants['data-bs-theme']}  className='ps-1 mb-1 text-muted'>About:</Card.Subtitle>

                <Card.Text className='ps-2 mb-5'>
                    {currentRecipe.description}                    
                </Card.Text>

                <Card.Subtitle data-bs-theme={themeVariants['data-bs-theme']}  className='ps-1 mb-1 text-muted'>Cooking Time:</Card.Subtitle>
                <Card.Text className='ps-2 mb-5'>
                    {currentRecipe.cookingTimeMinutes} minutes                  
                </Card.Text>

                {/* Ingredients */}
                <Card.Subtitle data-bs-theme={themeVariants['data-bs-theme']}  className='ps-1 pb-2 mb-1 text-muted'>Ingredients:</Card.Subtitle>
                <ListGroup
                    as="ol"         
                    variant={themeVariants.variant} 
                    data-bs-theme={themeVariants['data-bs-theme']}
                    className="mb-5"
                    
                    >
                    {currentRecipe.ingredients.map((ingredient, index) => (
                        <ListGroup.Item
                            key={index}
                            variant={themeVariants.variant}
                            className=" viewRecipeList"
                        >
                            {ingredient}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                
                {/* Instructions */}
                <Card.Subtitle data-bs-theme={themeVariants['data-bs-theme']}  className='ps-1 pb-2 mb-1 text-muted'>Instructions:</Card.Subtitle>
                <ListGroup
                    as="ol"         
                    variant={themeVariants.variant} 
                    data-bs-theme={themeVariants['data-bs-theme']}
                    numbered
                    className="mb-5"
                    
                    >
                    {currentRecipe.instructions.map((instruction, index) => (
                        <ListGroup.Item
                            key={index}
                            variant={themeVariants.variant}
                            className=" viewRecipeList"
                        >
                            {instruction}
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* Diet Types */}
                <Card.Subtitle data-bs-theme={themeVariants['data-bs-theme']}  className='ps-1 pb-2 mb-1 text-muted'>Diet Types:</Card.Subtitle>
                <ListGroup
                    as="ol"         
                    variant={themeVariants.variant} 
                    data-bs-theme={themeVariants['data-bs-theme']}
                    numbered={currentRecipe.diets.length}
                    className="mb-5"
                    
                    >
                    {currentRecipe.diets.length ?
                      currentRecipe.diets.map((diet, index) => (
                          <ListGroup.Item
                              key={index}
                              variant={themeVariants.variant}
                              className=" viewRecipeList"
                          >
                              {diet}
                          </ListGroup.Item>
                      ))
                      :
                      <ListGroup.Item                              
                        variant={themeVariants.variant}
                        className=" viewRecipeList"
                      >
                          none
                      </ListGroup.Item>
                    }
                </ListGroup>
                
                {/* Meal Types */}
                <Card.Subtitle 
                        data-bs-theme={themeVariants['data-bs-theme']}  
                        className='ps-1 pb-2 mb-1 text-muted'
                      >
                        Meal Types:
                </Card.Subtitle>

                <ListGroup
                  as="ol"         
                  variant={themeVariants.variant} 
                  data-bs-theme={themeVariants['data-bs-theme']}
                  numbered={currentRecipe.mealTypes.length}
                  className="mb-5"                          
                  >
                  {currentRecipe.mealTypes.length ?
                    currentRecipe.mealTypes.map((mealType, index) => (
                      <ListGroup.Item
                          key={index}
                          variant={themeVariants.variant}
                          className=" viewRecipeList"
                      >
                          {mealType}
                      </ListGroup.Item>
                  ))
                  :
                    <ListGroup.Item                              
                      variant={themeVariants.variant}
                      className=" viewRecipeList"
                    >
                      none
                    </ListGroup.Item>
                  }
                </ListGroup>
              
              </Card.Body>
              </Container>
          ) : (
              <div>
                <br />
                <p>Please select a Recipe...</p>
              </div>
          )}  

      </Container>        

    );


};
export default ViewRecipe;