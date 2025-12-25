# Phase 079: File Uploads with Multer
## Agent Instructions

**Phase**: 079 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Why file uploads are special (multipart/form-data)
2. Installing and configuring Multer
3. Single file upload: `upload.single()`
4. Multiple files: `upload.array()`, `upload.fields()`
5. `req.file` and `req.files` types
6. Storage options: disk vs memory
7. File size limits
8. File type validation (MIME types)
9. Custom filename generation
10. Error handling for uploads
11. Uploading to cloud (S3) overview
12. Laravel comparison: `$request->file()`

## Example
```typescript
import multer from 'multer';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

app.post('/upload', upload.single('avatar'), (req, res) => {
    res.json({ file: req.file });
});
```

## Content Instructions
**Notes**: Complete Multer guide for file uploads
**Summary**: Multer configuration reference
