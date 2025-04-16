import { FastifyInstance } from 'fastify';
import { GenericDataController } from '../controllers/GenericDataController';
import { SaveDataRequest, GetDataResponse, GetDataListResponse } from '../schemas/GenericDataSchema';

export async function genericDataRoutes(fastify: FastifyInstance, controller: GenericDataController) {

  fastify.post<{
    Body: { type: string; data: Record<string, any> };
    Reply: any;
  }>('/data', {
    schema: {
      body: SaveDataRequest,
      response: {
        201: GetDataResponse
      }
    },
    handler: (request, reply) => controller.saveData(request, reply)
  });

  fastify.get<{
    Params: { type: string; id: string };
    Reply: any;
  }>('/data/:type/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['type', 'id'],
        properties: {
          type: { type: 'string' },
          id: { type: 'string' }
        }
      },
      response: {
        200: GetDataResponse
      }
    },
    handler: (request, reply) => controller.getData(request, reply)
  });

  fastify.get<{
    Params: { type: string };
    Reply: any[];
  }>('/data/:type', {
    schema: {
      params: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string' }
        }
      },
      response: {
        200: GetDataListResponse
      }
    },
    handler: (request, reply) => controller.getAllData(request, reply)
  });

  fastify.get('/history', {
    schema: {
      response: {
        200: GetDataListResponse
      },
      description: 'Get history of all external API calls'
    },
    handler: (request, reply) => controller.getExternalApiHistory(request, reply)
  });
}
