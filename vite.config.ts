import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import EnvironmentPlugin from "vite-plugin-environment";


// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),EnvironmentPlugin("all")],
})
