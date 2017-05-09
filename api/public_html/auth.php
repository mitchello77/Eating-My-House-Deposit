<?php
use Luracast\Restler\iAuthenticate;
class auth implements iAuthenticate
{
    const KEY = 'Ca!vin';
    function __isAllowed()
    {
        return isset($_GET['key']) && $_GET['key'] == auth::KEY ? TRUE : FALSE;
    }
    public function __getWWWAuthenticateString()
    {
        return 'Query name="key"';
    }
    function key()
    {
        return auth::KEY;
    }
}
