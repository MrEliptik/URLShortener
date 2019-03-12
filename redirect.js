const http  = require('http');
const url   = require("url");
const fs    = require('fs');

"use strict";

// Reading the file that has to be displayed
fs.readFile('./index.html', function(err, data) {
  if (err){
      throw err;
  }
  htmlFile = data;
});

fs.readFile('./style.css', function(err, data) {
  if (err){
      throw err;
  }
  cssFile = data;
});

fs.readFile('./murmurhash2_32_gc.js', function(err, data) {
  if (err){
      throw err;
  }
  js_hashFile = data;
});

fs.readFile('./script.js', function(err, data) {
  if (err){
      throw err;
  }
  js_functionFile = data;
});

fs.readFile('./favicon.ico', function(err, data) {
  if (err){
      throw err;
  }
  icoFile = data;
});

// Server creation
var server = http.createServer(function(req, res) {
  var page = url.parse(req.url).pathname;

  // GET methode -> User wants something (html, css, etc..)
  if(req.method === "GET") {
    // Serves different pages depending on what whants the client
    switch (req.url) {
      case "/script.js" :
        res.writeHead(200, {"Content-Type": "application/js"});
        res.write(js_functionFile);
        res.end();
        break;
      case "/murmurhash2_32_gc.js" :
        res.writeHead(200, {"Content-Type": "application/js"});
        res.write(js_hashFile);
        res.end();
        break;
      case "/style.css" :
        res.writeHead(200, {"Content-Type": "text/css"});
        res.write(cssFile);
        res.end();
        break;
      case "/favicon.ico" :
        res.writeHead(200, {"Content-Type": "image/x-icon"});
        res.write(icoFile);
        res.end();
        break;
      case "/" :
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(htmlFile);
        res.end();
        break;
      default :
        // REDIRECTING
        // READING NUMER
        var number = page.replace("/", "");
        number = number.replace("/", "");

        if(!isNaN(number) && (number.localeCompare("") != 0)){
          if(isInDB(number) != -1){
            var urlToRedirect = retrieve(number);
            console.log('redirecting at : ' + urlToRedirect);

            // RESET TIMEOUT DATE
            resetDate(number);

            // REDIRECTION
            res.writeHead(301,{Location: urlToRedirect});
            res.end();
          }
        }
    }
    // POST METHOD when user want to send something
  } 
  else if(req.method === "POST") {
    // CHECK IF USER WANTS TO ADD URLS
    if (req.url === "/addURL") {
      var reqBody = '';

      req.on('data', function(data) {
        console.log('gathering data..');
        reqBody += data; // Gathering data
        if(reqBody.length > 1e5) {
          res.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
          res.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });

      /* When finished */
      req.on('end', function() {
        let urlToStore_JSON = JSON.parse(reqBody);
        
        // CHECK IF LINK DOES NOT ALREADY EXIST
        if(isInDB(urlToStore_JSON.shortURL) == -1){
          // STORE IT
          store(urlToStore_JSON);
        }
      });
    } 
    else {
      res.writeHead(404, 'Resource Not Found', {'Content-Type': 'text/html'});
      res.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
    }
  } 
  else {
    res.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
    return res.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
  }
  res.end();
});
server.listen(8081);

console.log('Server running at http://localhost:8081/');

/* --------------------------- FUNCTIONS -----------------------------------*/

function isInDB(url){
  /* DO NOT REMOVE NEXT LINE
      require will cache the file it reads
      meaning that if you update the JSON
      it won't in your URLS variable !!
  */
  //var URLS = require("./urls.json");

  var URLS = JSON.parse(fs.readFileSync('./urls.json', 'utf8'));
  let res = -1;

  for (i = 0; i < URLS.URLs.length; i++) {
    if(URLS.URLs[i].shortURL == url){
      res = i;
      break;
    }
  }
  return res;
}

function store(urlsToStore_JSON){
  var dbfile = fs.readFileSync('./urls.json');
  var db = JSON.parse(dbfile);
  addDate(urlsToStore_JSON);

  // Unshift adds to the top of the list
  db['URLs'].unshift(urlsToStore_JSON);

  // prettier save
  var dbJSON = JSON.stringify(db, null, 2); 

  // TODO : better use async function
  fs.writeFileSync('./urls.json', dbJSON);
}

function retrieve(shortURL){
  const url = shortURL;
  var URLS_JSON = JSON.parse(fs.readFileSync('./urls.json', 'utf8'));
  let res = -1;

  for (i = 0; i < URLS_JSON.URLs.length; i++) {
    if(URLS_JSON.URLs[i].shortURL == url){
      res = URLS_JSON.URLs[i].longURL;
      break;
    }
  }

  return res;
}

function addDate(urls_JSON){
  urls_JSON.date = (new Date()).getTime();
  return urls_JSON;
}

function resetDate(shortURL){
  const url = shortURL;
  var URLS_JSON = JSON.parse(fs.readFileSync('./urls.json', 'utf8'));

  for (i = 0; i < URLS_JSON.URLs.length; i++) {
    if(URLS_JSON.URLs[i].shortURL == url){
      URLS_JSON.URLs[i].date = (new Date()).getTime();
      break;
    }
  }
}
