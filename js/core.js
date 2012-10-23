var LocalLang=new Object();
LocalLang.NeedNum="请输入正确的数字。";
LocalLang.TimeRangeErr="设定的时间有误! 总定时时间应大于0且在10000分钟内。";
LocalLang.Need24h="设定的时间有误，请输入24小时制时间。";
LocalLang.CannotSetTime2Now="不能将时间设定为现在。";
LocalLang.TimeUp="设定的时间到！";
LocalLang.WarnText="你有正在进行的定时，离开本页将撤销此定时。";

function selectLang(lang,reload){
  if(lang.indexOf("zh")!=-1){
    if(reload==true){
         document.location.href="/";
    }
  }else{
    $j("#inputSection").css("background","url(assets/img/inputbox_en.png) no-repeat");
    $j("#switchUntil").css("background","url(assets/img/switchuntil_en.png) no-repeat 0 0")
    $j("#ok-button").css("background","url(assets/img/okbtn_en.png) no-repeat");
    $j("#cancelTimingBtn").css("background","url(assets/img/canceltiming_en.gif) no-repeat");
  $j("#switchNoLoop").css("background","url(assets/img/switchnoloop_en.png) no-repeat 0 0");
  $j("#additionSettings").css("background","url(assets/img/inputbox2_en.png) no-repeat");
    LocalLang.NeedNum="You should input numbers only.";
    LocalLang.TimeRangeErr="Invalid range. Time would be in 0 to 10000 minutes";
    LocalLang.Need24h="Oops! Invalid format. Please enter the time in 24-hour format.";
    LocalLang.CannotSetTime2Now="The time you set is right now...";
    LocalLang.TimeUp="Time's Up!";
    LocalLang.WarnText="You have a running timer. Are you sure to leave.";
    $j("#newTimerText").html("&nbsp;+ New Timer");
    $j("#chromeExtText").html("&nbsp;Chrome Exten...");
    $j("#language").html("切换至中文");
  $j("#promptSetTip").html("The text you input will appear when the countdown is over.<br/>(Beta Feature) You can also input URL(starts with 'http'). The URL will automatically open when the countdown is over. To use this feature, please make sure aerotimer.com is not on your popup-block list.");
  }
}
function toggleLang(){
  var d = new Date();  
  d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));  
  var lang = $j.cookies.get("lang");
  if(lang){
    if(lang.indexOf("zh")!=-1){
      $j.cookies.set("lang","en",{expiresAt:d});
      selectLang("en");
    }else{
      $j.cookies.set("lang","zh",{expiresAt:d});
      selectLang("zh",true);
    }
  }
}
$j(document).ready(function(){
  var lang = $j.cookies.get("lang");
  if(lang){
    selectLang(lang);
  }else{
    var d = new Date();  
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));  
    $j.cookies.set("lang",window.navigator.userLanguage||window.navigator.language,{expiresAt:d});
    selectLang(window.navigator.userLanguage||window.navigator.language);
  }
});

var totalSec;
var timer;
var siteTitle=document.title;
var progressWidth=601;
var isAfter=true;
var isLoop=false;
var endTime;
var isTiming=false;
var promptText="";

$j(document).ready(function(){
  var url=document.location.href;
  var m=url.match(/\?[0-9]{1,}$/);
  if(m!=null){
    $j("#min").val(String(m).replace("?",""));
    isAfter=false;
    toggleSwitchUntil();
    startTiming();
  }else{
    m=url.match(/\?([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/);
    if(m!=null){
      m=m[0];
      $j("#hour").val(String(m).match(/([0-1]?[0-9]|2[0-3]):/)[0].replace(":",""));
      $j("#min").val(String(m).match(/([0-5]?[0-9])$/)[0]);
      isAfter=true;
      toggleSwitchUntil();
      startTiming();
    }
  }
});
window.onbeforeunload = function(e){
  if(isTiming){
      var warnText=LocalLang.WarnText;
      var e = e || window.event;
      if (e) {
        e.returnValue = warnText ;
      }
      return  warnText;
  }
}

var canPlaySound=false;
var TimeUpSound;
soundManager.url="/assets/ring/soundmanager2.swf";
soundManager.useFlashBlock = false;
soundManager.onready(function() {
  if (soundManager.supported()) {
  canPlaySound=true;
  TimeUpSound = soundManager.createSound({
    id: 'aSound',
    url: '/assets/ring/ring.mp3',
    autoLoad:true,
    loops:3
  });
  } else {
  canPlaySound=false;
  }
});
function playSound(){
  if(canPlaySound){
  TimeUpSound.play();
  }
}
function stopSound(){
  if(canPlaySound){
  TimeUpSound.stop();
  }
}

function startTiming(){
  if(isTiming){return;}
  var hh=$j("#hour").val()*1;
  var mm=$j("#min").val()*1;
  var ss=$j("#sec").val()*1;
  if(isNaN(hh)||isNaN(mm)||isNaN(ss)){
    alert(LocalLang.NeedNum);
    return;
  }
  var now=new Date();
  endTime = new Date();
  if(isAfter){
    totalSec=hh*3600+mm*60+ss;
    if(totalSec<=0||totalSec>600000){
      alert(LocalLang.TimeRangeErr);
      return;
    }
  endTime.setHours(now.getHours()+hh);
  endTime.setMinutes(now.getMinutes()+mm);
  endTime.setSeconds(now.getSeconds()+ss);
  }else{
    if(!(hh<24&&hh>=0&&mm<60&&mm>=0&&ss<60&&ss>=0)){
      alert(LocalLang.Need24h);
      return;
    }
    endTime.setHours(hh);
    endTime.setMinutes(mm);
    endTime.setSeconds(ss);
    totalSec=Math.round((endTime-now)/1000);
    if(totalSec<0){
    endTime.setTime(endTime.getTime()+60*60*24*1000);
      totalSec=60*60*24+totalSec;
    }else if(totalSec==0){
      alert(LocalLang.CannotSetTime2Now);
      return;
    }
  }
  isTiming=true;
  timer=window.setInterval("refreshProgress();",200);
  $j("#progressBar").css('width',0);
  refreshProgress();
  toggleProgressSection();
}
function timeout(){
  window.clearTimeout(timer);
  isTiming=false;
  playSound();
  $j("#progressBar").animate({width:progressWidth},200,function(){
  if(promptText!=""){
    if(promptText.match(/^http/)){
      window.open(promptText);
    }
    alert(LocalLang.TimeUp+"\n"+promptText);
  }else{
    alert(LocalLang.TimeUp);
  }
    document.title=siteTitle;
    stopSound();
    toggleProgressSection();
  if(isLoop){
    startTiming();
  }
  });
}
function cancelTiming(){
  window.clearTimeout(timer);
  isTiming=false;
  document.title=siteTitle;
  toggleProgressSection();
}
function toggleProgressSection(){
  $j("#progressSection").toggle("slow");
  $j("#inputSection").toggle("slow");
}
function toggleSwitchUntil(){
  if(isAfter){
    isAfter=false;
    $j("#switchUntil").stop(true,true).animate({width:94},300);
  }else{
    isAfter=true;
    $j("#switchUntil").stop(true,true).animate({width:39},300);
  }
}
function toggleSwitchNoLoop(){
  if(isLoop){
    isLoop=false;
    $j("#switchNoLoop").stop(true,true).animate({width:94},300);
  }else{
    isLoop=true;
    $j("#switchNoLoop").stop(true,true).animate({width:39},300);
  }
}
function popPromptTextSetter(){
  $j("#mask").fadeTo("normal","0.8");
  $j("#promptTextSetter").show("fast");
}
function hidePromptTextSetter(){
  $j(".popupContent").hide();
  $j("#mask").fadeTo("normal","0",function(){$j("#mask").hide();});
}
function setPrompt(){
  promptText=$j("#promptText").val()+"";
  hidePromptTextSetter();
}
function refreshProgress(){
  var now=new Date();
  var sec=Math.round((endTime-now)/1000);
  var progressText=Math.floor(sec/3600)+":"+Math.floor((sec%3600)/60)+":"+Math.floor(sec%60);
  document.title=progressText+" - "+siteTitle;
  $j("#progressText").text(progressText);
  $j("#progressBar").animate({width:(1-(sec/totalSec))*progressWidth},{queue:false,duration:200});
  if(sec<=0){
    timeout();
  }
}

var focusedInput;
var scrollTime=0;
var scrollFunc=function(e){
  if(focusedInput==null){return;}
  if(++scrollTime!=2){
    return;
  }
  scrollTime=0;
  var direct=0;
  e=e || window.event; 
  if(e.wheelDelta){ 
    direct=e.wheelDelta>0?1:-1; 
  }else if(e.detail){ 
    direct=e.detail<0?1:-1; 
  } 
  ScrollText(direct); 
  return false;
}
function ScrollText(arg){ 
  var _value=focusedInput.value*1;
  if(isNaN(_value)){
    focusedInput.value=0;
    _value=0;
  }
  if(arg>0){ 
    _value++; 
  }else{ 
    _value--; 
  } 
  if(_value<0){_value=59;}
  if(_value>59){_value=0;}
  focusedInput.value=_value;
  focusedInput.select();
}
(function($) {
  $.fn.defaultvalue = function() {
  var elements = this;
  var args = arguments;
  var c = 0;
  return(
    elements.each(function() {
    var el = $(this);
    var def = args[c++];
    el.val(def).focus(function() {
      if(el.val() == def) { el.val(''); }
      el.blur(function() {
      if(el.val() == '') { el.val(def); }
      focusedInput=null;
     });
     focusedInput=el[0];
    });
    })
  );
  }
})(jQuery);
jQuery(document).ready(function(){
  jQuery('#hour,#min,#sec').defaultvalue('0','0','0');
  if(document.addEventListener){  document.addEventListener('DOMMouseScroll',scrollFunc,false); }
  window.onmousewheel=document.onmousewheel=scrollFunc;
});