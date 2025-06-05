<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Gestión de Unidades de Medida</div>
      <q-btn label="Nueva Unidad" color="primary" @click="openCreateDialog" icon="add" />
    </div>

    <q-table
      title="Unidades"
      :rows="store.unidades"
      :columns="columns"
      row-key="_id"
      :loading="store.loading"
      flat
      bordered
      class="shadow-2"
      no-data-label="No hay unidades de medida para mostrar."
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
          <div class="text-h6">{{ editingUnitId ? 'Editar' : 'Crear Nueva' }} Unidad de Medida</div>
        </q-card-section>

        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-card-section class="q-pt-md">
            <q-input
              filled
              dense
              v-model="formData.categoria"
              label="Categoría *"
              autofocus
              lazy-rules
              :rules="[val => !!val && val.trim().length > 0 || 'Categoría es requerida']"
            />
            <q-input
              filled
              dense
              v-model="formData.udm"
              label="UDM (Ej: Kg, Lt, Un.) *"
              lazy-rules
              :rules="[val => !!val && val.trim().length > 0 || 'UDM es requerida']"
              class="q-mt-sm"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="Cancelar" color="grey-8" v-close-popup @click="resetForm" />
            <q-btn type="submit" :label="editingUnitId ? 'Actualizar' : 'Guardar'" color="primary" :loading="store.loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useUnidadesMedidaStore } from 'src/stores/unidadesMedidaStore';
import { useMeta } from 'quasar';

useMeta({ title: 'Unidades de Medida' });

const $q = useQuasar();
const store = useUnidadesMedidaStore();

const columns = [
  { name: 'categoria', required: true, label: 'Categoría', align: 'left', field: 'categoria', sortable: true },
  { name: 'udm', required: true, label: 'UDM', align: 'left', field: 'udm', sortable: true },
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
const editingUnitId = ref(null);
const initialFormData = { categoria: '', udm: '' };
const formData = reactive({ ...initialFormData });

function resetForm() {
  Object.assign(formData, initialFormData);
  editingUnitId.value = null;
}

function openCreateDialog() {
  resetForm();
  showDialog.value = true;
}

function openEditDialog(unit) {
  resetForm(); // Clear form first
  editingUnitId.value = unit._id; // Set ID before assigning data to reactive form
  formData.categoria = unit.categoria;
  formData.udm = unit.udm;
  showDialog.value = true;
}

async function handleSubmit() {
  let success = false;
  if (editingUnitId.value) {
    success = await store.updateUnidad(editingUnitId.value, { ...formData });
  } else {
    success = await store.createUnidad({ ...formData });
  }
  if (success) {
    showDialog.value = false;
    // Form is reset by openCreateDialog or openEditDialog next time,
    // or if you want to reset after successful submission:
    // resetForm(); // Uncomment if you want form to clear immediately after successful submit
  }
}

function confirmDelete(unit) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar la unidad de medida: <strong>${unit.udm}</strong> (Categoría: ${unit.categoria})? Esta acción no se puede deshacer.`,
    html: true, // Enable HTML messages
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
    const success = await store.deleteUnidad(unit._id);
    // Optionally, show another notification if needed, though store handles it.
  });
}

onMounted(() => {
  store.fetchUnidades();
});
</script>

<style lang="scss">
.q-table--header-actions {
  text-align: center !important;
}

.q-table tbody td.actions-cell {
  text-align: center;
}
</style>
