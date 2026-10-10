// Ask-Out Website Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE & CONFIGURATION
  // ==========================================
  const defaultState = {
    herName: 'Beautiful',
    myName: 'Me',
    phone: '',
    question: 'Will you go out with me?',
    subMessage: 'I promise great food, bad jokes, and the best time ever! 🍓✨',
    soundEnabled: true
  };

  // Load from URL params first, then localStorage, then default
  const urlParams = new URLSearchParams(window.location.search);
  const config = {
    herName: urlParams.get('name') || localStorage.getItem('askout_herName') || defaultState.herName,
    myName: urlParams.get('from') || localStorage.getItem('askout_myName') || defaultState.myName,
    phone: urlParams.get('phone') || localStorage.getItem('askout_phone') || defaultState.phone,
    question: urlParams.get('q') || localStorage.getItem('askout_question') || defaultState.question,
    subMessage: urlParams.get('sub') || localStorage.getItem('askout_subMessage') || defaultState.subMessage,
    soundEnabled: localStorage.getItem('askout_sound') !== 'false'
  };

  let dodgeCount = 0;
  let yesScale = 1;

  // Funny "No" button excuses
  const noPhrases = [
    "No 😢",
    "Are you sure? 🥺",
    "Think again! 🤔",
    "Wait, don't do this! 💔",
    "Error 404: No not found 🤖",
    "Nice try! 🏃💨",
    "Pretty please? 🥺👉👈",
    "You missed! 🎯",
    "Look over there -> YES!",
    "I think you meant YES 🥰",
    "Is that your final answer? 🧐",
    "Don't break my heart! 💔",
    "Wrong button! 🚨",
    "You can't catch me! 😜"
  ];

  // Cute mascot images for stages
  const mascotStages = [
    "https://media.tenor.com/efbquKzWqW8AAAAi/milk-and-mocha-bear-couple.gif", // Asking
    "https://media.tenor.com/FwK9784n700AAAAi/cute-bear.gif", // Pleading
    "https://media.tenor.com/uG_jF1DbgT4AAAAi/cry-sad.gif", // Sad/shocked
    "https://media.tenor.com/N2oDauP_TAgAAAAi/panda-love.gif" // Begging
  ];

  // Selected date preferences
  const datePlan = {
    activities: new Set(["Cute Coffee & Pastry Date ☕🥐"]),
    food: "Italian Pasta 🍝",
    day: "This Saturday",
    customTime: ""
  };

  // ==========================================
  // 2. DOM ELEMENTS
  // ==========================================
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const arena = document.getElementById('buttons-arena');
  const proposalCard = document.getElementById('proposal-card');
  const celebrationCard = document.getElementById('celebration-card');
  const mascotImg = document.getElementById('mascot-img');
  const dodgeHint = document.getElementById('dodge-hint');
  
  // Customization elements
  const greetingText = document.getElementById('greeting-text');
  const questionText = document.getElementById('question-text');
  const subMessage = document.getElementById('sub-message');
  const authorTag = document.getElementById('author-tag');
  
  // Modal & buttons
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const shareableLinkInput = document.getElementById('shareable-link-input');
  
  // Audio toggle
  const soundBtn = document.getElementById('sound-btn');
  const soundIndicator = document.getElementById('sound-indicator');
  
  // Date Planner
  const activitiesGroup = document.getElementById('activities-group');
  const foodGroup = document.getElementById('food-group');
  const dayGroup = document.getElementById('day-group');
  const customTimeInput = document.getElementById('custom-time-input');
  const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  // ==========================================
  // 3. SYNTHESIZED SOUND EFFECTS (Web Audio API)
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playDodgeSfx() {
    if (!config.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    // Funny boing sound
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    
    const now = audioCtx.currentTime;
    const startFreq = 220 + Math.random() * 80;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.5, now + 0.15);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  function playCelebrationSfx() {
    if (!config.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    // Sweet musical arpeggio (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      
      const startTime = audioCtx.currentTime + idx * 0.1;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  function playPopSfx() {
    if (!config.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // ==========================================
  // 4. APPLY INITIAL CONFIGURATION
  // ==========================================
  function applyConfig() {
    greetingText.innerHTML = `Hey <span class="recipient-name underline decoration-wavy decoration-pink-300 font-bold">${escapeHtml(config.herName)}</span> ✨`;
    questionText.textContent = config.question;
    subMessage.textContent = config.subMessage;
    authorTag.textContent = `For ${escapeHtml(config.herName)} • From ${escapeHtml(config.myName)}`;
    updateShareableLink();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  applyConfig();

  // ==========================================
  // 5. DODGING "NO" BUTTON LOGIC
  // ==========================================
  function dodgeNoButton(e) {
    if (e) e.preventDefault();
    dodgeCount++;
    playDodgeSfx();

    // Change phrase
    const phraseIndex = dodgeCount % noPhrases.length;
    noBtn.textContent = noPhrases[phraseIndex];

    // Change mascot image at certain dodge milestones
    if (dodgeCount === 2) mascotImg.src = mascotStages[1];
    if (dodgeCount === 4) mascotImg.src = mascotStages[2];
    if (dodgeCount === 6) mascotImg.src = mascotStages[3];

    // Show funny hint
    dodgeHint.style.opacity = '1';
    if (dodgeCount === 1) dodgeHint.textContent = "Hey! That button is disabled by the universe! 😉";
    else if (dodgeCount === 3) dodgeHint.textContent = "The 'Yes' button is looking awfully clickable right now... 👀";
    else if (dodgeCount >= 5) dodgeHint.textContent = "Nice reflexes, but destiny says YES! 💖";

    // Grow the YES button
    yesScale += 0.12;
    if (yesScale > 2.0) yesScale = 2.0;
    yesBtn.style.transform = `scale(${yesScale})`;

    // Calculate smart dodge position within the arena or viewport
    const arenaRect = arena.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Ensure it stays reachable and visible on screen
    const maxOffsetX = Math.min(140, window.innerWidth / 3);
    const maxOffsetY = 90;

    // Random offset, avoiding 0
    let randomX = (Math.random() - 0.5) * 2 * maxOffsetX;
    let randomY = (Math.random() - 0.5) * 2 * maxOffsetY;

    // Apply movement
    noBtn.style.position = 'relative';
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
  }

  // Support both mouse hover, touch/tap, and click
  noBtn.addEventListener('mouseenter', dodgeNoButton);
  noBtn.addEventListener('touchstart', dodgeNoButton, { passive: false });
  noBtn.addEventListener('click', dodgeNoButton);

  // ==========================================
  // 6. "YES" CELEBRATION LOGIC
  // ==========================================
  yesBtn.addEventListener('click', () => {
    initAudio();
    playCelebrationSfx();

    // Confetti explosion
    launchConfettiShower();

    // Transition between cards
    proposalCard.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
      proposalCard.classList.add('hidden');
      celebrationCard.classList.remove('hidden');
      
      // Trigger animation
      requestAnimationFrame(() => {
        celebrationCard.classList.remove('scale-95', 'opacity-0');
        celebrationCard.classList.add('scale-100', 'opacity-100');
      });
    }, 400);
  });

  function launchConfettiShower() {
    if (typeof confetti === 'function') {
      // Big initial burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd166', '#a2d2ff']
      });

      // Follow-up heart-like bursts
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 }
        });
      }, 350);
    }
  }

  // ==========================================
  // 7. DATE PLANNER INTERACTIVITY
  // ==========================================
  // Activities (Multi-select)
  activitiesGroup.querySelectorAll('.activity-opt').forEach((btn, idx) => {
    if (idx === 0) btn.classList.add('selected'); // default first one selected

    btn.addEventListener('click', () => {
      playPopSfx();
      const val = btn.dataset.value;
      if (datePlan.activities.has(val)) {
        if (datePlan.activities.size > 1) { // keep at least one
          datePlan.activities.delete(val);
          btn.classList.remove('selected');
        }
      } else {
        datePlan.activities.add(val);
        btn.classList.add('selected');
      }
    });
  });

  // Food Craving (Single-select)
  foodGroup.querySelectorAll('.food-opt').forEach((btn, idx) => {
    if (idx === 0) btn.classList.add('selected');

    btn.addEventListener('click', () => {
      playPopSfx();
      foodGroup.querySelectorAll('.food-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      datePlan.food = btn.dataset.value;
    });
  });

  // Day Option (Single-select)
  dayGroup.querySelectorAll('.day-opt').forEach((btn, idx) => {
    if (idx === 1) btn.classList.add('selected'); // Saturday default

    btn.addEventListener('click', () => {
      playPopSfx();
      dayGroup.querySelectorAll('.day-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      datePlan.day = btn.dataset.value;
    });
  });

  // ==========================================
  // 8. SEND VIA WHATSAPP & COPY SUMMARY
  // ==========================================
  function generateSummaryText() {
    const activitiesList = Array.from(datePlan.activities).join(', ');
    const customTime = customTimeInput.value.trim();
    const finalDay = customTime ? `${datePlan.day} (${customTime})` : datePlan.day;

    return `Hey ${config.myName}! 🥰 I said YES to our date!

✨ What we're doing: ${activitiesList}
🍽️ Food craving: ${datePlan.food}
🗓️ When: ${finalDay}

Can't wait! ❤️`;
  }

  sendWhatsAppBtn.addEventListener('click', () => {
    const text = generateSummaryText();
    let url = '';
    
    if (config.phone && config.phone.trim().length > 3) {
      const cleanPhone = config.phone.replace(/[^0-9]/g, '');
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    
    window.open(url, '_blank');
  });

  copySummaryBtn.addEventListener('click', () => {
    const text = generateSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      copyBtnText.textContent = "Copied to Clipboard! 🎉";
      copySummaryBtn.classList.add('bg-pink-300');
      setTimeout(() => {
        copyBtnText.textContent = "Copy Date Summary to Clipboard";
        copySummaryBtn.classList.remove('bg-pink-300');
      }, 2500);
    }).catch(() => {
      alert("Here is your date summary:\n\n" + text);
    });
  });

  // ==========================================
  // 9. SETTINGS MODAL & SHAREABLE LINK
  // ==========================================
  function updateShareableLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (config.herName && config.herName !== defaultState.herName) params.set('name', config.herName);
    if (config.myName && config.myName !== defaultState.myName) params.set('from', config.myName);
    if (config.phone) params.set('phone', config.phone);
    if (config.question && config.question !== defaultState.question) params.set('q', config.question);
    if (config.subMessage && config.subMessage !== defaultState.subMessage) params.set('sub', config.subMessage);

    const fullUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    shareableLinkInput.value = fullUrl;
  }

  settingsBtn.addEventListener('click', () => {
    document.getElementById('cfg-her-name').value = config.herName === defaultState.herName ? '' : config.herName;
    document.getElementById('cfg-my-name').value = config.myName === defaultState.myName ? '' : config.myName;
    document.getElementById('cfg-phone').value = config.phone;
    document.getElementById('cfg-question').value = config.question === defaultState.question ? '' : config.question;
    document.getElementById('cfg-sub').value = config.subMessage === defaultState.subMessage ? '' : config.subMessage;
    updateShareableLink();

    settingsModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      settingsModal.classList.remove('opacity-0');
      settingsModal.classList.add('opacity-100');
    });
  });

  function closeSettings() {
    settingsModal.classList.remove('opacity-100');
    settingsModal.classList.add('opacity-0');
    setTimeout(() => {
      settingsModal.classList.add('hidden');
    }, 300);
  }

  closeSettingsBtn.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  saveSettingsBtn.addEventListener('click', () => {
    const newHerName = document.getElementById('cfg-her-name').value.trim();
    const newMyName = document.getElementById('cfg-my-name').value.trim();
    const newPhone = document.getElementById('cfg-phone').value.trim();
    const newQuestion = document.getElementById('cfg-question').value.trim();
    const newSub = document.getElementById('cfg-sub').value.trim();

    config.herName = newHerName || defaultState.herName;
    config.myName = newMyName || defaultState.myName;
    config.phone = newPhone;
    config.question = newQuestion || defaultState.question;
    config.subMessage = newSub || defaultState.subMessage;

    localStorage.setItem('askout_herName', config.herName);
    localStorage.setItem('askout_myName', config.myName);
    localStorage.setItem('askout_phone', config.phone);
    localStorage.setItem('askout_question', config.question);
    localStorage.setItem('askout_subMessage', config.subMessage);

    applyConfig();
    closeSettings();
  });

  copyLinkBtn.addEventListener('click', () => {
    updateShareableLink();
    navigator.clipboard.writeText(shareableLinkInput.value).then(() => {
      copyLinkBtn.textContent = "Copied! ✨";
      setTimeout(() => {
        copyLinkBtn.textContent = "Copy Link";
      }, 2000);
    });
  });

  // Sound toggle
  soundBtn.addEventListener('click', () => {
    config.soundEnabled = !config.soundEnabled;
    localStorage.setItem('askout_sound', config.soundEnabled);
    soundBtn.textContent = config.soundEnabled ? '🔊' : '🔇';
    
    soundIndicator.textContent = config.soundEnabled ? 'Sound enabled! 🎵' : 'Sound muted 🔇';
    soundIndicator.style.opacity = '1';
    setTimeout(() => {
      soundIndicator.style.opacity = '0';
    }, 1500);

    if (config.soundEnabled) playPopSfx();
  });

  // ==========================================
  // 10. FLOATING HEARTS BACKGROUND (CANVAS)
  // ==========================================
  const canvas = document.getElementById('hearts-bg');
  const ctx = canvas.getContext('2d');
  let width, height;
  const hearts = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class FloatingHeart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.4 + 0.2;
      this.color = ['#f43f5e', '#fb7185', '#fda4af', '#f472b6'][Math.floor(Math.random() * 4)];
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.translate(this.x, this.y);

      // Draw SVG-like heart shape
      ctx.beginPath();
      const s = this.size / 15;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-10 * s, -10 * s, -20 * s, 5 * s, 0, 20 * s);
      ctx.bezierCurveTo(20 * s, 5 * s, 10 * s, -10 * s, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create 24 background hearts
  for (let i = 0; i < 24; i++) {
    hearts.push(new FloatingHeart());
  }

  function animateHearts() {
    ctx.clearRect(0, 0, width, height);
    for (let heart of hearts) {
      heart.update();
      heart.draw();
    }
    requestAnimationFrame(animateHearts);
  }
  animateHearts();
});
