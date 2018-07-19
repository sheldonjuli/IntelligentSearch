// CSC309 A3 Server
// Author: Li Ju
// cdf: c5juli
// email: sheldon.ju@mail.utoronto.ca

// default
var host = "http://localhost:8080/";

// process the request to display all articles
function process_articles() {
    $.ajax({
        url: host + "nytimes/articles",
        dataType: 'JSON',
        method: 'GET',
        crossDomain: true,
    })
    .done(function (data) {
		$("#section-maindisplay").text("All articles in basic text");
		for (var i = 0; i < data.length; i++) {
			var element = $("<p></p>").text(data[i]);
			$("#section-maindisplay").append(element);
            if (i % 4 == 3) {
                $("#section-maindisplay").append("<br>");
            }
		}
        console.log("Articles data fetched");
    })
	.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

// process the request to display all authors
function process_authors() {
    $.ajax({
        url: host + "nytimes/authors",
        dataType: 'JSON',
        method: 'GET',
        crossDomain: true,
    })
    .done(function (data) {
		$("#section-maindisplay").text("A list of all known authors");
        for (var index in data) {
            var element = $("<p></p>").text(data[index]);
			$("#section-maindisplay").append(element);
        }
		console.log("Authors data fetched");
    })
	.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

// process the request to display all short urls
// grouped by date
function process_URLs() {
    $.ajax({
        url: host + "nytimes/URLs",
        dataType: 'JSON',
        method: 'GET',
        crossDomain: true,
    })
    .done(function (data) {
		$("#section-maindisplay").text("A list of all article short URLs");
		for (var key in data) {
			var date = $("<p></p>").text(key);
			$("#section-maindisplay").append(date);
			$.each(data[key], function(index, value) {
				// append as hyperlinks
				var link = $("<a></a>").text(value).attr("href", value);
				$("#section-maindisplay").append(link);
				$("#section-maindisplay").append("<br>");
			});
		}
        console.log("URLs data fetched");
    })
	.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}
// process the request to display fields as a tags cloud
function process_fields() {
    $.ajax({
        url: host + "nytimes/fields",
        dataType: 'JSON',
        method: 'GET',
        crossDomain: true,
    })
    .done(function (data) {
		$("#section-maindisplay").text("A list of tags from the des_facet field");
        var tags = $("<p></p>").text("");
		for (var key in data) {
			var single_tag = $("<span></span>").text(key);
            $(single_tag).css('font-size', data[key]);
            var colors = ["red", "orange", "green", "purple"];
            $(single_tag).css('color', colors[Math.floor(Math.random() * 10) % 4]);
            $(single_tag).css('padding', 20);
            tags.append(single_tag);
		}
        $("#section-maindisplay").append(tags);
		console.log("Fields data fetched");
        
    })
	.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

// when the user search form details of an article with given index
function process_details(index) {
    $.ajax({
        url: host + "nytimes/details/index=" + index,
        dataType: 'JSON',
        method: 'GET',
        crossDomain: true,
    })
    .done(function (data) {
		$("#section-maindisplay").text("Details of article with index " + index);
        $.each(data, function(index, value) {
            var article_attr = $("<p></p>").text(value);
            $("#section-maindisplay").append(article_attr);
        });
		console.log("Details of an article data fetched");
    })
	.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

// when the user search display all articles as multimedia
function process_multimedia() {
    $.ajax({
        url: host + "nytimes/multimedia",
        dataType: 'JSON',
        method: 'GET',
        crossDomain: true,
    })
    .done(function (data) {
		$("#section-maindisplay").text("Images or videos of all articles");
		// keys are urls, values are image sources
		for (var key in data) {
            $("#section-maindisplay").append('</br>');
			var link = $("<a></a>").attr("href", key);
			var image = $("<img>").attr({
				"alt": data[key],
				"src": data[key].url,
				"height": 130,
				"width": 200
			});
			$(link).append(image);
			$("#section-maindisplay").append(link);
			$("#section-maindisplay").append("<br>");
		}
		console.log("Multimedia data fetched");
    })
	.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

// main function
// handle request based on user's input
$(document).ready(function() {
	
	console.log(document.URL);
	host = document.URL;
	
	$("#section-maindisplay").css('color', 'green');
    var details_format = new RegExp("^details [0-9]+$");
    $("#input-userinput").keydown(function(e){
		// process when user hits enter
        if (e.keyCode == 13) {
			$("#section-maindisplay").css('color', 'green');
			// when the user wants to display all articles
            if ($(this).val() == "articles") {
                process_articles();
            // when the user search for authors
            } else if ($(this).val() == "authors") {
                process_authors();
            // when the user search for URLs
            } else if ($(this).val() == "urls") {
				process_URLs();
            // when the user search for fields
            } else if ($(this).val() == "fields") {
				process_fields();
			// when the user search form details of an article with given index
            } else if ($(this).val().match(details_format)) {
                var index = $(this).val().slice(8);
                process_details(index);
			// when the user search display all articles as multimedia
            } else if ($(this).val() == "multimedia") {
                process_multimedia();
            } else {
				// unsupported requests
                $("#section-maindisplay").text("Please enter a valid request");
				$("#section-maindisplay").css('color', 'orange');
            }
        }
    });
    
    $("#button-tips").click(function(e) {
        $("#section-maindisplay").text("Supported key words: articles, authors, urls, fields, details[space][index], multimedia");
    });
});