function CountdownTimer(seconds, tickRate) {
    this.seconds = seconds || (25*60);
    this.tickRate = tickRate || 500; // Milliseconds
    this.tickFunctions = [];
    this.isRunning = false;
    this.remaining = this.seconds;

    this.start = function() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        
        var startTime = Date.now(), 
            thisTimer = this;
         
        (function tick() {
            secondsSinceStart = ((Date.now() - startTime) / 1000) | 0;
            var secondsRemaining = thisTimer.remaining - secondsSinceStart;
            
            if (thisTimer.isRunning === false) {
                thisTimer.remaining = secondsRemaining;
            } else {
                if (secondsRemaining > 0) {
                    setTimeout(tick, thisTimer.tickRate);
                } else {
                    thisTimer.remaining = 0;
                    thisTimer.isRunning = false;

                    playAlarm();
                    changeFavicon('green');
                }
                
                var timeRemaining = parseSeconds(secondsRemaining);
                
                thisTimer.tickFunctions.forEach(
                    function(tickFunction) {
                        tickFunction.call(this, 
                                          timeRemaining.minutes, 
                                          timeRemaining.seconds);
                    }, 
                    thisTimer);
            }
        }());        
    };

    this.pause = function() {
        this.isRunning = false;
    };

    this.reset = function(seconds) {
        this.isRunning = false;
        this.seconds = seconds
        this.remaining = seconds
    };

    this.onTick = function(tickFunction) {
        if (typeof tickFunction === 'function') {
            this.tickFunctions.push(tickFunction);
        }
    };
}

function parseSeconds(seconds) {
    return {
        'minutes': (seconds / 60) | 0,
        'seconds': (seconds % 60) | 0
    }
}

function playAlarm() {
    var alarmValue = document.getElementById('alarm_select').value;
    if (alarmValue != 'none') {
        var alarmAudio = document.getElementById(alarmValue);
        var alarmVolume = document.getElementById('alarm_volume').value;
        alarmAudio.volume = alarmVolume / 100;
        alarmAudio.play();
    }
}

function changeFavicon(color) {
    document.head = document.head || document.getElementsByTagName('head')[0];
    var color = color || 'green';

    var newFavicon = document.createElement('link'),
        oldFavicon = document.getElementById('dynamic-favicon');
    newFavicon.id = 'dynamic-favicon'
    newFavicon.type = 'image/ico';
    newFavicon.rel = 'icon';
    newFavicon.href = 'images/' + color + '_tomato.ico';

    if (oldFavicon) {
        document.head.removeChild(oldFavicon);
    }
    document.head.appendChild(newFavicon);
}

window.onload = function () {
    var timerDisplay = document.getElementById('timer'),
        customTimeInput = document.getElementById('ipt_custom'),
        timer = new CountdownTimer(),
        timeObj = parseSeconds(25*60);
    
    function setTimeOnAllDisplays(minutes, seconds) {
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            clockHours = hours + ':';
            document.title = '(' + hours + 'h' + minutes + 'm) Pomodoro';
        } else {
            clockHours = '';
            document.title = '(' + minutes + 'm) Pomodoro';
        }
        
        clockMinutes = minutes < 10 ? '0' + minutes : minutes;
        clockMinutes += ':';
        clockSeconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = clockHours + clockMinutes + clockSeconds;
    }
    
    function resetMainTimer(seconds) {
        changeFavicon('red');
        timer.pause();
        timer = new CountdownTimer(seconds); 
        timer.onTick(setTimeOnAllDisplays);
    }
    
    setTimeOnAllDisplays(timeObj.minutes, timeObj.seconds);

    timer.onTick(setTimeOnAllDisplays);
    
    document.getElementById('btn_start').addEventListener(
        'click', function () { 
            timer.start(); 
        });
        
    document.getElementById('btn_pause').addEventListener(
        'click', function () {
            timer.pause(); 
        });
        
    document.getElementById('btn_reset').addEventListener(
        'click', function () {
            resetMainTimer(timer.seconds);
            timer.start();
        });
        
    document.getElementById('btn_pomodoro').addEventListener(
        'click', function () {
            document.body.style.backgroundColor = 'hsla(0, 77%, 38%, 0.781)';
            resetMainTimer(25*60);
            timer.start();
        });
        
    document.getElementById('btn_shortbreak').addEventListener(
        'click', function () {
            document.body.style.backgroundColor = 'hsl(182, 40%, 40%)';
            resetMainTimer(5*60);
            timer.start();
        });
        
    document.getElementById('btn_longbreak').addEventListener(
        'click', function () {
            document.body.style.backgroundColor = 'hsl(204, 44%, 41%)';
            resetMainTimer(15*60);
            timer.start();
        });
        
    document.getElementById('btn_custom').addEventListener(
        'click', function () {
            customUnits = document.getElementById('custom_units').value
            if (customUnits === 'minutes') {
                resetMainTimer(customTimeInput.value*60);
            } else if (customUnits === 'hours') {
                resetMainTimer(customTimeInput.value*3600);
            } else {
                resetMainTimer(customTimeInput.value);
            }
            timer.start();
        });
        
    Mousetrap.bind('space', function(e) { 
        if (e.preventDefault()) {
            e.preventDefault();
        } else {
            e.returnValue = false; //IE
        }

        // Pause or start the timer
        if(timer.isRunning) {
            timer.pause();
        } else {
            timer.start();
        }
    });
};