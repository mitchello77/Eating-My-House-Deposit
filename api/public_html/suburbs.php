<?php
require_once 'MySQLHelper.php';
class suburbs {
	public $dp;
	function __construct()
	{
		$this->dp = new DB_PDO_MySQL();
	}
	/**
	 * Get list of suburbs
	 *
	 * @access protected
	 *
	 * @url GET /
	 *
	 */
	function getSuburbs() {
		// Get Data from MySQL
		$query = "SELECT * FROM `tblSuburbs` WHERE tblSuburbs_InUse = 1";
		$response = $this->dp->select($query,$arr_params);
		if($response == FALSE)
			throw new RestException(204, 'No Suburbs');
		$result = array();
		foreach ($response as $row) {
			$topush = array(
				"Suburb" => $row['tblSuburbs_Name'],
				"Postcode" => $row['tblSuburbs_Postcode'],
				"Distace" => $row['tblSuburbs_DistanceFromCBD'],
				"Price" => $row['tblSuburbs_MedianPrice'],
				"Latitude" => $row['tblSuburbs_Latitude'],
				"Longitude" => $row['tblSuburbs_Longitude']
			);
			array_push($result, $topush);
		};


		return json_decode(json_encode($result), FALSE);
	}
}
