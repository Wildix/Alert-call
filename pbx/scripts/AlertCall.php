<?php
require_once '/var/www/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Credentials: true');
header('P3P: CP="IDC DSP COR CURa ADMa OUR IND PHY ONL COM STA"');


$filter = $_REQUEST['filter'];
if(!is_array($filter)){
	$filter = array();
}
$filter['from_name'] = 'CallOut';


$result = array();
$calls = \Wildix\CallHistory\Calls::getInstance()->getCalls($filter, null, null, 0, 99999, 'start', 'ASC');
foreach ($calls as $key => $call){
	$result[] = $call->getAsArray($fields);
}


echo \DataEncoder\JSON::encode($result);
