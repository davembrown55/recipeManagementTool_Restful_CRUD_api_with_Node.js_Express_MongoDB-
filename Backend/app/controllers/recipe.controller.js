const db = require("../models");
const Recipe = db.recipes;


const getPagination = (page, size) =>{
  const limit = size ? +size : 5;
  const offset = page? page * limit : 0;

  return {limit, offset};
};

// Create and save a new recipe
exports.create = (req, res) => {
    //Validate request
    if(!req.body.title) {
        res.status(400).send({ message: "Content can not be empty!"});
        return;
    }

    // Create a Recipe
    const recipe = new Recipe({
        title: req.body.title,
        description: req.body.description,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        cookingTimeMinutes: req.body.cookingTimeMinutes,
        diets: req.body.diets,
        published: req.body.published ? req.body.published : false
    });

    // Save Recipe in the database
    recipe.save(recipe)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
        message:
            err.message || "An error occurred while creating the Recipe."
        });
    });

};

const buildCondition = (req) => {
  let condition = {};
  const { title, ingredients, maxCookingTime } = req.query; 

  if (title) {
    condition.title = { $regex: new RegExp(title), $options: "i" };
  }
  if (ingredients) {
    let ingredientStartsWith = new RegExp( "^" + ingredients)
    condition.ingredients = { $elemMatch: { $regex: ingredientStartsWith, $options: "i"} };  
  }

  if (maxCookingTime) {
    condition.cookingTimeMinutes = { $lte: Number(maxCookingTime) };
  }
  return condition;
}

// Retrieve all recipes from the database. Handle requests re: title, ingredients and maxCookingTime
exports.findAll = (req, res) => {
  const { page, size } = req.query;
  const condition = buildCondition(req);
  const { limit, offset } = getPagination(page, size);

  Recipe.paginate(condition, { offset, limit })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        recipes: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "An error occurred while retrieving recipes."
      });
    });
};

// Find a single recipe with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Recipe.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "There is no recipe with the following ID: " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving recipe with id=" + id });
    });
};

// Update a recipe by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
        }

        const id = req.params.id;

        Recipe.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
            res.status(404).send({
                message: `Cannot update recipe with id=${id}. Maybe recipe was not found!`
            });
            } else res.send({ message: "Recipe was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
            message: "Error updating Recipe with id=" + id
            });
        });
};

// Delete a recipe with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Recipe.findByIdAndDelete(id)
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete recipe with id=${id}. Maybe recipe was not found!`
          });
        } else {
          res.send({
            message: "Recipe was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete recipe with id=" + id
        });
      });
};

// Delete all recipes from the database.
exports.deleteAll = (req, res) => {
    Recipe.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Recipes were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while removing all recipes."
      });
    });
};

// Find all published recipes
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Recipe.paginate({ published: true}, { offset, limit })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        recipes: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while retrieving recipes."
      });
    });
    
    // Recipe.find({ published: true })
    // .then(data => {
    //   res.send(data);
    // })

};
//pagination
