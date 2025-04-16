import { FastifyRequest, FastifyReply } from 'fastify';
import { GenericDataService } from '../../../application/services/GenericDataService';

export class GenericDataController {
  constructor(private readonly dataService: GenericDataService) {}

  async saveData(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const data = await this.dataService.saveData(request.body);
      return reply.code(201).send(data);
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error saving data');
    }
  }

  async getData(request: FastifyRequest<{ Params: { id: string; type: string } }>, reply: FastifyReply) {
    try {
      const data = await this.dataService.getData(request.params.id, request.params.type);
      if (!data) {
        return reply.notFound('Data not found');
      }
      return reply.send(data);
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error fetching data');
    }
  }

  async getAllData(request: FastifyRequest<{ Params: { type: string } }>, reply: FastifyReply) {
    try {
      const data = await this.dataService.getAllData(request.params.type);
      return reply.send(data);
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error fetching data');
    }
  }

  async getExternalApiHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const history = await this.dataService.getExternalApiHistory();
      return reply.send(history);
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Error fetching history');
    }
  }
}
