<?php
	$data = array("html"=> '<div style="background-color:#ffffff;">
		<div style=" padding:10px;">
			<p>Conteúdo a ser carregado com dados passados via json:<span style="color:#999999;"> '.$_POST['valor'].'</span></p>
			<a id="bt-overlay-2" href="#" style="border:1px solid #000000; padding:10px; display:inline-block;">abrir novo overlay</a>
		</div>
	</div>');
	
	echo json_encode($data);
	//echo '<div style="background-color:#ffffff; width:500px; height:300px;"><p>Conteudo a ser carregado</p></div>';
	
?>