const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const request = require('superagent');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const { RIJKMUSEUM } = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

async function getArtworks(search) {
  const response = await request.get(`https://www.rijksmuseum.nl/api/nl/collection?key=${RIJKMUSEUM}&involvedMaker=${search}
  `);

  const artworks = response.body.artObjects;

  const mapped_artworks = artworks.map((artwork) => {
    return {
      artwork_title: artwork.title,
      artist: artwork.principalOrFirstMaker,
      image: artwork.webImage.url
    };
  });

  return mapped_artworks;
}

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/search', async(req, res) => {
  try {
    const userInput = req.query.search;

    const data = await client.query(getArtworks(userInput));

    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
