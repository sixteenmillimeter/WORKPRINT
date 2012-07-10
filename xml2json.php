<?php
              
$xhr = $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest';
if($xhr) {
	$files = $_FILES;
	$data = file_get_contents($files['file']['tmp_name']);
	$sxml = simplexml_load_string($data);
	echo json_encode($sxml);
}
 
?> 