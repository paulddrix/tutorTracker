(function(){
	console.log("tutorApp loaded *****");
	//search course when user clicks button
	document.getElementById('searchCourses').addEventListener('click',function() {

		var searchQuery = document.getElementById('courseName').value;
		//check if the user entered a value
		if (searchQuery != "" && searchQuery != undefined ) {
			var xhttp;
		  xhttp = new XMLHttpRequest();
		  xhttp.onreadystatechange = function() {
		    if (xhttp.readyState == 4 && xhttp.status == 200) {
					console.log(xhttp);
					var response = JSON.parse(xhttp.responseText);
					var resultsHtml ='<ul class="customList">';
					for (var i = 0; i < response.length; i++) {
						resultsHtml+= "<li><b>Name</b>&nbsp;"+response[i]['firstName']+" "+ response[i]['lastName'] +" "+ " <b>Total Hours </b>" +response[i]['monthlyTotalHours'] +"</li>";
					}
					resultsHtml+= "</ul>";

		      document.getElementById("courseSearchRes").innerHTML =resultsHtml;
		    }
		  };
		  xhttp.open("GET", "/tutoreligibility/"+searchQuery, true);
		  xhttp.send();
		}


	});
})();
