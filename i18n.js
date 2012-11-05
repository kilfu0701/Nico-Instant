/* get locale message costumize */
var i18n = function(){
	var locale_path = '_locales';

	var pub = {
		getMessage: function(msg, lang) {
			
			
			var f;
var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
		console.log('2222');
          // Render thumbnail.
          //var span = document.createElement('span');
          //span.innerHTML = ['<img class="thumb" src="', e.target.result,
          //                  '" title="', theFile.name, '"/>'].join('');
          //document.getElementById('list').insertBefore(span, null);
        };
      })(f);
			reader.readAsDataURL(f);
			console.log('1111');
			return msg;
		}
	}
	
	return pub;
}();
//alert(i18n.getMessage);  // => 2
//i18n.init();