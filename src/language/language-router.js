const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../LinkedList')

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

    try {
      if(!guess) {
        return res.status(400).json({ error: `Missing 'guess' in request body`}).end()
      } 
      const words = await LanguageService.getLanguageWords(req.app.get('db'), req.language.head)
      let WordList = new LinkedList()
      words.map(word => WordList.insertLast(word))
      head_word = WordList.findId(req.language.head)
      if(head_word.translation !== req.body.guess.toLowerCase()) {
        //Set head, move former head
        //then return the head
        let returnStatus =  res.status(200).json({
          nextWord: head_word.next.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: head_word.next.value.correct_count,
          wordIncorrectCount: head_word.next.value.incorrect_count,
          answer: head_word.value.translation,
          isCorrect: false
        })
        //Move former head to appropriate spot
        let newItem = {
          id: head_word.value.id,
          original: head_word.value.original,
          translation: head_word.value.translation,
          language_id: head_word.value.language_id,
          incorrect_count: head_word.value.incorrect_count + 1,
          correct_count: head_word.value.correct_count,
          memory_value: 1,
          next: null
        }
        WordList.insertAt(newItem, newItem.memory_value)
        WordList.head.value.incorrect_count++
        WordList.head = WordList.head.next;
        let currNode = WordList.head
        while(currNode !== null) {
          if(!currNode.next) {
            currNode.value.next = WordList.head.value.id
          } else {
            currNode.value.next = currNode.next.value.id
          }
          currNode = currNode.next
        }
        return returnStatus;
      }
    } catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
