const express = require('express');
const db = require("../models");
const Recipe = db.recipes;
const User = require('../models/user.model');
const router = express.Router();
const recipeValidationChain = require('../models/recipeValidationChain');
const sanitizeHtml = require('sanitize-html');

const recipes = require("../controllers/recipe.controller");
const { check, validationResult } = require('express-validator');

const verifySession = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).send('Unauthorized!');
  }
};

const verifyAdminWithSession = async (req, res, next) => {
  if ( req.session && req.session.userId && 
      req.session.userRole === 'admin') {
      try {
          const id = req.session.userId;
          const findAdmin = await User.findById(id, 'isAdmin');            
          if (findAdmin.isAdmin) {
              next();
          } else {
              throw new Error('Unauthorized');
          }            
      } catch (e) {
          res.status(401).send('Unauthorized');
      } 
  } else {
      res.status(401).send('Unauthorized');
  }
};

const verifyUserAdminOrNot = async (req, res, next) => {
  let listType = '';
  if (req.body.listType === 'all' || req.query.listType === 'all') {
    listType = 'all';
  } else if (req.body.listType === 'mine' || req.query.listType === 'mine') {
    listType = 'mine';
  } else {
    return res.status(404).json({message: 'List type Error', role: null});
  }

  if (listType === 'all') {
    if ( req.session && req.session.userId && 
      req.session.userRole === 'admin') {
      try {
          const id = req.session.userId;
          const findAdmin = await User.findById(id, 'isAdmin');            
          if (findAdmin.isAdmin) {
              req.authdRole = req.session.userRole;
              next();
          } else {
              req.authdRole = 'user';
          }            
      } catch (e) {
          req.authdRole = 'user';
          next();
      } 
    } else if (req.session && req.session.userId && 
      req.session.userRole === 'user') {
        req.authdRole = 'user';
        next();
    } else {
        req.authdRole = null;
        next();
    }
  } else if (listType === 'mine') {
    if (req.session && req.session.userId) {
      req.authdRole = req.session.userRole;
      next();
    } else {
      return res.status(401).json({message: 'Unauthorized!', role: null});
    }    
  }
};

const verifyAdminOrUserWithSesssion  = async (req, res, next) => { 
  if ( req.session && req.session.userId && 
    req.session.userRole === 'admin') {
    try {
        const id = req.session.userId;
        const findAdmin = await User.findById(id, 'isAdmin');            
        if (findAdmin.isAdmin) {
            // Attach the user role to the request object
            req.authdRole = req.session.userRole;
            next();
        } else {
            throw new Error('Unauthorized');
        }            
    } catch (e) {        
        res.status(401).send('Unauthorized');
    } 
  } else if (req.session && req.session.userId) {
      req.authdRole = req.session.userRole;
      next();
  } else {
      res.status(401).send('Unauthorized.');
  } 
}

const verifyCorrectUser = async (req, res, next) => {
  const recipeId = req.params.id;
  const username = req.session.username;

  try {
    const existingRecipe = await Recipe.findById(recipeId).populate('userId', 'username');
      if (!existingRecipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      // check session username matches recipe username
      if (username !== existingRecipe.userId.username) {
        return res.status(401).send(`Unauthorized user credentials!`);
      }      
      next();
  } catch (e) {
    return res.status(500).send({ message: `Error finding recipe: ${e.message}` });
  }

}


// Create a new Recipe
router.post("/", verifySession, recipeValidationChain(false), 
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())  {
    return res.status(400).json({ errors: errors.array()});
  }  
  await recipes.create(req, res); 
});

// Retrieve all published recipes if listType 'all'. 
//  Verified admin will get all recipes. 
//  Any other user will get published Recipes only.
// Retrieve all users recipes if listType 'mine'. 
router.get("/", 
  verifyUserAdminOrNot,
  [
    check('title')
      .trim()
      .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters') 
      .customSanitizer((title) => sanitizeHtml(title, {      
        allowedTags: [], // No HTML tags allowed in title
        allowedAttributes: {} // No attributes allowed
      }))
      .optional(),
    check('ingredients')
      .isLength({ max: 100 }).withMessage('Ingredient must not exceed 100 characters') 
      .customSanitizer((ingredient) => sanitizeHtml(ingredient, {      
        allowedTags: [], // No HTML tags allowed in title
        allowedAttributes: {} // No attributes allowed
      }))
      .optional(),
    check('maxCoookingTime')
      .isInt({ min: 0 }).withMessage('Cooking time must be a positive integer')
      .optional(),
    check('page')
      .isInt({ min: 0 }).withMessage('Page must be a number'),   
    check('size')
      .isInt({ min: 0 }).withMessage('Page must be a number'),
    check('listType')
      .trim()
      .isLength({ max: 5 }).withMessage('ListType must not exceed 5 characters') 
      .customSanitizer((listType) => sanitizeHtml(listType, {      
        allowedTags: [], // No HTML tags allowed in title
        allowedAttributes: {} // No attributes allowed
      }))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())  {
      return res.status(400).json({ errors: errors.array()});
    }  
    req.searchType = 'standard';   

    await recipes.findAll(req, res);

    // if (req.query.listType === 'all') {
    //   if (req.authdRole === 'admin') {      
    //     await recipes.findAll(req, res);
    //   } else {
    //     await recipes.findAllPublished(req, res);
    //   }
    // } else if (req.query.listType === 'mine') {
    //   await recipes.findAllUserRecipes(req, res);
    // } else {
    //   return res.status(404).json({message: 'List type Error', role: null});
    // }
}); 

router.post("/advancedSearch", 
  verifyUserAdminOrNot,
  [
    check('title')
      .trim()
      .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters') 
      .customSanitizer((title) => sanitizeHtml(title, {      
        allowedTags: [], // No HTML tags allowed in title
        allowedAttributes: {} // No attributes allowed
      }))
      .optional(),
    check('ingredients')
      .isArray().withMessage('Ingredients must be an array')   
      .customSanitizer((ingredients) => ingredients.filter((ingredient) => ingredient.trim().length > 0))   
      .isArray({ min: 1 }).withMessage('Ingredients array was empty')
      .customSanitizer((ingredients) => ingredients.map(i => sanitizeHtml(i, {      
        allowedTags: [], 
        allowedAttributes: {} 
      })))
      .custom((ingredients) => ingredients.every(i => typeof i === 'string'))
      .withMessage('Each ingredient must be a string')
      .custom((ingredients) => ingredients.every(i => i.trim().length < 100))
      .withMessage('Ingredients must not exceed 100 characters')        
      .optional(),
    check('maxCoookingTime')
      .isInt({ min: 0 }).withMessage('Cooking time must be a positive integer')
      .optional(),
    check('diets')        
        .isArray().withMessage('Diets must be an array')
        .customSanitizer((diets) => diets.filter((diet) => diet.trim().length > 0))
        .isArray({ min: 1 }).withMessage('Diets array was empty')
        .customSanitizer((diets) => diets.map(diet => sanitizeHtml(diet, {      
          allowedTags: [], 
          allowedAttributes: {} 
        })))
        .custom((diets) => diets.every(diet => typeof diet === 'string'))
        .withMessage('Each diet type must be a string')
        .optional(),
    check('page')
      .isInt({ min: 0 }).withMessage('Page must be a number'),   
    check('size')
      .isInt({ min: 0 }).withMessage('Page must be a number'),
    check('listType')
      .trim()
      .isLength({ max: 5 }).withMessage('ListType must not exceed 5 characters') 
      .customSanitizer((listType) => sanitizeHtml(listType, {      
        allowedTags: [], // No HTML tags allowed in title
        allowedAttributes: {} // No attributes allowed
      }))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())  {
      return res.status(400).json({ errors: errors.array()});
    }  
    req.searchType = 'advanced';

    await recipes.findAll(req, res);

    // if (req.body.listType === 'all') {
    //   if (req.authdRole === 'admin') {      
    //     await recipes.findAll(req, res);
    //   } else {
    //     await recipes.findAllPublished(req, res);
    //   }
    // } else if (req.body.listType === 'mine') {
    //   await recipes.findAllUserRecipes(req, res);
    // } else {
    //   return res.status(404).json({message: 'List type Error', role: null});
    // }
        
}); 
  



// Retrieve a single Recipe with id
router.get("/:id", recipes.findOne);

// Update a Recipe with id.
router.patch("/:id", 
  verifyAdminOrUserWithSesssion, 
  [
    check('id').trim().notEmpty().isMongoId().withMessage('Invalid recipe ID format'),
    ...recipeValidationChain(true), 
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())  {
      return res.status(400).json({ errors: errors.array()});
    }  
    await recipes.updateRecipe(req, res);
});

// Delete a Recipe with id
router.delete("/:id", 
  verifyAdminOrUserWithSesssion, 
  [
    check('id').trim().notEmpty().isMongoId().withMessage('Invalid recipe ID format'),    
  ],
  async (req, res)  => {
    const errors = validationResult(req);
    if (!errors.isEmpty())  {
      return res.status(400).json({ errors: errors.array()});
    } 
    await recipes.delete(req, res);
  });

// Delete all Recipes
// router.delete("/", recipes.deleteAll);
// Maybe replace this with a route for admin to delete many with ids.
// Or, if a user deleted their profile all associated recipes can be deleted




// app.use('/api/recipes', router);


module.exports = router;