// 音樂文件路徑
const MUSIC = {
    NARRATIVE: "敘事.mp3",  // 敘事音樂
    CHEERFUL: "輕快.mp3"     // 輕快音樂
};

// 當前播放的音樂
let currentMusic = null;
let gameStarted = false;

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
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const startButton = document.createElement('button');
    startButton.textContent = '點擊開始遊戲';
    startButton.style.cssText = `
        padding: 20px 40px;
        font-size: 24px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: "標楷體", sans-serif;
        transition: transform 0.2s ease, background-color 0.2s ease;
    `;

    startButton.addEventListener('mouseover', () => {
        startButton.style.transform = 'scale(1.1)';
        startButton.style.background = 'rgba(76, 175, 80, 1)';
    });

    startButton.addEventListener('mouseout', () => {
        startButton.style.transform = 'scale(1)';
        startButton.style.background = 'rgba(76, 175, 80, 0.9)';
    });

    startButton.addEventListener('click', () => {
        gameStarted = true;
        startScreen.remove();
        initGame();
    });

    startScreen.appendChild(startButton);
    document.body.appendChild(startScreen);
}

// 確保音樂正確播放的函數
function ensureMusic(musicPath) {
    if (currentMusic !== musicPath && gameStarted) {
        currentMusic = musicPath;
        console.log('正在切換音樂到:', musicPath);
        gameSystem.audio.playBGM(musicPath);
    }
}

// 角色控制相關函數
function showCharacter(type) {
    const mainCharacter = document.querySelector('.main-character');
    const otherCharacter = document.querySelector('.other-character');
    
    // 清除之前的退場效果
    mainCharacter.classList.remove('exit');
    otherCharacter.classList.remove('exit');
    
    switch(type) {
        case 'main_only':
            mainCharacter.classList.add('visible');
            otherCharacter.classList.remove('visible');
            break;
        case 'other_only':
            mainCharacter.classList.remove('visible');
            otherCharacter.classList.add('visible');
            break;
        case 'both':
            mainCharacter.classList.add('visible');
            otherCharacter.classList.add('visible');
            break;
        case 'none':
            mainCharacter.classList.remove('visible');
            otherCharacter.classList.remove('visible');
            break;
    }
}

// 判斷對話類型並顯示相應角色
function updateCharacterDisplay(dialogue) {
    if (!dialogue) return;
    
    // 判斷是否是內心獨白（帶括號的對話）
    const isInnerThought = dialogue.includes('（') && dialogue.includes('）');
    
    // 判斷是否是主角對話
    const isMainCharacterSpeaking = dialogue.startsWith('我：') || isInnerThought;
    
    // 判斷是否是沈凌琛對話
    const isShenSpeaking = dialogue.startsWith('沈凌琛：');
    
    if (isMainCharacterSpeaking && isShenSpeaking) {
        showCharacter('both');
    } else if (isMainCharacterSpeaking) {
        showCharacter('main_only');
    } else if (isShenSpeaking) {
        showCharacter('other_only');
    } else {
        showCharacter('none');
    }
}

// 在顯示對話時調用角色顯示邏輯
function showDialogue(text) {
    const dialogueText = document.getElementById('dialogue-text');
    dialogueText.textContent = text;
    updateCharacterDisplay(text);
}

// 顯示角色
function showCharacter(characterName) {
    const character = document.querySelector(`.character.${characterName}`);
    if (character) {
        character.classList.add('visible');
        characterAnimation(character);
    }
}

// 隱藏角色
function hideCharacter(characterName) {
    const character = document.querySelector(`.character.${characterName}`);
    if (character) {
        character.classList.remove('visible');
    }
}

// 切換背景
function changeBackground(backgroundPath) {
    const background = document.querySelector('.background');
    background.src = backgroundPath;
}

// 處理選項
function handleChoice(choice) {
    if (choice.next !== undefined) {
        gameScenes.chapter1.currentScene = choice.next;
        playScene();
    }
}

// 更新進度條
function updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progress = (gameScenes.chapter1.currentScene / (gameScenes.chapter1.scenes.length - 1)) * 100;
    progressFill.style.width = `${progress}%`;
}

// 播放場景動畫
function playSceneVideo(videoSrc) {
    return new Promise((resolve) => {
        const video = document.getElementById('scene-video');
        const dialogueBox = document.querySelector('.dialogue-box');
        const progressBar = document.querySelector('.progress-bar');
        
        // 隱藏對話框和進度條
        dialogueBox.style.display = 'none';
        progressBar.style.display = 'none';
        
        // 設置影片全螢幕樣式
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.zIndex = '2000';
        
        // 設置影片來源並顯示
        video.src = videoSrc;
        video.style.display = 'block';
        
        // 播放影片
        video.play();
        
        // 影片播放結束後
        video.onended = () => {
            // 隱藏影片
            video.style.display = 'none';
            video.src = '';
            
            // 重置影片樣式
            video.style.position = '';
            video.style.top = '';
            video.style.left = '';
            video.style.width = '';
            video.style.height = '';
            video.style.objectFit = '';
            video.style.zIndex = '';
            
            // 顯示對話框和進度條
            dialogueBox.style.display = 'block';
            progressBar.style.display = 'block';
            
            resolve();
        };
    });
}

// 播放場景
async function playScene() {
    console.log('開始播放場景');
    const scene = gameScenes.chapter1.scenes[gameScenes.chapter1.currentScene];
    if (!scene) {
        console.error('場景不存在');
        return;
    }

    console.log('當前場景:', scene);

    // 檢查對話系統是否已初始化
    if (!gameSystem || !gameSystem.dialogue) {
        console.error('對話系統未初始化');
        return;
    }

    // 根據場景切換音樂
    if (scene.background === "綜合能力競賽背景.jpg") {
        ensureMusic(MUSIC.NARRATIVE);
    } else if (scene.background === "教室背景.jpg") {
        ensureMusic(MUSIC.CHEERFUL);
    } else if (scene.background === "學務處背景.jpg") {
        ensureMusic(MUSIC.NARRATIVE);
    }

    // // 檢查是否需要播放場景動畫
    // if (scene.dialogue === "中午，學務處。") {
    //     ensureMusic(MUSIC.NARRATIVE);
    //     await playSceneVideo("學務處.mp4");
    // } else if (scene.dialogue === "四天後，早上的教室內。") {
    //     ensureMusic(MUSIC.CHEERFUL);
    //     await playSceneVideo("四天後教室.mp4");
    // }

    // 更新背景
    if (scene.background) {
        changeBackground(scene.background);
    }

    // 更新角色
    document.querySelectorAll('.character').forEach(char => {
        char.classList.remove('visible');
    });

    try {
        // 顯示對話
        console.log('準備顯示對話:', scene.dialogue, '說話者:', scene.speaker);
        await gameSystem.dialogue.showDialogue(scene.dialogue, scene.speaker);
        console.log('對話顯示完成');
    } catch (error) {
        console.error('顯示對話時發生錯誤:', error);
    }

    // 如果在快進模式下，等待指定時間後自動進入下一場景
    if (gameSystem.dialogue.isFastForward) {
        setTimeout(() => {
            nextScene();
        }, gameSystem.dialogue.fastForwardDelay);
    }
}

// 下一場景
function nextScene() {
    // 如果正在打字，不進行任何操作
    if (gameSystem.dialogue.isTyping) {
        return;
    }
    
    // 檢查是否需要等待
    if (!gameSystem.dialogue.isFastForward) {
        // 防止連點，添加短暫延遲
        setTimeout(() => {
            if (gameScenes.chapter1.currentScene < gameScenes.chapter1.scenes.length - 1) {
                gameScenes.chapter1.currentScene++;
                playScene();
                updateProgress();
            }
        }, 200);
    } else {
        // 快進模式下直接進入下一場景
        if (gameScenes.chapter1.currentScene < gameScenes.chapter1.scenes.length - 1) {
            gameScenes.chapter1.currentScene++;
            playScene();
            updateProgress();
        }
    }
}

// 將 nextScene 函數暴露給全局作用域，供對話系統使用
window.nextScene = nextScene;

// 初始化遊戲
async function initGame() {
    console.log('開始初始化遊戲');
    gameStarted = true;
    
    try {
        // 初始化音頻系統
        console.log('初始化音頻系統');
        gameSystem.audio.init();
        
        // 初始化對話系統
        console.log('初始化對話系統');
        if (!gameSystem.dialogue) {
            console.error('對話系統不存在');
            return;
        }
        gameSystem.dialogue.init();
        
        // 隱藏對話框和進度條
        const dialogueBox = document.querySelector('.dialogue-box');
        const progressBar = document.querySelector('.progress-bar');
        dialogueBox.style.display = 'none';
        progressBar.style.display = 'none';
        
        // 播放開場影片
        const video = document.getElementById('scene-video');
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.zIndex = '2000';
        video.src = "綜合能力競賽.mp4";
        video.style.display = 'block';
        
        // 等待影片播放完成
        await new Promise((resolve) => {
            video.onended = () => {
                video.style.display = 'none';
                video.src = '';
                // 重置影片樣式
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
        
        // 重置場景到第一個場景
        gameScenes.chapter1.currentScene = 0;
        
        // 顯示對話框和進度條
        if (dialogueBox) {
            dialogueBox.style.display = 'block';
            console.log('對話框已顯示');
        } else {
            console.error('找不到對話框元素');
        }
        
        if (progressBar) {
            progressBar.style.display = 'block';
            console.log('進度條已顯示');
        }
        
        // 根據初始場景設置音樂
        const initialScene = gameScenes.chapter1.scenes[gameScenes.chapter1.currentScene];
        if (initialScene.background === "綜合能力競賽背景.jpg") {
            ensureMusic(MUSIC.NARRATIVE);
        } else if (initialScene.background === "教室背景.jpg") {
            ensureMusic(MUSIC.CHEERFUL);
        } else if (initialScene.background === "學務處背景.jpg") {
            ensureMusic(MUSIC.NARRATIVE);
        }
        
        // 開始播放場景
        console.log('開始播放初始場景');
        playScene();
        updateProgress();

        // 只添加下一步按鈕的事件監聽
        const nextButton = document.querySelector('.next-button');
        if (nextButton) {
            console.log('綁定下一步按鈕事件');
            nextButton.addEventListener('click', () => {
                if (!gameSystem.dialogue.isTyping) {
                    nextScene();
                }
            });
        } else {
            console.error('找不到下一步按鈕');
        }
        
        console.log('遊戲初始化完成');
    } catch (error) {
        console.error('遊戲初始化過程中發生錯誤:', error);
    }
}

// 當頁面載入完成後顯示開始界面
document.addEventListener('DOMContentLoaded', () => {
    // 隱藏對話框和進度條，直到遊戲開始
    const dialogueBox = document.querySelector('.dialogue-box');
    const progressBar = document.querySelector('.progress-bar');
    if (dialogueBox) dialogueBox.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    
    showStartScreen();
});