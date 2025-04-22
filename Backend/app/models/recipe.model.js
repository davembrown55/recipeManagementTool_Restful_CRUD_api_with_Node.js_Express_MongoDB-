module.exports = (mongoose, mongoosePaginate) => {
    var schema = mongoose.Schema(
        {
            title: String,
            description: String,
            ingredients: Array,
            instructions: Array,            
            cookingTimeMinutes: Number,
            diets: Array,
            mealTypes: Array,
            published: Boolean,
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
        {timestamps: true}
    );

    // Custom without version (__v), replacing _id with id. Not required after Mongoose version 5
    // remove userID from reponse and replace with username

    schema.method("toJSON", function() {
        const { __v, _id, userId, ...rest } = this.toObject();        
        rest.id = _id;

        
        if(userId && typeof userId === 'object' && userId.username) {
            rest.username = userId.username;
        }
        return rest;
    });

    schema.plugin(mongoosePaginate); 

    const Recipe = mongoose.model("recipe", schema);
    return Recipe;
};


