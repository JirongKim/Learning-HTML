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
    INFO.create_preocess(request, response);
  } else if (pathname === '/update') {
    INFO.update(request, response, queryData);
  } else if (pathname === '/update_preocess') {
    INFO.update_preocess(request, response);
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
