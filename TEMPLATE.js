var OBJ_template = {
  HTML: function(list, description, control){
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
  },
  list: function(filelist){
    var list = '<ul>';
    var i = 1;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list + '</ul>';
    return list;
  },
  control: function(queryData){
    if(queryData.id === 'Index'){
      return '';
    }
    var _create =`<a href="/create">create</a>`;
    var _update = `<a href="/update?id=${queryData.id}">update</a>`;
    var _delete = `
    <form action="delete_process" method="post">
      <input type="hidden" name="id" value="${queryData.id}">
      <input type="submit" value="delete">
    </form>
    `;

    return `${_create} ${_update} ${_delete}`;
  },
}

module.exports = OBJ_template;
