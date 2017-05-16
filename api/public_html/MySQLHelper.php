<?php
require_once '../vendor/restler.php';
use Luracast\Restler\RestException;
class DB_PDO_MySQL
{
    private $db;
    function __construct()
    {
        try {
            $options = array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8');
            $this->db = new PDO(
                'mysql:host=localhost;dbname=mitch970_brisbanehousing',
                'mitch970_ban',
                ',3XTPi4_gsS0',
                $options
            );
            $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,
                PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
    function select($query, $arr_params)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        // validation
        if (is_null($query)) {
          throw new RestException(400);
        }
        if (!is_string($query)) {
          throw new RestException(400, 'select(): $query is not a string');
        }
        if (!is_null($arr_params) and !is_array($arr_params)) {
          throw new RestException(400, 'select(): $arr_params is not an array');
        }
        if (!is_null($arr_params) and count($arr_params) < 1) {
          throw new RestException(400, 'select(): $arr_params is empty');
        }
        //Lets go
        try {
            $sql = $this->db->prepare($query); // 'SELECT * FROM authors WHERE id = :id'
            if (is_null($arr_params)) {
              $sql->execute();
            } else {
              $sql->execute($arr_params); // array(':id' => '1', ..)
            }
            $result = $sql->fetch();
            return $result;
        } catch (PDOException $e) {
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
}
