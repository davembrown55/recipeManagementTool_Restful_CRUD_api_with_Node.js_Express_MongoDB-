import React, { useState, useEffect } from "react";
import RecipeDataService from "../../services/recipe.service";
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { useTheme} from '../../common/ThemeProvider';

const UserRegister = () => {

    return (
    <Container>Register New User</Container>
);
};

export default UserRegister;
