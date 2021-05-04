<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  </head>
  <body>
    <nav class="navbar navbar-default">
      <div class="container-fluid">
        <ul class="nav navbar-nav">
          <li><a href="welcome.html"><b>Home</b></a></li>
          <li><a href="contacts.html"><b>Contacts</b></a></li>
          <li><a href="addContact.html"><b>Add Contact</b></a></li>
          <li><a href="stock.html"><b>Stock Page</b></a></li>
          <li><a href="/logout"><b>Logout</b></a></li>
          <li><b>Export</b></li>
        </ul>
      </div>
    </nav>
    <br><br>

    <div class="container">
      <table class="table" id="contactsTable">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Location</th>
            <th scope="col">Contact Information</th>
            <th scope="col">Email</th>
            <th scope="col">Website <br> (URL) </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    <script type="text/javascript">
     /* TODO Fill this script in with a request to your server to GET contacts.json
     /  and display it in the contactsTable.
     /*/
     $(document).ready(function() {
       // console.log("creating new http request");
       var data_file = "/getContact";
       var http_request = new XMLHttpRequest();
       http_request.onreadystatechange = function() {
         // console.log("Ready state changed to: ", http_request.readyState);
         if (http_request.readyState == 4) {
           // console.log("Ready state is 4!");
           var jsonObj = JSON.parse(http_request.responseText);
           // console.log("Got the response from the Server!");
           // console.log(jsonObj);
           var table = document.getElementById("contactsTable");
           $.each(jsonObj, function(idx, elem) {
             //var new_row = "";
             var new_row = "<tr><td>" + elem.name + "</td><td>"
                 + elem.category + "</td><td>" + elem.location + "</td><td>"
                 + elem.contact_info + "</td><td>" + elem.email + "</td><td>"
                 + elem.website + "</td><td>" + elem.website_url + "</td></tr>";
             // console.log("new row: ", new_row);
             var row = table.insertRow(-1);
             row.innerHTML = new_row;
           });
         }
       }
       http_request.open("GET", data_file, true);
       http_request.send();
     });
    </script>
  </body>
</html>
