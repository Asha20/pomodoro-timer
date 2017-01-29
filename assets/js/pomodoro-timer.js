let pomodoroTimer = (function(global) {
    const colors = {
        blue0: "#009B95",
        blue3: "#007873",
        red3: "#C30005"
    };

    let settings = {
        muted: false,

        time: {
            work: 15,
            shortBreak: 5,
            longBreak: 10
        }
    };

    let currentTimer = settings.time.work;

    let elements = {
        workCounter: {
            init: function() {
                this.alarm = new Audio("./assets/sound/alarm.mp3")
                this.currentSession = document.querySelector(".current-session");
                this.finished = 0;
                this.container = document.querySelector(".session-container");
                this.template = document.querySelector("template.tomato");

                for (let i = 0; i < 4; i++) {
                    let item = document.importNode(this.template.content, true);
                    this.container.appendChild(item);
                }
                this.paths = this.container.querySelectorAll("path");
                this.paths.forEach(path => path.style.fill = colors.red3);
            },

            update: function() {
                const pathFill = [
                    "#f88e6b",
                    "#f42300",
                    "#d21a00",
                    "#445324"
                ];

                for (let i = 0; i < this.paths.length; i++) {
                    if ((i / 4) < this.finished) {
                        this.paths[i].style.fill = pathFill[i % 4];
                    }
                    else {
                        this.paths[i].style.fill = colors.red3;
                    }
                }
            },

            endSession: function() {
                if (currentTimer === settings.time.work) {
                    if (this.finished < 4) {
                        this.finished += 1;
                    }

                    if (this.finished === 4) {
                        currentTimer = settings.time.longBreak;
                        this.currentSession.innerHTML = "Long Break";
                    }
                    else {
                        currentTimer = settings.time.shortBreak;
                        this.currentSession.innerHTML = "Short Break";
                    }
                }
                else {
                    currentTimer = settings.time.work;
                    this.currentSession.innerHTML = "Work";
                }

                if (!settings.muted) {
                    this.alarm.play();
                }
                this.update();
            }
        },

        canvas: {
            init: function() {
                this.element = document.querySelector(".timer-circle");
                this.ctx = this.element.getContext("2d");
                this.size = this.element.scrollWidth;
                this.element.width = this.size;
                this.element.height = this.size;

                this.drawResetTimer(currentTimer);
            },

            drawTimer: function(time, maxTime) {
                const total = 2 * Math.PI;
                const part = total / maxTime;
                const center = this.size / 2;

                this.ctx.clearRect(0, 0, this.size, this.size);
                this.ctx.fillStyle = colors.blue0;
                this.ctx.beginPath();
                this.ctx.arc(center, center, center, 0, total);
                this.ctx.fill();

                const lineSize = this.size * 0.2;
                this.ctx.beginPath();
                this.ctx.strokeStyle = colors.blue3;
                this.ctx.lineWidth = lineSize;
                this.ctx.arc(center, center, center - lineSize / 2,
                             0, part * time);
                this.ctx.stroke();

                const timeLeft = maxTime - time;
                const pad = num => ("00" + num).slice(-2);
                const minutes = pad(Math.floor(timeLeft / 60));
                const seconds = pad(timeLeft % 60);
                this.ctx.font = `${lineSize}px Arial`;
                this.ctx.textAlign = "center";
                this.ctx.fillStyle = "white";
                this.ctx.fillText(`${minutes}:${seconds}`,
                                  center, center + lineSize / 3);
            },

            drawResetTimer: function(maxTime) {
                this.drawTimer(0, maxTime);
            }
        }
    };

    elements.canvas.init();
    elements.workCounter.init();

    let buttons = (function() {
        const btnStart = document.querySelector(".btn-start");
        const btnStop = document.querySelector(".btn-stop");
        const btnPause = document.querySelector(".btn-pause");
        const btnMute = document.querySelector(".btn-mute");

        let startTime, endTime, pauseTime;
        let timerID;

        function startTimer(endTime) {
            const secondsLeft = parseInt((endTime - Date.now()) / 1000);
            const secondsPassed = currentTimer - secondsLeft;

            if (Date.now() < endTime) {
                elements.canvas.drawTimer(secondsPassed, currentTimer);
            }
            else {
                elements.workCounter.endSession();
                stopTimer();
                startTime = undefined;
                pauseTime = undefined;
                elements.canvas.drawResetTimer(currentTimer);
            }
        }

        function stopTimer() {
            btnStart.disabled = false;
            btnStop.disabled = true;
            btnPause.disabled = true;

            clearInterval(timerID);
            timerID = -1;
        }

        btnStart.addEventListener("click", function(event) {
            let timeLeft;
            if (startTime === undefined) {
                startTime = Date.now();
                timeLeft = currentTimer * 1000;
            }
            endTime = startTime + (pauseTime || timeLeft);
            timerID = setInterval(startTimer.bind(null, endTime), 100);

            btnStart.disabled = true;
            btnStop.disabled = false;
            btnPause.disabled = false;
        });

        btnStop.addEventListener("click", function(event) {
            stopTimer();
            startTime = undefined;
            pauseTime = undefined;
            elements.canvas.drawResetTimer(currentTimer);
        });

        btnPause.addEventListener("click", function(event) {
            pauseTime = endTime - Date.now();
            startTime = undefined;
            stopTimer();
        });

        btnMute.addEventListener("click", function(event) {
            if (settings.muted) {
                settings.muted = false;
                btnMute.innerHTML = "Mute";
            }
            else {
                settings.muted = true;
                btnMute.innerHTML = "Unmute";
            }
        });

        return {
            start: btnStart,
            stop: btnStop,
            pause: btnPause
        };
    })();
})(window);