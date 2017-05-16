<?php
$servername = "localhost";
$username = "mitch970_ban";
$password = ",3XTPi4_gsS0";
$dbname = "mitch970_brisbanehousing";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$curl = curl_init();

$sql = "SELECT `tblSuburbs_ID`, `tblSuburbs_Name`,`tblSuburbs_Postcode` FROM `tblSuburbs`"; //LIMIT 0 , 20
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $api_base_url = base64_decode('aHR0cHM6Ly9pbnZlc3Rvci1hcGkucmVhbGVzdGF0ZS5jb20uYXU=');
    		$api_host = base64_decode('aW52ZXN0b3ItYXBpLnJlYWxlc3RhdGUuY29tLmF1');
    		$api_referer = base64_decode('aHR0cDovL3d3dy5yZWFsZXN0YXRlLmNvbS5hdS9pbnZlc3QvaG91c2UtaW4=');
    		$api_origin = base64_decode('aHR0cDovL3d3dy5yZWFsZXN0YXRlLmNvbS5hdQ==');
        $suburb = $row["tblSuburbs_Name"];
        $postcode = $row["tblSuburbs_Postcode"];
        $suburb_id = $row["tblSuburbs_ID"];
    		$url_suburb = str_replace ( ' ', '%20', strtoupper($suburb));
        $sub_post = strtoupper($suburb)."-".$postcode;
    		$curl = curl_init();
    		// Set Options
    		curl_setopt($curl, CURLOPT_URL,"$api_base_url/states/QLD/suburbs/$url_suburb/postcodes/$postcode.json");
    		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    		    'User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    		    "Host: $api_host",
    		    "Referer: $api_referer-$suburb,+qld+$postcode",
    		    "Origin: $api_origin",
    				'Accept: application/json, text/javascript, */*; q=0.01'
    		    ));

    		// Send the request
    		$resp = curl_exec($curl); // returns json string
        // DO the Stuff
        if ($resp != ' ') {
          $query = sprintf("REPLACE INTO `tblSuburbProfile` (`tblSuburbProfile_SuburbID`, `tblSuburbProfile_JSONData`) VALUES (%s, '%s')",$suburb_id, mysqli_real_escape_string($conn, $resp));
          $result2 = $conn->query($query);
          if(! $result2 )
          {
            die('Could not update data: ' . mysqli_error($conn));
          }
          //echo "$api_base_url/states/QLD/suburbs/$url_suburb/postcodes/$postcode.json <br />";
          echo $row["tblSuburbs_Name"]. " " . $row["tblSuburbs_Postcode"]."<br />";
        } else {
          $result2 = $conn->query("DELETE FROM `tblSuburbs` WHERE tblSuburbs_ID=".$suburb_id);
          if(! $result2 )
          {
            die('Could not Delete data: ' . mysqli_error($conn));
          }
          echo "<b>".$row["tblSuburbs_Name"]. " " . $row["tblSuburbs_Postcode"]." - Doesn't exist in API! Suburb Deleted</b><br />";
        }
        sleep(2);
    }
} else {
    echo "0 results";
}
$conn->close();
curl_close($curl);
 ?>
