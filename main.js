var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var OBJ_template = require('./lib/TEMPLATE.js');
var mysql = require('mysql');
var db = require('./lib/db.js');
var INFO = require('./lib/info.js');

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var filePath = url.parse(_url, true).path;

  console.log(pathname);
  console.log(queryData);

  var control = OBJ_template.control(queryData);
  if (pathname === '/') {
    db.query('SELECT * FROM INFO', function(error, info, fields) {
      if (error) {
        console.log(error);
      } else if (!info.length) {
        INFO.home(request, response);
      } else {
        if (filePath === '/') {
          queryData.id = info[0].id;
        }
        INFO.page(request, response, queryData, info, control);
      }
    });
  } else if (pathname === '/create') {
    INFO.create(request, response);
  } else if (pathname === '/create_preocess') {
    var body = '';

    request.on('data', function(data) {
      body += data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      console.log(`post.author = ${post.author}`);
      db.query(`
        INSERT INTO INFO (title, description, created, author_id)
        VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
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
      var template = OBJ_template.HTML(list, '', '');
      db.query(`SELECT * FROM INFO WHERE id = ${queryData.id}`, function(error, result) {
        var authorList = "";
        db.query('SELECT * FROM author', function(error, authors) {
          for (var i = 0; i < authors.length; i++) {
            var selected = '';
            if (result[0].author_id == authors[i].id) {
              selected = ' selected';
            }
            authorList += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
          }
          console.log(result);
          template += `
              <form action="/update_preocess" method = "post">
              <input type="hidden" name="id" value="${queryData.id}">
                <input type="hidden" name="originTitle" value="${result[0].title}">
                <p><input type="text" name="title" placeholder="title" value="${result[0].title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${result[0].description}</textarea>
                </p>
                <select name="author">
                  ${authorList}
                </select>
                <p>
                  <input type="submit">
                </p>
              </form>
          `
          response.writeHead(200);
          response.end(template);
        });
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

      db.query('UPDATE INFO SET title=?, description=?, author_id=? WHERE id=?',
        [post.title, post.description, post.author, post.id],
        function(error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: `/?id=${post.id}`
          });
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
      db.query(`DELETE FROM INFO WHERE id = ${post.id}`, function(error, result) {
        db.query('SELECT * FROM INFO', function(error, info) {
          if (!info.length) {
            response.writeHead(302, {
              Location: `/`
            });
          } else {
            response.writeHead(302, {
              Location: `/?id=${info[0].id}`
            });
          }
          response.end();
        });
      })
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
