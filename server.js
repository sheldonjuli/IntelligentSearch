// CSC309 A3 Server
// Author: Li Ju
// cdf: c5juli
// email: sheldon.ju@mail.utoronto.ca

// requests
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8080;

var file = './nytimes.json';
var jsonData;
var details_format = new RegExp("^/nytimes/details/index=[0-9]+$");
var assets_files_format = new RegExp("^/assets/");

// read json data into jsonData
fs.readFile(file, 'utf8', function (err, data) {
	if (err) {
	console.log('Error: ' + err);
	return;
	}

	jsonData = JSON.parse(data)[0].results;
});

// handle the request of displaying all articles
function handle_articles(response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	// put all information in an array
	var Darray = [];
	var i = 0;
	for (i = 0; i < jsonData.length; i++) {
		Darray.push(jsonData[i].published_date);
		Darray.push(jsonData[i].title);
		Darray.push(jsonData[i].abstract);
		Darray.push(jsonData[i].short_url);
	}
	response.end(JSON.stringify(Darray));
	console.log("Articles data sent");
}

// handle the request of displaying all authors
function handle_authors(response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	var Darray = [];
	// eliminate duplicates
	var jsonSend = new Set();
	var i = 0;
	for (i = 0; i < jsonData.length; i++) {
		Darray.push(jsonData[i].byline.slice(3));
	}
	for (i = 0; i < Darray.length; i++) {
		if (Darray[i].includes(" and ")) {
			var bits = Darray[i].split(" and ");
			for (var j = 0; j < bits.length; j++) {
				jsonSend.add(bits[j]);
			}
		} else {
			jsonSend.add(Darray[i]);
		}

	}
	// put in an array so it can be sent and received properly
	Darray  = Array.from(jsonSend);
	response.end(JSON.stringify(Darray));
	console.log("Authors data sent");
}

// handle the request of displaying all URLs
function handle_URLs(response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	var Dmap = {};
	var i = 0;
	for (i = 0; i < jsonData.length; i++) {
		var key = jsonData[i].published_date.slice(0, 10);
		if (key in Dmap) {
			Dmap[key].push(jsonData[i].short_url);
		} else {
			Dmap[key] = [jsonData[i].short_url];
		}
	}
	response.end(JSON.stringify(Dmap));
	console.log("URLs data sent");
}

// handle the request of displaying fields as a tags cloud
function handle_fields(response) {
	var Dmap = {};
	var default_font_size = 15;
	var i = 0;
	for (i = 0; i < jsonData.length; i++) {
		var topics = jsonData[i].des_facet;
		var j = 0;
		for (j = 0; j < topics.length; j++) {
			var title = topics[j];
			if (title in Dmap) {
				Dmap[title] += 10;
			} else {
				Dmap[title] = default_font_size;
			}   
		}
	}
	response.end(JSON.stringify(Dmap));
	console.log("Fields data sent");
}

// handle the request of displaying details of an article at given index
function handle_details(uri, response) {
	// index number at position 23
	var index = uri.slice(23);
	var Darray = [];
	console.log("Index: " + index + " requested");
	// Article of given index does not exist
	if (index >= jsonData.length) {
		Darray.push("Article of given index does not exist");
		console.log("Received invalid detail index");
	} else {
		// push information into the array
		var article = jsonData[index];
		Darray.push(article.section);
		Darray.push(article.subsection);
		Darray.push(article.title);
		Darray.push(article.abstract);
		Darray.push(article.byline);
		Darray.push(article.published_date);
		Darray.push(article.des_facet);
	}
	response.end(JSON.stringify(Darray));
	console.log("Details data sent");
}

// handle the request of displaying articles as multimedia
function handle_multimedia(response) {
	var Dmap = {};
	var i = 0;
	for (i = 0; i < jsonData.length; i++) {
		var media = jsonData[i].multimedia;
		var link = jsonData[i].short_url;
		// this article has not picture
		if (media.length == 0) {
			Dmap[link] = jsonData[i].title;
		// this article has more than one picture, pick one randomly
		} else if (media.length > 1) {
			var index = Math.floor((Math.random() * media.length));
			Dmap[link] = media[index];
		} else {
			Dmap[link] = media[0];
		}
	}
	response.end(JSON.stringify(Dmap));
	console.log("Multimedia data sent");
}

// initial request
// server html, css, js
function servering_files(filename, response) {
	var contentTypesByExtension = {
		'.html': "text/html",
		'.css':	"text/css",
		'.js': "text/javascript",
		'.svg': "image/svg+xml",
		'.ico': "image/x-icon"
	};
	if (fs.statSync(filename).isDirectory()) filename += 'a3.html';

	fs.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("File: " + filename + " not found\n");
			response.write("404 Not Found\n");
			response.end();
			return;
		}

	console.log("file sent: " + filename);

	fs.readFile(filename, "binary", function(err, file) {
		if(err) {        
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
			return;
		}

	  var headers = {};
	  var contentType = contentTypesByExtension[path.extname(filename)];

	  if (contentType) headers["Content-Type"] = contentType;
		  response.writeHead(200, headers);
		  response.write(file, "binary");
		  response.end();
	  });
	});
}

http.createServer(function(request, response) {
	

	var uri = url.parse(request.url).pathname
		, filename = path.join(process.cwd(), uri);

    if (uri == '/nytimes/articles') {
		// handle the request of displaying all articles
		handle_articles(response);
		return;
    } else if (uri == '/nytimes/authors') {
		// handle the request of displaying all authors
		handle_authors(response);
		return;
	} else if (uri == '/nytimes/URLs') {
		// handle the request of displaying all URLs
		handle_URLs(response);
		return;
    } else if (uri == '/nytimes/fields'){
		// handle the request of displaying fields as a tags cloud
		handle_fields(response);
		return;
    } else if (uri.match(details_format)) {
		// handle the request of displaying details of an article at given index
		handle_details(uri, response);
        return;
    } else if (uri == '/nytimes/multimedia') {
		// handle the request of displaying articles as multimedia
		handle_multimedia(response);
		return;
	} else if (uri == '/' || uri.match(assets_files_format)) {
		// initial request, server html, css, js
		servering_files(filename, response);
		return;
	} else {
		// requesting a non-exist file
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("File not found\n");
		response.end();
		console.log("Requested non-exist file");
		return;
	}

}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");