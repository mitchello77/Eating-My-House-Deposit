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

$sql = "SELECT `tblSuburbs_ID`, `tblSuburbs_Name`,`tblSuburbs_Postcode` FROM `tblSuburbs` LIMIT 50 , 70";
$result = $conn->query($sql);


if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        curl_setopt($curl, CURLOPT_URL,"http://v0.postcodeapi.com.au/suburbs.json?postcode=".$row["tblSuburbs_Postcode"]."&name=".$row["tblSuburbs_Name"]);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $resp = curl_exec($curl);

        // DO the Stuff
        $json_a = json_decode($resp, TRUE);
        $latitude = $json_a[0]['latitude'];
        $longitude = $json_a[0]['longitude'];
        if ($latitude == '' or $latitude === NULL) {
            $latitude = 'NULL';
        }
        if ($longitude == '' or $longitude === NULL) {
            $longitude = 'NULL';
        }
        $result2 = $conn->query("UPDATE `tblSuburbs` SET `tblSuburbs_Latitude`=$latitude, `tblSuburbs_Longitude`=$longitude WHERE `tblSuburbs_ID`=".$row["tblSuburbs_ID"]);
        if(! $result2 )
        {
          die('Could not update data: ' . mysqli_error($conn));
        }
        echo $row["tblSuburbs_Name"]. " " . $row["tblSuburbs_Postcode"]." - $latitude:$longitude<br>";
        sleep(5);
    }
} else {
    echo "0 results";
}
$conn->close();
curl_close($curl);
 ?>
