## Old panel of in-cloud.us/manikineko.nl/nekoaxis
### based on the  📚 [Install Tailwind CSS with Vite@React Latest](https://tailwindcss.com/docs/guides/vite) tutorial and my contributions as well as some of a currupt ex COO that doxed me and catfishes people lieing about her age


- 👉 Install React with Vite in "root" folder

```bash
npm create vite@latest . -- --template react
```

- 👉 Install React with Vite in "vite-react" folder

```bash
npm create vite@latest vite-react -- --template react
```

- 👉 Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
```

```bash
npx tailwindcss init -p
```

- 👉 Modify the "tailwind.config.js" file to include the "purge" property

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- 👉 Modify the "index.css" file in src Folder

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- 👉 Run the "vite" server

```bash
npm run dev
```
