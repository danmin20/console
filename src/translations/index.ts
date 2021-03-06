import Vue from 'vue';
import VueI18n, { LocaleMessageObject } from 'vue-i18n';
import axios from 'axios';


import ko from '@/translations/language-pack/ko.json';
import en from '@/translations/language-pack/en.json';
import ja from '@/translations/language-pack/ja.json';
import componentKO from '@spaceone/design-system/src/translations/language-pack/ko.json';
import componentEN from '@spaceone/design-system/src/translations/language-pack/en.json';
import componentJA from '@spaceone/design-system/src/translations/language-pack/ja.json';


Vue.use(VueI18n);

// simple recursive remove keys with empty value
const removeEmpty = (obj: object | any): LocaleMessageObject => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: {
        en: removeEmpty({ ...en, COMPONENT: componentEN }),
        ko: removeEmpty({ ...ko, COMPONENT: componentKO }),
        jp: removeEmpty({ ...ja, COMPONENT: componentJA }),
    },
    silentFallbackWarn: true,
});
