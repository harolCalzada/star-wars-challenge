
import awsLambdaFastify from '@fastify/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { server } from './server';

let proxy: (event: APIGatewayProxyEvent, context: Context) => Promise<any>;

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (!proxy) {
    proxy = awsLambdaFastify(server, {
      serializeLambdaArguments: false,
    });
  }
  return proxy(event, context);
};
