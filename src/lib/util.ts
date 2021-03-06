import _ from 'lodash';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(tz);


// formatter
export const timestampFormatter = (value, timezone) => {
    if (value && value.seconds) return DateTime.fromSeconds(Number(value.seconds)).setZone(timezone).toFormat('yyyy-LL-dd HH:mm:ss');
    return '';
};
export const iso8601Formatter = (time: string, timezone: string) => {
    if (time) return dayjs.tz(dayjs(time), timezone).format('YYYY-MM-DD HH:mm:ss');
    return '';
};


/** @function
 * @name isNotEmpty
 * @param value
 * @returns {boolean}
 */
export const isNotEmpty = (value): boolean => {
    if (['boolean', 'number'].includes(typeof value)) return true;
    if (value instanceof Array) return !!value.length;
    return !_.isEmpty(value); // String, Object
};

/** * @function
 *   @name showErrorMessage
 *   @param error
 *   @param root
 *   @returns
 */
export const showErrorMessage = (errorTitle, error, root) => {
    let errorMsg = '';
    if (error.message) errorMsg = error.message;
    else if (error.response) { errorMsg = error.response.data.error.message; } else { errorMsg = error; }
    if (root) {
        root.$notify({
            group: 'toastTopCenter',
            type: 'alert',
            title: errorTitle,
            text: errorMsg,
            duration: 2000,
            speed: 1000,
        });
    }
};
/** * @function
 *   @name showSuccessMessage
 *   @param successTitle
 *   @param successMessage
 *   @param root
 *   @returns
 */
export const showSuccessMessage = (successTitle, successMessage, root) => {
    if (root) {
        root.$notify({
            group: 'toastTopCenter',
            type: 'success',
            title: successTitle,
            text: successMessage,
            duration: 2000,
            speed: 500,
        });
    }
};


export const downloadURI = (uri: string, name?: string): void => {
    const link = document.createElement('a');

    if (name) {
        link.download = name;
    }

    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const tagsToObject = (tags: Array<{ key: string; value: string }>): Record<string, string> => {
    const tagsObject = {};
    tags.forEach((tag) => {
        tagsObject[tag.key] = tag.value;
    });
    return tagsObject;
};
