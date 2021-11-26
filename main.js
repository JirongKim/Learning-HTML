var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var OBJ_template = require('./TEMPLATE.js');

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
    fs.readdir('./data', function(error, filelist) {
      var list = OBJ_template.list(filelist);

      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var template = OBJ_template.HTML(list, description, control);
        response.writeHead(200);
        response.end(template);
      });
    });
  }
  else if(pathname === '/create'){
    fs.readdir('./data', function(error, filelist) {
      var list = OBJ_template.list(filelist);

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
  }
  else if(pathname === '/create_preocess'){
    var body = '';

    request.on('data', function(data){
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      var filteredTitle = path.parse(title).base;
      fs.writeFile(`data/${filteredTitle}`, description, 'utf8', function(err){
        response.writeHead(302, {Location: `/?id=${filteredTitle}`});
        response.end();
      });
    });
  }
  else if(pathname === '/update'){
    var title = queryData.id;

    fs.readdir('./data', function(error, filelist) {
      var list = OBJ_template.list(filelist);

      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var template = OBJ_template.HTML(list, '', control);
        template += `
        <form action="/update_preocess" method = "post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
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
  }
  else if(pathname === '/update_preocess'){
    var body = '';

    request.on('data', function(data){
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      console.log(post);
      var filteredId = path.parse(id).base;
      var filteredTitle = path.parse(title).base;
      fs.rename(`data/${filteredId}`, `data/${filteredTitle}`, function(error){
        fs.writeFile(`data/${filteredTitle}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${filteredTitle}`});
          response.end();
        });
      })
    });
  }
  else if(pathname === '/delete_process'){
    var body = '';

    request.on('data', function(data){
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error){
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    });
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);
