<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Gestión de Contactos</div>
      <q-btn label="Nuevo Contacto" color="primary" @click="openCreateDialog" icon="add" />
    </div>

    <div class="q-mb-md row items-center q-gutter-sm">
      <q-select
        v-model="selectedTipoFilter"
        :options="tipoFilterOptions"
        label="Filtrar por tipo"
        emit-value
        map-options
        outlined
        dense
        style="min-width: 220px;"
        @update:model-value="applyFilter"
        clearable
        options-dense
        class="col-auto"
      />
      <q-space />
      <div class="col-auto text-caption text-grey-7">
        Mostrando: {{ store.activeFilterDisplay }} ({{ store.contactos.length }})
      </div>
    </div>

    <q-table
      :title="`Contactos - ${store.activeFilterDisplay}`"
      :rows="store.contactos"
      :columns="columns"
      row-key="_id"
      :loading="store.loading"
      flat
      bordered
      class="shadow-2"
      no-data-label="No hay contactos para mostrar según el filtro actual."
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
          <q-icon size="2em" :name="icon || 'people_outline'" />
          <span>{{ message }}</span>
        </div>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>

    <q-dialog v-model="showDialog" persistent @hide="resetForm">
      <q-card style="min-width: 450px; max-width: 600px; border-radius: 10px;" class="shadow-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingContactoId ? 'Editar' : 'Crear Nuevo' }} Contacto</div>
        </q-card-section>

        <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-select
              filled
              dense
              v-model="formData.tipo"
              :options="['cliente', 'proveedor']"
              label="Tipo de Contacto *"
              lazy-rules
              :rules="[val => !!val || 'Tipo es requerido']"
              options-dense
            />
            <q-input filled dense v-model="formData.identificacion" label="Identificación (Cédula/RUC/Pasaporte) *" lazy-rules :rules="[val => !!val && val.trim().length > 0 || 'Identificación es requerida']" />
            <q-input filled dense v-model="formData.nombre" label="Nombre Completo / Razón Social *" lazy-rules :rules="[val => !!val && val.trim().length > 0 || 'Nombre es requerido']" />
            <q-input filled dense v-model="formData.direccion" label="Dirección *" type="textarea" autogrow lazy-rules :rules="[val => !!val && val.trim().length > 0 || 'Dirección es requerida']" />
            <q-input filled dense v-model="formData.telefono" label="Teléfono" mask="(###) ### - ####" unmasked-value />
            <q-input filled dense v-model="formData.correo_electronico" label="Correo Electrónico" type="email" lazy-rules :rules="[val => !val || /.+@.+\..+/.test(val) || 'Debe ser un correo válido']"/>
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
            <q-btn type="submit" :label="editingContactoId ? 'Actualizar' : 'Guardar'" color="primary" :loading="store.loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useContactosStore } from 'src/stores/contactosStore';
import { useMeta } from 'quasar';

useMeta({ title: 'Contactos' });

const $q = useQuasar();
const store = useContactosStore();

const columns = [
  { name: 'tipo', label: 'Tipo', field: 'tipo', sortable: true, align: 'left', format: val => val ? val.charAt(0).toUpperCase() + val.slice(1) : '' },
  { name: 'identificacion', label: 'Identificación', field: 'identificacion', sortable: true, align: 'left' },
  { name: 'nombre', label: 'Nombre / Razón Social', field: 'nombre', sortable: true, align: 'left', style: 'min-width: 200px; white-space: normal;' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left', style: 'min-width: 250px; white-space: normal;' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', format: val => val || 'N/A' },
  { name: 'correo_electronico', label: 'Email', field: 'correo_electronico', align: 'left', style: 'min-width: 180px;', format: val => val || 'N/A' },
  { name: 'actions', label: 'Acciones', field: '_id', align: 'center', headerClasses: 'q-table--header-actions' }
];

const tipoFilterOptions = [
  { label: 'Todos los Contactos', value: null },
  { label: 'Clientes', value: 'cliente' },
  { label: 'Proveedores', value: 'proveedor' }
];
// Initialize selectedTipoFilter with the store's current filterTipo or null
const selectedTipoFilter = ref(store.filterTipo);


const showDialog = ref(false);
const editingContactoId = ref(null);
const initialFormData = { tipo: null, identificacion: '', nombre: '', direccion: '', telefono: '', correo_electronico: '' };
const formData = reactive({ ...initialFormData });

function resetForm() {
  Object.assign(formData, initialFormData);
  formData.tipo = null; // Ensure type is reset for select
  editingContactoId.value = null;
}

function openCreateDialog() {
  resetForm();
  formData.tipo = 'cliente'; // Default value for new contact
  showDialog.value = true;
}

function openEditDialog(contacto) {
  resetForm();
  editingContactoId.value = contacto._id;
  // Ensure all fields from 'contacto' are assigned to 'formData'
  // This prevents issues if some optional fields are missing on the 'contacto' object
  for (const key in initialFormData) {
    formData[key] = contacto[key] || initialFormData[key];
  }
  showDialog.value = true;
}

async function handleSubmit() {
  let success = false;
  if (editingContactoId.value) {
    success = await store.updateContacto(editingContactoId.value, { ...formData });
  } else {
    success = await store.createContacto({ ...formData });
  }
  if (success) {
    showDialog.value = false;
    // resetForm(); // Optionally reset form immediately
  }
}

function confirmDelete(contacto) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el contacto: <strong>${contacto.nombre}</strong> (Identificación: ${contacto.identificacion})? Esta acción no se puede deshacer.`,
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
    await store.deleteContacto(contacto._id);
  });
}

function applyFilter(value) {
  // The 'value' from q-select when 'clearable' and cleared will be null.
  // store.fetchContactos will handle null as "fetch all".
  store.fetchContactos(value);
}

onMounted(() => {
  // Fetch initial data using the current value of selectedTipoFilter (which defaults to store.filterTipo or null)
  store.fetchContactos(selectedTipoFilter.value);
});
</script>

<style lang="scss">
.q-table--header-actions {
  text-align: center !important;
}
</style>
