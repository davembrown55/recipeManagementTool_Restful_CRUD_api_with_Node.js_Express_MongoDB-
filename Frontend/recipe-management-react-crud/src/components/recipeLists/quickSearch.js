import React, {useState, useEffect} from "react";
import { Row, Col, Button, Form } from 'react-bootstrap';

const QuickSearch = ({
    setActiveRecipe,
    displaySubmitMessage,    
    setValFailedClearResults,    
    // valOrSubmit,
    // setValOrSubmit,    
    themeVariants,    
    setSearchFeedbackString,    
    searchParams,
    setSearchParams,
    setHaveSearchParamsChanged
  }) => {
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [searchLabel, setSearchLabel] = useState("Title");
    const [newSearch, setNewSearch] = useState(true);
    const [errors, setErrors] = useState({});
    const [searchWhileTyping, setSearchWhileTyping] = useState(false);
    const EMPTY_PARAMS = {}; // stable reference. to avoid potential unneccessary re-renders
    const [valOrSubmit, setValOrSubmit] = useState({});
       
    // Handle search submission when searchWhileTyping is false
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!searchWhileTyping && (!!errors.maxCookingTime === false || !!errors.isEmptyError === false)) {      
            setSearchQuery(searchInput); 
            setSearchInput('');
            setErrors({}); // Reset errors    
            setValOrSubmit({});
            // setActiveRecipe(null, -1, null); // reset currentRecipe  
            setNewSearch(true);
            displaySubmitMessage();
        }
      };

      const handleSelectChange = (event) => {
        const { value, selectedIndex, options } = event.target;
        const label = options[selectedIndex].text; 
        setSearchType(value);
        setSearchLabel(label);
        setSearchQuery(''); // Reset search query on type change
        setErrors({}); // Reset errors on type change
        setValOrSubmit({}); 
        setActiveRecipe(null, -1, null); // reset currentRecipe    
        setNewSearch(true); //avoid Search field empty validation if input reset
        if(searchInput !== '') { 
          setSearchInput('');          
        }
      };

      // This effect only handles validation and updating searchQuery.
      useEffect(() => {

        const validateInput = () => {
          let isValid = true;
          let validationErrors = {};
          
          if (searchType === "maxCookingTime" && !newSearch) {
            if (isNaN(searchInput) || searchInput <= 0 ) {
              isValid = false;
              validationErrors['maxCookingTime'] = 'Please enter a valid number';
              if(searchWhileTyping) {
                setValFailedClearResults(true);
              }
            }
          }

          if (searchInput.trim().length === 0 && !newSearch) {
            validationErrors['isEmptyError'] = 'Search field empty';
            isValid = false;
          }

          setErrors(validationErrors);
          if(!newSearch) {
            setValOrSubmit(isValid ? { validation: 'input OK' } : {});
          }
          
          // setNewSearch(false);

          // If searchWhileTyping is enabled and input is valid, update searchQuery.
          if (searchWhileTyping && isValid && !newSearch) {
            setSearchQuery(searchInput);
          }

          // If searchWhileTyping and input empty, clear searchQuery to show all recipes
          if (searchWhileTyping && searchInput.trim().length === 0) {
            setSearchQuery('');
          }
        };
        validateInput();
        setNewSearch(false); // no Search field empty validation message on new search. 
  
        
      }, [searchInput, searchWhileTyping,  searchType, setErrors, setValOrSubmit, 
        setValFailedClearResults,  setSearchQuery]);


      

      // This effect runs AFTER searchQuery changes.
      useEffect(() => {
        // If searchQuery is empty, show all recipes
        if (searchQuery.trim() === '') {
          // Only set searchParams if it's not already empty
          if (Object.keys(searchParams).length > 0) {
            setHaveSearchParamsChanged(true);
            setSearchParams(EMPTY_PARAMS);
            displaySubmitMessage();
          }
          setSearchFeedbackString('');
          return;
        }

        // searchQuery is set, build params
        const params = { [searchType]: searchQuery };
        // setSearchParams(params);

        // Only set if params differ from the current searchParams
        if (JSON.stringify(params) !== JSON.stringify(searchParams)) {
          setHaveSearchParamsChanged(true);
          setSearchParams(params);
          displaySubmitMessage();
        }

        // Update feedback string
        let feedback = '';
        switch (searchType) {
          case "title":
            feedback = `Title = '${searchQuery}'`;
            break;
          case "maxCookingTime":
            feedback = `Time = ${searchQuery} mins, or less`;
            break;
          case "ingredients":
            feedback = `Ingredients = '${searchQuery}'`;
            break;
          default:
            feedback = '';
        }
        setSearchFeedbackString(feedback);
        

      }, [searchQuery, searchType, searchParams, setSearchParams, setSearchFeedbackString, displaySubmitMessage]);

      const onChangeSearchInput = (e) => {
        const value = e.target.value;        
        setSearchInput(value);
        // setNewSearch(false);
      };      

      const handleSearchWhileTyping = (e) => {
        setSearchWhileTyping(!searchWhileTyping);
        if (searchInput === '') {
          setNewSearch(true);
        }
      };

    return(           
      <Form  onSubmit={handleFormSubmit} 
             className="px-2 py-3 d-flex flex-column align-items-center" 
             noValidate> 

          <Row xs={2} className="col-12 col-md-9 pt-3">
            <Col xs={8} >
              <Form.Control 
                type="text"
                placeholder={`Search by ${searchLabel}`} 
                value={searchInput} 
                onChange={onChangeSearchInput} 
                isInvalid={!!errors.maxCookingTime || !!errors.isEmptyError}
                isValid={!!valOrSubmit.validation}                
                data-bs-theme={themeVariants['data-bs-theme']} 
              />
              <Form.Control.Feedback type="invalid">
                {errors.maxCookingTime || errors.isEmptyError}                
              </Form.Control.Feedback>
              <Form.Control.Feedback type="valid">
                {valOrSubmit.validation}              
              </Form.Control.Feedback>
              <div className='submittedMessage'>Search Submitted</div>
            </Col>
            <Col xs={1} md={3}>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={searchWhileTyping ||
                          !!errors.maxCookingTime }
                          /*|| !!errors.isEmptyError*/ 
                >Search</Button>
            </Col>
          </Row>          

          <Row  className="align-items-center col-12 col-md-9">
            <Col xs={12} md={6}>
              <p className="ps-2 pb-1 mb-0 small-text">Search Options:</p>
              <Form.Select 
                value={searchType}
                onChange={handleSelectChange}      
                data-bs-theme={themeVariants['data-bs-theme']}          
              >
                <option value="title" label="Search by Title">Title</option>
                <option value="maxCookingTime" label="Search by Max Cooking Time">Max Cooking Time</option>
                <option value="ingredients" label="Search by Ingredient">Ingredient</option>

              </Form.Select>  
              <Form.Check 
                type="switch"
                id="search-while-typing"
                label={`Search while typing`}
                // label={`Search while typing is: ${searchWhileTyping ? 'On' : 'Off'}`}
                className='small-text py-2'
                checked={searchWhileTyping}
                onChange={handleSearchWhileTyping}
                data-bs-theme={themeVariants['data-bs-theme']}   
              />
            </Col>
          </Row>
          </Form>   


    
    );
};
export default QuickSearch;