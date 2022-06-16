import commonMiddleware from '../lib/commonMiddleware';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import createError from 'http-errors'

async function cognitoLogin(event) {
    
    const { username, password } = event.body;

    const cognitoPromise = new Promise((resolve, reject) => {
        const authenticationData = {
            Username: username,
            Password: password
        }

        console.log(username, password)
    
        const authenticationDetails = new AuthenticationDetails(authenticationData);
    
        const userPool = new CognitoUserPool({
            ClientId: "YOUR_CLIENT_ID", // put in environment
            UserPoolId: "YOUR_USER_POOL_ID" // put in environment
        });
    
        const cognitoUser = new CognitoUser({
            Pool: userPool,
            Username: username
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(session) {
                session.getIdToken()
                resolve({
                    accessToken: session.getAccessToken().getJwtToken(),
                    refreshToken: session.getRefreshToken().getToken(),
                    idToken: session.getIdToken().getJwtToken()
                  });
            },
            onFailure: function(err) {
                reject(err);
            }
        })
    })

    const userStatus = cognitoPromise.then((value) => {
        return {
            statusCode: 200,
            body: JSON.stringify(value),
        }
    }).catch((err) => {
        console.log(err)
        throw new createError.Unauthorized('Username ou password incorretos.')
    });

    return userStatus
};

export const handler = commonMiddleware(cognitoLogin);
