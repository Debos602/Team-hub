"use client";

import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    // Mock socket for demo - in production, connect to real server
    socket = io("http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket"],
    });

    // Mock events for demo purposes
    const mockEvents = {
      connect: [],
      "new-post": [],
      reaction: [],
      "status-change": [],
      "user-online": [],
      "user-offline": [],
    };

    socket.on = (event, fn) => {
      if (mockEvents[event]) mockEvents[event].push(fn);
    };

    socket.emit = (event, data) => {
      // Mock: echo back for demo
      if (event === "join-workspace") {
        setTimeout(() => {
          mockEvents["user-online"]?.forEach((fn) => fn({ userId: "2", name: "Team Mate" }));
        }, 1000);
      }
    };

    socket.connect = () => {
      setTimeout(() => {
        mockEvents["connect"]?.forEach((fn) => fn());
      }, 100);
    };

    socket.disconnect = () => {};
    socket.connected = false;
  }

  if (!socket.connected) {
    socket.connect();
    socket.connected = true;
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
