const express = require('express')
const ListService = require('./list-service')
const languageRouter = require('../language/language-router')
const LanguageService= require('../language/language-service')
const { wordsList } = require('../LinkedList')

//const listRouter = express.Router()

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
