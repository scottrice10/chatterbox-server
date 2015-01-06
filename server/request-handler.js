/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var path = require("path");
var url = require("url");
var fs = require("fs");

var messages = {
  "results": [],
  "rooms": []
};

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  //console.log("Serving request type " + request.method + " for url " + request.url);

  var my_path = url.parse(request.url).pathname || 'index.html';
  var full_path = path.join("/Users/student/Desktop/2014-12-chatterbox-server/client/", my_path);
  var ext = path.extname(my_path);

  var extensions = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".gif": "image/gif",
    ".jpg": "image/jpeg"
  };

  var statusCode;
  console.log(request.method)
  if (request.method === "POST" && (my_path === "/classes/messages" || my_path === "/classes/room")) {
    statusCode = 201;

    var fullBody = '';

    request.on('data', function(chunk) {
      // append the current chunk of data to the fullBody variable
      fullBody += chunk.toString();
    });

    request.on('end', function() {
      fullBody = JSON.parse(fullBody);
      messages.results.push({
        "username": fullBody.username,
        "message": fullBody.message
      });
    });
  } else if (my_path === "/classes/messages" || my_path === "/classes/room" || my_path === "index.html") {
    statusCode = 200;

    fs.readFile("../client/index.html", function(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  } else {
    statusCode = 404;
  }

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(JSON.stringify(messages));
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
