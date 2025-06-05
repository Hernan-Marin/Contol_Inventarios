// src/services/api.js
import { apiClient as defaultApiClient } from 'boot/axios'; // apiClient is exported from src/boot/axios.js

// You can re-export it or use it to build more specific service functions
// For this subtask, we just need to ensure an apiClient is configured.
// The actual apiClient is already configured in src/boot/axios.js

// Example of how you might use it if you had specific functions:
// const getUnidades = () => {
//   return defaultApiClient.get('/unidades_medidas');
// };

// export { getUnidades, defaultApiClient };

export default defaultApiClient;
