import { v4 as uuidV4 } from 'uuid'
import AWS from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {

  const { title } = event.body;

  const auction = {
    id: uuidV4(),
    title,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    highestBid: {
      amount: 0,
    }
  };

  try {
    await dynamoDb.put({
      TableName: 'AuctionsTable',
      Item: auction,
    }).promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error)
  }
  

  return {
    statusCode: 200,
    body: JSON.stringify(
      { auction },
      null,
      2
    ),
  };
};

export const handler = commonMiddleware(createAuction);
