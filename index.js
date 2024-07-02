const fs = require('fs');
const axios = require('axios');
const { G4F } = require('g4f');
const { gpt } = require('gpti');
const { bing } = require('gpti');
const { search } = require('pinterest-dl');
const { Hercai } = require('hercai');
const { RsnChat } = require("rsnchat");
const { imagine } = require('@shuddho11288/sdxl-imagine');
const movieInfo = require('movie-info');
const jarifapi = require('jarif-api');
const ainasepics = require('ainasepics');
const express = require('express');
const app = express();
const rsnchat = new RsnChat("rsnai_ykZc1pfP2VnLLog34eFgWZI1");
const herc = new Hercai(); // Initialize Hercai

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Array to store request timestamps
const requestTimestamps = [];

app.get("/api/copilot", async (req, res) => {
  try {
    const { prompt } = req.query;
    
    const response = await axios.get(`https://joshweb.click/bing?prompt=${encodeURIComponent(prompt)}&model=1`);
    const answer = response.data.bing;
    res.json({ answer: answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sdxl', async (req, res) => {
    const { prompt, model } = req.query;

    if (!prompt || !model) {
        return res.status(400).json({ error: 'Please provide a prompt with styles.' });
    }

    try {
        const baseURL = `https://joshweb.click/sdxl?q=${prompt}&style=${model}`;
        const response = await axios.get(baseURL, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/api/wallpaper", async (req, res) => {
    const { query } = req.query;
    const number = parseInt(req.query.number; // Parse the limits parameter, default to 20

    if (!query || !number) {
        return res.status(400).json({ error: 'Please provide a query with number of images' });
    }

    if (isNaN(number) || number <= 0) {
        return res.status(400).json({ error: 'Please provide a valid limits value' });
    }

    try {
        const response = await axios.get(`https://pixabay.com/api/?q=${query}&image_type=photo&per_page=${number}&key=39178311-acadeb32d7e369897e41dba06`);

        res.json({ urls: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/promptgen', async (req, res) => {
  try {
    const { query } = req;
    const prompt = query.prompt;

    const pgen = await jarifapi.promptgen(prompt);
    res.json({ prompt: pgen.response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the prompt.' });
  }
});

app.get('/api/songinfo/v2', async (req, res) => {
  const { id } = req.query; // Change 'prompt' to 'q'

  try {
    const response = await axios.get(`https://bhtvdidbd.onrender.com/api/songinfo`, {
      params: {
        id: encodeURIComponent(id) // encodeURIComponent the query parameter
      }
    });

    const answer = response.data;
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/videoinfo', async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get(`https://bhtvdidbd.onrender.com/api/videoinfo/v3`, {
      params: {
        q: encodeURIComponent(query) // encodeURIComponent the query parameter
      }
    });

    const answer = response.data;
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/movieinfo', (req, res) => {
    const title = req.query.title; // Extract the title from query parameters

    if (!title) {
        return res.status(400).send({ error: 'Movie title is required' });
    }

    movieInfo(title, (error, response) => {
        if (error) {
            console.error(error);
            res.status(500).send({ error: 'An error occurred while fetching the movie info' });
        } else {
            res.send(response);
        }
    });
});

app.get("/api/dalle", (req, res) => {
  const prompt = req.query.prompt || cat;
  const amount = parseInt(req.query.amount) || 1;

  if (!prompt) {
    return res.status(400).send("Error: Please provide a prompt query parameter.");
  }

  if (amount < 1 || amount > 4) {
    return res.status(400).send("Error: Amount must be between 1 and 4.");
  }

  const promises = [];

  for (let i = 0; i < amount; i++) {
    promises.push(rsnchat.dalle(prompt));
  }

  Promise.all(promises)
    .then((responses) => {
      const images = responses.map(response => response.image.url);
      res.send({ images });
    })
    .catch((error) => {
      res.status(500).send("An error occurred: " + error.message);
    });
});

app.get('/api/llama', (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send("Error: Please provide a prompt query parameter.");
  }

  rsnchat.llama(prompt)
    .then((response) => {
      res.send({ answer: response.message });
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
    });
});

app.get('/api/mixtral', (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send("Error: Please provide a prompt query parameter.");
  }

  rsnchat.mixtral(prompt)
    .then((response) => {
      res.send({ answer: response.message });
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
    });
});

app.get('/api/pinterest', async (req, res) => {
    const query = req.query.query; // Get the search query from the query parameters
    const limits = parseInt(req.query.limits, 10); // Parse the search limit from the query parameters

    if (!query) {
        return res.status(400).send('Please provide a search query, e.g., /pinterest?query=cat&limits=10');
    }

    if (isNaN(limits) || limits <= 0) {
        return res.status(400).send('Please provide a valid search limit, e.g., /pinterest?query=cat&limits=10');
    }

    try {
        const data = await search(query);
        res.json({ urls: data.slice(0, limits) }); // Limit the number of results
    } catch (error) {
        res.status(500).send('Error processing the search query.');
    }
});

app.get('/api/movieinfo/v2', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=35781046b4bc42f91068a15caab2cdda&append_to_response=credits`);

    const movieData = response.data;
    const genres = movieData.genres.map(genre => genre.name).join(", ");
    const productionCountries = movieData.production_countries.map(country => country.name).join(", ");
    const spokenLanguages = movieData.spoken_languages.map(language => language.name).join(", ");
    const director = movieData.credits.crew.find(person => person.job === "Director")?.name || "N/A";
    const cast = movieData.credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
    const productionCompanies = movieData.production_companies.map(company => company.name).join(", ");

    const movieInfo = {
      title: movieData.title || "N/A",
      original_title: movieData.original_title || "N/A",
      year: new Date(movieData.release_date).getFullYear() || "N/A",
      tagline: movieData.tagline || "N/A",
      genre: genres || "N/A",
      plot: movieData.overview || "N/A",
      vote_average: movieData.vote_average || "N/A",
      vote_count: movieData.vote_count || "N/A",
      popularity: movieData.popularity || "N/A",
      original_language: movieData.original_language || "N/A",
      adult: movieData.adult ? "Yes" : "No",
      runtime: movieData.runtime || "N/A",
      director: director,
      cast: cast,
      production_companies: productionCompanies,
      budget: movieData.budget ? `$${movieData.budget.toLocaleString()}` : "N/A",
      revenue: movieData.revenue ? `$${movieData.revenue.toLocaleString()}` : "N/A",
      production_countries: productionCountries || "N/A",
      spoken_languages: spokenLanguages || "N/A",
      homepage: movieData.homepage || "N/A",
      movie_id: movieData.id || "N/A",
      details_link: `https://www.themoviedb.org/movie/${movieData.id || ""}`
    };

    res.json(movieInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gemini', (req, res) => {
  // Extract the question from the query parameters
  const prompt = req.query.prompt;

  // Call the gemini method of rsnchat with the provided question
  rsnchat.gemini(prompt).then((response) => {
    // Send the response message back to the client
    res.send({ answer: response.message });
  }).catch((error) => {
    // Handle any errors
    console.error("An error occurred:", error);
    res.status(500).send('Internal Server Error');
  });
});

app.get('/api/gen', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).send('Query parameter "q" is required');
    }

    imagine(query).then(data => {
        res.json({ url: data.final_result });
    }).catch(err => {
        console.error(err);
        res.status(500).send('Error processing the request');
    });
});

app.get('/api/fbstalk', async (req, res) => {
const { uid, token } = req.query;

  try {
    const response = await axios.get(`https://graph.facebook.com/${uid}?fields=id,is_verified,cover,created_time,work,hometown,username,link,name,locale,location,about,website,birthday,gender,relationship_status,significant_other,quotes,first_name,subscribers.limit(0)&access_token=${token}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pexels', async (req, res) => {
  try {
    const { query, number } = req.query;
    const apiKey = 'NoL8ytYlwsYIqmkLBboshW909HzoBoBnGZJbpmwAcahp5PF9TAnr9p7Z';
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=${number}`;

    const headers = {
      'Authorization': apiKey
    };

    const { data } = await axios.get(url, { headers });

    const result = data.photos.map(photo => photo.src.original);

    res.json({ images: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/4k', async (req, res) => {
           const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Please provide a image url...' });
    }

  try {
              const baseURL = `https://www.api.vyturex.com/upscale?imageUrl=${url}`;
              const response = await axios.get(baseURL, { responseType: 'stream' });
              response.data.pipe(res);
          } catch (error) {
              console.error('Error', error);
              res.status(500).json({ error: 'Internal server error' });
          }
      });

app.get('/api/sim', async (req, res) => {
     const { chat, lang } = req.query;

    if (!chat) {
        return res.status(400).json({ error: 'Please provide a message or language' });
    }

  try {
        const baseURL = `https://sandipbaruwal.onrender.com/sim?chat=${chat}&lang=${lang}`;
        
const response = await axios.get(baseURL);

const answer = response.data.answer;

    res.json({ chat: answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/lyrics", async (req, res) => {
  const songName = req.query.songName;
  if (!songName) {
    return res.status(400).json({ error: 'Please provide a song name!' });
  }

  const apiUrl = `https://lyrist.vercel.app/api/${songName}`;
  try {
    const response = await axios.get(apiUrl);
    const { lyrics, title, artist, image } = response.data;

    if (!lyrics) {
      return res.status(404).json({ error: 'Lyrics not found!' });
    }

    return res.status(200).json({ lyrics, title, artist, image });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error!' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
