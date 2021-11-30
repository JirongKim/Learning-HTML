var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rlawlfnd',
  database : 'PORTFOLIO'
});

db.connect();

db.query('SELECT * FROM INFO', function (error, results, fields) {
  if (error) {
    console.log(error);
  }
  console.log(results);
});

db.end();
