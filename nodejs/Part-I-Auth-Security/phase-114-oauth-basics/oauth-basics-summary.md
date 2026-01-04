# Phase 114: OAuth 2.0 Flow Reference

## 1. Roles Diagram

- **Resource Owner**: You (the User).
- **Client**: Your App (e.g., MyNodeApp).
- **Authorization Server**: Google Identity Server.
- **Resource Server**: Gmail/Calendar API.

## 2. The Authorization Code Flow (Web Apps)

```text
1. [User] -> [Your App] "Login with Google"
2. [Your App] -> [Google] (Redirect with client_id)
3. [User] -> [Google] "Yes, I agree"
4. [Google] -> [Your App] (Redirect with Authorization Code)
5. [Your App (Backend)] -> [Google] (Code + Secret)
6. [Google] -> [Your App (Backend)] (Access Token + Refresh Token)
```

## 3. Grant Type Selection Guide

| Application Type | Recommended Grant | Security Level |
| :--- | :--- | :--- |
| **Node.js (Server-Side)** | Authorization Code + Secret | Excellent |
| **React/Mobile (Client-Side)**| Authorization Code + PKCE | High |
| **Microservice (No User)** | Client Credentials | High |
| **Legacy Web Apps** | Implicit | **❌ Deprecated** |

## 4. Mandatory Security Checklist
- [ ] **State Parameter**: Always include a unique session-bound `state`.
- [ ] **HTTPS only**: Redirect URIs must be TLS-protected.
- [ ] **Client Secret**: Keep it out of client-side code and GIT.
- [ ] **Whitelisted URIs**: Only allow redirects to your verified domains.

## 5. Vocabulary Refresher

- **Grant**: The method used to get tokens.
- **Callback**: The endpoint where OAuth providers send information back.
- **Scope**: The specific permissions requested.
- **Access Token**: The credential used to access the user's data.
