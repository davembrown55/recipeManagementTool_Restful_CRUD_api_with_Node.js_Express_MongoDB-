import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { Container, Col, Card, Nav   } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';


const UserProfile = () => {
    const { themeVariants } = useTheme(); 
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab ] = useState("userTab1");


    const handleSelect = (selectedKey) => {
        setActiveTab(selectedKey);

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
                                <Nav.Link eventKey="userTab1" >User Tab 1</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="userTab2">User Tab 2</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>                    
                        <h1>User Profile</h1>
                    </Card.Body>
                </Card>
                
            </Col>         
        </Container>
);
};

export default UserProfile;
