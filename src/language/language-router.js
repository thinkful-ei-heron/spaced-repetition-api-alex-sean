const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedListService = require('./linked-list-service')

const jsonBodyParser = express.json()
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

      res.json({
        language: req.language,
        words,
      })
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
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    const { guess } = req.body
    const db = req.app.get('db')
    const langId = req.language.id
    let { total_score, head } = req.language

    if(!guess) {
      return res.status(400).json({ error: `Missing 'guess' in request body`}).end()
    }
    try {
      let words = await LanguageService.getLanguageWords(db, langId)
      let WordList = await LinkedListService.createList(words, head)
      if(WordList.head.value.translation !== guess) {
        WordList.head.value.memory_value = 1;
        WordList.head.value.incorrect_count++;
        let formerHead = WordList.head;
        WordList.head = WordList.head.next;
        await LinkedListService.moveItem(WordList, formerHead.value, formerHead.value.memory_value - 1, words.length)
        await LinkedListService.updateNext(WordList)
        let newHead = WordList.head.value.id;
        await LanguageService.updateLanguage(db, newHead, langId, total_score);
        await LinkedListService.updateDatabaseFromList(WordList, db)
        let resObject = res.status(200).json({
          nextWord: WordList.head.value.original,
          totalScore: total_score,
          wordCorrectCount: WordList.head.value.correct_count,
          wordIncorrectCount: WordList.head.value.incorrect_count,
          answer: formerHead.value.translation,
          isCorrect: false
        })
        return resObject;
      } else {
        total_score = total_score + 1;
        WordList.head.value.memory_value = WordList.head.value.memory_value * 2;
        WordList.head.value.correct_count++;
        let formerHead = WordList.head;
        WordList.head = WordList.head.next;
        WordList = await LinkedListService.moveItem(WordList, formerHead.value, formerHead.value.memory_value - 1, words.length)
        await LinkedListService.updateNext(WordList)
        let newHead = WordList.head.value.id
        await LanguageService.updateLanguage(db, newHead, langId, total_score)
        await LinkedListService.updateDatabaseFromList(WordList, db)
        let resObject = res.status(200).json({
          nextWord: WordList.head.value.original,
          totalScore: total_score,
          wordCorrectCount: WordList.head.value.correct_count,
          wordIncorrectCount: WordList.head.value.incorrect_count,
          answer: formerHead.value.translation,
          isCorrect: true
        })
        return resObject
      }
    } catch (error) {
      next(error)
    }

  })

module.exports = languageRouter