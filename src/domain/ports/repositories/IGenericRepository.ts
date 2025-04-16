export interface IGenericRepository {
  save(data: any): Promise<any>;
  findById(id: string, type: string): Promise<any | null>;
  findAll(type: string): Promise<any[]>;
}
