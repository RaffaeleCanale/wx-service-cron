import moment from 'moment';

const FORMATS = [{
    format: 'DD.MM.YYYY',
    regex: /(\d\d\.\d\d\.\d\d\d\d)/.source,
}, {
    format: 'DD MMM YYYY',
    regex: /(\d\d \w+ \d\d\d\d)/.source,
}, {
    format: 'DD MMMM YYYY',
    regex: /(\d\d \w+ \d\d\d\d)/.source,
}, {
    format: 'DD. MMMM YYYY',
    regex: /(\d\d\. \w+ \d\d\d\d)/.source,
}];

const LOCALES = ['en', 'de', 'fr'];

function parseInAllLocales(dateString, format) {
    for (let i = 0; i < LOCALES.length; i += 1) {
        const locale = LOCALES[i];
        const date = moment(dateString, format, locale, true);
        if (date.isValid()) {
            return date.utc().format();
        }
    }

    return null;
}

function extractDatesWithFormat(text, resultSet, { format, regex }) {
    const re = new RegExp(regex, 'g');

    let match;
    do {
        match = re.exec(text);
        if (match) {
            const result = parseInAllLocales(match[0], format);
            if (result) {
                resultSet.add(result);
            }
        }
    } while (match);
}

// eslint-disable-next-line
export function extractDates(text) {
    const result = new Set();

    FORMATS.forEach(format => extractDatesWithFormat(text, result, format));

    return Array.from(result);
}


