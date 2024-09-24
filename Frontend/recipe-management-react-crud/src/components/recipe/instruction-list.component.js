import React, {useState} from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';



const InstructionList = ({
    currentRecipe,
    setCurrentRecipe,
    instructions,
    setErrors,
    themeVariants,
    errors

  
}) => {

  const [removeInstModal, setRemoveInstModal] = useState(false);
  const [nothingToMoveModal, setNothingToMoveModal] = useState(false);
  const [stopAddInstModal, setStopAddInstModal] = useState(false); 
  const [currentIndex, setcurrentIndex] = useState(null);

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

  const showRemoveInstModal = (index) => { 
    setcurrentIndex(index);
    setRemoveInstModal(true);
  }
  const hideRemoveInstModal = () => setRemoveInstModal(false);

  
  const removeInstruction = (index) => {
    if(currentRecipe.instructions.length > 0) {
      const newInstructions = currentRecipe.instructions.filter((instruction, i) => i !== currentIndex);  
      setCurrentRecipe({ ...currentRecipe, instructions: newInstructions});
      
      hideRemoveInstModal();
      setcurrentIndex(null);
    }
  }

  const showStopAddInstModal = () =>  setStopAddInstModal(true);  
  const hideStopAddInstModal = () => setStopAddInstModal(false);

  
  const addInstruction = () => {
    if(currentRecipe.instructions.length > 0 && 
    currentRecipe.instructions[currentRecipe.instructions.length -1].trim() !== "" 
    || currentRecipe.ingredients.length === 0 ) {
      const newInstructions = [... currentRecipe.instructions, ""];
      setCurrentRecipe({ ...currentRecipe, instructions: newInstructions});
    } else {
      showStopAddInstModal();
        }
  }

  const showNothingToMoveModal = () => { 
    // setcurrentIndex(index);
    setNothingToMoveModal(true);
  }
  const hideNothingToMoveModal = () => setNothingToMoveModal(false);

  
  
  const moveInstructionUp = (index) => {    
    if(currentRecipe.instructions[index].trim() === "" || 
      currentRecipe.instructions[index -1].trim() === ""){

      showNothingToMoveModal(index);     
    } else {
      const toMoveUp = currentRecipe.instructions[index];
      const toMoveHere = currentRecipe.instructions[index -1];
      const newInstructions = [... currentRecipe.instructions];
  
      newInstructions[index-1] = toMoveUp;
      newInstructions[index] = toMoveHere;      
      setCurrentRecipe({...currentRecipe, instructions: newInstructions});     
    }
    
  }  
  
  const moveInstructionDown = (index) => {
    if(currentRecipe.instructions[index].trim() !== "" || 
    currentRecipe.instructions[index +1].trim() === ""){
      showNothingToMoveModal(index);     
    } else {
      const toMoveDown = currentRecipe.instructions[index];
      const toMoveHere = currentRecipe.instructions[index +1];
      const newInstructions = [... currentRecipe.instructions];
  
      newInstructions[index+1] = toMoveDown;
      newInstructions[index] = toMoveHere;  
      setCurrentRecipe({...currentRecipe, instructions: newInstructions}); 
    }
  }

  const UpBtnVisible = (index) => {
      if (index !== 0) {
        return (
          <Button  
            className="xs-btn"
            variant={themeVariants.variant === 'dark' ? "outline-info" : "info"} 
            onClick={() => moveInstructionUp(index)}
          >
            <i className="bi bi-arrow-up-short"></i>
          </Button>    
        );
      }
  }

  const DownBtnVisible = (index) => {
      if (index !== (instructions.length - 1)) {
        return (
          <Button 
            className="xs-btn mt-1"
            variant={themeVariants.variant === 'dark' ? "outline-info" : "info"}
            onClick={() => moveInstructionDown(index)}
          >
            <i className="bi bi-arrow-down-short"></i>
          </Button>
        );
      }
  }

  const instructionIsVal = (index) => {
      if (typeof errors.instructionsError === "undefined") {      
        return false;
      }
      
      if (typeof errors.instructionsError[index] === "undefined") {
        return false;
      } else if (typeof errors.instructionsError[index] !== "undefined") {
        return true;
      }
  
  }

  return (
      <Form.Group controlId="Instructions" className="mb-4">
      <Form.Label className="ps-2">Instructions</Form.Label>
      <ListGroup 
        as="ul"         
        variant={themeVariants.variant} 
        data-bs-theme={themeVariants['data-bs-theme']}
        numbered
        >
      {instructions.map((instruction, index) => (
        <ListGroup.Item 
          key={index}
          variant={themeVariants.variant}
          className="d-flex justify-content-between list-item-cont">
            
          <Form.Group className="ingTextArea" >
          <Form.Control 
            as="textarea"
            type="text"      
            value={instruction} 
            data-bs-theme={themeVariants['data-bs-theme']}
            onChange={(e) => onChangeInstructions(index, e)}        
            isInvalid={instructionIsVal(index)}
          >
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            {errors.instructionsError !== undefined && errors.instructionsError[`${index}`]  }
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
                    <Modal.Title >Unable to move Instruction</Modal.Title>
                  </Modal.Header>
                  <Modal.Body >
                    Field Empty. Please add instruction before moving.
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="primary" onClick={hideNothingToMoveModal}>
                      OK
                    </Button>
                  </Modal.Footer>
                </Modal>  
          </Container>

          <Container className="ingBtnContainer">          
            <Button   
              variant={themeVariants.variant === 'dark' ? "outline-danger" : "danger"} 
              className="ing-smaller-btn border-0"                
              onClick={(e) => showRemoveInstModal(index)}
              > 
                <i className="bi bi-trash"></i>
              </Button>
              <Modal
                  show={removeInstModal}
                  onHide={hideRemoveInstModal}
                  backdrop="static"
                  keyboard={false}
                  data-bs-theme={themeVariants['data-bs-theme']}       
                  className={themeVariants.variant}
                  centered
                >
                  <Modal.Header  closeButton >
                    <Modal.Title >Remove Instruction</Modal.Title>
                  </Modal.Header>
                  <Modal.Body >
                    {typeof  currentRecipe.instructions[currentIndex] === "undefined" ? 
                    `Are you sure you want to remove this instruction` 
                      : currentRecipe.instructions[currentIndex].trim().length === 0 ? 
                        `Are you sure you want to remove this instruction` :  
                        `Are you sure you want to remove '${currentRecipe.instructions[currentIndex]}'?`}                   
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={hideRemoveInstModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={(e) => removeInstruction()}>Yes</Button>
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
          onClick={(e) => addInstruction()}
        >Add Instruction</Button>

        <Modal
          show={stopAddInstModal}
          onHide={hideStopAddInstModal}
          backdrop="static"
          keyboard={false}
          data-bs-theme={themeVariants['data-bs-theme']}       
          className={themeVariants.variant}
          centered
        >
          <Modal.Header  closeButton >
            <Modal.Title >Unable to add Instruction</Modal.Title>
          </Modal.Header>
          <Modal.Body >
            Please fill in the last instruction field before adding a new one
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={hideStopAddInstModal}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>


        
      </Row>
    </Form.Group>

  );
};
export default InstructionList;