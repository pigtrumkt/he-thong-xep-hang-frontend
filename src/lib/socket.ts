import io from "socket.io-client";

const SOCKET_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3002`;
  }

  return "";
})();

let socket: ReturnType<typeof io> | null = null;

export const getSocket = (token: string): ReturnType<typeof io> => {
  if (!socket) {
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

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
