express = require 'express'

config = (app)->

	app.configure ()->
	  app.set('port', process.env.PORT || 3000)
	  app.set('views', __dirname + '/views')
	  app.set('view engine', 'jade')
	  app.use(express.favicon())
	  app.use(express.logger('dev'))
	  app.use(express.bodyParser())
	  app.use(express.methodOverride())
	  app.use(app.router)
	  app.use(require('less-middleware')({ src: __dirname + '/public' }))
	  app.use(express.static(__dirname + '/public'))
	  app.locals.pretty = true

	app.configure	'production', ()->
	  app.use(express.errorHandler())  
	
module.exports = config
