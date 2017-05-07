var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var url = process.env.DATABASE_URL;
var shortid = require("shortid");
var isUrl = require("is-url");
var express = require("express");
var app = express();
var path = require("path");

app.set("views",path.join(__dirname,"views","pages"));
app.set("view engine","ejs");

app.get(RegExp(/\/new\/[\s\S]*/g),function(request, response) {
	console.log("to create new entry here and return object");
	var originalURL = request.path.slice(5);
	console.log(originalURL);
	if (!isUrl(originalURL)) {
		response.end(JSON.stringify({
			"original_url": originalURL,
			"shortened_url": "INVALID URL PROVIDED"
		}));
		return;
	}
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the mongoDB server. Error: ",error);
		} else {
			console.log("Connection established to: " + url);
			var shortenedURL = shortid.generate();
			db.collection("urlcollection").insert({
				"shortenedURL": shortenedURL,
				"originalURL": originalURL
			});
			response.end(JSON.stringify({
				"original_url": originalURL,
				"shortened_url": "https://frozen-meadow-99188.herokuapp.com/" + shortenedURL
			}));
			db.close();
		}
	});
});

app.get("/",function(request, response) {
	console.log("show homepage here!");
	response.render("homepage");
});

app.get("/:SHORTENEDURL",function(request, response) {
	if (request.params.SHORTENEDURL === "favicon.ico") {
		response.writeHead(200, {'Content-Type': 'image/x-icon'} );
    response.end();
    console.log('favicon requested');
    return;
	}
	console.log("REDIRECT URL");
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the mongoDB server. Error: ",error);
		} else {
			console.log("Connection established to: " + url);
			db.collection("urlcollection").findOne({"shortenedURL": request.params.SHORTENEDURL},{},function(err, doc) {
				if (err) {
					console.log("Error finding document!");
				} else {
					console.log("Redirecting to: " + doc.originalURL);
					response.writeHead(301,{
						Location: doc.originalURL
					});
					response.end();
				}
			});
			db.close();
		}
	});
});

app.listen(process.env.PORT || 5000);



