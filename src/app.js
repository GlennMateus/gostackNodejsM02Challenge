const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(cors());
app.use(express.json());

const repositories = [];

// My middleware
function logRequests(req, res, next) {
  const { method, url } = req;
  const { title, owner } = req.query;
  const { id } = req.params;

  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

app.use(logRequests)

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  if (!(title && url && techs)) {
    return response.status(400).json({ message: 'All fields are required!' });
  }
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };
  repositories.push(repository);

  return response.json(repository);
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (repoIndex < 0)
    return response.status(400).json({ message: 'Repository not found!' });

  repositories[repoIndex].likes++;

  return response.json(repositories[repoIndex]);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (request.body.likes)
    return response.json({ likes: repositories[repoIndex].likes })
  if (repoIndex < 0)
    return response.status(400).json({ message: 'Repository not found!' });

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repoIndex].likes
  };

  repositories[repoIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (repoIndex < 0)
    return res.status(400).json({ message: 'Repository not found!' });

  repositories.splice(repoIndex, 1);

  return res.status(204).send();
});


module.exports = app;
