(function(){
	console.log("tutorApp loaded *****");
	//search course when user clicks button
	if (document.getElementById('searchCourses')) {
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
						var resultsHtml ='<ul class="userLi">';
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
	}
	//document.getElementById("wrapper").style.backgroundColor = "red";
	// ACTIVE NAV
	var nav = document.getElementsByTagName("NAV");
	console.log(nav);
  var anchor = nav[0]['children'];
	console.log(anchor);
      current = window.location.pathname.split('/')[1];
			console.log(current);
      for (var i = 0; i < anchor.length; i++) {
				console.log("anchor sub "+anchor[i].href.split('/')[3]);
				console.log("current "+current);
      if(anchor[i].href.split('/')[3] == current) {
          anchor[i].className = "activeNav";
      }
			else{
				anchor[i].className = "";
			}
  }

})();
