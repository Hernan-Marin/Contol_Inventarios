const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { title: 'Dashboard' } },
      { path: 'productos', component: () => import('pages/ProductosPage.vue'), meta: { title: 'Productos' } },
      { path: 'registros', component: () => import('pages/RegistrosPage.vue'), meta: { title: 'Registros' } },
      { path: 'unidades-medida', component: () => import('pages/UnidadesMedidaPage.vue'), meta: { title: 'Unidades de Medida' } },
      { path: 'almacenes', component: () => import('pages/AlmacenesPage.vue'), meta: { title: 'Almacenes' } },
      { path: 'contactos', component: () => import('pages/ContactosPage.vue'), meta: { title: 'Contactos' } }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
