import React, { Component } from "react";
import RecipeDataService from "../services/recipe.service";

import { Link } from "react-router-dom";
import Pagination from '@mui/material/Pagination';
import Badge from 'react-bootstrap/Badge';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



export default class RecipeList extends Component {
  constructor(props) {
    super(props);
    this.onChangeSearchTitle = this.onChangeSearchTitle.bind(this);
    this.retrieveRecipes = this.retrieveRecipes.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.setActiveRecipe = this.setActiveRecipe.bind(this);
    this.removeAllRecipes = this.removeAllRecipes.bind(this);
    this.searchTitle = this.searchTitle.bind(this);

    this.searchIngredient = this.searchIngredient.bind(this)

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);


    this.state = {
      recipes: [],
      currentRecipe: null,
      currentIndex: -1,
      searchTitle: "",

      searchIngredient: "",

      page: 1,
      count: 0,
      pageSize: 3,
    };

    this.pageSizes = [3, 6, 9];
  }

  componentDidMount() {
    this.retrieveRecipes();
  }

  onChangeSearchTitle(e) {
    const searchTitle = e.target.value;

    this.setState({
      searchTitle: searchTitle
    });
  }

  getRequestParams(searchTitle, page, pageSize) {
    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    return params;
  }

  retrieveRecipes() {
    const { searchTitle, page, pageSize } = this.state;
    const params = this.getRequestParams(searchTitle, page, pageSize);

    RecipeDataService.getAll(params)
      .then(response => {
        const { recipes, totalPages } = response.data;

        this.setState({
            recipes: recipes,
            count: totalPages,
          });
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
  }

  refreshList() {
    this.retrieveRecipes();
    this.setState({
      currentRecipe: null,
      currentIndex: -1
    });
  }

  setActiveRecipe(recipe, index) {
    this.setState({
      currentRecipe: recipe,
      currentIndex: index
    });
  }

  removeAllRecipes() {
    RecipeDataService.deleteAll()
      .then(response => {
        console.log(response.data);
        this.refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  }

  searchTitle() {
    RecipeDataService.findByTitle(this.state.searchTitle)
      .then(response => {
        this.setState({
          recipes: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  searchIngredient() {
    RecipeDataService.findByIngredient(this.state.searchIngredient)
      .then(response => {
        this.setState({
          recipes: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  handlePageChange(event, value) {
    this.setState(
      {
        page: value,
      },
      () => {
        this.retrieveRecipes();
      }
    );
  }

  handlePageSizeChange(event) {
    this.setState(
      {
        pageSize: event.target.value,
        page: 1
      },
      () => {
        this.retrieveRecipes();
      }
    );
  }

  render() {
    
    const { searchTitle, 
            searchIngredient,
            searchCookingTime,
            recipes, 
            currentRecipe, 
            currentIndex, 
            page,
            count, 
            pageSize, 
    } = this.state;

    const searchValue = () => {
      switch(selectedSearchOption) {
        case 'title':
          return [searchTitle, this.onChangeSearchTitle];
        case 'cookingTime':
          return [searchCookingTime, this.onChangeSearchCookngTime];
        case 'ingredient':
          return [searchIngredient, this.onChangeSearchIngredient];
      }
    }

    // const searchOnChange = () => {
    //   switch(selectedSearchOption) {
    //     case 'title':
    //       return this.onChangeSearchTitle;
    //     case 'cookingTime':
    //       return this.onChangeSearchCookngTime;
    //     case 'ingredient':
    //       return this.onChangeSearchIngredient;
    //   }
    // }



    return (




      <Container>   
      <Container>   

      <Container fluid className = "list p-0 ">
        <Stack gap={3}>         


          
          <Row xs={1} sm={1} md={2} lg={2} className="col-md-9 gap-3 py-3">
            <Col xs={12} sm={12} lg={5} className="">
              <Form.Control className="me-auto" 
                            type="text" 
                            placeholder="Search Recipes"
                            
                            
                            value={searchValue()[0]}
                            onChange={searchValue()[1]} 
                             
                />
            </Col>  
            <Col xs={12} sm={12} lg={6} className="">
              <Stack direction="horizontal" gap={2}>
                <Button variant="secondary"                    
                        type="button"
                        
                        onClick={this.retrieveRecipes}
                          >Search</Button>
                <div className="vr"/>
                <Form.Select  value="selectedSearchOption"
                              // onChange={e => setSelectedSearchOption(e.target.value) } 
                              >
                  <option value="title">Search by Title</option>
                  <option value="cookingTime">Search by Cooking Time</option>
                  <option value="ingredient">Search by Ingredient</option>
                </Form.Select>
              </Stack>
            </Col>
          </Row>  

        </Stack>     

       



      </Container>

      <Container>
      <div className="list row">
        <div className="col-md-8">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title"
              value={searchTitle}
              onChange={this.onChangeSearchTitle}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={this.retrieveRecipes}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h4>Recipe List</h4>

          <div className="mt-3">
            {"Items per Page: "}
            <select onChange={this.handlePageSizeChange} value={pageSize}>
              {this.pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <Pagination
              className="my-3"
              count={count}
              page={page}
              siblingCount={1}
              boundaryCount={1}
              variant="outlined"
              shape="rounded"
              onChange={this.handlePageChange}
            />
          </div>

          <ul className="list-group">
            {recipes &&
              recipes.map((recipe, index) => (
                <li
                  className={
                    "list-group-item " +
                    (index === currentIndex ? "active" : "")
                  }
                  onClick={() => this.setActiveRecipe(recipe, index)}
                  key={index}
                >
                  {recipe.title}
                </li>
              ))}
          </ul>

          <button
            className="m-3 btn btn-sm btn-danger"
            onClick={this.removeAllRecipes}
          >
            Remove All
          </button>
        </div>
        
        <div className="col-md-6">
          {currentRecipe ? (
            <div>
              <h4>Recipe</h4>
              <div>
                <label>
                  <strong>Title:</strong>
                </label>{" "}
                {currentRecipe.title}
              </div>
              <div>
                <label>
                  <strong>Description:</strong>
                </label>{" "}
                {currentRecipe.description}
              </div>
              <div>
                <label>
                  <strong>Status:</strong>
                </label>{" "}
                {currentRecipe.published ? "Published" : "Pending"}
              </div>

              <Badge>
              <Link
                to={"/recipes/" + currentRecipe.id}
                className="badge badge-warning"
              >
                Edit
              </Link>
              </Badge>
            </div>
          ) : (
            <div>
              <br />
              <p>Please click on a Recipe...</p>
            </div>
          )}
        </div>
      </div>
      </Container>
      </Container>
      </Container>
    );
  }
  
}

