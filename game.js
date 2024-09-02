const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    scene: {
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            checkCollision: {
                up: true,
                down: false,
                left: true,
                right: true
            }
        }
    }
};

const game = new Phaser.Game(config);

let paddle;
let ball;
let bricks;
let scoreText;
let gameOverText;
let finalScoreText;
let score = 0;
let gameState = 'mainMenu';

let startButton;
let creditsButton;
let creditsText;
let backButton;
let pauseText;
let continueButton;
let quitButton;

function create() {
    // 패들 생성
    paddle = this.add.rectangle(400, 550, 100, 20, 0xFFFFFF);
    this.physics.add.existing(paddle);
    paddle.body.setImmovable(true);

    // 공 생성
    ball = this.add.circle(400, 530, 10, 0xFF0000);
    this.physics.add.existing(ball);
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(1);
    ball.body.setVelocity(75, -300);

    createBricks.call(this);

    // 충돌 설정
    this.physics.add.collider(ball, paddle, hitPaddle, null, this);
    this.physics.add.collider(ball, bricks, hitBrick, null, this);

    // 텍스트 생성
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    gameOverText = this.add.text(400, 200, 'Game Over', { fontSize: '64px', fill: '#FF0000', align: 'center' });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);
    finalScoreText = this.add.text(400, 300, '', { fontSize: '32px', fill: '#FFF', align: 'center' });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setVisible(false);

    // 메인 메뉴 버튼 생성
    startButton = this.add.text(400, 250, '게임시작', { fontSize: '32px', fill: '#00FF00' });
    startButton.setOrigin(0.5);
    startButton.setInteractive();
    startButton.on('pointerdown', startGame, this);
    creditsButton = this.add.text(400, 350, '제작자', { fontSize: '32px', fill: '#00FF00' });
    creditsButton.setOrigin(0.5);
    creditsButton.setInteractive();
    creditsButton.on('pointerdown', showCredits, this);

    // 제작자 정보 텍스트
    creditsText = this.add.text(400, 300, '제작자: 박예찬 (red6855)', 
        { fontSize: '24px', fill: '#FFF', align: 'center' });
    creditsText.setOrigin(0.5);
    creditsText.setVisible(false);

    // 뒤로가기 버튼
    backButton = this.add.text(400, 450, '뒤로가기', { fontSize: '24px', fill: '#00FF00' });
    backButton.setOrigin(0.5);
    backButton.setInteractive();
    backButton.on('pointerdown', showMainMenu, this);
    backButton.setVisible(false);

    // 일시 정지 메뉴 요소 생성
    pauseText = this.add.text(400, 200, '일시 정지', { fontSize: '48px', fill: 'red' });
    pauseText.setOrigin(0.5);
    pauseText.setVisible(false);

    continueButton = this.add.text(400, 300, '계속하기', { fontSize: '32px', fill: '#00FF00' });
    continueButton.setOrigin(0.5);
    continueButton.setInteractive();
    continueButton.on('pointerdown', resumeGame, this);
    continueButton.setVisible(false);

    quitButton = this.add.text(400, 400, '나가기', { fontSize: '32px', fill: '#00FF00' });
    quitButton.setOrigin(0.5);
    quitButton.setInteractive();
    quitButton.on('pointerdown', quitToMainMenu, this);
    quitButton.setVisible(false);

    // ESC 키 입력 처리
    this.input.keyboard.on('keydown-ESC', togglePause, this);

    gameOverText.setDepth(1);
    finalScoreText.setDepth(1);
    continueButton.setDepth(1);
    quitButton.setDepth(1);
    pauseText.setDepth(1);

    showMainMenu.call(this);
}

function update() {
    if (gameState === 'playing') {
        paddle.x = this.input.x;
        paddle.x = Phaser.Math.Clamp(paddle.x, paddle.width / 2, config.width - paddle.width / 2);

        if (ball.y > config.height) {
            gameOver.call(this);
        }
    }
}

function hitBrick(ball, brick) {
    brick.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);

    if (bricks.countActive() === 0) {
        levelComplete.call(this);
    }
}

function hitPaddle(ball, paddle) {
    let diff = 0;
    if (ball.x < paddle.x) {
        diff = paddle.x - ball.x;
        ball.body.setVelocityX(-10 * diff);
    } else if (ball.x > paddle.x) {
        diff = ball.x - paddle.x;
        ball.body.setVelocityX(10 * diff);
    } else {
        ball.body.setVelocityX(2 + Math.random() * 8);
    }
}

function createBricks() {
    if (bricks) {
        bricks.clear(true, true);
    }
    bricks = this.physics.add.staticGroup();
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 4; j++) {
            let brick = this.add.rectangle(i * 70 + 85, j * 30 + 100, 60, 20, 0x00FF00);
            bricks.add(brick);
            this.physics.add.existing(brick, true);
        }
    }
}

function resetBall() {
    ball.setPosition(config.width / 2, config.height - 50);
    ball.body.setVelocity(75, -300);
}

function gameOver() {
    gameState = 'gameOver';
    ball.body.setVelocity(0, 0);
    
    // 게임 오버 텍스트 표시 및 위치 조정
    gameOverText.setVisible(true);
    gameOverText.setPosition(400, 200);
    
    // 최종 점수 텍스트 표시 및 위치 조정
    finalScoreText.setText('Final Score: ' + score);
    finalScoreText.setVisible(true);
    finalScoreText.setPosition(400, 300);
    
    // 계속하기 버튼 표시 및 위치 조정
    continueButton.setPosition(400, 400);
    continueButton.setVisible(true);
    
    // 나가기 버튼 표시 및 위치 조정
    quitButton.setPosition(400, 500);
    quitButton.setVisible(true);

    // 모든 게임 오버 관련 요소들을 벽돌 위에 표시
    this.children.bringToTop(gameOverText);
    this.children.bringToTop(finalScoreText);
    this.children.bringToTop(continueButton);
    this.children.bringToTop(quitButton);
}

function levelComplete() {
    resetBall.call(this);
    createBricks.call(this);
    this.scene.restart();
}

function showMainMenu() {
    if (gameState !== 'mainMenu') {
        gameState = 'mainMenu';

        // 메인 메뉴 버튼만 표시
        startButton.setVisible(true);
        creditsButton.setVisible(true);
        this.children.bringToTop(startButton);
        this.children.bringToTop(creditsButton);

        // 다른 모든 게임 요소 숨기기
        hideGameElements();
    }
}

function startGame() {
    if (gameState === 'mainMenu') {
        gameState = 'playing';
        startButton.setVisible(false);
        creditsButton.setVisible(false);
        scoreText.setVisible(true);
        paddle.setVisible(true);
        ball.setVisible(true);
        bricks.setVisible(true);
        resetGame.call(this);
    }
}

function showCredits() {
    if (gameState === 'mainMenu') {
        gameState = 'credits';
        startButton.setVisible(false);
        creditsButton.setVisible(false);
        creditsText.setVisible(true);
        backButton.setVisible(true);
    }
}

function resetGame() {
    score = 0;
    scoreText.setText('Score: 0');
    resetBall.call(this);
    createBricks.call(this);
    this.physics.add.collider(ball, bricks, hitBrick, null, this);
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        ball.body.setVelocity(0, 0);
        pauseText.setVisible(true);
        continueButton.setVisible(true);
        quitButton.setVisible(true);
        startButton.setVisible(false);
        creditsButton.setVisible(false);
    } else if (gameState === 'paused') {
        resumeGame.call(this);
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        ball.body.setVelocity(75, -300);
        pauseText.setVisible(false);
        continueButton.setVisible(false);
        quitButton.setVisible(false);
        startButton.setVisible(false);
        creditsButton.setVisible(false);
    } else if (gameState === 'gameOver') {
        gameState = 'playing';
        ball.body.setVelocity(75, -300);
        gameOverText.setVisible(false);
        finalScoreText.setVisible(false);
        continueButton.setVisible(false);
        quitButton.setVisible(false);
        resetGame.call(this);
    }
}

function quitToMainMenu() {
    // 게임 상태 초기화
    resetGameObjects.call(this);

    // 메인 메뉴 버튼만 표시
    startButton.setVisible(true);
    creditsButton.setVisible(true);

    // 다른 모든 게임 요소 숨기기
    hideGameElements();

    // 게임 상태 변경
    gameState = 'mainMenu';
}

function resetGameObjects() {
    // 공과 패들 리셋
    ball.setPosition(400, 530);
    ball.body.setVelocity(0, 0);
    paddle.setPosition(400, 550);

    // 벽돌 제거 및 재생성
    bricks.clear(true, true);
    createBricks.call(this);

    // 점수 초기화
    score = 0;
    scoreText.setText('Score: 0');

    // 게임 상태 관련 변수 초기화
    gameState = 'mainMenu';
}

function hideGameElements() {
    // 게임 오브젝트 숨기기
    ball.setVisible(false);
    paddle.setVisible(false);
    bricks.setVisible(false);

    // 텍스트 요소 숨기기
    scoreText.setVisible(false);
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);
    pauseText.setVisible(false);
    creditsText.setVisible(false);

    // 버튼 숨기기 (메인 메뉴 버튼 제외)
    continueButton.setVisible(false);
    quitButton.setVisible(false);
    backButton.setVisible(false);
}