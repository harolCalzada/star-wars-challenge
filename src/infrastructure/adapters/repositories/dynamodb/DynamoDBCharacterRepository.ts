import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Character } from '../../../../domain/entities/Character';
import { ICharacterRepository } from '../../../../domain/ports/repositories/ICharacterRepository';
import { dynamoDb, TABLE_NAME } from './config/dynamodb';

export class DynamoDBCharacterRepository implements ICharacterRepository {
  async findById(id: string): Promise<Character | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );

    return result.Item as Character || null;
  }

  async findAll(): Promise<Character[]> {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'id > :empty',
        ExpressionAttributeValues: {
          ':empty': ''
        }
      })
    );

    return (result.Items || []) as Character[];
  }

  async save(character: Character): Promise<void> {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: character
      })
    );
  }

  async update(id: string, character: Partial<Character>): Promise<void> {
    const updateExpression = Object.keys(character)
      .map(key => `#${key} = :${key}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(character).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    );

    const expressionAttributeValues = Object.entries(character).reduce(
      (acc, [key, value]) => ({ ...acc, [`:${key}`]: value }),
      {}
    );

    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      })
    );
  }

  async delete(id: string): Promise<void> {
    await dynamoDb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );
  }
}
