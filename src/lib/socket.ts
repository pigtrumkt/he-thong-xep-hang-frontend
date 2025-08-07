import { io, Socket } from "socket.io-client";

const SOCKET_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001`;
  }

  return "";
})();

let socket: Socket;

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
