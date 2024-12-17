declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>, // props
    Record<string, unknown>, // data
    unknown // methods
  >
  export default component
}
