// 遊戲狀態控制
let gameStarted = false;

// 玩家名字
let playerName = '';

// 遊戲進度管理
class GameProgress {
    constructor() {
        this.currentChapter = 1;
        this.currentScene = 0;
        this.choices = {};
    }

    // 保存進度
    saveProgress() {
        const saveData = {
            currentChapter: this.currentChapter,
            currentScene: this.currentScene,
            choices: this.choices,
            playerName: playerName,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('gameProgress', JSON.stringify(saveData));
    }

    // 讀取進度
    loadProgress() {
        const savedData = localStorage.getItem('gameProgress');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentChapter = data.currentChapter;
            this.currentScene = data.currentScene;
            this.choices = data.choices;
            if (data.playerName) {
                playerName = data.playerName;
            }
            return true;
        }
        return false;
    }

    // 重置進度
    resetProgress() {
        if (confirm('確定要重置進度嗎？這將會清除所有保存的進度。')) {
            localStorage.removeItem('gameProgress');
            this.currentChapter = 1;
            this.currentScene = 0;
            this.choices = {};
            location.reload();
        }
    }

    // 更新當前場景
    updateScene(sceneIndex) {
        this.currentScene = sceneIndex;
        this.saveProgress();
    }

    // 記錄選擇
    recordChoice(chapterId, choiceId, value) {
        if (!this.choices[chapterId]) {
            this.choices[chapterId] = {};
        }
        this.choices[chapterId][choiceId] = value;
        this.saveProgress();
    }
}

// 音頻控制相關
const audio = {
    bgm: null,
    isMuted: false,
    
    init() {
        this.bgm = null;
    },
    
    async playBGM(musicPath) {
        try {
            const absolutePath = new URL(musicPath, window.location.href).href;
            
            if (!this.bgm || this.bgm.src !== absolutePath) {
                if (this.bgm) {
                    this.bgm.pause();
                }
                
                this.bgm = new Audio();
                
                this.bgm.onerror = (e) => {
                    console.error('音訊載入錯誤：', e);
                    throw new Error(`音訊 ${musicPath} 載入失敗`);
                };
                
                await new Promise((resolve, reject) => {
                    this.bgm.oncanplaythrough = resolve;
                    this.bgm.onerror = reject;
                    this.bgm.src = musicPath;
                    this.bgm.load();
                });
                
                this.bgm.loop = true;
            }
            
            this.bgm.muted = this.isMuted;
            if (!this.isMuted) {
                await this.bgm.play();
            }
        } catch (error) {
            console.error('BGM播放失敗:', error);
        }
    },
    
    toggleMute() {
        const musicButton = document.querySelector('.music-control');
        this.isMuted = !this.isMuted;
        
        if (this.bgm) {
            this.bgm.muted = this.isMuted;
        }
        
        if (musicButton) {
            musicButton.textContent = this.isMuted ? '🔇' : '🔊';
            musicButton.classList.toggle('muted', this.isMuted);
        }
    }
};

// 角色動畫效果
function characterAnimation(characterElement) {
    if (!characterElement) return;
    
    document.querySelectorAll('.character.active').forEach(char => {
        if (char !== characterElement) {
            char.classList.remove('active');
        }
    });
    
    characterElement.classList.add('active');
}

// 對話系統
const dialogue = {
    isTyping: false,
    isFastForward: false,
    isAutoPlay: false,
    autoPlayDelay: 2000,
    currentTimeout: null,
    typingSpeed: 100,
    fastForwardDelay: 200,
    canProceed: true,
    currentText: '',
    
    init() {
        console.log('開始初始化對話系統');
        
        this.dialogueBox = document.querySelector('.dialogue-box');
        console.log('對話框元素:', this.dialogueBox);
        
        if (!this.dialogueBox) {
            console.error('找不到對話框元素！');
            return;
        }
        
        this.initializeControls();
        
        this.speakerName = this.dialogueBox.querySelector('.speaker-name');
        console.log('說話者名稱元素:', this.speakerName);
        
        if (!this.speakerName) {
            console.error('找不到說話者名稱元素！');
            this.speakerName = document.createElement('div');
            this.speakerName.className = 'speaker-name';
            this.dialogueBox.insertBefore(this.speakerName, this.dialogueBox.firstChild);
            console.log('已創建說話者名稱元素');
        }
        
        this.dialogueText = document.getElementById('dialogue-text');
        console.log('對話文字元素:', this.dialogueText);
        
        if (!this.dialogueText) {
            console.error('找不到對話文字元素！');
            return;
        }
        
        this.bindEvents();
        
        this.dialogueBox.style.display = 'block';
        this.speakerName.style.display = 'none';
        this.speakerName.style.opacity = '0';
        
        console.log('對話系統初始化完成');
    },
    
    initializeControls() {
        const autoPlayButton = document.querySelector('.auto-play-control');
        if (autoPlayButton) {
            autoPlayButton.onclick = () => {
                this.toggleAutoPlay();
            };
        }

        const musicButton = document.querySelector('.music-control');
        if (musicButton) {
            musicButton.onclick = () => {
                window.gameSystem.audio.toggleMute();
            };
        }

        const fastForwardButton = document.querySelector('.fast-forward-control');
        if (fastForwardButton) {
            fastForwardButton.onclick = () => {
                this.toggleFastForward();
            };
        }

        const resetButton = document.querySelector('.reset-button');
        if (resetButton) {
            resetButton.onclick = () => {
                window.gameSystem.progress.resetProgress();
            };
        }
    },
    
    bindEvents() {
        if (!this.dialogueBox) return;
        
        this.dialogueBox.onclick = (e) => {
            if (e.target.classList.contains('next-button')) {
                return;
            }
            
            if (this.isTyping) {
                e.stopPropagation();
                this.skipTyping();
                this.canProceed = false;
                setTimeout(() => {
                    this.canProceed = true;
                }, 500);
            } else if (this.canProceed && !this.isFastForward) {
                this.canProceed = false;
                setTimeout(() => {
                    this.canProceed = true;
                    window.nextScene();
                }, this.fastForwardDelay);
            }
        };
    },
    
    toggleAutoPlay() {
        console.log('切換自動播放狀態');
        this.isAutoPlay = !this.isAutoPlay;
        
        const autoPlayButton = document.querySelector('.auto-play-control');
        if (autoPlayButton) {
            autoPlayButton.textContent = this.isAutoPlay ? '⏸' : '▶';
            autoPlayButton.classList.toggle('active', this.isAutoPlay);
        }
        
        if (this.isAutoPlay && !this.isTyping) {
            console.log('開始自動播放');
            this.scheduleNextScene();
        } else if (!this.isAutoPlay) {
            console.log('停止自動播放');
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }
        }
    },
    
    scheduleNextScene() {
        console.log('安排下一個場景');
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        if (!this.isAutoPlay) return;
        
        this.currentTimeout = setTimeout(() => {
            console.log('自動播放：進入下一場景');
            if (this.isAutoPlay && !this.isTyping) {
                window.nextScene();
            }
        }, this.autoPlayDelay);
    },
    
    async showDialogue(text, speaker) {
        if (!text) return;
        
        const processedText = replacePlayerName(text);
        const processedSpeaker = replacePlayerName(speaker);
        
        console.log('顯示對話:', processedText, '說話者:', processedSpeaker);
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        const finalText = this.updateSpeaker(processedText, processedSpeaker);
        this.currentText = finalText;
        
        this.dialogueText.innerHTML = '';
        this.isTyping = true;
        
        if (this.isFastForward) {
            await this.showInstantText(finalText);
            if (this.isAutoPlay) {
                this.scheduleNextScene();
            }
            return;
        }
        
        for (let i = 0; i < finalText.length; i++) {
            if (!this.isTyping) {
                await this.showInstantText(finalText);
                if (this.isAutoPlay) {
                    this.scheduleNextScene();
                }
                return;
            }
            
            const char = document.createElement('span');
            char.className = 'char-animation';
            char.textContent = finalText[i];
            this.dialogueText.appendChild(char);
            
            await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
        }
        
        this.isTyping = false;
        this.canProceed = true;
        
        if (this.isAutoPlay) {
            this.scheduleNextScene();
        }
    },
    
    updateSpeaker(text, speaker) {
        console.log('更新說話者名稱:', text, '指定說話者:', speaker);
        
        let speakerClass = '';
        let processedText = text;
        
        const isDialogueScene = this.isDialogueScene();
        
        if (isDialogueScene) {
            document.querySelector('.main-character')?.classList.add('visible');
            document.querySelector('.other-character')?.classList.add('visible');
        } else {
            document.querySelectorAll('.character').forEach(char => {
                char.classList.remove('visible');
            });
        }
        
        if (text.startsWith('（') && text.endsWith('）')) {
            speaker = '內心獨白';
            speakerClass = 'inner';
            processedText = text.substring(1, text.length - 1);
            if (!isDialogueScene) {
                document.querySelector('.main-character')?.classList.add('visible');
            }
        }
        else if (speaker) {
            switch(speaker) {
                case '我':
                case playerName:
                    speakerClass = 'main';
                    if (!isDialogueScene) {
                        document.querySelector('.main-character')?.classList.add('visible');
                    }
                    break;
                case '沈凌琛':
                    speakerClass = 'other';
                    if (!isDialogueScene) {
                        document.querySelector('.other-character')?.classList.add('visible');
                    }
                    break;
                case '大會':
                case '喬珮昕':
                    speakerClass = 'announcement';
                    break;
                default:
                    speakerClass = 'announcement';
            }
        }
        else {
            this.speakerName.style.display = 'none';
            this.speakerName.style.opacity = '0';
            return text;
        }
        
        if (speaker) {
            console.log('設置說話者樣式:', speakerClass, '說話者:', speaker);
            this.speakerName.style.display = 'block';
            this.speakerName.style.opacity = '1';
            this.speakerName.className = `speaker-name ${speakerClass}`;
            this.speakerName.textContent = speaker;
        }
        
        return processedText;
    },
    
    async showInstantText(text) {
        let processedText = text;
        
        if (text.includes('（') && text.includes('）')) {
            processedText = text.replace(/（(.*?)）/g, '<span class="inner-thought">（$1）</span>');
        }
        
        const currentHeight = this.dialogueText.offsetHeight;
        this.dialogueText.style.minHeight = `${currentHeight}px`;
        
        return new Promise(resolve => {
            this.dialogueText.innerHTML = processedText;
            
            setTimeout(() => {
                this.dialogueText.style.minHeight = '';
                this.isTyping = false;
                this.canProceed = true;
                resolve();
            }, 100);
        });
    },
    
    skipTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
            }
            
            this.showInstantText(this.currentText);
        }
    },
    
    toggleFastForward() {
        const fastForwardButton = document.querySelector('.fast-forward-control');
        this.isFastForward = !this.isFastForward;
        
        fastForwardButton.textContent = this.isFastForward ? '⏸' : '⏩';
        fastForwardButton.classList.toggle('active', this.isFastForward);
        
        if (this.isTyping) {
            this.skipTyping();
        }
    },

    isDialogueScene() {
        const currentScene = gameScenes.chapter1.scenes[gameScenes.chapter1.currentScene];
        
        const hasMainCharacter = currentScene.speaker === '我' || 
                               currentScene.speaker === playerName || 
                               (currentScene.dialogue && currentScene.dialogue.includes('我：'));
        const hasShenCharacter = currentScene.speaker === '沈凌琛' || 
                                (currentScene.dialogue && currentScene.dialogue.includes('沈凌琛：'));
        
        return hasMainCharacter && hasShenCharacter;
    }
};

// 替換對話中的主角名字
function replacePlayerName(text) {
    if (!text) return text;
    return text.replace(/主角/g, playerName);
}

// 確保 gameSystem 在全局範圍內可用
window.gameSystem = {
    progress: new GameProgress(),
    audio: audio,
    dialogue: dialogue,
    characterAnimation: characterAnimation
};

// 遊戲場景數據
window.gameScenes = {
    chapter1: {
        currentScene: 0,
        scenes: []  // 場景數據會在另一個檔案中定義
    },
    chapter2: {
        currentScene: 0,
        scenes: []  // 場景數據會在另一個檔案中定義
    }
};

// 在 DOMContentLoaded 事件中初始化系統
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，開始初始化系統');
    
    try {
        window.gameSystem.audio.init();
        window.gameSystem.dialogue.init();
        
        const dialogueBox = document.querySelector('.dialogue-box');
        const progressBar = document.querySelector('.progress-bar');
        if (dialogueBox) dialogueBox.style.display = 'none';
        if (progressBar) progressBar.style.display = 'none';
        
        showStartScreen();
        
        console.log('系統初始化完成');
    } catch (error) {
        console.error('系統初始化失敗:', error);
    }
});

// 顯示開始界面
function showStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('遊戲初始封面.jpg') center center / cover no-repeat;
        display: flex;
        flex-direction: column;
        gap: 20px;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // 創建名字輸入框的容器
    const nameInputContainer = document.createElement('div');
    nameInputContainer.style.cssText = `
        background: rgba(0, 0, 0, 0.7);
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
    `;

    // 創建標籤
    const nameLabel = document.createElement('label');
    nameLabel.textContent = '請輸入你的名字：';
    nameLabel.style.cssText = `
        color: white;
        font-size: 20px;
        font-family: "標楷體", sans-serif;
        margin-right: 10px;
    `;

    // 創建輸入框
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.style.cssText = `
        padding: 5px 10px;
        font-size: 18px;
        font-family: "標楷體", sans-serif;
        border: none;
        border-radius: 5px;
        margin-left: 10px;
    `;

    // 將標籤和輸入框添加到容器
    nameInputContainer.appendChild(nameLabel);
    nameInputContainer.appendChild(nameInput);

    // 創建按鈕的通用樣式
    const buttonStyle = `
        padding: 20px 40px;
        font-size: 24px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: "標楷體", sans-serif;
        transition: transform 0.2s ease, background-color 0.2s ease;
        width: 250px;
        text-align: center;
    `;

    // 創建第一章按鈕
    const chapter1Button = document.createElement('button');
    chapter1Button.textContent = '開始第一章';
    chapter1Button.style.cssText = buttonStyle;

    // 創建第二章按鈕
    const chapter2Button = document.createElement('button');
    chapter2Button.textContent = '開始第二章';
    chapter2Button.style.cssText = buttonStyle;

    // 添加懸停效果
    [chapter1Button, chapter2Button].forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.1)';
            button.style.background = 'rgba(76, 175, 80, 1)';
        });

        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
            button.style.background = 'rgba(76, 175, 80, 0.9)';
        });
    });

    // 添加點擊事件
    chapter1Button.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('請輸入你的名字！');
            return;
        }
        playerName = name;
        gameStarted = true;
        startScreen.remove();
        window.gameSystem.progress.currentChapter = 1;
        initGame();
    });

    chapter2Button.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('請輸入你的名字！');
            return;
        }
        playerName = name;
        gameStarted = true;
        startScreen.remove();
        window.gameSystem.progress.currentChapter = 2;
        initChapter2();
    });

    // 將輸入框和按鈕添加到開始畫面
    startScreen.appendChild(nameInputContainer);
    startScreen.appendChild(chapter1Button);
    startScreen.appendChild(chapter2Button);
    document.body.appendChild(startScreen);
}

// 播放場景影片
async function playSceneVideo(videoPath) {
    const video = document.getElementById('scene-video');
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.zIndex = '2000';
    video.src = videoPath;
    video.style.display = 'block';
    
    await new Promise((resolve) => {
        video.onended = () => {
            video.style.display = 'none';
            video.src = '';
            video.style.position = '';
            video.style.top = '';
            video.style.left = '';
            video.style.width = '';
            video.style.height = '';
            video.style.objectFit = '';
            video.style.zIndex = '';
            resolve();
        };
        video.play();
    });
}

// 播放場景
async function playScene() {
    console.log('開始播放場景');
    const currentChapter = window.gameSystem.progress.currentChapter;
    const chapterKey = `chapter${currentChapter}`;
    
    if (!window.gameScenes[chapterKey]) {
        console.error(`找不到章節 ${chapterKey}`);
        return;
    }
    
    const scene = window.gameScenes[chapterKey].scenes[window.gameScenes[chapterKey].currentScene];
    
    if (!scene) {
        console.error('場景不存在');
        return;
    }

    console.log('當前場景:', scene);

    if (!window.gameSystem || !window.gameSystem.dialogue) {
        console.error('對話系統未初始化');
        return;
    }

    // 播放背景音樂
    if (scene.bgm) {
        await window.gameSystem.audio.playBGM(scene.bgm);
    }

    // 檢查是否需要播放場景影片
    if (scene.background === "教室背景.jpg" && scene.dialogue === "四天後，教室內。") {
        await playSceneVideo("1-1.mp4");
    } else if (scene.background === "學務處背景.jpg" && scene.dialogue === "中午，學務處。") {
        await playSceneVideo("1-2.mp4");
    } else if (scene.background === "教室背景.jpg" && scene.dialogue === "（距離那場比賽已經半個月了。）") {
        await playSceneVideo("2-1.mp4");
    } else if (scene.background === "幾天後教室.jpg" && scene.dialogue === "幾天後，放學時間。") {
        await playSceneVideo("2-2.mp4");
    } else if (scene.background === "籃球場背景.jpg" && scene.dialogue === "三分鐘後，籃球場。") {
        await playSceneVideo("2-3.mp4");
    } else if (scene.background === "教室背景.jpg" && scene.dialogue === "十一月二十二日，放學。") {
        await playSceneVideo("3-1.mp4");
    } else if (scene.background === "籃球場背景.jpg" && scene.dialogue === "你一邊走路一邊思考著，不知不覺就到了籃球場。") {
        await playSceneVideo("3-2.mp4");
    } else if (scene.background === "教室背景.jpg" && scene.dialogue === "（上週已經打了好幾天球，今天就把時間拿來讀書吧。）") {
        await playSceneVideo("3-3.mp4");
    } else if (scene.background === "教室背景.jpg" && scene.dialogue === "星期五。") {
        await playSceneVideo("4-1.mp4");
    } else if (scene.background === "籃球場背景.jpg" && scene.dialogue === "籃球場。") {
        await playSceneVideo("4-2.mp4");
    } else if (scene.background === "籃球場背景2.jpg" && scene.dialogue === "十二月二日，星期一。") {
        await playSceneVideo("4-3.mp4");
    } else if (scene.background === "走廊背景.jpg" && scene.dialogue === "星期三，午休。") {
        await playSceneVideo("4-4.mp4");
    }
    

    if (scene.background) {
        changeBackground(scene.background);
    }

    document.querySelectorAll('.character').forEach(char => {
        char.classList.remove('visible');
    });

    if (scene.characters) {
        scene.characters.forEach(charName => {
            const char = document.querySelector(`.character.${charName}`);
            if (char) {
                char.classList.add('visible');
                window.gameSystem.characterAnimation(char);
            }
        });
    }

    try {
        console.log('準備顯示對話:', scene.dialogue, '說話者:', scene.speaker);
        await window.gameSystem.dialogue.showDialogue(scene.dialogue, scene.speaker);
        console.log('對話顯示完成');
    } catch (error) {
        console.error('顯示對話時發生錯誤:', error);
    }
}

// 更新進度條
function updateProgress() {
    const currentChapter = window.gameSystem.progress.currentChapter;
    const chapterKey = `chapter${currentChapter}`;
    const scenes = window.gameScenes[chapterKey].scenes;
    const currentScene = window.gameScenes[chapterKey].currentScene;
    
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const progress = (currentScene / (scenes.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// 切換背景
function changeBackground(backgroundPath) {
    const background = document.querySelector('.background');
    if (background) {
        background.src = backgroundPath;
    }
}

// 播放背景音樂
function playBackgroundMusic(musicPath) {
    if (window.gameSystem && window.gameSystem.audio) {
        window.gameSystem.audio.playBGM(musicPath);
    }
}

// 下一場景函數
function nextScene() {
    if (window.gameSystem.dialogue.isTyping) {
        return;
    }
    
    const currentChapter = window.gameSystem.progress.currentChapter;
    const chapterKey = `chapter${currentChapter}`;
    const chapterScenes = window.gameScenes[chapterKey];
    
    if (!window.gameSystem.dialogue.isFastForward) {
        setTimeout(() => {
            if (chapterScenes.currentScene < chapterScenes.scenes.length - 1) {
                chapterScenes.currentScene++;
                playScene();
                updateProgress();
            }
        }, 200);
    } else {
        if (chapterScenes.currentScene < chapterScenes.scenes.length - 1) {
            chapterScenes.currentScene++;
            playScene();
            updateProgress();
        }
    }
}

// 將 nextScene 函數暴露給全局作用域
window.nextScene = nextScene;

// 初始化遊戲
async function initGame() {
    console.log('開始初始化遊戲');
    
    try {
        // 播放開場音樂
        await window.gameSystem.audio.playBGM("敘事.mp3");
        
        // 播放開場影片
        await playSceneVideo("綜合能力競賽.mp4");
        
        // 顯示對話框和進度條
        const dialogueBox = document.querySelector('.dialogue-box');
        const progressBar = document.querySelector('.progress-bar');
        if (dialogueBox) dialogueBox.style.display = 'block';
        if (progressBar) progressBar.style.display = 'block';
        
        // 初始化第一章
        window.gameScenes.chapter1.currentScene = 0;
        
        // 開始播放第一個場景
        await playScene();
        updateProgress();
        
        console.log('遊戲初始化完成');
    } catch (error) {
        console.error('遊戲初始化失敗:', error);
    }
}

// 初始化第二章
async function initChapter2() {
    console.log('開始初始化第二章');
    
    try {
        // 顯示對話框和進度條
        const dialogueBox = document.querySelector('.dialogue-box');
        const progressBar = document.querySelector('.progress-bar');
        if (dialogueBox) dialogueBox.style.display = 'block';
        if (progressBar) progressBar.style.display = 'block';
        
        // 初始化第二章
        window.gameScenes.chapter2.currentScene = 0;
        
        // 開始播放第一個場景
        await playScene();
        updateProgress();
        
        console.log('第二章初始化完成');
    } catch (error) {
        console.error('第二章初始化失敗:', error);
    }
} 