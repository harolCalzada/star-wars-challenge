import { FastifyRequest, FastifyReply } from 'fastify';
import { CharacterService } from '../../../application/services/CharacterService';
import { CharacterMapper } from '../../../application/mappers/CharacterMapper';

export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  async getCharacter(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const character = await this.characterService.getCharacter(request.params.id);
      return reply.send(CharacterMapper.toDetailDTO(character));
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error fetching character');
    }
  }

  async getCharactersByPage(request: FastifyRequest<{ Querystring: { page?: string } }>, reply: FastifyReply) {
    try {
      const page = parseInt(request.query.page || '1', 10);
      if (isNaN(page) || page < 1) {
        return reply.badRequest('Page number must be a positive integer');
      }

      const characters = await this.characterService.getCharactersByPage(page);
      return reply.send(characters.map(CharacterMapper.toListItemDTO));
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error fetching characters');
    }
  }
}
