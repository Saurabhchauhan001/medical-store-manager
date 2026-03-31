const { isValidObjectId } = require('mongoose');

function parseRequiredString(value, fieldName) {
    const parsedValue = typeof value === 'string' ? value.trim() : '';

    if (!parsedValue) {
        throw new Error(`${fieldName} is required.`);
    }

    return parsedValue;
}

function parsePositiveNumber(value, fieldName, { allowZero = true } = {}) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || (allowZero ? parsedValue < 0 : parsedValue <= 0)) {
        throw new Error(`${fieldName} must be ${allowZero ? '0 or greater' : 'greater than 0'}.`);
    }

    return parsedValue;
}

function parsePositiveInteger(value, fieldName, { allowZero = false } = {}) {
    const parsedValue = Number(value);
    const minimum = allowZero ? 0 : 1;

    if (!Number.isInteger(parsedValue) || parsedValue < minimum) {
        throw new Error(`${fieldName} must be a whole number ${allowZero ? '0 or greater' : 'greater than 0'}.`);
    }

    return parsedValue;
}

function parseDate(value, fieldName) {
    const parsedValue = new Date(value);

    if (!value || Number.isNaN(parsedValue.getTime())) {
        throw new Error(`${fieldName} must be a valid date.`);
    }

    return parsedValue;
}

function ensureObjectId(value, fieldName) {
    if (!isValidObjectId(value)) {
        throw new Error(`${fieldName} is invalid.`);
    }

    return value;
}

function escapeForRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function roundCurrency(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

module.exports = {
    ensureObjectId,
    escapeForRegex,
    parseDate,
    parsePositiveInteger,
    parsePositiveNumber,
    parseRequiredString,
    roundCurrency
};
