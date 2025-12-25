# Phase 008: ES6 Classes — Summary Cheatsheet

## 🏗️ Basic Syntax

```javascript
class Rectangle {
  // 1. Constructor
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }

  // 2. Method
  calcArea() {
    return this.height * this.width;
  }
}
```

---

## 🏎️ Advanced Class Features

| Feature | Syntax | Use Case |
|---------|--------|----------|
| **Inheritance** | `class A extends B` | Building child types. |
| **Parent Call** | `super()` | Calling parent constructor. |
| **Static** | `static method()` | Factory methods or helpers. |
| **Private** | `#field` | True data encapsulation. |
| **Getters** | `get name() { ... }` | Calculated properties. |

---

## 🔒 Private & Public

```javascript
class User {
  #password; // Private
  email;     // Public

  constructor(email, password) {
    this.email = email;
    this.#password = password;
  }
}
```

---

## 🔄 PHP ↔ JS OOP Comparison

| Concept | PHP | JavaScript |
|---------|-----|------------|
| Constructor | `__construct` | `constructor` |
| Instances | `$obj = new MyClass()` | `const obj = new MyClass()` |
| Class Methods | `$this->method()` | `this.method()` |
| Static Call | `MyClass::method()` | `MyClass.method()` |
| Inheritance | `extends` | `extends` |
| Parent Methods | `parent::method()` | `super.method()` |

---

## 💡 Remember
- **`super()`** must be called **first** in a child constructor.
- JavaScript doesn't have `protected` or `abstract` natively (use TypeScript!).
- Properties don't need to be declared at the top of the class like in PHP; assigning to `this.prop` in the constructor creates it.
- Class methods do **not** have commas between them.
