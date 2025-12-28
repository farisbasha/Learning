# Phase 079: File Uploads with Multer

## Overview

Handling file uploads in Node.js is different from standard JSON or URL-encoded data. Standard body-parsers cannot handle `multipart/form-data`, which is the encoding type used for transferring binary data (images, PDFs, videos). **Multer** is the industry-standard middleware for handling this in Express.

---

## 1. How Multipart Requests Work (Internals)

When a browser sends a file, it doesn't just send the bits. It uses a **Boundary** to separate different parts of the request.

### The Raw HTTP Request
```http
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="username"

johndoe
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

[BINARY DATA HERE]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

Multer streams this request, parses the boundaries, and saves the binary chunks either to Disk or Memory.

---

## 2. Basic Configuration

### Installation
```bash
npm install multer
npm install -D @types/multer
```

### Simple Setup
```typescript
import multer from 'multer';

// Files will be saved in 'uploads/' folder with random names
const upload = multer({ dest: 'uploads/' });

// 'avatar' is the name attribute in your HTML form
app.post('/profile', upload.single('avatar'), (req, res) => {
    // req.file contains information about the uploaded file
    // req.body contains the text fields
    console.log(req.file);
    res.send('File uploaded!');
});
```

---

## 3. Storage Options: Disk vs. Memory

### Disk Storage (Recommended for most cases)
Allows full control over where files are stored and what they are named.

```typescript
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/avatars');
    },
    filename: (req, file, cb) => {
        // Generate unique name: timestamp + random string + original extension
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `user-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });
```

### Memory Storage
Files are stored as `Buffer` objects. Good if you want to process the image (e.g., resize with `sharp`) before saving it to S3.

```typescript
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
    // req.file.buffer contains the binary data
    const processedImage = await sharp(req.file.buffer).resize(200).toBuffer();
    // Now upload to S3...
});
```

---

## 4. Input Patterns

### Single File
```typescript
app.post('/avatar', upload.single('avatar'), (req, res) => { /* req.file */ });
```

### Multiple Files (Same Name)
```typescript
app.post('/gallery', upload.array('photos', 5), (req, res) => {
    // req.files is an array
});
```

### Multiple Files (Different Names)
```typescript
const cpUpload = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 8 }
]);
app.post('/cool-profile', cpUpload, (req, res) => {
    // req.files['avatar'][0]
    // req.files['gallery']
});
```

---

## 5. Security & Validation

### File Filter (MIME Type Validation)
Never trust the extension; check the `mimetype`.

```typescript
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept
        } else {
            cb(new Error('Invalid file type!'), false); // Reject
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
});
```

---

## 6. Error Handling

Multer errors should be caught specifically to provide clean API responses.

```typescript
app.post('/upload', (req, res) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g., file too large)
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // An unknown error occurred
            return res.status(500).json({ error: err.message });
        }
        // Everything went fine
        res.json({ message: 'Success', file: req.file });
    });
});
```

---

## 7. PHP / Laravel Comparison

### PHP (Traditional)
In PHP, files are automatically put into the `$_FILES` superglobal and saved to a temp directory.
```php
$target_file = "uploads/" . basename($_FILES["avatar"]["name"]);
move_uploaded_file($_FILES["avatar"]["tmp_name"], $target_file);
```

### Laravel
Laravel uses a very clean API similar to Multer.
```php
$path = $request->file('avatar')->store('avatars');
```

**Note**: In Node.js/Express, files are NOT parsed by default. You MUST include Multer or a similar middleware, otherwise `req.body` will be empty for multipart requests.

---

## 8. Common Mistakes

1. **Missing `enctype` in HTML**: If you forget `enctype="multipart/form-data"`, Multer will never trigger.
2. **Order of Middleware**: If you put a body-parser (like `express.json()`) *after* Multer, it might interfere if not handled correctly.
3. **Not Handling Errors**: If a file is too large, Express might hang or crash if you don't have an error handler.
4. **Relative Paths**: Always use `path.join(__dirname, 'uploads')` for `destination` to avoid "Folder not found" errors when running from different directories.

---

## 9. Performance & Cloud Uploads (S3)

For production, you should rarely store files on the local disk.
1. **Direct to S3**: Use `multer-s3` to stream the upload directly to AWS S3 without touching your server's disk.
2. **Memory Leaks**: If using `memoryStorage`, be careful with huge files as they consume RAM. For large videos, always use `diskStorage` or direct streaming.
