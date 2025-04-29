import fastify from 'fastify';

// Import adapters and services
import { StarWarsAPIService } from '../adapters/services/StarWarsAPIService';
import { DynamoDBCharacterRepository } from '../adapters/repositories/dynamodb/DynamoDBCharacterRepository';
import { DynamoDBGenericRepository } from '../adapters/repositories/dynamodb/DynamoDBGenericRepository';

import { CharacterService } from '../../application/services/CharacterService';
import { GenericDataService } from '../../application/services/GenericDataService';
import { CharacterController } from './controllers/CharacterController';
import { GenericDataController } from './controllers/GenericDataController';
import { characterRoutes } from './routes/characterRoutes';
import { genericDataRoutes } from './routes/genericDataRoutes';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import caching from '@fastify/caching';
import sensible from '@fastify/sensible';

export const server = fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

// Register plugins
server.register(cors);
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
server.register(caching);
server.register(sensible);

// Log route registration
server.addHook('onRoute', (routeOptions) => {
  console.log(`Route registered: ${routeOptions.url} [${routeOptions.method}]`);
});

// Swagger documentation
server.register(swagger, {
  swagger: {
    info: {
      title: 'Star Wars API Challenge',
      description: 'Star Wars API integration with TMDB API',
      version: '1.0.0',
    },
    host: process.env.API_HOST || 'localhost:3000',
    schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'characters', description: 'Star Wars Characters' },
      { name: 'data', description: 'Generic Data Operations' }
    ]
  }
});

// Setup documentation
const setupDocumentation = async () => {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const fs = await import('fs');

    // Serve static files
    const serveStaticFile = async (request: any, reply: any, filename: string, contentType: string) => {
      try {
        const filePath = `/var/task/node_modules/swagger-ui-dist/${filename}`;
        console.log(`Trying to read file from: ${filePath}`);
        const content = await fs.promises.readFile(filePath, 'utf8');
        reply
          .header('Cache-Control', 'public, max-age=31536000')
          .type(contentType)
          .send(content);
      } catch (error) {
        console.error(`Error serving static file ${filename}:`, error);
        reply.status(404).send();
      }
    };

    // Serve static files
    server.get('/documentation/static/swagger-ui.css', async (request, reply) => {
      await serveStaticFile(request, reply, 'swagger-ui.css', 'text/css');
    });

    server.get('/documentation/static/swagger-ui-bundle.js', async (request, reply) => {
      await serveStaticFile(request, reply, 'swagger-ui-bundle.js', 'application/javascript');
    });

    server.get('/documentation/static/swagger-ui-standalone-preset.js', async (request, reply) => {
      await serveStaticFile(request, reply, 'swagger-ui-standalone-preset.js', 'application/javascript');
    });
  }

  // Register Swagger UI
  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true
    },
    staticCSP: false
  });


};

// Initialize documentation
void setupDocumentation().catch(error => {
  console.error('Error setting up documentation:', error);
});

// Initialize services and controllers
const starWarsAPI = new StarWarsAPIService();
const characterRepository = new DynamoDBCharacterRepository();
const genericRepository = new DynamoDBGenericRepository();

const characterService = new CharacterService(characterRepository, starWarsAPI);
const genericDataService = new GenericDataService(genericRepository);

const characterController = new CharacterController(characterService);
const genericDataController = new GenericDataController(genericDataService);

// Register routes
const registerRoutes = async () => {
  try {
    console.log('Registering routes...');
    
    // Register all routes under /api/v1 prefix
    await server.register(async (fastify) => {
      // Register character routes
      console.log('Registering character routes...');
      await characterRoutes(fastify, characterController);
      console.log('Character routes registered successfully');

      // Register generic data routes
      console.log('Registering generic data routes...');
      await genericDataRoutes(fastify, genericDataController);
      console.log('Generic data routes registered successfully');
    }, { prefix: '/api/v1' });

  } catch (error) {
    console.error('Error registering routes:', error);
    throw error;
  }
};

// Initialize routes
void registerRoutes();

// Health check route
server.get('/health', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
  handler: async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  },
});
