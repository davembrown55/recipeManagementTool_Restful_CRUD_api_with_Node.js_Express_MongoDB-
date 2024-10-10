import React, {useState} from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';


const DietsList = ({
    currentRecipe,
    setCurrentRecipe,
    diets,
    themeVariants

}) => {

  const [removeDietModal, setRemoveDietModal] = useState(false);
  const [nothingToMoveModal, setNothingToMoveModal] = useState(false);
  const [stopAddDietModal, setStopAddDietModal] = useState(false); 
  const [currentIndex, setcurrentIndex] = useState(null);


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
  const showStopAddDietModal = () =>  setStopAddDietModal(true);  
  const hideStopAddDietModal = () => setStopAddDietModal(false);

  const addDiet = () => {    
    if((currentRecipe.diets.length > 0 && 
      currentRecipe.diets[currentRecipe.diets.length -1].trim() !== "") 
      || currentRecipe.diets.length  === 0 ) {
        const newDiets = [... currentRecipe.diets, ""];
        setCurrentRecipe({ ...currentRecipe, diets: newDiets});        
      } else {
        showStopAddDietModal();
      }
   }

  const showRemoveDietModal = (index) => { 
    setcurrentIndex(index);
    setRemoveDietModal(true);
  }
  const hideRemoveDietModal = () => setRemoveDietModal(false);  

  const delBtnVisible = (index) => {
    // if(index > 0){
      return (
        <Button   
        variant={themeVariants.variant === 'dark' ? "outline-danger" : "danger"} 
        className="ing-smaller-btn border-0"  
        onClick={(e) => showRemoveDietModal(index)}
        > 
          <i className="bi bi-trash"></i>
        </Button>
  )}

  const removeDiet = (index) => {
    if(currentRecipe.diets.length > 0) {
      const newDiets = currentRecipe.diets.filter((diet, i) => i !== currentIndex);  
      setCurrentRecipe({ ...currentRecipe, diets: newDiets});
      hideRemoveDietModal();
      setcurrentIndex(null);
    }
   }

  const showNothingToMoveModal = () => { 
    setNothingToMoveModal(true);
  }
  const hideNothingToMoveModal = () => setNothingToMoveModal(false);


  const moveDietUp = (index) => {
    if(currentRecipe.diets[index].trim() === "" || 
    currentRecipe.diets[index -1].trim() === ""){
      showNothingToMoveModal(index);
    } else {
      const toMoveUp = currentRecipe.diets[index];
      const toMoveHere = currentRecipe.diets[index -1];
      const newDiets = [... currentRecipe.diets];
  
      newDiets[index-1] = toMoveUp;
      newDiets[index] = toMoveHere;      
      setCurrentRecipe({...currentRecipe, diets: newDiets}); 
    }
   }

  const moveDietDown = (index) => {
    if(currentRecipe.diets[index].trim() === "" || 
        currentRecipe.diets[index +1].trim() === ""){
      showNothingToMoveModal(index);
     
    } else {
      const toMoveDown = currentRecipe.diets[index];
      const toMoveHere = currentRecipe.diets[index +1];
      const newDiets = [... currentRecipe.diets];
  
      newDiets[index+1] = toMoveDown;
      newDiets[index] = toMoveHere;  
      setCurrentRecipe({...currentRecipe, diets: newDiets}); 
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
          >This recipe has no diet types yet. Click the 'add diet type' button to add one.
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
            placeholder="Diet Type"
          >
          </Form.Control>
          <Form.Select 
              aria-label="Select Diet Type"
              id={`dietSelectIx${index}`}
              className="dietSelect"
              onChange={(e) => onChangeDiets(index,  e)}  
              >
          <option>Select Diet Type</option>
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
                <Modal.Title >Unable to move Diet Type</Modal.Title>
              </Modal.Header>
              <Modal.Body >
                Field Empty. Please complete Diet Field before moving.
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
              <Modal
                  show={removeDietModal}
                  onHide={hideRemoveDietModal}
                  backdrop="static"
                  keyboard={false}
                  data-bs-theme={themeVariants['data-bs-theme']}       
                  className={themeVariants.variant}
                  centered
                >
                  <Modal.Header  closeButton >
                    <Modal.Title >Remove Diet Field</Modal.Title>
                  </Modal.Header>
                  <Modal.Body >
                    {typeof  currentRecipe.diets[currentIndex] === "undefined" ? 
                    `Nothing here` 
                      : currentRecipe.diets[currentIndex].trim().length === 0 ? 
                        `Are you sure you want to remove this diet type field?` :  
                        `Are you sure you want to remove '${currentRecipe.diets[currentIndex]}'?`}                   
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={hideRemoveDietModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={(e) => removeDiet()}>Yes</Button>
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
          onClick={(e) => addDiet()}
        >Add Diet type</Button>

        <Modal
          show={stopAddDietModal}
          onHide={hideStopAddDietModal}
          backdrop="static"
          keyboard={false}
          data-bs-theme={themeVariants['data-bs-theme']}       
          className={themeVariants.variant}
          centered
        >
          <Modal.Header  closeButton >
            <Modal.Title >Unable to add Diet</Modal.Title>
          </Modal.Header>
          <Modal.Body >
            Please complete the last Diet field before adding a new one
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={hideStopAddDietModal}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>        
      </Row>
    </Form.Group>
  );
};
export default DietsList;