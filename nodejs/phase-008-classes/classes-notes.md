# Phase 008: ES6 Classes — Notes

Classes in JavaScript were introduced in 2015 (ES6) to provide a more familiar syntax for developers coming from languages like PHP. While JavaScript still uses prototypes under the hood, classes make object-oriented programming much cleaner.

---

## 1. Defining a Class

This will feel very natural to a Laravel/PHP developer.

```javascript
class User {
    // PHP: public $name; (Not strictly required in JS)
    
    // PHP: public function __construct($name)
    constructor(name, role) {
        this.name = name;
        this.role = role;
    }

    // Instance Method
    greet() {
        return `Hello, I'm ${this.name} (${this.role})`;
    }
}

const admin = new User("Basha", "Admin");
console.log(admin.greet());
```

---

## 2. Inheritance (`extends` and `super`)

Inheritance works exactly like PHP, but instead of `parent::`, you use the keyword **`super`**.

```javascript
class Admin extends User {
    constructor(name, permissions) {
        // Call parent constructor
        super(name, "Admin");
        this.permissions = permissions;
    }

    deleteUser(userId) {
        console.log(`Deleting user ${userId}...`);
    }
}
```

---

## 3. Static Methods & Properties

Static members are attached to the **class itself**, not the instances.

```javascript
class AppConfig {
    static version = "1.0.0";

    static logVersion() {
        console.log(`Current version: ${this.version}`);
    }
}

console.log(AppConfig.version);
AppConfig.logVersion();
```

---

## 4. Getters and Setters

JavaScript allows you to define methods that look like properties. Use these for computed data or validation.

```javascript
class Product {
    constructor(price) {
        this._price = price;
    }

    get formattedPrice() {
        return `$${this._price.toFixed(2)}`;
    }

    set price(value) {
        if (value < 0) throw new Error("Price cannot be negative");
        this._price = value;
    }
}

const item = new Product(10);
console.log(item.formattedPrice); // "$10.00"
```

---

## 5. Private Fields (`#`)

Until recently, JS developers used the underscore convention (`_private`) to signal privacy. Modern JavaScript now has hard private fields using the **`#`** prefix.

```javascript
class BankAccount {
    #balance = 0; // Truly private

    deposit(amount) {
        this.#balance += amount;
    }

    get balance() {
        return this.#balance;
    }
}

const account = new BankAccount();
// console.log(account.#balance); // Error! Syntax check prevents access.
```

---

## 6. PHP vs. JavaScript: The OOP Shift

| Feature | PHP | JavaScript |
|---------|-----|------------|
| Constructor | `__construct()` | `constructor()` |
| Property Visibility | `public`, `protected`, `private` | `#` for private, otherwise public |
| Inheritance | `extends` | `extends` |
| Parent access | `parent::method()` | `super.method()` |
| Interface | `interface` | N/A (Needs TypeScript) |
| Traits | `use Trait;` | N/A (Use Composition) |

---

## 7. Key Takeaways
1. **Construction**: `constructor()` is your `__construct()`. Use it to set initial state.
2. **Inheritance**: Always call `super()` in the constructor of a child class before using `this`.
3. **Privacy**: Use `#` if you want variables to be unreachable from outside the class.
4. **Classes vs Objects**: Use classes when you need multiple instances with the same behavior. For one-off data, a plain object literal `{}` is better.
5. **Class "Truth"**: Behind the scenes, a class is just a special function, and the methods are attached to its `prototype`.
6. **Next Steps**: In Node.js, you'll often see classes used in controllers or service layers, though modern trends also lean heavily toward functional programming.
