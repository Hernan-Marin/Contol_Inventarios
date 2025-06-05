<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Gestión de Registros</div>
      <q-btn label="Nuevo Registro" color="primary" @click="openCreateDialog" icon="add_box" />
    </div>

    <q-table
      title="Registros de Inventario"
      :rows="registrosStore.registros"
      :columns="columns"
      row-key="_id"
      :loading="combinedLoading"
      flat
      bordered
      class="shadow-2"
      no-data-label="No hay registros para mostrar."
      loading-label="Cargando..."
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn dense round flat icon="edit" @click="openEditDialog(props.row)" class="q-mr-sm">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn dense round flat icon="delete" @click="confirmDelete(props.row)" color="negative">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data="{ icon, message }">
        <div class="full-width row flex-center text-grey q-gutter-sm q-py-lg">
          <q-icon size="2em" :name="icon || 'receipt_long'" />
          <span>{{ message }}</span>
        </div>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>

    <q-dialog v-model="showDialog" persistent @hide="resetForm">
      <q-card style="min-width: 500px; max-width: 700px; border-radius: 10px;" class="shadow-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingRegistroId ? 'Editar' : 'Crear Nuevo' }} Registro</div>
        </q-card-section>

        <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-input filled dense v-model="formData.fecha" label="Fecha *" type="date" stack-label lazy-rules :rules="[val => !!val || 'Fecha es requerida']" />
            <q-select
              filled
              dense
              v-model="formData.tipo"
              :options="['entrada', 'salida']"
              label="Tipo de Registro *"
              lazy-rules
              :rules="[val => !!val || 'Tipo es requerido']"
              @update:model-value="onTipoChange"
            />
            <q-select
              filled
              dense
              v-model="formData.almacen"
              :options="almacenesStore.almacenes"
              option-value="_id"
              option-label="descripcion"
              emit-value map-options
              label="Almacén *"
              lazy-rules
              :rules="[val => !!val || 'Almacén es requerido']"
              :loading="almacenesStore.loading"
              options-dense
            />
            <q-select
              filled
              dense
              v-model="formData.codigo_articulo"
              :options="productosStore.productos"
              option-value="_id"
              :option-label="opt => `${opt.codigo} - ${opt.descripcion}`"
              emit-value map-options
              label="Artículo (Producto) *"
              lazy-rules
              :rules="[val => !!val || 'Artículo es requerido']"
              :loading="productosStore.loading"
              options-dense
            />
             <q-select
              filled
              dense
              v-model="formData.unidad_medida"
              :options="unidadesStore.unidades"
              option-value="_id"
              :option-label="opt => `${opt.udm} (${opt.categoria})`"
              emit-value map-options
              label="Unidad de Medida *"
              lazy-rules
              :rules="[val => !!val || 'Unidad de Medida es requerida']"
              :loading="unidadesStore.loading"
              options-dense
            />

            <q-select
              v-if="formData.tipo === 'entrada'"
              filled
              dense
              v-model="formData.codigo_proveedor"
              :options="proveedoresOptions"
              option-value="_id"
              :option-label="opt => `${opt.nombre} (ID: ${opt.identificacion})`"
              emit-value map-options
              label="Proveedor *"
              lazy-rules
              :rules="[val => formData.tipo === 'entrada' ? !!val : true || 'Proveedor es requerido para entradas']"
              :loading="contactosStore.loading"
              clearable
              options-dense
            />
            <q-select
              v-if="formData.tipo === 'salida'"
              filled
              dense
              v-model="formData.entregado_a"
              :options="clientesOptions"
              option-value="_id"
              :option-label="opt => `${opt.nombre} (ID: ${opt.identificacion})`"
              emit-value map-options
              label="Entregado A (Cliente) *"
              lazy-rules
              :rules="[val => formData.tipo === 'salida' ? !!val : true || 'Entregado A es requerido para salidas']"
              :loading="contactosStore.loading"
              clearable
              options-dense
            />
            <q-input filled dense v-model="formData.observaciones" label="Observaciones" type="textarea" autogrow />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
            <q-btn type="submit" :label="editingRegistroId ? 'Actualizar' : 'Guardar'" color="primary" :loading="registrosStore.loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useQuasar, date } from 'quasar'; // Import date from quasar
import { useRegistrosStore } from 'src/stores/registrosStore';
import { useProductosStore } from 'src/stores/productosStore';
import { useAlmacenesStore } from 'src/stores/almacenesStore';
import { useUnidadesMedidaStore } from 'src/stores/unidadesMedidaStore';
import { useContactosStore } from 'src/stores/contactosStore';
import { useMeta } from 'quasar';

useMeta({ title: 'Registros de Inventario' });

const $q = useQuasar();
const registrosStore = useRegistrosStore();
const productosStore = useProductosStore();
const almacenesStore = useAlmacenesStore();
const unidadesStore = useUnidadesMedidaStore();
const contactosStore = useContactosStore();

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss'), sortable: true, align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', sortable: true, align: 'left', format: val => val ? val.charAt(0).toUpperCase() + val.slice(1) : '' },
  { name: 'almacen', label: 'Almacén', field: row => row.almacen?.descripcion, sortable: true, align: 'left', style: 'min-width: 150px; white-space: normal;' },
  { name: 'codigo_articulo', label: 'Artículo', field: row => `${row.codigo_articulo?.codigo || ''} - ${row.codigo_articulo?.descripcion || ''}`, sortable: true, align: 'left', style: 'min-width: 250px; white-space: normal;' },
  { name: 'unidad_medida', label: 'UDM', field: row => row.unidad_medida?.udm, sortable: true, align: 'left' },
  { name: 'codigo_proveedor', label: 'Proveedor', field: row => row.codigo_proveedor?.nombre, sortable: true, align: 'left', style: 'min-width: 150px; white-space: normal;' },
  { name: 'entregado_a', label: 'Entregado A', field: row => row.entregado_a?.nombre, sortable: true, align: 'left', style: 'min-width: 150px; white-space: normal;' },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'left', classes: 'text-truncate', style: 'max-width: 150px', format: val => val || 'N/A' },
  { name: 'actions', label: 'Acciones', field: '_id', align: 'center', headerClasses: 'q-table--header-actions' }
];

const showDialog = ref(false);
const editingRegistroId = ref(null);
const initialFormData = {
  fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'), // Default to today
  tipo: 'entrada', // Default type
  almacen: null,
  codigo_articulo: null,
  unidad_medida: null,
  codigo_proveedor: null,
  entregado_a: null,
  observaciones: ''
};
const formData = reactive({ ...initialFormData });

const proveedoresOptions = computed(() => contactosStore.contactos.filter(c => c.tipo === 'proveedor'));
const clientesOptions = computed(() => contactosStore.contactos.filter(c => c.tipo === 'cliente'));

function onTipoChange(newTipo) {
  // When tipo changes, reset the conditional fields
  if (newTipo === 'entrada') {
    formData.entregado_a = null;
  } else if (newTipo === 'salida') {
    formData.codigo_proveedor = null;
  } else { // Should not happen with current QSelect options
    formData.codigo_proveedor = null;
    formData.entregado_a = null;
  }
}

function resetForm() {
  Object.assign(formData, initialFormData);
  formData.fecha = date.formatDate(Date.now(), 'YYYY-MM-DD'); // Ensure date is reset to current
  formData.tipo = 'entrada'; // Reset tipo to default
  editingRegistroId.value = null;
}

function openCreateDialog() {
  resetForm();
  showDialog.value = true;
}

function openEditDialog(registro) {
  resetForm();
  editingRegistroId.value = registro._id;

  formData.fecha = date.formatDate(registro.fecha, 'YYYY-MM-DD');
  formData.tipo = registro.tipo;
  formData.almacen = registro.almacen?._id || null;
  formData.codigo_articulo = registro.codigo_articulo?._id || null;
  formData.unidad_medida = registro.unidad_medida?._id || null;
  formData.observaciones = registro.observaciones || '';

  // Conditional fields based on type
  if (registro.tipo === 'entrada') {
    formData.codigo_proveedor = registro.codigo_proveedor?._id || null;
    formData.entregado_a = null; // Ensure other type's field is null
  } else if (registro.tipo === 'salida') {
    formData.entregado_a = registro.entregado_a?._id || null;
    formData.codigo_proveedor = null; // Ensure other type's field is null
  }

  showDialog.value = true;
}

async function handleSubmit() {
  let success = false;
  const dataToSubmit = { ...formData };
  // Ensure IDs are correctly assigned for related fields
  // QSelect with emit-value and map-options already provides the _id

  if (editingRegistroId.value) {
    success = await registrosStore.updateRegistro(editingRegistroId.value, dataToSubmit);
  } else {
    success = await registrosStore.createRegistro(dataToSubmit);
  }
  if (success) {
    showDialog.value = false;
    // Form is reset by @hide on QDialog
  }
}

function confirmDelete(registro) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el registro del ${date.formatDate(registro.fecha, 'YYYY-MM-DD HH:mm')} para el artículo ${registro.codigo_articulo?.codigo || 'desconocido'}? Esta acción no se puede deshacer.`,
    html: true,
    cancel: {
      label: 'Cancelar',
      color: 'grey-8',
      flat: true,
    },
    persistent: true,
    ok: {
      label: 'Eliminar Definitivamente',
      color: 'negative',
      unelevated: true,
    }
  }).onOk(async () => {
    await registrosStore.deleteRegistro(registro._id);
  });
}

const combinedLoading = computed(() => {
  return registrosStore.loading || productosStore.loading || almacenesStore.loading || unidadesStore.loading || contactosStore.loading;
});

onMounted(async () => {
  // Fetch all necessary data concurrently
  await Promise.all([
    registrosStore.fetchRegistros(),
    productosStore.fetchProductos(),
    almacenesStore.fetchAlmacenes(),
    unidadesStore.fetchUnidades(),
    contactosStore.fetchContactos() // Fetch all contacts for dropdowns
  ]);
});
</script>

<style lang="scss">
.q-table--header-actions {
  text-align: center !important;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
