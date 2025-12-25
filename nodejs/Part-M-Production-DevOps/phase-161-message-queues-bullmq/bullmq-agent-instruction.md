# Phase 161: Message Queues with BullMQ
## Agent Instructions

**Phase**: 161 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. Why message queues
2. BullMQ introduction
3. Queue, Worker, Job
4. Adding jobs to queue
5. Processing jobs
6. Job options: delay, retry, priority
7. Scheduled jobs (cron)
8. Job events
9. Dashboard with bull-board
10. Laravel comparison: Queue system

## Example
```typescript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL);

// Create queue
const emailQueue = new Queue('emails', { connection });

// Add job
await emailQueue.add('welcome', {
    to: 'user@example.com',
    subject: 'Welcome!',
    template: 'welcome'
}, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
});

// Process jobs (separate process)
const worker = new Worker('emails', async (job) => {
    console.log('Processing:', job.name, job.data);
    await sendEmail(job.data);
    return { sent: true };
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});
```

## Content Instructions
**Notes**: BullMQ for background jobs
**Summary**: BullMQ patterns reference
