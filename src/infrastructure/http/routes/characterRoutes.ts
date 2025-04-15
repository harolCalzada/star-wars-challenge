import { FastifyInstance } from 'fastify';
import { CharacterController } from '../controllers/CharacterController';
import { GetCharacterParams, GetCharacterResponse, GetCharactersResponse } from '../schemas/CharacterSchema';

export async function characterRoutes(fastify: FastifyInstance, controller: CharacterController) {
  // Configurar para manejar barras finales
  await fastify.register(import('@fastify/sensible'));

  // Ruta para listar personajes (con o sin barra final)
  const listHandler = (request: any, reply: any) => controller.getCharactersByPage(request, reply);
  
  fastify.get<{
    Querystring: { page?: string };
    Reply: typeof GetCharactersResponse['static'];
  }>('/characters', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', pattern: '^[0-9]+$' }
        }
      },
      response: {
        200: GetCharactersResponse
      }
    },
    handler: listHandler
  });

  fastify.get('/characters/', listHandler);

  fastify.get<{
    Params: typeof GetCharacterParams['static'];
    Reply: typeof GetCharacterResponse['static'];
  }>('/characters/:id', {
    schema: {
      params: GetCharacterParams,
      response: {
        200: GetCharacterResponse
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      if (!id || id === '/') {
        return reply.redirect('/api/v1/characters');
      }
      
      return controller.getCharacter(request, reply);
    }
  });
}
