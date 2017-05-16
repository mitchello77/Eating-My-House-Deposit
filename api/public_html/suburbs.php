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

		return $response;
	}
}
