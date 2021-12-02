var db = require('./db.js');
var qs = require('querystring');
var OBJ_template = require('./TEMPLATE.js');

exports.home = function(request, response) {
  var authorList = "";
  db.query('SELECT * FROM author', function(error, authors) {
    for (var i = 0; i < authors.length; i++) {
      authorList += `<option value="${authors[i].id}">${authors[i].name}</option>`;
    }
    var template = OBJ_template.HTML('', '', '');
    template += `
    <h2>파일이 하나도 없네요! 만들어보세요~</h2>
    <form action="/create_preocess" method = "post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
      <select name="author">
        ${authorList}
      </select>
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

exports.page = function(request, response, queryData, info, control) {
  db.query('SELECT * FROM INFO LEFT JOIN author ON INFO.author_id = author.id WHERE INFO.id=?', [queryData.id], function(error, result) {
    var list = OBJ_template.list(info);
    var description;
    db.query(`SELECT * FROM INFO WHERE id = ${queryData.id}`, function(error, res_des) {
      description = res_des[0].description;
      var template = OBJ_template.HTML(list, description, control);
      template += `<p>by ${result[0].name}</p>`
      response.writeHead(200);
      response.end(template);
    });
  });
}

exports.create = function(request, response) {
  db.query('SELECT * FROM INFO', function(error, info, fields) {
    if (error) {
      console.log(error);
    }
    var authorList = "";
    db.query('SELECT * FROM author', function(error, authors) {
      for (var i = 0; i < authors.length; i++) {
        authorList += `<option value="${authors[i].id}">${authors[i].name}</option>`;
      }
      var list = OBJ_template.list(info);
      var template = OBJ_template.HTML(list, '', '');
      template += `
      <form action="/create_preocess" method = "post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
        <select name="author">
          ${authorList}
        </select>
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

exports.create_preocess = function(request, response) {
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
}
