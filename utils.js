const request = require('superagent');

const { RIJKMUSEUM } = process.env;

export async function getArtworks(search) {
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
