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

  async getFirstPageCharacters(request: FastifyRequest, reply: FastifyReply) {
    try {
      const characters = await this.characterService.getFirstPageCharacters();
      return reply.send(characters.map(CharacterMapper.toListItemDTO));
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error fetching characters');
    }
  }
}
