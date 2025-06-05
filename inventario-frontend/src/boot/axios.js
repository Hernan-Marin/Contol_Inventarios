import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const apiClient = axios.create({ baseURL: VITE_API_URL });

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  // TODO: Remove this.$axios, it's deprecated. this.$api is the way to go.
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = apiClient
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { apiClient } // Making it available for import in services, etc.
