import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { Container, Col, Card, Nav   } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';
import ExistingUser from "./existingUser.component";
import UserRegister from "./userRegister.component";

const UserLogin = () => {
    
    const { themeVariants } = useTheme(); 
    // if(!!theme) {setTheme(theme)};
    // console.log(theme);
    const navigate = useNavigate();
    const location = useLocation();

    // const [activeTab, setActiveTab] = useState("ExistingUser");
    // Determine active tab based on URL
    const activeTab = location.pathname.includes("existingUser") ? "ExistingUser" : "UserRegister";

    // default  
    useEffect(() => {
        if (location.pathname === "/login") {
            navigate("/login/existingUser");
        }
    }, [location, navigate]);

    const handleSelect = (selectedKey) => {
        if (selectedKey === "ExistingUser") {
            navigate("/login/existingUser");
        } else {
            navigate("/login/register");
        }
    };

    const renderTabContent = () => {
        if (activeTab === "ExistingUser") {
            return <ExistingUser />;
        } else if (activeTab === "UserRegister") {
            return <UserRegister />;
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center">
            
                <Col xs={12} md={10} lg={6} className="d-flex justify-content-center">
                    <Card 
                    bg={themeVariants.variant === 'dark' ? 'dark' : ''}
                    text={themeVariants.text}
                    className="mb-3 w-100"
                >
                    <Card.Header className="loginCardHeader" 
                        variant={themeVariants.variant}
                        bg={themeVariants.variant === 'dark' ? 'dark' : ''}>
                        <Nav variant="tabs" 
                            activeKey={activeTab}
                            // onSelect={(selectedKey) => setActiveTab(selectedKey)}
                            onSelect={handleSelect}
                            data-bs-theme={themeVariants['data-bs-theme']} 
                            >
                            <Nav.Item>
                                <Nav.Link eventKey="ExistingUser" >User Login</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="UserRegister">New User</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>                    
                        {renderTabContent()}  
                    </Card.Body>
                </Card>
                
            </Col>         
        </Container>
);
};

export default UserLogin;
