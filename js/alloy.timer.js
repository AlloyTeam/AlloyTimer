Jx().$package(function(J){
	var packageContext = this,
		$D = J.dom,
		$E = J.event;

	var isTiming=false,
		planTime,
		timer,
		sound,
		startTime,
		stopTime,
		isLoop=false,
		promptText="",
		text,
		tomatoData,
		currentTaskId,
		currentTask,
		i18n={};

	var taskNameEl = $D.id("taskName"),
		startWorkTime = $D.id("startWorkTime"),
		startRestTime = $D.id("startRestTime"),
		remainTimeEl = $D.id("remainTime"),

		startWorkButton = $D.id("startWorkButton"),
		startRestButton = $D.id("startRestButton"),
		stopButton = $D.id("stopButton"),
		settingButton = $D.id("settingButton"),
		settingBoard = $D.id("settingBoard"),
		
		taskListButton = $D.id("taskListButton"),
		taskListBoard = $D.id("taskListBoard"),
		
		introButton = $D.id("introButton"),
		introBoard = $D.id("introBoard"),
		
		progressBarBox = $D.id("progressBarBox"),
		progressBar = $D.id("progressBar"),

		isLoopCheckbox = $D.id("isLoopCheckbox"),
		taskListEl = $D.id("taskList"),
		currentTaskEl = $D.id("currentTask");
	
	text = i18n.text = {
		siteTitle : "Alloy Timer 之番茄工作法",
		pleaseStart: "请输入任务...",
		restTask: "休息，休息一下^_^",
		needNum: "请输入正确的分钟数",
		timeUp: "恭喜你，你又完成了一个番茄任务，继续加油哦^_^！",
		warnText: "你有正在进行的番茄工作定时，如果离开本页将撤销此定时",
		pleaseInputTask: "请输入任务!",
		confirmClearTaskList : "确认清空吗?",
		confirmOverwrite : "数据不同步，确认覆盖吗?"
	};

	var getTime = function(t){
		return t*60*1000;
	}
	var planStart = function(t){
		 planTime = t;

		if(isNaN(planTime) || planTime<=0){
			alert(text.needNum);
		}else{
			startTime = +new Date();
			stopTime = startTime + planTime;
		}
		return {
			planTime: planTime,
			startTime: startTime,
			stopTime: stopTime
		};
		  
	}
	var startTiming = function(t){
		if(!isTiming){
			console.log(t)
			var plan = planStart(t);

			isTiming=true;
			currentTaskId = plan.startTime;

			currentTask = {
				taskName:String(taskNameEl.value),
				planTime: planTime,
				planStartTime: plan.startTime,
				planStopTime: plan.stopTime,
				stopTime: null
			}
			addTask(currentTask);
			saveTaskList(tomatoData);
			showCurrentTask();
			
			$D.addClass(progressBarBox, "active");
			$D.addClass(remainTimeEl, "remainTimeActive");
			
			$D.addClass(startWorkButton, "disabled");
			$D.addClass(startRestButton, "disabled");
			$D.removeClass(stopButton, "disabled");
			updateProgress();
			timer = setInterval(updateProgress, 1000);
		}
	}


	var updateProgress = function(){

		var now = +new Date();
		var remainTime = Math.round((stopTime - now)/1000);
		var nH=J.format.number(Math.floor(remainTime/(60*60)) % 24, "00");  
		var nM=J.format.number(Math.floor(remainTime/(60)) % 60, "00");   
		var nS=J.format.number(Math.floor(remainTime) % 60, "00");  

		if(remainTime>=0){
			var progress = remainTime / (planTime/1000);
			var remainTimeText = (nH==="00" ? "" : (nH + ":")) + nM + ":" + nS;
			remainTimeEl.innerText = remainTimeText;
			remainTimeEl.title = "剩余时间："+remainTimeText;
			progressBar.style.width = progress*100+"%";
			
			document.title = remainTimeText + " 倒计时 - " + text.siteTitle;
			
			if(remainTime === 0){
				timeComing();
			}
		}

	}

	var timeComing = function(){
		stopTiming();
		timeCall();
		isLoop = isLoopCheckbox.checked; 
		if(isLoop){
			startTiming(planTime);
		}
	}
	var timeCall = function(){

		sound.play();
		if(promptText!=""){
			if(promptText.match(/^http/)){
				window.open(promptText);
			}
			alert(text.timeUp+"\n"+promptText);
		}else{
			alert(text.timeUp);
		}
		
		//sound.stop();


	}
	var stopTiming = function(){
		clearTimeout(timer);
		tomatoData.taskList[currentTaskId].stopTime = +new Date();
		saveTaskList(tomatoData);
		recoverCurrentTask();
		
		showTaskList(tomatoData);
		document.title = text.siteTitle;
		$D.removeClass(progressBarBox, "active");
		$D.removeClass(remainTimeEl, "remainTimeActive");
		$D.removeClass(startWorkButton, "disabled");
		$D.removeClass(startRestButton, "disabled");
		$D.addClass(stopButton, "disabled");
		
		isTiming=false;
	}


	var showCurrentTask = function(){

		var task = currentTask;

		var taskDetail = 
				"你需要在 "
				+ J.format.date(new Date(task.planStartTime), "hh:mm")+" - "
				+ J.format.date(new Date(task.planStopTime), "hh:mm")
				+ "完成如下事情，加油哦^_^";
		

		currentTaskEl.innerText = taskDetail;
	}
	var recoverCurrentTask = function(){
		currentTaskEl.innerText = "";
	}

	var showTaskList = function(taskData){
		console.dir(taskData.taskList);
		var taskClassName = "";
		var taskCount = 0;
		var li;
		
		taskListEl.innerHTML = "";
		
		for(var taskId in taskData.taskList){
			taskCount++;
			var task = taskData.taskList[taskId];
			console.dir(task)
			li = $D.node("li");
			$D.addClass(li, "alert");
			var taskDetail = 
				"任务：【"+task.taskName+"】时间 "
				+J.format.date(new Date(task.planStartTime), "hh:mm")+" - "
				+J.format.date(new Date(task.planStopTime), "hh:mm")+" ";
			
			
			if(!task.stopTime){
				taskDetail += ", 但你好像打酱油去了？";
				taskClassName = "alert-info";
			}else if(Math.round(task.stopTime/1000/60) === Math.round(task.planStopTime/1000/60)){
				taskDetail += "，恭喜你按时完成！";
				taskClassName = "alert-success";

			}else{
				taskDetail += "，但你【停止】于："+J.format.date(new Date(task.stopTime), "hh:mm");
				taskClassName = "alert-error";
			}

			li.innerText = taskDetail;
			$D.addClass(li, taskClassName);
			taskListEl.insertBefore(li, taskListEl.children[0]);
		}
		if(taskCount === 0){
			li = $D.node("li");
			li.innerText = "0 任务";
			taskListEl.insertBefore(li, taskListEl.children[0]);
		}

	}
	

	




	$E.on(startWorkButton,"click", function(e){
		if(!isTiming){
			if(taskNameEl.value !== text.pleaseStart && taskNameEl.value !== ""){
			
				var workTime = getTime($D.id("workTime").value);
				startTiming(workTime);
			}else{
				alert(text.pleaseInputTask);
			}
		}
	});

	$E.on(startRestButton,"click",function(e){
		if(!isTiming){
			taskNameEl.value = text.restTask;
			if(taskNameEl.value !== text.pleaseStart && taskNameEl.value !== ""){
				var restTime = getTime($D.id("restTime").value);
				startTiming(restTime);
			}else{
				alert(text.pleaseInputTask);
			}
		}
	});

	$E.on(stopButton, "click", function(e){
		stopTiming();
	});
	$E.on(settingButton, "click", function(e){
		toggleSettingBoard();
	});
	var toggleSettingBoard = function(){
		if($D.isShow(settingBoard)){
			$D.hide(settingBoard);
		}else{
			$D.show(settingBoard);
		}
	}
	
	$E.on(taskListButton, "click", function(e){
		toggleTaskListBoard();
	});
	var toggleTaskListBoard = function(){
		if($D.isShow(taskListBoard)){
			$D.hide(taskListBoard);
		}else{
			$D.show(taskListBoard);
		}
	}
	
	$E.on(introButton, "click", function(e){
		toggleIntroBoard();
	});
	var toggleIntroBoard = function(){
		if($D.isShow(introBoard)){
			$D.hide(introBoard);
		}else{
			$D.show(introBoard);
		}
	}
	
	
	$E.on(taskNameEl, "focus", function(e){
		if(taskNameEl.value === text.pleaseStart){
			taskNameEl.value = "";
		}
	});
	
	$E.on(taskNameEl, "blur", function(e){
		if(taskNameEl.value === ""){
			taskNameEl.value = text.pleaseStart;
		}
	});

	$E.on(workTime,"keydown", function(e){
		if(e.keyCode === 38){
			workTime.value++;
		}else if(e.keyCode === 40 && workTime.value>1){
			workTime.value--;
		}
	});
	
	$E.on(restTime,"keydown", function(e){
		if(e.keyCode === 38){
			restTime.value++;
		}else if(e.keyCode === 40 && restTime.value>1){
			restTime.value--;
		}
	});
	
	
	$E.on(clearTaskListButton, "click", function(e){
		if(confirm(text.confirmClearTaskList)){
			clearTaskList();
		}
	});

	var clearTaskList = function(){
		tomatoData = {
			lastTimeStamp:+new Date(),
			taskList:{}

		};

		localStorage.setItem("tomatoData", J.json.stringify(tomatoData));
		showTaskList(tomatoData)
	}




	$E.on(window,"beforeunload", function(e){
		if(isTiming){
			if (e) {
				e.returnValue = text.warnText ;
			}
			return text.warnText;
		}
	});



	var initLocalStorage = function(){
		tomatoData = J.json.parse(localStorage.getItem("tomatoData"));
		
		if(tomatoData){
			
			return tomatoData;
		}else{
			tomatoData = {
				lastTimeStamp:+new Date(),
				taskList:{}

			};

			localStorage.setItem("tomatoData", J.json.stringify(tomatoData));
		}
	};

	var saveTaskList = function(taskData){
		var newTomatoData = J.json.parse(localStorage.getItem("tomatoData"));
		if(newTomatoData.lastTimeStamp !== taskData.lastTimeStamp){
			if(!confirm(text.confirmOverwrite)){
				return;
			}
		}





		localStorage.setItem("tomatoData", J.json.stringify(tomatoData));

	};

	var addTask = function(task){
		tomatoData.taskList[task.planStartTime] = task;
	};
	
	//入口函数
	var start = function(){
		J.sound.init();
		sound = new J.sound();
		sound.load("./audio/ring.mp3",false);
		
		initLocalStorage();
		showTaskList(tomatoData);

	}
	
	start();
	

});



