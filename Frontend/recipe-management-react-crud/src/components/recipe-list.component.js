import React, { useState, useEffect } from 'react';
import RecipeDataService from "../services/recipe.service";
import { Link } from "react-router-dom";
import Pagination from '@mui/material/Pagination';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [searchLabel, setSearchLabel] = useState("Title");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const pageSizes = [3, 6, 9];
  const [errors, setErrors] = useState({});

  useEffect(() => {
    retrieveRecipes();
  }, [searchQuery, page, pageSize, searchType]);

  const onChangeSearchQuery = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchType === "maxCookingTime") {
      if (isNaN(value) || value === "") {
        setErrors({ maxCookingTime: 'Please enter a valid number' });
      } else {
        setErrors({});
      }
    }
  };

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

  const retrieveRecipes = () => {
    const params = getRequestParams(searchQuery, page, pageSize);

    RecipeDataService.getAll(params)
      .then(response => {
        const { recipes, totalPages } = response.data;
        setRecipes(Array.isArray(recipes) ? recipes : []);
        setCount(totalPages || 0);
      })
      .catch(e => {
        console.log(e);
        setRecipes([]); 
        setCount(0);
      });
  };

  const validateInput = () => {
    let isValid = true;
    let validationErrors = {};

    if (searchType === "maxCookingTime") {
      if (isNaN(searchQuery) || searchQuery === "") {
        isValid = false;
        validationErrors['maxCookingTime'] = 'Please enter a valid number';
      }
    }

    setErrors(validationErrors);
    return isValid;
  };

  const searchByOption = () => {
    if (!validateInput()) {
      return; // Stop the function if validation fails
    }
    retrieveRecipes();
  };

  const handleSelectChange = (event) => {
    const { value, selectedIndex, options } = event.target;
    const label = options[selectedIndex].text; 
    setSearchType(value);
    setSearchLabel(label);
    setSearchQuery(''); // Reset search query on type change
    setErrors({}); // Reset errors on type change
  };

  const setActiveRecipe = (recipe, index) => {
    setCurrentRecipe(recipe);
    setCurrentIndex(index);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    searchByOption();
  };

  return (

    <Container fluid  className='list-container p-0'>

      <Stack gap={3}>
        <Form  onSubmit={handleFormSubmit}> {/*className="mb-3"*/}

          <Row xs={2} sm={2} md={2} lg={2} className="col-md-9 py-3">
            <Col xs={8} sm={8} md={8} lg={8}>
              <Form.Control 
                type={searchType === "maxCookingTime" ? "number" : "text"}
                placeholder={`Search by ${searchLabel}`} 
                value={searchQuery} 
                onChange={onChangeSearchQuery} 
                isInvalid={!!errors.maxCookingTime}
              />
              <Form.Control.Feedback type="invalid">
                {errors.maxCookingTime}
              </Form.Control.Feedback>
            </Col>
            <Col xs={1} sm={3} md={3} lg={3}>
              <Button variant="primary" type="submit">Search</Button>
            </Col>
          </Row>          

          <Row className="align-items-center col-md-10">
            <Col xs={12} sm={12} md={6} lg={6}>
              <p className="ps-2 pb-1 mb-0 small-text">Search Options:</p>
              <Form.Select 
                value={searchType}
                onChange={handleSelectChange}
              >
                <option value="title" label="Search by Title">Title</option>
                <option value="maxCookingTime" label="Search by Max Cooking Time">Max Cooking Time</option>
                <option value="ingredients" label="Search by Ingredient">Ingredient</option>
              </Form.Select>  
              
            </Col>
          </Row>

        </Form>

        <Row >
         
        <Col xs={12} sm={12} md={6} lg={6} className="d-flex align-items-center mt-1">

              <Col xs={6} sm={6} md={6} lg={6}>
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
              <Col xs={3} sm={3} md={6} lg={6}>
                <Form.Select value={pageSize} onChange={handlePageSizeChange}  className="small-text">
                  {pageSizes.map(size => (
                    <option className="small-text" key={size} value={size}>{size + " items per page"}</option>
                  ))}
                </Form.Select>
              </Col>
          </Col>
      </Row>

        <Row xs={1} sm={2} md={2} lg={2}>          
          <Col className="col-md-6">      
          <Col xs={12} md={7}><h4 className="ps-2 ">Recipe List</h4></Col> 
            <Col>              
              <ul className="list-group">
                {recipes.map((recipe, index) => (
                  <li
                    className={"list-group-item " + (index === currentIndex ? "active" : "")}
                    onClick={() => setActiveRecipe(recipe, index)}
                    key={index}
                  >
                    {recipe.title}
                  </li>
                ))}
              </ul>
            </Col>

          </Col>
          <Col className="col-md-6 mt-3 mt-md-0">
            {currentRecipe && (
              <div className="px-3">
                <h4>Recipe Details</h4>
                <p className="mb-1"><strong>Title:</strong> {currentRecipe.title}</p>
                <Badge bg="warning">
                  <Link to={`/recipes/${currentRecipe.id}`}>
                    View and Edit
                  </Link>
                </Badge>
                <p><strong>Description:</strong> {currentRecipe.description}</p>
                <p><strong>Cooking Time:</strong> {currentRecipe.cookingTimeMinutes + " minutes"}</p>
                <p className="mb-0"><strong>Ingredients:</strong></p>
                <ul className="small-text">
                  {currentRecipe.ingredients.map((ingredient) => (
                      <li key={ingredient.id}>{ingredient}</li>
                    ))}
               </ul>

              </div>
            )}
          </Col>
        </Row>

      </Stack>
    </Container>

  );
};

export default RecipeList;
