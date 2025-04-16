import { IGenericRepository } from '../../domain/ports/repositories/IGenericRepository';

export class GenericDataService {
  constructor(private readonly repository: IGenericRepository) {}

  async saveData(data: any): Promise<any> {
    return await this.repository.save(data);
  }

  async getData(id: string, type: string): Promise<any | null> {
    return await this.repository.findById(id, type);
  }

  async getAllData(type: string) {
    return this.repository.findAll(type);
  }

  async getExternalApiHistory() {
    const [characters, movies] = await Promise.all([
      this.repository.findAll('character'),
      this.repository.findAll('movie')
    ]);

    const allData = [...characters, ...movies].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allData;
  }
}
