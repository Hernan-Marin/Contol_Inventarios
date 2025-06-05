<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Gestión de Productos</div>
      <q-btn label="Nuevo Producto" color="primary" @click="openCreateDialog" icon="add" />
    </div>

    <q-table
      title="Productos"
      :rows="productosStore.productos"
      :columns="columns"
      row-key="_id"
      :loading="productosStore.loading || unidadesStore.loading || almacenesStore.loading"
      flat
      bordered
      class="shadow-2"
      no-data-label="No hay productos para mostrar."
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
          <q-icon size="2em" :name="icon || 'inventory_2'" />
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
          <div class="text-h6">{{ editingProductoId ? 'Editar' : 'Crear Nuevo' }} Producto</div>
        </q-card-section>

        <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-input filled dense v-model="formData.codigo" label="Código *" lazy-rules :rules="[val => !!val && val.trim().length > 0 || 'Código es requerido']" />
            <q-input filled dense v-model="formData.descripcion" label="Descripción *" type="textarea" autogrow lazy-rules :rules="[val => !!val && val.trim().length > 0 || 'Descripción es requerida']" />
            <q-select
              filled
              dense
              v-model="formData.unidad_medida"
              :options="unidadesStore.unidades"
              option-value="_id"
              option-label="udm"
              emit-value
              map-options
              label="Unidad de Medida *"
              lazy-rules
              :rules="[val => !!val || 'Unidad de Medida es requerida']"
              :loading="unidadesStore.loading"
              options-dense
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.udm }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.categoria }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              filled
              dense
              v-model="formData.almacen"
              :options="almacenesStore.almacenes"
              option-value="_id"
              option-label="descripcion"
              emit-value
              map-options
              label="Almacén *"
              lazy-rules
              :rules="[val => !!val || 'Almacén es requerido']"
              :loading="almacenesStore.loading"
              options-dense
            />
            <q-input
              filled
              dense
              v-model.number="formData.stock_minimo"
              label="Stock Mínimo *"
              type="number"
              lazy-rules
              :rules="[
                val => val !== null && val !== '' || 'Stock Mínimo es requerido',
                val => parseFloat(val) >= 0 || 'Stock Mínimo no puede ser negativo'
              ]"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
            <q-btn type="submit" :label="editingProductoId ? 'Actualizar' : 'Guardar'" color="primary" :loading="productosStore.loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useProductosStore } from 'src/stores/productosStore';
import { useUnidadesMedidaStore } from 'src/stores/unidadesMedidaStore';
import { useAlmacenesStore } from 'src/stores/almacenesStore';
import { useMeta } from 'quasar';

useMeta({ title: 'Productos' });

const $q = useQuasar();
const productosStore = useProductosStore();
const unidadesStore = useUnidadesMedidaStore(); // For QSelect options
const almacenesStore = useAlmacenesStore(); // For QSelect options

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', sortable: true, align: 'left', style: 'min-width: 250px; white-space: normal;' },
  { name: 'unidad_medida', label: 'UDM', field: row => row.unidad_medida?.udm, sortable: true, align: 'left' },
  { name: 'almacen', label: 'Almacén', field: row => row.almacen?.descripcion, sortable: true, align: 'left', style: 'min-width: 150px; white-space: normal;' },
  { name: 'stock_minimo', label: 'Stock Mín.', field: 'stock_minimo', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: '_id', align: 'center', headerClasses: 'q-table--header-actions' }
];

const showDialog = ref(false);
const editingProductoId = ref(null);
// Ensure unidad_medida and almacen are null initially so QSelect placeholders work correctly
const initialFormData = { codigo: '', descripcion: '', unidad_medida: null, almacen: null, stock_minimo: 0 };
const formData = reactive({ ...initialFormData });

function resetForm() {
  Object.assign(formData, initialFormData);
  editingProductoId.value = null;
}

function openCreateDialog() {
  resetForm();
  showDialog.value = true;
}

function openEditDialog(producto) {
  resetForm();
  editingProductoId.value = producto._id;
  formData.codigo = producto.codigo;
  formData.descripcion = producto.descripcion;
  // When editing, ensure that formData.unidad_medida and formData.almacen are set to the _id of the related object
  formData.unidad_medida = producto.unidad_medida?._id || null;
  formData.almacen = producto.almacen?._id || null;
  formData.stock_minimo = producto.stock_minimo;
  showDialog.value = true;
}

async function handleSubmit() {
  let success = false;
  // Ensure that the data being submitted has the IDs for unidad_medida and almacen
  const dataToSubmit = {
    ...formData,
    unidad_medida: formData.unidad_medida, // This should be the _id from QSelect
    almacen: formData.almacen,         // This should be the _id from QSelect
  };

  if (editingProductoId.value) {
    success = await productosStore.updateProducto(editingProductoId.value, dataToSubmit);
  } else {
    success = await productosStore.createProducto(dataToSubmit);
  }
  if (success) {
    showDialog.value = false;
    // resetForm(); // Dialog @hide event now handles reset
  }
}

function confirmDelete(producto) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el producto: <strong>${producto.descripcion}</strong> (Código: ${producto.codigo})? Esta acción no se puede deshacer.`,
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
    await productosStore.deleteProducto(producto._id);
  });
}

// Combined loading state for the main table
const overallLoading = computed(() => {
  return productosStore.loading || unidadesStore.loading || almacenesStore.loading;
});

onMounted(async () => {
  // Fetch all necessary data.
  // These stores should ideally prevent re-fetching if data is already loaded and fresh,
  // or this could be optimized further if needed (e.g., by checking if store.items.length > 0)
  await Promise.all([
    productosStore.fetchProductos(),
    unidadesStore.fetchUnidades(),
    almacenesStore.fetchAlmacenes()
  ]);
});
</script>

<style lang="scss">
.q-table--header-actions {
  text-align: center !important;
}
</style>
