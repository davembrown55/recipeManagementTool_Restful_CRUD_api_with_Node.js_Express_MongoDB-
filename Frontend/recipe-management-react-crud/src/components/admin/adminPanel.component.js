import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { Container, Col, Card, Nav   } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';


const AdminPanel = () => {
    const { themeVariants } = useTheme(); 
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab ] = useState("adminTab1");

    // default  
    // useEffect(() => {
    //     if (location.pathname === "/login") {
    //         navigate("/login/existingUser");
    //     }
    // }, [location, navigate]);

    const handleSelect = (selectedKey) => {
        setActiveTab(selectedKey);
        // if (selectedKey === "adminTab1") {
        //     activeTab = "adminTab1";
        // } else {
        //     activeTab = "adminTab2";
        // }
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
                                <Nav.Link eventKey="adminTab1" >Admin Tab 1</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="adminTab2">Admin Tab 2</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>                    
                        <h1>ADMIN</h1>
                    </Card.Body>
                </Card>
                
            </Col>         
        </Container>
);
};

export default AdminPanel;
