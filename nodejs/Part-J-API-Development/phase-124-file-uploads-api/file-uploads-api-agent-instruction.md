# Phase 124: File Uploads in APIs
## Agent Instructions

**Phase**: 124 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. Multipart form data
2. Multer for file handling
3. File size limits
4. File type validation
5. Storing files locally
6. S3 upload with `@aws-sdk/client-s3`
7. Presigned URLs
8. Image processing with Sharp
9. Progress tracking
10. Chunked uploads for large files

## Example
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'us-east-1' });

// Direct upload
const uploadToS3 = async (file: Express.Multer.File) => {
    const key = `uploads/${Date.now()}-${file.originalname}`;
    
    await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    }));
    
    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
};

// Presigned URL for client-side upload
const getUploadUrl = async (filename: string, contentType: string) => {
    const key = `uploads/${Date.now()}-${filename}`;
    const url = await getSignedUrl(s3, new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType
    }), { expiresIn: 3600 });
    
    return { url, key };
};
```

## Content Instructions
**Notes**: File upload patterns for APIs
**Summary**: Upload strategies comparison
