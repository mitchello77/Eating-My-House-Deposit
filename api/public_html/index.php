<?php

require_once '../vendor/restler.php';
//smart auto loader helps loading a namespaced class with just the name part
use Luracast\Restler\Restler;
use Luracast\Restler\Defaults;

//set the defaults
Defaults::$throttle = 20; //time in milliseconds for bandwidth throttling
Defaults::$crossOriginResourceSharing = true;
Defaults::$accessControlAllowOrigin = '*';


//setup restler
$r = new Restler(true); //pass true bool when production ready
$r->setSupportedFormats('JsonFormat');
$r->addAPIClass('root', '');
$r->addAPIClass('profile');
$r->addAPIClass('suburbs');
$r->addAuthenticationClass('auth');
$r->handle();
