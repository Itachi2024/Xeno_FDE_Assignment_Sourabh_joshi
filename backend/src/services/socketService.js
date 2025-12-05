import { Server } from 'socket.io';

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-tenant', (tenantId) => {
      socket.join(`tenant-${tenantId}`);
      console.log(`Socket ${socket.id} joined tenant-${tenantId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function emitSyncStatus(tenantId, status, data = {}) {
  if (io) {
    io.to(`tenant-${tenantId}`).emit('sync-status', {
      status,
      timestamp: new Date().toISOString(),
      ...data
    });
  }
}

export function emitDataUpdate(tenantId, type, data) {
  if (io) {
    io.to(`tenant-${tenantId}`).emit('data-update', {
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
