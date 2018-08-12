const Path = require('path');
const Hapi = require('hapi');
const Nunjucks = require('nunjucks')
// const uuid = require('uuid');
const Inert = require('inert');
const fs = require('fs');

// const NunjucksHapi = require('nunjucks-hapi')
const vision = require('vision')


const server = new Hapi.Server({
  port: 8000,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public')
    }
  }
});

const provision = async () => {

  await server.register(Inert);
  await server.register(vision);

  server.views({
    engines: {
      html: {
        compile: (src, options) => {

          const template = Nunjucks.compile(src, options.environment);

          return (context) => {

            return template.render(context);
          };
        },

        prepare: (options, next) => {

          options.compileOptions.environment = Nunjucks.configure(options.path, {
            watch: false
          });

          return next();
        }
      }
    },
    relativeTo: __dirname,
    path: 'templates/nunjucks'
  });

  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: '.',
        // redirectToSlash: true,
        // index: true,
        listing: false
      }
    }
  });

  server.route({
    path: '/',
    method: 'GET',
     handler: {
      file: './index.html'
    }
  });

  server.route({
    method: 'GET',
    path: '/nunjucks',
    handler: (request, h) => {
      return h.view('index', {
        title: './templates/nunjucks | Hapi ' + request.server.version,
        message: 'Hello Nunjucks!'
      });
    }
  });

  await server.start();

  console.log('Server running at:', server.info.uri);
};

function newCardHandler(request, reply) {
  if (request === 'GET') {
    //
  }
}

function loadCards() {
  const file = fs.readFileSync('./cards.json');
  return JSON.parse(file.toString());
}

function mapImages() {
  return fs.readdirSync('./public/images/card')
}

provision();