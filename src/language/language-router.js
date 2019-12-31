const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const { wordsList } = require('../LinkedList')

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      // if(words){
      //   for(let i=0; i< words.length; i++){
      //    wordsList.insertFirst(words[i].original)
      // }
      // }
      // console.log(wordsList)

      res.json({
        language: req.language,
        words,
      })

      // if(words[0]!==null || words[0] !== undefined){
      //   for(let i=0; i< words.length; i++){
      //    wordsList.insertFirst(words[i].original)
      // }
      // }
      // console.log(wordsList)

      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const head_word = await LanguageService.getHeadWord(req.app.get('db'), req.language.head)
      res.json({
        nextWord: head_word.original, 
        totalScore: req.language.total_score, 
        wordCorrectCount: head_word.correct_count,
        wordIncorrectCount: head_word.incorrect_count
      })
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    // implement me
    res.send('implement me!')
  })

module.exports = languageRouter
