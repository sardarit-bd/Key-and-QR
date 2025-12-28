import { SignJWT } from "jose";

async function generateJWT(payload) {

    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d") // token valid for 1 day
        .sign(secret);

    return token;
}

export default generateJWT;
