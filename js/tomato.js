Jx().$package(function(J){
	var packageContext = this,
		$D = J.dom,
		$E = J.event;

	var isTiming=false,
		planTime,
		timer,
		startTime,
		stopTime,
		isLoop=false,
		promptText="",
		text,
		tomatoData,
		currentTaskId,
		currentTask,
		i18n={};
	
	text = i18n.text = {
		pleaseStart:"赶紧开始当前任务吧！",
		needNum:"请输入正确的分钟数",
		timeUp:"恭喜你，你又完成了一个番茄任务，继续加油哦^_^！",
		warnText:"你有正在进行的番茄工作定时，如果离开本页将撤销此定时",
		confirmOverwrite :"数据不同步，确认覆盖吗?"
	};


	var taskNameEl = $D.id("taskName");

	var startWorkTime = $D.id("startWorkTime");
	var startRestTime = $D.id("startRestTime");
	var remainTimeEl = $D.id("remainTime");

	var startWorkButton = $D.id("startWorkButton");
	var startRestButton = $D.id("startRestButton");
	var stopButton = $D.id("stopButton");

	var progressBar = $D.id("progressBar");

	var isLoopCheckbox = $D.id("isLoopCheckbox");
	var taskListEl = $D.id("taskList");
	var currentTaskEl = $D.id("currentTask");

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

			updateProgress();
			timer=setInterval(updateProgress, 1000);
		}
	}


	var updateProgress = function(){

		var now = +new Date();
		var remainTime = Math.round((stopTime - now)/1000);
		var nH=Math.floor(remainTime/(60*60)) % 24;  
		var nM=Math.floor(remainTime/(60)) % 60;  
		var nS=Math.floor(remainTime) % 60;

		if(remainTime>=0){
			var progress = remainTime / (planTime/1000);
			console.log("progress:"+progress);
			remainTimeEl.innerText = nH+":"+nM+":"+nS;
			progressBar.style.width = (500*progress)+"px";
			console.log(progressBar.style.width);
			if(remainTime===0){
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

		//J.sound.play();
		if(promptText!=""){
			if(promptText.match(/^http/)){
				window.open(promptText);
			}
			alert(text.timeUp+"\n"+promptText);
		}else{
			alert(text.timeUp);
		}
		//document.title=siteTitle;
		//J.sound.stop();


	}
	var stopTiming = function(){
		
		tomatoData.taskList[currentTaskId].stopTime = +new Date();
		saveTaskList(tomatoData);
		recoverCurrentTask();
		showTaskList(tomatoData);
		//document.title=siteTitle;
		//toggleProgressSection();
		clearTimeout(timer);
		isTiming=false;
	}


	var showCurrentTask = function(){

		var task = currentTask;

		var taskDetail = 
				"任务：【"+task.taskName+"】时间("
				+J.format.date(new Date(task.planStartTime), "hh:mm")+" - "
				+J.format.date(new Date(task.planStopTime), "hh:mm")+")";
		

		currentTaskEl.innerText = taskDetail+"正在进行中, 你要加油哦！！！";
	}
	var recoverCurrentTask = function(){
		currentTaskEl.innerText = text.pleaseStart;
	}

	var showTaskList = function(taskData){
		console.dir(taskData.taskList)
		var taskCount = 0;
		for(var taskId in taskData.taskList){
			taskCount++;
			var task = taskData.taskList[taskId];
			console.dir(task)
			var li = $D.node("li");
			var taskDetail = 
				"任务：【"+task.taskName+"】时间("
				+J.format.date(new Date(task.planStartTime), "hh:mm")+" - "
				+J.format.date(new Date(task.planStopTime), "hh:mm")+")";
			
			var taskClassName = "";
			if(!task.stopTime){
				taskDetail += ", 但：你打酱油去了？";
				taskClassName = "taskLeave";
			}else if(Math.round(task.stopTime/1000/60) === Math.round(task.planStopTime/1000/60)){
				taskDetail += "，恭喜你按时完成！";
				taskClassName = "taskDone";

			}else{
				taskDetail += "，但：你【停止】于："+J.format.date(new Date(task.stopTime), "hh:mm");
				taskClassName = "taskStop";
			}

			li.innerText = taskDetail;
			$D.addClass(li,taskClassName);
			taskListEl.insertBefore(li, taskListEl.children[0]);
		}
		if(taskCount === 0){
			var li = $D.node("li");
			li.innerText = "0 任务";
			taskListEl.insertBefore(li, taskListEl.children[0]);
		}

	}
	

	




	$E.on(startWorkButton,"click", function(e){
		var workTime = getTime($D.id("workTime").value);
		startTiming(workTime);
	});

	$E.on(startRestButton,"click",function(e){
		var restTime = getTime($D.id("restTime").value);
		console.log("restTime:"+restTime)
		startTiming(restTime);
	});

	$E.on(stopButton, "click", function(e){
		stopTiming();
	});










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
		console.dir(tomatoData);
		if(tomatoData){
			//var tomatoJson = J.json.parse(tomatoData);
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

	//J.sound.init();
	//J.sound.load("./audio/ring.mp3");
	initLocalStorage();

	showTaskList(tomatoData)

	planStart(getTime($D.id("workTime").value));
	updateProgress();

});



