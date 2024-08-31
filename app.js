const express = require("express");
const crypto = require('node:crypto');
const cors = require('cors')
const movies = require('./movies.json');
const { validatMovies, validatParcialMovie } = require('./Schemas/movies')

const app = express()

app.use(express.json())

// Instalar el middleware para solucionar el problema de cors
// npm i cors -E

app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:3000',
            'http://localhost:1234',
            'https://movies.com',
        ]

        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }
        if (!origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))

// Metodos normales: GET/HEAD/POST
// Metodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

// const ACCEPTED_ORIGINS = [
//     'http://localhost:3000',
//     'http://localhost:1234',
//     'https://movies.com',
//     'https://portafolio-ender.com',
// ]


app.get('/', (req, res) => {
    res.json({ messae: "Hola mundo" })
})

// Todos los recursos que son MOVIES se identificaon con /movies
app.get('/movies', (req, res) => {
    // const origin = res.header.origin;
    // Cuando la peticion es del mismo ORIGIN el navegador no envia el origin en el header
    // http://localhost:3000 -> http://localhost:3000

    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     // res.header('Access-Control-Allow-Origin', '*') // En lugar de * puede ir el dominio o URL que quieres que tenga acceso al recurso
    //     res.header('Access-Control-Allow-Origin', origin)
    // }

    const { genre } = req.query

    if (genre) {
        const filterMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() == genre.toLowerCase()))
        return res.json(filterMovies)
    }

    res.json(movies)
})

app.get('/movies/:id', (req, res) => { // Path-to-regexp
    const { id } = req.params;
    const movie = movies.find(movie => movie.id == id);

    if (movie) return res.json(movie)

    res.status(404).json({ message: "Movie not found" })
})

app.post('/movies', (req, res) => {

    const result = validatMovies(req.body)

    if (result.error) {
        // 422 el tipo de recurso no pasa la validaciones
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
        ...result.data
    }

    // Esto no seria REST porque estamos guardando
    // el estado de la aplicacion en memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatParcialMovie(req.body);

    if (!result.success) {
        return res.status(400).json({ error: JSON.stringify(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id == id);

    if (movieIndex == -1) {
        return res.status(400).json({ message: 'Movie not found' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    };

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id == id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
    // const origin = res.header.origin;
    // Cuando la peticion es del mismo ORIGIN el navegador no envia el origin en el header
    // http://localhost:3000 -> http://localhost:3000

    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', '*') // En lugar de * puede ir el dominio o URL que quieres que tenga acceso al recurso
    //     res.header('Access-Control-Allow-Origin', origin)
    //     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    // }
})

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`El servidor esta corriendo en el puerto: http://localhost:${PORT}`)
})