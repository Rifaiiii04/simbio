import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from '../views/OverviewView.vue'
import UsersView from '../views/UsersView.vue'
import SkillsView from '../views/SkillsView.vue'
import PartnershipsView from '../views/PartnershipsView.vue'
import AiMonitoringView from '../views/AiMonitoringView.vue'
import ReportManagementView from '../views/ReportManagementView.vue'
import InterestedUsersView from '../views/InterestedUsersView.vue'
import LoginView from '../views/LoginView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'overview', component: OverviewView },
    { path: '/users', name: 'users', component: UsersView },
    { path: '/waitlist', name: 'waitlist', component: InterestedUsersView },
    { path: '/skills', name: 'skills', component: SkillsView },
    { path: '/partnerships', name: 'partnerships', component: PartnershipsView },
    { path: '/reports', name: 'reports', component: ReportManagementView },
    { path: '/ai-monitoring', name: 'ai-monitoring', component: AiMonitoringView },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('simbioly_admin_token')
  if (!to.meta.public && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
