import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IGenericRepository } from '../../../../domain/ports/repositories/IGenericRepository';
import { dynamoDb, TABLE_NAME } from './config/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export class DynamoDBGenericRepository implements IGenericRepository {
  async save(data: any): Promise<any> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const type = data.type || 'generic'; // Tipo por defecto si no se especifica

    const item = {
      id,
      type,
      data,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      })
    );

    return item;
  }

  async findById(id: string, type: string): Promise<any | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id, type }
      })
    );

    return result.Item || null;
  }

  async findAll(type: string): Promise<any[]> {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':type': type
        }
      })
    );

    return result.Items || [];
  }
}
