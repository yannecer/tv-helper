import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'tv-helper',
      component: require('@/components/TvHelper').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
