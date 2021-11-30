var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var OBJ_template = require('./TEMPLATE.js');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rlawlfnd',
  database: 'PORTFOLIO',
});
db.connect();

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var filePath = url.parse(_url, true).path;

  console.log(pathname);
  console.log(queryData);

  if (filePath === '/') {
    queryData.id = 'Index';
  }

  var control = OBJ_template.control(queryData);
  if (pathname === '/') {
    db.query('SELECT * FROM INFO', function(error, info, fields) {
      if (error) {
        console.log(error);
      }
      console.log(`info : ${info}`);
      var list = OBJ_template.list(info);
      var description = info[queryData.id - 1].description;
      var template;
      if (queryData.id != 'Index') {
        var sanitizedDescription = sanitizeHtml(description);
        template = OBJ_template.HTML(list, sanitizedDescription, control);
      } else {
        template = OBJ_template.HTML(list, description, control);
      }
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === '/create') {
    db.query('SELECT * FROM INFO', function(error, info, fields) {
      if (error) {
        console.log(error);
      }
      console.log(`info : ${info}`);
      var list = OBJ_template.list(info);
      var template = OBJ_template.HTML(list, '', control);
      template += `
      <form action="/create_preocess" method = "post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === '/create_preocess') {
    var body = '';

    request.on('data', function(data) {
      body += data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      db.query(`
        INSERT INTO INFO (title, description, created, author_id)
        VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, 1],
        function(error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: `/?id=${result.insertId}`
          });
          response.end();
        }
      )
    });
  } else if (pathname === '/update') {
    db.query('SELECT * FROM INFO', function(error, info, fields) {
      if (error) {
        console.log(error);
      }
      var list = OBJ_template.list(info);
      var template = OBJ_template.HTML(list, '', control);
      db.query(`SELECT * FROM INFO WHERE id = ${queryData.id}`, function(error, result){
        console.log(result);
        template += `
            <form action="/update_preocess" method = "post">
            <input type="hidden" name="id" value="${queryData.id}">
              <input type="hidden" name="originTitle" value="${result[0].title}">
              <p><input type="text" name="title" placeholder="title" value="${result[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${result[0].description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
        `
        response.writeHead(200);
        response.end(template);
      });
    });

  } else if (pathname === '/update_preocess') {
    var body = '';

    request.on('data', function(data) {
      body += data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      console.log(post);

      db.query(`UPDATE INFO SET title = "${post.title}", description = "${post.description}" WHERE title = "${post.originTitle}"`, function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, { Location: `/?id=${post.id}`});
        response.end();
      });
    });
  } else if (pathname === '/delete_process') {
    var body = '';

    request.on('data', function(data) {
      body += data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      db.query(`DELETE FROM INFO WHERE id = ${post.id}`, function(error, result){
        response.writeHead(302, {Location: `/?id=1`});
        response.end();
      })
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);
