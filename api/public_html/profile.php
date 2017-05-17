<?php
require_once 'MySQLHelper.php';
class profile {
	public $dp;
	function __construct()
	{
		$this->dp = new DB_PDO_MySQL();
	}
	/**
	 * Get investor data for RP Data Source
	 *
	 * @access protected
	 *
	 * @url GET /fallback/suburb/{suburb}/postcode/{postcode}
	 *
	 * @param string $suburb {@from path}
 	 * @param string $postcode {@from path}
	 */
	function getFallbackInvestorData($suburb, $postcode) {
		// validation
		if (is_null($suburb) or is_null($postcode))
			throw new RestException(400);
		if (!is_numeric($postcode) or strlen($postcode) != 4)
			throw new RestException(400, 'not a valid postcode');

		$api_base_url = base64_decode('aHR0cHM6Ly9pbnZlc3Rvci1hcGkucmVhbGVzdGF0ZS5jb20uYXU=');
		$api_host = base64_decode('aW52ZXN0b3ItYXBpLnJlYWxlc3RhdGUuY29tLmF1');
		$api_referer = base64_decode('aHR0cDovL3d3dy5yZWFsZXN0YXRlLmNvbS5hdS9pbnZlc3QvaG91c2UtaW4=');
		$api_origin = base64_decode('aHR0cDovL3d3dy5yZWFsZXN0YXRlLmNvbS5hdQ==');
		// Get cURL resource
		$url_suburb = str_replace ( ' ', '%20', strtoupper($suburb));
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
		$resp = curl_exec($curl);
		// Finish session
		curl_close($curl);

		if( $resp === null || $resp == FALSE || $resp == ' ' )
    	throw new RestException(204, 'Investor API returned no content');

		//Format data and return
		$curl_jason = json_decode($resp, true);
		return  $curl_jason;
	}
	/**
	 * Get investor data for RP Data Source
	 *
	 * @access protected
	 *
	 * @url GET /suburb/{suburb}/postcode/{postcode}
	 *
	 * @param string $suburb {@from path}
	 * @param string $postcode {@from path}
	 */
	function getInvestorData($suburb, $postcode) {
		// validation
		if (is_null($suburb) or is_null($postcode))
			throw new RestException(400);
		if (!is_numeric($postcode) or strlen($postcode) != 4)
			throw new RestException(400, 'not a valid postcode');

		// Get Data from MySQL
		$query = "SELECT tblSuburbProfile.tblSuburbProfile_ID, tblSuburbProfile.tblSuburbProfile_JSONData, tblSuburbs.tblSuburbs_Postcode, tblSuburbs.tblSuburbs_Name \n"
    . "FROM `tblSuburbProfile`\n"
    . "INNER JOIN tblSuburbs ON tblSuburbProfile.tblSuburbProfile_SuburbID=tblSuburbs.tblSuburbs_ID\n"
    . "WHERE tblSuburbs.tblSuburbs_Postcode = :postcode AND tblSuburbs.tblSuburbs_Name LIKE :name"; //tblSuburbs_Name = :suburb_name AND
		$arr_params = array(':postcode' => $postcode, ':name' => str_replace('%20', ' ', $suburb)); //
		$response = $this->dp->select($query,$arr_params);
		if($response == FALSE)
			throw new RestException(204, 'Investor API returned no content. Check Postcode and Suburb Name');
			
		$json = json_decode($response[0]['tblSuburbProfile_JSONData'], true);
		return $json;
	}
}
