# Phase 077: Template Engines — Cheatsheet

## ⚠️ LEGACY - Use Next.js for SSR!

## EJS (Most PHP-like)

```bash
npm install ejs
```

```typescript
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index', { title: 'Home', user: { name: 'John' } });
});
```

```ejs
<!-- views/index.ejs -->
<h1><%= title %></h1>
<p>Welcome, <%= user.name %>!</p>

<% if (user.isAdmin) { %>
    <a href="/admin">Admin</a>
<% } %>

<% items.forEach(item => { %>
    <li><%= item %></li>
<% }); %>

<%- include('partials/header') %>
```

## When to Use

| Use Case | Recommendation |
|----------|----------------|
| Public web app | ❌ Use Next.js |
| API | ❌ Return JSON |
| Email templates | ✅ Valid use |
| Admin panel | ⚠️ Consider Next.js |
| Legacy project | ✅ Maintain |

## Modern Alternative

```typescript
// Next.js (Modern)
export default function Home({ user }) {
    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            {user.isAdmin && <a href="/admin">Admin</a>}
        </div>
    );
}
```

**Recommendation**: Use templates only for emails, use Next.js for SSR.
