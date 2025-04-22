import React, {useState} from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';


const MealTypeList = ({
    currentRecipe,
    setCurrentRecipe,
    mealTypes,
    themeVariants

}) => {

  const [removeMealTypeModal, setRemoveMealTypeModal] = useState(false);
  const [nothingToMoveModal, setNothingToMoveModal] = useState(false);
  const [stopAddMealTypeModal, setStopAddMealTypeModal] = useState(false); 
  const [currentIndex, setcurrentIndex] = useState(null);


  const onChangeMealTypes = (index, e) => {
    const {value, selectedIndex, options} = e.target;
      const newMealType = value;
    // Update the MealType array
    if(options[selectedIndex].index !== 0) {
      const newMealTypes = currentRecipe.mealTypes.map((mealType, i) => {
        return i === index ? newMealType : mealType;
      });
      setCurrentRecipe({ ...currentRecipe, mealTypes: newMealTypes });
      let id = `mealTypeSelectIx${index}`;
      document.getElementById(id).selectedIndex = "0";

    }
  }
  const showStopAddMealTypeModal = () =>  setStopAddMealTypeModal(true);  
  const hideStopAddMealTypeModal = () => setStopAddMealTypeModal(false);

  const addMealType = () => {    
    if((currentRecipe.mealTypes.length > 0 && 
      currentRecipe.mealTypes[currentRecipe.mealTypes.length -1].trim() !== "") 
      || currentRecipe.mealTypes.length  === 0 ) {
        const newMealTypes = [...currentRecipe.mealTypes, ""];
        setCurrentRecipe({ ...currentRecipe, mealTypes: newMealTypes});        
      } else {
        showStopAddMealTypeModal();
      }
   }

  const showRemoveMealTypeModal = (index) => { 
    setcurrentIndex(index);
    setRemoveMealTypeModal(true);
  }
  const hideRemoveMealTypeModal = () => setRemoveMealTypeModal(false);  

  const delBtnVisible = (index) => {
    // if(index > 0){
      return (
        <Button   
        variant='outline-danger'
        className="ing-smaller-btn border-0"  
        onClick={(e) => showRemoveMealTypeModal(index)}
        > 
          <i className="bi bi-trash"></i>
        </Button>
  )}

  const addBtnVisible = (index) => {
          if (currentRecipe.mealTypes.length === 0 ) {
              return (
                  <Button 
                  variant='outline-success'
                  className="ing-smaller-btn border-0" 
                  onClick={(e) => addMealType()}
                  >
                      <i className="bi bi-plus-square"></i>
                  </Button>
              )      
          } else if (currentRecipe.mealTypes[index].trim().length > 0 
                      && index === currentRecipe.mealTypes.length -1) {
                  return (
                      <Button 
                      variant='outline-success'
                      className="ing-smaller-btn border-0" 
                      onClick={(e) => addMealType()}
                      >
                          <i className="bi bi-plus-square"></i>
                      </Button>
                  )
          } 
          
    }

  const removeMealType = (index) => {
    if(currentRecipe.mealTypes.length > 0) {
      const newMealTypes = currentRecipe.mealTypes.filter((mealType, i) => i !== currentIndex);  
      setCurrentRecipe({ ...currentRecipe, mealTypes: newMealTypes});
      hideRemoveMealTypeModal();
      setcurrentIndex(null);
    }
   }

  const showNothingToMoveModal = () => { 
    // setcurrentIndex(index);
    setNothingToMoveModal(true);
  }
  const hideNothingToMoveModal = () => setNothingToMoveModal(false);


  const moveMealTypeUp = (index) => {
    if(currentRecipe.mealTypes[index].trim() === "" || 
    currentRecipe.mealTypes[index -1].trim() === ""){
      showNothingToMoveModal(index);
    } else {
      const toMoveUp = currentRecipe.mealTypes[index];
      const toMoveHere = currentRecipe.mealTypes[index -1];
      const newMealTypes = [...currentRecipe.mealTypes];
  
      newMealTypes[index-1] = toMoveUp;
      newMealTypes[index] = toMoveHere;      
      setCurrentRecipe({...currentRecipe, mealTypes: newMealTypes}); 
    }
   }

  const moveMealTypeDown = (index) => {
    if(currentRecipe.mealTypes[index].trim() === "" || 
        currentRecipe.mealTypes[index +1].trim() === ""){
      showNothingToMoveModal(index);
     
    } else {
      const toMoveDown = currentRecipe.mealTypes[index];
      const toMoveHere = currentRecipe.mealTypes[index +1];
      const newMealTypes = [...currentRecipe.mealTypes];
  
      newMealTypes[index+1] = toMoveDown;
      newMealTypes[index] = toMoveHere;  
      setCurrentRecipe({...currentRecipe, mealTypes: newMealTypes}); 
    }
  }

  const UpBtnVisible = (index) => {
    if (index !== 0) {
      return (
        <Button  
          className="xs-btn"
          variant={themeVariants.variant === 'dark' ? "outline-info" : "info"} 
          onClick={() => moveMealTypeUp(index)}
        >
          <i className="bi bi-arrow-up-short"></i>
        </Button>    
      );
    }
  }
    
  const DownBtnVisible = (index) => {
    if (index !== (mealTypes.length - 1)) {
        return (
            <Button 
            className="xs-btn mt-1"
            variant={themeVariants.variant === 'dark' ? "outline-info" : "info"}
            onClick={() => moveMealTypeDown(index)}
            >
            <i className="bi bi-arrow-down-short"></i>
            </Button>
        );
    }
  }


  return (
      <Form.Group controlId="Diets" className="mb-4">
      <Form.Label className="ps-2">Meal Type</Form.Label>
      <ListGroup 
        as="ul"         
        variant={themeVariants.variant} 
        data-bs-theme={themeVariants['data-bs-theme']}        
      >
      {mealTypes.length === 0 || typeof mealTypes === "undefined"  ? 
          <ListGroup.Item action  variant={themeVariants.variant} as="li"   
              >This recipe has no meal types yet. Click the 'add meal type' button to add one.
          </ListGroup.Item> :
      mealTypes.map((mealType, index) => (
        <ListGroup.Item 
          key={index}
          variant={themeVariants.variant}
          className="d-flex justify-content-between list-item-cont">
            
          <Form.Group className="dietSelectArea" >
          <Form.Control 
            type="text"      
            value={mealType} 
            data-bs-theme={themeVariants['data-bs-theme']}
            readOnly
            className="dietSelect"  
          >
          </Form.Control>
          <Form.Select 
              aria-label="Select Meal Type"
              id={`mealTypeSelectIx${index}`}
              className="dietSelect"
              // value={diet}
              onChange={(e) => onChangeMealTypes(index,  e)}  
              >
            <option>Select Meal Type</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Tea">Tea</option>
            <option value="Snack">Snack</option>
            <option value="Sandwich">Sandwich</option>
            <option value="Batch Cook">Batch Cook</option>
            <option value="Drink">Drink</option>
            <option value="Salad">Salad</option>
            <option value="Supper">Supper</option>
            <option value="Elevenses">Elevenses</option>
            <option value="Second Breakfast">Second Breakfast</option> 
      
          </Form.Select>
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
                <Modal.Title >Unable to move Meal Type</Modal.Title>
              </Modal.Header>
              <Modal.Body >
                Field Empty. Please complete Meal Field before moving.
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
                  show={removeMealTypeModal}
                  onHide={hideRemoveMealTypeModal}
                  backdrop="static"
                  keyboard={false}
                  data-bs-theme={themeVariants['data-bs-theme']}       
                  className={themeVariants.variant}
                  centered
                >
                  <Modal.Header  closeButton >
                    <Modal.Title >Remove Meal Type Field</Modal.Title>
                  </Modal.Header>
                  <Modal.Body >
                    {typeof  currentRecipe.mealTypes[currentIndex] === "undefined" ? 
                    `Nothing here` 
                      : currentRecipe.mealTypes[currentIndex].trim().length === 0 ? 
                        `Are you sure you want to remove this meal type field?` :  
                        `Are you sure you want to remove '${currentRecipe.mealTypes[currentIndex]}'?`}                   
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={hideRemoveMealTypeModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={(e) => removeMealType()}>Yes</Button>
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
          onClick={(e) => addMealType()}
        >Add Meal type</Button>

        <Modal
          show={stopAddMealTypeModal}
          onHide={hideStopAddMealTypeModal}
          backdrop="static"
          keyboard={false}
          data-bs-theme={themeVariants['data-bs-theme']}       
          className={themeVariants.variant}
          centered
        >
          <Modal.Header  closeButton >
            <Modal.Title >Unable to add Meal Type</Modal.Title>
          </Modal.Header>
          <Modal.Body >
            Please complete the last Meal Type field before adding a new one.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={hideStopAddMealTypeModal}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        
      </Row>
    </Form.Group>


  );

};
export default MealTypeList;