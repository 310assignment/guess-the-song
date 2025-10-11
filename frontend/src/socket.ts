import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
console.log("Connecting to Socket.IO server at:", URL);

export const socket = io(URL);