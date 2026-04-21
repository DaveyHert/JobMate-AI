---
name: typescript-standards
description: TypeScript and JavaScript coding standards with strict conventions. Use when writing or reviewing TypeScript/JavaScript code to ensure naming, typing, and structural best practices. Triggers on code creation, refactoring, or quality reviews.
license: MIT
metadata:
  author: llm-agents
  version: "1.0.0"
---

# TypeScript / JavaScript Coding Standards

Comprehensive TypeScript and JavaScript coding standards covering naming, types, classes, generics, expressions, components, and file organization patterns.

## When to Apply

Reference these guidelines when:
- Writing new TypeScript/JavaScript code
- Reviewing code for naming and type safety
- Refactoring existing code for clarity
- Defining interfaces, types, and classes
- Structuring components and modules

## Rule Categories

| Category | Focus Area | Rules |
|----------|-----------|-------|
| Naming | Meaningful variables, pronounceable names, context-specific naming | 4 rules |
| Enums | Prefer readonly constants over enums | 1 rule |
| Interfaces & Types | Naming conventions, type vs interface, unions, type inference | 4 rules |
| Classes | Method spacing, constructor syntax, getters/setters | 3 patterns |
| Generics | Descriptive generic parameter names | 1 rule |
| Expressions | Avoid complex IF statements, prefer early returns | 2 patterns |
| Components | Function exports, readonly props | 2 patterns |
| Imports/Exports | Named exports, barrel exports | 2 patterns |
| File Layout | Organized file structure | 5 sections |

## Quick Reference

### Naming Conventions
- **camelCase**: variables and functions (`getUserData`, `totalPrice`)
- **UPPERCASE**: constants (`MAX_RETRIES`, `API_URL`)
- **PascalCase**: classes, interfaces, types, enums (`UserProps`, `ProductDetails`)

### Type Patterns
- Prefer `interface` over `type` aliases (except for unions/tuples)
- No `I` or `T` prefixes (`UserProps` not `IUserProps`)
- Use type inference where possible
- Prefer union types over extensions

### Component Patterns
- Use function declarations, not const components
- Apply `Readonly<>` for props
- Named exports only (no default exports)
- Barrel-export via `index.ts`

### File Layout Order
1. Import statements
2. Interfaces and Type aliases
3. Constants
4. Exports (Functions/Components)
5. Private module functions/variables

## Full Compiled Document

For the complete guide with all rules and examples: `AGENTS.md`
