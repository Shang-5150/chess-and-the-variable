// 遊戲核心類
class GameCore {
    constructor() {
        this.init();
        this.bindEvents();
        this.dialogueHistoryList = [];
        this.isFastForward = false;
        this.isMuted = false;
        this.textSpeed = 100; // 一般速度：100毫秒/字
        this.fastForwardDelay = 300; // 改為 0.3 秒
        this.bgm = null;
        this.currentBGM = '';
        this.isPlayingVideo = false;
        this.currentScene = 0;
        this.isTyping = false;
        this.isDialogueComplete = false;
        this.isProcessingScene = false; // 新增：場景處理狀態
    }

    init() {
        // 獲取DOM元素
        this.container = document.getElementById('game-container');
        this.backgroundLayer = document.getElementById('background-layer');
        this.characterLayer = document.getElementById('character-layer');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.characterName = document.getElementById('character-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.dialogueHistory = document.getElementById('dialogue-history');
        this.loadingScreen = document.getElementById('loading-screen');
        this.titleScreen = document.getElementById('title-screen');
        this.playerNameInput = document.getElementById('player-name');
        this.startButton = document.getElementById('start-game');
        this.errorMessage = document.querySelector('.error-message');
        this.chapterSelect = document.getElementById('chapter-select');
        
        // 初始化按鈕
        this.btnFastForward = document.getElementById('btn-fast-forward');
        this.btnSkip = document.getElementById('btn-skip');
        this.btnMute = document.getElementById('btn-mute');
        this.btnHistory = document.getElementById('btn-history');
        this.btnHome = document.getElementById('btn-home');

        // 綁定初始畫面事件
        this.bindTitleScreenEvents();
        
        // 簡單的載入動畫
        this.showLoadingAnimation();
    }

    bindTitleScreenEvents() {
        // 監聽名字輸入
        this.playerNameInput.addEventListener('input', () => {
            const name = this.playerNameInput.value.trim();
            if (name.length > 0) {
                this.startButton.disabled = false;
                this.errorMessage.textContent = '';
            } else {
                this.startButton.disabled = true;
                this.errorMessage.textContent = '請輸入名字';
            }
        });

        // 監聽開始遊戲按鈕
        this.startButton.addEventListener('click', () => {
            const name = this.playerNameInput.value.trim();
            const selectedChapter = this.chapterSelect.value;
            if (name.length > 0) {
                this.playerName = name;
                this.startGame(selectedChapter);
            }
        });
    }

    // 顯示載入動畫
    async showLoadingAnimation() {
        const duration = 2000; // 動畫持續2秒
        const steps = 50; // 更新50次
        const interval = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = (i / steps) * 100;
            this.loadingScreen.querySelector('.progress-fill').style.width = `${progress}%`;
            this.loadingScreen.querySelector('.loading-percentage').textContent = `${Math.round(progress)}%`;
            await this.sleep(interval);
        }

        // 載入完成後顯示初始畫面
        this.loadingScreen.style.opacity = '0';
        await this.sleep(500);
        this.loadingScreen.style.display = 'none';
        this.showTitleScreen();
    }

    // 顯示初始畫面
    showTitleScreen() {
        this.titleScreen.classList.remove('hidden');
    }

    // 開始遊戲
    async startGame(chapter) {
        this.titleScreen.classList.add('hidden');
        
        // 根據選擇的章節開始遊戲
        if (chapter === 'chapter1') {
            window.startChapter1();
        } else if (chapter === 'chapter2') {
            window.startChapter2();
        } else if (chapter === 'chapter3') {
            window.startChapter3();
        } else if (chapter === 'chapter4') {
            window.startChapter4();
        } else if (chapter === 'chapter5') {
            window.startChapter5();
        }
    }

    // 顯示對話
    async showDialogue(text, speaker = '') {
        this.isDialogueComplete = false;
        this.isTyping = true;
        
        this.dialogueBox.style.display = 'block';
        this.dialogueBox.classList.remove('hidden');
        
        this.characterName.textContent = speaker;
        this.dialogueText.textContent = '';

        let speakerClass = 'speaker-other';
        if (speaker === '主角') speakerClass = 'speaker-main';
        else if (speaker === '沈凌琛') speakerClass = 'speaker-shen';
        else if (speaker === '李曜辰') speakerClass = 'speaker-shen';
        else if (speaker === '內心獨白') speakerClass = 'speaker-inner';
        
        this.characterName.className = speakerClass;
        this.addToHistory(text, speaker);

        if (this.isFastForward) {
            // 快轉模式：直接顯示文字
            this.dialogueText.textContent = text;
            this.isTyping = false;
            this.isDialogueComplete = true;
            return;
        }

        // 正常模式：逐字顯示
        for (let i = 0; i < text.length && this.isTyping; i++) {
            this.dialogueText.textContent += text[i];
            await this.sleep(this.textSpeed);
        }

        this.dialogueText.textContent = text;
        this.isTyping = false;
        this.isDialogueComplete = true;
    }

    // 顯示角色
    showCharacter(characterId, position = 'center') {
        console.log(`嘗試載入角色: ${characterId}, 位置: ${position}`);
        
        const character = document.createElement('div');
        character.className = `character ${position}`;
        const characterLayer = this.characterLayer; // 保存引用
        
        // 構建圖片路徑
        const imagePath = `assets/characters/${characterId}.png`;
        
        // 先測試圖片是否存在
        const img = new Image();
        img.onload = () => {
            console.log(`成功載入角色圖片: ${imagePath}`);
            character.style.backgroundImage = `url(${imagePath})`;
            characterLayer.appendChild(character);
            setTimeout(() => {
                character.classList.add('visible');
            }, 50);
        };
        
        img.onerror = () => {
            console.error(`無法載入角色圖片: ${imagePath}`);
            // 嘗試其他可能的檔案名稱
            const alternativePath = `assets/characters/${characterId}立繪.png`;
            const altImg = new Image();
            altImg.onload = () => {
                console.log(`成功載入替代圖片: ${alternativePath}`);
                character.style.backgroundImage = `url(${alternativePath})`;
                characterLayer.appendChild(character);
                setTimeout(() => {
                    character.classList.add('visible');
                }, 50);
            };
            altImg.onerror = () => {
                console.error(`所有嘗試都失敗: ${characterId}`);
                console.error('已嘗試的路徑:', imagePath, alternativePath);
            };
            altImg.src = alternativePath;
        };
        
        img.src = imagePath;
    }

    // 切換背景
    changeBackground(backgroundPath) {
        this.backgroundLayer.style.backgroundImage = `url(${backgroundPath})`;
    }

    // 播放背景音樂
    playBGM(musicPath) {
        // 如果是同一首BGM，不要重新播放
        if (this.currentBGM === musicPath) {
            return;
        }

        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }

        this.currentBGM = musicPath;
        this.bgm = new Audio(musicPath);
        this.bgm.loop = true;
        this.bgm.volume = this.isMuted ? 0 : 1;
        
        // 添加錯誤處理
        this.bgm.play().catch(error => {
            console.error('BGM播放失敗:', error);
            this.bgm = null;
            this.currentBGM = '';
        });
    }

    // 播放轉場動畫
    async playTransition(videoPath) {
        this.isPlayingVideo = true;
        
        // 隱藏控制按鈕
        const buttons = document.getElementById('control-buttons');
        buttons.style.display = 'none';

        const video = document.getElementById('transition-video');
        const transitionLayer = document.getElementById('transition-layer');
        
        // 設置視頻
        video.src = videoPath;
        transitionLayer.style.display = 'block';
        
        // 播放視頻
        try {
            await video.play();
            
            // 監聽視頻結束
            video.onended = () => {
                transitionLayer.style.display = 'none';
                video.src = '';
                buttons.style.display = 'flex';
                this.isPlayingVideo = false;
            };
        } catch (error) {
            console.error('視頻播放失敗:', error);
            transitionLayer.style.display = 'none';
            buttons.style.display = 'flex';
            this.isPlayingVideo = false;
        }
    }

    // 更新場景
    async updateScene(scene) {
        this.isProcessingScene = true;
        
        // 檢查是否需要播放章節動畫
        if (scene.dialogue === "四天後，早上的教室內。") {
            await this.playTransition('assets/video/1-2.mp4');
        } else if (scene.dialogue === "中午，學務處。") {
            await this.playTransition('assets/video/1-3.mp4');
        }else if (scene.dialogue === "第一章 終") {
            await this.playTransition('assets/video/1-4.mp4');
        }else if (scene.dialogue === "距離那場比賽已經半個月了。") {
            await this.playTransition('assets/video/2-1.mp4');
        }else if (scene.dialogue === "幾天後，放學時間。") {
            await this.playTransition('assets/video/2-2.mp4');
        }else if (scene.dialogue === "那就來組隊吧...籃球場上有好多人啊。") {
            await this.playTransition('assets/video/2-3.mp4');
        }else if (scene.dialogue === "十一月二十二日，放學。") {
            await this.playTransition('assets/video/3-1.mp4');
        }else if (scene.dialogue === "這就是要我們一起打球的人！") {
            await this.playTransition('assets/video/3-2.mp4');
        }else if (scene.dialogue === "上週已經打了好幾天球，今天就把時間拿來讀書吧。") {
            await this.playTransition('assets/video/3-3.mp4');
        }else if (scene.dialogue === "隨著時間推移，你似乎已經沒那麼麼在意了。") {
            await this.playTransition('assets/video/4-1.mp4');
        }else if (scene.dialogue === "你掃了一眼，就看到多日未見的沈凌琛。") {
            await this.playTransition('assets/video/4-2.mp4');
        }else if (scene.dialogue === "早晨的太陽曬得刺眼。雖然嘴上說著只是陪打，但內心還是有點小期待的——") {
            await this.playTransition('assets/video/4-3.mp4');
        }else if (scene.dialogue === "練習後，你拿著水壺，準備要回教室。") {
            await this.playTransition('assets/video/4-4.mp4');
        }else if (scene.dialogue === "星期四，放學。") {
            await this.playTransition('assets/video/5-1.mp4');
        }else if (scene.dialogue === "星期五。") {
            await this.playTransition('assets/video/6-1.mp4');
        }else if (scene.dialogue === "回去的路上，經過圖書館時，看到沈凌琛也在。他專心的看著書，沒注意到你。") {
            await this.playTransition('assets/video/6-2.mp4');
        }else if (scene.dialogue === "假日時，雖然已經加了沈凌琛的LINE，但還是找不到一個適當的理由去開話題。怕對方覺得自己煩。") {
            await this.playTransition('assets/video/7-1.mp4');
        }
        
        // 更新背景
        if (scene.background) {
            this.changeBackground(scene.background);
        }

        // 更新角色
        // 比較當前場景和新場景的角色是否相同
        const currentCharacters = Array.from(this.characterLayer.children).map(char => 
            char.style.backgroundImage.match(/characters\/(.+?)\./)[1]);
        const newCharacters = scene.characters || [];
        
        // 只有當角色發生變化時才更新
        if (JSON.stringify(currentCharacters) !== JSON.stringify(newCharacters)) {
            this.characterLayer.innerHTML = '';
            if (newCharacters.length > 0) {
                newCharacters.forEach((char, index) => {
                    const position = newCharacters.length === 1 ? 'center' : 
                                   index === 0 ? 'left' : 'right';
                    this.showCharacter(char, position);
                });
            }
        }

        // 檢查是否需要切換音樂
        this.checkAndUpdateBGM(scene);

        // 顯示對話
        if (scene.dialogue) {
            await this.showDialogue(scene.dialogue, scene.speaker);
        }

        this.isProcessingScene = false;
    }

    // 檢查並更新背景音樂
    checkAndUpdateBGM(scene) {
        // 根據場景內容決定播放的音樂
        let targetBGM = 'assets/audio/敘事.mp3'; // 預設音樂

        if (scene.dialogue && scene.dialogue.includes("四天後，早上的教室內。")) {
            targetBGM = 'assets/audio/輕快.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("中午，學務處。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("我的思緒漸趨模糊。")) {
            targetBGM = 'assets/audio/傷心.mp3';   
        } else if (scene.dialogue && scene.dialogue.includes("球，出乎意料的又從沈凌琛手中傳來了。")) {
            targetBGM = 'assets/audio/沉靜2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("十一月二十二日，放學。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        }
        // 如果當前音樂與目標音樂不同，則切換
        if (this.currentBGM !== targetBGM) {
            this.playBGM(targetBGM);
        }
    }

    // 切換歷史記錄面板
    toggleHistory() {
        const isVisible = this.dialogueHistory.style.display === 'block';
        this.dialogueHistory.style.display = isVisible ? 'none' : 'block';
        this.btnHistory.classList.toggle('active');
    }

    // 添加對話到歷史記錄
    addToHistory(text, speaker) {
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        
        if (speaker) {
            const speakerDiv = document.createElement('div');
            speakerDiv.className = 'history-speaker';
            speakerDiv.textContent = speaker;
            entry.appendChild(speakerDiv);
        }

        const textDiv = document.createElement('div');
        textDiv.textContent = text;
        entry.appendChild(textDiv);

        this.dialogueHistory.appendChild(entry);
        this.dialogueHistoryList.push({ text, speaker });
    }

    // 重置遊戲
    resetGame() {
        window.location.reload();
    }

    // 工具函數：睡眠
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 切換靜音
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgm) {
            this.bgm.volume = this.isMuted ? 0 : 1;
        }
        this.btnMute.classList.toggle('active');
    }

    // 綁定事件
    bindEvents() {
        // 對話框點擊事件
        this.dialogueBox.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            if (this.isPlayingVideo) return;

            if (this.isTyping) {
                // 如果正在打字，完成當前文字
                this.isTyping = false;
                if (window.currentChapter && window.currentSceneIndex >= 0) {
                    this.dialogueText.textContent = window.currentChapter.scenes[window.currentSceneIndex].dialogue;
                }
                this.isDialogueComplete = true;
                return;
            }
            
            if (!this.isProcessingScene) {
                window.nextScene();
            }
        });

        // 快轉按鈕
        this.btnFastForward.addEventListener('click', () => {
            this.isFastForward = !this.isFastForward;
            this.btnFastForward.classList.toggle('active');
            
            if (this.isFastForward) {
                // 開啟快轉時，每0.3秒自動播放下一句
                const fastForward = () => {
                    if (this.isFastForward && !this.isProcessingScene && !this.isPlayingVideo) {
                        window.nextScene();
                    }
                    if (this.isFastForward) {
                        setTimeout(fastForward, this.fastForwardDelay);
                    }
                };
                fastForward();
            }
        });

        // 跳過按鈕
        this.btnSkip.addEventListener('click', () => {
            if (!this.isProcessingScene && !this.isPlayingVideo) {
                window.skipChapter();
            }
        });

        // 靜音按鈕
        this.btnMute.addEventListener('click', () => {
            this.toggleMute();
        });

        // 歷史記錄按鈕
        this.btnHistory.addEventListener('click', () => {
            this.toggleHistory();
        });

        // 主選單按鈕
        this.btnHome.addEventListener('click', () => {
            if (confirm('確定要返回主選單嗎？')) {
                this.resetGame();
            }
        });
    }
}

// 創建遊戲實例
const game = new GameCore();

// 導出遊戲實例供其他模組使用
window.gameCore = game;
