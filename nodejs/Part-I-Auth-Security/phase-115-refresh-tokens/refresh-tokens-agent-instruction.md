# Phase 115: Refresh Token Strategy
## Agent Instructions

**Phase**: 115 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. Why refresh tokens — short-lived access tokens
2. Access token vs refresh token
3. Token rotation strategy
4. Storing refresh tokens (database)
5. Refresh endpoint implementation
6. Token family concept
7. Detecting token theft
8. Revoking refresh tokens
9. Frontend token handling
10. Mobile app considerations

## Example
```typescript
interface RefreshToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    family: string;
}

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    
    const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });
    
    if (!stored || stored.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    
    const newAccessToken = generateAccessToken(stored.userId);
    const newRefreshToken = await createRefreshToken(stored.userId, stored.family);
    
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});
```

## Content Instructions
**Notes**: Refresh token implementation guide
**Summary**: Token rotation patterns
