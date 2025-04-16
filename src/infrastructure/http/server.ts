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

// Swagger documentation
server.register(swagger, {
  swagger: {
    info: {
      title: 'Star Wars API Challenge',
      description: 'Star Wars API integration with Jokes API',
      version: '1.0.0',
    },
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    basePath: '/api/v1'
  },
});

server.register(swaggerUi, {
  routePrefix: '/api/v1/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true
});

// Initialize dependencies
const starWarsAPI = new StarWarsAPIService();
const characterRepository = new DynamoDBCharacterRepository();
const characterService = new CharacterService(characterRepository, starWarsAPI);
const characterController = new CharacterController(characterService);

// Generic data handling
const genericRepository = new DynamoDBGenericRepository();
const genericDataService = new GenericDataService(genericRepository);
const genericDataController = new GenericDataController(genericDataService);

// Register routes
server.register(async (fastify) => {
  await characterRoutes(fastify, characterController);
  await genericDataRoutes(fastify, genericDataController);
}, { prefix: '/api/v1' });

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
