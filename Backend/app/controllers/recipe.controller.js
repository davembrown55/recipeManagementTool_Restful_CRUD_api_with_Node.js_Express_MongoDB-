const db = require("../models");
const Recipe = db.recipes;
const ObjectId = require('mongoose').Types.ObjectId;
// const Recipe = require('../models/recipe.model');
// const session = require("express-session"); 
// const sanitizeHtml = require('sanitize-html');

const getPagination = (page, size) =>{
    const limit = size ? +size : 5;
    const offset = page? page * limit : 0;
  
    return {limit, offset};
};  

// verify with session
const verifySession = (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  };



// Create and save a new recipe
exports.create = async (req, res) => {

    // const sanitizedRecipe = sanitizeRecipe(req);
    // if (sanitizedRecipe === null) {
    //     return res.status(400).send({
    //         message: "Recipe data empty after processing"
    //     });
    // }
    
    const { title, description, ingredients, instructions, cookingTimeMinutes, diets, mealTypes, published } = req.body;


    // Create a Recipe
    // const recipe = new Recipe({sanitizedRecipe});

    const recipe = new Recipe({
        title,
        description,
        ingredients,
        instructions,
        cookingTimeMinutes,
        diets,
        mealTypes,
        published,
        userId: req.session.userId // Assuming you assign the logged-in user ID to the recipe
    });
   

    // Save Recipe in the database
    try {
       const response = await recipe.save();
       return res.json({ message: 'Recipe added to database', recipe: response});
    } catch (e) {
        res.status(500).json({ msg: 'Server Error, an error occured while creating recipe.', Error: e, });
    }

};

const buildQueryCondition = (query) => {
    let condition = {};

    const { title, ingredients, maxCookingTime, diets, mealTypes } = query; 

    if (title) {
      condition.title = { $regex: new RegExp(title), $options: "i" };
    }

    if (ingredients) {      
      if (Array.isArray(ingredients) && ingredients.length > 0) {
          // Build an array of RegExp objects to pass to $all
          const regexes = ingredients.map(ing => new RegExp(`^${ing}`, 'i'));
          condition.ingredients = { $all: regexes };
        } else {
          // Single ingredient (Quick search uses String not array)
          const single = new RegExp(`^${ingredients}`, 'i');
          condition.ingredients = { $elemMatch: { $regex: single } };
        }  
       
      }  
      if (maxCookingTime) {
        condition.cookingTimeMinutes = { $lte: Number(maxCookingTime) };
      }
      if (diets) {
        if (Array.isArray(diets) && diets.length > 0) {
          // Build an array of RegExp objects to pass to $all
          const regexes = diets.map(diet => new RegExp(`^${diet}`, 'i'));
          condition.diets = { $all: regexes };
        } else {
          // Single diet (Quick search uses String not array)
          const single = new RegExp(`^${diets}`, 'i');
          condition.diets = { $elemMatch: { $regex: single } };
        }          
      }
      if (mealTypes) {
        if (Array.isArray(mealTypes) && mealTypes.length > 0) {
          // Build an array of RegExp objects to pass to $all
          const regexes = mealTypes.map(mealType => new RegExp(`^${mealType}`, 'i'));
          condition.mealTypes = { $all: regexes };
        } else {
          // Single mealType (Quick search uses String not array)
          const single = new RegExp(`^${mealTypes}`, 'i');
          condition.mealTypes = { $elemMatch: { $regex: single } };
        } 
      }
      return condition;
    
}

// Retrieve all recipes from the database. Handle requests re: title, ingredients and maxCookingTime
// Now incorporated into findAll
// exports.oldFindAll = async (req, res) => {
//     // const { page, size } = req.query;
//     const { page, size } =  req.searchType === 'advanced' ? req.body : req.query ;   

//     let condition = {};
//     req.searchType === 'advanced' ? condition = buildQueryCondition(req.body) : condition = buildQueryCondition(req.query);

//     const { limit, offset } = getPagination(page, size);
  
//     const options = {
//       offset,
//       limit,  
//       populate:  {path: 'userId',  select: 'username'}, // Adding populate to options
//     };

//     try {
//       const foundRecipes = await Recipe.paginate(condition, options);
//       res.send({
//         totalItems: foundRecipes.totalDocs,
//         recipes: foundRecipes.docs,
//         totalPages: foundRecipes.totalPages,
//         currentPage: foundRecipes.page - 1,
//         role: req.authdRole
//       });
//     } catch (e) {
//       res.status(500).send({
//         message:
//           e.message || "An error occurred while retrieving recipes."
//       });
//     }  
   
//   };
  
  // Find a single recipe with an id
  // exports.findOne = (req, res) => {
  //   const id = req.params.id;  
  //   Recipe.findById(id).populate('userId', 'username')
      
  //     .then(data => {
  //       if (!data)
  //         res.status(404).send({ message: "There is no recipe with the following ID: " + id });
  //       else {
  //         // const { userId, ...rest } = data.toObject(); // remove userID from reponse
  //         // if (userId && userId.username) {
  //         //   // rest.username = userId.username;  
  //         //   const {username} = userId;
  //         //   rest.username = username;
  //         //   res.send(rest);
  //         // } else { 
  //           res.send(data);
  //         // }
  
  //       } 
  //     })
  //     .catch(err => {
  //       res
  //         .status(500)
  //         .send({ message: "Error retrieving recipe with id=" + id });
  //     });
  // };

  exports.findOne = async (req, res) => {
    const  id  = req.params.id;
    const role = req.authdRole;
    let userId = req.session ? req.session.userId : false;

    
    try {
      const recipe = await Recipe.findById(id).populate('userId', 'username');
      // console.log(`userId: ${userId},  recipe.userId._id: ${recipe.userId._id.toString()}, === : ${userId === recipe.userId._id.toString()}`);

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }  

      if (role === 'admin' || 
            (role === 'user' && userId === recipe.userId._id.toString())) {

              const response = {
                access: 'all',
                recipe: recipe
              }            
              return res.json(response);

      } else {
        // not admin or user linked to recipe
        if(recipe.published) {
          const response = {
            access: 'read',
            recipe: recipe
          }            
          return res.json(response);
        } else {
          return res.status(401).send(`Unauthorised user credentials!`);
        } 
      }     

    } catch (e) {
      return res.status(500).json({ msg: 'Server error', error: e.message });
    }
    
  };

  const processRecipeUpdate = async (req, res, updateBody, recipeId, role) => {   
    try {

      const existingRecipe = await Recipe.findById(recipeId).populate('userId', 'username');
      if (!existingRecipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }     

      // user can only update their own recipe
      if (role === 'user') {
        const username = req.session.username;
        if (username !== existingRecipe.userId.username) {
          return res.status(401).send(`Unauthorized user credentials!`);
        } 
      }    
      
      const duplicates = {};      
      const updateBodyInitialLength = Object.keys(updateBody).length;
      const fieldsToDelete = [];

      // Check for duplicates and mark fields for deletion
      Object.keys(updateBody).forEach((key) => {
        const updateValue = updateBody[key];
        const existingValue = existingRecipe[key];

        if (Array.isArray(updateValue) && Array.isArray(existingValue)) {
          // Compare arrays
          if (
            updateValue.length === existingValue.length &&
            updateValue.every((element, index) => element === existingValue[index])
          ) {
            fieldsToDelete.push(key);
            duplicates[key] = `No changes to ${key} fields`;
          }
        } else if (updateValue === existingValue) {
          // Compare primitive values
          fieldsToDelete.push(key);
          duplicates[key] = `No changes to ${key} field`;
        }
      });      
 
      // delete duplicate fields from updateBody
      fieldsToDelete.forEach((key) => {
        delete updateBody[key];
      });

      // If all requested update fields are duplicates.
      if (Object.keys(updateBody).length === 0 && Object.keys(duplicates).length === updateBodyInitialLength) {
        return res.status(400).send({ msg: "No valid fields provided for update."});
      }

      const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: updateBody }, { new: true, useFindAndModify: false });

      if(!updatedRecipe) {
        return  res.status(404).send({msg: `Cannot update user with id=${recipeId}.`});
      } else if (Object.keys(updateBody).length > 0 && Object.keys(updateBody).length !== updateBodyInitialLength) {
          // Partial update
          return res.json({ msg: 
            `Recipe: ${updatedRecipe.title} was updated. Updates made to ${Object.keys(updateBody).join(", ")} \
            ${(Object.keys(updateBody).length > 1) ? ' fields.' : ' field.'}`, updatedRecipeData: updatedRecipe} );    

          // return res.json({ msg: 
          //     `Recipe was updated. No changes found in ${Object.keys(duplicates).join(", ")} \
          //     ${(Object.keys(duplicates).length > 1) ? ' fields' : ' field.'}.`, updatedRecipeData: updatedRecipe} );
      } else {
        return res.json({msg: 'Recipe updated Successfully', updatedRecipeData: updatedRecipe})
      }

    } catch (e) {
      return res.status(500).json({ msg: 'Server error', error: e.message });
    }
  }

  const buildUpdateBody = (reqBody, fields) => {
    let updateBody = {};
    fields.forEach(field => {
      if (reqBody.hasOwnProperty(field)) {
        updateBody[field] = reqBody[field];
      }
    });
    return updateBody;
  };

  exports.updateRecipe = async (req, res) => {      
    const role = req.authdRole;
    const recipeId = req.params.id;      

    const updateBody = buildUpdateBody(req.body, ['title', 'description', 'ingredients', 'instructions',
       'cookingTimeMinutes', 'diets', 'mealTypes', 'published']);

    if (Object.keys(updateBody).length > 0) {
      try {
        await processRecipeUpdate(req, res, updateBody, recipeId, role );
      } catch (e) {
        return res.status(500).json({ msg: 'Server error', error: e.message });
      }  
    } else {
      return res.status(400).send({ msg: "No valid fields provided for update."});
    }  
  };

  exports.delete = async (req, res) => {
    const recipeId = req.params.id;
    const role = req.authdRole;

    try {
      const existingRecipe = await Recipe.findById(recipeId).populate('userId', 'username');
      if (!existingRecipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }     

      // user can only delete their own recipe
      if (role === 'user') {
        const username = req.session.username;
        if (username !== existingRecipe.userId.username) {
          return res.status(401).send(`Unauthorized user credentials!`);
        } 
      }  
      const title = existingRecipe.title;       

      const deletedRecipe = await Recipe.findByIdAndDelete(recipeId)
      if (!deletedRecipe) {
        return res.status(404).send({
          message: `unable to delete recipe with id: ${id}.`
        });
      } else {
        return res.send({
          message: `Recipe: ${title} was deleted successfully!`
        });
      }
    } catch (e) {
      return res.status(500).json({ msg: 'Server error', error: e.message });
    }

  }
  
  // Find all published recipes. Now incorporated into findAll
  exports.findAllPublished = async (req, res) => {
    const { page, size } =  req.searchType === 'advanced' ? req.body : req.query ;

    let condition = {};
    req.searchType === 'advanced' ? condition = buildQueryCondition(req.body) : condition = buildQueryCondition(req.query);

    const { limit, offset } = getPagination(page, size);

    const options = {
      offset,
      limit,
      populate: {path: 'userId', select: 'username' },
    }
    condition.published = true;

    try {
      const foundRecipes = await Recipe.paginate(condition, options);
      res.send({
        totalItems: foundRecipes.totalDocs,
        recipes: foundRecipes.docs,
        totalPages: foundRecipes.totalPages,
        currentPage: foundRecipes.page - 1,
        role: req.authdRole
      });

    } catch (e) {
      res.status(500).send({
        message:
          e.message || "An error occurred while retrieving recipes."
      });
    }        
};

// get user recipes. Now incorporated into findAll
exports.findAllUserRecipes = async (req, res) => {
  const { page, size } =  req.searchType === 'advanced' ? req.body : req.query;
  let condition = {};
  req.searchType === 'advanced' ? condition = buildQueryCondition(req.body) : condition = buildQueryCondition(req.query);

  const { limit, offset } = getPagination(page, size);

  const options = {
    offset,
    limit,
    populate: {path: 'userId', select: 'username' },
  }
  condition.userId = req.session.userId;

  try {
    const foundRecipes = await Recipe.paginate(condition, options);
    res.send({
      totalItems: foundRecipes.totalDocs,
      recipes: foundRecipes.docs,
      totalPages: foundRecipes.totalPages,
      currentPage: foundRecipes.page - 1,
      role: req.authdRole
    });

  } catch (e) {
    res.status(500).send({
      message:
        e.message || "An error occurred while retrieving recipes."
    });
  }       
};
// get recipes / user / admin & non-user
exports.findAll = async (req, res) => {

  const { page, size } =  req.searchType === 'advanced' ? req.body : req.query;
  let condition = {};
  req.searchType === 'advanced' ? condition = buildQueryCondition(req.body) : condition = buildQueryCondition(req.query);
  let listType = req.searchType === 'advanced' ?  req.body.listType : req.query.listType;

  const { limit, offset } = getPagination(page, size);

  const options = {
    offset,
    limit,
    populate: {path: 'userId', select: 'username' },
  }
  
  let resultsType = '';
  if(listType === 'all') {
    if (req.authdRole !== 'admin') { 
      // get published recipes only
      condition.published = true;
      resultsType = 'published recipes';
    } // else get all recipes (user is admin). No additional condition added to params
      else {resultsType = 'all recipes';}
  } else if (listType === 'mine') {
    // User recipes only
    condition.userId = req.session.userId;
    resultsType = 'users recipes';
  } else {    
    return res.status(404).json({message: 'List type Error', role: null});
  }

  try {
    const foundRecipes = await Recipe.paginate(condition, options);
    res.send({
      totalItems: foundRecipes.totalDocs,
      recipes: foundRecipes.docs,
      totalPages: foundRecipes.totalPages,
      currentPage: foundRecipes.page - 1,
      role: req.authdRole,
      results: resultsType
    });

  } catch (e) {
    res.status(500).send({
      message:
        e.message || "An error occurred while retrieving recipes."
    });
  }       
};