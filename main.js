var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var path = url.parse(_url, true).path;

  console.log(pathname);
  console.log(queryData);

  if (path === '/') {
    queryData.id = 'Index';
  }

  var control = templateControl(queryData);
  if (pathname === '/') {
    fs.readdir('./data', function(error, filelist) {
      var list = templateList(filelist);

      fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
        var template = templateHTML(list, description, control);
        response.writeHead(200);
        response.end(template);
      });
    });
  }
  else if(pathname === '/create'){
    fs.readdir('./data', function(error, filelist) {
      var list = templateList(filelist);

      var template = templateHTML(list, '', control);
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
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      });
    });
  }
  else if(pathname === '/update'){
    var title = queryData.id;

    fs.readdir('./data', function(error, filelist) {
      var list = templateList(filelist);

      fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
        var template = templateHTML(list, '', control);
        template += `
        <form action="/update_preocess" method = "post">
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
  else {
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);

// function
function templateList(filelist){
  var list = '<ul>';
  var i = 1;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + '</ul>';
  return list;
}

function templateControl(queryData){
  if(queryData.id === 'Index'){
    return '';
  }
  var _create =`<a href="/create">create</a>`;
  var _update = `<a href="/update?id=${queryData.id}">update</a>`;
  var _delete = `<a href="/delete?id=${queryData.id}">delete</a>`;

  return `${_create} ${_update} ${_delete}`;
}

function templateHTML(list, description, control){
  return `
  <!doctype html> <!-- 아래 파일이 html이다 라는 것을 알려주는 코드-->
  <html> <!-- html에는 head, body태그로 나뉘고, html이라는 상위 태그로 묶임 -->
  <head> <!-- 제목부분을 알려주는 곳에 head태그로 적용 -->
    <title>지렁이 포트폴리오</title>
    <meta charset="utf-8">
  </head>

  <body> <!-- 문단의 내용을 알려주는 곳에 body태그로 적용 -->
    <a href="/?id=Index">
      <img src="/mainLogo.png">
    </a>
    <h1>About Me</h1>
    <p>${list}</p>
    <p>${control}</p>
    <p>${description}</p>

  </body>
  </html>
  `;
}
