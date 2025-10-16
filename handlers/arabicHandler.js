function handleArabicResponse(res, additionalData = {}) {
  return res.json({
    success: true,
    language: "ar",
    message: "✅ تم الكشف عن اللغة العربية. سيتم الرد بالعربية.",
    ...additionalData
  });
}

module.exports = handleArabicResponse;
