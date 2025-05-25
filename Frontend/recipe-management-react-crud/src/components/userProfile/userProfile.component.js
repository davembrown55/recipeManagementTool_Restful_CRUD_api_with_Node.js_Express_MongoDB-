import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Col, Card, Nav, Spinner, Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';
import useUserService from "../../services/user.service";
import { useAuth } from "../../auth/AuthContext";



const UserProfile = () => {
    // const [editUsername, setEditUsername] = useState(false);
    const [activeTab, setActiveTab ] = useState("userTab1");
    const handleSelect = (selectedKey) => {
        setActiveTab(selectedKey);
    };
    const { themeVariants } = useTheme(); 
    const { get, getUserWithAuth, userUpdate, check } = useUserService();
    const navigate = useNavigate();
    const location = useLocation();
    const [ isLoading, setIsLoading ] = useState(false);
    const [errors, setErrors] = useState({});
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [usernameParam, setUsernameParam] = useState(false);
    const [emailParam, setEmailParam] = useState(false);
    const [passwordParam, setPasswordParam] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [newPasswordFocus, setNewPasswordFocus] = useState(false);
    const [hidePassword, setHidePassword] = useState(true); 
    const [hideNewPassword, setHideNewPassword] = useState(true); 
    const [displayInitialPasswordMessage, setDisplayInitialPasswordMessage] = useState(true);
    const [displayInitialNewPasswordMessage, setDisplayInitialNewPasswordMessage] = useState(true);
    const [submitModal, setSubmitModal] = useState(false);
    const [submitModalType, setSubmitModalType] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [serverSuccess, setServerSuccess] = useState(null);
    const { userRole, userName, verify } = useAuth();

    const [userFields, setUserFields] = useState({
        id: '',
        currentUsername: '',        
        currentEmail: ''      
    })
    const [updateUserFields, setUpdateUserFields] = useState({})

    // useEffect(() => {
    //     const passwordInput = document.getElementById("currentPasswordInput");
    //     const newPasswordInput = document.getElementById("newPasswordInput");

    //     const onPassFocus  = () => setPasswordFocus(true);
    //     const onPassBlur   = () => setPasswordFocus(false);
    //     const onNewFocus   = () => setNewPasswordFocus(true);
    //     const onNewBlur    = () => setNewPasswordFocus(false);
        
    //     passwordInput?.addEventListener('focus', onPassFocus);
    //     passwordInput?.addEventListener('blur',  onPassBlur);
    //     newPasswordInput?.addEventListener('focus', onNewFocus);
    //     newPasswordInput?.addEventListener('blur',  onNewBlur);

    //     return () => {
    //         passwordInput?.removeEventListener('focus', onPassFocus);
    //         passwordInput?.removeEventListener('blur',  onPassBlur);
    //         newPasswordInput?.removeEventListener('focus', onNewFocus);
    //         newPasswordInput?.removeEventListener('blur',  onNewBlur);
    //       };
    // }, []);

    // const [passwordMatch, setPasswordMatch] = useState("");



    const updateAuth = async() => {
        // if status 401 'unauthorized' returned from server
        const auth = await verify();
        if(auth === 'unauthorised') {
            navigate('/login/existingUser');
        } else {
            navigate('/');
        }        
    }

    useEffect( () => {
        async function fetchUser () {
            let id = '';
            try {
                const userfromAuth = await getUserWithAuth();

                if (userfromAuth && typeof userfromAuth.sessionVerified !== 'undefined') {
                    // console.log('from auth: ' + JSON.stringify(userfromAuth.sessionVerified));
                    id = userfromAuth.sessionVerified.id
                    setUserFields({
                        id: userfromAuth.sessionVerified.id, 
                        currentUsername: userfromAuth.sessionVerified.username,        
                        currentPassword: userFields.currentPassword,        
                        currentEmail: userfromAuth.sessionVerified.email  
                    })
                } else if ([ 400, 401, 404, 500 ].find((i) => i === userfromAuth.status)) {
                    // console.log(JSON.stringify(userfromAuth, 2, 2));
                    if(userfromAuth.status === 400 && typeof userfromAuth.data.errors !== 'undefined') {
                        // Validation errors
                        // turn  [{ msg: 'foo' }, { msg: 'bar' }]  into  [ <p>foo</p>, <p>bar</p> ]
                        const errorMessage = userfromAuth.data.errors.map((e, i) => (
                            <p key={i}>{e.msg}</p>
                        ));                 
                        setServerError({
                            status: userfromAuth.status,
                            msg: errorMessage
                        });    
                    } else {
                        setServerError({
                            status: userfromAuth.status,
                            msg: userfromAuth.data.msg || userfromAuth.data
                        });    
                    }  
                    openSubmitModal('serverError');
                    setSubmitModal(true);

                } else {
                    openSubmitModal('serverError');
                        setSubmitModal(true);
                        setServerError({
                            status: userfromAuth.status,
                            msg: userfromAuth.data.msg || 'Server Error.' 
                        }); 
                }

            } catch (e) {
                openSubmitModal('serverError');
                        setSubmitModal(true);
                        setServerError({
                            status: e.status,
                            msg: e.data.msg || 'Server Error.' 
                        }); 
            }
           
        };            
        fetchUser();
    }, []);

     // useEffect for Username Debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            const checkAvailability = async () => {
                if(typeof updateUserFields.username === 'undefined' || updateUserFields.username.trim().length === 0 || typeof errors.usernameError !== 'undefined') {
                    setUsernameAvailable(null);
                    return;
                } else {
                    const input = updateUserFields.username.trim();
                    const params = {username: input};                    
                    try {
                        const response = await check (params);
                        setUsernameAvailable(response.userNameAvailable);
                    } catch (error) {
                        console.error("Error checking username:", error);
                        setUsernameAvailable(false);
                    }
                }
                
            };
            checkAvailability();
        }, 500); 

        // Cleanup timeout if username changes before 500ms
        return () => clearTimeout(handler);
    }, [updateUserFields.username]);

    // useEffect for Email Debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            const checkAvailability = async () => {
                if(typeof updateUserFields.email === 'undefined' || updateUserFields.email.trim().length === 0 || typeof errors.emailError !== 'undefined') {
                    setEmailAvailable(null);
                    return;
                } else {
                    const input = updateUserFields.email.trim();
                    const params = {
                        email: input                    
                    };
                    try {
                        const response = await check(params);           
                        setEmailAvailable(response.emailAvailable);
                    } catch (err) {
                        const error = err.response.data.errors.map((x) => {
                            if(x.msg === "Invalid email") {return x.msg;}
                        })
                        // maybe do something with this if required in the future?
                        const invalidEmailonServer = error.includes("Invalid email");           
                        setEmailAvailable(false);
                    }

                }
                
            };
            checkAvailability();
        }, 500); 
        // Cleanup timeout if email changes before 500ms
        return () => clearTimeout(handler);    
    }, [updateUserFields.email]);
    

    const onChangeUpdatedUserName = (e) => {
        const username = e.target.value;
        setUpdateUserFields({ ...updateUserFields, username: username });  

        const {usernameError,  ...validationErrors} = errors;  
        if (username.trim().length === 0 ){
            validationErrors.usernameError = 'Field Empty'; 
        } else if (username.trim().length < 3 ) {
            validationErrors.usernameError = 'Must be at least 3 characters long';
        } else if (username.trim().length > 20 ) {
            validationErrors.usernameError = 'Must be less than 20 characters long';
        }
        setErrors(validationErrors);  
    };

    const handleUpdateUsername = () => {
        if (usernameParam) {
            const newUpdateUserFields = {...updateUserFields};
            delete newUpdateUserFields.username;
            const { usernameError, ...newErrors } = errors;
            setUpdateUserFields(newUpdateUserFields);
            setErrors(newErrors);
            setUsernameParam(false);
        } else {            
            const { ...newUpdateUserFields } = updateUserFields;            
            newUpdateUserFields.username = "";                        
            setUpdateUserFields(newUpdateUserFields);
            setUsernameParam(true);
        }        
    }
    
    const onChangeUpdatedEmail = (e) => {
        const email = e.target.value;
        setUpdateUserFields({ ...updateUserFields, email: email });  

        const {emailError,  ...validationErrors} = errors;  
        let isValidEmail = /^("[^"]+"|[a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                
        if (email.trim().length === 0 ){
            validationErrors.emailError = 'Field Empty'; 
        } else if (!isValidEmail.test(email)) {
            validationErrors.emailError = 'Invalid Email';
        }
        setErrors(validationErrors);  
    };


    const handleUpdateEmail = () => {
        if (emailParam) {
            const newUpdateUserFields = {...updateUserFields};
            delete newUpdateUserFields.email;
            const { emailError, ...newErrors } = errors;
            setUpdateUserFields(newUpdateUserFields);
            setErrors(newErrors);
            setEmailParam(false);
        } else {            
            const { ...newUpdateUserFields } = updateUserFields;            
            newUpdateUserFields.email = "";                        
            setUpdateUserFields(newUpdateUserFields);
            setEmailParam(true);
        }        
    }

    const onChangeCurrentPassword = (e) => {
        const currentPassword = e.target.value;
        if(displayInitialPasswordMessage) {setDisplayInitialPasswordMessage(false)}
        setUpdateUserFields({ ...updateUserFields, currentPassword: currentPassword });  

        const {currentPasswordError,  ...validationErrors} = errors;  
        let tmpPasswordError = {};
        
        if (currentPassword.trim().length === 0 ){
            tmpPasswordError.empty = "Field Empty";
        } 
        if (currentPassword.length < 6) {
            tmpPasswordError.tooShort = "Must be at least 6 characters long";
            }
        let capCheck = /[A-Z]/g;
        if(!capCheck.test(currentPassword)) {
            tmpPasswordError.noCap = "Must contain a capital letter";
        }
        let specCharCheck = /[^a-zA-Z0-9]/g;
        if(!specCharCheck.test(currentPassword)) {
            tmpPasswordError.noSpecChars = "Must contain a Special Character";
        }
        let numCheck = /[0-9]/g;
        if(!numCheck.test(currentPassword)) {
            tmpPasswordError.noNum = "Must contain a number";
        }

        if(Object.keys(tmpPasswordError).length > 0) {
            validationErrors.currentPasswordError = tmpPasswordError;
        }
        setErrors(validationErrors);  
    };

    const onChangeNewPassword = (e) => {
        const newPassword = e.target.value;
        if(displayInitialNewPasswordMessage) {setDisplayInitialNewPasswordMessage(false)}

        setUpdateUserFields({ ...updateUserFields, newPassword: newPassword });  

        const {newPasswordError, passwordMatchError, ...validationErrors} = errors;  
        if (updateUserFields.passwordMatch.trim().length > 0 && updateUserFields.passwordMatch !== newPassword) {
            validationErrors.passwordMatchError = "Doesn't match new password";         
        }
        
        let tmpPasswordError = {};
        
        if (newPassword.trim().length === 0 ){
            tmpPasswordError.empty = "Field Empty";
        } 
        if (newPassword.trim() === updateUserFields.currentPassword.trim() ){
            tmpPasswordError.noChange = "Enter a different password";
        } 
        if (newPassword.length < 6) {
            tmpPasswordError.tooShort = "Must be at least 6 characters long";
            }
        let capCheck = /[A-Z]/g;
        if(!capCheck.test(newPassword)) {
            tmpPasswordError.noCap = "Must contain a capital letter";
        }
        let specCharCheck = /[^a-zA-Z0-9]/g;
        if(!specCharCheck.test(newPassword)) {
            tmpPasswordError.noSpecChars = "Must contain a Special Character";
        }
        let numCheck = /[0-9]/g;
        if(!numCheck.test(newPassword)) {
            tmpPasswordError.noNum = "Must contain a number";
        }

        if(Object.keys(tmpPasswordError).length > 0) {
            validationErrors.newPasswordError = tmpPasswordError;
        }
        setErrors(validationErrors);  
    };

    const onChangePasswordMatch = (e) => {
        const passwordMatch = e.target.value;       
        setUpdateUserFields({ ...updateUserFields, passwordMatch: passwordMatch });  

        const {passwordMatchError,  ...validationErrors} = errors;  
       
        if (passwordMatch !== updateUserFields.newPassword) {
            validationErrors.passwordMatchError = "Doesn't match new password";
        }        
        setErrors(validationErrors);  
    };

    
    
    const handleUpdatePassword = () => {
        if (passwordParam) {
            const newUpdateUserFields = {...updateUserFields};
            delete newUpdateUserFields.currentPassword; 
            delete newUpdateUserFields.newPassword;             
            delete newUpdateUserFields.passwordMatch;             
            const { passwordError, ...newErrors } = errors;
            setUpdateUserFields(newUpdateUserFields);
            setErrors(newErrors);
            setPasswordParam(false);
        } else {            
            const { ...newUpdateUserFields } = updateUserFields;            
            newUpdateUserFields.currentPassword = "";                        
            newUpdateUserFields.newPassword = "";                        
            newUpdateUserFields.passwordMatch = "";                        
            setUpdateUserFields(newUpdateUserFields);
            setPasswordParam(true);
        }        
    }

    const toggleHidePassword = () => {
        hidePassword ? setHidePassword(false) :  setHidePassword(true) ;
        const passwordInput = document.getElementById("currentPasswordInput");

        if(passwordInput.type === "password") {
            passwordInput.type = "text";
            
        } else {
            passwordInput.type = "password";
        }
    }
    const toggleHideNewPassword = () => {
        hideNewPassword ? setHideNewPassword(false) :  setHideNewPassword(true) ;
        const passwordInput = document.getElementById("newPasswordInput");
        const passwordMatchInput = document.getElementById("newPasswordMatchInput");

        if(passwordInput.type === "password") {
            passwordInput.type = "text";
            passwordMatchInput.type = "text";
            
        } else {
            passwordInput.type = "password";
            passwordMatchInput.type = "password";
        }
    }
    const HidePasswordIcon = () => {
        return hidePassword ? (            
            <i className="bi bi-eye-slash"></i>
        ) : (
            <i className="bi bi-eye"></i>
        ) 
    }

    const updateUser = async (field) => {
        if (field === 'username' && (typeof updateUserFields.username === 'undefined' || usernameAvailable === false || !!errors.usernameError || updateUserFields.username.trim().length === 0 )) {
            hideSubmitModal();
            return;
        } else if (field === 'email' && (typeof updateUserFields.email === 'undefined' || emailAvailable === false || !!errors.emailError )) {
            hideSubmitModal();
            return;
        } else if (field === 'password' && canSubmitPasswordUpdate()) {
            hideSubmitModal(); 
            return;
        } else {
            let param = {id: userFields.id}
            // let param = { username: userFields.currentUsername };
            if (field === 'username') {
                param.username = updateUserFields.username;
            }
            if (field === 'email') {
                param.email = updateUserFields.email;
            }
            if (field === 'password') {
                param.password = updateUserFields.currentPassword;
                param.updatedPassword = updateUserFields.newPassword;
            }            

            try {
                const response = await userUpdate(param);
                if(typeof response.updatedUser !== 'undefined') {
                    setUserFields({
                        id: response.updatedUser.id, 
                        currentUsername: response.updatedUser.username,        
                        currentPassword: userFields.currentPassword,        
                        currentEmail: response.updatedUser.email  
                    });
                    setSubmitModal(false);
                    if (field === 'username') {
                        handleUpdateUsername();
                    } 
                    if (field === 'email') {
                        handleUpdateEmail();
                    } 
                    if (field === 'password') {
                        handleUpdatePassword();
                    }
                    setServerSuccess({
                        msg: `${field} was updated successfully`
                    }); 
                    openSubmitModal('serverSuccess');
                    setSubmitModal(true);

                } else {                 
                    if ([ 400, 401, 404, 500 ].find((i) => i === response.status)) {
                        // console.log(JSON.stringify(response, 2, 2));
                        if(response.status === 400 && typeof response.data.errors !== 'undefined') {
                            // Validation errors
                            // turn  [{ msg: 'foo' }, { msg: 'bar' }]  into  [ <p>foo</p>, <p>bar</p> ]
                            const errorMessage = response.data.errors.map((e, i) => (
                                <p key={i}>{e.msg}</p>
                            ));                 
                            setServerError({
                                status: response.status,
                                msg: errorMessage
                            });    
                        } else {
                            setServerError({
                                status: response.status,
                                msg: response.data.msg || response.data
                            });    
                        }  
                        openSubmitModal('serverError');
                        setSubmitModal(true);
                                                 
                    } else {                        
                        openSubmitModal('serverError');
                        setSubmitModal(true);
                        setServerError({
                            status: response.status,
                            msg: response.data.msg || 'Server Error.' 
                        }); 
                    }
                }
            } catch (e) {
                openSubmitModal('serverError');
                setSubmitModal(true);
                setServerError({
                    status: e.status,
                    msg:  e.data.msg || 'Server Error.'
                });         
            }
        }        

    };

    const openSubmitModal = (type, e) => {
        if(typeof e !== 'undefined'){
            e.preventDefault();
        }        
        setSubmitModalType(type);
        setSubmitModal(true)
    }

    const hideSubmitModal = (e) => {
        if(serverError !== null && serverError.status === 401) {updateAuth()}; // server returned 401 'unauthorized'  
        setSubmitModalType(null);
        setServerError(null);
        setServerSuccess(null);
        setSubmitModal(false);
    }

    const passwordFeedbackMsg = (focus, type, passwordError) => {
        // params newPasswordFocus || passwordFocus
        if(focus && typeof passwordError === "undefined" 
            && (type === 'current' && displayInitialPasswordMessage  && updateUserFields.currentPassword.length === 0 
                || type === 'new'  && displayInitialNewPasswordMessage  && updateUserFields.newPassword.length === 0) 
           ) {
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
            } else if(type === 'new'&& typeof passwordError !=="undefined" && Object.keys(passwordError).includes("noChange")) {
                return(<div>
                    <p className="passwordInvalid">Password Criteria:</p>
                    <div className="ms-2">
                        <p className="passwordInvalid">Enter a new password to update.<i className="bi bi-x"></i></p>
                    </div>
                </div>);       
            }
            else { 
                return (   
                    <div>                                  
                        {typeof passwordError !=="undefined" ? 
                        <p className="passwordInvalid">Password Criteria:</p>
                        : <p className="passwordValid">Password Criteria:</p>}
                        <div className="ms-2">
                            {(typeof passwordError !=="undefined" && 
                                Object.keys(passwordError).includes("tooShort")) ? 
                            <p className="passwordInvalid">Minimum 6 characters <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Minimum 6 characters <i className="bi bi-check-lg"></i></p>
                            }
                            {(typeof passwordError !=="undefined" && 
                                Object.keys(passwordError).includes("noCap")) ? 
                            <p className="passwordInvalid">Capital letter <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Capital letter <i className="bi bi-check-lg"></i></p>
                            }                  
                            {(typeof passwordError !=="undefined" && 
                                Object.keys(passwordError).includes("noSpecChars")) ? 
                            <p className="passwordInvalid">Special character <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Special character <i className="bi bi-check-lg"></i></p>
                            }    
                            {(typeof passwordError !=="undefined" && 
                                Object.keys(passwordError).includes("noNum")) ? 
                            <p className="passwordInvalid">Number <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Number <i className="bi bi-check-lg"></i></p>
                            }    
                            {(typeof passwordError !=="undefined" && 
                                Object.keys(passwordError).includes("empty")) ? 
                            <p className="passwordInvalid">Not Empty <i className="bi bi-x"></i></p> : 
                            <p className="passwordValid">Not Empty <i className="bi bi-check-lg"></i></p>
                            }    
                        </div>                  
                    </div>  
                );
            }                  
    }

    const canSubmitPasswordUpdate = () => {
        if (typeof updateUserFields.currentPassword === 'undefined' || typeof updateUserFields.newPassword === 'undefined' 
            || typeof updateUserFields.passwordMatch === 'undefined' || !!errors.currentPasswordError || !!errors.newPasswordError 
            || !!errors.passwordMatchError || updateUserFields.currentPassword.trim().length === 0 
            || updateUserFields.newPassword.trim().length === 0 || updateUserFields.passwordMatch.trim().length === 0
        ) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <Container fluid className="d-flex justify-content-center">        
            
                <Col xs={12} sm={12} md={10} lg={8} className="d-flex justify-content-center">
                    <Card 
                        bg={themeVariants.variant === 'dark' ? 'dark' : ''}
                        text={themeVariants.text}
                        className="mb-3 w-100"
                    >
                    {/* <Card.Header className="loginCardHeader" 
                        variant={themeVariants.variant}
                        bg={themeVariants.variant === 'dark' ? 'dark' : ''}>
                        <Nav variant="tabs" 
                            activeKey={activeTab}
                            onSelect={handleSelect}
                            data-bs-theme={themeVariants['data-bs-theme']} 
                            >
                            <Nav.Item>
                                <Nav.Link eventKey="userTab1" >User Tab 1</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="userTab2">User Tab 2</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header> */}
                    <Card.Body>                         
                        
                        <Container fluid className="d-flex justify-content-center">
                        { isLoading ? <Container className="d-flex justify-content-center gap-5 ps-0">
                                        <Spinner animation="border" variant={themeVariants.text} />
                                        <p>Loading...</p>        
                                      </Container> 
                            :
                            (
                                
                                <Container className="mb-3 w-100 recipeCard">
                                    <Modal
                                        show={submitModal}
                                        onHide={hideSubmitModal}
                                        backdrop="static"
                                        keyboard={true}
                                        data-bs-theme={themeVariants['data-bs-theme']}       
                                        className={themeVariants.variant}
                                        centered
                                        >
                                        <Modal.Header  closeButton >                                           
                                            { submitModalType === 'serverError' ? 
                                                        <Modal.Title >Error!</Modal.Title>
                                                        : submitModalType === 'serverSuccess' ?
                                                            <Modal.Title >Success!</Modal.Title>
                                                            : submitModalType === null ? 
                                                                <Modal.Title ></Modal.Title> 
                                                                :
                                                                <Modal.Title >Update your {submitModalType}?</Modal.Title> 
                                                      
                                            }
                                            
                                        </Modal.Header>
                                        <Modal.Body >
                                            { submitModalType === 'serverError' ?   
                                                                        serverError.msg 
                                                                        : submitModalType === 'serverSuccess' ? 
                                                                            serverSuccess.msg 
                                                                            : submitModalType === null ? 
                                                                                '' // empty string to display while modal closing
                                                                                : `Click OK to submit changes to ${ submitModalType }.`
                                                                   
                                            } 
                                        </Modal.Body>
                                        <Modal.Footer>
                                        { submitModalType !== 'serverError' ?                                         
                                                submitModalType === 'username' ?
                                                                            <Button 
                                                                                variant="primary" 
                                                                                onClick={(e) => updateUser('username')}
                                                                                disabled={typeof updateUserFields.username === 'undefined' || usernameAvailable === false || !!errors.usernameError  }
                                                                            >OK</Button> 
                                                                            : 
                                                                            // add other update functions here                                                                            
                                                                            submitModalType === 'email' ?
                                                                                                        <Button 
                                                                                                            variant="primary" 
                                                                                                            onClick={(e) => updateUser('email')}
                                                                                                            disabled={typeof updateUserFields.email === 'undefined' || emailAvailable === false || !!errors.emailsError }
                                                                                                        >OK</Button> 
                                                                                                        : submitModalType === 'password' ?
                                                                                                                                        <Button 
                                                                                                                                            variant="primary" 
                                                                                                                                            onClick={(e) => updateUser('password')}
                                                                                                                                            disabled={canSubmitPasswordUpdate()}
                                                                                                                                        >OK</Button> 
                                                                                                                                        :
                                                                                                                                        <Button 
                                                                                                                                            variant="primary" 
                                                                                                                                            onClick={(e) => hideSubmitModal()}
                                                                                                                                        >OK</Button>
                                                    // else submitModalType === 'serverError'
                                                    : serverError.status === 401 ? 
                                                                        <Button 
                                                                            variant="primary" 
                                                                            onClick={(e) => updateAuth()}
                                                                        >OK</Button>
                                                                        : <Button 
                                                                            variant="primary" 
                                                                            onClick={(e) => hideSubmitModal()}
                                                                        >OK</Button>
                                        }
                                        </Modal.Footer>
                                    </Modal>  
                                    {/* <h1>User Profile</h1> */}
                                    <Card.Title 
                                        as="h2"  
                                        className="recipeCardTitle mb-3"                                    
                                    >
                                        User Profile
                                    </Card.Title>
                                     <Card.Body className="d-flex flex-column loginInputArea">

                                        <div className=" d-flex gap-3">
                                                <Card.Text className='ps-2'>
                                                    Username:  <span style={{paddingLeft: '0.5rem'}}> {userFields.currentUsername} </span>                   
                                                </Card.Text> 
                                        </div>     
                                        <div className=" mt-2 mb-5 d-flex gap-3">
                                                <Card.Text className='ps-2' >
                                                    Email:  <span style={{paddingLeft: '0.5rem'}}> {userFields.currentEmail} </span>                   
                                                </Card.Text> 
                                        </div>

                                        <Card.Subtitle 
                                            as='h4'
                                            data-bs-theme={themeVariants['data-bs-theme']}  
                                            className='ps-1 mb-1 text-muted'
                                        >
                                            Update your information:
                                        </Card.Subtitle>
                                        

                                        <Form
                                            // disabled={typeof updateUserFields.newPassword === 'undefined' || !!errors.currentPasswordError || !!errors.newPasswordError || !!errors.passwordMatchError }
                                            // onSubmit={(e) => openSubmitModal('username', e)}
                                        >
                                            <div className=" mt-2 d-flex gap-3">
                                               
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="usernameEdit-on-off"
                                                label="Update Username"
                                                className="small-text mt-2 ps-5 py-2"
                                                checked={usernameParam}
                                                onChange={handleUpdateUsername}
                                                data-bs-theme={themeVariants['data-bs-theme']}   
                                            />
                                            <div> 
                                                {usernameParam && (
                                                    <Form.Group controlId="userName" className="ps-3 mb-4 d-flex flex-column">
                                                
                                                        <Form.Label className="mt-1 ps-1">New Username</Form.Label>
                                                        
                                                        <Form.Control
                                                            type="text"        
                                                            placeholder="Enter new Username"                                            
                                                            value={updateUserFields.username} 
                                                            data-bs-theme={themeVariants['data-bs-theme']}                                                    
                                                            onChange={onChangeUpdatedUserName}
                                                            isInvalid={!!errors.usernameError || usernameAvailable === false } 
                                                            isValid={usernameAvailable === true && !!!errors.usernameError && updateUserFields.username.length > 0}
                                                            
                                                        >
                                                        </Form.Control>
                                                        <Form.Control.Feedback className="" type="invalid">
                                                            {errors.usernameError || "Username is unavailable."}
                                                        </Form.Control.Feedback>
                                                        <Form.Control.Feedback type="valid">
                                                            Username is available!
                                                        </Form.Control.Feedback>
                                                        <Button
                                                            type='submit'
                                                            variant='primary'
                                                            size='sm'
                                                            className='smaller-btn align-self-end mt-2'
                                                            disabled={typeof updateUserFields.username === 'undefined' || usernameAvailable === false || !!errors.usernameError  }
                                                            onClick={(e) => openSubmitModal('username', e)}
                                                        >
                                                            Submit
                                                        </Button>
                                                    </Form.Group>
                                                )}
                                            </div>
                                        </Form>
                                        <Form>                                            
                                            <Form.Check 
                                                type="switch"
                                                id="emailEdit-on-off"
                                                label="Update Email"
                                                className="small-text mt-2 ps-5 py-2"
                                                checked={emailParam}
                                                onChange={handleUpdateEmail}
                                                data-bs-theme={themeVariants['data-bs-theme']}   
                                            />

                                            {emailParam && (
                                                    <Form.Group controlId="emailInput" className="ps-3 mb-4 d-flex flex-column">
                                                
                                                        <Form.Label className="mt-1 ps-1">New Email Address</Form.Label>
                                                        
                                                        <Form.Control
                                                            type="text"        
                                                            placeholder="Enter new email"                                            
                                                            value={updateUserFields.email} 
                                                            data-bs-theme={themeVariants['data-bs-theme']}                                                    
                                                            onChange={onChangeUpdatedEmail}
                                                            isInvalid={!!errors.emailError || emailAvailable === false} 
                                                            isValid={emailAvailable === true && !!!errors.emailError && updateUserFields.email.length > 0}
                                                        >
                                                        </Form.Control>
                                                        <Form.Control.Feedback  type="invalid">
                                                            {errors.emailError || "Email is unavailable."}
                                                        </Form.Control.Feedback>
                                                        <Form.Control.Feedback type="valid">
                                                            Email is available!
                                                        </Form.Control.Feedback>
                                                        <Button
                                                            variant='primary'
                                                            type='submit'
                                                            size='sm'
                                                            className='smaller-btn align-self-end mt-2'
                                                            disabled={typeof updateUserFields.email === 'undefined' || emailAvailable === false || !!errors.emailError  }
                                                            onClick={(e) => openSubmitModal('email', e) }

                                                        >
                                                            Submit
                                                        </Button>
                                                    </Form.Group>
                                                )}
                                        </Form>
                                        <Form>                                            
                                            <Form.Check 
                                                type="switch"
                                                id="passwordEdit-on-off"
                                                label="Update Password"
                                                className="small-text mt-2 ps-5 py-2"
                                                checked={passwordParam}
                                                onChange={handleUpdatePassword} 
                                                data-bs-theme={themeVariants['data-bs-theme']}   
                                            />
                                            <div> 
                                                {passwordParam && (
                                                    <div className="ps-3 mb-4 d-flex flex-column">
                                                        <Form.Group controlId="currentPasswordInput" className="ps-3 mb-4 d-flex flex-column">
                                                    
                                                            <Form.Label className="mt-1 ps-1">Current Password</Form.Label>                                                        
                                                            <InputGroup > 
                                                                <Form.Control
                                                                    type="password"        
                                                                    placeholder="Enter current password"                                            
                                                                    value={updateUserFields.currentPassword} 
                                                                    data-bs-theme={themeVariants['data-bs-theme']}                                                    
                                                                    onChange={onChangeCurrentPassword}
                                                                    onFocus={() => setPasswordFocus(true)}
                                                                    onBlur={() => setPasswordFocus(false)}
                                                                    isInvalid={!!errors.currentPasswordError  } 
                                                                    isValid={!!!errors.currentPasswordError && updateUserFields.currentPassword.length > 0}
                                                                    
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
                                                            <Form.Control.Feedback type="valid">                                                            
                                                            </Form.Control.Feedback>
                                                            <Container>
                                                                {passwordFocus && (passwordFeedbackMsg(passwordFocus, 'current', errors.currentPasswordError))}
                                                            </Container>                                                            
                                                        </Form.Group>
                                                        <Form.Group controlId="newPasswordInput" className="ps-3 mb-4 d-flex flex-column">                                                    
                                                            <Form.Label className="mt-1 ps-1">New Password</Form.Label> 
                                                            <InputGroup >                                                        
                                                            <Form.Control
                                                                type="password"        
                                                                placeholder="Enter new password"                                            
                                                                value={updateUserFields.newPassword} 
                                                                data-bs-theme={themeVariants['data-bs-theme']}   
                                                                onFocus={() => setNewPasswordFocus(true)}
                                                                onBlur={() => setNewPasswordFocus(false)}
                                                                onChange={onChangeNewPassword}
                                                                isInvalid={!!errors.newPasswordError  } 
                                                                isValid={!!!errors.newPasswordError && updateUserFields.newPassword.length > 0}
                                                            >
                                                            </Form.Control>
                                                                <Button
                                                                    data-bs-theme={themeVariants['data-bs-theme']}
                                                                    variant= {themeVariants.variant === 'dark' ? "secondary" : "outline-secondary"}
                                                                    onClick={toggleHideNewPassword}
                                                                    >{HidePasswordIcon()}
                                                                </Button>  
                                                            </InputGroup > 
                                                            <Form.Control.Feedback className="" type="invalid">                                                            
                                                            </Form.Control.Feedback>
                                                            <Form.Control.Feedback type="valid">                                                            
                                                            </Form.Control.Feedback>
                                                            <Container>
                                                                {newPasswordFocus && (passwordFeedbackMsg(newPasswordFocus, 'new', errors.newPasswordError))}
                                                            </Container>                                                            
                                                        </Form.Group>
                                                        <Form.Group controlId="newPasswordMatchInput" className="ps-3 mb-4 d-flex flex-column">                                                    
                                                            <Form.Label className="mt-1 ps-1">Re-Enter New Password</Form.Label>                                                        
                                                            <Form.Control
                                                                type="password"        
                                                                placeholder="Re-enter new password"                                            
                                                                value={updateUserFields.passwordMatch} 
                                                                data-bs-theme={themeVariants['data-bs-theme']}   
                                                                onChange={onChangePasswordMatch}
                                                                isInvalid={!!errors.passwordMatchError  } 
                                                                isValid={!!!errors.passwordMatchError && updateUserFields.passwordMatch.length > 0}
                                                                
                                                            >
                                                            </Form.Control>
                                                            <Form.Control.Feedback className="" type="invalid">      
                                                                {errors.passwordMatchError}                                                      
                                                            </Form.Control.Feedback>
                                                            <Form.Control.Feedback type="valid">      
                                                                Its a match                                     
                                                            </Form.Control.Feedback>                                                                                                                        
                                                        </Form.Group>

                                                        <Button
                                                            variant='primary'
                                                            type='submit'
                                                            size='sm'
                                                            className='smaller-btn align-self-end mt-2'
                                                            disabled={canSubmitPasswordUpdate()}
                                                            onClick={(e) => openSubmitModal('password', e)}
                                                        >
                                                            Submit
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </Form>


                                     </Card.Body>
                                    

                                </Container>
                            
                            )
                        }
                            
                            
                            
                            
                            

                        </Container>


                    </Card.Body>
                </Card>
                
            </Col>   
            
         </Container>
        );
};

export default UserProfile;
