import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../components/LandingPage.vue';
import XLSXTemplateReader from '../components/XLSXTemplateReader.vue';
import LineCallback from '../components/LineCallback.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
  },
  {
    path: '/xlsx-reader',
    name: 'XLSXReader',
    component: XLSXTemplateReader
  },
  {
    path: '/line-callback',
    name: 'LineCallback',
    component: LineCallback
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route Guard
router.beforeEach((to, from, next) => {
  if (to.name === 'XLSXReader') {
    const hasLineAuth = localStorage.getItem('line_auth_code');
    if (!hasLineAuth) {
      next({ name: 'Landing' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router; 
