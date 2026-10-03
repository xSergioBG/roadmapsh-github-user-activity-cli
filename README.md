# GitHub User Activity CLI 〽️

*https://roadmap.sh/projects/github-user-activity*

Este proyecto permite obtener las actividades recientes de un usuario de GitHub desde la línea de comandos, utilizando la API de GitHub.

## Requisitos

- Node.js instalado en tu equipo.

## Instalación

1. Clona este repositorio en tu equipo.

   ```bash
   git clone https://github.com/xSergioBG/roadmapsh-github-user-activity-cli.git
   ```

2. Dirígete a la carpeta del proyecto:

   ```bash
   cd roadmapsh-github-user-activity-cli
   ```

## Uso

Para usar la herramienta, simplemente ejecuta el archivo `index.js` con el nombre de usuario de GitHub como argumento:

```bash
node index.js <nombre-de-usuario>
```

Por ejemplo, para ver las actividades recientes de un usuario llamado `octocat`, ejecuta:

```bash
node index.js octocat
```

### Tipos de eventos mostrados

- **PushEvent**: Cuando el usuario realiza un `push` a un repositorio.
- **IssuesEvent**: Cuando el usuario abre un `issue` en un repositorio.
- **WatchEvent**: Cuando el usuario da `star` a un repositorio.
- **PullRequestEvent**: Cuando el usuario abre un `pull request` en un repositorio.

## Errores y límites

Requiere Node.js 22 o posterior. Consulta la primera página de actividad pública reciente, sin token ni acceso a actividad privada. No es un historial completo.

El usuario inexistente, los límites de API, los fallos de red y las respuestas inválidas generan mensajes de error y código de salida 1. La espera de red está limitada a 10 segundos.

## Pruebas

```sh
npm test
```

Las pruebas no llaman a GitHub: cubren respuestas, errores y la presentación correcta de eventos abiertos o cerrados.
