
import awsLambdaFastify from '@fastify/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { server } from '../http/server';

let proxy: (event: APIGatewayProxyEvent, context: Context) => Promise<any>;

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log('Lambda event:', JSON.stringify(event, null, 2));
  
  if (!proxy) {
    console.log('Initializing Fastify proxy...');
    proxy = awsLambdaFastify(server, {
      serializeLambdaArguments: false,
    });
    console.log('Fastify proxy initialized');
  }

  try {
    const response = await proxy(event, context);
    console.log('Lambda response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error in Lambda handler:', error);
    throw error;
  }
};
