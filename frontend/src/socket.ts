import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
console.log("Connecting to Socket.IO server at:", URL);

export const socket = io(URL);

// Add cleanup on page unload
window.addEventListener("beforeunload", () => {
  socket.emit("leaveRoom");
});

// Handle disconnect events
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("playerLeft", (data) => {
  console.log("Player left:", data);
  // Handle player leaving - update UI accordingly
});

socket.on("hostChanged", (data) => {
  console.log("New host:", data);
  // Handle host change - update UI accordingly
});

socket.on("roomClosed", () => {
  console.log("Room was closed");
  // Redirect to home page
  window.location.href = "/";
});
