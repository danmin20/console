import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App';
import router from '@/routes/index';
import store from './store';
import dotenv from 'dotenv';
import VueCookie from 'vue-cookie';
import directive from '@/directives';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import Notifications from 'vue-notification';
import velocity from 'velocity-animate';
import CountryFlag from 'vue-country-flag';
import { i18n } from '@/setup/i18n';
import { api } from '@/setup/api';
import { Mixin } from '@/setup/global_util';

//TODO: Please get rid of items that won't be used in following environments: DEV, STG, PROD
dotenv.config();
Vue.mixin(Mixin);
Vue.use(BootstrapVue);
Vue.use(VueCookie);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(CountryFlag);
Vue.use(Notifications, { velocity });

Vue.prototype.$axios = api;
Vue.prototype.$velocity = velocity;

/**
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 **/
Vue.prototype.$bus = new Vue({});
directive(Vue);

/*
Vue.http.interceptors.push((request, next) => {
    console.log(request);
    if(request.method === 'POST') {
        request.method = 'PUT';
    }
    next(response => {
        response.json = () => { return { message: response.body } };
    });
});
*/


new Vue({
    el: '#app',
    router,
    i18n,
    api,
    store,
    components: {
        App
    },
    template: '<App/>'
});
