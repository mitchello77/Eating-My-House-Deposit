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
   * @param float $filter
	 */
	function get($filter) {
		// Get Data from MySQL
		$query = "SELECT * FROM `tblSuburbs` WHERE `tblSuburbs_InUse` = 1 AND `tblSuburbs_DistanceFromCBD` <= $filter";
		$response = $this->dp->select($query,$arr_params);
		if($response == FALSE)
			throw new RestException(204, 'No Suburbs');
		$result = array();
		foreach ($response as $row) {
			$topush = array(
				"Suburb" => $row['tblSuburbs_Name'],
				"Postcode" => $row['tblSuburbs_Postcode'],
				"Distace" => $row['tblSuburbs_DistanceFromCBD'],
				"HousePrice" => $row['tblSuburbs_HouseMedianPrice'],
				"UnitPrice" => $row['tblSuburbs_UnitMedianPrice'],
				"HousePricePast" => $row['tblSuburbs_HouseMedianPastPrice'],
				"UnitPricePast" => $row['tblSuburbs_UnitMedianPastPrice'],
				"Latitude" => $row['tblSuburbs_Latitude'],
				"Longitude" => $row['tblSuburbs_Longitude']
			);
			array_push($result, $topush);
		};
		return json_decode(json_encode($result), FALSE);
	}
}
