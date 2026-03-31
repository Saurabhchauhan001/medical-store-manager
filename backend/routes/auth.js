const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { parseRequiredString } = require('../utils/validation');

const router = express.Router();
let oauthClient = null;
let cachedClientId = null;

function getOauthClient(clientId) {
    if (!oauthClient || cachedClientId !== clientId) {
        oauthClient = new OAuth2Client(clientId);
        cachedClientId = clientId;
    }

    return oauthClient;
}

router.post('/google', async (req, res) => {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;

        if (!clientId) {
            return res.status(503).json({
                error: 'Google login is not configured. Add GOOGLE_CLIENT_ID to backend/.env'
            });
        }

        const credential = parseRequiredString(req.body.credential, 'Google credential');
        const client = getOauthClient(clientId);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        });
        const payload = ticket.getPayload();

        if (!payload?.email || !payload.email_verified) {
            return res.status(401).json({
                error: 'Google account could not be verified.'
            });
        }

        res.json({
            message: 'Logged in successfully.',
            user: {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                givenName: payload.given_name,
                familyName: payload.family_name,
                provider: 'google'
            }
        });
    } catch (err) {
        res.status(401).json({
            error: 'Google sign-in failed. Please try again.',
            details: err.message
        });
    }
});

module.exports = router;
