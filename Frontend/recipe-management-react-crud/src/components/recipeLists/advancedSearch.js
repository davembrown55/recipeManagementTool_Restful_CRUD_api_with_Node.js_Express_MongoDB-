import React, {useState, useEffect} from "react";
import { Row, Col, Button, Form, ListGroup, Modal, Container } from 'react-bootstrap';


const AdvancedSearch = ({
    displaySubmitMessage,    
    themeVariants,    
    setSearchFeedbackString,    
    searchParams,
    setSearchParams,
    setHaveSearchParamsChanged
}) => {
    
    const [currentParamsBeforeSubmit, setCurrentParamsBeforeSubmit] = useState({});
    const [showAll, setShowAll] = useState(false);
    const [titleParam, setTitleParam] = useState(false);
    const [cookTimeParam, setCookTimeParam] = useState(false);
    const [ingredientsParam, setIngredientsParam] = useState(false);
    const [dietsParam, setDietsParam] = useState(false);    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("title");    
    const [errors, setErrors] = useState({});    
    const EMPTY_PARAMS = {}; // stable reference. to avoid potential unneccessary re-renders

    // Allow access to setParam functions from within loop when using keys 
    const paramSetters = {
        Ingredients: setIngredientsParam,
        Diets: setDietsParam,
      };
    
    const handleShowAllRecipes = () => {
        if (showAll) {
            setShowAll(false);           
        } else {            
            setShowAll(true);
            setCurrentParamsBeforeSubmit({});
            setErrors({});
            setTitleParam(false);
            setCookTimeParam(false);
            setIngredientsParam(false);
            setDietsParam(false);            
        }
    }

    const onChangeTitle = (e) => {
        const title = e.target.value;
        setCurrentParamsBeforeSubmit({ ...currentParamsBeforeSubmit, title });    
        const {titleError, ...validationErrors} = errors;  
        if (title.trim().length === 0 ){
          validationErrors.titleError = 'Field Empty';
        } 
        setErrors(validationErrors);    
    };

    const handleSearchTitle = () => {
        if (titleParam) {
            delete currentParamsBeforeSubmit.title;
            delete errors.titleError;
            setTitleParam(false);
        } else {            
            const { ...tempParamObj } = currentParamsBeforeSubmit;            
            tempParamObj.title = "";                        
            setCurrentParamsBeforeSubmit({ ...tempParamObj});
            setTitleParam(true);
        }        
    }

    const showSearchTitle = () => {
        if (titleParam) {        
            return (
                <Form.Group controlId="title" className="mb-1"> 
                        <Container className="p-0 m-0 w-75 d-flex flex-column ">
                            <Form.Control
                            type="text"
                            className="mw-75"
                            placeholder="Title"
                            value={currentParamsBeforeSubmit.title} 
                            data-bs-theme={themeVariants['data-bs-theme']}
                            onChange={onChangeTitle}
                            isInvalid={!!errors.titleError} 
                            size='sm'
                            autoFocus
                            >
                            </Form.Control>    
                            <Form.Control.Feedback  type="invalid" >
                                {errors.titleError}
                            </Form.Control.Feedback>

                        </Container>              
                </Form.Group> 
            ); 
        } 
    }


    const onChangeCookingTimeMinutes = (e) => {
        const cookingTimeMinutes = parseInt(e.target.value, 10) || 0; // Parse the input value to an integer
        setCurrentParamsBeforeSubmit({ ...currentParamsBeforeSubmit, cookingTimeMinutes }); 

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

    const handleSearchCookTime = () => {
        if (cookTimeParam) {
        // if (typeof currentParamsBeforeSubmit.title !== 'undefined') {
            delete currentParamsBeforeSubmit.cookingTimeMinutes;
            delete errors.cookTimeError;
            setCookTimeParam(false);
        } else {            
            const { ...tempParamObj } = currentParamsBeforeSubmit;            
            tempParamObj.cookingTimeMinutes = "";                        
            setCurrentParamsBeforeSubmit({ ...tempParamObj});
            setCookTimeParam(true);
        }        
    }

    const showSearchCookTime = () => {
        if (cookTimeParam) {
            return (
                <Form.Group controlId="CookingTime" className="mb-1">
                        <Container className="p-0 d-flex flex-column">
                            <Form.Control                      
                            type="text"     
                            placeholder="minutes"                 
                            value={currentParamsBeforeSubmit.cookingTimeMinutes}                             
                            data-bs-theme={themeVariants['data-bs-theme']}
                            onChange={onChangeCookingTimeMinutes}
                            className="w-50"
                            isInvalid={!!errors.cookTimeError}           
                            size='sm'             
                            autoFocus
                            >    
                            </Form.Control>
                            <Form.Control.Feedback type="invalid" >
                                {errors.cookTimeError}
                            </Form.Control.Feedback>
                        </Container>
                </Form.Group>        
            ); 
    }}

    const addBtnVisible = (index, itemType) => {
        if (currentParamsBeforeSubmit[itemType].length === 0 ) {
            return (
                <Button 
                variant='outline-success'
                className="ing-smaller-btn border-0" 
                onClick={(e) => addItem(itemType)}
                >
                    <i className="bi bi-plus-square"></i>
                </Button>
            )      
        } else if (currentParamsBeforeSubmit[itemType][index].trim().length > 0 
                    && index === currentParamsBeforeSubmit[itemType].length -1) {
                return (
                    <Button 
                    variant='outline-success'
                    className="ing-smaller-btn border-0" 
                    onClick={(e) => addItem(itemType)}
                    >
                        <i className="bi bi-plus-square"></i>
                    </Button>
                )} 
    }
    
    const delBtnVisible = (index, itemType) => {
        return(
            <Button  
            variant='outline-danger'
            className="ing-smaller-btn border-0"    
            onClick={() => removeItem(index, itemType)}            
            > 
              <i className="bi bi-trash"></i>
            </Button>
        )
    } 

    const ingredientIsVal = (index) => {
        if (typeof errors.ingredientsError === "undefined") {      
          return false;
        }
        
        if (typeof errors.ingredientsError[index] === "undefined") {
          return false;
        } else if (typeof errors.ingredientsError[index] !== "undefined") {
          return true;
        }    
    } 

    const removeItem = (index, itemsArray) => {
        if (currentParamsBeforeSubmit[itemsArray].length > 0) {
          // Remove the item from the array
          const newItemsArray = currentParamsBeforeSubmit[itemsArray].filter((item, i) => i !== index);
      
          // Update the form params
          setCurrentParamsBeforeSubmit({
            ...currentParamsBeforeSubmit,
            [itemsArray]: newItemsArray
          });
      
          // Remove any associated errors
          const nameForItemError = `${itemsArray}Error`;
          const itemErrorObj = errors[nameForItemError] || {};
      
          // Remove the error corresponding to the removed index
          const { [index]: removedError, ...newItemsArrayError } = itemErrorObj;
      
          // Create a copy of errors
          const newErrors = { ...errors };
      
          if (Object.keys(newItemsArrayError).length > 0) {
            newErrors[nameForItemError] = newItemsArrayError;
          } else {
            delete newErrors[nameForItemError];
          }     

          setErrors(newErrors);      
        }
      };

    const addItem = (itemsArray) => {
        if((currentParamsBeforeSubmit[itemsArray].length > 0 && 
        currentParamsBeforeSubmit[itemsArray][currentParamsBeforeSubmit[itemsArray].length -1].trim() !== "") 
         || currentParamsBeforeSubmit[itemsArray].length === 0 ) {
          const newItemArray = [... currentParamsBeforeSubmit[itemsArray], ""];
          setCurrentParamsBeforeSubmit({ ...currentParamsBeforeSubmit, [itemsArray]: newItemArray});
          //create error for new empty field
          if(itemsArray !== 'diets') {
            const { ...validationErrors } = errors;
            validationErrors[`${itemsArray}Error`] = { [currentParamsBeforeSubmit[itemsArray].length]: 'Field Empty' };
            setErrors(validationErrors);
          }          
        } 
    }

    const onChangeIngredients = (index, e) => {        
        const newIngredient = e.target.value;
         // Update the ingredients array
        const newIngredients = currentParamsBeforeSubmit.ingredients.map((ingredient, i) => {
          return i === index ? newIngredient : ingredient;
        });
        setCurrentParamsBeforeSubmit({ ...currentParamsBeforeSubmit, ingredients: newIngredients });
    
        // Destructure errors, excluding the specific ingredientError object and add to validationErrors    
        const { ingredientsError = {}, initialIngredientsError, ...validationErrors } = errors ;
    
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

    const handleSearchIngredients = () => {
        if (ingredientsParam) {
            delete currentParamsBeforeSubmit.ingredients;
            delete errors.ingredientsError;

            setIngredientsParam(false);
        } else {            
            const { ...tempParamObj } = currentParamsBeforeSubmit;            
            tempParamObj.ingredients = [""];                        
            setCurrentParamsBeforeSubmit({ ...tempParamObj});
            setIngredientsParam(true);
        }        
    }

    const showSearchIngredients = () => {
        if (ingredientsParam) {        
            return (
                <Form.Group controlId="Ingredients" className="mb-1">           
                    {currentParamsBeforeSubmit.ingredients.length > 0 ?
                        <ListGroup 
                        as="ul"         
                        variant={themeVariants.variant} 
                        data-bs-theme={themeVariants['data-bs-theme']}                    
                        numbered
                        >
                        
                            {currentParamsBeforeSubmit.ingredients.map((ingredient, index) => (
                            <ListGroup.Item 
                                key={index}
                                variant={themeVariants.variant}
                                className="d-flex justify-content-between list-item-cont"
                                >
                                
                                <Form.Group className="ingTextArea" >
                                <Form.Control
                                    type="text"      
                                    value={ingredient} 
                                    data-bs-theme={themeVariants['data-bs-theme']}
                                    onChange={(e) => onChangeIngredients(index, e)}        
                                    isInvalid={ingredientIsVal(index)}
                                    placeholder="Enter Ingredient"
                                    size='sm'
                                    autoFocus
                                >
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.ingredientsError !== undefined && errors.ingredientsError[`${index}`]  }
                                </Form.Control.Feedback> 
                                </Form.Group> 
                                <Container className="ingControlContainer d-flex p-0">
                                    <Container className="d-flex">
                                        {addBtnVisible(index, 'ingredients')}      
                                        {delBtnVisible(index, 'ingredients')} 
                                    </Container>       
                                </Container>
                            </ListGroup.Item>     
                    ))}                     
                    </ListGroup>                
                    : 
                    <ListGroup 
                        as="ul"         
                        variant={themeVariants.variant} 
                        data-bs-theme={themeVariants['data-bs-theme']}
                    >
                        <ListGroup.Item 
                            variant={themeVariants.variant}
                            className="d-flex justify-content-start list-item-cont">                
                                <Form.Group  >                 
                                    {addBtnVisible({}, 'ingredients')} 
                                </Form.Group>
                        </ListGroup.Item> 
                    </ListGroup>            
                    }                
                </Form.Group>
                ); 
    }} 

    const onChangeDiets = (index, e) => {
        const {value, selectedIndex, options} = e.target;
          const newDiet = value;
        // Update the diet array    
        if(options[selectedIndex].index !== 0) {
          const newDiets = currentParamsBeforeSubmit.diets.map((diet, i) => {
            return i === index ? newDiet : diet;
          });
          setCurrentParamsBeforeSubmit({ ...currentParamsBeforeSubmit, diets: newDiets });
          let id = `dietSelectIx${index}`;
          document.getElementById(id).selectedIndex = "0";    
        }
    }

    const handleSearchDietTypes = () => {
        if (dietsParam) {
            delete currentParamsBeforeSubmit.diets;
            setDietsParam(false);
        } else {            
            const { ...tempParamObj } = currentParamsBeforeSubmit;            
            tempParamObj.diets = [""];                        
            setCurrentParamsBeforeSubmit({ ...tempParamObj});
            setDietsParam(true);
        }        
    }

    const showSearchDiets = () => {
        if (dietsParam) {        
            return (
                <Form.Group controlId="Diets" className="mb-2">                                    
                {currentParamsBeforeSubmit.diets.length > 0 ?
                    <ListGroup 
                    as="ul"         
                    variant={themeVariants.variant} 
                    data-bs-theme={themeVariants['data-bs-theme']}
                    >
                    
                    {currentParamsBeforeSubmit.diets.map((diet, index) => (
                    <ListGroup.Item 
                        key={index}
                        variant={themeVariants.variant}
                        className="d-flex list-item-cont"
                        >                        
                        <Form.Group  >
                            <Form.Control 
                                type="text"      
                                value={diet} 
                                data-bs-theme={themeVariants['data-bs-theme']}
                                readOnly
                                size='sm'
                                placeholder="Diet Type"
                            >
                            </Form.Control>
                            <Form.Select 
                                aria-label="Select Diet Type"
                                id={`dietSelectIx${index}`}
                                size='sm'
                                onChange={(e) => onChangeDiets(index,  e)}  
                                autoFocus
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
                                {addBtnVisible(index, 'diets')}      
                                {delBtnVisible(index, 'diets')} 
                            </Container>
                        </Container>
                    </ListGroup.Item>                                    
                    ))}                     
                </ListGroup>                
            : 
                <ListGroup 
                    as="ul"         
                    variant={themeVariants.variant} 
                    data-bs-theme={themeVariants['data-bs-theme']}
                >
                <ListGroup.Item 
                    variant={themeVariants.variant}
                    className="d-flex justify-content-start list-item-cont">                
                        <Form.Group  >                 
                            {addBtnVisible({}, 'diets')} 
                        </Form.Group>
                </ListGroup.Item> 
                </ListGroup>            
            }                              
            </Form.Group>            
    )}}

    const showSearchFields = () => {
        if (!showAll) {
            return (
            <Container className="p-0">
                <Form.Check 
                    type="switch"
                    id="title-on-off"
                    label="Recipe Title"
                    className="small-text py-2"
                    checked={titleParam}
                    onChange={handleSearchTitle}
                    data-bs-theme={themeVariants['data-bs-theme']}   
                />
                    {showSearchTitle()}

                <Form.Check 
                    type="switch"
                    id="cookTime-on-off"
                    label="Max Cook Time"
                    className="small-text py-2"
                    checked={cookTimeParam}
                    onChange={handleSearchCookTime}
                    data-bs-theme={themeVariants['data-bs-theme']}   
                />
                    {showSearchCookTime()}

                <Form.Check 
                    type="switch"
                    id="ingredients-on-off"
                    label="Ingredients"
                    className="small-text py-2"
                    // defaultChecked={ingredientsParam}
                    checked={ingredientsParam}
                    onChange={handleSearchIngredients}
                    data-bs-theme={themeVariants['data-bs-theme']} 
                />
                    {showSearchIngredients()}

                <Form.Check 
                    type="switch"
                    id="diets-on-off"
                    label="Diet Types"
                    className="small-text py-2"
                    // defaultChecked={dietsParam}
                    checked={dietsParam}
                    onChange={handleSearchDietTypes}
                    data-bs-theme={themeVariants['data-bs-theme']} 
                />
                    {showSearchDiets()}

        </Container>
    );}}

 
    // to access handle'..' functions from within function using 'key' property
    const accessParamHandlerFunctions = {
        ingredients: handleSearchIngredients,
        diets: handleSearchDietTypes,
        title: handleSearchTitle,
        cookingTimeMinutes: handleSearchCookTime
    };  

    const checkParamsforEmptyOrDuplicateFields = () => {
        // Remove any empty fields or emptykey/val pairs
        // Remove any empty or duplicate fields from arrays, or empty arrays.
        let { ...tempObj } = currentParamsBeforeSubmit;
        let counter =  0;
        for (const [key, value] of Object.entries(currentParamsBeforeSubmit)) {
            if (Array.isArray(value)) {
                // remove any empty strings, or null fields
                let nonEmptyItemsArray = value.filter(function (e) {
                    return e; // Returns only truthy, or non empty values
                })
                //remove any duplicates
                let noDuplicatesArray = nonEmptyItemsArray.filter(((val, ix) => nonEmptyItemsArray.indexOf(val) === ix))   

                //delete key if array empty. Delete any associated errors
                if(noDuplicatesArray.length === 0 || (noDuplicatesArray.length === 1 && noDuplicatesArray[0].trim === "")) {
                    delete tempObj[key]
                    counter++;
                    // Use handle'Param' functions to delete associated errors 
                    // and update Param state boolean eg ingredientsParam (to render checkbox value and associated form input):
                    accessParamHandlerFunctions[key]?.();       
                }
                // Update params if any changes occured:
                if(value.length !== noDuplicatesArray.length ) {
                    tempObj = { ...tempObj, [key]: noDuplicatesArray };
                    counter++;
                }
            } else {
                if(typeof value == 'string'){
                    if (value.trim() === "" ) {
                        delete tempObj[key];
                        // Use handle'Param' functions to delete associated errors 
                        // and update Param state boolean eg ingredientsParam (to render checkbox value and associated form input):
                        accessParamHandlerFunctions[key]?.();  
                        counter++;
                    } 
                } else {
                    if (key == 'cookingTimeMinutes' && !Number.isInteger(value)) {                    
                        delete tempObj[key];
                        // Use handle'Param' functions to delete associated errors 
                        // and update Param state boolean eg ingredientsParam (to render checkbox value and associated form input):
                        accessParamHandlerFunctions[key]?.();  
                        counter++;                    
        }}}}    
        if (counter > 0 ) {            
            // update if any changes occured            
             setCurrentParamsBeforeSubmit(tempObj); 
        }                
    }
        
    // Handle search submission 
    const handleFormSubmit = (e) => {
        e.preventDefault();           
        if (Object.keys(errors).length === 0) {      
            checkParamsforEmptyOrDuplicateFields();
            setSearchQuery(currentParamsBeforeSubmit); 
            // reset params and fields
            setCurrentParamsBeforeSubmit({})
            setTitleParam(false);
            setCookTimeParam(false);
            setIngredientsParam(false);
            setDietsParam(false);
            setErrors({}); // Reset errors  
   
            }
        }; 
             
    // This useEffect runs AFTER searchQuery changes in handleFormSubmit function.
    useEffect(() => {
        // searchParams = parent params
        // searchQuery = params that control this useEffect function
        if (showAll) {
            // Only set searchParams if it's not already empty
            if (Object.keys(searchParams).length > 0) {
                setHaveSearchParamsChanged(true);
                setSearchParams(EMPTY_PARAMS);
                displaySubmitMessage();
            }
            setSearchFeedbackString('');
            return;
        }

        const {...params} = searchQuery;
        // Only set if params differ from the current searchParams
        if (JSON.stringify(params) !== JSON.stringify(searchParams)) {
            setHaveSearchParamsChanged(true);
            setSearchParams(params);
            displaySubmitMessage();            
        }

        // Update feedback string
        let feedback = '';
        let buildFeedback = {};
        for (const [key, value] of Object.entries(params)) {
            switch (key) {
                case "title":
                    buildFeedback[key] = `Title = '${value}'`;
                    break;
                case "cookingTimeMinutes":
                    buildFeedback[key] = `Max time = ${value} mins`;
                    break;
                case "ingredients":
                    const ingStr = Object.values(params.ingredients).join(', ');                    
                    buildFeedback[key] = `Ingredients = '${ingStr}'`;
                    break;
                case "diets":
                    const dietStr = Object.values(params.diets).join(', ');  
                    buildFeedback[key] = `Diets = '${dietStr}'`;
                    break;
                default:
                    break;
            }}

            if(Object.keys(buildFeedback).length > 0) {
                Object.values(buildFeedback).map((val => {
                    
                    if(feedback.trim().length > 0) {
                        feedback += `<br>${val}`;
                    } else {
                        feedback += `${val}`;
                    }
                }))                
            }
            setSearchFeedbackString(feedback);


    }, [searchQuery, searchType, searchParams, setSearchParams, setSearchFeedbackString, displaySubmitMessage]);
        
    const logParams = () => {        
        console.log(currentParamsBeforeSubmit);        
        console.log(errors);        
    };

    return(           
        <Form  onSubmit={handleFormSubmit} 
                className="px-2 pt-0 pb-3 d-flex flex-column align-items-center" 
                noValidate> 

            <Row xs={2} className="col-12 col-md-10 pt-3">
            <Col xs={12} md={9} >
            {showSearchFields()}
            <Form.Check 
                type="switch"
                id="show-all-recipes-on-off"
                label="Show all recipes"
                className="small-text py-2"
                checked={showAll}
                onChange={handleShowAllRecipes}
                data-bs-theme={themeVariants['data-bs-theme']}   
                   
            />           
            <Container className= "p-0 d-flex flex-column align-items-start">
            <Button 
                    className="mt-3"
                        variant="primary" 
                        onClick={logParams}
                >log</Button> 
                <Button 
                    className="mt-3"
                        variant="primary" 
                        type="submit" 
                        disabled={!showAll && ( Object.keys(currentParamsBeforeSubmit).length === 0  || 
                                    Object.keys(errors).length > 0)}
                >Search</Button>    
            </Container>
            
            </Col>
            </Row>          
        </Form>   
    );
};
export default AdvancedSearch;