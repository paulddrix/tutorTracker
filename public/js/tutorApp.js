(function(){
	console.log("tutorApp loaded *****");
	//Dashboard page
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
						var resultsHtml ='<div class="listCont">';
						for (var i = 0; i < response.length; i++) {
						resultsHtml+= "<div class=\"userLi\"><b>Name</b>&nbsp;"+response[i]['firstName']+" "+ response[i]['lastName'] +" "+ " <b>Total Hours </b>" +response[i]['monthlyTotalHours'] +"<button id=\"dynamicAssign\" data-tutor-name=\""+response[i]['firstName']+" "+response[i]['lastName']+ "\" data-tutor-id=\""+response[i]['userId']+ " \">Assign</button></div>";
						}
						resultsHtml+= "</div>";

			      document.getElementById("courseSearchRes").innerHTML =resultsHtml;
						document.getElementById('dynamicAssign').addEventListener('click',function() {
							var tutorName = this.getAttribute("data-tutor-name");
							var tutorId = this.getAttribute("data-tutor-id");
							document.getElementsByClassName("assignTutor").assignTutor[0].innerHTML =tutorName;
							document.getElementsByClassName("assignTutor").assignTutor[0].value =tutorId;
						});
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
  var anchor = nav[0]['children'];
      current = window.location.pathname.split('/')[1];
      for (var i = 0; i < anchor.length; i++) {
      if(anchor[i].href.split('/')[3] == current) {
          anchor[i].className = "activeNav";
      }
			else{
				anchor[i].className = "";
			}
  }

})();
