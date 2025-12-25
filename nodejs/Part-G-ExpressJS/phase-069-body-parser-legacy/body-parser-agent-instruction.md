# Phase 069: Body-Parser (Legacy Pattern)
## Agent Instructions

**Phase**: 069 | **Part**: G - Express.js | **Language**: JavaScript (Legacy)

## Why Learn This (Legacy)
> Before Express 4.16, `body-parser` was a separate package that you HAD to install.
> You will see this in older codebases and tutorials from 2015-2018.

## Topics
1. What is body-parser — parsing request bodies
2. `npm install body-parser` (legacy approach)
3. `bodyParser.json()` — JSON body parsing
4. `bodyParser.urlencoded()` — form data parsing
5. Why it was separate (Express 3.x history)
6. When it was merged into Express (v4.16+)
7. **Modern approach**: `express.json()`, `express.urlencoded()`
8. Migration from legacy to modern

## Legacy Example
```javascript
// ❌ OLD WAY (pre-4.16)
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ NEW WAY (4.16+)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

## Content Instructions
**Notes**: Body-parser history and migration guide
**Summary**: Legacy vs modern body parsing
