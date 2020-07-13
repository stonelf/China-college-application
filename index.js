var provinceList = ["内蒙古","辽宁","吉林","黑龙江","上海","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广西","海南","重庆","四川","贵州","云南","陕西","甘肃","青海","宁夏","新疆","北京","天津","河北","山西","广东","西藏"];
var divisionList = ["文科","理科","综合"];
var batchList = ["本科一批","本科批","本科一批A段","平行录取一段","本科二批","本科一批B段","零志愿批次","平行录取二段","专科批","本科二批A段","本科二批B段","平行录取三段","本科三批","本科二批C段","本科三批A段","本科批A段","国家专项计划本科批","地方专项计划本科批","本科提前批","普通类提前批","专科提前批","本科综合评价批","高校专项计划本科批","本科批B段"];
var data=[],searchBy,userID,coffeeClicked=false;
var pingpath;
function $(id){return document.getElementById(id)}
function getCookie(name){
	var r=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(r.test(document.cookie))
		return document.cookie.match(r)[2]
	 else 
		return null;
}
function setCookie(name,value){
	var exp = new Date(); 
	exp.setTime(exp.getTime() + 864000000);
	document.cookie = name+"="+value+";expires=" + exp.toGMTString()
	if(name == "searchBy"){
		searchBy = value;
		$("scoreLabel").innerHTML = value=="s"?"分数":"位次";
		$("scoreBox").value=getCookie(searchBy=="p"?"position":"score");
		$("scoreBox").maxLength= searchBy=="p"?"6":"3"
	}
	if(searchBy=="s" && parseInt($("scoreBox").value)>750) $("scoreBox").value=750
}
function init(){
	var e = $("provinceSelector");
	for(var i=0;i<provinceList.length;i++){
		e.appendChild(new Option(provinceList[i],i))
	}
	e.selectedIndex=getCookie("province")||0;
	e=$("percentSelector")
	e.selectedIndex=getCookie("percent")||9;
	document.forms[0].division.value = getCookie("division")||0
	searchBy = document.forms[0].search_by.value = getCookie("searchBy");
	$("scoreBox").value=getCookie(searchBy=="p"?"position":"score")|(searchBy=="p"?"10000":"500");
	$("scoreBox").maxLength=searchBy=="p"?6:3;
	userID = getCookie("userID")||Math.round(Math.random()*(2**48)).toString(16);
	setCookie("userID",userID);
	pingpath = "https://service-806yjs9u-1251042283.gz.apigw.tencentcs.com/release/log/"+userID;
	$("ping").src=pingpath;
}
function query(){
	$("majorList").innerHTML="";
	$("keywordSpan").style.display="none"
	searchBy = document.forms[0].search_by.value;
	$("spanSearchBy").innerHTML = searchBy=="s"?"分数":"位次";
	var baseURL = "http://stone.sou.ac.cn/release/CEE";//这个域名直接从cdn透传
//	var baseURL = "http://cdn.sou.ac.cn/release/CEE";//这个域名经过COS再透传到CDN，COS有长期cache的作用，也有首次访问的时候二次回源的缺陷。
	var url = baseURL+"/"+$("provinceSelector").value+"/"+document.forms[0].division.value+"/"+$("percentSelector").value+"/"+$("scoreBox").value+"/"+document.forms[0].search_by.value+"/"+(coffeeClicked?"list.js":"data.js");
	fetch(url).then(function(response) {
		return response.json();
	}).then(function(d) {
		data = d;
		show()
	});
	$("ping").src=url.replace(baseURL,pingpath);
}
function show(){
	var e = $("majorList"),tr,p=$("percentSelector").value;
	with(e.parentNode.tHead.rows[0]){
		cells[5].style.display = p==50?"none":"";
		cells[5].innerHTML= p==50?"":"预测<span id=spanSearchBy>"+(searchBy=="s"?"分数":"位次")+"</span><wbr>("+p+"%概率过线)"
	}
	$("keywordSpan").style.display="inline"
	for(var i=0;i<data.length;i++){
		tr = e.insertRow();
		tr.insertCell().innerHTML = data[i].college+"<wbr>"+data[i].branch;
		tr.insertCell().innerHTML = data[i].major+"<wbr>"+data[i].subMajor;
		tr.insertCell().innerHTML = data[i].batch;
		tr.insertCell().innerHTML = data[i].division;
		tr.insertCell().innerHTML = data[i][searchBy+50];
		if(p!=50) tr.insertCell().innerHTML = data[i][searchBy+p];
		
	}
}
function filter(){
	var kw = $("keywordBox").value.replace(/\s/,"");
	if(kw.length<1) return;
	var r = new RegExp("("+kw+")");
	var e = $("majorList"),tr,p=$("percentSelector").value;
	$("majorList").innerHTML="";
	for(var i=0;i<data.length;i++){
		if(r.test(JSON.stringify(data[i]))){
		tr = e.insertRow();
		tr.insertCell().innerHTML = (data[i].college+"<wbr>"+data[i].branch).replace(r,"<font color=red>$1</font>");
		tr.insertCell().innerHTML = (data[i].major+"<wbr>"+data[i].subMajor).replace(r,"<font color=red>$1</font>");
		tr.insertCell().innerHTML = data[i].batch;
		tr.insertCell().innerHTML = data[i].division;
		tr.insertCell().innerHTML = data[i][searchBy+50];
		if(p!=50) tr.insertCell().innerHTML = data[i][searchBy+p];
		}		
	}
}
