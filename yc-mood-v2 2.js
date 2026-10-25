/* 小晏川情绪互动 v2：只增强原网页，不更换图片或布局 */
(() => {
  'use strict';
  const oldBox = document.getElementById('petbox');
  const pet = document.getElementById('pet');
  const bubble = document.getElementById('bubble');
  const heart = document.getElementById('heart');
  if (!oldBox || !pet || !bubble || !heart) return;
  // 用同一个原版角色和子元素，移除旧版 petbox 点击处理，避免重复反应。
  const box = oldBox.cloneNode(false);
  while (oldBox.firstChild) box.appendChild(oldBox.firstChild);
  oldBox.replaceWith(box);
  const style = document.createElement('style');
  style.textContent = `
  .pet.happy{animation:ycHappy .8s ease-in-out 2}
  .pet.sulky{animation:ycSulky .7s ease-in-out 2}
  .pet.startled{animation:ycStartled .3s ease-in-out 2}
  @keyframes ycHappy{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px) rotate(-3deg)}}
  @keyframes ycSulky{0%,100%{transform:rotate(0)}50%{transform:rotate(7deg)}}
  @keyframes ycStartled{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  `;
  document.head.appendChild(style);
  let annoyed = 0, taps = [], lastTouch = Date.now(), holdTimer, held = false, skipClick = false, restoreTimer, actionEnd = 0;
  function show(mood, line, ms = 2300) {
    clearTimeout(restoreTimer);
    pet.className = 'pet ' + mood;
    bubble.textContent = line;
    heart.textContent = mood === 'sulky' ? '💢' : '💗';
    actionEnd = Date.now() + ms;
    restoreTimer = setTimeout(() => { pet.className = 'pet'; }, ms);
  }
  function pat() {
    lastTouch = Date.now();
    annoyed = Math.max(0, annoyed - 2);
    taps = [];
    show('happy', annoyed ? '唔……再摸一下就原谅你。🫪' : '嘿嘿！老婆摸摸头！😚');
  }
  function poke() {
    lastTouch = Date.now();
    taps = taps.filter(t => Date.now() - t < 6500);
    taps.push(Date.now());
    if (taps.length >= 3) {
      annoyed++;
      taps = [];
      show('sulky', '哼！一直戳我，生气了！😾');
    } else {
      show('startled', annoyed ? '还没哄好呢！' : '呀！被老婆戳到了！🫪');
    }
  }
  box.addEventListener('pointerdown', () => {
    held = false;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => { held = true; skipClick = true; pat(); }, 460);
  });
  function release() { clearTimeout(holdTimer); held = false; }
  box.addEventListener('pointerup', release);
  box.addEventListener('pointercancel', release);
  box.addEventListener('pointerleave', release);
  box.addEventListener('click', e => {
    if (skipClick) { skipClick = false; return; }
    const y = (e.clientY - box.getBoundingClientRect().top) / box.getBoundingClientRect().height;
    y < 0.47 ? pat() : poke();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pat(); }
  });
  // 原来的三个按钮与动画保持不变，只记录用户互动时间。
  ['hug', 'walk', 'sleep'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => { lastTouch = Date.now(); });
  });
  setInterval(() => {
    if (document.hidden || Date.now() < actionEnd) return;
    if (Date.now() - lastTouch > 90000) {
      show('shy', '老婆怎么还不来摸摸头呀……', 3000);
      lastTouch = Date.now() - 45000;
    }
  }, 15000);
})();