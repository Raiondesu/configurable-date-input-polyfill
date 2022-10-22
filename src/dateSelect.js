export class DateSelect {
    date = new Date();
    toggleUp = document.createElement('button');
    toggleDown = document.createElement('button');
    optionWrapper = document.createElement('div');
    dateSelectWrapper = document.createElement('div');

    constructor() {
        this.toggleUp.className = 'control up';
        this.toggleDown.className = 'control down';
        this.optionWrapper.className = 'option-wrapper';
        this.dateSelectWrapper.className = 'select-wrapper';

        this.dateSelectWrapper.appendChild(this.toggleUp);
        this.dateSelectWrapper.appendChild(this.optionWrapper);
        this.dateSelectWrapper.appendChild(this.toggleDown);
    }

    returnDateSelectWrapper() {
        return this.dateSelectWrapper;
    }
}

export class YearSelect extends DateSelect {
    yearArray = [];

    constructor() {
        super();
        this.dateSelectWrapper.className = 'select-wrapper year-select';

        /* start Function */
        for (let i = 0; i < 5; i += 1) {
            const option = document.createElement('div');
            option.className = 'option';
            this.optionWrapper.appendChild(option);
        }

        /* downClick Function */
        this.toggleDown.addEventListener('click', () => {
            // update array order
            this.yearArray.shift();
            this.yearArray.push(Number(this.yearArray[this.yearArray.length - 1]) + 1);
            this.redrawYearSelect();
        });

        /* upClick Function */
        this.toggleUp.addEventListener('click', () => {
            if (this.yearArray[2] === 1) {
                return;
            }
            // update array order
            this.yearArray.pop();
            this.yearArray.unshift(Number(this.yearArray[0]) - 1);
            if (this.yearArray[0] < 1) {
                this.yearArray[0] = '';
            }

            this.redrawYearSelect();
        });
    }

    redrawYearSelect() {
        for (let i = 0; i < 5; i += 1) {
            this.optionWrapper.getElementsByClassName('option')[i].innerHTML = String(this.yearArray[i]);
        }
    }

    toggleByInput(value) {
        let targetYear = value;
        // clear current values
        this.yearArray.length = 0;
        // create siblings
        targetYear -= 2;
        for (let i = 0; i < 5; i += 1) {
            if (targetYear < 1) {
                this.yearArray.push('');
            } else {
                this.yearArray.push(targetYear);
            }
            targetYear += 1;
        }

        this.redrawYearSelect();
    }

    returnSelectedYear() {
        return Number(this.yearArray[2]);
    }
}

export class MonthSelect extends DateSelect {
    selectedLocaleArray = [];
    monthArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    constructor() {
        super();
        this.dateSelectWrapper.className = 'select-wrapper month-select';
        /* start Function */
        for (let i = 0; i < 5; i += 1) {
            const option = document.createElement('div');
            option.className = 'option';
            option.innerHTML = "s";

            this.optionWrapper.appendChild(option);
        }

        /* downClick Function */
        this.toggleDown.addEventListener('click', () => {
            // update array order
            this.monthArray.push(Number(this.monthArray.shift()));
            this.redrawMonthSelect();
        });

        /* upClick Function */
        this.toggleUp.addEventListener('click', () => {
            // update array order
            this.monthArray.unshift(Number(this.monthArray.pop()));
            this.redrawMonthSelect();
        });
    }

    setLocalLabels(localeLabels) {
        this.selectedLocaleArray = localeLabels;
    }

    redrawMonthSelect() {
        const monthStringArray = this.returnMonthStringArray();

        for (let i = 0; i < 5; i += 1) {
            this.optionWrapper.getElementsByClassName('option')[i].innerHTML = monthStringArray[i];
        }
    }

    returnMonthStringArray(targetMonthIndex = null) {
        const monthStringArray = [];
        const localeArray = this.selectedLocaleArray;

        if (targetMonthIndex || targetMonthIndex === 0) {
            return this.selectedLocaleArray[targetMonthIndex];
        }

        this.monthArray.forEach((index) => {
            monthStringArray.push(localeArray[index].substring(0, 3));
        });

        return monthStringArray;
    }

    toggleByInput(value) {
        if (value !== this.monthArray[2]) {
            this.monthArray = this.rotate(
                this.monthArray,
                this.calculateDateOffset(value),
            );

            this.redrawMonthSelect();
        }
    }

    calculateDateOffset(targetDate) {
        const dateArrayLength = this.monthArray.length;
        let calculatedDateOffset = 0;

        switch (true) {
            case (targetDate < this.monthArray[2]):
                calculatedDateOffset = (dateArrayLength - this.monthArray[2]) + targetDate;
                break;
            case (targetDate === this.monthArray[2]):
                // do nothing because default value fits
                break;
            case (targetDate > this.monthArray[2]):
                calculatedDateOffset = targetDate - this.monthArray[2];
                break;
            default:
                break;
        }

        return calculatedDateOffset;
    }

    rotate(array, times) {
        let timesToRotate = times;
        while (timesToRotate > 0) {
            const temp = array.shift();
            array.push(temp);
            timesToRotate -= 1;
        }

        return array;
    }

    toggleByMatrix(mode) {
        switch (mode) {
            case 'next':
                this.monthArray = this.rotate(this.monthArray, 1);
                break;
            case 'prev':
                this.monthArray = this.rotate(this.monthArray, 11);
                break;
            default:
                break;
        }

        this.redrawMonthSelect();
    }

    returnSelectedMonthAsLabel() {
        return this.returnMonthStringArray(this.monthArray[2]);
    }

    returnSelectedMonth() {
        return this.monthArray[2];
    }
}
