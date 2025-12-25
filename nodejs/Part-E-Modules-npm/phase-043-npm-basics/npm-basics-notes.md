# Phase 043: npm Fundamentals — Notes

**npm** (Node Package Manager) is the heart of the JavaScript ecosystem. It is the largest software registry in the world, allowing you to share and consume code. To a PHP developer, it is exactly the same as **Composer**.

---

## 1. What is npm?

1. **A Registry**: A database of over 2 million open-source packages.
2. **A CLI**: A tool you run in your terminal to manage those packages.

---

## 2. The Core Files & Folders

- **`package.json`**: Describes your project and lists your dependencies. (Like `composer.json`)
- **`package-lock.json`**: Records the exact version of every package installed so your teammates get the same results. (Like `composer.lock`)
- **`node_modules/`**: The folder where the actual code for your dependencies is downloaded. (Like `vendor/`)

---

## 3. Dependency Types

### Dependencies (`--save` or default)
Code needed for the app to **run** in production.
- *Examples*: Express, Lodash, Prisma.

### DevDependencies (`--save-dev` or `-D`)
Tools needed only during **development** or testing.
- *Examples*: TypeScript, ESLint, Jest, Vitest.

---

## 4. Working with TypeScript Types

Many older libraries were written in plain JavaScript. To get autocomplete and type-checking in TypeScript, you need to install separate "type definition" packages from the `@types` scope.

```bash
# Install the library
npm install express

# Install the types (as a devDependency)
npm install -D @types/express
```

---

## 5. Security Check

npm includes a built-in security auditor. Run this occasionally to see if your dependencies have known vulnerabilities.

```bash
npm audit
npm audit fix
```

---

## 6. PHP Comparison (The "Translator")

| Feature | PHP (Composer) | Node (npm) |
|---------|----------------|------------|
| **Initialize** | `composer init` | `npm init -y` |
| **Install lib** | `composer require vendor/pkg` | `npm install pkg` |
| **Install dev lib** | `composer require --dev pkg` | `npm install -D pkg` |
| **Install all** | `composer install` | `npm install` |
| **Run script** | `composer run-script` | `npm run script` |

---

## 7. Key Takeaways
1. **`node_modules` is huge**: Don't be surprised if it takes up hundreds of MBs. Never commit it to Git!
2. **Locality**: Unlike some other languages, npm installs packages locally inside your project folder by default.
3. **Locking**: Never manually edit `package-lock.json`. Let npm handle it.
4. **Conclusion**: Master the CLI commands, and you'll be able to manage any Node.js project.
