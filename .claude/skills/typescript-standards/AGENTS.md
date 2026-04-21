# TypeScript / JavaScript Coding Standards

> **FOR AI AGENTS**: This document provides coding standards and best practices for TypeScript/JavaScript development. Follow these conventions for all code contributions.

---

## 1. Naming

A variable, function, or class name should provide clear answers to fundamental questions. It ought to explain its purpose, functionality, and usage. If a name necessitates a comment to clarify its intent, then the name itself lacks clarity.

### 1.1 Use meaningful variable names

**Bad**

```tsx
const pr = productList.map((p) => p.price);
```

**Good**

```tsx
const priceList = productList.map((product) => product.price);
```

**Parameter names should communicate intent clearly**

**Bad**

```tsx
const hasChildren = (c: HTMLElement) => c.children.length !== 0;
```

**Good**

```tsx
const hasChildren = (element: HTMLElement) => element.children.length !== 0;
```

### 1.2 Use pronounceable variable names

Avoid using terms that you struggle to pronounce.

**Bad**

```tsx
class Cust {
  public cId: number;
  public billingAddrId: number;
  public shippingAddrId: number;
}
```

**Good**

```tsx
class Customer {
  public id: number;
  public billingAddressId: number;
  public shippingAddressId: number;
}
```

### 1.3 Use names that are context specific

Avoid redundant information. Don't repeat yourself (DRY).

**Bad (in a project called `user_management`)**

```tsx
const userLogin = () => {...};
const userRegister = () => {...};
```

**Good**

```tsx
const login = () => {...};
const register = () => {...};
```

**Using suffixes for clarity**

**Bad (in a project called `acme`)**

```tsx
const AcmeText = () => {};
```

**Good**

```tsx
const Text = () => {};
```

**Bad (in a class called `Account`)**

```tsx
type Account = {
  accountId: string;
  accountName: string;
  accountType: string;
};

function print(account: Account) {
  console.log(
    `${account.accountId} ${account.accountType} (${account.accountName})`,
  );
}
```

**Good**

```tsx
interface Account {
  id: string;
  name: string;
  type: string;
}

function print(account: Account) {
  console.log(`${account.id} ${account.type} (${account.name})`);
}
```

### 1.4 Naming convention

- **camelCase**: variables and functions.
- **UPPERCASE**: constants.
- **PascalCase**: classes, interfaces, types, and enums.

**Bad**

```tsx
const TotalPrice = 3.0 * tax;

function PrintAccountBalance() {...}

const NotifyUser = () => {};
```

**Good**

```tsx
const totalPrice = 3.0 * tax;

function printAccountBalance() {...}

const notifyUser = () => {};
```

**Booleans: Don't use negative names**

**Bad**

```tsx
const isNotLoading = true;
const isNotEnabled = true;
const isNotEqual = (a, b) => a !== b;
```

**Good**

```tsx
const isLoading = false;
const isEnabled = false;
const isEqual = (a, b) => a === b;
```

---

## 2. Enums

### 2.1 Prefer readonly constant POJO over enums

**Not advisable**

```tsx
enum WeekDays {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}
```

**Good**

```tsx
const WEEK_DAYS = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
} as const;

type WeekDays = (typeof WEEK_DAYS)[keyof typeof WEEK_DAYS];
```

---

## 3. Interfaces & Types

### 3.1 Do not prefix with "I" or "T"

**Bad**

```tsx
interface ITextProps {...}
type TAmount = number;
```

**Good**

```tsx
interface TextProps {...}
type Amount = number;
```

### 3.2 Prefer interface to type aliases

Use type aliases primarily for Unions, Tuples, or giving primitives meaning.

### 3.3 Prefer union type over extensions

**Bad**

```tsx
interface ProductAmount {
  amount: number;
  currency: Currency;
  country: Country;
}

interface Product extends ProductAmount {
  id: Uuid;
  name: string;
}
```

**Good**

```tsx
type Product = ProductDetails & ProductAmount;
```

### 3.4 Prefer type inference

**Good**

```tsx
const getTotalAmount = (prices: number[]) => {
  // Return type is inferred
  let totalAmount = 0.0;

  for (const price of prices) {
    totalAmount += price * VAT;
  }

  return totalAmount;
};
```

---

## 4. Classes

### 4.1 Method spacing

Methods should be separated with a new line.

### 4.2 Short constructor syntax

**Better**

```tsx
class Person {
  constructor(
    private name: string,
    private age: number,
  ) {}
}
```

### 4.3 Getters and Setters for computed attributes

**Better**

```tsx
class Product {
  constructor(private priceList: number[]) {}

  get totalAmount() {
    return this.priceList.reduce((acc, price) => acc + price * VAT, 0);
  }
}
```

---

## 5. Generics

### 5.1 Use descriptive names for generic parameters

**Bad**

```tsx
interface Employee<D> {
  meta: D;
}
```

**Good**

```tsx
interface Employee<TMeta> {
  meta: TMeta;
}
```

---

## 6. Expressions and Conditions

### 6.1 Avoid complex expressions in IF statements

**Bad**

```tsx
if(age > 18 && age <= 90) { ... }
```

**Good**

```tsx
const isAcceptableVotingAge = age > MINIMUM_VOTING_AGE && age <= MAXIMUM_VOTING_AGE;

if(isAcceptableVotingAge) { ... }
```

### 6.2 Prefer early returns

**Good**

```tsx
const sendEmailRequest = async (email: string) => {
  if (isEmpty(email) || !isValidEmail(email)) return;

  // send email api request here
};
```

### 6.3 Avoid complex ternary operations

Nested or chained ternary operators reduce readability and make debugging difficult. Use `if/else` statements or early returns instead.

**Bad**

```tsx
const getStatusLabel = (status: string) =>
  status === 'pending'
    ? 'Awaiting Review'
    : status === 'approved'
      ? 'Approved'
      : status === 'rejected'
        ? 'Rejected'
        : 'Unknown';

const message =
  isLoading ? 'Loading...' : hasError ? 'Error occurred' : data ? data.message : 'No data';
```

**Good**

```tsx
const getStatusLabel = (status: string) => {
  if (status === 'pending') return 'Awaiting Review';
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';

  return 'Unknown';
};

// Or use a lookup object for mappings
const STATUS_LABELS = {
  pending: 'Awaiting Review',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? 'Unknown';
```

**Good (for simple conditional rendering)**

```tsx
// Simple ternaries are acceptable
const buttonLabel = isSubmitting ? 'Saving...' : 'Save';

// For multiple conditions, extract to a function or use if/else
const getMessage = () => {
  if (isLoading) return 'Loading...';
  if (hasError) return 'Error occurred';
  if (data) return data.message;

  return 'No data';
};

const message = getMessage();
```

---

## 7. Components

### 7.1 Avoid constant components

**Bad**

```tsx
const Product: React.FC = ({ name, price }) => { ... }
```

**Good**

```tsx
export function Product({ name, price }: ProductProps) { ... }
```

### 7.2 Prefer Readonly<> for Props

**Good**

```tsx
interface PlanCardProps {
  businessName: string;
  id: number;
}

export function PlanCard(props: Readonly<PlanCardProps>) { ... }
```

---

## 8. Import and Exports

### 8.1 Prefer named exports

**Good**

```tsx
export function Product() {...}
```

### 8.2 Barrel-export components

Use an `index.ts` file in your folders to group exports.

```tsx
// index.ts
export * from './product-card';
export * from './product-price';
```

---

## 9. File Layout

1. Import statements
2. Interfaces and Type aliases
3. Constants
4. Exports (Functions/Components)
5. Private module functions / variables

---

## 10. Code Formatting

### 10.1 Add newlines before key statements

Add a blank line before `return`, conditionals (`if`/`else`), `await`, and variable declarations/initializations to improve readability.

**Bad**

```tsx
const fetchUserData = async (userId: string) => {
  const isValid = validateId(userId);
  if (!isValid) {
    throw new Error('Invalid user ID');
  }
  const response = await api.getUser(userId);
  const user = response.data;
  return user;
};
```

**Good**

```tsx
const fetchUserData = async (userId: string) => {
  const isValid = validateId(userId);

  if (!isValid) {
    throw new Error('Invalid user ID');
  }

  const response = await api.getUser(userId);
  const user = response.data;

  return user;
};
```

**Bad**

```tsx
const processOrder = async (order: Order) => {
  const items = order.items;
  const total = calculateTotal(items);
  if (total > MAX_ORDER_AMOUNT) {
    return { error: 'Order exceeds maximum amount' };
  }
  await validateInventory(items);
  await chargeCustomer(order.customerId, total);
  const confirmation = await createOrderConfirmation(order);
  return confirmation;
};
```

**Good**

```tsx
const processOrder = async (order: Order) => {
  const items = order.items;
  const total = calculateTotal(items);

  if (total > MAX_ORDER_AMOUNT) {
    return { error: 'Order exceeds maximum amount' };
  }

  await validateInventory(items);
  await chargeCustomer(order.customerId, total);

  const confirmation = await createOrderConfirmation(order);

  return confirmation;
};
```

---

