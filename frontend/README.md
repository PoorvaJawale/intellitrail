# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Guide to run this Project:

## to run backend:
```
source .venv/bin/activate  
uvicorn api.main:app --reload           
```

## to run frontend:
```
cd frontend
npm run dev
```

## Supabase setup for teammates

This project reads Supabase credentials from local env variables in `.env.local`.

1. Copy `.env.local.example` to `.env.local`
2. Add your project values:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
3. Start frontend normally (`npm run dev`)

Notes:
- `.env.local` is ignored by git, so secrets are not pushed.
- Share keys securely (password manager/secret manager), not in chat or git.
- Never use the service role key in frontend code.