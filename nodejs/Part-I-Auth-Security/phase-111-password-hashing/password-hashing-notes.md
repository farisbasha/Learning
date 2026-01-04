# Phase 111: Password Hashing Concepts

## Overview

Passwords are the weakest link in web security. If your database is ever compromised, the presence of plain-text passwords is a catastrophic failure that puts every user at risk. **Hashing** is the non-negotiable solution to this problem.

In this phase, we dive into the science of hashing, why standard encryption is not enough, and the mechanics of modern algorithms designed specifically to thwart attackers.

---

## 1. The Core Rule

**NEVER store a plain-text password.**
Even if you think your server is "secure," internal threats, misconfigurations, or software vulnerabilities can expose your data. If you store hashes, a breach is a "leak." If you store passwords, a breach is an "identity disaster."

---

## 2. Encryption vs. Hashing

These are fundamentally different concepts that are often confused:

| Feature | Encryption (Two-Way) | Hashing (One-Way) |
| :--- | :--- | :--- |
| **Purpose** | To hide data that needs to be retrieved later. | To verify data without knowing the original. |
| **Retrieval** | Possible with a Private Key. | Impossible by design. |
| **Algorithm** | AES, RSA. | SHA-256, bcrypt, Argon2. |
| **Use Case** | Credit card numbers, private messages. | Passwords. |

### Why not use Encryption for passwords?
If the server can "decrypt" a password to check it, then an attacker who steals the private key can decrypt **every** password in the system.

---

## 3. How Hashing Works (Wait, how do we log in?)

If we can't reverse the hash, how do we verify the user?
1. **User registers**: Server hashes `password123` -> `x7y2z...` and stores `x7y2z...`.
2. **User logs in**: User sends `password123`.
3. **Server**: Hashes the incoming string again.
4. **Comparison**: If `Hash(Incoming) === StoredHash`, the user is authenticated.

---

## 4. Attacking the Hash: Rainbow Tables & Salting

### The Problem: Deterministic Hashing
If two users have the same password (`password123`), they will have the same hash. Attackers use **Rainbow Tables** (pre-computed lists of millions of hashes for common words) to instantly look up a hash and find the original text.

### The Solution: Salting
A **Salt** is a long, random string added to the password *before* hashing.
- User A: `password123` + `SaltA` -> unique hash
- User B: `password123` + `SaltB` -> different unique hash

The salt is stored in the database alongside the hash. This makes Rainbow Tables useless as the attacker would need a unique table for every single user.

---

## 5. Slowing Down the Attacker: Adaptive Hashing

Standard hashing algorithms like **MD5** or **SHA-1** are designed to be **fast** (they can hash millions of strings per second). This is bad for passwords because it allows an attacker to "Brute Force" trillions of combinations very quickly.

**Adaptive Hashing** algorithms (bcrypt, Argon2) introduce a **Work Factor (or Cost Factor)**.
- They are designed to be **deliberately slow**.
- A single hash might take 100ms.
- For a user, 100ms is unnoticeable.
- for an attacker trying 1 billion combinations, the time becomes impossible (centuries).

---

## 6. Common Password Hashing Algorithms

### 1. bcrypt (Industry Standard)
- Adaptive (uses "rounds").
- Automatically handles salting.
- Very mature and well-vetted.
- ❌ Limit: 72 characters max (standard bcrypt).

### 2. Argon2id (The Modern King)
- Winner of the Password Hashing Competition (2015).
- Protects against **GPU cracking** and **Side-channel attacks**.
- Configurable memory, time, and parallelism.
- ✅ Recommended by OWASP as the current gold standard.

### 3. scrypt
- Memory-hard algorithm.
- Designed to make hardware attacks (ASICs) expensive.

---

## 7. Password Policy Best Practices

1. **Length over Complexity**: A 20-character phrase (`correct horse battery staple`) is harder to crack than a 8-character complex string (`P@ssw0rd!`).
2. **Never log credentials**: Ensure your logger doesn't capture the `body.password` field in debug mode.
3. **Rate Limiting**: Prevent brute-force attempts at the network level.
4. **Credential Stuffing**: Check if a user's password has been seen in known data breaches (e.g., HaveIBeenPwned API).

---

## Key Takeaways

1. **Hashing is one-way**; encryption is two-way.
2. **Salts** prevent rainbow table attacks.
3. **Work Factors** (slowness) prevent brute-force attacks.
4. **bcrypt** is great; **Argon2** is better.
5. **Security is a moving target**: Always keep your libraries updated and follow OWASP recommendations.
