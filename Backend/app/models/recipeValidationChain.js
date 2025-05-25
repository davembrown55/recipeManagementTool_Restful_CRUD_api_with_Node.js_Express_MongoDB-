const { body } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const leoProfanity = require('leo-profanity');

// Helper to sanitize + profanity-check a single string
// function cleanAndFilter(str, htmlOptions) {
//   const clean = sanitizeHtml(str, htmlOptions);
//   if (leoProfanity.check(clean)) {
//     throw new Error('No salty language allowed');
//   }
//   return clean;
// }
// function listBadWords() {
//     console.log(JSON.stringify(leoProfanity.list(), 2, 2));
// }
// function addBadWords() {
//     leoProfanity.add(['cunts']);
//     console.log(JSON.stringify(leoProfanity.list(), 2, 2));
// }

const recipeValidationChain = (isUpdate = false) => [
  body('title') 
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
      .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters')    
    .custom((title) => !leoProfanity.check(title)).withMessage('No salty language allowed')
    .customSanitizer((title) => sanitizeHtml(title, {      
      allowedTags: [], // No HTML tags allowed in title
      allowedAttributes: {} // No attributes allowed
    }))
    .optional(isUpdate),
  body('description')
    .trim()
    .notEmpty().withMessage('Description cannot be empty')
    .customSanitizer((description) => sanitizeHtml(description,  {
      allowedTags: ['b', 'i', 'em', 'strong', 'u'], // Allow only a few safe HTML tags
      allowedAttributes: {} // No attributes allowed
    }))
    .custom((description) => !leoProfanity.check(description)).withMessage('No salty language allowed')
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters')
    .optional(isUpdate),        
  body('ingredients')
    .isArray({ min: 1 }).withMessage('Ingredients must be a non-empty array')    
    .customSanitizer((ingredients) => ingredients.map(i => sanitizeHtml(i, {      
      allowedTags: [], 
      allowedAttributes: {} 
    })))
    .custom((ingredients) => ingredients.every(i => typeof i === 'string' && i.trim().length > 0 ))
    .withMessage('Each ingredient must be a non empty string')
    .custom((ingredients) => ingredients.every( i => !leoProfanity.check(i))).withMessage('No salty language allowed')
    .optional(isUpdate),
  body('instructions')
    .isArray({ min: 1 }).withMessage('Instructions must be a non-empty array')
    .customSanitizer((instructions) => instructions.map(step => sanitizeHtml(step, {
      allowedTags: ['b', 'i', 'em', 'strong', 'u'], 
      allowedAttributes: {} 
    })))
    .custom((instructions) => instructions.every(step => typeof step === 'string' && step.trim().length > 0)).withMessage('Each instruction must be a non empty string')
    .custom((instructions) => instructions.every( i => !leoProfanity.check(i))).withMessage('No salty language allowed')    
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
    .custom((diets) => diets.every(diet => typeof diet === 'string' && diet.trim().length > 0 ))
    .withMessage('Each diet must be a non empty string'),
  body('mealTypes')
    .optional(true)
    .isArray().withMessage('MealTypes must be an array')
    .customSanitizer((mealTypes) => mealTypes.map(mealType => sanitizeHtml(mealType, {      
      allowedTags: [], 
      allowedAttributes: {} 
    })))
    .custom((mealTypes) => mealTypes.every(mealType => typeof mealType === 'string' && mealType.trim().length > 0))
    .withMessage('Each mealType must be a non empty string'),
  body('published')
    .isBoolean().withMessage('Published must be true or false')
    .optional(isUpdate),
];

module.exports = recipeValidationChain;
