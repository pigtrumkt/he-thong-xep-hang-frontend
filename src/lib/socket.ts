import { io, Socket } from "socket.io-client";

export const SOCKET_BASE_URL = (() => {
  const port = `${process.env.NEXT_PUBLIC_API_PORT}`;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  return `http://localhost:${port}`; // dùng cho SSR
})();

let socket: Socket;
let socketSound: Socket;

export const getSocket = (token: string): Socket => {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      auth: {
        token: token,
      },
    });
  }

  return socket;
};

export const getSocketSound = (token: string): Socket => {
  if (!socketSound || socketSound.disconnected) {
    socketSound = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      auth: {
        token: token,
      },
    });
  }

  return socketSound;
};
