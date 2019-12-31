const express = require('express')
const listRouter = express.Router()

listRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
   
    //   res.json({
    //     language: req.language,
    //     words,
    //   })
      next()
    } catch (error) {
      next(error)
    }
  })