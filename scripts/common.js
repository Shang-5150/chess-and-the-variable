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
        this.werewolfRulePage = 1; // 添加狼人杀规则页码
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

        // 添加狼人杀规则按钮
        this.btnWerewolfRules = document.createElement('div');
        this.btnWerewolfRules.className = 'control-button';
        this.btnWerewolfRules.id = 'btn-werewolf-rules';
        this.btnWerewolfRules.title = '狼人殺規則';
        this.btnWerewolfRules.innerHTML = '🎮';
        this.btnWerewolfRules.style.display = 'none';
        document.getElementById('control-buttons').appendChild(this.btnWerewolfRules);

        // 添加规则显示层
        this.werewolfRulesLayer = document.createElement('div');
        this.werewolfRulesLayer.id = 'werewolf-rules-layer';
        this.werewolfRulesLayer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
            height: 80vh;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 15px;
            padding: 20px;
            display: none;
            z-index: 2000;
            color: white;
            text-align: center;
        `;
        document.body.appendChild(this.werewolfRulesLayer);
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
        } else if (chapter === 'chapter6') {
            window.startChapter6();
        } else if (chapter === 'chapter7') {
            window.startChapter7();
        } else if (chapter === 'chapter8') {
            window.startChapter8();
        } else if (chapter === 'chapter9') {
            window.startChapter9();
        } else if (chapter === 'chapter10') {
            window.startChapter10();
        } else if (chapter === 'chapter11') {
            window.startChapter11();
        } else if (chapter === 'chapter12') {
            window.startChapter12();
        } else if (chapter === 'chapter13') {
            window.startChapter13();
        } else if (chapter === 'chapter14') {
            window.startChapter14();
        } else if (chapter === 'chapter15') {
            window.startChapter15();
        }
    }

    // 顯示對話
    async showDialogue(text, speaker = '') {
        this.isDialogueComplete = false;
        this.isTyping = true;
        
        this.dialogueBox.style.display = 'block';
        this.dialogueBox.classList.remove('hidden');
        
        // 如果是主角的对话，使用玩家输入的名字
        if (speaker === '主角') {
            this.characterName.textContent = this.playerName;
        } else if (speaker === '7號（主角）') {
            this.characterName.textContent = '7號（' + this.playerName + '）';
        } else {
            this.characterName.textContent = speaker;
        }

        // 替换对话文本中的"主角"和"7號"为玩家名字
        let displayText = text;
        if (this.playerName) {
            displayText = text.replace(/主角|7號/g, this.playerName);
        }
        this.dialogueText.textContent = '';

        let speakerClass = 'speaker-other';
        if (speaker === '主角' || speaker === '7號') speakerClass = 'speaker-main';
        else if (speaker === '沈凌琛') speakerClass = 'speaker-shen';
        else if (speaker === '李曜辰') speakerClass = 'speaker-lee';
        else if (speaker === '內心獨白') speakerClass = 'speaker-inner';
        
        this.characterName.className = speakerClass;
        this.addToHistory(displayText, (speaker === '主角' || speaker === '7號') ? this.playerName : speaker);

        if (this.isFastForward) {
            // 快轉模式：直接顯示文字
            this.dialogueText.textContent = displayText;
            this.isTyping = false;
            this.isDialogueComplete = true;
            return;
        }

        // 正常模式：逐字顯示
        for (let i = 0; i < displayText.length && this.isTyping; i++) {
            this.dialogueText.textContent += displayText[i];
            await this.sleep(this.textSpeed);
        }

        this.dialogueText.textContent = displayText;
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
    async playBGM(musicPath) {
        // 如果是同一首BGM，不要重新播放
        if (this.currentBGM === musicPath) {
            return;
        }

        // 淡出当前音乐
        if (this.bgm) {
            await this.fadeOut(this.bgm);
            this.bgm.pause();
            this.bgm = null;
        }

        this.currentBGM = musicPath;
        this.bgm = new Audio(musicPath);
        this.bgm.loop = true;
        this.bgm.volume = 0; // 初始音量为0
        this.bgm.volume = this.isMuted ? 0 : 1;
        
        // 添加錯誤處理
        try {
            await this.bgm.play();
            // 淡入新音乐
            await this.fadeIn(this.bgm);
        } catch (error) {
            console.error('BGM播放失敗:', error);
            this.bgm = null;
            this.currentBGM = '';
        }
    }

    // 淡出效果
    async fadeOut(audio) {
        const fadeOutDuration = 1000; // 1秒淡出
        const steps = 20; // 20步完成淡出
        const stepDuration = fadeOutDuration / steps;
        const volumeStep = audio.volume / steps;

        for (let i = 0; i < steps; i++) {
            audio.volume = Math.max(0, audio.volume - volumeStep);
            await this.sleep(stepDuration);
        }
        audio.volume = 0;
    }

    // 淡入效果
    async fadeIn(audio) {
        const fadeInDuration = 1000; // 1秒淡入
        const steps = 20; // 20步完成淡入
        const stepDuration = fadeInDuration / steps;
        const targetVolume = this.isMuted ? 0 : 1;
        const volumeStep = targetVolume / steps;

        audio.volume = 0;
        for (let i = 0; i < steps; i++) {
            audio.volume = Math.min(targetVolume, audio.volume + volumeStep);
            await this.sleep(stepDuration);
        }
        audio.volume = targetVolume;
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
        
        // 檢查是否需要顯示或隱藏狼人殺規則按鈕
        if (scene.dialogue && scene.dialogue.includes("說真的，我根本不在意這場狼人殺遊戲的輸贏。")) {
            this.btnWerewolfRules.style.display = 'flex';
        } else if (scene.dialogue && scene.dialogue.includes("遊戲結束，狼人勝利。")) {
            this.btnWerewolfRules.style.display = 'none';
            this.hideWerewolfRules();
        }

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
        }else if (scene.dialogue === "早晨的太陽曬得刺眼，站在場邊等開賽。雖然嘴上說著只是陪打，但內心還是有點小期待的——") {
            await this.playTransition('assets/video/4-3.mp4');
        }else if (scene.dialogue === "練習後，你拿著水壺，準備要回教室。") {
            await this.playTransition('assets/video/4-4.mp4');
        }else if (scene.dialogue === "星期四，放學。") {
            await this.playTransition('assets/video/5-1.mp4');
        }else if (scene.dialogue === "星期五。") {
            await this.playTransition('assets/video/6-1.mp4');
        }else if (scene.dialogue === "好巧，你也在這？") {
            await this.playTransition('assets/video/6-2.mp4');
        }else if (scene.dialogue === "假日時，雖然已經加了沈凌琛的LINE，但還是找不到一個適當的理由去開話題。怕對方覺得自己煩。") {
            await this.playTransition('assets/video/7-1.mp4');
        }else if (scene.dialogue === "十二月十三日，星期五。") {
            await this.playTransition('assets/video/7-2.mp4');
        }else if (scene.dialogue === "你在數學題與時間的拉鋸戰中奮戰了二十多分鐘，終於忍不住撐著頭，往沈凌琛那邊靠過去一點，輕聲開口。") {
            await this.playTransition('assets/video/7-3.mp4');
        }else if (scene.dialogue === "今天是聖誕節，校園裡氣氛比平常輕鬆熱鬧了些。") {
            await this.playTransition('assets/video/8-1.mp4');
        }else if (scene.dialogue === "冬天的傍晚天黑得快，走到學校後門時天色已經轉灰。路燈剛亮起，橘黃色的光灑在兩人身上，像在替這場談話預留一點柔和的舞台。") {
            await this.playTransition('assets/video/8-2.mp4');
        }else if (scene.dialogue === "中午下課後，你剛結束練舞，滿身是汗，耳邊還殘留著音樂節拍的餘震。懶洋洋地踱步到合作社，想買瓶水再順便找點甜的補補元氣。") {
            await this.playTransition('assets/video/8-3.mp4');
        }else if (scene.dialogue === "你發訊息說想去圖書館，原本沒預期他會那麼快回，卻突然跳出了一個……貼圖。") {
            await this.playTransition('assets/video/9-1.mp4');
        }else if (scene.dialogue === "你一早踏進操場邊的集合區時，整個空地已經劃分出兩端的區域，中間拉起紅白繩界線，明確標示出120公尺的距離。喬珮昕還一邊喝著溫熱的紅豆湯圓，一邊看著活動說明書。") {
            await this.playTransition('assets/video/9-2.mp4');
        }else if (scene.dialogue === "你提早到了圖書館。") {
            await this.playTransition('assets/video/9-3.mp4');
        }else if (scene.dialogue === "你剛走出校門，一邊回訊息、一邊計劃晚上哪一段複習進度要先看，腦袋被舞社表演和段考擠得幾乎快要炸開。冷風一吹，讓你打了個噴嚏，這才回神。") {
            await this.playTransition('assets/video/9-4.mp4');
        }else if (scene.dialogue === "時間一晃而過，轉眼就到了結業式。") {
            await this.playTransition('assets/video/10-1.mp4');
        }else if (scene.dialogue === "你躺在床上，燈沒開，手機螢幕是房裡唯一的光。") {
            await this.playTransition('assets/video/10-2.mp4');
        }else if (scene.dialogue === "下午三點十二分。") {
            await this.playTransition('assets/video/10-3.mp4');
        }else if (scene.dialogue === "訊息跳出來時，你正窩在沙發上看書。") {
            await this.playTransition('assets/video/10-4.mp4');
        }else if (scene.dialogue === "今天是農曆春節，你回了老家，但少見的感到有點空虛。") {
            await this.playTransition('assets/video/11-1.mp4');
        }else if (scene.dialogue === "你抵達圖書館時，沈凌琛已經坐在靠窗的位置，桌上擺著筆記本與參考書。") {
            await this.playTransition('assets/video/11-2.mp4');
        }else if (scene.dialogue === "你仰躺在床上，手機螢幕光芒映在臉上，嘴角還帶著難以抑制的微笑。") {
            await this.playTransition('assets/video/12-1.mp4');
        }else if (scene.dialogue === "你站在鏡子前，已經換了第三套衣服。") {
            await this.playTransition('assets/video/12-2.mp4');
        }else if (scene.dialogue === "下學期的開學第三天，熱鬧的校園生活讓我懷念起寒假的悠閒。正當你在課堂上昏昏欲睡時，手機震動了一下。") {
            await this.playTransition('assets/video/12-3.mp4');
        }else if (scene.dialogue === "第十二章 終") {
            await this.playTransition('assets/video/12-4.mp4');
        }else if (scene.dialogue === "在那之後，又過了幾天。") {
            await this.playTransition('assets/video/13-1.mp4');
        }else if (scene.dialogue === "校慶當天的校園熱鬧非凡，彩旗飄揚，歡笑聲此起彼落。") {
            await this.playTransition('assets/video/13-2.mp4');
        }else if (scene.dialogue === "這道題你會做嗎？") {
            await this.playTransition('assets/video/14-1.mp4');
        }else if (scene.dialogue === "你如往常留下來打籃球。這是近來難得的放鬆時刻，陽光正好，微風徐徐。") {
            await this.playTransition('assets/video/14-2.mp4');
        }else if (scene.dialogue === "春末的微風裡已有了幾分暑氣，讓人不得不尋找一處避暑的天地。") {
            await this.playTransition('assets/video/14-3.mp4');
        }else if (scene.dialogue === "說真的，我根本不在意這場狼人殺遊戲的輸贏。") {
            await this.playTransition('assets/video/14-4.mp4');
        }else if (scene.dialogue === "那家店，和他來過幾次呢。") {
            await this.playTransition('assets/video/15-1.mp4');
        }else if (scene.dialogue === "全文終。") {
            await this.playTransition('assets/video/15-2.mp4');
        }
        
        // 更新背景
        if (scene.background) {
            this.changeBackground(scene.background);
        }

        // 更新角色
        // 比較當前場景和新場景的角色是否相同
        const currentCharacters = Array.from(this.characterLayer.children).map(char => 
            char.style.backgroundImage.match(/characters\/(.+?)\./)[1]);
        const newCharacters = Array.isArray(scene.characters) ? scene.characters : 
                            Array.isArray(scene.character) ? scene.character : 
                            scene.character ? [scene.character] : [];
        
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
        let targetBGM = this.currentBGM; // 保持當前音樂，除非有特殊情況

        if (scene.dialogue && scene.dialogue.includes("現在是2024年的10月10日，距離大學入學考還剩下400多天左右。")) {
            targetBGM = 'assets/audio/敘事.mp3'; // 第一章
        } else if (scene.dialogue && scene.dialogue.includes("四天後，早上的教室內。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("中午，學務處。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("第一章 終")) {
            targetBGM = 'assets/audio/積極.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("距離那場比賽已經半個月了。")) {
            targetBGM = 'assets/audio/向心.mp3'; // 第二章
        } else if (scene.dialogue && scene.dialogue.includes("幾天後，放學時間。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("五分鐘後。")) {
            targetBGM = 'assets/audio/緊張.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("我的思緒漸趨模糊。")) {
            targetBGM = 'assets/audio/幻想2.mp3';   
        } else if (scene.dialogue && scene.dialogue.includes("頓時，我的腎上腺素爆發。")) {
            targetBGM = 'assets/audio/幻想.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("球，出乎意料的又從沈凌琛手中傳來了。")) {
            targetBGM = 'assets/audio/積極2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("隔週，星期四放學。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("十一月二十二日，放學。")) {
            targetBGM = 'assets/audio/敘事.mp3'; // 第三章
        } else if (scene.dialogue && scene.dialogue.includes("這就是要我們一起打球的人！")) {
            targetBGM = 'assets/audio/向心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("上週已經打了好幾天球，今天就把時間拿來讀書吧。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("隨著時間推移，你似乎已經沒那麼麼在意了。")) {
            targetBGM = 'assets/audio/輕快2.mp3'; // 第四章
        } else if (scene.dialogue && scene.dialogue.includes("回家的路上，風有點涼，你踩著夕陽餘暉投下的長影，一邊走，一邊回想起剛剛的比賽。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("早晨的太陽曬得刺眼，站在場邊等開賽。雖然嘴上說著只是陪打，但內心還是有點小期待的——")) {
            targetBGM = 'assets/audio/沉靜2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("練習後，你拿著水壺，準備要回教室。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("星期四，放學。")) {
            targetBGM = 'assets/audio/輕快.mp3'; // 第五章
        } else if (scene.dialogue && scene.dialogue.includes("你回到家後，打開李曜辰的IG，尋找沈凌琛的相關消息。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("星期五。")) {
            targetBGM = 'assets/audio/輕快2.mp3'; // 第六章
        } else if (scene.dialogue && scene.dialogue.includes("回去的路上，經過圖書館時，看到沈凌琛也在。他專心的看著書，沒注意到你。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("回到教室後，這堂是物理課。")) {
            targetBGM = 'assets/audio/心動.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("假日時，雖然已經加了沈凌琛的LINE，但還是找不到一個適當的理由去開話題。怕對方覺得自己煩。")) {
            targetBGM = 'assets/audio/敘事.mp3'; // 第七章
        } else if (scene.dialogue && scene.dialogue.includes("放學時間")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("放學後。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("回家後。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("十二月十三日，星期五。")) {
            targetBGM = 'assets/audio/積極2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你在數學題與時間的拉鋸戰中奮戰了二十多分鐘，終於忍不住撐著頭，往沈凌琛那邊靠過去一點，輕聲開口。")) {
            targetBGM = 'assets/audio/幻想.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("星期三放學，你照樣到圖書館，懷著些許期待。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("晚上回到家，你洗完澡坐在書桌前，腦袋裡卻還在回味那本整齊得像參考書的英文筆記。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("今天是聖誕節，校園裡氣氛比平常輕鬆熱鬧了些。")) {
            targetBGM = 'assets/audio/向心2.mp3'; // 第八章
        } else if (scene.dialogue && scene.dialogue.includes("圖書館的暖氣運轉著，玻璃窗外是冷颼颼的冬日陽光，斜斜灑在木桌上。")) {
            targetBGM = 'assets/audio/向心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("手機震了一下，螢幕亮了起來。你低頭一看，是喬珮昕的訊息。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("冬天的傍晚天黑得快，走到學校後門時天色已經轉灰。路燈剛亮起，橘黃色的光灑在兩人身上，像在替這場談話預留一點柔和的舞台。")) {
            targetBGM = 'assets/audio/傷心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("兩人對視一眼，笑聲終於冒出來，像剛剛那一整段壓抑終於找到了一個洞可以透氣。")) {
            targetBGM = 'assets/audio/沉靜2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("中午下課後，你剛結束練舞，滿身是汗，耳邊還殘留著音樂節拍的餘震。懶洋洋地踱步到合作社，想買瓶水再順便找點甜的補補元氣。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你正出神著，李曜辰忽然歪過頭問。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你發訊息說想去圖書館，原本沒預期他會那麼快回，卻突然跳出了一個……貼圖。")) {
            targetBGM = 'assets/audio/敘事.mp3'; //第九章
        } else if (scene.dialogue && scene.dialogue.includes("你一早踏進操場邊的集合區時，整個空地已經劃分出兩端的區域，中間拉起紅白繩界線，明確標示出120公尺的距離。喬珮昕還一邊喝著溫熱的紅豆湯圓，一邊看著活動說明書。")) {
            targetBGM = 'assets/audio/輕快.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("測試開始。")) {
            targetBGM = 'assets/audio/緊張.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("恭喜！第二組提前完成任務，成功拆除所有炸彈！")) {
            targetBGM = 'assets/audio/積極2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你提早到了圖書館。")) {
            targetBGM = 'assets/audio/向心2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("其實我本來預設是等到時間結束，拿六十分。但池景祐的想法我理解……然後我聯想到籃球，就選擇了剪線。")) {
            targetBGM = 'assets/audio/心動.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("隔天。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("情感在此刻倏忽爆發，幾乎要主宰你的心。")) {
            targetBGM = 'assets/audio/幻想2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你剛走出校門，一邊回訊息、一邊計劃晚上哪一段複習進度要先看，腦袋被舞社表演和段考擠得幾乎快要炸開。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("時間一晃而過，轉眼就到了結業式。")) {
            targetBGM = 'assets/audio/向心.mp3'; //第十章
        } else if (scene.dialogue && scene.dialogue.includes("前奏響起。")) {
            targetBGM = 'assets/audio/緊張.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("燈光定格的瞬間，掌聲雷動。")) {
            targetBGM = 'assets/audio/積極2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你躺在床上，燈沒開，手機螢幕是房裡唯一的光。")) {
            targetBGM = 'assets/audio/沉靜2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("再也沒有下一次了。")) {
            targetBGM = 'assets/audio/傷心2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("大約隔了五分鐘，螢幕突然震了一下。")) {
            targetBGM = 'assets/audio/向心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("下午三點十二分。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("星期六中午。")) {
            targetBGM = 'assets/audio/輕快.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("星期日午後陽光不烈，城市邊角那家咖啡廳被藏在幽靜巷弄裡，空間挑高，裡頭播著緩慢的爵士樂。")) {
            targetBGM = 'assets/audio/爵士.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("聽完這句話，他原本的戒備微微鬆弛，眼中閃過一絲意外的柔和。沈凌琛沉默片刻。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("訊息跳出來時，你正窩在沙發上看書。")) {
            targetBGM = 'assets/audio/輕快.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("時間不早了，我先去睡覺。你也早點睡。")) {
            targetBGM = 'assets/audio/心動.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("今天是農曆春節，你回了老家，但少見的感到有點空虛。")) {
            targetBGM = 'assets/audio/敘事.mp3'; //第十一章
        } else if (scene.dialogue && scene.dialogue.includes("要不要繼續前幾天的話題？")) {
            targetBGM = 'assets/audio/向心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("兩天後。")) {
            targetBGM = 'assets/audio/輕快2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你抵達圖書館時，沈凌琛已經坐在靠窗的位置，桌上擺著筆記本與參考書。")) {
            targetBGM = 'assets/audio/幻想2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("一推開門，你卻愣住了——裡頭竟然是狗狗主題咖啡廳，幾隻乖巧的小型犬在座位區活動，空間裡飄著咖啡香與輕音樂。溫暖的光線灑落在木質地板上，營造出柔和的氛圍。")) {
            targetBGM = 'assets/audio/心動.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你仰躺在床上，手機螢幕光芒映在臉上，嘴角還帶著難以抑制的微笑。")) {
            targetBGM = 'assets/audio/幻想.mp3'; //第十二章
        } else if (scene.dialogue && scene.dialogue.includes("你站在鏡子前，已經換了第三套衣服。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("或許無意識的行為更能表達我自己呢。")) {
            targetBGM = 'assets/audio/向心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("下學期的開學第三天，熱鬧的校園生活讓我懷念起寒假的悠閒。正當你在課堂上昏昏欲睡時，手機震動了一下。")) {
            targetBGM = 'assets/audio/敘事.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("第十二章 終")) {
            targetBGM = 'assets/audio/積極.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("在那之後，又過了幾天。")) {
            targetBGM = 'assets/audio/輕快2.mp3'; //第十三章
        } else if (scene.dialogue && scene.dialogue.includes("校慶當天的校園熱鬧非凡，彩旗飄揚，歡笑聲此起彼落。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("遊戲結束時，沈凌琛站在原地，神情一如往常地冷靜，眼神卻沒再看向他人。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("這道題你會做嗎？")) {
            targetBGM = 'assets/audio/幻想2.mp3'; //第十四章
        } else if (scene.dialogue && scene.dialogue.includes("你如往常留下來打籃球。這是近來難得的放鬆時刻，陽光正好，微風徐徐。")) {
            targetBGM = 'assets/audio/輕快.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你們一來一往，配合默契。在一次防守時，你冷不防被對手撞到，失去平衡向後倒去。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("春末的微風裡已有了幾分暑氣，讓人不得不尋找一處避暑的天地。")) {
            targetBGM = 'assets/audio/沉靜2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("順其自然吧，反正最後都會融化。")) {
            targetBGM = 'assets/audio/傷心2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("就在這時，一個熟悉的聲音從身旁傳來。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("說真的，我根本不在意這場狼人殺遊戲的輸贏。")) {
            targetBGM = 'assets/audio/幻想2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("遊戲開始。")) {
            targetBGM = 'assets/audio/幻想.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("嗯，似乎該做正事了呢。")) {
            targetBGM = 'assets/audio/緊張.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("然而，他表情沒什麼異動，彷彿沒發現你剛才那刻意的錯誤。")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("好了，換沈凌琛發言了。")) {
            targetBGM = 'assets/audio/緊張.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("他真的沒發現我的暗示嗎...？")) {
            targetBGM = 'assets/audio/沉靜1.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("遊戲結束，狼人勝利。")) {
            targetBGM = 'assets/audio/傷心.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("那家店，和他來過幾次呢。")) {
            targetBGM = 'assets/audio/傷心.mp3'; //第十五章
        } else if (scene.dialogue && scene.dialogue.includes("然而，這次他竟然主動拉緊你的手。")) {
            targetBGM = 'assets/audio/沉靜2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("隨後小聲低喃：確實呢。")) {
            targetBGM = 'assets/audio/心動2.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("你願意，跟我在一起嗎？")) {
            targetBGM = 'assets/audio/心動.mp3';
        } else if (scene.dialogue && scene.dialogue.includes("全文終。")) {
            targetBGM = 'assets/audio/積極.mp3';
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
    async toggleMute() {
        this.isMuted = !this.isMuted;
        this.btnMute.classList.toggle('active');
        
        if (this.bgm) {
            if (this.isMuted) {
                this.bgm.volume = 0;
            } else {
                this.bgm.volume = 1;
            }
        }
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

        // 添加狼人杀规则按钮事件
        this.btnWerewolfRules.addEventListener('click', () => {
            this.werewolfRulePage = 1;
            this.showWerewolfRules();
        });
    }

    // 显示狼人杀规则
    showWerewolfRules() {
        this.werewolfRulesLayer.style.display = 'block';
        this.werewolfRulesLayer.innerHTML = `
            <img src="assets/天黑請閉眼_${this.werewolfRulePage}.jpg" style="max-width: 100%; max-height: 90%; object-fit: contain;">
            <div style="margin-top: 10px;">
                <button onclick="gameCore.nextWerewolfRulePage()" style="padding: 5px 15px; margin: 0 5px;">${this.werewolfRulePage === 1 ? '下一頁' : '上一頁'}</button>
                <button onclick="gameCore.hideWerewolfRules()" style="padding: 5px 15px; margin: 0 5px;">關閉</button>
            </div>
        `;
    }

    // 切换规则页面
    nextWerewolfRulePage() {
        this.werewolfRulePage = this.werewolfRulePage === 1 ? 2 : 1;
        this.showWerewolfRules();
    }

    // 隐藏规则
    hideWerewolfRules() {
        this.werewolfRulesLayer.style.display = 'none';
    }
}

// 創建遊戲實例
const game = new GameCore();

// 導出遊戲實例供其他模組使用
window.gameCore = game;
