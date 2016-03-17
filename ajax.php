<?php
	$data = array("html"=> '<div class="wrapper-lightbox"><div class="wrapper-lightbox-inner"><a href="#"><img class="lightbox-button-close" src="http://image005.flaticon.com/75/svg/70/70460.svg" width="12" height="12"></a>
		Value passed: <span style="color:#2288bb;">'.$_POST['valor'].'</span>
		<br><br>
		Here is an example using ajax request
		</div></div>
	');
	
	echo json_encode($data);

?>