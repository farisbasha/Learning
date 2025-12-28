# Phase 077: Template Engines (Legacy)

## ⚠️ Important Note

**This is LEGACY for API development.** Template engines are for **Server-Side Rendering (SSR)** of HTML. For modern applications:

- **APIs**: Return JSON, let frontend handle rendering
- **SSR**: Use modern frameworks (Next.js, Remix, Astro)

This phase covers template engines for:
- Understanding legacy codebases
- Simple admin panels
- Email templates
- Historical context

---

## What are Template Engines?

Template engines let you generate HTML dynamically by embedding variables and logic into templates.

**Popular engines:**
- **EJS** (Embedded JavaScript) - Most similar to PHP
- **Pug** (formerly Jade) - Indentation-based
- **Handlebars** - Logic-less templates
- **Mustache** - Minimal logic

---

## EJS (Embedded JavaScript)

### Installation

```bash
npm install ejs
npm install -D @types/ejs
```

### Setup

```typescript
import express from 'express';
import path from 'path';

const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Render template
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home Page',
        user: { name: 'John', role: 'admin' },
        items: ['Item 1', 'Item 2', 'Item 3']
    });
});
```

### EJS Syntax

```ejs
<!-- views/index.ejs -->
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
</head>
<body>
    <h1>Welcome, <%= user.name %>!</h1>
    
    <!-- Escaped output -->
    <p><%= user.role %></p>
    
    <!-- Unescaped output (dangerous!) -->
    <p><%- htmlContent %></p>
    
    <!-- Conditionals -->
    <% if (user.role === 'admin') { %>
        <a href="/admin">Admin Panel</a>
    <% } else { %>
        <p>Regular user</p>
    <% } %>
    
    <!-- Loops -->
    <ul>
        <% items.forEach(item => { %>
            <li><%= item %></li>
        <% }); %>
    </ul>
    
    <!-- Include partials -->
    <%- include('partials/header') %>
    <%- include('partials/footer') %>
</body>
</html>
```

### Partials

```ejs
<!-- views/partials/header.ejs -->
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>
```

---

## Pug (Formerly Jade)

### Installation

```bash
npm install pug
```

### Setup

```typescript
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
```

### Pug Syntax

```pug
//- views/index.pug
doctype html
html
  head
    title= title
  body
    h1 Welcome, #{user.name}!
    
    //- Conditionals
    if user.role === 'admin'
      a(href='/admin') Admin Panel
    else
      p Regular user
    
    //- Loops
    ul
      each item in items
        li= item
    
    //- Include
    include partials/header
```

---

## Handlebars

### Installation

```bash
npm install express-handlebars
```

### Setup

```typescript
import { engine } from 'express-handlebars';

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
```

### Handlebars Syntax

```handlebars
<!-- views/index.handlebars -->
<!DOCTYPE html>
<html>
<head>
    <title>{{title}}</title>
</head>
<body>
    <h1>Welcome, {{user.name}}!</h1>
    
    {{#if user.isAdmin}}
        <a href="/admin">Admin Panel</a>
    {{else}}
        <p>Regular user</p>
    {{/if}}
    
    <ul>
        {{#each items}}
            <li>{{this}}</li>
        {{/each}}
    </ul>
</body>
</html>
```

---

## PHP Comparison

### PHP (Blade in Laravel)

```php
<!-- resources/views/index.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
</head>
<body>
    <h1>Welcome, {{ $user->name }}!</h1>
    
    @if($user->role === 'admin')
        <a href="/admin">Admin Panel</a>
    @else
        <p>Regular user</p>
    @endif
    
    <ul>
        @foreach($items as $item)
            <li>{{ $item }}</li>
        @endforeach
    </ul>
    
    @include('partials.header')
</body>
</html>
```

### Express (EJS)

```ejs
<!-- views/index.ejs -->
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
</head>
<body>
    <h1>Welcome, <%= user.name %>!</h1>
    
    <% if (user.role === 'admin') { %>
        <a href="/admin">Admin Panel</a>
    <% } else { %>
        <p>Regular user</p>
    <% } %>
    
    <ul>
        <% items.forEach(item => { %>
            <li><%= item %></li>
        <% }); %>
    </ul>
    
    <%- include('partials/header') %>
</body>
</html>
```

**EJS is most similar to PHP/Blade!**

---

## When to Use Template Engines

### ✅ Good Use Cases

1. **Email templates** - Generate HTML emails
2. **Simple admin panels** - Internal tools
3. **PDF generation** - HTML to PDF
4. **Legacy projects** - Maintaining old code

### ❌ Bad Use Cases (Use Modern Alternatives)

1. **Public-facing apps** - Use Next.js/Remix
2. **SPAs** - Use React/Vue/Svelte
3. **APIs** - Return JSON, not HTML

---

## Modern Alternative: Next.js

Instead of Express + EJS, use Next.js for SSR:

```typescript
// pages/index.tsx (Next.js)
interface Props {
    user: { name: string; role: string };
    items: string[];
}

export default function Home({ user, items }: Props) {
    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            
            {user.role === 'admin' && (
                <a href="/admin">Admin Panel</a>
            )}
            
            <ul>
                {items.map(item => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export async function getServerSideProps() {
    return {
        props: {
            user: { name: 'John', role: 'admin' },
            items: ['Item 1', 'Item 2']
        }
    };
}
```

**Benefits:**
- TypeScript support
- React components
- Better developer experience
- Built-in routing
- API routes included

---

## Email Templates (Valid Use Case)

Template engines are still useful for emails:

```typescript
import ejs from 'ejs';
import nodemailer from 'nodemailer';

async function sendWelcomeEmail(user: { name: string; email: string }) {
    const html = await ejs.renderFile('views/emails/welcome.ejs', {
        name: user.name
    });
    
    await transporter.sendMail({
        to: user.email,
        subject: 'Welcome!',
        html
    });
}
```

```ejs
<!-- views/emails/welcome.ejs -->
<!DOCTYPE html>
<html>
<body>
    <h1>Welcome, <%= name %>!</h1>
    <p>Thanks for signing up.</p>
</body>
</html>
```

---

## Key Takeaways

1. **Template engines are legacy** - For SSR HTML
2. **EJS is most PHP-like** - Similar to Blade
3. **Use for emails** - Still valid use case
4. **Use Next.js for SSR** - Modern alternative
5. **APIs return JSON** - Not HTML
6. **Understand for legacy code** - You'll see this in old projects

**Recommendation**: Skip for new APIs, use Next.js for SSR, use templates only for emails.
