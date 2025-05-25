import React, { useState, useEffect } from "react";
import useRecipeService from "../../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Container,Col, Button, Card, Nav, Spinner } from 'react-bootstrap';
import { useTheme} from '../../common/ThemeProvider';
import ViewRecipe from "./view-recipe";
import UpdateRecipe from "./update-recipe.component";
import { useAuth } from "../../auth/AuthContext";

const Recipe = () => {
const { id } = useParams();
const navigate = useNavigate();
const { get } = useRecipeService();
const [ canUpdate, setCanUpdate ] = useState(false); // user can update this 'recipe
const [ editMode, setEditMode ] = useState(false); // render edit view of recipe
const [ activeTab, setActiveTab ] = useState(editMode ? "edit" : "view");
const { themeVariants } = useTheme();
const [isLoading, setIsLoading] = useState(true);
const [unauthorisedModal, setUnauthorisedModal] = useState(false);
 
const { userRole, userName, verify } = useAuth();

const [currentRecipe, setCurrentRecipe] = useState({
      id: null,
      title: "",
      description: "",
      published: false,
      cookingTimeMinutes: 0,
      ingredients: [""],
      instructions: [""], 
      diets: [""],
      mealTypes: [""]
    });
  
const [prevRecipeOnDB, setPrevRecipeOnDB] = useState({
      id: null,
      title: "",
      description: "",
      published: false,
      cookingTimeMinutes: 0,
      ingredients: [""],
      instructions: [""], 
      diets: [""], 
      mealTypes: [""]
    });



useEffect(() => {   
      const getRecipe = async (idParam) => {
        try {
          const data = await get(idParam);
          if (data.status === 401) {
            // auth failed show unauthorised modal & then redirect to allRecipes
            await verify();
            setUnauthorisedModal(true); // open modal to inform user, then navigate to /recipes when user closes modal: hideUnauthorisedModal
          } else {
            const access = data.access;
            access === 'all' ? setCanUpdate(true) : setCanUpdate(false);
            const {...recipe} = data.recipe;
            if (!Array.isArray(recipe.ingredients)) {
              recipe.ingredients = [""];
            }
            if (!Array.isArray(recipe.instructions)) {
              recipe.instructions = [""];
            }
            if (!Array.isArray(recipe.diets)) {
              recipe.diets = [""];
            }
            if (!Array.isArray(recipe.mealTypes)) {
              recipe.mealTypes = [""];
            }
            
            setCurrentRecipe({ ...recipe});
            setPrevRecipeOnDB({...recipe});
          }          
    
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false); 
        }
      };  
      getRecipe(id);
  
}, [id]);    

const renderRecipe = () => {
  if (activeTab === "view") {
      return <ViewRecipe        
                currentRecipe={currentRecipe}
                themeVariants={themeVariants}    
                isLoading={isLoading}
            />;
  } else if (activeTab === "edit") {
      return <UpdateRecipe 
                currentRecipe={currentRecipe} 
                setCurrentRecipe={setCurrentRecipe}
                setPrevRecipeOnDB={setPrevRecipeOnDB}
                themeVariants={themeVariants}    
                prevRecipeOnDB={prevRecipeOnDB}    
                isLoading={isLoading}
                verify={verify}
            />;
  }    
}

const handleSelect = (selectedKey) => {
  if (selectedKey === "view") {
      setActiveTab("view");
      setEditMode(false);
  } else {
    setActiveTab("edit");
    setEditMode(true);
  }
};

const hideUnauthorisedModal = () => {  
    setUnauthorisedModal(false);    
      navigate('/Recipes');
}

return (
 
//  <Container fluid  className='list-container p-0'>
 <Container fluid className="d-flex justify-content-center">
  <Col xs={12} sm={12} md={10} lg={8} className="d-flex justify-content-center">  

  <Card
            bg={themeVariants.variant === 'dark' ? 'dark' : ''}
            variant={themeVariants.variant}
            key={themeVariants.variant}
            text={themeVariants.text}
            className="w-100"
            
  >
    <Modal
        show={unauthorisedModal}
        onHide={hideUnauthorisedModal}
        backdrop="static"
        keyboard={false}
        data-bs-theme={themeVariants['data-bs-theme']}       
        className={themeVariants.variant}
        centered
    >
        <Modal.Header  closeButton >
        <Modal.Title >Unauthorised</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          Access Denied! <br/> You may be logged out, this recipe may be set to private, or the recipe might not exist.
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={hideUnauthorisedModal}>
            Close
        </Button>
        
                                
        </Modal.Footer>
    </Modal>  
    {isLoading ? 
                  <Container className="d-flex justify-content-center gap-5 ps-0">
                    <Spinner animation="border" variant={themeVariants.text} />
                    <p>Loading...</p>        
                  </Container> 
            :
            canUpdate ? 
              <div>
                <Card.Header 
                className="loginCardHeader" 
                variant={themeVariants.variant}
                bg={themeVariants.variant === 'dark' ? 'dark' : ''}
                // className="mb-3 w-100 recipeCard"
              >
                <Nav 
                  variant="tabs" 
                  activeKey={activeTab}
                  onSelect={handleSelect}
                  data-bs-theme={themeVariants['data-bs-theme']} 
                >
                  <Nav.Item>
                      <Nav.Link eventKey="view" >View Recipe</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                      <Nav.Link eventKey="edit">Edit Recipe</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>    
              
              <Card.Body>  
              {renderRecipe()}
              </Card.Body>   
            </div>
      :
      <div>
        <ViewRecipe        
          currentRecipe={currentRecipe}
          themeVariants={themeVariants}    
        />
         
      </div>

    }                  


  </Card>
  </Col>
 </Container>





);
};

export default Recipe;