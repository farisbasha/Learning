# Phase 127: WebSockets with Socket.io
## Agent Instructions

**Phase**: 127 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. WebSockets vs HTTP
2. Socket.io introduction
3. Server setup with Express
4. Client connection
5. Events: emit, on
6. Broadcasting
7. Rooms and namespaces
8. Authentication with Socket.io
9. Typing events with TypeScript
10. Real-world use cases: chat, notifications

## Example
```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:3000' }
});

interface ServerToClientEvents {
    message: (data: { text: string; user: string }) => void;
}

interface ClientToServerEvents {
    sendMessage: (text: string) => void;
    joinRoom: (room: string) => void;
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('joinRoom', (room) => {
        socket.join(room);
    });
    
    socket.on('sendMessage', (text) => {
        io.emit('message', { text, user: socket.id });
    });
});
```

## Content Instructions
**Notes**: Socket.io implementation guide
**Summary**: Socket.io event patterns
