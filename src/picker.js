import { YearSelect, MonthSelect } from './dateSelect';

class Picker {
    constructor() {
        this.date = new Date();
        this.isOpen = false;
        this.yearSelect = new YearSelect();
        this.monthSelect = new MonthSelect();
        this.localeLabels = [];
        this.firstDayOfWeek = "";
        this.targetInputElement = null;
        this.daysHead = document.createElement('thead');
        this.daysWrapper = document.createElement('tbody');

        this.dateSelectWrapper = document.createElement('div');
        this.dateSelectWrapper.className = 'date-select-dropdown';

        this.selectWrapper = document.createElement('div');
        this.selectWrapper.className = 'select-container';
        this.selectWrapper.appendChild(this.monthSelect.returnDateSelectWrapper());
        this.selectWrapper.appendChild(this.yearSelect.returnDateSelectWrapper());

        this.dateSelectWrapper.appendChild(this.selectWrapper);

        this.pickerElement = document.createElement('date-input-polyfill');
        this.pickerElement.className = 'date-input-polyfill';

        // Polyfill Header
        const dateSelectHeader = document.createElement('div');
        dateSelectHeader.className = 'date-select-header';

        this.dateHeaderButton = document.createElement('button');
        this.dateHeaderButton.className = 'date-header-button inactive';
        this.dateHeaderButton.addEventListener('click', () => this.toggleDateHeader());

        dateSelectHeader.appendChild(this.dateHeaderButton);

        const dayMatrixWrapper = document.createElement('div');
        dayMatrixWrapper.className = 'day-matrix-wrapper';

        this.pickerElement.appendChild(dateSelectHeader);
        this.pickerElement.appendChild(dayMatrixWrapper);
        this.pickerElement.appendChild(this.dateSelectWrapper);

        // Click event to set that day as the date. Uses event delegation.
        this.daysWrapper.addEventListener('click', (e) => this.clickDayElement(e.target));

        // Setup unchanging DOM for days matrix.
        const daysMatrix = document.createElement('table');
        daysMatrix.appendChild(this.daysHead);
        daysMatrix.appendChild(this.daysWrapper);
        dayMatrixWrapper.appendChild(daysMatrix);

        this.hide();
        document.body.appendChild(this.pickerElement);
    }

    removeClickOut(e) {
        if (this.isOpen) {
            const { target } = e;
            let el = e.target;
            let isPicker = el === this.pickerElement || el === this.targetInputElement;
            while (!isPicker && el !== null) {
                el = el.parentNode;
                isPicker = el === this.pickerElement;
            }
            if ((target.getAttribute('type') !== 'date' && !isPicker) || !isPicker) {
                this.hide();
            }
        }
    }

    toggleDateHeader() {
        if (this.dateHeaderButton.classList.contains('inactive')) {
            this.dateHeaderButton.className = 'date-header-button active';
            this.dateSelectWrapper.style.display = 'block';
        } else if (this.dateHeaderButton.classList.contains('active')) {
            this.dateHeaderButton.className = 'date-header-button inactive';
            this.dateSelectWrapper.style.display = 'none';

            // Refresh dayMatrix here cause performance
            this.date.setMonth(this.monthSelect.returnSelectedMonth());
            this.date.setFullYear(this.yearSelect.returnSelectedYear());
            this.refreshDaysMatrix();
        }
    }

    clickDayElement(targetDay) {
        // Check if targetDay is valid
        if (targetDay.textContent.length > 2) {
            return;
        }

        // Returns if target day has disabled flag
        if (targetDay.classList.contains("disabled")) {
            return;
        }

        const currentSelected = this.daysWrapper.querySelector('[data-selected]');
        if (currentSelected) {
            currentSelected.removeAttribute('data-selected');
        }
        targetDay.setAttribute('data-selected', '');

        // Checks for next or prev month
        let jumpMonth = false;
        if (targetDay.classList.contains('next-month')) {
            if (this.monthSelect.returnSelectedMonth() === 11) {
                this.yearSelect.toggleByInput(this.yearSelect.returnSelectedYear() + 1);
            }

            this.monthSelect.toggleByMatrix('next');

            jumpMonth = true;
        } else if (targetDay.classList.contains('prev-month')) {
            if (this.monthSelect.returnSelectedMonth() === 0) {
                this.yearSelect.toggleByInput(this.yearSelect.returnSelectedYear() - 1);
            }

            this.monthSelect.toggleByMatrix('prev');

            jumpMonth = true;
        }

        // Updates if jump is detected
        if (jumpMonth) {
            this.date = new Date();
            this.date.setMonth(this.monthSelect.returnSelectedMonth());
            this.date.setFullYear(this.yearSelect.returnSelectedYear());
            this.dateHeaderButton.innerHTML = `${this.monthSelect.returnSelectedMonthAsLabel()} ${this.yearSelect.returnSelectedYear()}`;
        }

        this.date.setDate(parseInt(targetDay.textContent));
        this.setInput();
    }

    // Position picker below element. Align to element's right edge.
    positionPicker(element) {
        const rect = element.getBoundingClientRect();
        this.pickerElement.style.top = `${rect.top + rect.height
            + (document.documentElement.scrollTop || document.body.scrollTop)
            + 3
            }px`;

        const contRect = this.pickerElement.getBoundingClientRect();
        const width = contRect.width ? contRect.width : 280;

        let base = rect.right - width;
        this.pickerElement.className = `polyfill-right-aligned`;

        if (rect.right < width) {
            base = rect.left;
            this.pickerElement.className = `polyfill-left-aligned`;
        }

        this.pickerElement.style.left = `${base
            + (document.documentElement.scrollLeft || document.body.scrollLeft)
            }px`;
        this.show();
    }

    // Initiate I/O with given date input.
    attachTo(input) {
        if (input.htmlElement === this.targetInputElement?.htmlElement && this.isOpen) {
            return false;
        }

        this.targetInputElement = input;
        this.syncPickerWithInput();
        this.positionPicker(this.targetInputElement.htmlElement);
        return true;
    }

    // Hide.
    hide() {
        this.isOpen = false;
        this.pickerElement.setAttribute('data-open', String(this.isOpen));

        this.dateHeaderButton.className = 'date-header-button inactive';

        // Close the picker when clicking outside a date input or picker.
        if (this.targetInputElement) {
            this.dateSelectWrapper.style.display = 'none';
            this.targetInputElement.htmlElement.blur();
        }
    }

    // Show.
    show() {
        this.isOpen = true;
        this.pickerElement.setAttribute('data-open', String(this.isOpen));
        // Close the picker when clicking outside a date input or picker.
        setTimeout(() => {
            document.addEventListener('mousedown', (e) => this.removeClickOut(e), { once: true });
            document.addEventListener('touchstart', (e) => this.removeClickOut(e), { once: true });
        }, 500);

        // when used in a single-page app  or otherwise,
        // hide datepicker when the browser's back button is pressed
        window.onpopstate = () => {
            this.hide();
        };
    }

    // Match picker date with input date.
    syncPickerWithInput() {
        // use selected date in case valid date is given
        if (this.targetInputElement.htmlElement.valueAsDate != null) {
            this.date = this.targetInputElement.htmlElement.valueAsDate;
        } else {
            this.date = new Date();
        }

        // set matrix header and locale
        this.createMatrixHeader();

        // create month select by given language
        this.monthSelect.setLocalLabels(this.localeLabels.months);

        // create new DateRange Object
        const minRange = new Date(this.targetInputElement.dateRange[0].getTime());
        const maxRange = new Date(this.targetInputElement.dateRange[1].getTime());

        // if current year is in selection range
        if (this.date <= maxRange && this.date >= minRange) {
            this.monthSelect.toggleByInput(this.date.getMonth());
            this.yearSelect.toggleByInput(this.date.getFullYear());
        } else {
            const currentDate = new Date();
            // check if default year needs to be calculated
            if (currentDate <= maxRange && currentDate >= minRange) {
                this.date = currentDate;
            } else {
                this.date = minRange;
            }

            this.monthSelect.toggleByInput(this.date.getMonth());
            this.yearSelect.toggleByInput(this.date.getFullYear());
        }

        // Setup click events for the selection Button
        this.dateHeaderButton.innerHTML = `${this.monthSelect.returnSelectedMonthAsLabel()} ${this.yearSelect.returnSelectedYear()}`;
        const dateSelectControls = this.selectWrapper.getElementsByClassName('control');

        for (let i = 0; i < dateSelectControls.length; i += 1) {
            dateSelectControls[i].addEventListener('click', () => {
                this.dateHeaderButton.innerHTML = `${this.monthSelect.returnSelectedMonthAsLabel()} ${this.yearSelect.returnSelectedYear()}`;
            });
        }

        this.refreshDaysMatrix();
    }

    // Match input date with picker date.
    setInput() {
        this.targetInputElement.htmlElement.valueAsDate = this.date;
        this.targetInputElement.htmlElement.focus();
        setTimeout(() => { // IE wouldn't hide, so in a timeout you go.
            this.hide();
        }, 100);
    }

    createMatrixHeader() {
        if (this.localeLabels === this.targetInputElement.localeLabels
            && this.firstDayOfWeek === this.targetInputElement.firstDayOfWeek) {
            return false;
        }

        this.localeLabels = this.targetInputElement.localeLabels;
        this.firstDayOfWeek = this.targetInputElement.firstDayOfWeek;

        const daysHeaderContent = [];

        for (let i = 0, len = this.localeLabels.days.length; i < len; i += 1) {
            daysHeaderContent.push(`<th scope="col">${this.localeLabels.days[i]}</th>`);
        }

        // check if first day of week is monday
        if (this.targetInputElement.firstDayOfWeek === 'mo') {
            daysHeaderContent.push(daysHeaderContent.shift());
        }
        // check if first day of week is saturday
        if (this.targetInputElement.firstDayOfWeek === 'sa') {
            daysHeaderContent.unshift(daysHeaderContent.pop());
        }

        this.daysHead.innerHTML = `<tr> ${daysHeaderContent.join('')} </tr>`;

        return true;
    }

    refreshDaysMatrix() {
        // Determine days for this month and year,
        // as well as on which weekdays they lie.
        const year = this.date.getFullYear(); // Get the year (2016).
        const month = this.date.getMonth(); // Get the month number (0-11).
        const oldDaysInCurrentMonth = [];
        // First weekday of month (0-6).
        let startDay = this.returnAbsoluteDate(year, month, 1).getDay();
        // Get days in month (1-31).
        const maxDays = this.returnAbsoluteDate(year, month + 1, 0).getDate();
        // check if first day of week is monday
        if (this.targetInputElement.firstDayOfWeek === 'mo') {
            // update startDay to EU format -> start at mo
            if (startDay === 0) {
                startDay = 6;
            } else {
                startDay -= 1;
            }
        }
        // check if first day of week is saturday
        if (this.targetInputElement.firstDayOfWeek === 'sa') {
            // update startDay to EU format -> start at mo
            if (startDay === 6) {
                startDay = 0;
            } else {
                startDay += 1;
            }
        }

        // adds days of the last month if this month does not start at 0
        if (startDay > 0) {
            const daysOfLastMonth = this.returnAbsoluteDate(year, month, 0).getDate();

            const daysToCollect = startDay;
            let dayPosition = daysToCollect - 1;

            for (let i = 0; i < daysToCollect; i += 1) {
                oldDaysInCurrentMonth.push(daysOfLastMonth - dayPosition);
                dayPosition -= 1;
            }
        }

        // The input's current date.
        const selDate = this.targetInputElement?.htmlElement.valueAsDate || false;

        // Are we in the input's currently-selected month and year?
        const selMatrix = selDate
            && year === selDate.getFullYear()
            && month === selDate.getMonth();

        // Populate days matrix.
        const matrixHTML = [];

        // check if it is the current month were looking at
        const today = new Date();
        let lookingAtCurrentMonth = false;
        if (this.date.getFullYear() === today.getFullYear()) {
            if (this.date.getMonth() === today.getMonth()) {
                lookingAtCurrentMonth = true;
            }
        }

        const minDate = this.targetInputElement.dateRange[0];
        const maxDate = this.targetInputElement.dateRange[1];

        for (let i = 0; i < maxDays + startDay; i += 1) {
            // Add a row every 7 days.
            if (i % 7 === 0) {
                matrixHTML.push(`${i !== 0 ? `</tr>` : ``}<tr>`);
            }

            // Add new column.
            // If no days from this month in this column, it will be empty.
            if (i + 1 <= startDay) {
                const calculatedPrevMonthDate = this.returnAbsoluteDate(
                    year,
                    month - 1,
                    oldDaysInCurrentMonth[i],
                );

                matrixHTML.push(`<td class="prev-month 
                    ${calculatedPrevMonthDate < minDate || calculatedPrevMonthDate > maxDate ? `disabled` : ``}">${oldDaysInCurrentMonth[i]}</td>`);
            } else {
                // Populate day number.
                const dayNum = i + 1 - startDay;
                const selected = selMatrix && selDate.getDate() === dayNum;
                const calculatedCurrentDate = this.returnAbsoluteDate(year, month, dayNum);

                // check if current item is current day
                if (lookingAtCurrentMonth && today.getDate() === dayNum) {
                    // highlight the current day
                    matrixHTML.push(`<td data-day ${selected ? `data-selected` : ``} class='current-day
                        ${calculatedCurrentDate < minDate || calculatedCurrentDate > maxDate ? `disabled` : ``}'>${dayNum}</td>`);
                } else {
                    // display normal
                    const dayTile = `<td data-day ${selected ? `data-selected` : ``} 
                        class='${calculatedCurrentDate < minDate || calculatedCurrentDate > maxDate ? `disabled` : ``}'>${dayNum}</td>`;

                    matrixHTML.push(dayTile);
                }
            }
        }

        // Max days displayed at ones
        const maxDayTiles = 42;
        // Current displayed Days
        let currentDisplayedDays = startDay + maxDays;

        // fill remaining space with next Month items
        if (currentDisplayedDays < maxDayTiles) {
            const calculatedNextMonthDate = this.returnAbsoluteDate(year, month + 2, 0);
            let nextMonthDayItemLabel = 1;
            while (currentDisplayedDays < maxDayTiles) {
                calculatedNextMonthDate.setDate(nextMonthDayItemLabel);

                // Add a row every 7 days.
                if (currentDisplayedDays % 7 === 0) {
                    matrixHTML.push(`${nextMonthDayItemLabel !== 0 ? `</tr>` : ``}<tr>`);
                }
                matrixHTML.push(`<td class="next-month
                    ${calculatedNextMonthDate < minDate || calculatedNextMonthDate > maxDate ? `disabled` : ``}
                    ">${nextMonthDayItemLabel}</td>`);

                nextMonthDayItemLabel += 1;
                currentDisplayedDays += 1;
            }
        }

        this.daysWrapper.innerHTML = matrixHTML.join('');
    }

    returnCurrentDate() {
        return this.date;
    }

    returnAbsoluteDate(year, month, day) {
        const absoluteDate = new Date();
        absoluteDate.setFullYear(year, month, day);
        absoluteDate.setHours(0, 0, 0, 0);

        return absoluteDate;
    }
}

export default new Picker();
