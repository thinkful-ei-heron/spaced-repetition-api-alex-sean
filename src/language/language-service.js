const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getHeadWord(db, headId) {
    return db
      .from('word')
      .select(
        'word.original',
        'word.correct_count',
        'word.incorrect_count'
      )
      .where('id', headId)
      .first()
  },

  updateScore(db, headId, newScore) {
    return db('word')
      .where('id', headId)
      .update(newScore)
  }
}

module.exports = LanguageService
