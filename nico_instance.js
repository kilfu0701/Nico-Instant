/* variables */
var current_text = '';
var current_sort = 'n';
var current_order = 'd';
var current_ways = 'search';

var domain = "http://www.nicovideo.jp/";
var ways = 'search'; // default is 'search'
var sort = 'n';  // default is 'n'
var order = 'd'; // default is 'd;

var bg = chrome.extension.getBackgroundPage();
var options = bg.getOptionSetting();

/* Iinitailize... */
try{
	$(document).ready(function() {
		/* 左上角的顯示+隱藏 */
		$('#jsddm > li').bind('mouseover', jsddm_open);
		$('#jsddm > li').bind('mouseout',  jsddm_timer);
		
		/* 隱藏Loading */
		$("#loading").hide();
		
		/* 設定語系文字 */
		setLocaleWording();
		
		/* 設定搜尋的顯示 */
		changeSearchDisplay();
	});
}catch(e){
	console.error("Iinitailize: "+e);
}	


function setLocaleWording() {
	try{
		if( options["lang"]=='default' ) {
			$("#open2tab").html(chrome.i18n.getMessage("open2tab"));
			$("#result_text").html(chrome.i18n.getMessage("result_text"));
			$("#loading").append('<span style="color:red;">'+chrome.i18n.getMessage("loading")+'</span>');
			$("#jsddm_span").html(chrome.i18n.getMessage("popular_tag"));
			$("#kw").html(chrome.i18n.getMessage("kw"));
			$("#tag").html(chrome.i18n.getMessage("tag"));
			$("#new_comment").html(chrome.i18n.getMessage("new_comment"));
			$("#old_comment").html(chrome.i18n.getMessage("old_comment"));
			$("#most_play").html(chrome.i18n.getMessage("most_play"));
			$("#lest_play").html(chrome.i18n.getMessage("lest_play"));
			$("#most_comment").html(chrome.i18n.getMessage("most_comment"));
			$("#lest_comment").html(chrome.i18n.getMessage("lest_comment"));
			$("#new_update").html(chrome.i18n.getMessage("new_update"));
			$("#old_update").html(chrome.i18n.getMessage("old_update"));
			$("#most_mylist").html(chrome.i18n.getMessage("most_mylist"));
			$("#lest_mylist").html(chrome.i18n.getMessage("lest_mylist"));
			$("#long_vtime").html(chrome.i18n.getMessage("long_vtime"));
			$("#short_vtime").html(chrome.i18n.getMessage("short_vtime"));
		}else{
			//console.log( i18n.getMessage("a", options["lang"]) ); 
		}
	}catch(e){alert(e);
		console.error("setLocaleWording: "+e);
	}
}
/**
'http://www.nicovideo.jp/search/'+kw+'?sort=n&order=d';         keyword
'http://www.nicovideo.jp/tag/'+kw+'?sort=n&order=d';            tag
'http://www.nicovideo.jp/mylist_search/'+kw+'?sort=n&order=d';  mylist

older : 
  d - newest
  a - oldest
sort :
  n - comment
  v - play count
  r - comment count
  m - mylist count
  f - upload time
  l - video length
  
*/


/* change search ways */
function changeSearch(i) {
	try{
		switch(i) {
			case 'kw':
				$('#kw').attr('selectd', 'on');
				$('#tag').attr('selectd', 'off');
				//$('#mylist').attr('selectd', 'off');
				ways = 'search';
			break;
			case 'tag':
				$('#kw').attr('selectd', 'off');
				$('#tag').attr('selectd', 'on');
				//$('#mylist').attr('selectd', 'off');
				ways = 'tag';
			break;
			case 'mylist':
				$('#kw').attr('selectd', 'off');
				$('#tag').attr('selectd', 'off');
				//$('#mylist').attr('selectd', 'on');
				ways = 'mylist_search';
			break;
			default:
				$('#kw').attr('selectd', 'on');
				$('#tag').attr('selectd', 'off');
				//$('#mylist').attr('selectd', 'off');
				ways = 'search';
		}
		changeSearchDisplay();
	}catch(e){
		console.error(e);
	}
}


var list = new Array('kw', 'tag');
/* 改變search顏色 */
function changeSearchDisplay() {
	try{
		$('#kw').css({backgroundColor:'#333', color:'white'});
		for(var idx in list) {
			if( $('#'+list[idx]+'').attr('selectd') == 'on' ){
				$('#'+list[idx]+'').css({backgroundColor:'#333', color:'white'});
			}else{
				$('#'+list[idx]+'').css({backgroundColor:'#D0D0FF', color:'black'});
			}
		}
	}catch(e){
		console.error(e);
	}
}

/* 取得對話框的文字 */
function getInputText(str) {
	try{
		/* 取得選取的option data */
		var t_value = $("#opt_list option:selected").attr('value');
		var t_sort = $("#opt_list option:selected").attr('sort');
		var t_order = $("#opt_list option:selected").attr('order');
		
		if( str == '' || str == current_text 
		              && t_sort == current_sort
					  && t_order == current_order 
					  && ways == current_ways ){
			/* do nothing */
		}else{
			$("#loading").show();
			
			current_text = str;
			current_sort = t_sort;
			current_order = t_order;
			current_ways = ways;
			nico_search(str);
		}
		
		/* 及時更新頻率 */
		var reqeustInterval = 1500; // time per sec
		var keyword = $('#search').val();
		window.setTimeout("getInputText('"+keyword+"');", reqeustInterval);
	}catch(e){
		console.error(e);
	}
}

/* do nico search */
function nico_search(kw) {
	var url = 'http://www.nicovideo.jp/'+current_ways+'/'+kw+'?sort='+current_sort+'&order='+current_order;
	console.log(url);
	var xhrb = new XMLHttpRequest();
	var raw_src;
	var ttt;
	var ttt_img;
	var ttt_video_length;
	var ttt_view;
	var ttt_comment;
	
	xhrb.onreadystatechange = function() {
		if(xhrb.readyState == 4 && xhrb.status == 200){
			try{
				raw_src = xhrb.responseText;
				/* clear old result */
				$("#result_table > tbody tr").remove();
				
				/* find img obj */
				ttt_img = raw_src.match(/<a (.+)<img src=\"(.+)\" alt=\"\" class=\"img_std96\"\><\/a\>/g);
				/* find video url */
				ttt = raw_src.match(/<a href\=\"watch\/([a-zA-Z]{2}\d+)\" class\=\"watch\" title\=\".+\"\>.+\<\/a\>/g);
				/* find video length */
				ttt_video_length = raw_src.match(/<p class\=\"vinfo_length\"><span>(.+)<\/span><\/p>/g);
				/* find view times */
				ttt_view = raw_src.match(/<strong class\=\"vinfo_view\">(.+)<\/strong>/g);
				/* find total comments */
				ttt_comment = raw_src.match(/<strong class\=\"vinfo_res\">(.+)<\/strong>/g);
				
				var rep;
				var rep_img;
				var rep_video_length;
				var rep_view;
				var rep_comment;
				for(var idx in ttt){
					rep = ttt[idx].replace("watch", "http://www.nicovideo.jp/watch");
					rep_img = ttt_img[idx].replace("watch", "http://www.nicovideo.jp/watch");
					rep_video_length = ttt_video_length[idx].match(/<span>(.+)<\/span>/i)[1];
					rep_view = ttt_view[idx].match(/<strong class\=\"vinfo_view\">(.+)<\/strong>/i)[1];
					rep_comment = ttt_comment[idx].match(/<strong class\=\"vinfo_res\">(.+)<\/strong>/i)[1];
					/* display search result */
					$("#result_table > tbody:last").append("<tr><td><p>"+rep_img+"</p><p id=\"video_length\">"+rep_video_length+"</p></td><td>"
															+rep+"<br />"+chrome.i18n.getMessage("play_count")+": "+rep_view
															+"<br />"+chrome.i18n.getMessage("comment_count")+": "+rep_comment+"</td></tr>");
				}
				
				/* add openURL function into <a> */
				$("#result_table a").each(function(){
					var origin_href = $(this).attr('href');
					//$(this).attr("onClick", "javascript:openURL('"+origin_href+"')"); // here got some bugs
					$(this).attr("target", "_blank");
				});
				$("#loading").hide();
			}catch(e){
				console.error(e);
			}
		}
	}
	xhrb.open("GET", url, true);
	xhrb.send();
}

/* open url in new tabs */
function openURL(url) {
	if( url == 'popup' ){
		url = chrome.extension.getURL('popup.html');
	}

	chrome.tabs.create({'url': url}, function(tab) {
		// Tab opened.
	});
}

function fillIn(word) {
	$("#search").val(word);
}

/* get tag search ranking */
function getTagRanking() {
	try{
		var tr_url = 'http://www.nicovideo.jp/major_tag';
		var xhr_tr = new XMLHttpRequest();
		xhr_tr.onreadystatechange = function() {
			if(xhr_tr.readyState == 4 && xhr_tr.status == 200){
				var tr_src = xhr_tr.responseText;
				var zzz = tr_src.match(/<a rel=\"tag\" class=\"level\_[1-4]{1}\"(.+)\<\/a\>/g);
				//console.log( zzz );
				
				/* shuffle array */
				zzz.sort(function(){return Math.round(Math.random());});
				
				for(var c=1; c<=15; c++){
					var tp = zzz.pop();
					var tag_title = tp.match(/\>(.+)\<\/a\>/i)[1];
					tp = tp.replace('href\=\"tag', 'onclick=\"fillIn\(\''+tag_title+'\'\)\" href\=\"http://www.nicovideo.jp/tag');
					//console.log(tp);
					$("#jsddm li ul:last").prepend("<li>"+tp+"</li>");
				}
				$("#jsddmli ul li a").attr("href", "#");
				$("#jsddm li ul:last").append('<li id="more"><a href="http://www.nicovideo.jp/major_tag" target="_blank">查看更多...</a></li>');
				
			}
		}
		xhr_tr.open("GET", tr_url, true);
		xhr_tr.send();
	}catch(e){
		console.error("getTagRanking: "+e);
	}
}

//讀取cookie
function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}

function refreshTag() {
	$("#jsddm_span").click(
		function() {
			$("#jsddmli ul li").remove(); // cleanup
			getTagRanking();
		}
	);
}

/* starting */
function gettingStart() {
	try{
		// 取得目前網頁Tab的資訊
		chrome.tabs.getSelected(null, function(tab) {
			//myFunction(tab.url); //tab url
		});
		refreshTag(); 
		getTagRanking();
		getInputText('');
	}catch(e){
		console.error(e);
	}
}

/* js ddm */
var timeout         = 100;
var closetimer		= 0;
var ddmenuitem      = 0;

function jsddm_open() {
	jsddm_canceltimer();
	jsddm_close();
	ddmenuitem = $(this).find('ul').eq(0).css('visibility', 'visible');
}

function jsddm_close() {
	if(ddmenuitem) ddmenuitem.css('visibility', 'hidden');
}

function jsddm_timer() {
	closetimer = window.setTimeout(jsddm_close, timeout);
}

function jsddm_canceltimer() {
	if(closetimer)
	{	window.clearTimeout(closetimer);
		closetimer = null;
	}
}

//document.onclick = jsddm_close;