import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
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
    Params: { id: string };
    Reply: typeof GetCharacterResponse['static'] | { error: string; message: string };
  }>('/characters/:id', {
    schema: {
      params: GetCharacterParams,
      response: {
        200: GetCharacterResponse,
        404: Type.Object({
          error: Type.String()
        }),
        500: Type.Object({
          error: Type.String(),
          message: Type.String()
        })
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params;

      if (!id || id === '/') {
        return reply.redirect('/api/v1/characters');
      }
      
      try {
        return await controller.getCharacter(request, reply);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ 
          error: 'Internal Server Error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}
