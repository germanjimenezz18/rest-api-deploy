const express = require("express");
const movies = require("./movies.json");
const crypto = require("crypto");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");
const { error } = require("console");
const app = express();
app.disable("x-powered-by");
app.use(express.json());

const PORT = process.env.PORT ?? 1234;
const ACCEPTED_ORIGINS = [
  'http://localhost:8080',  'http://localhost:1234', 'http://192.168.1.148:8080'
]


app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
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


app.get("/", (req, res) => {
  res.json({ msg: "hola mundo" });
});

// todos los recuersos que sean movies se identifican con /movies
app.get("/movies", (req, res) => {

 
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  //path to regexp
  // :id es un parametro
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);

  if (movie) return res.json(movie);
  res.status(404).json({ msg: "Movie not found" });
});

app.post("/movies", (req, res) => {
  const { title, genre, year, director, duration, rate, poster } = req.body;

  const result = validateMovie(req.body);
  if (result.error) return res.status(400).json({error : JSON.parse(result.error.message)});

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

 
app.delete('/movies/:id', (req, res) => {

  const origin = req.header('origin')
  if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    res.header("Access-Control-Allow-Origin", origin );
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})


app.patch('/movies/:id', (req, res)=>{
    const {id} = req.params
    const movieIndex = movies.findIndex( movie => movie.id === id)
    if(movieIndex === -1 ) return res.status(404).json({msg : 'Movie not found'})

    const result = validatePartialMovie(req.body)
    if(result.error) return res.status(400).json({error : JSON.parse(result.error.message)})

    // si alguna propiedad existe en el body, la actualizo
    const updatedMovie = {...movies[movieIndex], ...result.data}
    // actualizo la pelicula en el array
    movies[movieIndex] = updatedMovie
    // devuelvo la pelicula actualizada
    return res.json(updatedMovie)
})


app.delete('/movies/:id', (req, res) => {
  const {id} = req.params

  const movie = movies.find(movie => movie.id === id)
  if(!movie) return res.status(400).json({msg: ' movie not found'})

  movies

} )




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
