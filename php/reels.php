<?php
//file rendering service
$rawPost = file_get_contents('php://input');

header('Content-Type: text/json');
header('Content-Disposition: attachment;filename=reels.json');

echo $rawPost;

?>
