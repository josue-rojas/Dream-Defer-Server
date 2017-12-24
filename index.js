// ----------------------- node stuff --------------------
var express = require('express');
const { Pool } = require('pg') //postgres
var parser = require('body-parser');
const app = express();

app.use(parser.json());

// edit url and get url
var secretURL = process.env.SECRET_URL;

// databse connection
var connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// create table if none
pool.query("CREATE TABLE IF NOT EXISTS dreams(id SERIAL UNIQUE PRIMARY KEY, fullname varchar(255), dateend INTEGER, insta varchar(255), hexcolor varchar(255))")

app.get(secretURL, (req, res, next) =>{
  pool.query('SELECT * FROM dreams ORDER BY dateend')
  .then(results =>{
    res.end(JSON.stringify(results.rows))
  })
  .catch(e => console.error(e.stack))
})

app.get('*',(req, res, next) =>{
  res.redirect('http://dream-deferred.xyz')
})

app.post('/new', (req, res) =>{
  pool.query('INSERT INTO dreams(id, fullname, dateend, insta, hexcolor) values(DEFAULT, $1, $2, $3, $4)',[req.body.fullname, req.body.dateend, req.body.insta, req.body.hexcolor])
  .then( ()=>{
    res.end('{success : "Updated Successfully", "status" : 200}');
  })
  .catch(e => res.status(500).send({ error: 'Something failed!' }))
})

app.post(secretURL + '/:id', (req, res) =>{
  pool.query('UPDATE dreams SET fullname=$1, dateend=$2, insta=$3, hexcolor=$4 WHERE id=' + req.params.id, [req.body.fullname, req.body.dateend, req.body.insta, req.body.hexcolor])
  .then( ()=>{
    res.end('{success : "Updated Successfully", "status" : 200}');
  })
  .catch(e => res.status(500).send({ error: 'Something failed!' }))
})

// TODO need MORE testing
app.delete(secretURL+ '/delete',(req, res) =>{
  if(req.body.delete){
    pool.query("DELETE FROM dreams WHERE id IN ("+ req.body.delete.join(',') + ")")
    .then( ()=>{
      res.end('{success : "Deleted Successfully", "status" : 200}');
    })
    .catch(e => res.status(500).send({ error: 'Something failed!' }))
  }
  else{
    res.status(500).send({ error: 'Something failed!' })
  }
})

app.delete(secretURL+ '/delete/:id',(req, res) =>{
  pool.query("DELETE FROM dreams WHERE id="+req.params.id)
  .then( ()=>{
    res.end('{success : "Deleted Successfully", "status" : 200}');
  })
  .catch(e => res.status(500).send({ error: 'Something failed!' }))
})

// ----------------------- start -----------------------
app.listen(process.env.PORT);
console.log('listening on port '+process.env.PORT)
