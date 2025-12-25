# Phase 152: NestJS Authentication
## Agent Instructions

**Phase**: 152 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. @nestjs/passport integration
2. Local strategy
3. JWT strategy
4. AuthModule structure
5. AuthGuard
6. JWT tokens in NestJS
7. Refresh tokens
8. @nestjs/jwt package
9. Current user decorator
10. Complete auth flow

## Example
```typescript
// auth.module.ts
@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '15m' }
        })
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule {}

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        });
    }
    
    async validate(payload: JwtPayload) {
        return this.usersService.findById(payload.sub);
    }
}

// Using guard
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
    return user;
}
```

## Content Instructions
**Notes**: NestJS authentication complete guide
**Summary**: Auth module structure
