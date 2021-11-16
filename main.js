var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  console.log(pathname);

  if (pathname === '/') {
    fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
      var template = `
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
      <ol>
        <a href="/?id=Student" title="학창시절"><li>학창시절</li></a>
        <a href="/?id=Military" title="군생활"><li>군생활</li></a>
        <a href="/?id=Work" title="사회생활"><li>사회생활</li></a>
      </ol>

      <p>${description}</p>

      <p>
        <div id="disqus_thread"></div>
      <script>
          /**
          *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
          *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
          /*
          var disqus_config = function () {
          this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
          this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
          };
          */
          (function() { // DON'T EDIT BELOW THIS LINE
          var d = document, s = d.createElement('script');
          s.src = 'https://portfolio-h97igqkjgr.disqus.com/embed.js';
          s.setAttribute('data-timestamp', +new Date());
          (d.head || d.body).appendChild(s);
          })();
      </script>
      <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
      </p>
    </body>
    </html>
    `;
      response.writeHead(200);
      response.end(template);
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);
