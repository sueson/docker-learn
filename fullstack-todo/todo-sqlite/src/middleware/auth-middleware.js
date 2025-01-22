import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function authMiddleware (req, res, next) {
    const token = req.headers['authorization'];
    console.log(token);

    if(!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Id is encoded in the token, so with the decoded id, can get the user id...
        req.userId = decoded.id;
        console.log('Decoded ID:', decoded.id);
        // after clearing the security checks, next allows to hit the endpoint...
        next();
    })
}

export default authMiddleware;