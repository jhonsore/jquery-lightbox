(function($){
	//
	$.fn.lightbox = function( method )
	{
		var methods =
		{
			init :										function( options )
			{
				//como o objeto ainda não existe, primeiramente criamos ele e o adicionamos no html
				addObject(this.selector);
				var _obj = $(this.selector);
				return _obj.each(function(){	_init(_obj, options);});
			},
			destroy :									function( options ){ 			return this.each(function(){	_destroy(this,options);});},
			remove :									function( options ){ 			return this.each(function(){	_remove(this,options);});},
			hideContent :								function( options ){ 			return this.each(function(){	_hideContent(this,options);});}
		};

		//----------------------------------------------------------------------
		//----------------------------------------------------------------------
		var defaults =
		{
			object						: this.selector,
			background					: 'background-color:rgba(0,0,0,.8);',//background do overlay
			zIndex                      : "10000",
			type						: 'html',//ajax or html
			time						: 300,//tempo para abrir e fechar o overlay
			width						: 300,//tamanho do objeto central
			height						: null,//altura do objeto central
			show_loader					: "",//objeto de carregando
			closeWhenClickOutside		: false,//fechar o plugin quando for clicado na parte de fora
			close_button				: "",//css do botão de fechar
			url							: "",//caminho do arquivo a ser carregado
			type_ajax					: "",//GET ou POST
			dataType					: "",//estrutura a ser retornada json ou ""
			data						: "",//dados a serem enviados quando dataType == json
			closeWithDelay				: 0,
			added						: function() {},//plugin adicionando
			destroyed					: function(){},//plugin removido
			ajax_error					: function(){},//erro no ajax
			ajax_sucess					: function(){},//sucesso ajax
			ajax_complete				: function(){}//ajax completo,
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
			jQuery(document.body).css('overflow', 'hidden');

			//adiciona o html do lightbox
			plugin_element.append(getHtml ());

			//revela o lightbox
			$(plugin_settings.object).show();

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

			$(plugin_settings.object).data(plugin_settings);

			//revela o lightbox
			$(plugin_settings.object).animate({opacity:1},plugin_settings.time);

			//fecha o lightbox caso ocorra um clique fora do box central
			if(plugin_settings.closeWhenClickOutside)
			{
				$('.lightbox-background',$(plugin_settings.object)).mousedown(function()
					{
						removeLightbox();
					}
				);
			}

			//fecha plugin com delay
			if(plugin_settings.closeWithDelay > 0)
			{
				var interval = setTimeout(function(){ removeLightbox (); clearTimeout(interval);},4000);
			}

			//botão de fechar
			$(".lightbox-button-close",$(plugin_settings.object)).click(function()
				{
					removeLightbox ();
					return false;
				}
			);

		}

		//remove o plugin com uma naimação fade out
		function removeLightbox ()
		{
			$(plugin_settings.object).fadeOut(plugin_settings.time,function(){ _destroy();});
		}

		function _remove (_item)
		{
			var _newData = $(_item).data();
			plugin_settings = _newData;
			plugin_element = $(_item);
			removeLightbox ();
		}

		//destroi o plugin
		function _destroy ()
		{
			$(plugin_settings.object).data(null);
			$(plugin_settings.object).remove();
			plugin_settings.destroyed.call();
			jQuery(document.body).css('overflow', 'auto');
		}

		//carrega o conteúdo do html via ajax
		function loadContent ()
		{

			$.ajax({
				url: plugin_settings.url,
				type: plugin_settings.type_ajax,
				dataType: plugin_settings.dataType,
				data: plugin_settings.data,
				error: function (data)
				{
					plugin_settings.ajax_error.call(this, {data:data});
					checkLoader('remove');
				},
				success: function (data)
				{
					$(".lightbox-content",$(plugin_settings.object)).css({opacity:0});

					//adiciona o html
					var _html = (plugin_settings.dataType == "json") ? data.html : data;
					_html = $(_html);

					var _div = $("<div></div>");
					_div.addClass("content-loaded");

					$(".lightbox-content .lightbox-load-content",$(plugin_settings.object)).append(_div);
					_div.append(_html);

					_div.css({width:plugin_settings.width});

					$('.lightbox-content .lightbox-load-content',$(plugin_settings.object)).css(
						{
							width:(plugin_settings.width)+"px"
						}
					);

					var _height = (plugin_settings.height) ? plugin_settings.height : null;

					if(_height){
						_div.css({ height:_height});
						$('.lightbox-content .lightbox-load-content',$(plugin_settings.object)).css(
							{
								height:(_height)+"px"
							}
						);
					}

					$('.lightbox-content .lightbox-load-content',$(plugin_settings.object)).css(
						{
							margin:"0 auto"
						}
					);

					addCloseButton (_div);

					//--------------
					plugin_settings.ajax_sucess.call(this, {data:data});
					$(".lightbox-content",$(plugin_settings.object)).animate({opacity:1},200);
				},
				complete: function (data)
				{
					checkLoader('remove');
					plugin_settings.ajax_complete.call(this, {data:data});
				}
			});
		}

		function checkLoader (_check)
		{
			if(_check == 'add')
			{
				plugin_element.append('<div class="lightbox-loader" style="'+plugin_settings.show_loader+'"></div>');
			}
			else
			{
				if($(".lightbox-loader",$(plugin_settings.object)).size() > 0)
				{
					$(".lightbox-loader",$(plugin_settings.object)).remove();
				}
			}
		}

		//insere o conteúdo do html
		function insertHtml ()
		{
			//adiciona o html
			var _html = $(plugin_settings.contentHtml);
			var _div = $("<div></div>");
			_div.addClass("content-loaded");

			$(".lightbox-content .lightbox-load-content",$(plugin_settings.object)).append(_div);
			_div.append(_html);

			addCloseButton(_div);

			_html.css({width:plugin_settings.width});

			$('.lightbox-content .lightbox-load-content',$(plugin_settings.object)).css(
				{
					width:(plugin_settings.width)+"px"
				}
			);

			var _height = (plugin_settings.height) ? plugin_settings.height : null;

			if(_height){
				_div.css({ height:_height});
				$('.lightbox-content .lightbox-load-content',$(plugin_settings.object)).css(
					{
						height:(_height)+"px"
					}
				);
			}

			$('.lightbox-content .lightbox-load-content',$(plugin_settings.object)).css(
				{
					margin:"0 auto"
				}
			);


		}

		//----------------------
		//oculta o conteúdo
		function _hideContent ( $obj, $property ) {
			var _button = $property.item;
			_button.parents(".content-loaded").fadeOut(200,function(){loadNewContent($($obj),$property);});
		}

		//carrega um novo conteúdo no lightox
		function loadNewContent ($obj,$data)
		{
			var _newData = $.extend($obj.data(), $data);
			plugin_settings = _newData;
			plugin_element = $obj;

			if(plugin_settings.type == "ajax")
			{
				checkLoader('add');
				console.log(_newData.url);
				$.ajax({
					url: _newData.url,
					type: _newData.type_ajax,
					dataType: _newData.dataType,
					data: _newData.data,
					error: function (data)
					{
						_newData.ajax_error.call(this, {data:data});
						checkLoader('remove');
					},
					success: function (data)
					{
						//adiciona o html
						var _html = (plugin_settings.dataType == "json") ? data.html : data;
						_html = $(_html);
						var _div = $("<div></div>");
						_div.addClass("content-loaded");
						_div.append(_html);

						_html.css({opacity:0});

						$(".lightbox-load-content",$obj).append(_div);

						_html.css({width:plugin_settings.width});

						$('.lightbox-load-content',$obj).css(
							{
								width:(plugin_settings.width)+"px"
							}
						);

						var _height = (plugin_settings.height) ? plugin_settings.height : null;

						if(_height){
							_html.css({height:_height});

							$('.lightbox-load-content',$obj).css(
								{
									height:(_height)+"px"
								}
							);
						}


						addCloseButton (_div);

						//--------------
						plugin_settings.ajax_sucess.call(this, {data:data});

						_html.animate({opacity:1},200);
					},
					complete: function (data)
					{
						checkLoader('remove');
						plugin_settings.ajax_complete.call(this, {data:data});
					}
				});
			}
			else//type == html
			{
				//adiciona o html
				var _html = $data.contentHtml;
				_html = $(_html);
				var _div = $("<div></div>");
				_div.addClass("content-loaded");
				_div.append(_html);

				_html.css({opacity:0});

				$(".lightbox-load-content",$obj).append(_div);

				_html.css({width:plugin_settings.width});

				$('.lightbox-load-content',$obj).css(
					{
						width:(plugin_settings.width)+"px"
					}
				);

				var _height = (plugin_settings.height) ? plugin_settings.height : null;

				if(_height){
					_html.css({height:_height});

					$('.lightbox-load-content',$obj).css(
						{
							height:(_height)+"px"
						}
					);
				}

				plugin_settings.added.call();

				addCloseButton (_div);

				//--------------

				_html.animate({opacity:1},200);
			}

		}

		//-------------------------
		//adiciona elemento
		function addObject (_item)
		{
			var res = _item.charAt(0);//checa se o primeiro caracter é um /./ ou um # para adicionar um /id/ ou uma /classe/
			var _oj = _item.substring(1,(_item.length));
			var _add = (res == "#") ? 'id="'+_oj+'"' : 'class="'+_oj+'"';

			var _html;
			_html = '<div '+_add+'></div>';
			jQuery(document.body).append(_html);
		}

		//----------------
		//adiciona o botão de fechar
		function addCloseButton (_html) {
			//só cria o botão de fechar do lightbox caso tenha a propriedade \close_button\ na instanciação
			if(plugin_settings.close_button != "")
			{
				_html.append('<a href="#" class="lightbox-button-close" style="'+plugin_settings.close_button+'"></a>');
			}

			if($(".lightbox-button-close", _html).size()>0)
			{
				$(".lightbox-button-close", _html).click(function()
				{
					var count = ($('.lightbox-load-content',plugin_element).children().length)-1;
					if(count == 0)
					{
						removeLightbox ();
					}
					else
					{
						_html.fadeOut(200,function()
						{
							_html.remove();
							count = ($('.lightbox-load-content',plugin_element).children().length)-1;

							var _itemShow = $('.content-loaded',plugin_element).eq(count);

							$('.lightbox-load-content',plugin_element).css(
								{
									width:(_itemShow.width())+"px"/*,
								 height:(_itemShow.height())+"px"*/
								}
							);

							_itemShow.fadeIn(200);

						});
					}
					return false;
				});
			}
		}

		//-------------------------
		//gera o html a ser exibido
		function getHtml (){

			var _html = "";

			plugin_element.css(
				{
					position:"fixed",
					top:0,
					left:0,
					width:"100%",
					height:"100%",
					opacity:0,
					display:"none",
					overflow:"scroll",
					zIndex:plugin_settings.zIndex
				});

			_html += '<table style=" width:100%; height:100%; position:relative;" class="lightbox-modal">';

			if(plugin_settings.show_loader != "")
			{
				checkLoader("add");
			}
			_html += '<tr>';
			_html += '<td class="lightbox-content" style=" padding:30px; vertical-align: middle;">';
			_html += '<div class="lightbox-background" style="position:absolute; top:0; left:0; width:100%; height:100%;'+plugin_settings.background+';"></div>';
			_html += '<div style="position:relative; z-index:10;" class="lightbox-load-content">';
			_html += '</div>';
			_html += '</td>';
			_html += '</tr>';
			_html += '</table>';

			return _html;

		}

	};//-------------------------------
})(jQuery);
