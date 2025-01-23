const https = require("https");

// Función para obtener la actividad de un usuario de GitHub
function fetchGitHubActivity(username) {
  // URL de la API de GitHub para obtener eventos de usuario
  const url = `https://api.github.com/users/${username}/events`;

  const options = {
    headers: {
      "User-Agent": "github-activity-cli", // GitHub requiere este encabezado
    },
  };

  // Realizar la solicitud HTTP a la API de GitHub
  https
    .get(url, options, (res) => {
      let data = "";

      // Recibir los datos de la respuesta
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Cuando la respuesta esté completa
      res.on("end", () => {
        if (res.statusCode === 200) {
          const events = JSON.parse(data); // Convertir los datos JSON en un objeto
          if (events.length === 0) {
            console.log("No recent activity found for this user.");
          } else {
            // Iterar y mostrar las actividades
            events.forEach((event) => {
              const eventType = event.type;
              const repoName = event.repo.name;
              const actor = event.actor.login;

              switch (eventType) {
                case "PushEvent":
                  console.log(`Pushed to ${repoName}`);
                  break;
                case "IssuesEvent":
                  console.log(`Opened an issue in ${repoName}`);
                  break;
                case "WatchEvent":
                  console.log(`Starred ${repoName}`);
                  break;
                case "PullRequestEvent":
                  console.log(`Opened a pull request in ${repoName}`);
                  break;
                default:
                  console.log(`Other event: ${eventType} in ${repoName}`);
              }
            });
          }
        } else {
          console.error(`Error: Unable to fetch activity for ${username}.`);
        }
      });
    })
    .on("error", (err) => {
      console.error("Request failed: " + err.message);
    });
}

// Obtener el nombre de usuario desde los argumentos de la línea de comandos
const username = process.argv[2];

if (!username) {
  console.error("Please provide a GitHub username.");
  process.exit(1); // Salir con código de error si no se proporciona un usuario
}

fetchGitHubActivity(username);
