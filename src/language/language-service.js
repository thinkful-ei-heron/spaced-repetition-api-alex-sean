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

  getWordById(db, id) {
    return db
      .from('word')
      .select('*')
      .where('id', id)
      .first()
  },

  updateDbWords(db, id, data) {
    return db
      .from('word')
      .update({ incorrect_count: data.incorrect_count, 
                next: data.next, 
                memory_value: data.memory_value,
                correct_count: data.correct_count })
      .where({ id: id })
      .returning('*')
      .then(([word]) => word)
  },

  updateLanguage(db, head_id, language_id, score) {
    return db
      .from('language')
      .update({
        head: head_id,
        total_score: score
      })
      .where({ id: language_id })
      .returning('*')
      .then(([language]) => language)
  },

}

module.exports = LanguageService
