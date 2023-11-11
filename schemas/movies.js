const z = require('zod')



const movieSchema = z.object({
    title: z.string({invalid_type_error: 'Title must be a string'}),
    year : z.number().int().min(1888).max(2025),
    director : z.string(),
    duration : z.number().int().positive(),
    rate : z.number().min(0).max(10).default(5),
    poster : z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy'])
    )
})

function validateMovie(object){
    return movieSchema.safeParse(object)
}

function validatePartialMovie(object){
    return movieSchema.partial().safeParse(object)
}

module.exports = {validateMovie, validatePartialMovie}