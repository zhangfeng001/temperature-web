// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import moment from 'moment'
import VTooltip from 'v-tooltip'
import store from './store'
Vue.config.productionTip = false
import common from '@/assets/js/common.js';
Vue.use(common);//引入公共脚本
Vue.use(moment);//时间转换插件
Vue.use(VTooltip)//提示框插件
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
