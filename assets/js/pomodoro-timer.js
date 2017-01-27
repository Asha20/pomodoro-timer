let pomodoroTimer = (function(global) {
    let colors = {
        blue0: "#009B95",
        blue3: "#007873",
        red3: "#C30005"
    };

    let settings = {
        workTime: 1500
    };

    let elements = {
        workCounter: {
            init: function() {
                this.finished = 0;
                this.items = document.querySelectorAll(".session-item");
            },

            update: function() {
                for (let i = 0; i < this.items.length; i++) {
                    this.items[i].style.fill =
                        (i < this.finished) ? colors.blue3 : colors.blue0;
                }
            },

            endSession: function() {
                if (this.finished < 4) {
                    this.finished += 1;
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
            },

            drawTimer: function(time, maxTime) {
                let total = 2 * Math.PI;
                let part = total / maxTime;
                let center = this.size / 2;

                this.ctx.clearRect(0, 0, this.size, this.size);
                this.ctx.fillStyle = colors.blue0;
                this.ctx.beginPath();
                this.ctx.arc(center, center, center, 0, total);
                this.ctx.fill();

                let lineSize = this.size * 0.2;
                this.ctx.beginPath();
                this.ctx.strokeStyle = colors.blue3;
                this.ctx.lineWidth = lineSize;
                this.ctx.arc(center, center, center - lineSize / 2,
                             0, part * time);
                this.ctx.stroke();

                let timeLeft = maxTime - time;
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;
                this.ctx.font = `${lineSize}px Arial`;
                this.ctx.textAlign = "center";
                this.ctx.fillStyle = "white";
                this.ctx.fillText(`${minutes}:${seconds}`,
                                  center, center + lineSize / 3);
            }
        }
    };

    elements.canvas.init();
    elements.workCounter.init();

    let buttons = (function() {
        let btnStart = document.querySelector(".btn-start");
        let btnStop = document.querySelector(".btn-stop");
        let btnPause = document.querySelector(".btn-pause");

        let startTime;
        let endTime;
        let pauseTime;
        let timerID;

        function startTimer(endTime) {
            let secondsLeft = parseInt((endTime - Date.now()) / 1000);
            let secondsPassed = settings.workTime - secondsLeft;

            if (Date.now() < endTime) {
                elements.canvas.drawTimer(secondsPassed, settings.workTime);
            }
            else {
                elements.workCounter.endSession();
                stopTimer();
                startTime = undefined;
                pauseTime = undefined;
                elements.canvas.drawTimer(0, settings.workTime);
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
                timeLeft = settings.workTime * 1000;
            }
            endTime = startTime + (pauseTime || timeLeft);
            timerID = setInterval(startTimer.bind(null, endTime), 1000);

            btnStart.disabled = true;
            btnStop.disabled = false;
            btnPause.disabled = false;
        });

        btnStop.addEventListener("click", function(event) {
            stopTimer();
            startTime = undefined;
            pauseTime = undefined;
            elements.canvas.drawTimer(0, settings.workTime);
        });

        btnPause.addEventListener("click", function(event) {
            pauseTime = endTime - Date.now();
            startTime = undefined;
            stopTimer();
        });

        return {
            start: btnStart,
            stop: btnStop,
            pause: btnPause
        };
    })();
})(window);