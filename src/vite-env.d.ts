/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
} //👈 告訴 TypeScript 所有 .vue 文件都是 Vue 組件