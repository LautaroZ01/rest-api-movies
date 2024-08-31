const z = require('zod');

const moviesSchema = z.object({
    title: z.string({
        invalid_type_error: "El titulo de la pelicula debe ser un string",
        required_error: 'El titulo de la pelicula es obligatorio'
    }),
    year: z.number().int().min(1800).max(2025),
    director: z.string(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: 'El poster debe ser una URL'
    }).endsWith('.jpg'),
    genre: z.array(z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-F1', 'Crime']), {
        required_error: 'El genero es obligatorio',
        invalid_type_error: 'Los generos de la pelicula deben ser de tipo Genero'
    })
})

function validatMovies (object){
    return moviesSchema.safeParse(object)
}

function validatParcialMovie(object){
    return moviesSchema.partial().safeParse(object)
}

module.exports = {
    validatMovies,
    validatParcialMovie
}