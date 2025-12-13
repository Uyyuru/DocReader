function chunkText(text, size = 1000) {
  return text.match(new RegExp(`.{1,${size}}`, "gs")) || [];
}

module.exports = chunkText;
