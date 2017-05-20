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

$sql = "SELECT `tblSuburbs_ID`, `tblSuburbs_Name`,`tblSuburbs_Postcode` FROM `tblSuburbs`"; //LIMIT 0 , 1
$result = $conn->query($sql);


if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $url_suburb = str_replace ( ' ', '%20', strtoupper($row["tblSuburbs_Name"]));
        curl_setopt($curl, CURLOPT_URL,"http://api.ripbrisbane.tk/profile/suburb/".$url_suburb."/postcode/".$row['tblSuburbs_Postcode']."?key=Ca!vin");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $resp = curl_exec($curl);

        // DO the Stuff
        $json_a = json_decode($resp, TRUE);
        $str = str_replace ('%20', ' ', strtoupper($row["tblSuburbs_Name"]))."-".$row['tblSuburbs_Postcode'];
        $price_house = $json_a["$str"]['property_types']['HOUSE']['bedrooms']['ALL']['investor_metrics']['median_sold_price'];
        $price_unit = $json_a["$str"]['property_types']['UNIT']['bedrooms']['ALL']['investor_metrics']['median_sold_price'];
        if ($price_unit == '' or $price_unit === NULL) {
            $price_unit = 0;
        }
        if ($price_house == '' or $price_house === NULL) {
            $price_house = 0;
        }
        $result2 = $conn->query("UPDATE `tblSuburbs` SET `tblSuburbs_HouseMedianPrice`=$price_house, `tblSuburbs_UnitMedianPrice`=$price_unit WHERE `tblSuburbs_ID`=".$row["tblSuburbs_ID"]);
        if(! $result2 )
        {
          die('Could not update data: ' . mysqli_error($conn));
        }
        echo "http://api.ripbrisbane.tk/profile/suburb/".$url_suburb."/postcode/".$row['tblSuburbs_Postcode']."?key=Ca!vin<br/>";
        echo $row["tblSuburbs_Name"]. " " . $row["tblSuburbs_Postcode"]." - H$$price_house U$$price_unit<br>";
        //sleep(1);
    }
} else {
    echo "0 results";
}
$conn->close();
curl_close($curl);
echo "All done!";
 ?>
