import React from "react";
import { Button, Form, ListGroup, Container, Row } from 'react-bootstrap';



const InstructionList = ({
    currentRecipe,
    setCurrentRecipe,
    instructions,
    setErrors,

    // onChangeInstructions,
    // addInstruction,
    // removeInstruction,
    // moveInstructionUp,
    // moveInstructionDown,

    themeVariants,
    errors

  
}) => {

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
          </Container>

          <Container className="ingBtnContainer">          
            <Button   
              variant={themeVariants.variant === 'dark' ? "outline-danger" : "danger"} 
              className="ing-smaller-btn border-0"                   
              onClick={(e) => removeInstruction(index)}
              > 
                {/* <i className="bi bi-x-octagon h6"></i> */}
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
          onClick={(e) => addInstruction()}
        >Add Instruction</Button>
        
      </Row>
    </Form.Group>

  );
};
export default InstructionList;