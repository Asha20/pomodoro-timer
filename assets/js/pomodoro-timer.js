let pomodoroTimer = (function(global) {
    let settings = {
        workTime: 5
    };

    let elements = {
        workCounter: {
            init: function() {
                this.finished = 0;
                this.items = document.querySelectorAll(".session-item");
            },

            update: function() {
                for (let i = 0; i < this.items.length; i++) {
                    let colored = i < this.finished;
                    this.items[i].style.fill = colored ? "red" : "black";
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
                this.ctx.fillStyle = "green";
                this.ctx.beginPath();
                this.ctx.arc(center, center, center, 0, total);
                this.ctx.fill();

                let lineSize = this.size * 0.2;
                this.ctx.beginPath();
                this.ctx.strokeStyle = "red";
                this.ctx.lineWidth = lineSize;
                this.ctx.arc(center, center, center - lineSize / 2,
                             0, part * time);
                this.ctx.stroke();

                let timeLeft = maxTime - time;
                this.ctx.font = `${lineSize}px Arial`;
                this.ctx.textAlign = "center";
                this.ctx.fillStyle = "white";
                this.ctx.fillText(timeLeft, center, center + lineSize / 3);
            }
        }
    };

    elements.canvas.init();
    elements.workCounter.init();

    let buttons = (function() {
        let btnStart = document.querySelector(".btn-start");
        let btnStop = document.querySelector(".btn-stop");
        let btnPause = document.querySelector(".btn-pause");

        let current;
        let timerID = -1;

        function startTimer() {
            let seconds = parseInt((Date.now() - current) / 1000);
            let timeLeft = settings.workTime - seconds;

            if (timeLeft >= 0) {
                elements.canvas.drawTimer(seconds, settings.workTime);
            }
            else {
                elements.workCounter.endSession();
                stopTimer();
            }
        }

        function stopTimer() {
            clearInterval(timerID);
            timerID = -1;
        }

        btnStart.addEventListener("click", function(event) {
            if (timerID === -1) {
                current = Date.now();
                timerID = setInterval(startTimer, 1000);
            }
        });

        btnStop.addEventListener("click", stopTimer);

        return {
            start: btnStart,
            stop: btnStop,
            pause: btnPause
        };
    })();
})(window);