const { body } = require('express-validator');
const sanitizeHtml = require('sanitize-html');


const recipeValidationChain = (isUpdate = false) => [
  body('title') 
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters')    
    .customSanitizer((title) => sanitizeHtml(title, {      
      allowedTags: [], // No HTML tags allowed in title
      allowedAttributes: {} // No attributes allowed
    }))
    .optional(isUpdate),

  body('description')
    .trim()
    .customSanitizer((description) => sanitizeHtml(description,  {
      allowedTags: ['b', 'i', 'em', 'strong', 'u'], // Allow only a few safe HTML tags
      allowedAttributes: {} // No attributes allowed
    }))
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters')
    .optional(isUpdate),    
    
  body('ingredients')
    .isArray({ min: 1 }).withMessage('Ingredients must be a non-empty array')    
    .customSanitizer((ingredients) => ingredients.map(i => sanitizeHtml(i, {      
      allowedTags: [], 
      allowedAttributes: {} 
    })))
    .custom((ingredients) => ingredients.every(i => typeof i === 'string'))
    .withMessage('Each ingredient must be a string')
    .optional(isUpdate),

  body('instructions')
    .isArray({ min: 1 }).withMessage('Instructions must be a non-empty array')
    .customSanitizer((instructions) => instructions.map(step => sanitizeHtml(step, {
      allowedTags: ['b', 'i', 'em', 'strong', 'u'], 
      allowedAttributes: {} 
    })))
    .custom((instructions) => instructions.every(step => typeof step === 'string'))
    .withMessage('Each instruction must be a string')
    .optional(isUpdate),

  body('cookingTimeMinutes')
    .isInt({ min: 0 }).withMessage('Cooking time must be a positive integer')
    .optional(isUpdate),

  body('diets')
    .optional(true)
    .isArray().withMessage('Diets must be an array')
    .customSanitizer((diets) => diets.map(diet => sanitizeHtml(diet, {      
      allowedTags: [], 
      allowedAttributes: {} 
    })))
    .custom((diets) => diets.every(diet => typeof diet === 'string'))
    .withMessage('Each diet must be a string'),
  body('mealTypes')
    .optional(true)
    .isArray().withMessage('MealTypes must be an array')
    .customSanitizer((mealTypes) => mealTypes.map(mealType => sanitizeHtml(mealType, {      
      allowedTags: [], 
      allowedAttributes: {} 
    })))
    .custom((mealTypes) => mealTypes.every(mealType => typeof mealType === 'string'))
    .withMessage('Each mealType must be a string'),

  body('published')
    .isBoolean().withMessage('Published must be true or false')
    .optional(isUpdate),
];

module.exports = recipeValidationChain;
