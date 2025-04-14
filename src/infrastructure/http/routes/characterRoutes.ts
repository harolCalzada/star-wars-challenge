import { FastifyInstance } from 'fastify';
import { CharacterController } from '../controllers/CharacterController';
import { GetCharacterParams, GetCharacterResponse, GetCharactersResponse } from '../schemas/CharacterSchema';

export async function characterRoutes(fastify: FastifyInstance, controller: CharacterController) {
  fastify.get<{
    Reply: typeof GetCharactersResponse['static'];
  }>('/characters', {
    schema: {
      response: {
        200: GetCharactersResponse
      }
    },
    handler: (request, reply) => controller.getFirstPageCharacters(request, reply)
  });

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
    handler: (request, reply) => controller.getCharacter(request, reply)
  });
}
