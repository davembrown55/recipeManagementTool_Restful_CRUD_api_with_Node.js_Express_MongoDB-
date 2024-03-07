module.exports = (mongoose, mongoosePaginate) => {
    var schema = mongoose.Schema(
        {
            title: String,
            description: String,
            ingredients: Array,
            instructions: Array,
            cookingTimeMinutes: Number,
            published: Boolean

        },
        {timestamps: true}
    );

    // Custom without version (__v), replacing _id with id. Not required after Mongoose version 5

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    schema.plugin(mongoosePaginate); 

    const Recipe = mongoose.model("recipe", schema);
    return Recipe;
};

// module.exports = (mongoose, mongoosePaginate) => {
    
//     const Recipe = mongoose.model(
//         "recipe",
//         mongoose.Schema(    
//             {
//                 title: String,
//                 description: String,
//                 ingredients: Array,
//                 instructions: Array,
//                 cookingTimeMinutes: Number,
//                 published: Boolean

//             },
//             {timestamps: true}
            
//         )
//     );
//     // Recipe.plugin(mongoosePaginate);
//     return Recipe;
    
// };

