import AWS from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors'

import { getAuctionById } from './getAuction'; 

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const auction = await getAuctionById(id);

    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
    }

    const params = {
        TableName: 'AuctionsTable',
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'ALL_NEW'
    }

    let updatedAuction;

    try {
        const result = await dynamoDb.update(params).promise();
        updatedAuction = result.Attributes;
        
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError()
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
};

export const handler = commonMiddleware(placeBid);
