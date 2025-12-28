# Phase 079: File Uploads Summary

## Quick Reference: Multer Setup

```typescript
import multer from 'multer';
import path from 'path';

// 1. Define Storage Logic
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// 2. Initialize Middleware
const upload = multer({ 
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: (req, file, cb) => {
        const isValid = file.mimetype.startsWith('image/');
        cb(null, isValid);
    }
});

// 3. User in Routes
app.post('/upload', upload.single('avatar'), (req, res) => {
    // Info in req.file
    res.json(req.file);
});
```

## Key Methods

| Handler | Description | Result Access |
| :--- | :--- | :--- |
| `.single('field')` | One file | `req.file` |
| `.array('field', num)` | Multiple files (same name) | `req.files` (array) |
| `.fields([{name, maxCount}])` | Multiple files (different names) | `req.files[name]` (array) |
| `.none()` | Text fields only (multipart) | `req.body` |

## Common Configuration

- **`dest`**: Simple string path (auto-generates names).
- **`storage`**: Custom `diskStorage` or `memoryStorage`.
- **`limits`**: Set `fileSize`, `fields`, and `files` count.
- **`fileFilter`**: Function to accept/reject via `cb(null, true/false)`.

## Pro-Tips
- **CORS**: Ensure your CORS policy allows `multipart/form-data`.
- **Cleaning**: Multer only saves files. It does NOT delete them. If a validation fails later in your route, you must manually delete the file using `fs.unlink`.
- **Sharp**: Use `sharp` with `memoryStorage` for on-the-fly image optimization.
