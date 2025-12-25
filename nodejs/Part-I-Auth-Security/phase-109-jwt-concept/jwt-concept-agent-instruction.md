# Phase 109: JWT Concept
## Agent Instructions

**Phase**: 109 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. What is JWT — JSON Web Token
2. JWT structure: header.payload.signature
3. Base64 encoding (not encryption!)
4. Claims: iss, sub, exp, iat, aud
5. Custom claims
6. Signing algorithms: HS256, RS256
7. When to use JWT vs sessions
8. JWT pros and cons
9. JWT is stateless
10. Security considerations

## Example
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  // Header
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.  // Payload
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  // Signature

// Decoded payload:
{
    "sub": "1234567890",
    "name": "John",
    "iat": 1516239022,
    "exp": 1516242622
}
```

## Content Instructions
**Notes**: JWT fundamentals and structure
**Summary**: JWT anatomy diagram
