var mysql = require('mysql');

var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rlawlfnd',
  database: 'PORTFOLIO',
});
db.connect();

module.exports = db;
