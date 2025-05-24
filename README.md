# react-router-next-routes

A file-based routing library inspired by Next.js App Router, designed specifically for React Router v7 projects!

## ✨ Features
- Supports Next.js-style routing conventions using `layout.tsx` and `page.tsx`
- Supports group folders like `(group)` that are ignored in the URL path
- Supports dynamic routes like `[slug]`
- Supports optional catch-all routes like `[[...slug]]`

## 📁 Example Directory Structure

```lua
app/
├── routes/
│   ├── layout.tsx          ← layout applied to all pages
│   ├── page.tsx            ← "/"
│   ├── about/
│   │   └── page.tsx        ← "/about"
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx    ← "/blog/:slug"
│   └── shop/
│       └── [[...slug]]/
│           └── page.tsx    ← "/shop/*"
```

## 📦 Installation
```bash
npm install react-router-next-routes
```

## 🛠️ Usage
```ts
// routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { nextRoutes } from "react-router-next-routes";
 
export default nextRoutes() satisfies RouteConfig;
```

## 🚫 Unsupported Patterns
- `[...slug]` (required catch-all segments) are not supported

