import React from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';

const DietsList = ({
    currentRecipe,
    setCurrentRecipe,
    diets,
    themeVariants

}) => {

  const onChangeDiets = (index, e) => {
    const {value, selectedIndex, options} = e.target;
      const newDiet = value;
    // Update the diet array

    if(options[selectedIndex].index !== 0) {
      const newDiets = currentRecipe.diets.map((diet, i) => {
        return i === index ? newDiet : diet;
      });
      setCurrentRecipe({ ...currentRecipe, diets: newDiets });
      let id = `dietSelectIx${index}`;
      document.getElementById(id).selectedIndex = "0";

    }
  }

  const addDiet = () => {    
    if((currentRecipe.diets.length > 0 && 
      currentRecipe.diets[currentRecipe.diets.length -1].trim() !== "") 
      || currentRecipe.diets.length  === 0 ) {
        const newDiets = [... currentRecipe.diets, ""];
        setCurrentRecipe({ ...currentRecipe, diets: newDiets});        
      } else {
        alert("Please fill in the last diet type before adding a new one.");
      }
   }

  const removeDiet = (index) => {
    if(currentRecipe.diets.length > 0) {
      if(window.confirm("Are you sure you want to remove this diet type?")) {
        const newDiets = currentRecipe.diets.filter((diet, i) => i !== index);  
        setCurrentRecipe({ ...currentRecipe, diets: newDiets});
      }
    }
   }

  const moveDietUp = (index) => {
    if(currentRecipe.diets[index].trim() !== ""){
      const toMoveUp = currentRecipe.diets[index];
      const toMoveHere = currentRecipe.diets[index -1];
      const newDiets = [... currentRecipe.diets];
  
      newDiets[index-1] = toMoveUp;
      newDiets[index] = toMoveHere;      
      setCurrentRecipe({...currentRecipe, diets: newDiets});      
    } else {
      alert("There is no diet type here yet.")
    }
   }

  const moveDietDown = (index) => {
    if(currentRecipe.diets[index].trim() !== ""){
      const toMoveDown = currentRecipe.diets[index];
      const toMoveHere = currentRecipe.diets[index +1];
      const newDiets = [... currentRecipe.diets];
  
      newDiets[index+1] = toMoveDown;
      newDiets[index] = toMoveHere;  
      setCurrentRecipe({...currentRecipe, diets: newDiets});      
    } else {
      alert("There is no diet type here yet.")
    }
  }

  const UpBtnVisible = (index) => {
    if (index !== 0) {
      return (
        <Button  
          className="xs-btn"
          variant={themeVariants.variant === 'dark' ? "outline-info" : "info"} 
          onClick={() => moveDietUp(index)}
        >
          <i className="bi bi-arrow-up-short"></i>
        </Button>    
      );
    }
  }
    
  const DownBtnVisible = (index) => {
    if (index !== (diets.length - 1)) {
        return (
            <Button 
            className="xs-btn mt-1"
            variant={themeVariants.variant === 'dark' ? "outline-info" : "info"}
            onClick={() => moveDietDown(index)}
            >
            <i className="bi bi-arrow-down-short"></i>
            </Button>
        );
    }
  }


  return (
      <Form.Group controlId="Diets" className="mb-4">
      <Form.Label className="ps-2">Diet Type</Form.Label>
      <ListGroup 
        as="ul"         
        variant={themeVariants.variant} 
        data-bs-theme={themeVariants['data-bs-theme']}        
      >
      {diets.length === 0 || typeof diets === "undefined"  ? 
          <ListGroup.Item action  variant={themeVariants.variant} as="li"   
              >No diet type associated with this recipe. Click the 'add diet type' button to add one.
          </ListGroup.Item> :
      diets.map((diet, index) => (
        <ListGroup.Item 
          key={index}
          variant={themeVariants.variant}
          className="d-flex justify-content-between list-item-cont">
            
          <Form.Group className="dietSelectArea" >
          <Form.Control 
            type="text"      
            value={diet} 
            data-bs-theme={themeVariants['data-bs-theme']}
            readOnly
            className="dietSelect"  
          >
          </Form.Control>
          <Form.Select 
              aria-label="Select Diet Type"
              id={`dietSelectIx${index}`}
              className="dietSelect"
              // value={diet}
              onChange={(e) => onChangeDiets(index,  e)}  
              >
          <option>Select Diet Type to change</option>
          <option value="Carnivore">Carnivore</option>
          <option value="DASH">DASH</option>
          <option value="Dairy Free">Dairy Free</option>
          <option value="Diabetic">Diabetic</option>
          <option value="Gluten Free">Gluten Free</option>
          <option value="Jain">Jain</option>
          <option value="Ketogenic">Ketogenic</option>
          <option value="Kosher">Kosher</option>
          <option value="Low FODMAP">Low FODMAP</option>
          <option value="Low Carb">Low Carb</option>
          <option value="Low Fat">Low Fat</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="Paleo">Paleo</option>
          <option value="Pescatarian">Pescatarian</option> 
          <option value="Plant Based">Plant Based</option>      
          <option value="Vegan">Vegan</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Weight Watchers">Weight Watchers</option>
      
          </Form.Select>
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
              onClick={(e) => removeDiet(index)}
              > 
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
          onClick={(e) => addDiet()}
        >Add Diet type</Button>
        
      </Row>
    </Form.Group>


  );

};
export default DietsList;