import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import {Container, Row, Button, Form, InputGroup } from 'react-bootstrap';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
// import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import { useTheme} from '../../common/ThemeProvider';

const UserRegister = () => {

    const { themeVariants } = useTheme(); 
    const [currentUserDetails, setCurrentUserDetails] = useState({
        username: "",
        email: "",        
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [displayInitialPasswordMessage, setDisplayInitialPasswordMessage] = useState(true);
    const [hidePassword, setHidePassword] = useState(true); 
    const [passwordFocus, setPasswordFocus] = useState(false);


    useEffect(() => {
        const passwordInput = document.getElementById("passwordInput");
      
        if (passwordInput) {
          const handleFocus = () => setPasswordFocus(true);
          const handleBlur = () => setPasswordFocus(false);
      
          passwordInput.addEventListener("focus", handleFocus);
          passwordInput.addEventListener("blur", handleBlur);      
          
          return () => {
            passwordInput.removeEventListener("focus", handleFocus);
            passwordInput.removeEventListener("blur", handleBlur);
          };
        }
      }, []);
      
    const onChangeUsername = (e) => {
        const username = e.target.value;
        setCurrentUserDetails({ ...currentUserDetails, username });  

        const {usernameError,  ...validationErrors} = errors;  
        if (username.trim().length === 0 ){
            validationErrors.usernameError = 'Field Empty'; 
        } 
        setErrors(validationErrors);   
    }

    const onChangeEmail = (e) => {
        const email = e.target.value;
        setCurrentUserDetails({ ...currentUserDetails, email });  

        const {emailError,  ...validationErrors} = errors;  
        let isValidEmail = /^("[^"]+"|[a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (email.trim().length === 0){
            validationErrors.emailError = 'Field Empty'; 
        } else if (!isValidEmail.test(email)) {
            validationErrors.emailError = 'Invalid Email';
        }
        setErrors(validationErrors);      
    }

    const onChangePassword = (e) => {
        const password = e.target.value;
        if(displayInitialPasswordMessage){setDisplayInitialPasswordMessage(false)} 
        setCurrentUserDetails({ ...currentUserDetails, password });

        const {passwordError, initialPasswordError,  ...validationErrors} = errors;  
        let tmpPasswordError = {};

        if (password.trim().length === 0 ){
            tmpPasswordError.empty = "Field Empty";
        } 
        if (password.length < 6) {
            tmpPasswordError.tooShort = "Must be at least 6 characters long";
            }
        let capCheck = /[A-Z]/g;
        if(!capCheck.test(password)) {
            tmpPasswordError.noCap = "Must contain a capital letter";
        }
        let specCharCheck = /[^a-zA-Z0-9]/g;
        if(!specCharCheck.test(password)) {
            tmpPasswordError.noSpecChars = "Must contain a Special Character";
        }
        let numCheck = /[0-9]/g;
        if(!numCheck.test(password)) {
            tmpPasswordError.noNum = "Must contain a number";
        }

        if(Object.keys(tmpPasswordError).length > 0) {
            validationErrors.passwordError = tmpPasswordError;
        }
        setErrors(validationErrors);  
    }

    const passwordFeedbackMsg = () => {
        if(passwordFocus && typeof errors.passwordError ==="undefined" 
            && displayInitialPasswordMessage && currentUserDetails.password.length === 0) {
                return(<div>
                        <p className="passwordInvalid">Password Criteria:</p>
                        <div className="ms-2">
                            <p className="passwordInvalid">Minimum 6 characters <i className="bi bi-x"></i></p>
                            <p className="passwordInvalid">Capital letter <i className="bi bi-x"></i></p>
                            <p className="passwordInvalid">Special character <i className="bi bi-x"></i></p>
                            <p className="passwordInvalid">Number <i className="bi bi-x"></i></p>
                            <p className="passwordInvalid">Not Empty <i className="bi bi-x"></i></p>
                        </div>
                    </div>);       
            } else { 
                return (   
                    <div>                                  
                        {typeof errors.passwordError !=="undefined" ? 
                        <p className="passwordInvalid">Password Criteria:</p>
                        : <p className="passwordValid">Password Criteria:</p>}
                        <div className="ms-2">
                            {(typeof errors.passwordError !=="undefined" && 
                                Object.keys(errors.passwordError).includes("tooShort")) ? 
                            <p className="passwordInvalid">Minimum 6 characters <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Minimum 6 characters <i className="bi bi-check-lg"></i></p>
                            }
                            {(typeof errors.passwordError !=="undefined" && 
                                Object.keys(errors.passwordError).includes("noCap")) ? 
                            <p className="passwordInvalid">Capital letter <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Capital letter <i className="bi bi-check-lg"></i></p>
                            }                  
                            {(typeof errors.passwordError !=="undefined" && 
                                Object.keys(errors.passwordError).includes("noSpecChars")) ? 
                            <p className="passwordInvalid">Special character <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Special character <i className="bi bi-check-lg"></i></p>
                            }    
                            {(typeof errors.passwordError !=="undefined" && 
                                Object.keys(errors.passwordError).includes("noNum")) ? 
                            <p className="passwordInvalid">Number <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Number <i className="bi bi-check-lg"></i></p>
                            }    
                            {(typeof errors.passwordError !=="undefined" && 
                                Object.keys(errors.passwordError).includes("empty")) ? 
                            <p className="passwordInvalid">Not Empty <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Not Empty <i className="bi bi-check-lg"></i></p>
                            }    
                        </div>                  
                    </div>  
                );
            }                  
    }

    const submitLogin = () => {
        console.log(`Current user details: ${JSON.stringify(currentUserDetails)}`)
    }
    const toggleHidePassword = () => {
        hidePassword ? setHidePassword(false) :  setHidePassword(true) ;
        const passwordInput = document.getElementById("passwordInput");
        if(passwordInput.type === "password") {
            passwordInput.type = "text";
        } else {passwordInput.type = "password";}
    }
    const HidePasswordIcon = () => {
        return hidePassword ? (            
            <i className="bi bi-eye-slash"></i>
        ) : (
            <i className="bi bi-eye"></i>
        ) 
    }

    return (
        <Container className="p-0">
        <Container as="h4" className="mb-4">
            New User Register
        </Container>
        <Form>
        <Container className="d-flex flex-column loginInputArea">

        <Form.Group controlId="usernameInput" className="mb-4">
              <Form.Label  className="ps-2">User Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={currentUserDetails.username} 
                  data-bs-theme={themeVariants['data-bs-theme']}
                  onChange={onChangeUsername}
                  isInvalid={!!errors.usernameError } 
                  isValid={!!!errors.usernameError && currentUserDetails.username.length > 0}
                
                >
                </Form.Control>
                <Form.Control.Feedback className="" type="invalid">
                  {errors.usernameError}
                </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="emailInput" className="mb-4">
              <Form.Label  className="ps-2">Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Email"
                  value={currentUserDetails.email} 
                  data-bs-theme={themeVariants['data-bs-theme']}
                  onChange={onChangeEmail}
                  isInvalid={!!errors.emailError } 
                  isValid={!!!errors.emailError && currentUserDetails.email.length > 0}
                
                >
                </Form.Control>
                <Form.Control.Feedback className="" type="invalid">
                  {errors.emailError}
                </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="passwordInput" className="mb-4">
              <Form.Label className="ps-2">Password</Form.Label>
              <InputGroup >           
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={currentUserDetails.password} 
                  data-bs-theme={themeVariants['data-bs-theme']}
                  onChange={onChangePassword}
                  isInvalid={!!errors.passwordError } 
                  isValid={!!!errors.passwordError && currentUserDetails.password.length > 0} 
                >
                </Form.Control>
                <Button
                    data-bs-theme={themeVariants['data-bs-theme']}
                    variant= {themeVariants.variant === 'dark' ? "secondary" : "outline-secondary"}
                    onClick={toggleHidePassword}
                    >{HidePasswordIcon()}
                </Button>              
            </InputGroup>
            <Form.Control.Feedback className="" type="invalid">
                  </Form.Control.Feedback>  
                  <Form.Control.Feedback className="" type="valid"> 
                  </Form.Control.Feedback>  
            <Container>
                {passwordFocus && (passwordFeedbackMsg())}
            </Container>
            </Form.Group>
        </Container>
            <Row xs="auto" className="justify-content-center gap-3">
                   <Button 
                    onClick={submitLogin} 
                    disabled={Object.keys(errors).length > 0}
                    className="btn btn-primary">
                     Submit
                   </Button>
            </Row>   
            
        </Form>
        
    </Container>
);
};

export default UserRegister;
