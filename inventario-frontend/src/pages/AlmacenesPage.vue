<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Gestión de Almacenes</div>
      <q-btn label="Nuevo Almacén" color="primary" @click="openCreateDialog" icon="add" />
    </div>

    <q-table
      title="Almacenes"
      :rows="store.almacenes"
      :columns="columns"
      row-key="_id"
      :loading="store.loading"
      flat
      bordered
      class="shadow-2"
      no-data-label="No hay almacenes para mostrar."
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
          <q-icon size="2em" :name="icon || 'sentiment_dissatisfied'" />
          <span>{{ message }}</span>
        </div>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>

    <q-dialog v-model="showDialog" persistent @hide="resetForm">
      <q-card style="min-width: 400px; border-radius: 10px;" class="shadow-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingAlmacenId ? 'Editar' : 'Crear Nuevo' }} Almacén</div>
        </q-card-section>

        <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-input
              filled
              dense
              v-model="formData.descripcion"
              label="Descripción *"
              autofocus
              lazy-rules
              :rules="[val => !!val && val.trim().length > 0 || 'Descripción es requerida']"
            />
            <q-input
              filled
              dense
              v-model="formData.ubicacion"
              label="Ubicación (Ej: Estante A, Pasillo 3)"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
            <q-btn type="submit" :label="editingAlmacenId ? 'Actualizar' : 'Guardar'" color="primary" :loading="store.loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useAlmacenesStore } from 'src/stores/almacenesStore';
import { useMeta } from 'quasar';

useMeta({ title: 'Almacenes' });

const $q = useQuasar();
const store = useAlmacenesStore();

const columns = [
  { name: 'descripcion', required: true, label: 'Descripción', align: 'left', field: 'descripcion', sortable: true },
  { name: 'ubicacion', label: 'Ubicación', align: 'left', field: 'ubicacion', sortable: true, format: val => val || 'N/A' },
  {
    name: 'createdAt',
    label: 'Creado',
    field: 'createdAt',
    format: val => val ? new Date(val).toLocaleDateString() : 'N/A',
    sortable: true,
    align: 'center'
  },
  {
    name: 'updatedAt',
    label: 'Actualizado',
    field: 'updatedAt',
    format: val => val ? new Date(val).toLocaleDateString() : 'N/A',
    sortable: true,
    align: 'center'
  },
  { name: 'actions', label: 'Acciones', field: '_id', align: 'center', headerClasses: 'q-table--header-actions' }
];

const showDialog = ref(false);
const editingAlmacenId = ref(null);
const initialFormData = { descripcion: '', ubicacion: '' };
const formData = reactive({ ...initialFormData });

function resetForm() {
  Object.assign(formData, initialFormData);
  editingAlmacenId.value = null;
}

function openCreateDialog() {
  resetForm();
  showDialog.value = true;
}

function openEditDialog(almacen) {
  resetForm();
  editingAlmacenId.value = almacen._id;
  formData.descripcion = almacen.descripcion;
  formData.ubicacion = almacen.ubicacion || ''; // Handle if ubicacion is null/undefined
  showDialog.value = true;
}

async function handleSubmit() {
  let success = false;
  if (editingAlmacenId.value) {
    success = await store.updateAlmacen(editingAlmacenId.value, { ...formData });
  } else {
    success = await store.createAlmacen({ ...formData });
  }
  if (success) {
    showDialog.value = false;
    // resetForm(); // Dialog @hide handles this now
  }
}

function confirmDelete(almacen) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el almacén: <strong>${almacen.descripcion}</strong>? Esta acción no se puede deshacer.`,
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
    await store.deleteAlmacen(almacen._id);
  });
}

onMounted(() => {
  store.fetchAlmacenes();
});
</script>

<style lang="scss">
// Ensure this style is present or defined globally if used across multiple tables
.q-table--header-actions {
  text-align: center !important;
}
</style>
