import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Import jQuery + DataTables globally so dev server / HMR uses a single instance
import $ from 'jquery'
import 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.min.css'
if (typeof window !== 'undefined') {
	window.jQuery = $
	window.$ = $
}

createApp(App).use(router).mount('#app')
