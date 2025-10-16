function handleEnglishResponse(res, additionalData = {}) {
  return res.json({
    success: true,
    language: "en",
    message: "✅ English detected. Responding in English.",
    ...additionalData
  });
}

module.exports = handleEnglishResponse;
