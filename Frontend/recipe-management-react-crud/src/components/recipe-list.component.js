import React, { useState, useEffect, useCallback} from 'react';
import useRecipeService from "../services/recipe.service";
import { Link, useNavigate } from "react-router-dom";
import Pagination from '@mui/material/Pagination';
import { Container, Row, Stack, Col, Button, Form, ListGroup, Card, Nav } from 'react-bootstrap';
import { useTheme} from '../common/ThemeProvider';
import { useAuth }  from '../auth/AuthContext';

const RecipeList = () => {
  const navigate = useNavigate();
  

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 577);
  const [searchWhileTyping, setSearchWhileTyping] = useState(true);
  const [pageSize, setPageSize] = useState(isSmallScreen ? 3 : 6);  
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [searchLabel, setSearchLabel] = useState("Title");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const pageSizes = [3, 6, 9];
  const [errors, setErrors] = useState({});
  const [valOrSubmit, setValOrSubmit] = useState({});
  const [valFailedClearResults, setValFailedClearResults] = useState(false);
  const [newSearch, setNewSearch] = useState(true);
  const [currentId, setCurrentId] = useState(null);

  const { getAll } = useRecipeService();
  const { userRole, userName, verify } = useAuth();

  const getRequestParams = (searchQuery, page, pageSize) => {
    let params = {};
    if (searchQuery) {
      params[searchType] = searchQuery;
    }
    if (page) {
      params["page"] = page - 1;
    }
    if (pageSize) {
      params["size"] = pageSize;
    }
    return params;
  };
  

  const retrieveRecipes = useCallback(async () => {
    try {
      const params = getRequestParams(searchQuery, page, pageSize);
      const data = await getAll(params);
      const { recipes, totalPages, totalItems } = data;
      setRecipes(Array.isArray(recipes) ? recipes : []);
      setCount(totalPages || 0);
      setTotalRecipes(totalItems);
      setValFailedClearResults(false);
      if(userRole === 'admin' && data.role === 'user') {
        await verify();
      }
    } catch (e) {
      console.error(e);
      setRecipes([]);
      setCount(0);
    }
  }, [getAll, page, pageSize, searchQuery]);
  

  // Clear recipe array on non-Empty validation fail
  useEffect(() => {  
    if(valFailedClearResults) {
      setRecipes([]);
      setTotalRecipes(0);
    };
  }, [valFailedClearResults]);

  // Get recipes
  useEffect(() => {    
      retrieveRecipes();
  }, [page, pageSize, searchQuery, retrieveRecipes]);


  // Handle search submission when searchWhileTyping is false
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!searchWhileTyping && (!!errors.maxCookingTime === false || !!errors.isEmptyError === false)) {      
        setSearchQuery(searchInput); 
        setPage(1);
        setActiveRecipe(null, -1, null); // reset currentRecipe        
        setSearchInput('');
        setErrors({}); // Reset errors       
        setNewSearch(true);
        displaySubmitMessage();
    }
  };

  const displaySubmitMessage = () => {
    
    const submitMessage = document.getElementsByClassName("submittedMessage");
      submitMessage[0].style.visibility = "visible";
      submitMessage[0].style.opacity = "1";
      submitMessage[0].style.transition = "visibility 0s linear 0s, opacity 700ms";

    const submitTimer =  window.setTimeout(() => {
        submitMessage[0].style.visibility = "hidden";
        submitMessage[0].style.opacity = "0";
        submitMessage[0].style.transition = "visibility 0s linear 300ms, opacity 1000ms";
      }, 1000);
      return () => clearTimeout(submitTimer);
  };

  // UseEffect to handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth <= 577;
      setIsSmallScreen(isSmall);      
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  

  useEffect(() => {
    if (currentRecipe) {
      const newPageSize = isSmallScreen ? 3 : 6;

      //Set page that contains selected recipe in new array
      const prevOffset = (page - 1) * pageSize;      
      const recipeIndexTotalItems = prevOffset + currentIndex;
      const newPage = Math.floor(recipeIndexTotalItems / newPageSize) + 1;
      setPage(newPage);
      
      //set current index, as array size from server will be different
      const newOffset = newPageSize * (newPage - 1);
      const newIndex = recipeIndexTotalItems - newOffset;
      setPageSize(newPageSize);
      setCurrentIndex(newIndex);

    } else {  
      const newPageSize = isSmallScreen ? 3 : 6;
      setPageSize(newPageSize);
      setPage(1);
    };      
  }, [isSmallScreen]);

  const onChangeSearchInput = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  useEffect(() => {
    const validateInput = () => {

      let isValid = true; 
      let validationSuccess = {}; 
      let validationErrors = {};
  
      if (searchType === "maxCookingTime") {
        if (isNaN(searchInput) ) {
          isValid = false;
          validationErrors['maxCookingTime'] = 'Please enter a valid number';
          if(searchWhileTyping) {
            setValFailedClearResults(true);
          }
      }};

      if (searchInput.trim().length === 0 && !newSearch) {
        validationErrors['isEmptyError'] = 'Search field empty';
        isValid = false;
      };
      
      if (!!errors && !newSearch) { 
        validationSuccess['validation'] = 'input OK';
      };  

      if (searchWhileTyping && !!!validationErrors.maxCookingTime  && 
      !!validationErrors.isEmptyError) {
          setSearchQuery('');
          retrieveRecipes();
      };

      setErrors(validationErrors); 
      setValOrSubmit(validationSuccess);

      if(searchWhileTyping) { 
        setActiveRecipe(null, -1, null); 
        setPage(1);
        if(isValid && !newSearch) { 
          setSearchQuery(searchInput);
          displaySubmitMessage();
        };
      };     
      
      if(isValid) {        
        setErrors({});
      } else if(!isValid) {
        setValOrSubmit({});         
      };
    };
    validateInput();
    setNewSearch(false); // no Search field empty validation message on new search. 
  }, [searchInput]);



  const handleSelectChange = (event) => {
    const { value, selectedIndex, options } = event.target;
    const label = options[selectedIndex].text; 
    setSearchType(value);
    setSearchLabel(label);
    setSearchQuery(''); // Reset search query on type change
    setErrors({}); // Reset errors on type change
    setValOrSubmit({}); 
    setActiveRecipe(null, -1, null); // reset currentRecipe    
    if(searchInput !== '') { 
      setSearchInput('');
      setNewSearch(true); //avoid Search field empty validation if input reset
    }
  };


  const handleSearchWhileTyping = (e) => {
    setSearchWhileTyping(!searchWhileTyping);
  };

  const setActiveRecipe = (recipe, id, index) => {
    setCurrentRecipe(recipe);
    setCurrentIndex(index);
    setCurrentId(id); 
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);    
    if (currentRecipe) {
      //Set page that contains selected recipe in new array
      const prevOffset = (page - 1) * pageSize;      
      const recipeIndexTotalItems = prevOffset + currentIndex;
      const newPage = Math.floor(recipeIndexTotalItems / newPageSize) + 1;
      setPage(newPage);
      
      //set current index, as array size from server will be different
      const newOffset = newPageSize * (newPage - 1);
      const newIndex = recipeIndexTotalItems - newOffset;
      setPageSize(newPageSize);
      setCurrentIndex(newIndex);     
    } else {  
      setPageSize(newPageSize);
      setPage(1);
    };
  };
  
  const { themeVariants } = useTheme(); 

  const handleNoSearchResults = () => {
    if (recipes.length === 0 ) {
      return <ListGroup.Item
        action variant={themeVariants.variant} as="li" key="no-results"
        >No recipe's meet that criteria</ListGroup.Item>
    } else { 
      return recipes.map((recipe, index) => (
        <ListGroup.Item action  variant={themeVariants.variant} as="li"   
          className={recipe.id === currentId ? "active" : ""}
          onClick={() => setActiveRecipe(recipe, recipe.id, index)}
          key={recipe.id || index}
        >
          {recipe.title}
        </ListGroup.Item>
      ));  
    }
  }

  const searchResultFeedback = () => {
    const searchTypeToDisplayTxt = () => {
        switch (searchType) {
          case "title":
            return `Title = '${searchQuery}'`;
          case "maxCookingTime": 
            return `Time = ${searchQuery} mins, or less`;
          case "ingredients":
            return `Ingredients = '${searchQuery}'`
    }}

    if(!!searchQuery) {
      if(recipes.length === 1){       
          return <div ><p className="results-text" >        
          {`Results for: ${searchTypeToDisplayTxt()}`} </p>
          <p className="results-text" > {`Found ${totalRecipes} recipe`}</p></div>;
      } else {        
          return <div ><p className="results-text" >
          {`Results for: ${searchTypeToDisplayTxt()}`} </p>
          <p className="results-text" >  {`Found ${totalRecipes} recipes`}</p></div>;
      } 
    } else {
      return <div ><p className="results-text" >        
          {`Showing all recipes`}</p>
          <p className="results-text" > {`Found ${totalRecipes} in total`}</p></div>;
    }    
  }

  // const handleSelect = (selectedKey) => {
  //   if (selectedKey === "ExistingUser") {
  //       navigate("/login/existingUser");
  //   } else {
  //       navigate("/login/register");
  //   }
  // };

  // const renderTabContent = () => {
  //   if (activeTab === "ExistingUser") {
  //       return <ExistingUser />;
  //   } else if (activeTab === "UserRegister") {
  //       return <UserRegister />;
  //   }
  // };

  const renderSearchForm = () => {
    return (
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
                defaultChecked={searchWhileTyping}
                onChange={handleSearchWhileTyping}
                data-bs-theme={themeVariants['data-bs-theme']}   
              />
            </Col>
          </Row>
          </Form>
    );

  }

  return (

    <Container fluid  className='list-container p-0'>
      <Stack gap={1}>
        {/* // Make this call one of two seperate componenents? standard search, or advanced search*/}
        
        <Card
          bg={themeVariants.variant === 'dark' ? 'dark' : ''}
          variant={themeVariants.variant}
          key={themeVariants.variant}
          text={themeVariants.text}
        >
        {/* <Card.Header className="loginCardHeader" 
                variant={themeVariants.variant}
                bg={themeVariants.variant === 'dark' ? 'dark' : ''}
              >
                <Nav 
                  variant="tabs" 
                  activeKey={activeTab}
                // onSelect={(selectedKey) => setActiveTab(selectedKey)}
                  onSelect={handleSelect}
                  data-bs-theme={themeVariants['data-bs-theme']} 
                >
                  <Nav.Item>
                      <Nav.Link eventKey="ExistingUser" >User Login</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                      <Nav.Link eventKey="UserRegister">New User</Nav.Link>
                  </Nav.Item>
                </Nav>
      </Card.Header> */}
      <Card.Body>  
      {renderSearchForm()}
      </Card.Body>

        
        </Card>  
        

        {/*  */}
        
        <Row >         
        <Col xs={12} md={6} className="d-flex mt-1">
              <Col xs={6}  className='small-screen-ps'>
                <Pagination
                  count={count}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                  variant="outlined"
                  shape="rounded"             
                />
              </Col>
              <Col xs={6} className='small-screen-ps'>
                <Form.Select value={pageSize} 
                  onChange={handlePageSizeChange}  
                  className="small-text"
                  data-bs-theme={themeVariants['data-bs-theme']}
                >
                  {pageSizes.map(size => (
                    <option className="small-text" key={size} value={size}>{size + " items per page"}</option>                    
                  ))}
                </Form.Select>
              </Col>              
          </Col>

      </Row>      
        <Row xs={1} sm={2} className='mb-10'>        
          <Col className="col-md-6">      
          {searchResultFeedback()}
          <Col xs={12} md={7}><h4 className="ps-2 ">Recipe List</h4></Col> 
            <Col>              
              <ListGroup 
                as="ul" 
                variant={themeVariants.variant}  
                data-bs-theme={themeVariants['data-bs-theme']} >
                  {handleNoSearchResults()}
              </ListGroup>
            </Col>
          </Col>          
          <Col className="col-md-6 mt-3 mt-md-0">
            {currentRecipe && (
              <Card
                  bg={themeVariants.variant === 'dark' ? 'dark' : ''}
                  variant={themeVariants.variant}
                  key={themeVariants.variant}
                  text={themeVariants.text}
                  style={{ width: '20rem' }}
                  className="mb-3 small-screen-ms-ps"
              > 
                {/* <Card.Header 
                  as="h4"
                  variant={themeVariants.variant}  
                  data-bs-theme={themeVariants['data-bs-theme']}
                >{currentRecipe.title}</Card.Header> */}
                <Card.Title 
                  as="h4"
                  variant={themeVariants.variant}  
                  data-bs-theme={themeVariants['data-bs-theme']}
                  className='recipeCardTitle'
                >{currentRecipe.title}</Card.Title>

                <Card.Body className='p-2'>
                  <Card.Text as="h5" className='mt-3 mb-2'>
                    Description:
                  </Card.Text>
                  <ListGroup  
                    variant={themeVariants.variant}  
                    data-bs-theme={themeVariants['data-bs-theme']}
                    className='mb-3'
                  > <ListGroup.Item
                      variant={themeVariants.variant}
                    >{currentRecipe.description}
                    </ListGroup.Item>
                  </ListGroup>                  
                  <Card.Text as="h5" className='mb-2' >
                    Cooking Time:
                  </Card.Text>                  
                  <ListGroup  
                    variant={themeVariants.variant}  
                    data-bs-theme={themeVariants['data-bs-theme']}
                    className='mb-3'
                  > 
                    <ListGroup.Item
                      variant={themeVariants.variant}
                    >{currentRecipe.cookingTimeMinutes} minutes
                    </ListGroup.Item>
                  </ListGroup>
                  <Card.Text as="h5" className='mb-2'>
                    Ingredients:
                  </Card.Text>         
                  <ListGroup as="ul" 
                    className='mb-3'
                    variant={themeVariants.variant}  
                    data-bs-theme={themeVariants['data-bs-theme']}
                  >                    
                        {currentRecipe.ingredients.map((ingredient, index) => (    
                          <ListGroup.Item action  variant={themeVariants.variant} as="li"   
                          key={index}>
                          • &nbsp; {ingredient}
                          </ListGroup.Item>
                        ))}
                  </ListGroup>   
                  <Card.Text as="h5" className='mb-2'>
                    Diet Type:
                  </Card.Text>         
                  <ListGroup as="ul" 
                    className='mb-3'
                    variant={themeVariants.variant}  
                    data-bs-theme={themeVariants['data-bs-theme']}
                  >                    
                        {currentRecipe.diets.length === 0 
                          || typeof currentRecipe.diets === "undefined"  
                          || (currentRecipe.diets.length === 1 && currentRecipe.diets[0].trim() === "" ) ? 
                          <ListGroup.Item action  variant={themeVariants.variant} as="li"   
                            >None
                          </ListGroup.Item> :
                          currentRecipe.diets.map((diet, index) => (    
                            <ListGroup.Item action  variant={themeVariants.variant} as="li"   
                            key={index}>
                              • &nbsp; {diet}
                            </ListGroup.Item>
                          ))                         
                        }
                  </ListGroup>   

                </Card.Body >
                {userName === currentRecipe.username ? 
                  <Button variant="primary" className="align-self-end mb-3 me-3" >
                    <Link to={`/recipes/${currentRecipe.id}`} className="text-light">
                      View and Edit
                    </Link>
                  </Button>
                  :
                  <Button variant="primary" className="align-self-end mb-3 me-3" >
                    <Link to={`/recipes/${currentRecipe.id}`} className="text-light">
                      View
                    </Link>
                  </Button>
                }                
              </Card>
            )}
          </Col>
        </Row>  
      </Stack>
    </Container>

  );
};

export default RecipeList;
