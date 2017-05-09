<?php
class root {
	/**
   * @url GET /
	 * @access protected
	 */
	function blocked(){
    throw new RestException(204);
		return '';
	}
}
