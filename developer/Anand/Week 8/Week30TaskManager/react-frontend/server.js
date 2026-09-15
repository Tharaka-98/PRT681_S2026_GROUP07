const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 5173);
const apiUrl = process.env.API_URL || "http://localhost:5000/api/tasks";
const root = __dirname;

const contentTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jsx": "text/babel"
};

const server = http.createServer((request, response) => {
  if (request.url === "/config.js") {
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.end(`window.TASK_API_URL = ${JSON.stringify(apiUrl)};`);
    return;
  }

  const requestedPath = request.url === "/" ? "/index.html" : request.url;
  const filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "text/plain"
    });
    response.end(content);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Frontend running on port ${port}; API: ${apiUrl}`);
});
