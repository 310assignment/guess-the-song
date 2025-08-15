import dotenv from "dotenv";

dotenv.config();

//check if required environment variables are set
const required = ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

//export environment variables - non-null assertion operator (!) is used to assert that these variables are defined
export const ENV = {
  PORT: Number(process.env.PORT) || 8080,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!
};