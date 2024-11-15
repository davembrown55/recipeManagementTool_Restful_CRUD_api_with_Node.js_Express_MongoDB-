

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        axios.get('/recipes/my')
            .then(response => setRecipes(response.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>My Recipes</h2>
            {/* Render recipes */}
        </div>
    );
};
