var db = require('./db.js');
var qs = require('querystring');
var OBJ_template = require('./TEMPLATE.js');
var INFO = require('./info.js');
const { author } = require('./TEMPLATE.js');

exports.main = function(request, response, filePath, queryData, control){
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
}

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

exports.author = function(request, response) {
  db.query('SELECT * FROM INFO', function(error, info, fields) {
    if (error) {
      console.log(error);
    }
    db.query('SELECT * FROM author', function(error, authors) {
      var authorList = OBJ_template.author(authors, "/author_create", 1, ['이름', '프로필', '생성']);
      var list = OBJ_template.list(info);
      var template = OBJ_template.HTML(list, '', '');
      template += `
        ${authorList}
        <style>
          table{
            border-collapse: collapse;
          }
          td, th{
            border: 1px solid black;
          }
        </style>
      `
      response.writeHead(200);
      response.end(template);
    });
  });
}

exports.author_create = function(request, response) {
  var body = '';

  request.on('data', function(data) {
    body += data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    db.query(`
    INSERT INTO author (name, profile)
    VALUES(?, ?)`,
      [post.name, post.profile],
      function(error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: `/author`
        });
        response.end();
      }
    )
  });
}

exports.author_update = function(request, response, queryData) {
  db.query('SELECT * FROM INFO', function(error, info, fields) {
    if (error) {
      console.log(error);
    }
    db.query('SELECT * FROM author', function(error, authors) {
      var placeholders = [3];
      for (var i = 0; i < authors.length; i++) {
        if(authors[i].id == queryData.id){
          placeholders[0] = authors[i].name;
          placeholders[1] = authors[i].profile;
          placeholders[2] = "수정";
        }
      }
      var authorList = OBJ_template.author(authors, "/author_update_process", queryData.id, placeholders);
      var list = OBJ_template.list(info);
      var template = OBJ_template.HTML(list, '', '');
      template += `
        ${authorList}
        <style>
          table{
            border-collapse: collapse;
          }
          td, th{
            border: 1px solid black;
          }
        </style>
      `
      response.writeHead(200);
      response.end(template);
    });
  });
}

exports.author_update_process = function(request, response) {
  var body = '';

  request.on('data', function(data) {
    body += data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    console.log(post.id);
    db.query(`
    UPDATE author SET name = ?, profile = ? WHERE id = ?`,
      [post.name, post.profile, post.id],
      function(error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: `/author`
        });
        response.end();
      }
    )
  });
}

exports.author_delete = function(request, response) {
  var body = '';

  request.on('data', function(data) {
    body += data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    console.log(post.id);
    db.query(`
    DELETE FROM author WHERE id = ?`,
      [post.id],
      function(error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: `/author`
        });
        response.end();
      }
    )
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

exports.update = function(request, response, queryData) {
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
}


exports.update_preocess = function(request, response, queryData) {
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
}

exports.delete_process = function(request, response, queryData) {
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
}
