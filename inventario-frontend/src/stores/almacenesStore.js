import { defineStore } from 'pinia';
import apiClient from 'src/services/api';
import { Notify } from 'quasar';

export const useAlmacenesStore = defineStore('almacenes', {
  state: () => ({
    almacenes: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAlmacenes() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/almacenes');
        this.almacenes = response.data;
      } catch (err) {
            this.almacenes = []; // Clear data on error
            this.error = err.response?.data?.message || err.message || 'Error al cargar almacenes';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
      } finally {
        this.loading = false;
      }
    },
    async createAlmacen(almacenData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.post('/almacenes', almacenData);
        await this.fetchAlmacenes(); // Refresh
        Notify.create({ type: 'positive', message: 'Almacén creado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const messages = err.response?.data?.errors?.map(e => e.msg) || [];
            if (messages.length === 0 && err.response?.data?.message) {
              messages.push(err.response.data.message);
            }
            this.error = messages.length > 0 ? messages.join('<br>') : (err.message || 'Error al crear almacén');
            Notify.create({ type: 'negative', message: this.error, html: messages.length > 0, position: 'top', multiLine: messages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateAlmacen(id, almacenData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.put(`/almacenes/${id}`, almacenData);
        await this.fetchAlmacenes(); // Refresh
        Notify.create({ type: 'positive', message: 'Almacén actualizado exitosamente.', position: 'top' });
        return true;
          } catch (err) {
            const messages = err.response?.data?.errors?.map(e => e.msg) || [];
            if (messages.length === 0 && err.response?.data?.message) {
              messages.push(err.response.data.message);
            }
            this.error = messages.length > 0 ? messages.join('<br>') : (err.message || 'Error al actualizar almacén');
            Notify.create({ type: 'negative', message: this.error, html: messages.length > 0, position: 'top', multiLine: messages.length > 1 });
            return false;
          } finally {
            this.loading = false;
      }
    },
    async deleteAlmacen(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/almacenes/${id}`);
        await this.fetchAlmacenes(); // Refresh
        Notify.create({ type: 'positive', message: 'Almacén eliminado exitosamente.', position: 'top' });
            return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al eliminar almacén';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
            return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
