import { IGenericRepository } from '../../domain/ports/repositories/IGenericRepository';

export class GenericDataService {
  constructor(private readonly repository: IGenericRepository) {}

  async saveData(data: any): Promise<any> {
    return await this.repository.save(data);
  }

  async getData(id: string, type: string): Promise<any | null> {
    return await this.repository.findById(id, type);
  }

  async getAllData(type: string): Promise<any[]> {
    return await this.repository.findAll(type);
  }
}
