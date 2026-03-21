"""Sprint G-B: BGM enhancement - low-pass filter + chip track fixes + VERSION"""
import re

# 1. Patch bgm.js - add low-pass filter + shop/ending chip tracks
with open('js/bgm.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1a. Add BiquadFilterNode after masterGain creation
old_init = "masterGain = actx.createGain(); masterGain.gain.value = _vol * 0.3; masterGain.connect(actx.destination);"
new_init = """masterGain = actx.createGain(); masterGain.gain.value = _vol * 0.3;
    lpFilter = actx.createBiquadFilter(); lpFilter.type = 'lowpass'; lpFilter.frequency.value = 20000;
    masterGain.connect(lpFilter); lpFilter.connect(actx.destination);"""
content = content.replace(old_init, new_init)

# 1b. Add lpFilter variable declaration
old_vars = "let actx = null, masterGain = null, melGain = null, bassGain = null;"
new_vars = "let actx = null, masterGain = null, melGain = null, bassGain = null, lpFilter = null;"
content = content.replace(old_vars, new_vars)

# 1c. Add setLowPass function before the return statement
old_return = "  return { play:play, stop:stop, fadeOut:fadeOut, setVolume:setVolume, getVolume:getVolume, setChipMode:setChipMode, isChipMode:isChipMode, resume:resume };"
new_return = """  function setLowPass(on) {
    if (!lpFilter) return;
    lpFilter.frequency.setTargetAtTime(on ? 400 : 20000, actx.currentTime, 0.3);
  }
  function isLowPass() { return lpFilter && lpFilter.frequency.value < 1000; }
  return { play:play, stop:stop, fadeOut:fadeOut, setVolume:setVolume, getVolume:getVolume, setChipMode:setChipMode, isChipMode:isChipMode, resume:resume, setLowPass:setLowPass, isLowPass:isLowPass };"""
content = content.replace(old_return, new_return)

# 1d. Add public wrapper functions after stopBGM
old_public_end = content.rstrip()
content += "\nfunction setLowPass(on) { ChipBGM.setLowPass(on); }\n"

# 1e. Add shop and ending to TRACKS (reuse village melody for shop, title for ending)
old_boss_track = "    boss:{mel:B_MEL,bas:B_BAS,bpm:108,mT:'sawtooth',bT:'square',mV:.10,bV:.08}"
new_boss_track = """    boss:{mel:B_MEL,bas:B_BAS,bpm:108,mT:'sawtooth',bT:'square',mV:.10,bV:.08},
    shop:{mel:T_MEL,bas:T_BAS,bpm:76,mT:'sine',bT:'triangle',mV:.10,bV:.07},
    ending:{mel:T_MEL,bas:T_BAS,bpm:56,mT:'sine',bT:'triangle',mV:.12,bV:.08},
    nest_boss:{mel:B_MEL,bas:B_BAS,bpm:120,mT:'sawtooth',bT:'square',mV:.11,bV:.09}"""
content = content.replace(old_boss_track, new_boss_track)

# 1f. Also apply low-pass to mp3Audio via Web Audio routing
# For mp3, we need to route through the filter too
# Add mp3Source node
old_start_mp3 = "  function startMp3(name, fadeIn) {"
new_start_mp3 = """  function startMp3(name, fadeIn) {
    if (mp3Source) { try { mp3Source.disconnect(); } catch(e) {} mp3Source = null; }"""
content = content.replace(old_start_mp3, new_start_mp3)

# Add mp3Source to variable declarations
content = content.replace(
    "let mp3Audio = null, mp3Fading = null;",
    "let mp3Audio = null, mp3Fading = null, mp3Source = null;"
)

# Route mp3 through AudioContext for filter support
old_mp3_play_no_fade = "} else { mp3Audio.volume = target; mp3Audio.play().catch(function(){}); }"
new_mp3_play = """} else { mp3Audio.volume = target; mp3Audio.play().catch(function(){}); }
    // Route through AudioContext for low-pass filter
    if (initCtx() && lpFilter) {
      try {
        mp3Source = actx.createMediaElementSource(mp3Audio);
        mp3Source.connect(lpFilter);
        mp3Audio.volume = 1.0; // Volume controlled by masterGain
        if (masterGain) masterGain.gain.value = _vol * 0.3;
      } catch(e) { /* fallback: direct playback without filter */ }
    }"""
content = content.replace(old_mp3_play_no_fade, new_mp3_play)

with open('js/bgm.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print(f'[OK] bgm.js patched ({len(content)} chars)')

# 2. Patch combat.js - add HP low-pass check
with open('js/combat.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add low-pass toggle at the end of player damage handling
# Find a good insertion point - after player HP reduction
if 'setLowPass' not in content:
    # Add at end of file as a periodic check called from update
    old_end = content.rstrip()
    content = old_end + """

// === HP Low-Pass Filter (Sprint G-B) ===
function checkHpLowPass() {
  if (typeof setLowPass !== 'function') return;
  var ratio = player.hp / player.maxHp;
  if (ratio <= 0.3 && gameState === 'playing') { setLowPass(true); }
  else { setLowPass(false); }
}
"""
    with open('js/combat.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('[OK] combat.js patched (checkHpLowPass added)')
else:
    print('[SKIP] combat.js already has setLowPass')

# 3. Patch update.js - call checkHpLowPass in main loop
with open('js/update.js', 'r', encoding='utf-8') as f:
    content = f.read()

if 'checkHpLowPass' not in content:
    # Insert after updateCombat call
    content = content.replace(
        'updateCombat(dt);',
        'updateCombat(dt); if (typeof checkHpLowPass === "function") checkHpLowPass();'
    )
    with open('js/update.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('[OK] update.js patched (checkHpLowPass hook)')
else:
    print('[SKIP] update.js already has checkHpLowPass')

# 4. Update VERSION in game.js
with open('js/game.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"const VERSION = '[^']+';", "const VERSION = 'v6.25';", content)
with open('js/game.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('[OK] game.js VERSION updated to v6.25')

# 5. Update cache buster in index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('?v=1629', '?v=1631').replace('?v=1630', '?v=1631')
with open('index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('[OK] index.html cache bust updated to v=1631')

print('\n*** All patches applied. Run: python test_game.py ***')
