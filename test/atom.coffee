require 'should'      
helper = (require '../modules/helper')()     

express = require('express')
request = require 'supertest'
xml2js = require 'xml2js'      
util = require('util')                               

path = require 'path'
fs = require('fs')  

app = express()         
blog = (require __dirname + '/init')

(require path.join(__dirname, '../config'))(app)
(require path.join(__dirname, '../routes'))(app, blog.settings)

describe 'POST /api/atom/feeds', ()->	
	request = request(app) 
	describe 'Without authorizaiton header', ()->   
		it 'should return unauthorized response', (done)->
			post = request.post('/api/atom/feeds')
			post.expect(401).end (err, res)->
				if err != null
					throw err
				done()
		describe 'With authorization header', ()->
			id = ''
			it 'should respond correct status code', (done)=>
				post = request.post('/api/atom/feeds')
				post.set('Content-Type', 'application/atom+xml')
				post.set('authorization', util.format('Basic %s', new Buffer('admin:admin').toString('base64')))

				fs.readFile __dirname + '/post.xml','utf8', (err, result)=>   
						post.write(result)
						post.expect(201).end (err, res)->
							if err != null
								 throw err
							parser = new xml2js.Parser();
							parser.parseString res.text, (err, result)->
								result.entry.title[0].should.be.ok
								result.entry.content[0].should.be.ok 
								result.entry.id[0].should.be.ok   
								lastIndex = result.entry.id[0].lastIndexOf('/') + 1
								id = result.entry.id[0].substr(lastIndex)
							done()
			afterEach (done)->
				blog.deletePost id, ()->
					done()
				 