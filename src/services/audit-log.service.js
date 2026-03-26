const notaryModel = require('../models/notary.model');

const safeParseJson = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const computeChangedFields = (oldValue, newValue) => {
  const before = oldValue && typeof oldValue === 'object' ? oldValue : {};
  const after = newValue && typeof newValue === 'object' ? newValue : {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  return [...keys]
    .filter((key) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null))
    .map((field) => ({
      field,
      before: before[field] ?? null,
      after: after[field] ?? null,
    }));
};

const createAuditLog = async (payload, options = {}) =>
  notaryModel.insertAuditLog(payload, options.queryExecutor);

const hydrateAuditLog = (log) => {
  const oldValue = safeParseJson(log.old_value);
  const newValue = safeParseJson(log.new_value);

  return {
    ...log,
    old_value: oldValue,
    new_value: newValue,
    changed_fields: computeChangedFields(oldValue, newValue),
  };
};

module.exports = {
  createAuditLog,
  hydrateAuditLog,
  computeChangedFields,
};
