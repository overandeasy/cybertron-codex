import jwt from 'jsonwebtoken';

const generateToken = (userId: string, email: string) => {
    const token = jwt.sign({ sub: userId, email }, process.env.JWT_SECRET as string, {
        expiresIn: '24h',
    });
    return token;
};

export default generateToken;
