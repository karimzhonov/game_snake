"use strict";

const settings = {
    rowsCount: 21,
    colsCount: 21,
    speed: 2,
    winFoodCount: 50,
};

const config = {
    settings,

    init(userSettings){
        Object.assign(this.settings, userSettings);
        if (!this.validate().inValid){
            for ( let i = 0; i < this.validate().error.length ; i++){
                console.error(this.validate().error[i]);
            }
            return
        }

    },

    validate(){
      const result = {
          inValid: true,
          error: [],
      }

      if (this.settings.rowsCount < 10 || this.settings.rowsCount > 30) {
          result.inValid = false;
          result.error.push("Error rowsCount");
      }

      if (this.settings.colsCount < 10 || this.settings.colsCount >30) {
          result.inValid = false;
          result.error.push("Error colsCount");
      }

      if (this.settings.speed < 1 || this.settings.speed > 10) {
          result.inValid = false;
          result.error.push("Error speed");
      }

      if (this.settings.winFoodCount > 100 || this.settings.winFoodCount<1) {
          result.inValid = false;
          result.error.push("Error wonFoodCount");
      }
      return result
    },

    getColsCount(){
        return this.settings.colsCount
    },

    getRowsCount(){
        return this.settings.rowsCount
    },

    getSpeed() {
        return this.settings.speed
    },

    getWinFoodCount(){
        return this.settings.winFoodCount
    },
};

const map = {
    cells: {},
    usedCells: [],
    cellsArr: null,
    init(cols ,rows ,count) {
        const map = document.getElementById("map");
        document.body.appendChild(document.createElement("h2"));
        document.body.querySelector("h2").innerHTML = "Food Counts = " + count;
        document.body.querySelector("h2").classList.add("heading");
        for (let i = 0; i < cols; i++){
            map.appendChild(document.createElement("div"));
            map.children[i].classList.add("col");
            for(let j = 0 ; j < rows; j++){
                map.children[i].appendChild(document.createElement("div"));
                map.children[i].children[j].classList.add("cell");
                this.cells[`${i}-${j}`] = map.children[i].children[j];
            }
        }




    },
    cell (x,y){
        return this.cells[`${x}-${y}`]
    },
    render(cols,rows,snakePaintArray,foodCoordinates,count){
        for (let i = 0; i< cols;i++){
            for (let j = 0;j< rows;j++){
                this.cells[`${i}-${j}`].className = "cell";
            }
        }
        this.usedCells = [];

        document.body.querySelector("h2").innerHTML = "Food Counts = " + count;
        snakePaintArray.forEach((point ,idx, arr) => {
            if (arr[idx].x < 0) {
                arr[idx].x += cols;
            }
            if (arr[idx].y < 0) {
                arr[idx].y += rows;
            }

            if (arr[idx].x >= cols) {
                arr[idx].x -= cols;
            }
            if (arr[idx].y >= rows) {
                arr[idx].y -= rows;
            }




            if (idx === 0){
                this.cells[`${point.x}-${point.y}`].classList.add("snakeHead");
            } else {
                this.cells[`${point.x}-${point.y}`].classList.add("snakeBody");
            }
            this.usedCells.push(point);
        });
        this.cells[`${foodCoordinates.x}-${foodCoordinates.y}`].classList.add("food");
        this.usedCells.push(foodCoordinates);
    },
};

const snake = {
    body: null,
    direction: null,

    init(startBody,startDirection){
        this.body = (startBody);
        this.direction = startDirection;
    },

    getNextStepHeadPoint(){
        switch (this.direction){
            case "up" : return {x: this.body[0].x, y: this.body[0].y - 1}
            case "right" : return {x: this.body[0].x + 1, y: this.body[0].y}
            case "down" : return {x: this.body[0].x, y: this.body[0].y + 1}
            case "left" : return {x: this.body[0].x - 1, y: this.body[0].y}
        }
    },

    isOnPoint(point){
        return this.body.some((bodyPoint) => bodyPoint.x === point.x && bodyPoint.y === point.y)
    },

    makeStep() {
        this.body.unshift(this.getNextStepHeadPoint());
        this.body.pop();
    }
};

const food = {
    x: null,
    y: null,

    getCoordinates(){
        return {
            x: this.x,
            y: this.y
        }
    },

    setCoordinates(point = {}){
        this.x = point.x;
        this.y = point.y;
    },
};

const status = {
    condition: "stopped",
    setPaying(){
        this.status = "playing";
    },
    setStopped(){
        this.status = "stopped";
    },
    setFinished(){
        this.status = "finished";
    },
    isPlaying(){
        return this.status === "playing";
    },
    isStopped(){
        return this.status === "stopped" ;
    },
};

const game = {
    config,
    map,
    snake,
    food,
    status,
    interval: null,
    count: null,
    countFood: 0,
    init(userSettings){
        this.config.init(userSettings);
        this.map.init( this.getColsCount(), this.getRowsCount(),this.countFood);
        this.reset();
        this.setEvent();
    },

    reset(){
        this.stop();
        this.count = 0;
        this.countFood = 0;
        this.snake.init(this.setStartSnakeBody(), "up");
        this.food.setCoordinates(this.getRandomCoordinates());
        this.render();
    },

    render() {
        this.map.render(this.getColsCount(),this.getRowsCount(),this.getBody(),this.food.getCoordinates(),this.countFood);
    },

    setHandler() {
        if (!this.canMakeStep()) {
            return this.finished()
        }

        this.snake.makeStep();
        this.render();

        if (this.isHeadOnFood()){
            this.countFood++;
            const nextPoint = this.snake.getNextStepHeadPoint();
            this.snake.body.unshift(nextPoint);
            this.food.x = this.getRandomCoordinates().x;
            this.food.y =this.getRandomCoordinates().y;
            this.count++;
            if (this.getWinFoodCount() === this.count){
                this.finished();
                alert("You Win");
            }
        }
    },

    isHeadOnFood(){
        return this.snake.body[0].x === this.food.x && this.snake.body[0].y === this.food.y
    },

    canMakeStep(){
        const nextStep = this.snake.getNextStepHeadPoint();

        return  !this.snake.isOnPoint(nextStep)
            // && nextStep.x < 0  && nextStep.y < 0 &&
            // nextStep.x > this.config.getColsCount() &&
            // nextStep.y > this.config.getRowsCount()
    },

    play(){
        this.status.setPaying();
        this.interval = setInterval(() => this.setHandler(),1000 / this.config.getSpeed());
        this.setBtnLeft("Stop",false);
    },

    stop(){
        this.status.setStopped();
        clearInterval(this.interval);
        this.setBtnLeft("Start",false);
    },

    finished(){
        this.status.setFinished();
        clearInterval(this.interval);
        this.setBtnLeft("Game Over",true);
    },

    setStartSnakeBody() {
        let x = Math.floor(this.getColsCount() / 2);
        let y = Math.floor(this.getRowsCount() / 2);
        return [{x: x, y: y}]
    },

    setEvent() {
        document.body.querySelector(".button__left")
            .addEventListener('click',() => this.onclickBtnLeft());
        document.body.querySelector(".button__right")
            .addEventListener('click',() => this.onclickBtnRight());
        document
            .addEventListener('keydown',event => this.onclickKeyboard(event));
    },

    setBtnLeft(text, isDisabled){
        const  btn = document.body.querySelector(".button__left");
        btn.textContent = text;
        if (isDisabled) {
            btn.classList.add("disabled");
        } else {
            btn.classList.remove("disabled");
        }
    },

    onclickBtnLeft(){
        if (this.status.isPlaying()){
            this.stop();
        } else if (this.status.isStopped()){
            this.play();
        }
    },

    onclickBtnRight(){
        this.reset();
    },

    onclickKeyboard(event){
        if (!this.status.isPlaying()){
            return
        }
        const code = event.code;
        let nextCode;
        switch (code) {
            case "KeyW":
            case "ArrowUp": nextCode = "up";break
            case "KeyS":
            case "ArrowDown": nextCode = "down";break
            case "KeyA":
            case "ArrowLeft": nextCode = "left"; break
            case "KeyD":
            case "ArrowRight": nextCode = "right"; break
            case "Space" : this.onclickBtnLeft();
        }
        console.log(event);
        if (this.isRightArrow(nextCode)){
            this.snake.direction = nextCode;
        }
    },

    isRightArrow(arrow){
      return !(arrow === "down" && this.snake.direction === "up" ||
          arrow === "up" && this.snake.direction === "down" ||
          arrow === "left" && this.snake.direction === "right" ||
          arrow === "right" && this.snake.direction === "left" )
    },

    getRandomCoordinates(){
        const exclude = [this.food.getCoordinates(), ...this.getBody()];
        while (true){
            let foodPasX = Math.floor(Math.random()* this.getColsCount());
            let foodPosY = Math.floor(Math.random()* this.getRowsCount());
            if (!exclude.some((element) => element.x ===foodPasX && element.y === foodPosY)) {
                return {
                    x: foodPasX,
                    y: foodPosY,
                }
            }
        }
    },

    getColsCount(){
        return this.config.settings.colsCount
    },
    getRowsCount(){
        return this.config.settings.rowsCount
    },
    getSpeed() {
        return this.config.settings.speed
    },
    getWinFoodCount(){
        return this.config.settings.winFoodCount
    },
    getBody(){
        return this.snake.body
    }
};

game.init({
    speed: 8,});
