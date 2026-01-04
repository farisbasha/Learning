# Phase 114: OAuth 2.0 Basics & Core Concepts

## Overview

OAuth 2.0 is the foundational protocol for modern distributed authentication. While Phase 108 showed how to *implement* it with Passport, this phase focuses on the **underlying mechanics**. Understanding the flow is critical for debugging issues, implementing custom providers, or securing mobile and single-page applications.

---

## 1. The Four Roles in OAuth 2.0

| Role | Definition | Example |
| :--- | :--- | :--- |
| **Resource Owner** | The person who owns the data. | The end user with a Google account. |
| **Client** | The application requesting access. | Your Node.js website. |
| **Authorization Server** | The server that verifies the user. | Google's Login Server. |
| **Resource Server** | The server holding the user's data. | Google's Contact/Profile API. |

---

## 2. The Vocabulary of OAuth

- **Scopes**: Permissions requested by the client (e.g., `read:email`, `write:profile`).
- **Consent**: The screen where the user says "Yes, let this app see my email."
- **Redirect URI (Callback)**: The URL where the user is sent after consent.
- **Client ID**: The unique identifier for your app (Public).
- **Client Secret**: The password for your app (Private).

---

## 3. The Most Common Grant Type: Authorization Code Flow

This is the most secure flow because the **Access Token** is never exposed to the browser.

1. **Authorize**: Browser redirects user to Google with `client_id`, `scope`, and `redirect_uri`.
2. **Consent & Return**: Google redirects back to your server with an **Authorization Code** (NOT the token).
3. **Exchange**: Your Node.js server makes a POST request to Google with the `code` + `client_secret`.
4. **Token Delivery**: Google verifies the secret and returns the `access_token` and `refresh_token` directly to your server (securely).

---

## 4. Other Grant Types

| Grant Type | Use Case | Security |
| :--- | :--- | :--- |
| **Authorization Code** | Web Server Apps (Classic Node.js). | High |
| **Implicit** | Legacy SPAs (Deprecated). | Low (Token exposed in URL) |
| **Client Credentials** | Machine-to-Machine (Service communicating with Service). | High (uses only Client ID/Secret) |
| **Resource Owner Password** | Internal Apps (Deprecated). | Low (App handles user's password) |
| **PKCE (Proof Key for Code Exchange)** | Mobile Apps & modern SPAs. | High (prevents code interception) |

---

## 5. Security: The `state` Parameter

**The Attack**: An attacker could trick a user into completing an OAuth flow they didn't start (CSRF). 

**The Defense**: 
1. Your app generates a random string (`state`) and stores it (usually in a session).
2. Your app sends this `state` to Google.
3. Google sends the same `state` back in the callback.
4. If the `state` doesn't match, reject the request.

---

## 6. Access Token vs. Refresh Token

- **Access Token**: Short-lived (shining light). Used to fetch data.
- **Refresh Token**: Long-lived (golden key). Used to get new Access Tokens when the old one expires.

---

## 7. OpenID Connect (OIDC)

OAuth 2.0 is purely for **Authorization** (Access). 
**OIDC** is an extension built on top of OAuth 2.0 specifically for **Authentication** (Identity).
- If you see an `id_token` (which is a JWT), the system is using OIDC.
- OIDC provides a standard `/userinfo` endpoint for profile data.

---

## 8. Mobile Security: PKCE

Since mobile apps cannot keep a secret (the `client_secret` would be in the binary), they use **PKCE**.
- Instead of a secret, the app generates a `code_verifier`.
- It sends a hash of that verifier (`code_challenge`) during the first step.
- It sends the actual `code_verifier` during the exchange step.
- This ensures only the app that started the flow can finish it.

---

## Key Takeaways

1. **OAuth 2.0 is about delegation**, not just "login."
2. **Grant Types** define the flow based on the type of application.
3. **Authorization Code** is the gold standard for web servers.
4. **PKCE** is required for Mobile/SPAs.
5. **State** parameter is mandatory to prevent CSRF.
6. **Access tokens** expire; **Refresh tokens** persist.
