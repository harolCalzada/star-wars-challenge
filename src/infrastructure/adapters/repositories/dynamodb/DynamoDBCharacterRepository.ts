import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Character } from '../../../../domain/entities/Character';
import { ICharacterRepository } from '../../../../domain/ports/repositories/ICharacterRepository';
import { dynamoDb, TABLE_NAME } from './config/dynamodb';

export class DynamoDBCharacterRepository implements ICharacterRepository {
  async findById(id: string, type: string = 'character'): Promise<Character | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id, type: 'character' }
      })
    );

    return result.Item?.data as Character || null;
  }

  async findAll(): Promise<Character[]> {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':type': 'character'
        }
      })
    );

    return (result.Items || []).map(item => item.data as Character);
  }

  async save(character: Character): Promise<Character> {
    const timestamp = new Date().toISOString();
    const item = {
      id: character.id,
      type: 'character',
      data: character,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      })
    );

    return character;
  }

  async update(character: Character): Promise<Character> {
    const timestamp = new Date().toISOString();
    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: character.id, type: 'character' },
        UpdateExpression: 'set #data = :data, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#data': 'data'
        },
        ExpressionAttributeValues: {
          ':data': character,
          ':updatedAt': timestamp
        }
      })
    );

    return character;
  }

  async delete(id: string): Promise<void> {
    await dynamoDb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id, type: 'character' }
      })
    );
  }
}
