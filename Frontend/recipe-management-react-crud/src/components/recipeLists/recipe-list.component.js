import React, { useState, useEffect, useCallback} from 'react';
import useRecipeService from "../../services/recipe.service";
import { Link, useNavigate } from "react-router-dom";
import Pagination from '@mui/material/Pagination';
import { Container, Row, Stack, Col, Button, Form, ListGroup, Card, Nav, Spinner } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';
import { useAuth }  from '../../auth/AuthContext';
import QuickSearch from './quickSearch';
import AdvancedSearch from './advancedSearch';

const RecipeList = ({ type }) => {
  const [quickSearch, setQuickSearch] = useState(true);
  const [activeTab, setActiveTab] = useState(quickSearch ? "quickSearch" : "advancedSearch");
  const [searchParams, setSearchParams] = useState({});
  const [searchFeedbackString, setSearchFeedbackString] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 577);
  const [pageSize, setPageSize] = useState(isSmallScreen ? 3 : 6);  
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const pageSizes = [3, 6, 9];
  const [valFailedClearResults, setValFailedClearResults] = useState(false);
  const [haveSearchParamsChanged, setHaveSearchParamsChanged] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const { getAll } = useRecipeService();
  const { userRole, userName, verify } = useAuth();
  const [isLoading, setIsLoading] = useState(true);


  const getRequestParams = (searchParams, page, pageSize) => {
    let params = {};
    if (!!searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        params[key] = value;
      });        
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
    // setIsLoading(true);
    try { 
      const params = getRequestParams(searchParams, page, pageSize);
      let searchTypeParam = quickSearch ? 'quick' : 'advanced';

      const data = await getAll(params, searchTypeParam, type);
      if(userRole !== data.role) {
        await verify();
      }
      const { recipes, totalPages, totalItems } = data;
      setRecipes(Array.isArray(recipes) ? recipes : []);
      setCount(totalPages || 0);
      setTotalRecipes(totalItems);

      setValFailedClearResults(false);
      if (!!searchParams && haveSearchParamsChanged) { 
        setPage(1);
        setActiveRecipe(null, -1, null); // reset currentRecipe 
      }     
    } catch (e) {
        console.error(e);
        setRecipes([]);
        setCount(0);
        await verify();
    } finally {
        setIsLoading(false); 
    }
  }, [getAll, page, pageSize, searchParams, setIsLoading]);  

  // Clear recipe array on non-Empty validation fail
  useEffect(() => {  
    if(valFailedClearResults) {
      setRecipes([]);
      setTotalRecipes(0);
    };
  }, [valFailedClearResults]);

  // Get recipes
  useEffect(() => {           
      setIsLoading(true);
      retrieveRecipes();
  }, [page, pageSize, searchParams, retrieveRecipes]);

  const displaySubmitMessage = () => {    
    const submitMessage = document.getElementsByClassName("submittedMessage");
    if (submitMessage.length > 0) {  
      
      submitMessage[0].style.visibility = "visible";
        submitMessage[0].style.opacity = "1";
        submitMessage[0].style.transition = "visibility 0s linear 0s, opacity 700ms";

      
        const submitTimer =  window.setTimeout(() => {
          if(submitMessage.length > 0) {
            submitMessage[0].style.visibility = "hidden";
            submitMessage[0].style.opacity = "0";
            submitMessage[0].style.transition = "visibility 0s linear 300ms, opacity 1000ms";
          }
        }, 1000);
        return () => clearTimeout(submitTimer);
      }      
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
      setHaveSearchParamsChanged(false);

    } else {  
      const newPageSize = isSmallScreen ? 3 : 6;
      setPageSize(newPageSize);
      setPage(1);
      // setHaveSearchParamsChanged(false);
    };      
  }, [isSmallScreen]);

  const setActiveRecipe = (recipe, id, index) => {
    setCurrentRecipe(recipe);
    setCurrentIndex(index);
    setCurrentId(id); 
  };

  const handlePageChange = (event, value) => {
    setHaveSearchParamsChanged(false);
    setPage(value);    
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);    
    if (currentRecipe) {
      //Set page that contains selected recipe in new array
      const prevOffset = (page - 1) * pageSize;      
      const recipeIndexTotalItems = prevOffset + currentIndex;
      const newPage = Math.floor(recipeIndexTotalItems / newPageSize) + 1;
      setHaveSearchParamsChanged(false);
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
    if (isLoading) {
      return <Container className="d-flex justify-content-center gap-5 ps-0">
              <Spinner animation="border" variant={themeVariants.text} />
              <p>Loading...</p>        
            </Container>
    }
    else if (recipes.length === 0 ) {
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
   // inner html to proccess line break <br> added in 'advancedSearch' for multipple params
    if(typeof document.getElementsByClassName("feedBackStr")[0] !== 'undefined'){
      document.getElementsByClassName("feedBackStr")[0].innerHTML = `Results for: ${searchFeedbackString}`;
    }
    if(!!searchParams && !!searchFeedbackString) {
      if(recipes.length === 1){       
          return <div ><p className="results-text feedBackStr" ></p>        
          <p className="results-text" > {`Found ${totalRecipes} recipe`}</p></div>;
      } else {        
          return <div ><p className="results-text feedBackStr" ></p>
          <p className="results-text" >  {`Found ${totalRecipes} recipes`}</p></div>;
      } 
    } else {
      return <div ><p className="results-text" >        
          {`Showing all recipes`}</p>
          <p className="results-text" > {`Found ${totalRecipes} in total`}</p></div>;
    }        
  }

  const handleSelect = (selectedKey) => {
    if (selectedKey === "advancedSearch") {
        setActiveTab("advancedSearch");
        setQuickSearch(false);
    } else {
      setActiveTab("quickSearch");
      setQuickSearch(true);
    }
  };

  const renderSearchForm = () => {
    if (activeTab === "quickSearch") {
        return <QuickSearch        
                  setActiveRecipe={setActiveRecipe}
                  displaySubmitMessage={displaySubmitMessage} 
                  setValFailedClearResults={setValFailedClearResults}
                  themeVariants={themeVariants}    
                  setSearchFeedbackString={setSearchFeedbackString}                  
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  setHaveSearchParamsChanged={setHaveSearchParamsChanged}
               />;
    } else if (activeTab === "advancedSearch") {
        return <AdvancedSearch 
                  displaySubmitMessage={displaySubmitMessage} 
                  themeVariants={themeVariants}    
                  setSearchFeedbackString={setSearchFeedbackString}                  
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  setHaveSearchParamsChanged={setHaveSearchParamsChanged}
              />;
    }    
  }

  return (
    <Container fluid  className='list-container p-0'>
      <Stack gap={1}>        
        <Card
          bg={themeVariants.variant === 'dark' ? 'dark' : ''}
          variant={themeVariants.variant}
          key={themeVariants.variant}
          text={themeVariants.text}
        >
          <Card.Header className="loginCardHeader" 
                  variant={themeVariants.variant}
                  bg={themeVariants.variant === 'dark' ? 'dark' : ''}
                >
                  <Nav 
                    variant="tabs" 
                    activeKey={activeTab}
                    onSelect={handleSelect}
                    data-bs-theme={themeVariants['data-bs-theme']} 
                  >
                    <Nav.Item>
                        <Nav.Link eventKey="quickSearch" >Quick Search</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="advancedSearch">Advanced Search</Nav.Link>
                    </Nav.Item>
                  </Nav>
          </Card.Header>
          <Card.Body>  
           {renderSearchForm()}

          </Card.Body>          
        </Card>  

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
          <Col xs={12} md={7}><h4 className="ps-2 ">{type === 'mine' ? 'My Recipe List' : 'All Recipe List'}</h4></Col> 
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
