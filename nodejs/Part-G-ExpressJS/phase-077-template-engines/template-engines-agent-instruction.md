# Phase 077: Template Engines (Legacy/SSR)
## Agent Instructions

**Phase**: 077 | **Part**: G - Express.js | **Language**: JavaScript (Legacy)

## Why Learn This
> Before SPA frameworks (React, Vue), Express served HTML using template engines.
> Still used for: admin panels, email templates, simple websites, legacy apps.

## Topics
1. What are template engines — server-side rendering
2. EJS (Embedded JavaScript) — most common
3. Pug/Jade — indentation-based syntax
4. Handlebars — logic-less templates
5. Setting up a template engine
6. `app.set('view engine', 'ejs')`
7. `res.render()` — rendering views
8. Passing data to templates
9. Layouts and partials
10. Laravel comparison: Blade templates

## Example
```javascript
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/profile', (req, res) => {
    res.render('profile', { 
        user: { name: 'Basha', age: 25 }
    });
});
```

## Content Instructions
**Notes**: Template engines overview with EJS focus
**Summary**: Template engine options comparison
