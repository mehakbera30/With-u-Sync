// Escapes user input so it is matched literally inside a RegExp.
// Prevents invalid-pattern crashes and regex denial-of-service (ReDoS).
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 100);

module.exports = escapeRegex;
