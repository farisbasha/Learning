# Phase 072-080: Summary Cheatsheet

## Third-Party Middleware (072)

```bash
npm install cors helmet morgan compression express-rate-limit
```

```typescript
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(cors({ origin: 'https://yourdomain.com' }));
app.use(morgan('combined'));
app.use(compression());
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

## Custom Middleware (073)

```typescript
const requestId = (req, res, next) => {
    req.id = crypto.randomUUID();
    next();
};

const apiKeyAuth = (req, res, next) => {
    if (req.headers['x-api-key'] !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};
```

## Express-Validator (074 - Legacy)

**Use Zod instead!** See Phase 081.

## Template Engines (077 - Legacy)

**Use Next.js/Remix for SSR instead!**

## Static Files (078)

```typescript
app.use(express.static('public', {
    maxAge: '1y',
    etag: true
}));
```

## File Uploads - Multer (079)

```typescript
import multer from 'multer';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Images only'));
        }
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
});
```

## Sessions (080)

```typescript
import session from 'express-session';

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true }
}));
```

## Production Stack

```typescript
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
app.use(express.static('public'));
app.use('/api', routes);
app.use(errorHandler);
```
