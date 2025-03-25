window.onload = runGame();

function runGame() {
    // Get canvas and context
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // Load the ball image
    const ballImage = new Image();
    ballImage.src = "/images/ball(3)2-2.png" ; // Ensure this is the correct file path


    // Load the overlay image
    const overlayImage = new Image();
    overlayImage.src = "/image/blocks-2.png"; // Use the correct path for the uploaded image

    // Set up the game elements
    const paddleWidth = 100;
    const paddleHeight = 10;
    let paddleX = (canvas.width - paddleWidth) / 2;
    const paddleSpeed = 7;

    const ballRadius = 10;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let ballDX = 2;
    let ballDY = -2;

    const brickRowCount = 3;
    const brickColumnCount = 3;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    let bricks = [];

    // Score and game over
    let score = 0;
    let lives = 3;
    let highestScore = localStorage.getItem("highestScore") || 0;


    // Ball and paddle color
    let ballColor = "black";
    let paddleColor = "black";

    // Initialize the bricks
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, hits: 0 }; // Added hits counter
        }
    }

    // Game pause flag
    let paused = false;
    let gameWon = false; // Add a flag to track if the game is won

    // Handle paddle movement
    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    // Handle color randomization buttons
    document.getElementById("randomizeBallColor").addEventListener("click", () => {
        ballColor = getRandomColor();
    });

    document.getElementById("randomizePaddleColor").addEventListener("click", () => {
        paddleColor = getRandomColor();
    });

    // Handle pause with "P" key
    function keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = true;
        } else if (e.key === "p" || e.key === "P") {
            // Toggle pause state when "P" is pressed
            paused = !paused;
            if (!paused) {
                draw(); // Resume the game loop
            }
        }
    }

    function keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = false;
        }
    }

    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Collision detection
    function collisionDetection() {
        let allCleared = true;
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let brick = bricks[c][r];
                if (brick.status === 1) {
                    allCleared = false;
                    if (ballX > brick.x && ballX < brick.x + brickWidth && ballY > brick.y && ballY < brick.y + brickHeight) {
                        ballDY = -ballDY;
                        brick.hits++;
                        if (brick.hits === 3) {
                            brick.status = 0;
                            score++;
                        }
                    }
                }
            }
        }
        if (allCleared) {
            initializeBricks();
        }
    }

    function initializeBricks() {
        bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1, hits: 0 };
            }
        }
    }

    initializeBricks();

    // Draw the ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.drawImage(ballImage, ballX - ballRadius, ballY - ballRadius, ballRadius * 2, ballRadius * 2)
        ctx.closePath();
    }

    // Draw the paddle
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = paddleColor;
        ctx.fill();
        ctx.closePath();
    }

    // Draw the bricks
    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();

                    ctx.rect(overlayImage, brickX, brickY, brickWidth, brickHeight);
                    
                     // Draw background color with opacity
                     ctx.globalAlpha = 1 - bricks[c][r].hits * 0.33; // Decrease opacity as hits increase
                     ctx.fillStyle = `rgba(0, 149, 221, 1)`;
                     ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                     ctx.globalAlpha = 1; // Reset opacity for next elements
 
                     // Draw overlay image on bricks
                     ctx.drawImage(overlayImage, brickX, brickY, brickWidth, brickHeight);
                }
            }
        }
    }

    // Draw the score
    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Score: " + score, 8, 20);
    }

    // Draw the lives
    function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
    }

    // Check if the game is won
    function checkWin() {
        let totalBricks = brickRowCount * brickColumnCount;
        if (score === totalBricks && !gameWon) {
            gameWon = true; // Set the game as won
            alert("YOU WIN, CONGRATULATIONS!");
            document.location.reload(); // Reload the game after winning
        }
    }

    // Update the game
    function draw() {
        if (paused) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();

        collisionDetection();

        ballX += ballDX;
        ballY += ballDY;

        if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
            ballDX = -ballDX;
        }
        if (ballY + ballDY < ballRadius) {
            ballDY = -ballDY;
        } else if (ballY + ballDY > canvas.height - ballRadius) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                ballDY = -ballDY;
            } else {
                lives--;
                if (!lives) {
                    alert("GAME OVER");
                    alert("Your score was " + score);
                    document.location.reload();
                } else {
                    ballX = canvas.width / 2;
                    ballY = canvas.height - 30;
                    ballDX = 2;
                    ballDY = -2;
                    paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, (canvas.width - paddleWidth) / 2));
                }
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += paddleSpeed;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= paddleSpeed;
        }

        if (score >= 99 && !gameWon) {
            gameWon = true;
            alert("YOU WIN, CONGRATULATIONS!");
            document.location.reload();
        }
    
        requestAnimationFrame(draw);
    }

    draw();
}