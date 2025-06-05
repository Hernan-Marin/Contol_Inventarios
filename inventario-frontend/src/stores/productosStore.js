import { defineStore } from 'pinia';
import apiClient from 'src/services/api';
import { Notify } from 'quasar';

export const useProductosStore = defineStore('productos', {
  state: () => ({
    productos: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProductos() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/productos');
        // Backend populates 'unidad_medida' and 'almacen' objects
        this.productos = response.data;
      } catch (err) {
        this.productos = [];
        this.error = err.response?.data?.message || err.message || 'Error al cargar productos'; // Standardized
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
      } finally {
        this.loading = false;
      }
    },
    async createProducto(productoData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.post('/productos', productoData);
        await this.fetchProductos(); // Refresh
        Notify.create({ type: 'positive', message: 'Producto creado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const errorMessages = err.response?.data?.errors?.map(e => e.msg) || [];
         if (err.response?.data?.message && !errorMessages.includes(err.response.data.message) ) {
            errorMessages.push(err.response.data.message);
        }
        this.error = errorMessages.length > 0 ? errorMessages.join('<br>') : (err.message || 'Error al crear producto');
        Notify.create({ type: 'negative', message: this.error, html: true, position: 'top', multiLine: errorMessages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateProducto(id, productoData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.put(`/productos/${id}`, productoData);
        await this.fetchProductos(); // Refresh
        Notify.create({ type: 'positive', message: 'Producto actualizado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        const errorMessages = err.response?.data?.errors?.map(e => e.msg) || [];
        if (err.response?.data?.message && !errorMessages.includes(err.response.data.message) ) {
            errorMessages.push(err.response.data.message);
        }
        this.error = errorMessages.length > 0 ? errorMessages.join('<br>') : (err.message || 'Error al actualizar producto');
        Notify.create({ type: 'negative', message: this.error, html: true, position: 'top', multiLine: errorMessages.length > 1 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    async deleteProducto(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/productos/${id}`);
        await this.fetchProductos(); // Refresh
        Notify.create({ type: 'positive', message: 'Producto eliminado exitosamente.', position: 'top' });
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al eliminar producto';
        Notify.create({ type: 'negative', message: this.error, position: 'top' });
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
