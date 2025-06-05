import { defineStore } from 'pinia';
import apiClient from 'src/services/api'; // Path to the pre-configured Axios instance
import { Notify, Dialog } from 'quasar'; // Using Quasar's Notify and Dialog

export const useUnidadesMedidaStore = defineStore('unidadesMedida', {
  state: () => ({
    unidades: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchUnidades() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/unidades_medidas');
        this.unidades = response.data;
      } catch (err) {
        this.unidades = []; // Clear data on error
        this.error = err.response?.data?.message || err.message || 'Error al cargar unidades de medida';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
      } finally {
        this.loading = false;
      }
    },
    async createUnidad(unidadData) {
      this.loading = true;
      this.error = null;
      try {
        // The backend is expected to return the created object
        const response = await apiClient.post('/unidades_medidas', unidadData);
        // To ensure data consistency and get any server-generated fields (like _id, timestamps)
        // it's often better to fetch the entire list again or add the exact returned item.
        // For simplicity and consistency with other actions, we'll refetch.
        await this.fetchUnidades();
        Notify.create({ type: 'positive', message: 'Unidad de Medida creada exitosamente.', position: 'top' });
        return true; // Indicate success
      } catch (err) {
        const messages = err.response?.data?.errors?.map(e => e.msg) || [];
        // Add original message if errors array is empty but message exists
        if (messages.length === 0 && err.response?.data?.message) {
          messages.push(err.response.data.message);
        }
        this.error = messages.length > 0 ? messages.join('<br>') : (err.message || 'Error al crear unidad de medida');
        Notify.create({ type: 'negative', message: this.error, html: messages.length > 0, position: 'top', multiLine: messages.length > 1 });
        return false; // Indicate failure
      } finally {
        this.loading = false;
      }
    },
    async updateUnidad(id, unidadData) {
      this.loading = true;
      this.error = null;
      try {
        // The backend is expected to return the updated object
        const response = await apiClient.put(`/unidades_medidas/${id}`, unidadData);
        await this.fetchUnidades(); // Refresh the list for consistency
        Notify.create({ type: 'positive', message: 'Unidad de Medida actualizada exitosamente.', position: 'top' });
        return true; // Indicate success
      } catch (err) {
        const messages = err.response?.data?.errors?.map(e => e.msg) || [];
        if (messages.length === 0 && err.response?.data?.message) {
          messages.push(err.response.data.message);
        }
        this.error = messages.length > 0 ? messages.join('<br>') : (err.response?.data?.message || err.message || 'Error al actualizar unidad de medida');
        Notify.create({ type: 'negative', message: this.error, html: messages.length > 0, position: 'top', multiLine: messages.length > 1 });
        return false; // Indicate failure
      } finally {
        this.loading = false;
      }
    },
    async deleteUnidad(id) {
      // Confirmation should be handled in the component before calling this action
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/unidades_medidas/${id}`);
        await this.fetchUnidades(); // Refresh the list
        Notify.create({ type: 'positive', message: 'Unidad de Medida eliminada exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al eliminar unidad de medida';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
