(function($){
	//
	$.fn.lightbox = function( method )
	{
		var methods =
		{
			init :										function( options ){ 			return this.each(function(){	_init(this, options);});},
			destroy :									function( options ){ 			return this.each(function(){	_destroy(this,options);});}
		};
		
		//----------------------------------------------------------------------
		//----------------------------------------------------------------------
		var defaults =
		{
			background					: 'background-color:rgba(0,0,0,.8);',//background do overlay
			type						: 'html',//ajax or html
			time						: 300,//tempo para abrir e fechar o overlay
			minWidth					: '',//tamanho minimo do overlay
			width						: 300,//tamanho do objeto central
			height						: 300,//altura do objeto central
			show_loader					: "",//objeto de carregando 
			closeWhenClickOutside		: false,//fechar o plugin quando for clicado na parte de fora
			close_button				: "",//css do botão de fechar
			url							: "",//caminho do arquivo a ser carregado
			type_ajax					: "",//GET ou POST
			dataType					: "",//estrutura a ser retornada json ou ""
			added						: function() {},
			destroyed					: function(){},
			ajax_error					: function(){},
			ajax_sucess					: function(){},
			ajax_complete				: function(){}
		};
		
		var plugin_settings;
		var plugin_element;

		//----------------------------------------------------------------------
		//----------------------------------------------------------------------

		// Method calling logic
		if ( methods[method] )//caso exista um método, esse método é chamado
		{
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if ( typeof method === 'object' || ! method )//caso não exista um método ou seja apenas passado o objeto
		{
			return methods.init.apply( this, arguments );
		}
		else//caso o método não exista
		{
		  $.error( 'Method ' +  method + ' does not exist on jQuery.boilerplate' );
		}
		
		function _init($this, options)
		{
			plugin_element 						= $($this);
			plugin_settings 					= $.extend(defaults, options);				
			initialize($this);
		}
		
		function initialize($this)
		{
			//adiciona o css na página
			if(!$("body").hasClass("lightbox-css-added"))
			{
				$('body').addClass('lightbox-css-added');
				$('head').append(getCss());
			}
			
			//adiciona o html do lightbox	
			plugin_element.append(getHtml ());
			
			//
			if(plugin_settings.type == "ajax")
			{
				loadContent();
			}
			else
			{
				insertHtml();
			}
			
			plugin_settings.added.call();
			
			//revela o lightbox
			$('.lightbox-wrapper').show();
			$('.lightbox-wrapper').animate({opacity:1},plugin_settings.time);
			
			//fecha o lightbox caso ocorra um clique fora do box central
			if(plugin_settings.closeWhenClickOutside)
			{
				$('.lightbox-background').mousedown(function()
					{
						removeLightbox();
					}
				);
			}
			
			//botão de fechar
			$(".lightbox-button-close").click(function()
				{
					removeLightbox ();
					return false;
				}
			);
			
		}
		
		//remove o plugin com uma naimação fade out
		function removeLightbox ()
		{
			$('.lightbox-wrapper').fadeOut(plugin_settings.time,function(){ destroy();});
		}
		
		//destroi o plugin
		function destroy ()
		{
			$('.lightbox-wrapper').remove();
			plugin_settings.destroyed.call();
		}
		
		//carrega o conteúdo do html via ajax
		function loadContent () 
		{
			
			$.ajax({
				url: plugin_settings.url,
				type: plugin_settings.type_ajax,
				dataType: plugin_settings.dataType,
				error: function (data)
				{
					plugin_settings.ajax_error.call(this, {data:data});
					checkLoader();
				},
				success: function (data)
				{
					$(".lightbox-content").css({opacity:0});
					$(".lightbox-content").animate({opacity:1},200);
					
					//--------------
					//adiciona o html
					if(plugin_settings.dataType == "json")
					{
						$(".lightbox-content").append(data.html);
					}
					else
					{
						$(".lightbox-content").append(data);
					}
					
					//posiciona o lightbox-content
					$('.lightbox-content').css(
						{
							width:(plugin_settings.width)+"px",
							height:(plugin_settings.height)+"px",
							marginTop:-(plugin_settings.height/2)+"px",
							marginLeft:-(plugin_settings.width/2)+"px"
						}
					);
															
					//--------------
					plugin_settings.ajax_sucess.call(this, {data:data});
				},
				complete: function (data)
				{
					checkLoader();					
					plugin_settings.ajax_complete.call(this, {data:data});
				}
			});
		}
		
		function checkLoader ()
		{
			if($(".lightbox-loader").size() > 0)
			{
				$(".lightbox-loader").remove();
			}
		}
		
		//insere o conteúdo do html
		function insertHtml () 
		{
			
			//adiciona o html
			$(".lightbox-content").append(plugin_settings.contentHtml);
			
			//posiciona o lightbox-content
			$('.lightbox-content').css(
				{
					width:(plugin_settings.width)+"px",
					height:(plugin_settings.height)+"px",
					marginTop:-(plugin_settings.height/2)+"px",
					marginLeft:-(plugin_settings.width/2)+"px"
				}
			);
			
		}
		
		//----------------------
		//gera o css do lightbox
		function getCss () {
			
			//-------------------------
		
			//-------------------------
			var _css;
			_css = '<style type="text/css">';
			//-------------
				var _minWidth = (plugin_settings.minWidth != "") ? "min-width:"+plugin_settings.minWidth+"px;" : "";
				_css += '.lightbox-wrapper{ position:fixed; top:0; left:0; width:100%; height:100%; opacity:0; display:none; overflow:scroll;}';
				_css += '.lightbox-box{ position:relative; top:0; left:0; width:100%; height:100%;'+_minWidth+'}';
				_css += '.lightbox-background{ position:absolute; top:0; left:0; width:100%; height:100%;'+plugin_settings.background+'}';
				_css += '.lightbox-content{ position:absolute; top:50%; left:50%;}';
				
				if(plugin_settings.close_button != "")
				{	
					_css += '.lightbox-button-close{'+plugin_settings.close_button+'}';
				}
				
				if(plugin_settings.show_loader != "")
				{	
					_css += '.lightbox-loader{'+plugin_settings.show_loader+'}';
				}
			//-------------
			_css += '</style>';
			
			return _css;
		}
		
		//-------------------------
		//gera o html a ser exibido
		function getHtml (){
			
			var _html;
			
			_html  = '<div class="lightbox-wrapper">';
			_html += '<div class="lightbox-box">';
			//---------------------
				_html += '<div class="lightbox-background"></div>';
				
				if(plugin_settings.show_loader != "")
				{	
					_html += '<div class="lightbox-loader"></div>';
				}
				
				_html += '<div class="lightbox-content">';
						//só cria o botão de fechar do lightbox caso tenha a propriedade \close_button\ na instanciação
						if(plugin_settings.close_button != "")
						{	
							_html += '<a href="#" class="lightbox-button-close"></a>';
						}
				_html += '</div>';
			//---------------------
			_html  += '</div>';
    		_html  += '</div>';
			
			return _html;
			
		}
		    
	};//-------------------------------
})(jQuery);
