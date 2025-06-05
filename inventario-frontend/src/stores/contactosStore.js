import { defineStore } from 'pinia';
import apiClient from 'src/services/api';
import { Notify } from 'quasar';

export const useContactosStore = defineStore('contactos', {
  state: () => ({
    contactos: [],
    loading: false,
    error: null,
    filterTipo: null, // Stores the current filter, e.g., 'cliente', 'proveedor', or null for all
  }),
  getters: {
    // Example: Getter to show current filter type, could be useful for UI display
    activeFilterDisplay: (state) => {
      if (!state.filterTipo) return 'Todos';
      return state.filterTipo.charAt(0).toUpperCase() + state.filterTipo.slice(1) + 's';
    }
  },
  actions: {
    async fetchContactos(tipo = null) {
      this.loading = true;
      this.error = null;
      // If 'tipo' is explicitly passed, use it. Otherwise, use the stored filterTipo.
      // This allows calling fetchContactos() to refresh with the current filter.
      const currentFilter = tipo !== undefined ? tipo : this.filterTipo;
      this.filterTipo = currentFilter; // Update filter state

      let url = '/contactos';
      if (currentFilter) {
        url += `?tipo=${currentFilter}`;
      }
      try {
        const response = await apiClient.get(url);
        this.contactos = response.data;
      } catch (err) {
        this.contactos = []; // Clear if error
        this.error = err.response?.data?.message || err.message || 'Error al cargar contactos'; // Standardized message
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
      } finally {
        this.loading = false;
      }
    },
    async createContacto(contactoData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.post('/contactos', contactoData);
        await this.fetchContactos(); // Refresh with current filter
        Notify.create({ type: 'positive', message: 'Contacto creado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const errorMessages = err.response?.data?.errors?.map(e => e.msg) || [];
        if (err.response?.data?.message && !errorMessages.includes(err.response.data.message) ) {
            errorMessages.push(err.response.data.message);
        }
        this.error = errorMessages.length > 0 ? errorMessages.join('<br>') : (err.message || 'Error al crear contacto');
        Notify.create({ type: 'negative', message: this.error, html: true, position: 'top', multiLine: errorMessages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateContacto(id, contactoData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.put(`/contactos/${id}`, contactoData);
        await this.fetchContactos(); // Refresh
        Notify.create({ type: 'positive', message: 'Contacto actualizado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const errorMessages = err.response?.data?.errors?.map(e => e.msg) || [];
         if (err.response?.data?.message && !errorMessages.includes(err.response.data.message) ) {
            errorMessages.push(err.response.data.message);
        }
        this.error = errorMessages.length > 0 ? errorMessages.join('<br>') : (err.message || 'Error al actualizar contacto');
        Notify.create({ type: 'negative', message: this.error, html: true, position: 'top', multiLine: errorMessages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async deleteContacto(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/contactos/${id}`);
        await this.fetchContactos(); // Refresh
        Notify.create({ type: 'positive', message: 'Contacto eliminado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al eliminar contacto';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
