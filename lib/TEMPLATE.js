var OBJ_template = {
  HTML: function(list, description, control){
    return `
    <!doctype html> <!-- 아래 파일이 html이다 라는 것을 알려주는 코드-->
    <html> <!-- html에는 head, body태그로 나뉘고, html이라는 상위 태그로 묶임 -->
    <head> <!-- 제목부분을 알려주는 곳에 head태그로 적용 -->
    <title>지렁이 가족 게시판</title>
    <meta charset="utf-8">
    </head>

    <body> <!-- 문단의 내용을 알려주는 곳에 body태그로 적용 -->
    <a href="/"><h1>HOME</h1></a>
    <a href="/author">저자관리</a>
    <p><h2>게시판 글 목록</h2></p>
    <p>${list}</p>
    <p>${control}</p>
    <p>${description}</p>

    </body>
    </html>
    `;
  },
  list: function(filelist){
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i].id}">${filelist[i].title}</a></li>`;
      i = i + 1;
    }
    list = list + '</ul>';
    return list;
  },
  control: function(queryData){
    if(queryData.id === 'Index'){
      return '';
    }
    var _create =`<a href="/create">생성</a>`;
    var _update = `<a href="/update?id=${queryData.id}">수정</a>`;
    var _delete = `
    <form action="delete_process" method="post">
      <input type="hidden" name="id" value="${queryData.id}">
      <input type="submit" value="삭제">
    </form>
    `;

    return `${_create} ${_update} ${_delete}`;
  },
  author: function(authors, href, id, placeholders){
    var authorList = "";
    authorList += `<table>
        <tr>
          <th>name</th>
          <th>profile</th>
          <th colspan="2">edit</th>
        </tr>
        `;
      for (var i = 0; i < authors.length; i++) {
        authorList += `
        <tr>
          <td>${authors[i].name}</td>
          <td>${authors[i].profile}</td>
          <td><a href="/author_update?id=${authors[i].id}">수정</a></td>
          <td>
            <form action="/author_delete" method="post">
              <input type="hidden" name = "id" value ="${authors[i].id}">
              <input type="submit" value="삭제">
            </form>
          </td>
        </tr>
        `;
      }
      authorList += "</table>";

      authorList += `
        <form action="${href}" method = "post">
          <input type="hidden" name="id" value="${id}">
          <p><input type="text" name="name" placeholder="${placeholders[0]}"></p>
          <p>
            <textarea name="profile" placeholder="${placeholders[1]}"></textarea>
          </p>
          <p>
            <input type="submit" value="${placeholders[2]}">
          </p>
        </form>
      `;
      return authorList;
  },
}

module.exports = OBJ_template;
