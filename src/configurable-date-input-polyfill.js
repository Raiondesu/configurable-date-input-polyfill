import './configurable-date-input-polyfill.scss';
import DateInput from './dateInput';

const startTime = performance.now();
function supportsDateInput() {
    // Return false if the browser does not support input[type="date"].
    const input = document.createElement('input');
    input.setAttribute('type', 'date');

    const notADateValue = 'not-a-date';
    input.setAttribute('value', notADateValue);

    return !(input.value === notADateValue);
}

function addPickerToInputs(dateInputs) {
    for (let i = 0; i < dateInputs.length; i += 1) {
        const dateInput = {
            htmlElement: null,
            firstDayOfWeek: null,
            dateFormat: null,
            dateRange: null,
            locale: null,
            localeLabels: null,
            minDateAttribute: null,
            maxDateAttribute: null,
        };

        dateInput.htmlElement = dateInputs[i];
        dateInput.htmlElement.setAttribute('data-has-picker', '');
        dateInput.htmlElement.addEventListener('focus', () => DateInput.showPicker(dateInput));
        dateInput.htmlElement.addEventListener('mouseup', () => DateInput.showPicker(dateInput));

        dateInput.locale = DateInput.returnSelectedLocale(dateInput.htmlElement);
        dateInput.dateFormat = DateInput.returnDateFormat(dateInput.htmlElement);
        dateInput.minDateAttribute = DateInput.returnSelectedMinDate(dateInput.htmlElement);
        dateInput.maxDateAttribute = DateInput.returnSelectedMaxDate(dateInput.htmlElement);
        dateInput.dateRange = DateInput.getDateRange(dateInput.minDateAttribute, dateInput.maxDateAttribute);
        dateInput.localeLabels = DateInput.getLocaleLabels(dateInput.locale);
        dateInput.firstDayOfWeek = DateInput.returnSelectedFirstDayOfWeek(dateInput.htmlElement);

        DateInput.createMutationObserver(dateInput);
        DateInput.setupValueProperties(dateInput);
        DateInput.setupKeyEvents(dateInput);
    }
}

function addPolyfillPickers() {
    addPickerToInputs(document.querySelectorAll('input[type="text"].date-polyfill:not([data-has-picker])'));
    // Check if type="date" is supported. feature disabled!
    if (!supportsDateInput()) {
        addPickerToInputs(document.querySelectorAll('input[type="date"]:not([data-has-picker])'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addPolyfillPickers();
    // This is also on mousedown event, so it will capture new inputs that might
    // be added to the DOM dynamically.
    document.querySelector('body')?.addEventListener('mousedown', () => addPolyfillPickers());
});

const endTime = performance.now();
console.log(`${(endTime + startTime) / 1000}sek`);
