import React, { Component } from "react";
import RecipeDataService from "../services/recipe.service";

export default class AddRecipe extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeIngredients = this.onChangeIngredients.bind(this);
    this.onChangeInstructions = this.onChangeInstructions.bind(this);
    this.onChangeCookingTimeMinutes = this.onChangeCookingTimeMinutes.bind(this);    
    this.saveRecipe = this.saveRecipe.bind(this);
    this.newRecipe = this.newRecipe.bind(this);

    this.addIngredient = this.addIngredient.bind(this);
    this.addInstruction = this.addInstruction.bind(this);


    this.state = {
      id: null,
      title: "",
      description: "", 
      ingredients: [""],
      instructions: [""],
      cookingTimeMinutes: 0,
      published: false,

      submitted: false
    };
  }

  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangeIngredients(index, value) {
    const newIngredients = this.state.ingredients.map((ingredient, i) => {
      if (i === index) {
        return value;
      }
      return ingredient;
    });
    this.setState({ ingredients: newIngredients });
  }

//   addIngredient() {
//     this.setState(prevState => ({
//       ingredients: [...prevState.ingredients, '']
//     }));
//   }

  addIngredient() {
    if (this.state.ingredients[this.state.ingredients.length - 1].trim() !== "") {
      this.setState(prevState => ({
        ingredients: [...prevState.ingredients, '']
      }));
    } else {
      alert("Please fill in the last ingredient before adding a new one.");
    }
  }
  
//   removeIngredient(index) {
//     this.setState(prevState => ({
//       ingredients: prevState.ingredients.filter((_, i) => i !== index)
//     }));
//   }

  removeIngredient(index) {
    if (this.state.ingredients.length > 1) {
      if (window.confirm("Are you sure you want to remove this ingredient?")) {
        this.setState(prevState => ({
          ingredients: prevState.ingredients.filter((_, i) => i !== index)
        }));
      }
    }
  }

  onChangeInstructions(index, value) {
    const newInstructions = this.state.instructions.map((instruction, i) => {
      if (i === index) {
        return value;
      }
      return instruction;
    });
    this.setState({ instructions: newInstructions });
  }

//   addInstruction() {
//     this.setState(prevState => ({
//       instructions: [...prevState.instructions, '']
//     }));
//   }

  addInstruction() {
    if (this.state.instructions[this.state.instructions.length - 1].trim() !== "") {
      this.setState(prevState => ({
        instructions: [...prevState.instructions, '']
      }));
    } else {
      alert("Please fill in the last instruction before adding a new one.");
    }
  }
  
//   removeInstruction(index) {
//     this.setState(prevState => ({
//       instructions: prevState.instructions.filter((_, i) => i !== index)
//     }));
//   }

  removeInstruction(index) {
    if (this.state.instructions.length > 1) {
      if (window.confirm("Are you sure you want to remove this instruction?")) {
        this.setState(prevState => ({
          instructions: prevState.instructions.filter((_, i) => i !== index)
        }));
      }
    }
  }

  onChangeCookingTimeMinutes(e) {
    this.setState({
      cookingTimeMinutes: Number(e.target.value)
    });
  }

  saveRecipe() {
    var data = {
        title: this.state.title,
        description: this.state.description,
        ingredients: this.state.ingredients,
        instructions: this.state.instructions,
        cookingTimeMinutes: this.state.cookingTimeMinutes,
    };

    RecipeDataService.create(data)
      .then(response => {
        this.setState({
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          ingredients: response.data.ingredients,
          instructions: response.data.instructions,
          cookingTimeMinutes: response.data.cookingTimeMinutes,
          published: response.data.published,
          submitted: true
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newRecipe() {
    this.setState({
      id: null,
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      cookingTimeMinutes: 0,
      published: false,

      submitted: false
    });
  }

  render() {
    return (
        <div className="submit-form">
          {this.state.submitted ? (
            <div>
              <h4>You submitted successfully!</h4>
              <button className="btn btn-success" onClick={this.newRecipe}>
                Add
              </button>
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  required
                  value={this.state.title}
                  onChange={this.onChangeTitle}
                  name="title"
                />
              </div>
  
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  required
                  value={this.state.description}
                  onChange={this.onChangeDescription}
                  name="description"
                />
              </div>

              <div className="form-group">
                    <label>Ingredients</label>
                    {this.state.ingredients.map((ingredient, index) => (
                        <div key={index}>
                        <input
                            type="text"
                            className="form-control"
                            value={ingredient}
                            onChange={(e) => this.onChangeIngredients(index, e.target.value)}
                        />
                        <button onClick={() => this.removeIngredient(index)} disabled={this.state.ingredients.length === 1}>
                            Remove</button>
                        </div>
                    ))}
                    <button onClick={this.addIngredient}>Add New Ingredient</button>
                </div>


              <div className="form-group">
                <label>Instructions</label>
                {this.state.instructions.map((instruction, index) => (
                    <div key={index}>
                    <input
                        type="text"
                        className="form-control"
                        value={instruction}
                        onChange={(e) => this.onChangeInstructions(index, e.target.value)}
                    />
                    <button onClick={() => this.removeInstruction(index)} disabled={this.state.instructions.length === 1}>
                        Remove</button>
                    </div>
                ))}
                <button onClick={this.addInstruction}>Add New Instruction</button>
              </div>

              <div className="form-group">
                <label htmlFor="cookingTimeMinutes">Cooking Time in Minutes</label>
                <input
                  type="number"
                  className="form-control"
                  id="cookingTimeMinutes"
                  required
                  value={this.state.cookingTimeMinutes}
                  onChange={this.onChangeCookingTimeMinutes}
                  name="cookingTimeMinutes"
                />
              </div>
  
              <button onClick={this.saveRecipe} className="btn btn-success">
                Submit
              </button>
            </div>
          )}
        </div>
      );    

  }
}
