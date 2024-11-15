const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, check, validationResult } = require('express-validator');
// const { unescape } = require('lodash');
const he = require('he');
const User = require('../models/user.model');

const router = express.Router();

// Register route
router.post('/register', [
    check('email').trim().notEmpty().normalizeEmail().isEmail().withMessage('Invalid email'),
    check('password').trim().notEmpty().isStrongPassword({minLength: 6, 
                                                          minUppercase: 1, 
                                                          minLowercase: 1, 
                                                          minSymbols: 1
                                                        }).withMessage('Invalid password'),
    check('username').trim().escape()
    // check('password').trim().notEmpty().isLength({ min: 6 })
    // Use on login route too: especially normalizeEmail

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });}

    const { username, email, password } = req.body;
    
    try {
        let user = await User.findOne({ $or: [{email: email}, {username: username}] });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email, password: hashedPassword, isAdmin: false });
        await user.save();
        res.send('User Registered');
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // res.json({ token });
        
    } catch (err) {        
        res.status(500).json({ Error: err, msg: 'Server Error' });
    }
});

// Login route
router.post('/login', [
    check('email').trim().escape().notEmpty().normalizeEmail().isEmail().withMessage('Invalid email'),
    check('password').trim().notEmpty().isStrongPassword({minLength: 6, 
                                                          minUppercase: 1, 
                                                          minLowercase: 1, 
                                                          minSymbols: 1
                                                        }).withMessage('Invalid password')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });}

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        
        const role = user.isAdmin ? 'admin' : 'user';

        req.session.userId = user._id;
        req.session.userRole = role;
        req.session.username = user.username;
        req.session.email = user.email;


        const data = {username: he.decode(req.session.username), role: req.session.userRole};
        res.json({ message: 'Login successful', user: data});

        // const token = jwt.sign({ id: user._id, userRole: role}, process.env.JWT_SECRET, { expiresIn: '1h' });

        // res.cookie('user', JSON.stringify(data), {
        //     httpOnly: true,
        //     secure: false, // Set to true if using HTTPS
        //     sameSite: 'Strict', // Prevent CSRF attacks
        // }).json({ message: 'Login successful' });

        // jwt token: authorise and send as cookie in response
            // const token = jwt.sign({ id: user._id, userRole: role}, process.env.JWT_SECRET, { expiresIn: '1h' });
             // res.json({ token });

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: true, // Set to true if using HTTPS
        //     sameSite: 'Strict', // Prevent CSRF attacks
        //   }).json({ message: 'Login successful' });

    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).send('Failed to logout');
            } else {
                res.clearCookie('connect.sid'); // Clear session cookie
                res.json({ message: 'Logged out successfully' });
            }
        });
    } else {
        res.status(400).send('No session found');
    }
});


//Check if email exists
router.post('/user/checkEmail', [
    check('email').trim().notEmpty().normalizeEmail().isEmail().withMessage('Invalid email')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });}

    const { email } = req.body;

    try {
        const findEmail = await User.findOne({ email });
        const emailAvailable = findEmail ? false : true;
        res.json({emailAvailable: emailAvailable });  
    } catch (e) {
        // console.error("Error occurred during email check:", e);
        // res.status(500).send('Server error');
        res.status(500).json({ msg: 'Server error', error: e.message });
    }

});
//Check if username exists
router.post('/user/checkUsername',  [    
    check('username').trim().escape()
],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });}

    const { username } = req.body;

    try {
        const findUsername = await User.findOne({ username });
        const userNameAvailable = findUsername ? false : true;
        res.json({userNameAvailable: userNameAvailable });  
    } catch (e) {
        // console.error("Error occurred during username check:", e);
        // res.status(500).send('Server error');
        res.status(500).json({ msg: 'Server error', error: e.message });
    }

});

// verify with session
const verifySession = (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  };
  
router.get('/secure-data', verifySession, (req, res) => {
    const user = { username: he.decode(req.session.username), 
                   role:  req.session.userRole
                 }

                 
    res.send({sessionVerified: user});
}); 


// verify jwt token and return id and user role
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) return res.status(403).send('Access denied.');
    
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified; // Attach the decoded user info to req.user
      next();
    } catch (err) {
      res.status(400).send('Invalid token.');
    }
  };
//

// const verifyUserWithSession = (req, res, next) => {
//     if (req.session && req.session.userId) {
//         next();
//     } else {
//         res.status(401).send('Unauthorized');
//     }
// };
  
router.get('/user-info', verifySession, (req, res) => {
const user = { username: he.decode(req.session.username), 
                role:  req.session.userRole, 
                email: req.session.email
  }
res.send({sessionVerified: user});
});

//For admin
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
 
router.get('/users',  verifyAdminWithSession, async (req, res) => {
    
    try {
        const allUsers = await User.find({}, {username:1, email:1, isAdmin:1 });

        const usersMapped = allUsers.map((x) => {  
            let role = x.isAdmin ? 'admin' : 'user';            
            let uName = he.decode(x.username)

            function deleteUnEditedFields(doc, ret, options) {
                delete ret.isAdmin;
                delete ret.username;
                return ret;
            }
            return { 
                ...x.toObject({transform: deleteUnEditedFields}),
                role: role,
                username: uName,
            }   
    });
        res.json(usersMapped);
    } catch (err) {
        res.status(500).send('Server error');
    }
});


router.post('/user/id', 
       verifyAdminWithSession, 
       body('id').trim().escape().notEmpty().isMongoId().withMessage('Invalid user ID format'),
       async (req, res) => {               
        const errors = validationResult(req);
        if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });}

        const { id } = req.body;

    try {
        const result = await User.findById(id);
        const {__v, password, username, isAdmin,  _id, ...rest} = result.toObject();
        rest.id = _id;
        rest.role = result.isAdmin ? 'admin': 'user' ;
        rest.username = he.decode(username);
        
        res.json(rest);

    } catch (e) {
        res.status(500).json({ msg: 'Server error', error: e.message });
    
    }

});

const updateUser = async (updateBody, id, role, res) => {

    const { username, email, password } = updateBody;

    if (updateBody.hasOwnProperty('password')) {
        delete updateBody[password];
    }

     // username and email are unique. Perform check to ensure they arnt in db already
     const existingUserNameOrPass = await User.findOne({
        $and: [
          { _id: { $ne: id } },
          { $or: [{ username }, { email }] }
        ]
    });
    if (existingUserNameOrPass) {
        if (existingUserNameOrPass.username === username) {
            return res.status(400).send({ msg: "Username already exists in database." });
        } else if (existingUserNameOrPass.email === email) {
            return res.status(400).send({ msg: "Email already exists in database." });
        } else if (existingUserNameOrPass.username === username && existingUserNameOrPass.email === email) {
            return res.status(400).send({ msg: "Username and email already exist in database." });
        }            
    }        

    try {
        if (Object.keys(updateBody).length === 0) { 
            return res.status(400).send({ msg: "No valid fields provided for update."})};

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const duplicates = {};
        // check for duplicate fields. No need to update these.
        Object.keys(updateBody).forEach((key) => {
            if (updateBody[key] === existingUser[key]) {
                duplicates[key] = `No changes to ${key} field`;
            }
        });

        // If all requested fields are duplicates.
        if (Object.keys(duplicates).length === Object.keys(updateBody).length) {
            return res.status(400).send({ msg: `No changes found in ${Object.keys(duplicates).join(", ")} fields.` });
        }
        // Remove duplicate fields from `updateBody` and check id empty again.
        Object.keys(duplicates).forEach((key) => {
            delete updateBody[key];
        });
        if (Object.keys(updateBody).length === 0) { 
            return res.status(400).send({ msg: `No changes to update.` });
        }

        if (password && role === 'user') {
            const isMatch = await bcrypt.compare(password, existingUser.password);
            if(!isMatch) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateBody.password = hashedPassword;
            } else {
                return res.status(400).send({ msg: `Password update failed.` });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateBody, { new: true, useFindAndModify: false });
        if (!updatedUser) {
            res.status(404).send({
                msg: `Cannot update user with id=${id}.`
            });
        } else if (Object.keys(duplicates).length > 0) {
            res.send({ msg: 
                `User was updated. No changes found in ${Object.keys(duplicates).join(", ")} \
                 ${(Object.keys(duplicates).length > 1) ? ' fields' : ' field.'}.` } );
        } else {
            res.send({ msg: "User was updated successfully." });
        }
    } catch (e) {
        res.status(500).json({ msg: 'Server error', error: e.message });
    }  
}

// Utility function to build updateBody
const buildUpdateBody = (reqBody, fields) => {
    let updateBody = {};
    fields.forEach(field => {
      if (reqBody.hasOwnProperty(field)) {
        updateBody[field] = reqBody[field];
      }
    });
    return updateBody;
  };

router.patch('/admin/user-update', 
    verifyAdminWithSession, 
    // admin can update user: username, email, role
    body('id').trim().escape().notEmpty().isMongoId().withMessage('Invalid user ID format'),
    body('username').optional().trim().notEmpty().escape().withMessage('Invalid username'),
    body('email').optional().trim().notEmpty().normalizeEmail().isEmail().withMessage('Invalid email'),
    body('isAdmin').optional().isBoolean().withMessage('Invalid role'),
    async (req, res) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });}
        
        const updateBody = buildUpdateBody(req.body, ['username', 'email', 'isAdmin']);
        // call update user function
        try {
            await updateUser(updateBody, req.body.id, 'admin', res);
          } catch (e) {
            res.status(500).json({ msg: 'Server error', error: e.message });
        }    
    }
);


router.patch('/profile-update', 
    verifySession,
    // user can update own: username, email, password     
    body('id').trim().escape().notEmpty().isMongoId().withMessage('Invalid user ID format'),
    body('username').optional().trim().notEmpty().escape().withMessage('Invalid username'),
    body('email').optional().trim().notEmpty().normalizeEmail().isEmail().withMessage('Invalid email'),
    body('password').optional().trim().notEmpty().isStrongPassword({minLength: 6, 
                                                          minUppercase: 1, 
                                                          minLowercase: 1, 
                                                          minSymbols: 1
                                                            }).withMessage('Invalid password'),
    async (req, res) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() });}      

        //User can only update their own details
        if(req.session.userId !== req.body.id) {
            return res.status(401).send('Unauthorized');
        }       
        const updateBody = buildUpdateBody(req.body, ['username', 'email', 'password']);

        // call update user function
        try {
            await updateUser(updateBody, req.body.id, 'user', res);
            } catch (e) {
            res.status(500).json({ msg: 'Server error', error: e.message });
        }           

    }


);

router.delete('/admin/delete-user', 
    verifyAdminWithSession, 
    body('id').trim().escape().notEmpty().isMongoId().withMessage('Invalid user ID format'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() });}          
        const {id} = req.body;    

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        try {
            const deletedUser = await User.findByIdAndDelete(id);
            res.send({
                message: `Recipe was deleted successfully!, reponse: ${deletedUser}`
              });
        } catch (e) {
            res.status(500).json({ msg: 'Error deleting user', error: e.message });
        }
     }

)

router.delete('/delete-profile', 
    verifySession,
    check('id').trim().escape().notEmpty().isMongoId().withMessage('Invalid user ID format'),
    async (req, res) => {
       

        const errors = validationResult(req);
        if (!errors.isEmpty())  {return res.status(400).json({ errors: errors.array() });}            

        const { id } = req.body;  

        // console.log(`req.data = ${req.data}.`);      
        // console.log(`req = ${req}.`);
        // console.log(`id = ${id}.`);
             
        //User can only delete their own profile
        if(req.session.userId !== id) {
            return res.status(401).send('Unauthorized');
        }  
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        try {
            const deletedUser = await User.findByIdAndDelete(id);           
            res.send({
                message: `Recipe was deleted successfully!, reponse: ${deletedUser}`
              });
        } catch (e) {
            res.status(500).json({ msg: 'Error deleting user', error: e.message });
        }
     }
)






module.exports = router;
