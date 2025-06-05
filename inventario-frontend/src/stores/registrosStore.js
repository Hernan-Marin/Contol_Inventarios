import { defineStore } from 'pinia';
import apiClient from 'src/services/api';
import { Notify } from 'quasar';

export const useRegistrosStore = defineStore('registros', {
  state: () => ({
    registros: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchRegistros() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/registros');
        this.registros = response.data;
      } catch (err) {
        this.registros = [];
            this.error = err.response?.data?.message || err.message || 'Error al cargar registros'; // Standardized
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
      } finally {
        this.loading = false;
      }
    },
    async createRegistro(registroData) {
      this.loading = true;
      this.error = null;
      try {
        // Remove empty conditional fields before sending to backend
        // The backend model's pre-save hook handles ensuring the correct field is present/absent
        const payload = { ...registroData };
        // if (payload.tipo === 'entrada') {
        //   delete payload.entregado_a; // Or ensure it's null if schema allows
        // } else if (payload.tipo === 'salida') {
        //   delete payload.codigo_proveedor; // Or ensure it's null
        // }
        // No need to delete here, let the backend pre-save hook handle it.
        // Just ensure that if a field is not applicable and not filled, it's null or undefined.
        if (payload.tipo === 'entrada' && !payload.codigo_proveedor) payload.codigo_proveedor = null;
        if (payload.tipo === 'salida' && !payload.entregado_a) payload.entregado_a = null;


        await apiClient.post('/registros', payload);
        await this.fetchRegistros(); // Refresh
        Notify.create({ type: 'positive', message: 'Registro creado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const errorMessages = err.response?.data?.errors?.map(e => e.msg) || [];
        if (err.response?.data?.message && !errorMessages.includes(err.response.data.message) ) {
            errorMessages.push(err.response.data.message);
        }
        this.error = errorMessages.length > 0 ? errorMessages.join('<br>') : (err.message || 'Error al crear registro');
        Notify.create({ type: 'negative', message: this.error, html: true, position: 'top', multiLine: errorMessages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateRegistro(id, registroData) {
      this.loading = true;
      this.error = null;
      try {
        const payload = { ...registroData };
        // Similar to create, ensure non-applicable fields are null or let backend handle it
        // if (payload.tipo === 'entrada') {
        //   payload.entregado_a = null; // Explicitly nullify if type changed
        // } else if (payload.tipo === 'salida') {
        //   payload.codigo_proveedor = null; // Explicitly nullify
        // }
        if (payload.tipo === 'entrada' && !payload.codigo_proveedor) payload.codigo_proveedor = null;
        if (payload.tipo === 'salida' && !payload.entregado_a) payload.entregado_a = null;


        await apiClient.put(`/registros/${id}`, payload);
        await this.fetchRegistros(); // Refresh
        Notify.create({ type: 'positive', message: 'Registro actualizado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const errorMessages = err.response?.data?.errors?.map(e => e.msg) || [];
        if (err.response?.data?.message && !errorMessages.includes(err.response.data.message) ) {
            errorMessages.push(err.response.data.message);
        }
        this.error = errorMessages.length > 0 ? errorMessages.join('<br>') : (err.message || 'Error al actualizar registro');
        Notify.create({ type: 'negative', message: this.error, html: true, position: 'top', multiLine: errorMessages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async deleteRegistro(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/registros/${id}`);
        await this.fetchRegistros(); // Refresh
        Notify.create({ type: 'positive', message: 'Registro eliminado exitosamente.', position: 'top' });
        return true; // Ensure consistent return
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al eliminar registro';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
        return false; // Ensure consistent return
      } finally {
        this.loading = false;
      }
    },
  },
});
