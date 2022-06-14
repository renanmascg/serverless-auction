import { v4 as uuidV4 } from 'uuid'
import AWS from 'aws-sdk'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);

  const auction = {
    id: uuidV4(),
    title,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };

  await dynamoDb.put({
    TableName: 'AuctionsTable',
    Item: auction,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(
      { auction },
      null,
      2
    ),
  };
};

export const handler = createAuction;
