function goToSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
  window.scrollTo(0, 0);
  const activeSection = document.querySelector('.section.active');
  if (activeSection) {
    localStorage.setItem('scoutingAppActiveSection', activeSection.id);
  }
}

const APP_STATE_KEY = 'scoutingAppFormState';
const APP_SECTION_KEY = 'scoutingAppActiveSection';

function getPersistKey(el) {
  if (el.id) return el.id;
  if (el.name) {
    if (el.type === 'radio') {
      return `radio:${el.name}`;
    }
    return `${el.name}:${el.type}`;
  }
  return null;
}

function saveAppState() {
  try {
    const data = {};
    document.querySelectorAll('#setup input, #autonomous input, #teleop input, #endcards input, #setup textarea, #endcards textarea, #setup select, #endcards select').forEach(el => {
      const key = getPersistKey(el);
      if (!key) return;

      if (el.type === 'radio') {
        if (el.checked) {
          data[key] = el.value || el.nextElementSibling?.textContent?.trim() || 'on';
        }
      } else if (el.type === 'checkbox') {
        data[key] = el.checked;
      } else {
        data[key] = el.value;
      }
    });

    localStorage.setItem(APP_STATE_KEY, JSON.stringify(data));
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
      localStorage.setItem(APP_SECTION_KEY, activeSection.id);
    }
  } catch (err) {
    console.warn('Unable to save app state:', err);
  }
}

function restoreAppState() {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return;

    document.querySelectorAll('#setup input, #autonomous input, #teleop input, #endcards input, #setup textarea, #endcards textarea, #setup select, #endcards select').forEach(el => {
      const key = getPersistKey(el);
      if (!key || !(key in data)) return;

      if (el.type === 'radio') {
        const storedValue = data[key];
        const radioValue = el.value || el.nextElementSibling?.textContent?.trim() || '';
        el.checked = (storedValue === radioValue);
      } else if (el.type === 'checkbox') {
        el.checked = !!data[key];
      } else {
        el.value = data[key];
      }

      if (el.id && el.id.endsWith('Input')) {
        const display = document.getElementById(el.id.slice(0, -5));
        if (display && !['INPUT', 'TEXTAREA', 'SELECT'].includes(display.tagName)) {
          display.textContent = data[key];
        }
      }
    });

    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
      const event = new Event('change', { bubbles: true });
      radio.dispatchEvent(event);
    });

    updateRadioHighlights();
    refreshPersistentHighlights();

    const sectionId = localStorage.getItem(APP_SECTION_KEY);
    if (sectionId && document.getElementById(sectionId)) {
      goToSection(sectionId);
    }
  } catch (err) {
    console.warn('Unable to restore app state:', err);
  }
}

function updateRadioHighlights() {
  document.querySelectorAll('#autonomous .climb-option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input && input.checked) {
      opt.classList.add('highlight');
    } else if (input) {
      opt.classList.remove('highlight');
    }
  });

  document.querySelectorAll('#teleop .climb-option, #teleop .climb-pos').forEach(opt => {
    const input = opt.querySelector('input');
    if (input && input.checked) {
      opt.classList.add('highlight');
    } else if (input) {
      opt.classList.remove('highlight');
    }
  });
}
function clearAppState() {
  localStorage.removeItem(APP_STATE_KEY);
  localStorage.removeItem(APP_SECTION_KEY);
}

function refreshPersistentHighlights() {
  document.querySelectorAll('#setup .alliance-options .option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) {
      opt.classList.toggle('highlight', input.checked);
      if (input.id?.startsWith('R')) {
        opt.classList.toggle('red', input.checked);
        if (input.checked) input.style.accentColor = '#ff4c4c';
      } else if (input.checked) {
        opt.classList.add('blue');
      }
    }
  });

  document.querySelectorAll('#setup .start-options .option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) {
      opt.classList.toggle('highlight', input.checked);
    }
  });

  document.querySelectorAll('#autonomous .fuel-option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) opt.classList.toggle('highlight', input.checked);
  });

  const fuelNoneCheckbox = document.querySelector('#autonomous .fuel-none input');
  const fuelNone = document.querySelector('#autonomous .fuel-none');
  if (fuelNoneCheckbox && fuelNone) {
    fuelNone.classList.toggle('highlight', fuelNoneCheckbox.checked);
    document.querySelectorAll('#autonomous .fuel-option').forEach(opt => {
      opt.classList.toggle('disabled', fuelNoneCheckbox.checked);
    });
  }

  document.querySelectorAll('#autonomous .travel-option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) opt.classList.toggle('highlight', input.checked);
  });

  const travelNACheckbox = document.querySelector('#autonomous .travel-na input');
  const travelNAOption = document.querySelector('#autonomous .travel-na');
  if (travelNACheckbox && travelNAOption) {
    travelNAOption.classList.toggle('highlight', travelNACheckbox.checked);
    document.querySelectorAll('#autonomous .travel-option').forEach(opt => {
      opt.classList.toggle('disabled', travelNACheckbox.checked);
    });
  }

  document.querySelectorAll('#autonomous .climb-option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) opt.classList.toggle('highlight', input.checked);
  });

  document.querySelectorAll('#teleop .climb-option, #teleop .climb-pos, #teleop .stuck-bar-option, #endcards .option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) opt.classList.toggle('highlight', input.checked);
  });

  document.querySelectorAll('#endcards .option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input) opt.classList.toggle('highlight', input.checked);
  });

  const selectedAlliance = document.querySelector('#setup input[name="alliance"]:checked');
  if (selectedAlliance) {
    setStartPosImageForAlliance(selectedAlliance.id);
    setClimbPosImageForAlliance(selectedAlliance.id);
    setFuelCollectionImageForAlliance(selectedAlliance.id);
    updateStartPosOrder(selectedAlliance.id);
  }

  updateMatchStartButtonColor();
  updateTopStatusBar();
}

function setupAppPersistence() {
  document.addEventListener('input', event => {
    if (event.target.closest('#setup, #autonomous, #teleop, #endcards')) {
      saveAppState();
    }
  });

  document.addEventListener('change', event => {
    if (event.target.closest('#setup, #autonomous, #teleop, #endcards')) {
      saveAppState();
    }
  });

  document.addEventListener('click', event => {
    if (event.target.closest('#setup, #autonomous, #teleop, #endcards')) {
      setTimeout(saveAppState, 0);
    }
  });

  window.addEventListener('beforeunload', saveAppState);
}

function setupScouterNameLimit() {
  const MAX_SCOUTER_NAME_LENGTH = 6;
  const scouterNameInput = document.getElementById('scouterName');
  const feedbackEl = document.getElementById('scouterNameFeedback');
  const counterEl = document.getElementById('scouterNameCounter');
  if (!scouterNameInput || !feedbackEl || !counterEl) return;

  scouterNameInput.maxLength = MAX_SCOUTER_NAME_LENGTH;

  const updateCounter = () => {
    const remaining = MAX_SCOUTER_NAME_LENGTH - scouterNameInput.value.length;
    counterEl.textContent = `${remaining} characters remaining`;
    counterEl.style.color = remaining === 0 ? '#ff4c4c' : '#aaa';
  };

  const showLimitMessage = () => {
    feedbackEl.textContent = 'A 6 character limit has been imposed; remove last name or use a nickname.';
  };

  const clearLimitMessage = () => {
    feedbackEl.textContent = '';
  };

  scouterNameInput.addEventListener('keydown', event => {
    const isPrintableKey = event.key.length === 1;
    const isModifier = event.ctrlKey || event.metaKey || event.altKey;
    const isNavigationKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'].includes(event.key);

    if (isPrintableKey && !isModifier && !isNavigationKey && scouterNameInput.value.length >= MAX_SCOUTER_NAME_LENGTH) {
      event.preventDefault();
      showLimitMessage();
      counterEl.style.color = '#ff4c4c';
    }
  });

  scouterNameInput.addEventListener('input', () => {
    updateCounter();
    if (scouterNameInput.value.length < MAX_SCOUTER_NAME_LENGTH) {
      clearLimitMessage();
    }
  });

  scouterNameInput.addEventListener('paste', event => {
    const pasteText = (event.clipboardData || window.clipboardData).getData('text') || '';
    const allowed = MAX_SCOUTER_NAME_LENGTH - scouterNameInput.value.length;
    if (pasteText.length > allowed) {
      showLimitMessage();
      counterEl.style.color = '#ff4c4c';
    }
  });

  updateCounter();
}

setupScouterNameLimit();

function adjustCounter(valueId, delta) {
  const valueEl = document.getElementById(valueId);
  if (!valueEl) return;

  const current = parseInt(valueEl.textContent, 10);
  const next = Math.max(0, (isNaN(current) ? 0 : current) + delta);

  valueEl.textContent = next;

  const inputEl = document.getElementById(`${valueId}Input`);
  if (inputEl) {
    inputEl.value = next;
  }
}

function encodeAlliancePosition(raw) {
  const map = {
    'R1': 'A',
    'R2': 'B',
    'R3': 'C',
    'B1': 'D',
    'B2': 'E',
    'B3': 'F'
  };
  return map[String(raw).trim()] || raw;
}

function encodeFuelCollection(raw) {
  const key = String(raw || '').trim().toUpperCase();
  const map = {
    'N': 'A',
    'ND': 'B',
    'NDO': 'C',
    'D': 'D',
    'O': 'E',
    'DO': 'F',
    "NO": 'G'
  };
  return map[key] || raw;
}

function encodeTravel(raw) {
  const key = String(raw || '').trim().toUpperCase();
  const map = {
    'B': 'A',
    'T': 'B',
    'BT': 'C'
  };
  return map[key] || raw;
}

// ========== AUTONOMOUS PAGE ==========

function validateAutoFuelCollection(autoFuelCollected, fuelCollection) {
  const hasFuelCollection = fuelCollection && fuelCollection !== '-' && fuelCollection.trim() !== '';

  if (!hasFuelCollection && autoFuelCollected > 8) {
    console.log(`Auto fuel capped: ${autoFuelCollected} -> 8 (no fuel collection zones)`);
    return 8;
  }

  return autoFuelCollected;
}

const fuelOptions = document.querySelectorAll('.fuel-option');
const fuelNone = document.querySelector('.fuel-none');
const fuelNoneCB = fuelNone.querySelector('input');

fuelOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    if (fuelNoneCB.checked) return;
    const cb = opt.querySelector('input');
    cb.checked = !cb.checked;
    opt.classList.toggle('highlight', cb.checked);
  });
});

fuelNone.addEventListener('click', () => {
  fuelNoneCB.checked = !fuelNoneCB.checked;

  if (fuelNoneCB.checked) {
    fuelOptions.forEach(opt => {
      opt.querySelector('input').checked = false;
      opt.classList.remove('highlight');
      opt.classList.add('disabled');
    });
    fuelNone.classList.add('highlight');
  } else {
    fuelOptions.forEach(opt => opt.classList.remove('disabled'));
    fuelNone.classList.remove('highlight');
  }
});

const travelOptions = document.querySelectorAll('.travel-option');
const travelNA = document.querySelector('.travel-na');
const travelNACB = travelNA.querySelector('input');

travelOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    if (travelNACB.checked) return;
    const cb = opt.querySelector('input');
    cb.checked = !cb.checked;
    opt.classList.toggle('highlight', cb.checked);
  });
});

travelNA.addEventListener('click', () => {
  travelNACB.checked = !travelNACB.checked;

  if (travelNACB.checked) {
    travelOptions.forEach(opt => {
      opt.querySelector('input').checked = false;
      opt.classList.remove('highlight');
      opt.classList.add('disabled');
    });
    travelNA.classList.add('highlight');
  } else {
    travelOptions.forEach(opt => opt.classList.remove('disabled'));
    travelNA.classList.remove('highlight');
  }
});


document.querySelectorAll('#autonomous .climb-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('#autonomous .climb-option').forEach(o => o.classList.remove('highlight'));
    opt.querySelector('input').checked = true;
    opt.classList.add('highlight');
  });
});

// ========== SETUP PAGE ==========
const allianceOptions = document.querySelectorAll('.alliance-options .option');

allianceOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    if (opt.classList.contains('disabled')) {
      return;
    }

    allianceOptions.forEach(o => {
      o.classList.remove('red', 'blue', 'highlight');
      o.querySelector('input').style.accentColor = '#1e90ff';
    });

    const radio = opt.querySelector('input');
    radio.checked = true;

    if (radio.id.startsWith('R')) {
      opt.classList.add('red');
      radio.style.accentColor = '#ff4c4c';
    } else {
      opt.classList.add('blue');
      radio.style.accentColor = '#1e90ff';
    }
    opt.classList.add('highlight');

    setStartPosImageForAlliance(radio.id);
    setClimbPosImageForAlliance(radio.id);
    updateStartPosOrder(radio.id);
    updateMatchStartButtonColor();
    updateTopStatusBar();


  });
});

const climbPosImage = document.getElementById('climbPosImage');

function setClimbPosImageForAlliance(allianceId) {
  if (!climbPosImage) return;

  if (!allianceId) {
    allianceId = document.querySelector('#setup input[name="alliance"]:checked')?.id
      || document.querySelector('#master-controls input[name="masterAlliance"]:checked')?.id
      || '';
  }

  if (allianceId.includes('B')) {
    climbPosImage.src = 'images/blue_climb.png';
  } else if (allianceId.includes('R')) {
    climbPosImage.src = 'images/red_climb.png';
  }
}
const startOptions = document.querySelectorAll('.start-options .option');

startOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    startOptions.forEach(o => {
      o.classList.remove('highlight', 'red');
      o.querySelector('input').checked = false;
    });

    opt.querySelector('input').checked = true;
    opt.classList.add('highlight');

    const field = opt.closest('.field');
    if (field) {
      field.style.border = '';
      field.style.boxShadow = '';
      field.style.padding = '';
      field.style.borderRadius = '';
    }
  });
});

const startPosImage = document.getElementById('startPosImage');
const fuelCollectionImage = document.getElementById('fuelCollectionImage');

function setStartPosImageForAlliance(allianceId) {
  if (!startPosImage) return;
  if (!allianceId) {
    allianceId = document.querySelector('#setup input[name="alliance"]:checked')?.id
      || document.querySelector('#master-controls input[name="masterAlliance"]:checked')?.id
      || '';
  }

  if (allianceId.includes('B')) {
    startPosImage.src = 'images/blue_startingPos.png';
  } else if (allianceId.includes('R')) {
    startPosImage.src = 'images/red_startingPos.png';
  }
}

function setFuelCollectionImageForAlliance(allianceId) {
  if (!fuelCollectionImage) return;
  if (!allianceId) {
    allianceId = document.querySelector('#setup input[name="alliance"]:checked')?.id
      || document.querySelector('#master-controls input[name="masterAlliance"]:checked')?.id
      || '';
  }

  if (allianceId.includes('B')) {
    fuelCollectionImage.src = 'images/blue_fuelCollection.png';
  } else if (allianceId.includes('R')) {
    fuelCollectionImage.src = 'images/red_fuelCollection.png';
  }
}

startOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    startOptions.forEach(o => {
      o.classList.remove('highlight', 'red');
      o.querySelector('input').checked = false;
    });

    opt.querySelector('input').checked = true;
    opt.classList.add('highlight');

    const selectedAlliance = document.querySelector('#setup input[name="alliance"]:checked');
    setStartPosImageForAlliance(selectedAlliance?.id);
    updateStartPosOrder(selectedAlliance?.id);

    const field = opt.closest('.field');
    if (field) {
      field.style.border = '';
      field.style.boxShadow = '';
      field.style.padding = '';
      field.style.borderRadius = '';
    }
  });
});

allianceOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const selectedStart = document.querySelector('#setup input[name="startPos"]:checked');
    if (!selectedStart) return;

    if (opt.querySelector('input').id.startsWith('B')) {
      startPosImage.src = 'images/blue_startingPos.png';
    } else if (opt.querySelector('input').id.startsWith('R')) {
      startPosImage.src = 'images/red_startingPos.png';
    }
  });
});


const startOptionsContainer = document.querySelector('.start-options');

const outpostOption = document.querySelector('#outpost').closest('.option');
const centerOption = document.querySelector('#center').closest('.option');
const depotOption = document.querySelector('#depot').closest('.option');

function updateStartPosOrder(allianceId) {
  if (!startOptionsContainer) return;

  startOptionsContainer.innerHTML = '';

  if (allianceId.includes('B')) {
    startOptionsContainer.appendChild(depotOption);
    startOptionsContainer.appendChild(centerOption);
    startOptionsContainer.appendChild(outpostOption);
  } else {
    startOptionsContainer.appendChild(outpostOption);
    startOptionsContainer.appendChild(centerOption);
    startOptionsContainer.appendChild(depotOption);
  }
}





// ========== TELEOP PAGE ==========
const climbOptionsTeleop = document.querySelectorAll('#teleop .climb-option');
const climbPosOptions = document.querySelectorAll('#teleop .climb-pos');
const noneClimbOption = document.querySelector('#teleop .none-climb');
const noneInput = noneClimbOption.querySelector('input');

climbOptionsTeleop.forEach(opt => {
  opt.addEventListener('click', () => {
    if (opt.classList.contains('none-climb')) {
      noneInput.checked = !noneInput.checked;

      if (noneInput.checked) {
        climbOptionsTeleop.forEach(o => {
          if (!o.classList.contains('none-climb')) {
            o.classList.add('disabled');
            o.classList.remove('highlight');
            o.querySelector('input').checked = false;
          }
        });
        climbPosOptions.forEach(o => {
          o.classList.add('disabled');
          o.classList.remove('highlight');
          o.querySelector('input').checked = false;
        });
        noneClimbOption.classList.add('highlight');
        if (climbTimerInterval) {
          stopClimbTimer();
        }
        climbFailed = false;
        if (climbHoldButton) {
          climbHoldButton.classList.remove('failed');
          climbHoldButton.classList.remove('disabled');
        }
        if (climbAccumulated > 0) {
          climbSavedBeforeNone = climbAccumulated;
        }
        climbAccumulated = 0;
        if (climbDurationInput) climbDurationInput.value = '';
        if (climbHoldButton) {
          climbHoldButton.textContent = 'No Climb';
          climbHoldButton.classList.add('disabled');
        }
      } else {
        climbOptionsTeleop.forEach(o => o.classList.remove('disabled'));
        climbPosOptions.forEach(o => o.classList.remove('disabled'));
        noneClimbOption.classList.remove('highlight');
        if (climbSavedBeforeNone > 0) {
          climbAccumulated = climbSavedBeforeNone;
          if (climbHoldButton) {
            climbHoldButton.textContent = climbButtonText(climbAccumulated);
            climbHoldButton.classList.add('filled');
            climbHoldButton.classList.remove('disabled');
          }
          climbSavedBeforeNone = 0;
          if (climbDurationInput) climbDurationInput.value = (climbAccumulated / 1000).toFixed(2);
        } else {
          if (climbHoldButton) {
            climbHoldButton.textContent = 'Hold to time climb';
            climbHoldButton.classList.remove('disabled');
          }
        }
      }
    } else if (!noneInput.checked) {
      climbOptionsTeleop.forEach(o => o.classList.remove('highlight'));
      opt.querySelector('input').checked = true;
      opt.classList.add('highlight');
      const labelText = (opt.textContent || '').trim().toLowerCase();
      if (labelText.includes('failed')) {
        climbFailed = true;
        if (climbTimerInterval) stopClimbTimer();
        if (climbHoldButton) {
          climbHoldButton.classList.add('failed');
          climbHoldButton.classList.add('disabled');
        }
      } else {
        climbFailed = false;
        if (climbHoldButton) {
          climbHoldButton.classList.remove('failed');
          climbHoldButton.classList.remove('disabled');
        }
      }
      if (climbHoldButton) climbHoldButton.textContent = climbButtonText(climbAccumulated);
    }
  });
});

climbPosOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    if (!opt.classList.contains('disabled')) {
      climbPosOptions.forEach(o => o.classList.remove('highlight'));
      opt.querySelector('input').checked = true;
      opt.classList.add('highlight');
    }
  });
});

const stuckBarOptions = document.querySelectorAll('#teleop .stuck-bar-option');

function updateStuckBarState() {
  const autonomousClimbRadios = document.querySelectorAll('#autonomous .climb-option input');
  const level1Selected = Array.from(autonomousClimbRadios).some(rb => {
    return rb.checked && rb.parentElement.textContent.includes('Level 1');
  });

  stuckBarOptions.forEach(opt => {
    if (level1Selected) {
      opt.classList.remove('disabled');
      opt.querySelector('input').disabled = false;
    } else {
      opt.classList.add('disabled');
      opt.querySelector('input').disabled = true;
      opt.querySelector('input').checked = false;
      opt.classList.remove('highlight');
    }
  });
}

stuckBarOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    if (!opt.classList.contains('disabled')) {
      stuckBarOptions.forEach(o => o.classList.remove('highlight'));
      opt.querySelector('input').checked = true;
      opt.classList.add('highlight');
    }
  });
});

const originalGoToSection = window.goToSection;

// ========== MASTER CONTROLS PASSWORD ==========

const EMBEDDED_MASTER_PASSWORD = 'blueberry';

async function verifyMasterPassword(input) {
  if (!input) return { success: false, message: 'Please enter a password' };

  const ok = String(input).trim() === EMBEDDED_MASTER_PASSWORD;
  return { success: ok };
}

async function openMasterModal() {
  const modal = document.getElementById('masterPasswordModal');
  const input = document.getElementById('masterPasswordInput');
  const submitBtn = document.getElementById('masterPasswordSubmit');
  const cancelBtn = document.getElementById('masterPasswordCancel');
  if (!modal || !input || !submitBtn || !cancelBtn) return Promise.resolve(false);

  modal.setAttribute('aria-hidden', 'false');
  input.value = '';
  const errDiv = document.getElementById('masterPasswordError');
  if (errDiv) errDiv.textContent = '';
  input.classList.remove('invalid');

  return new Promise(resolve => {
    let cleaned = false;

    function cleanup(result) {
      if (cleaned) return;
      cleaned = true;
      submitBtn.removeEventListener('click', onSubmit);
      cancelBtn.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeydown);
      modal.setAttribute('aria-hidden', 'true');
      resolve(result);
    }

    function setError(msg) {
      if (errDiv) errDiv.textContent = msg;
      input.classList.add('invalid');
    }

    async function onSubmit(e) {
      e.preventDefault();
      const val = input.value || '';
      const result = await verifyMasterPassword(val);

      if (result.success) {
        cleanup(true);
      } else {
        setError('Incorrect password');
        input.select();
        input.focus();
      }
    }

    function onCancel() {
      cleanup(false);
    }

    function onKeydown(e) {
      if (e.key === 'Enter') onSubmit(e);
      if (e.key === 'Escape') onCancel();
    }

    submitBtn.addEventListener('click', onSubmit);
    cancelBtn.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeydown);
  });
}

const masterMenuBtn = document.getElementById('masterMenuBtn');
if (masterMenuBtn) {
  masterMenuBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const ok = await openMasterModal();
    if (!ok) return;
    originalGoToSection('master-controls');
  });
}


window.goToSection = function (sectionId) {
  originalGoToSection(sectionId);
  if (sectionId === 'teleop') {
    updateStuckBarState();
  }
};



const climbHoldButton = document.getElementById('climbHoldButton');
const climbHoldDisplay = document.getElementById('climbHoldDisplay');
const climbDurationInput = document.getElementById('climbDuration');
const climbResetButton = document.getElementById("climbResetButton");

let climbTimerInterval = null;
let climbStart = null;
let climbAccumulated = 0;
let climbFailed = false;
let climbSavedBeforeNone = 0;


if (climbResetButton) {
  climbResetButton.addEventListener("click", () => {
    if (climbTimerInterval) {
      clearInterval(climbTimerInterval);
      climbTimerInterval = null;
    }

    climbStart = null;
    climbAccumulated = 0;
    climbSavedBeforeNone = 0;
    climbFailed = false;

    climbHoldDisplay.textContent = "0.00s";
    climbDurationInput.value = "";
    climbHoldButton.textContent = "Hold to time climb";
    climbHoldButton.classList.remove(
      "holding",
      "filled",
      "failed",
      "disabled"
    );
  });
}


function climbButtonText(ms) {
  const t = formatElapsed(ms);
  return climbFailed ? `Failed climb — ${t}` : t;
}

function formatElapsed(ms) {
  return (ms / 1000).toFixed(2) + 's';
}

function startClimbTimer(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (climbFailed || (climbHoldButton && climbHoldButton.classList.contains('disabled'))) return;
  if (climbTimerInterval) return;
  climbStart = Date.now();
  climbHoldButton.classList.remove('filled');
  climbHoldButton.classList.add('holding');
  climbHoldButton.textContent = climbButtonText(climbAccumulated);
  climbTimerInterval = setInterval(() => {
    const current = climbAccumulated + (Date.now() - climbStart);
    climbHoldButton.textContent = climbButtonText(current);
  }, 100);
}

function stopClimbTimer(e) {
  if (!climbTimerInterval) return;
  clearInterval(climbTimerInterval);
  const elapsed = Date.now() - climbStart;
  climbAccumulated += elapsed;
  climbTimerInterval = null;
  climbStart = null;
  climbHoldButton.classList.remove('holding');
  climbHoldButton.classList.add('filled');
  climbHoldButton.textContent = climbButtonText(climbAccumulated);
  climbHoldDisplay.textContent = '';
  climbDurationInput.value = (climbAccumulated / 1000).toFixed(2);
}

if (climbHoldButton) {
  climbHoldButton.addEventListener('pointerdown', startClimbTimer);
  climbHoldButton.addEventListener('pointercancel', stopClimbTimer);
  window.addEventListener('pointerup', stopClimbTimer);
  climbHoldButton.addEventListener('contextmenu', e => e.preventDefault());
}

// ========== ENDCARDS PAGE ==========
document.querySelectorAll('#endcards .radio-select-column').forEach(group => {
  const options = group.querySelectorAll('.option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('highlight'));
      opt.querySelector('input').checked = true;
      opt.classList.add('highlight');
    });
  });
});

const COMMENTS_MAX_LENGTH = 150;
const commentsBox = document.getElementById('comments');
const commentsCounter = document.getElementById('comments-counter');

if (commentsBox) {
  commentsBox.maxLength = COMMENTS_MAX_LENGTH;
}

function updateCommentsCounter() {
  if (!commentsBox || !commentsCounter) return;
  const remaining = COMMENTS_MAX_LENGTH - commentsBox.value.length;
  commentsCounter.innerText = `${remaining} characters remaining`;
  commentsCounter.style.color = remaining === 0 ? '#ff4c4c' : '#aaa';
}

commentsBox.addEventListener('input', updateCommentsCounter);
updateCommentsCounter();

// ========== MASTER CONTROLS PAGE ==========
const masterAllianceOptions = document.querySelectorAll(
  '#master-controls .alliance-options .option'
);

masterAllianceOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    masterAllianceOptions.forEach(o => {
      o.classList.remove('red', 'blue');
      o.querySelector('input').style.accentColor = '#1e90ff';
    });

    const radio = opt.querySelector('input');
    radio.checked = true;

    if (radio.id.includes('R')) {
      opt.classList.add('red');
      radio.style.accentColor = '#ff4c4c';
    } else {
      opt.classList.add('blue');
      radio.style.accentColor = '#1e90ff';
    }

    localStorage.setItem('selectedAlliance', radio.id);
    lockSetupAlliance(radio.id);

    setStartPosImageForAlliance(radio.id);
    setClimbPosImageForAlliance(radio.id);
    updateStartPosOrder(radio.id);
    updateMatchStartButtonColor();
    updateTopStatusBar();
  });
});

function loadSavedAlliance() {
  const savedAlliance = localStorage.getItem('selectedAlliance');
  if (savedAlliance) {
    const savedOption = document.querySelector(`#${savedAlliance}`);
    if (savedOption) {
      const parentOpt = savedOption.closest('.option');
      parentOpt.click();
      setClimbPosImageForAlliance(savedAlliance);
    }
  }
  updateTopStatusBar();
}

loadSavedAlliance();

function lockSetupAlliance(masterId) {
  const setupOptions = document.querySelectorAll('#setup .alliance-options .option');
  const masterMap = {
    'MC_R1': 'R1option',
    'MC_B1': 'B1option',
    'MC_R2': 'R2option',
    'MC_B2': 'B2option',
    'MC_R3': 'R3option',
    'MC_B3': 'B3option'
  };

  const setupOptionId = masterMap[masterId];

  setupOptions.forEach(opt => {
    if (opt.id === setupOptionId) {
      const radio = opt.querySelector('input');
      radio.checked = true;
      opt.classList.add('highlight');

      opt.classList.remove('red', 'blue');
      if (radio.id.startsWith('R')) {
        opt.classList.add('red');
        radio.style.accentColor = '#ff4c4c';
      } else {
        opt.classList.add('blue');
        radio.style.accentColor = '#1e90ff';
      }
      setStartPosImageForAlliance(masterId);
      setClimbPosImageForAlliance(masterId);
      updateStartPosOrder(masterId);
    }

    opt.classList.add('disabled');
  });
}
function resetAlliance() {
  if (!confirm("Are you sure you want to reset the alliance position?")) {
    return;
  }

  localStorage.removeItem('selectedAlliance');

  masterAllianceOptions.forEach(opt => {
    opt.classList.remove('red', 'blue', 'highlight');
    opt.querySelector('input').checked = false;
    opt.querySelector('input').style.accentColor = '#1e90ff';
  });

  const setupOptions = document.querySelectorAll('#setup .alliance-options .option');
  setupOptions.forEach(opt => {
    opt.classList.remove('disabled', 'highlight', 'red', 'blue');
    opt.querySelector('input').checked = false;
    opt.querySelector('input').style.accentColor = '#1e90ff';
  });
  if (startPosImage) startPosImage.src = 'images/red_startingPos.png';
  if (climbPosImage) climbPosImage.src = 'images/red_climb.png';
  clearSetupTeamFields();
  updateTopStatusBar();

}


let matchSchedule = [];

function handleMatchScheduleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    updateMatchCSVStatus("Invalid file type. Please upload a CSV.", false);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const requiredHeaders = ['Match Number', 'Red 1', 'Red 2', 'Red 3', 'Blue 1', 'Blue 2', 'Blue 3'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      updateMatchCSVStatus(`Missing headers: ${missingHeaders.join(", ")}`, false);
      matchSchedule = [];
      document.getElementById('teamNumber').disabled = false;
      document.getElementById('teamNumber').placeholder = "Enter team #";
      return;
    }

    clearSetupTeamFields();

    matchSchedule = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const rowObj = {};
      headers.forEach((header, i) => {
        rowObj[header] = values[i];
      });
      return rowObj;
    });

    localStorage.setItem('matchScheduleCSV', text);
    localStorage.setItem('matchScheduleFileName', file.name);

    updateMatchCSVStatus(file.name, true);

    const teamInput = document.getElementById('teamNumber');
    teamInput.disabled = true;
    teamInput.placeholder = "Auto-filled from match schedule";
  };

  reader.readAsText(file);
}

function updateMatchCSVStatus(message, success) {
  const statusDiv = document.getElementById('csvUploadStatus');

  if (success) {
    statusDiv.style.background = "#002244";
    statusDiv.style.border = "2px solid #1e90ff";
    statusDiv.style.color = "#1e90ff";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem;">${message}</p>`;
    statusDiv.classList.add('uploaded');
  } else {
    statusDiv.style.background = "#440000";
    statusDiv.style.border = "2px solid #ff4c4c";
    statusDiv.style.color = "#ff4c4c";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem;">${message}</p>`;
    statusDiv.classList.remove('uploaded');
  }
}


async function saveCSVToLocalFile(csvText, defaultFileName = 'match_schedule.csv') {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: defaultFileName,
      types: [{
        description: 'CSV Files',
        accept: { 'text/csv': ['.csv'] }
      }]
    });

    const writable = await handle.createWritable();
    await writable.write(csvText);
    await writable.close();

    console.log("CSV saved to local storage:", handle.name);
  } catch (err) {
    console.error("CSV not saved:", err);
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  const requiredHeaders = ['Match Number', 'Red 1', 'Red 2', 'Red 3', 'Blue 1', 'Blue 2', 'Blue 3'];

  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    const statusDiv = document.getElementById('csvUploadStatus');
    statusDiv.innerHTML = `<p style="color:#ff4c4c;">Error: Missing headers: ${missingHeaders.join(', ')}</p>`;
    statusDiv.classList.remove('uploaded');
    matchSchedule = [];
    return;
  }

  matchSchedule = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const rowObj = {};
    headers.forEach((header, i) => {
      rowObj[header] = values[i];
    });
    return rowObj;
  });

  console.log("Parsed Match Schedule:", matchSchedule);
}

function autofillTeamNumber() {
  const matchNumber = document.getElementById("matchNumber").value.trim();
  const teamNumberInput = document.getElementById('teamNumber');
  const teamNameInput = document.getElementById('teamName');

  if (!matchNumber) {
    teamNumberInput.value = '';
    teamNameInput.value = '';
    return;
  }

  const selectedAllianceRadio = document.querySelector('#setup .alliance-options .option input:checked');
  if (!selectedAllianceRadio) return;

  const allianceMap = {
    'R1': 'Red 1',
    'R2': 'Red 2',
    'R3': 'Red 3',
    'B1': 'Blue 1',
    'B2': 'Blue 2',
    'B3': 'Blue 3'
  };

  const allianceId = selectedAllianceRadio.id;
  const allianceHeader = allianceMap[allianceId];

  const matchRow = matchSchedule.find(row => row['Match Number'] === matchNumber);
  if (matchRow && allianceHeader) {
    teamNumberInput.value = matchRow[allianceHeader];

    teamNumberInput.style.borderColor = '';
    teamNumberInput.style.boxShadow = '';
    teamNumberInput.style.outline = '2px solid #2a2d31';

    autofillTeamName();
  } else {
    teamNumberInput.value = '';
    teamNameInput.value = '';
  }
  updateTopStatusBar();

}
function setupMatchAutofillListeners() {
  const matchNumberInput = document.getElementById('matchNumber');
  if (matchNumberInput) {
    matchNumberInput.addEventListener('input', autofillTeamNumber);
  }

  allianceOptions.forEach(opt => {
    opt.addEventListener('click', autofillTeamNumber);
  });

  if (matchNumberInput && matchNumberInput.value.trim()) {
    autofillTeamNumber();
  }
}

document.addEventListener('DOMContentLoaded', setupMatchAutofillListeners);

document.addEventListener('DOMContentLoaded', () => {
  updateTopStatusBar();
});

function autofillTeamName() {
  const teamNumberInput = document.getElementById('teamNumber');
  const teamNameInput = document.getElementById('teamName');

  const teamNumber = teamNumberInput.value.trim();
  if (!teamNumber || teamList.length === 0) {
    teamNameInput.value = '';
    return;
  }

  const match = teamList.find(
    row => row['Team Number'] === teamNumber
  );

  if (match) {
    teamNameInput.value = match['Team Name'] || '';
  } else {
    teamNameInput.value = '';
  }
}

document.getElementById('teamNumber').addEventListener('input', autofillTeamName);
function handleTeamCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    updateTeamCSVStatus("Invalid file type. Please upload a CSV.", false);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const requiredHeaders = ['Team Number', 'Team Name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      updateTeamCSVStatus(`Missing headers: ${missingHeaders.join(", ")}`, false);
      teamList = [];
      document.getElementById('teamName').value = '';
      document.getElementById('teamName').disabled = true;
      return;
    }

    clearSetupTeamFields();

    teamList = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const rowObj = {};
      headers.forEach((h, i) => rowObj[h] = values[i]);
      return rowObj;
    });

    localStorage.setItem('teamCSV', text);
    localStorage.setItem('teamCSVFileName', file.name);

    updateTeamCSVStatus(file.name, true);

    const teamNameInput = document.getElementById('teamName');
    teamNameInput.disabled = false;
    teamNameInput.placeholder = "Auto-filled by CSV";

    autofillTeamName();
  };

  reader.readAsText(file);
}

window.addEventListener('DOMContentLoaded', () => {
  const savedMatchCSV = localStorage.getItem('matchScheduleCSV');
  const savedMatchFileName = localStorage.getItem('matchScheduleFileName');

  if (savedMatchCSV) {
    parseCSV(savedMatchCSV);
    updateMatchCSVStatus(savedMatchFileName, true);
    document.getElementById('teamNumber').disabled = true;
    document.getElementById('teamNumber').placeholder = "Auto-filled from match schedule";
  }

  const savedTeamCSV = localStorage.getItem('teamCSV');
  const savedTeamFileName = localStorage.getItem('teamCSVFileName');

  const teamNameInput = document.getElementById('teamName');

  if (savedTeamCSV) {
    parseTeamCSV(savedTeamCSV);
    updateTeamCSVStatus(savedTeamFileName, true);
    teamNameInput.disabled = false;
    teamNameInput.placeholder = "Auto-filled from team CSV";
  } else {
    teamNameInput.disabled = true;
    teamNameInput.placeholder = "Upload team CSV to enter names";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  restoreAppState();
  restoreQRCodeFromStorage();
  setupAppPersistence();
});

function deleteMatchSchedule() {
  if (!localStorage.getItem('matchScheduleCSV')) {
    alert("No CSV uploaded.");
    return;
  }
  if (confirm("Are you sure you want to delete the uploaded match schedule CSV?")) {
    localStorage.removeItem('matchScheduleCSV');
    localStorage.removeItem('matchScheduleFileName');
    matchSchedule = [];

    const teamInput = document.getElementById('teamNumber');
    teamInput.value = '';
    teamInput.disabled = false;
    teamInput.placeholder = "Enter team #";

    const statusDiv = document.getElementById('csvUploadStatus');
    statusDiv.style.background = "#1a1c1f";
    statusDiv.style.border = "2px solid #2a2d31";
    statusDiv.style.color = "#ffffff";
    statusDiv.innerHTML = `<p style="text-align: center; font-size: 1rem; color: #ccc;">No match schedule uploaded.</p>`;
    statusDiv.classList.remove('uploaded');

    alert("CSV deleted successfully!");
    clearSetupTeamFields();
  }
}

let teamList = [];

function updateTeamCSVStatus(message, success) {
  const statusDiv = document.getElementById('teamCSVUploadStatus');

  if (success) {
    statusDiv.style.background = "#002244";
    statusDiv.style.border = "2px solid #1e90ff";
    statusDiv.style.color = "#1e90ff";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem;">${message}</p>`;
    statusDiv.classList.add('uploaded');
  } else {
    statusDiv.style.background = "#440000";
    statusDiv.style.border = "2px solid #ff4c4c";
    statusDiv.style.color = "#ff4c4c";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem;">${message}</p>`;
    statusDiv.classList.remove('uploaded');
  }
}

function parseTeamCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  const requiredHeaders = ['Team Number', 'Team Name'];

  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    const statusDiv = document.getElementById('teamCSVUploadStatus');
    statusDiv.innerHTML = `<p style="color:#ff4c4c;">Error: Missing headers: ${missingHeaders.join(', ')}</p>`;
    statusDiv.classList.remove('uploaded');
    teamList = [];
    return;
  }

  teamList = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => row[h] = values[i]);
    return row;
  });

  console.log("Parsed Team List:", teamList);
}

function deleteTeamCSV() {
  if (!localStorage.getItem('teamCSV')) {
    alert("No team list uploaded.");
    return;
  }

  if (confirm("Are you sure you want to delete the team list CSV?")) {
    localStorage.removeItem('teamCSV');
    localStorage.removeItem('teamCSVFileName');
    teamList = [];

    const statusDiv = document.getElementById('teamCSVUploadStatus');
    statusDiv.style.background = "#1a1c1f";
    statusDiv.style.border = "2px solid #2a2d31";
    statusDiv.style.color = "#ffffff";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem; color:#ccc;">No team list uploaded.</p>`;
    statusDiv.classList.remove('uploaded');

    alert("Team list deleted.");
    clearSetupTeamFields();

    const teamNameInput = document.getElementById('teamName');
    teamNameInput.disabled = true;
    teamNameInput.placeholder = "Upload team CSV to enter names";
    teamNameInput.value = '';
  }
}

const savedTeamCSV = localStorage.getItem('teamCSV');
const savedTeamFile = localStorage.getItem('teamCSVFileName');

if (savedTeamCSV) {
  parseTeamCSV(savedTeamCSV);
  if (savedTeamFile) updateTeamCSVStatus(savedTeamFile);
}


function clearSetupTeamFields() {
  document.getElementById('matchNumber').value = '';
  document.getElementById('teamNumber').value = '';
  document.getElementById('teamName').value = '';
}

const teamNameInput = document.getElementById('teamName');

if (!localStorage.getItem('teamCSV')) {
  teamNameInput.disabled = true;
  teamNameInput.placeholder = "Upload team CSV to enter names";
} else {
  teamNameInput.disabled = false;
  teamNameInput.placeholder = "";
}


// ========== RESET FORM FOR NEW ENTRY ==========

function resetFormForNewEntry() {
  const setupOptions = document.querySelectorAll('#setup .alliance-options .option');
  const allianceLocked = Array.from(setupOptions).some(opt => opt.classList.contains('disabled'));

  document.querySelectorAll('#setup input[type="text"], #setup input[type="number"]').forEach(input => {
    if (input.id === 'matchNumber' || input.id === 'teamNumber') {
      input.value = '';
    } else {
      input.value = '';
    }
  });

  document.querySelectorAll('#endcards input[name="shootingAccuracy"]').forEach(rb => {
    rb.checked = false;
  });

  document.querySelectorAll('#setup .start-options .option').forEach(opt => {
    opt.classList.remove('highlight');
    opt.querySelector('input').checked = false;
  });

  const startPosImg = document.getElementById('startPosImage');
  if (startPosImg) {
    startPosImg.src = 'images/red_startingPos.png';
  }

  document.querySelectorAll('#autonomous input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('#autonomous .option').forEach(opt => opt.classList.remove('highlight', 'disabled'));

  ['autoFuelCollected', 'autoFuelFerried', 'teleFuelCollected', 'teleFuelFerried'].forEach(id => {
    const valueEl = document.getElementById(id);
    const inputEl = document.getElementById(`${id}Input`);
    if (valueEl) valueEl.textContent = '0';
    if (inputEl) inputEl.value = '0';
  });

  document.querySelectorAll('#autonomous .climb-option').forEach(opt => {
    opt.classList.remove('highlight');
    opt.querySelector('input').checked = false;
  });

  document.querySelectorAll('#teleop .climb-option, #teleop .climb-pos').forEach(opt => {
    opt.classList.remove('highlight', 'disabled');
    opt.querySelector('input').checked = false;
  });

  document.querySelectorAll('#teleop .stuck-bar-option').forEach(opt => {
    opt.classList.remove('highlight');
    opt.querySelector('input').checked = false;
  });

  try {
    if (climbHoldButton) {
      climbHoldButton.textContent = 'Hold to time climb';
      climbHoldButton.classList.remove('holding', 'filled', 'failed', 'disabled');
    }
    climbAccumulated = 0;
    climbSavedBeforeNone = 0;
    climbFailed = false;
  } catch (err) {

  }

  document.querySelectorAll('#endcards input[type="radio"]').forEach(rb => {
    rb.checked = false;
  });

  document.querySelectorAll('#endcards .option').forEach(opt => {
    opt.classList.remove('highlight');
  });

  document.getElementById('comments').value = '';
  document.getElementById('comments-counter').innerText = '75 characters remaining';
  document.getElementById('comments-counter').style.color = '#aaa';

  const teamInput = document.getElementById('teamNumber');
  if (!teamInput.disabled) teamInput.value = '';

  if (!allianceLocked) {
    setupOptions.forEach(opt => {
      opt.classList.remove('highlight', 'red', 'blue');
      opt.querySelector('input').checked = false;
      opt.querySelector('input').style.accentColor = '#1e90ff';
    });
  }
  if (typeof robotMissing !== 'undefined' && robotMissing) {
    try {
      toggleRobotMissing();
    } catch (err) {
      robotMissing = false;
      const robotMissingStatus = document.getElementById('robotMissingStatus');
      if (robotMissingStatus) robotMissingStatus.style.display = 'none';
      const robotMissingBtn = document.getElementById('robotMissingBtn');
      if (robotMissingBtn) {
        robotMissingBtn.textContent = 'Mark Robot Missing';
        robotMissingBtn.style.backgroundColor = '#ff4c4c';
      }
    }
  }
  clearAppState();
}
const setupOptions = document.querySelectorAll('#setup .alliance-options .option');
const allianceLocked = Array.from(setupOptions).some(opt => opt.classList.contains('disabled'));

document.querySelectorAll('#setup input[type="text"], #setup input[type="number"]').forEach(input => {
  if (input.id === 'matchNumber' || input.id === 'teamNumber') {
    input.value = '';
  } else {
    input.value = '';
  }
});

document.querySelectorAll('#setup .start-options .option').forEach(opt => {
  opt.classList.remove('highlight');
  opt.querySelector('input').checked = false;
});

document.querySelectorAll('#autonomous input[type="checkbox"]').forEach(cb => cb.checked = false);
document.querySelectorAll('#autonomous .option').forEach(opt => opt.classList.remove('highlight', 'disabled'));

document.querySelectorAll('#autonomous .climb-option').forEach(opt => {
  opt.classList.remove('highlight');
  opt.querySelector('input').checked = false;
});

document.querySelectorAll('#teleop .climb-option, #teleop .climb-pos').forEach(opt => {
  opt.classList.remove('highlight', 'disabled');
  opt.querySelector('input').checked = false;
});

document.querySelectorAll('#teleop .field').forEach(field => {
  field.style.border = '';
  field.style.boxShadow = '';
  field.style.padding = '';
  field.style.borderRadius = '';
});

try {
  if (climbHoldButton) {
    climbHoldButton.textContent = 'Hold to time climb';
    climbHoldButton.classList.remove('holding', 'filled');
  }
  climbAccumulated = 0;
  climbSavedBeforeNone = 0;
} catch (err) {
}
document.getElementById('comments').value = '';

const teamInput = document.getElementById('teamNumber');
if (!teamInput.disabled) teamInput.value = '';

if (!allianceLocked) {
  setupOptions.forEach(opt => {
    opt.classList.remove('highlight', 'red', 'blue');
    opt.querySelector('input').checked = false;
    opt.querySelector('input').style.accentColor = '#1e90ff';
  });
}


// ========== NEXT PAGE VALIDATION ==========

function validateSetupForm() {
  const requiredFields = [
    { id: 'matchNumber', label: 'Match Number', container: null },
    { id: 'scouterName', label: 'Scouter Name', container: null },
    { id: 'teamNumber', label: 'Team Number', container: null },
    { id: 'alliance', label: 'Alliance Position', container: '.alliance-options', isRadio: true },
    { id: 'startPos', label: 'Starting Position', container: '.start-options', isRadio: true }
  ];
  let isValid = true;
  const invalidFields = [];

  requiredFields.forEach(field => {
    if (field.isRadio) {
      const selected = document.querySelector(`#setup input[name="${field.id}"]:checked`);
      const container = document.querySelector(`#setup ${field.container}`);
      const parent = container ? container.parentElement : null;

      if (!selected) {
        invalidFields.push(field);
        if (parent) {
          parent.style.borderRadius = '12px';
          parent.style.border = '3px solid #ff4c4c';
          parent.style.padding = '12px';
          parent.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        }
        isValid = false;
      } else if (parent) {
        parent.style.border = '';
        parent.style.boxShadow = '';
        parent.style.padding = '';
        parent.style.borderRadius = '';
      }

      const radios = document.querySelectorAll(`#setup ${field.container} input`);
      radios.forEach(radio => {
        radio.addEventListener('click', () => {
          if (parent) {
            parent.style.border = '';
            parent.style.boxShadow = '';
            parent.style.padding = '';
            parent.style.borderRadius = '';
          }
        });
      });

    } else {
      const input = document.getElementById(field.id);
      if (!input.value.trim()) {
        invalidFields.push(field);
        input.style.borderColor = '#ff4c4c';
        input.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        input.style.outline = '2px solid #ff4c4c';
        isValid = false;
      } else {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        input.style.outline = '2px solid #2a2d31';
      }

      input.addEventListener('input', () => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        input.style.outline = '2px solid #2a2d31';
      });
    }
  });

  return isValid;
}

function getFirstInvalidSetupField() {
  const orderedFields = [
    { id: 'matchNumber', type: 'input' },
    { id: 'scouterName', type: 'input' },
    { id: 'teamNumber', type: 'input' },
    { id: 'alliance', type: 'radio', container: '.alliance-options' },
    { id: 'startPos', type: 'radio', container: '.start-options' }
  ];

  for (const field of orderedFields) {
    if (field.type === 'input') {
      const input = document.getElementById(field.id);
      if (input && !input.value.trim()) {
        return input;
      }
    } else if (field.type === 'radio') {
      const selected = document.querySelector(`#setup input[name="${field.id}"]:checked`);
      if (!selected) {
        const container = document.querySelector(`#setup ${field.container}`);
        return container ? container.parentElement : null;
      }
    }
  }

  return null;
}

function clearValidationHighlightForField(fieldNameOrElement) {
  let field = fieldNameOrElement;

  if (typeof fieldNameOrElement === 'string') {
    field = document.querySelector(`#setup input[name="${fieldNameOrElement}"]`);
  }

  if (!field) return;

  if (field.type === 'radio') {
    const selected = document.querySelector(`#setup input[name="${field.name}"]:checked`);
    if (selected) {
      let container = field.closest('.alliance-options, .start-options');
      if (container) {
        const parentField = container.closest('.field');
        if (parentField) {
          parentField.style.border = '';
          parentField.style.boxShadow = '';
          parentField.style.padding = '';
          parentField.style.borderRadius = '';
        }
      }
    }
  } else {
    if (field.value.trim() !== '') {
      field.style.borderColor = '';
      field.style.boxShadow = '';
      field.style.outline = '2px solid #2a2d31';
    }
  }
}

document.getElementById('matchNumber').addEventListener('input', e => clearValidationHighlightForField(e.target));
document.getElementById('scouterName').addEventListener('input', e => clearValidationHighlightForField(e.target));
document.getElementById('teamNumber').addEventListener('input', e => clearValidationHighlightForField(e.target));

document.querySelectorAll('#setup input[type="radio"][name="alliance"]').forEach(radio => {
  radio.addEventListener('change', e => clearValidationHighlightForField(e.target));
});

document.querySelectorAll('#setup input[type="radio"][name="startPos"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const field = radio.closest('.field');
    if (field) {
      field.style.border = '';
      field.style.boxShadow = '';
      field.style.padding = '';
      field.style.borderRadius = '';
    }
  });
});

document.getElementById('teamNumber').addEventListener('input', function () {
  updateTopStatusBar();
});
// ========== FORM VALIDATION ==========
function clearTeleopValidationHighlights() {
  const stuckBarField = document.querySelector('#teleop .field:nth-of-type(1)');
  const stuckBarRadios = document.querySelectorAll('#teleop input[name="stuckBar"]');
  const stuckBarSelected = Array.from(stuckBarRadios).some(rb => rb.checked);

  if (stuckBarSelected && stuckBarField) {
    stuckBarField.style.border = '';
    stuckBarField.style.boxShadow = '';
    stuckBarField.style.padding = '';
    stuckBarField.style.borderRadius = '';
  }

  const climbField = document.querySelector('#teleop .field:nth-of-type(4)');
  const climbRadios = document.querySelectorAll('#teleop input[name="climb-teleop"]');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);

  if (climbSelected && climbField) {
    climbField.style.border = '';
    climbField.style.boxShadow = '';
    climbField.style.padding = '';
    climbField.style.borderRadius = '';
  }

  const climbPosField = document.querySelector('#teleop .field:nth-of-type(6)');
  const climbPosRadios = document.querySelectorAll('#teleop input[name="climbPos"]');
  const climbPosSelected = Array.from(climbPosRadios).some(rb => rb.checked);
  const climbTeleopSelected = document.querySelector('#teleop input[name="climb-teleop"]:checked');
  const climbTeleopLabel = climbTeleopSelected?.nextElementSibling?.textContent?.trim() || '';

  if ((climbTeleopLabel === 'None' || climbPosSelected) && climbPosField) {
    climbPosField.style.border = '';
    climbPosField.style.boxShadow = '';
    climbPosField.style.padding = '';
    climbPosField.style.borderRadius = '';
  }
}

function validateTeleopForm() {
  let isValid = true;

  const stuckBarField = document.querySelector('#teleop .field:nth-of-type(1)');
  const stuckBarRadios = document.querySelectorAll('#teleop input[name="stuckBar"]');
  const stuckBarEnabled = Array.from(stuckBarRadios).some(rb => !rb.disabled);
  const stuckBarSelected = Array.from(stuckBarRadios).some(rb => rb.checked);

  if (stuckBarEnabled && !stuckBarSelected) {
    isValid = false;
    if (stuckBarField) {
      stuckBarField.style.borderRadius = '12px';
      stuckBarField.style.border = '3px solid #ff4c4c';
      stuckBarField.style.padding = '12px';
      stuckBarField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (stuckBarField) {
    stuckBarField.style.border = '';
    stuckBarField.style.boxShadow = '';
    stuckBarField.style.padding = '';
    stuckBarField.style.borderRadius = '';
  }

  const climbRadios = document.querySelectorAll('#teleop input[name="climb-teleop"]');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);
  const climbField = document.querySelector('#teleop .field:nth-of-type(4)');

  if (!climbSelected) {
    isValid = false;
    if (climbField) {
      climbField.style.borderRadius = '12px';
      climbField.style.border = '3px solid #ff4c4c';
      climbField.style.padding = '12px';
      climbField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (climbField) {
    climbField.style.border = '';
    climbField.style.boxShadow = '';
    climbField.style.padding = '';
    climbField.style.borderRadius = '';
  }

  const climbTeleopSelected = document.querySelector('#teleop input[name="climb-teleop"]:checked');
  const climbTeleopLabel = climbTeleopSelected?.nextElementSibling?.textContent?.trim() || '';
  const climbPosField = document.querySelector('#teleop .field:nth-of-type(6)'); 
  const climbPosRadios = document.querySelectorAll('#teleop input[name="climbPos"]');
  const climbPosSelected = Array.from(climbPosRadios).some(rb => rb.checked);

  if (climbTeleopLabel !== 'None' && !climbPosSelected) {
    isValid = false;
    if (climbPosField) {
      climbPosField.style.borderRadius = '12px';
      climbPosField.style.border = '3px solid #ff4c4c';
      climbPosField.style.padding = '12px';
      climbPosField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (climbPosField) {
    climbPosField.style.border = '';
    climbPosField.style.boxShadow = '';
    climbPosField.style.padding = '';
    climbPosField.style.borderRadius = '';
  }

  if (!isValid) {
    const invalidField = getFirstInvalidTeleopField();
    if (invalidField) {
      invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  stuckBarRadios.forEach(rb => rb.addEventListener('change', clearTeleopValidationHighlights));
  climbRadios.forEach(rb => rb.addEventListener('change', clearTeleopValidationHighlights));
  climbPosRadios.forEach(rb => rb.addEventListener('change', clearTeleopValidationHighlights));

  return isValid;
}

function getFirstInvalidTeleopField() {
  const stuckBarRadios = document.querySelectorAll('#teleop input[name="stuckBar"]');
  const stuckBarEnabled = Array.from(stuckBarRadios).some(rb => !rb.disabled);
  const stuckBarSelected = Array.from(stuckBarRadios).some(rb => rb.checked);
  if (stuckBarEnabled && !stuckBarSelected) {
    return document.querySelector('#teleop .field:nth-of-type(1)');
  }

  const climbRadios = document.querySelectorAll('#teleop input[name="climb-teleop"]');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);
  if (!climbSelected) {
    return document.querySelector('#teleop .field:nth-of-type(4)');
  }

  const climbTeleopSelected = document.querySelector('#teleop input[name="climb-teleop"]:checked');
  const climbTeleopLabel = climbTeleopSelected?.nextElementSibling?.textContent?.trim() || '';
  const climbPosRadios2 = document.querySelectorAll('#teleop input[name="climbPos"]');
  const climbPosSelected = Array.from(climbPosRadios2).some(rb => rb.checked);
  if (climbTeleopLabel !== 'None' && !climbPosSelected) {
    return document.querySelector('#teleop .field:nth-of-type(6)'); 
  }

  return null;
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('#teleop .climb-pos').forEach(opt => {
    opt.addEventListener('click', clearTeleopValidationHighlights);
  });

  document.querySelectorAll('#teleop input[name="climbPos"]').forEach(radio => {
    radio.addEventListener('change', clearTeleopValidationHighlights);
  });

  document.querySelectorAll('#teleop input[name="climb-teleop"]').forEach(radio => {
    radio.addEventListener('change', clearTeleopValidationHighlights);
  });

  document.querySelectorAll('#teleop input[name="stuckBar"]').forEach(radio => {
    radio.addEventListener('change', clearTeleopValidationHighlights);
  });
});
function validateTeleopForm() {
  let isValid = true;

  const stuckBarField = document.querySelector('#teleop .field:nth-of-type(1)');
  const stuckBarRadios = document.querySelectorAll('#teleop input[name="stuckBar"]');
  const stuckBarEnabled = Array.from(stuckBarRadios).some(rb => !rb.disabled);
  const stuckBarSelected = Array.from(stuckBarRadios).some(rb => rb.checked);

  if (stuckBarEnabled && !stuckBarSelected) {
    isValid = false;
    if (stuckBarField) {
      stuckBarField.style.borderRadius = '12px';
      stuckBarField.style.border = '3px solid #ff4c4c';
      stuckBarField.style.padding = '12px';
      stuckBarField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (stuckBarField) {
    stuckBarField.style.border = '';
    stuckBarField.style.boxShadow = '';
    stuckBarField.style.padding = '';
    stuckBarField.style.borderRadius = '';
  }

  const climbRadios = document.querySelectorAll('#teleop input[name="climb-teleop"]');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);
  const climbField = document.querySelector('#teleop .field:nth-of-type(4)');

  if (!climbSelected) {
    isValid = false;
    if (climbField) {
      climbField.style.borderRadius = '12px';
      climbField.style.border = '3px solid #ff4c4c';
      climbField.style.padding = '12px';
      climbField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (climbField) {
    climbField.style.border = '';
    climbField.style.boxShadow = '';
    climbField.style.padding = '';
    climbField.style.borderRadius = '';
  }

  const climbTeleopSelected = document.querySelector('#teleop input[name="climb-teleop"]:checked');
  const climbTeleopLabel = climbTeleopSelected?.nextElementSibling?.textContent?.trim() || '';
  const climbPosField = document.querySelector('#teleop .field:nth-of-type(6)');
  const climbPosRadios = document.querySelectorAll('#teleop input[name="climbPos"]');
  const climbPosSelected = Array.from(climbPosRadios).some(rb => rb.checked);

  if (climbTeleopLabel !== 'None' && !climbPosSelected) {
    isValid = false;
    if (climbPosField) {
      climbPosField.style.borderRadius = '12px';
      climbPosField.style.border = '3px solid #ff4c4c';
      climbPosField.style.padding = '12px';
      climbPosField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (climbPosField) {
    climbPosField.style.border = '';
    climbPosField.style.boxShadow = '';
    climbPosField.style.padding = '';
    climbPosField.style.borderRadius = '';
  }

  if (!isValid) {
    const invalidField = getFirstInvalidTeleopField();
    if (invalidField) {
      invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  stuckBarRadios.forEach(rb => rb.addEventListener('change', clearTeleopValidationHighlights));
  climbRadios.forEach(rb => rb.addEventListener('change', clearTeleopValidationHighlights));
  climbPosRadios.forEach(rb => rb.addEventListener('change', clearTeleopValidationHighlights));

  return isValid;
}

function getFirstInvalidTeleopField() {
  const stuckBarRadios = document.querySelectorAll('#teleop input[name="stuckBar"]');
  const stuckBarEnabled = Array.from(stuckBarRadios).some(rb => !rb.disabled);
  const stuckBarSelected = Array.from(stuckBarRadios).some(rb => rb.checked);
  if (stuckBarEnabled && !stuckBarSelected) {
    return document.querySelector('#teleop .field:nth-of-type(1)');
  }

  const climbRadios = document.querySelectorAll('#teleop input[name="climb-teleop"]');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);
  if (!climbSelected) {
    return document.querySelector('#teleop .field:nth-of-type(4)');
  }

  const climbTeleopSelected = document.querySelector('#teleop input[name="climb-teleop"]:checked');
  const climbTeleopLabel = climbTeleopSelected?.nextElementSibling?.textContent?.trim() || '';
  const climbPosRadios2 = document.querySelectorAll('#teleop input[name="climbPos"]');
  const climbPosSelected = Array.from(climbPosRadios2).some(rb => rb.checked);
  if (climbTeleopLabel !== 'None' && !climbPosSelected) {
    return document.querySelector('#teleop .field:nth-of-type(6)');
  }

  return null;
}

function validateEndcardsForm() {
  let isValid = true;

  const shootingRadios = document.querySelectorAll('#endcards input[name="shootingAccuracy"]');
  const shootingSelected = Array.from(shootingRadios).some(rb => rb.checked);
  const shootingField = document.querySelector('#endcards .field:nth-of-type(1)');

  if (!shootingSelected) {
    isValid = false;
    if (shootingField) {
      shootingField.style.borderRadius = '12px';
      shootingField.style.border = '3px solid #ff4c4c';
      shootingField.style.padding = '12px';
      shootingField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (shootingField) {
    shootingField.style.border = '';
    shootingField.style.boxShadow = '';
    shootingField.style.padding = '';
    shootingField.style.borderRadius = '';
  }

  const defenseOnRadios = document.querySelectorAll('#endcards input[name="defenseOn"]');
  const defenseOnSelected = Array.from(defenseOnRadios).some(rb => rb.checked);
  const defenseOnField = document.querySelector('#endcards .field:nth-of-type(2)');

  if (!defenseOnSelected) {
    isValid = false;
    if (defenseOnField) {
      defenseOnField.style.borderRadius = '12px';
      defenseOnField.style.border = '3px solid #ff4c4c';
      defenseOnField.style.padding = '12px';
      defenseOnField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (defenseOnField) {
    defenseOnField.style.border = '';
    defenseOnField.style.boxShadow = '';
    defenseOnField.style.padding = '';
    defenseOnField.style.borderRadius = '';
  }

  const robotDefenseRadios = document.querySelectorAll('#endcards input[name="robotDefense"]');
  const robotDefenseSelected = Array.from(robotDefenseRadios).some(rb => rb.checked);
  const robotDefenseField = document.querySelector('#endcards .field:nth-of-type(3)');

  if (!robotDefenseSelected) {
    isValid = false;
    if (robotDefenseField) {
      robotDefenseField.style.borderRadius = '12px';
      robotDefenseField.style.border = '3px solid #ff4c4c';
      robotDefenseField.style.padding = '12px';
      robotDefenseField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (robotDefenseField) {
    robotDefenseField.style.border = '';
    robotDefenseField.style.boxShadow = '';
    robotDefenseField.style.padding = '';
    robotDefenseField.style.borderRadius = '';
  }

  const driverSkillRadios = document.querySelectorAll('#endcards input[name="driverSkill"]');
  const driverSkillSelected = Array.from(driverSkillRadios).some(rb => rb.checked);
  const driverSkillField = document.querySelector('#endcards .field:nth-of-type(4)');

  if (!driverSkillSelected) {
    isValid = false;
    if (driverSkillField) {
      driverSkillField.style.borderRadius = '12px';
      driverSkillField.style.border = '3px solid #ff4c4c';
      driverSkillField.style.padding = '12px';
      driverSkillField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (driverSkillField) {
    driverSkillField.style.border = '';
    driverSkillField.style.boxShadow = '';
    driverSkillField.style.padding = '';
    driverSkillField.style.borderRadius = '';
  }

  const diedRadios = document.querySelectorAll('#endcards input[name="died"]');
  const diedSelected = Array.from(diedRadios).some(rb => rb.checked);
  const diedField = document.querySelector('#endcards .field:nth-of-type(5)');

  if (!diedSelected) {
    isValid = false;
    if (diedField) {
      diedField.style.borderRadius = '12px';
      diedField.style.border = '3px solid #ff4c4c';
      diedField.style.padding = '12px';
      diedField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (diedField) {
    diedField.style.border = '';
    diedField.style.boxShadow = '';
    diedField.style.padding = '';
    diedField.style.borderRadius = '';
  }

  const tippyRadios = document.querySelectorAll('#endcards input[name="tippy"]');
  const tippySelected = Array.from(tippyRadios).some(rb => rb.checked);
  const tippyField = document.querySelector('#endcards .field:nth-of-type(6)');

  if (!tippySelected) {
    isValid = false;
    if (tippyField) {
      tippyField.style.borderRadius = '12px';
      tippyField.style.border = '3px solid #ff4c4c';
      tippyField.style.padding = '12px';
      tippyField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (tippyField) {
    tippyField.style.border = '';
    tippyField.style.boxShadow = '';
    tippyField.style.padding = '';
    tippyField.style.borderRadius = '';
  }

  const comments = document.getElementById('comments').value.trim();
  if (!comments) {
    isValid = false;
    const commentsField = document.querySelector('#endcards .field:nth-of-type(7)');
    if (commentsField) {
      commentsField.style.borderRadius = '12px';
      commentsField.style.border = '3px solid #ff4c4c';
      commentsField.style.padding = '12px';
      commentsField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else {
    const commentsField = document.querySelector('#endcards .field:nth-of-type(7)');
    if (commentsField) {
      commentsField.style.border = '';
      commentsField.style.boxShadow = '';
      commentsField.style.padding = '';
      commentsField.style.borderRadius = '';
    }
  }

  if (!isValid) {
    const invalidField = getFirstInvalidEndcardsField();
    if (invalidField) {
      invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return isValid;
}

function getFirstInvalidEndcardsField() {
  const shootingSelected = Array.from(document.querySelectorAll('#endcards input[name="shootingAccuracy"]')).some(rb => rb.checked);
  if (!shootingSelected) {
    return document.querySelector('#endcards .field:nth-of-type(1)');
  }

  const defenseSelected = Array.from(document.querySelectorAll('#endcards input[name="defenseOn"]')).some(rb => rb.checked);
  if (!defenseSelected) {
    return document.querySelector('#endcards .field:nth-of-type(2)');
  }

  const robotDefenseSelected = Array.from(document.querySelectorAll('#endcards input[name="robotDefense"]')).some(rb => rb.checked);
  if (!robotDefenseSelected) {
    return document.querySelector('#endcards .field:nth-of-type(3)');
  }

  const driverSkillSelected = Array.from(document.querySelectorAll('#endcards input[name="driverSkill"]')).some(rb => rb.checked);
  if (!driverSkillSelected) {
    return document.querySelector('#endcards .field:nth-of-type(4)');
  }

  const diedSelected = Array.from(document.querySelectorAll('#endcards input[name="died"]')).some(rb => rb.checked);
  if (!diedSelected) {
    return document.querySelector('#endcards .field:nth-of-type(5)');
  }

  const tippySelected = Array.from(document.querySelectorAll('#endcards input[name="tippy"]')).some(rb => rb.checked);
  if (!tippySelected) {
    return document.querySelector('#endcards .field:nth-of-type(6)');
  }

  const comments = document.getElementById('comments').value.trim();
  if (!comments) {
    return document.querySelector('#endcards .field:nth-of-type(7)');
  }

  return null;
}

function clearEndcardsValidationHighlights() {
  document.querySelectorAll('#endcards .field').forEach(field => {
    const radios = field.querySelectorAll('input[type="radio"]');
    const selected = Array.from(radios).some(rb => rb.checked);

    if (selected) {
      field.style.border = '';
      field.style.boxShadow = '';
      field.style.padding = '';
      field.style.borderRadius = '';
    }
  });
}

document.querySelectorAll('#endcards .option').forEach(opt => {
  opt.addEventListener('click', clearEndcardsValidationHighlights);
});

document.getElementById('comments').addEventListener('input', () => {
  const commentsField = document.querySelector('#endcards .field:nth-of-type(7)');
  if (commentsField) {
    commentsField.style.border = '';
    commentsField.style.boxShadow = '';
    commentsField.style.padding = '';
    commentsField.style.borderRadius = '';
  }
});
function validateAutonomousForm() {
  let isValid = true;

  const fuelCheckboxes = document.querySelectorAll('#autonomous .fuel-option input, #autonomous .fuel-none input');
  const fuelSelected = Array.from(fuelCheckboxes).some(cb => cb.checked);
  const fuelField = document.querySelector('#autonomous .field:nth-of-type(3)');

  if (!fuelSelected) {
    isValid = false;
    if (fuelField) {
      fuelField.style.borderRadius = '12px';
      fuelField.style.border = '3px solid #ff4c4c';
      fuelField.style.padding = '12px';
      fuelField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (fuelField) {
    fuelField.style.border = '';
    fuelField.style.boxShadow = '';
    fuelField.style.padding = '';
    fuelField.style.borderRadius = '';
  }

  const travelCheckboxes = document.querySelectorAll('#autonomous .travel-option input, #autonomous .travel-na input');
  const travelSelected = Array.from(travelCheckboxes).some(cb => cb.checked);
  const travelField = document.querySelector('#autonomous .field:nth-of-type(4)');

  if (!travelSelected) {
    isValid = false;
    if (travelField) {
      travelField.style.borderRadius = '12px';
      travelField.style.border = '3px solid #ff4c4c';
      travelField.style.padding = '12px';
      travelField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (travelField) {
    travelField.style.border = '';
    travelField.style.boxShadow = '';
    travelField.style.padding = '';
    travelField.style.borderRadius = '';
  }

  const climbRadios = document.querySelectorAll('#autonomous .climb-option input');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);
  const climbField = document.querySelector('#autonomous .field:nth-of-type(5)');

  if (!climbSelected) {
    isValid = false;
    if (climbField) {
      climbField.style.borderRadius = '12px';
      climbField.style.border = '3px solid #ff4c4c';
      climbField.style.padding = '12px';
      climbField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
  } else if (climbField) {
    climbField.style.border = '';
    climbField.style.boxShadow = '';
    climbField.style.padding = '';
    climbField.style.borderRadius = '';
  }

  if (!isValid) {
    const invalidField = getFirstInvalidAutonomousField();
    if (invalidField) {
      invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return isValid;
}

function getFirstInvalidAutonomousField() {
  const fuelCheckboxes = document.querySelectorAll('#autonomous .fuel-option input, #autonomous .fuel-none input');
  const fuelSelected = Array.from(fuelCheckboxes).some(cb => cb.checked);
  if (!fuelSelected) {
    return document.querySelector('#autonomous .field:nth-of-type(3)');
  }

  const travelCheckboxes = document.querySelectorAll('#autonomous .travel-option input, #autonomous .travel-na input');
  const travelSelected = Array.from(travelCheckboxes).some(cb => cb.checked);
  if (!travelSelected) {
    return document.querySelector('#autonomous .field:nth-of-type(4)');
  }

  const climbRadios = document.querySelectorAll('#autonomous .climb-option input');
  const climbSelected = Array.from(climbRadios).some(rb => rb.checked);
  if (!climbSelected) {
    return document.querySelector('#autonomous .field:nth-of-type(5)');
  }

  return null;
}

function clearAutonomousValidationHighlights() {
  document.querySelectorAll('#autonomous .field').forEach(field => {
    const fuelCheckboxes = field.querySelectorAll('.fuel-option input, .fuel-none input');
    const travelCheckboxes = field.querySelectorAll('.travel-option input, .travel-na input');
    const climbRadios = field.querySelectorAll('.climb-option input');

    const fuelSelected = Array.from(fuelCheckboxes).some(cb => cb.checked);
    const travelSelected = Array.from(travelCheckboxes).some(cb => cb.checked);
    const climbSelected = Array.from(climbRadios).some(rb => rb.checked);

    if (fuelSelected || travelSelected || climbSelected) {
      field.style.border = '';
      field.style.boxShadow = '';
      field.style.padding = '';
      field.style.borderRadius = '';
    }
  });
}

document.querySelectorAll('#autonomous .option').forEach(opt => {
  opt.addEventListener('click', clearAutonomousValidationHighlights);
});



// ========== QR PAGE / DATA EXPORT ==========

function collectScoutingData() {
  const matchNumber = document.getElementById('matchNumber').value;
  const scouterName = document.getElementById('scouterName').value;

  const allianceRadio = document.querySelector('#setup input[name="alliance"]:checked');
  const alliancePosition = encodeAlliancePosition(allianceRadio?.id || '');

  const teamNumber = document.getElementById('teamNumber').value;

  const startPosRadio = document.querySelector('#setup input[name="startPos"]:checked');
  const startPosMap = { 'outpost': 'o', 'center': 'c', 'depot': 'd' };
  const startingPosition = startPosMap[startPosRadio?.id] || '';

  const fuelRaw = Array.from(document.querySelectorAll('#autonomous .fuel-option input, #autonomous .fuel-none input'))
    .filter(cb => cb.checked)
    .map(cb => cb.nextElementSibling.textContent);

  const fuelMap = { 'Neutral': 'N', 'Depot': 'D', 'Outpost': 'O' };
  let fuelCollection = (fuelRaw.length === 0 || fuelRaw.includes('None'))
    ? '-'
    : fuelRaw.map(p => fuelMap[p] || p).join('');
  fuelCollection = encodeFuelCollection(fuelCollection);

  let autoFuelCollected = document.getElementById("autoFuelCollectedInput")?.value || '0';
  autoFuelCollected = validateAutoFuelCollection(parseInt(autoFuelCollected) || 0, fuelCollection).toString(); const autoFuelFerried = document.getElementById("autoFuelFerriedInput")?.value || '0';

  const travelRaw = Array.from(document.querySelectorAll('#autonomous .travel-option input, #autonomous .travel-na input'))
    .filter(cb => cb.checked)
    .map(cb => cb.nextElementSibling.textContent);

  const travelMap = { 'Bump': 'B', 'Trench': 'T' };
  let travel = (travelRaw.length === 0 || travelRaw.includes('N/A'))
    ? '-'
    : travelRaw.map(p => travelMap[p] || p).join('');
  travel = encodeTravel(travel);

  const autoClimbRadio = document.querySelector('#autonomous input[name="climb-auto"]:checked');
  const autoClimbMap = { 'Level 1': '1', 'Failed': '.5', 'None': '0' };
  const autoClimb = autoClimbMap[autoClimbRadio?.nextElementSibling?.textContent?.trim()] || '';

  const stuckOnBarRadio = document.querySelector('#teleop input[name="stuckBar"]:checked');
  const stuckOnBarMap = { 'Yes': '1', 'No': '0' };
  let stuckOnBar = stuckOnBarMap[stuckOnBarRadio?.nextElementSibling?.textContent?.trim()] || '';

  if (autoClimb === '0' || autoClimb === '.5') {
    stuckOnBar = '-';
  }

  const teleClimbRadio = document.querySelector('#teleop input[name="climb-teleop"]:checked');
  const teleClimbMap = { 'Level 3': '3', 'Level 2': '2', 'Level 1': '1', 'Failed': '.5', 'None': '0' };
  const teleClimb = teleClimbMap[teleClimbRadio?.nextElementSibling?.textContent?.trim()] || '';

  const teleFuelCollected = document.getElementById("teleFuelCollectedInput")?.value || '0';
  const teleFuelFerried = document.getElementById("teleFuelFerriedInput")?.value || '0';

  const climbPosRadio = document.querySelector('#teleop input[name="climbPos"]:checked');
  const climbPosMap = { 'Depot': 'd', 'Center': 'c', 'Outpost': 'o' };
  let climbPosition = climbPosMap[climbPosRadio?.nextElementSibling?.textContent?.trim()] || '';

  if (teleClimb === '0') {
    climbPosition = '-';
  }
  const defenseOnRobotRadio = document.querySelector('#endcards input[name="defenseOn"]:checked');
  const defenseOnRobotMap = { 'Yes': '1', 'No': '0' };
  const defenseOnRobot = defenseOnRobotMap[defenseOnRobotRadio?.nextElementSibling?.textContent?.trim()] || '';

  const robotDefenseRadio = document.querySelector('#endcards input[name="robotDefense"]:checked');
  const robotDefenseMap = { 'Did Not Defend': '0', 'Ineffective': '1', 'Average': '2', 'Effective': '3' };
  const robotDefense = robotDefenseMap[robotDefenseRadio?.nextElementSibling?.textContent?.trim()] || '';

  const driverSkillRadio = document.querySelector('#endcards input[name="driverSkill"]:checked');
  const driverSkillMap = { 'Not Observed': '0', 'Ineffective': '1', 'Average': '2', 'Effective': '3' };
  const driverSkill = driverSkillMap[driverSkillRadio?.nextElementSibling?.textContent?.trim()] || '';

  const robotDiedRadio = document.querySelector('#endcards input[name="died"]:checked');
  const robotDiedMap = { 'Whole Match': '1', 'Partially': '.5', 'No': '0' };
  const robotDied = robotDiedMap[robotDiedRadio?.nextElementSibling?.textContent?.trim()] || '';

  const robotTippyRadio = document.querySelector('#endcards input[name="tippy"]:checked');
  const robotTippyMap = { 'Yes': '1', 'No': '0' };
  const robotTippy = robotTippyMap[robotTippyRadio?.nextElementSibling?.textContent?.trim()] || '';

  const comments = document.getElementById('comments').value;

  return {
    matchNumber,
    scouterName,
    alliancePosition,
    teamNumber,
    startingPosition,
    fuelCollection,
    autoFuelCollected,
    autoFuelFerried,
    teleFuelCollected,
    teleFuelFerried,
    travel,
    autoClimb,
    stuckOnBar,
    teleClimb,
    climbPosition,
    defenseOnRobot,
    robotDefense,
    driverSkill,
    robotDied,
    robotTippy,
    comments
  };
}
function buildTabSeparatedPayload(data) {
  const fields = [
    data.matchNumber,
    data.scouterName,
    data.alliancePosition,
    data.teamNumber,
    data.startingPosition,
    data.fuelCollection,
    data.autoFuelCollected,
    data.autoFuelFerried,
    data.teleFuelCollected,
    data.teleFuelFerried,
    data.travel,
    data.autoClimb,
    data.stuckOnBar,
    data.teleClimb,
    data.climbPosition,
    data.defenseOnRobot,
    data.robotDefense,
    data.driverSkill,
    data.robotDied,
    data.robotTippy,
    data.comments
  ];

  const safe = fields.map((v, i) => {
    let s = (v === undefined || v === null) ? '' : String(v).trim().replace(/\t|\r|\n/g, ' ');
    if (i !== fields.length - 1 && s === '') s = '-';
    return s;
  });

  return safe.join('\t') + '\n';
}


function tabSeparatedToCsv(content) {
  const lines = content.trim().split(/\r?\n/).filter(l => l.length > 0);
  const converted = lines.map(line => {
    const fields = line.split('\t');
    return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',');
  }).join('\r\n');
  return converted + '\r\n';
}

function downloadScoutingData() {
  const tsvData = localStorage.getItem('scoutingDataCSV');
  if (!tsvData) {
    alert('No scouting data saved yet.');
    return;
  }

  const csvContent = tabSeparatedToCsv(tsvData);
  const content = '\uFEFF' + csvContent;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `scoutingData_${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clearScoutingData() {
  if (confirm('Are you sure you want to clear all scouting data?')) {
    localStorage.removeItem('scoutingDataCSV');
    alert('Scouting data cleared.');
  }
}

function downloadCSV(csvContent, fileName) {
  let prepared = csvContent;
  if (csvContent && csvContent.indexOf('\t') !== -1) {
    prepared = tabSeparatedToCsv(csvContent);
  }

  const content = '\uFEFF' + prepared;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

let qrCodeInstance = null;

function getCheckedValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.nextElementSibling.innerText : "";
}

function getCheckedList(selector) {
  return [...document.querySelectorAll(selector + " input:checked")]
    .map(cb => cb.nextElementSibling.innerText)
    .join(", ");
}

function saveDataToCSV() {
  const matchNumber = document.getElementById("matchNumber").value;
  const scouterName = document.getElementById("scouterName").value;
  const allianceRaw = document.querySelector('input[name="alliance"]:checked')?.id || "";
  const alliance = encodeAlliancePosition(allianceRaw);
  const teamNumber = document.getElementById("teamNumber").value;
  const teamName = document.getElementById("teamName").value;

  let startingPosition = '-';
  let fuelCollection = '-';
  let autoFuelCollected = '0';
  let autoFuelFerried = '0';
  let teleFuelCollected = '0';
  let teleFuelFerried = '0';
  let travel = '-';
  let climbAuto = '-';
  let stuckOnBar = '-';
  let climbTeleop = '-';
  let climbPosition = '-';
  let shootingAccuracy = '-';
  let defenseOnRobot = '-';
  let robotDefense = '-';
  let driverSkill = '-';
  let robotDied = '-';
  let robotTippy = '-';
  let comments = document.getElementById("comments").value.replace(/\t|\n/g, " ");

  if (robotMissing) {
    startingPosition = 'R';
    fuelCollection = '-';
    autoFuelCollected = '0';
    autoFuelFerried = '0';
    teleFuelCollected = '0';
    teleFuelFerried = '0';
    travel = '-';
    climbAuto = '0';
    stuckOnBar = '-';
    climbTeleop = '0';
    climbPosition = '-';
    shootingAccuracy = '0';
    defenseOnRobot = '0';
    robotDefense = '0';
    driverSkill = '0';
    robotDied = '1';
    robotTippy = '0';
    comments = 'Robot Missing';
  } else {
    const startingPositionRaw = getCheckedValue("startPos");
    const startMap = { 'Outpost': 'O', 'Center': 'C', 'Depot': 'D' };
    startingPosition = startMap[startingPositionRaw] || '-';

    const fuelRaw = getCheckedList(".fuel-option");
    fuelCollection = '-';
    if (fuelRaw) {
      const parts = fuelRaw.split(',').map(s => s.trim());
      if (parts.includes('None')) {
        fuelCollection = '-';
      } else {
        const map = { 'Neutral': 'N', 'Depot': 'D', 'Outpost': 'O' };
        fuelCollection = parts.map(p => map[p] || p).join('');
      }
    }

    const travelRaw = getCheckedList(".travel-option");
    travel = '-';
    if (travelRaw) {
      const parts = travelRaw.split(',').map(s => s.trim());
      if (parts.includes('N/A')) {
        travel = '-';
      } else {
        const map = { 'Bump': 'B', 'Trench': 'T' };
        travel = parts.map(p => map[p] || p).join('');
      }
    }

    travel = encodeTravel(travel);

    fuelCollection = encodeFuelCollection(fuelCollection);

    autoFuelCollected = document.getElementById("autoFuelCollectedInput")?.value || '0';
    autoFuelCollected = validateAutoFuelCollection(parseInt(autoFuelCollected) || 0, fuelCollection).toString();

    autoFuelFerried = document.getElementById("autoFuelFerriedInput")?.value || '0';
    teleFuelCollected = document.getElementById("teleFuelCollectedInput")?.value || '0';
    teleFuelFerried = document.getElementById("teleFuelFerriedInput")?.value || '0';

    const climbAutoRaw = getCheckedValue("climb-auto");
    const climbAutoMap = { 'Level 1': '1', 'Failed': 'F', 'None': '0' };
    climbAuto = climbAutoMap[climbAutoRaw] || '-';

    stuckOnBar = (getCheckedValue("stuckBar") === 'Yes') ? '1' : ((getCheckedValue("stuckBar") === 'No') ? '0' : '-');
    if (climbAuto === '0' || climbAuto === 'F') stuckOnBar = '-';

    const climbTeleopRaw = getCheckedValue("climb-teleop");
    const climbTeleMap = { 'Level 3': '3', 'Level 2': '2', 'Level 1': '1', 'Failed': 'F', 'None': '0' };
    climbTeleop = climbTeleMap[climbTeleopRaw] || '-';

    const climbPosRaw = getCheckedValue("climbPos");
    const climbPosMap = { 'Depot': 'D', 'Center': 'C', 'Outpost': 'O' };
    climbPosition = climbPosMap[climbPosRaw] || '-';
    if (climbTeleop === '0') {
      climbPosition = '-';
    }

    const shootingAccuracyRaw = getCheckedValue("shootingAccuracy");
    const shootingAccuracyMap = {
      'Poor (0-25%)': '0',
      'Below Average (26-50%)': '1',
      'Average (51-75%)': '2',
      'Excellent (76-100%)': '3'
    };
    shootingAccuracy = shootingAccuracyMap[shootingAccuracyRaw] || '-';

    defenseOnRobot = (getCheckedValue("defenseOn") === 'Yes') ? '1' : ((getCheckedValue("defenseOn") === 'No') ? '0' : '-');

    const robotDefenseRaw = getCheckedValue("robotDefense");
    const robotDefenseMap = { 'Did Not Defend': '0', 'Ineffective': '1', 'Average': '2', 'Effective': '3' };
    robotDefense = robotDefenseMap[robotDefenseRaw] || '-';

    const driverSkillRaw = getCheckedValue("driverSkill");
    const driverSkillMap = { 'Not Observed': '0', 'Ineffective': '1', 'Average': '2', 'Effective': '3' };
    driverSkill = driverSkillMap[driverSkillRaw] || '-';

    const robotDiedRaw = getCheckedValue("died");
    const robotDiedMap = { 'Whole Match': '1', 'Partially': '0.5', 'No': '0' };
    robotDied = robotDiedMap[robotDiedRaw] || '-';

    robotTippy = (getCheckedValue("tippy") === 'Yes') ? '1' : ((getCheckedValue("tippy") === 'No') ? '0' : '-');
  }

  function norm(v, allowEmpty = false) {
    const s = (v === undefined || v === null) ? '' : String(v).trim();
    if (!allowEmpty && s === '') return '-';
    return s.replace(/\t|\r|\n/g, ' ');
  }

  const fields = [
    norm(matchNumber),
    norm(scouterName),
    norm(alliance),
    norm(teamNumber),
    norm(startingPosition),
    norm(fuelCollection),
    norm(autoFuelCollected),
    norm(autoFuelFerried),
    norm(teleFuelCollected),
    norm(teleFuelFerried),
    norm(travel),
    norm(climbAuto),
    norm(stuckOnBar),
    norm(climbTeleop),
    norm(climbPosition),
    norm(shootingAccuracy),
    norm(defenseOnRobot),
    norm(robotDefense),
    norm(driverSkill),
    norm(robotDied),
    norm(robotTippy),
    norm(comments, true)
  ];

  const row = fields.map(cleanField).join("\t");

  const csvKey = 'scoutingDataCSV';
  const header = "Match Number\tScouter Name\tAlliance\tTeam Number\tStarting Position\tFuel Collection\tAuto Fuel Shot\tAuto Fuel Ferried\tTele Fuel Shot\tTele Fuel Ferried\tTravel\tClimb Auto\tStuck On Bar\tClimb Teleop\tClimb Position\tShooting Accuracy\tDefense On Robot\tRobot Defense\tDriver Skill\tRobot Died\tRobot Tippy\tComments\n";
  const existing = localStorage.getItem(csvKey);
  const newRow = row + '\n';

  if (!existing) {
    localStorage.setItem(csvKey, header + newRow);
  } else {
    localStorage.setItem(csvKey, existing + newRow);
  }

  const qrFields = fields.slice(0, 21).map(cleanField).join("\t") + '\n';
  localStorage.setItem('lastQRCodeData', qrFields);
  generateQRCode(qrFields);
}
function restoreQRCodeFromStorage() {
  const lastQRCodeData = localStorage.getItem('lastQRCodeData');
  if (!lastQRCodeData) return;
  const qrContainer = document.getElementById('qrContainer');
  if (qrContainer) {
    generateQRCode(lastQRCodeData);
  }
}

function generateQRCode(cleanData) {
  const qrContainer = document.getElementById("qrContainer");
  const qrDataText = document.getElementById("qrDataText");

  qrContainer.innerHTML = "";

  const wrapper = document.getElementById("qrContainerWrapper");
  let qrSize;

  if (wrapper) {
    const wrapperWidth = wrapper.clientWidth;
    qrSize = wrapperWidth - 40;
    if (qrSize > 350) qrSize = 350;
    if (qrSize < 250) qrSize = 250;
  } else {
    const viewportWidth = window.innerWidth;
    if (viewportWidth > 768) {
      qrSize = 300;
    } else {
      qrSize = viewportWidth - 30;
      if (qrSize < 200) qrSize = 200;
    }
  }

  qrCodeInstance = new QRCode(qrContainer, {
    text: cleanData,
    width: qrSize,
    height: qrSize,
    correctLevel: QRCode.CorrectLevel.L,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });

  const qrCanvas = qrContainer.querySelector('canvas');
  if (qrCanvas) {
    qrCanvas.style.position = 'relative';
    qrCanvas.style.zIndex = '10';
    qrCanvas.style.display = 'block';
    qrCanvas.style.margin = '0 auto';
  }

  qrDataText.value = cleanData;
}
function cleanField(v) {
  if (v === undefined || v === null) return '-';
  return String(v).replace(/[\r\n\t]+/g, ' ').trim() || '-';
}

// ========== ROBOT MISSING FUNCTIONALITY ==========
let robotMissing = false;
const robotMissingBtn = document.getElementById('robotMissingBtn');
const robotMissingStatus = document.getElementById('robotMissingStatus');

function toggleRobotMissing() {
  robotMissing = !robotMissing;

  if (robotMissingBtn) {
    robotMissingBtn.textContent = robotMissing ? 'Undo Robot Missing' : 'Mark Robot Missing';
    robotMissingBtn.style.backgroundColor = robotMissing ? '#666' : '#ff4c4c';
  }

  if (robotMissingStatus) {
    robotMissingStatus.style.display = robotMissing ? 'block' : 'none';
  }

  const startPosField = document.querySelector('#setup .field:nth-of-type(5)');
  if (startPosField) {
    startPosField.style.border = '';
    startPosField.style.boxShadow = '';
    startPosField.style.padding = '';
    startPosField.style.borderRadius = '';
  }

  if (robotMissing) {

    const requiredFields = ['matchNumber', 'scouterName', 'teamNumber'];
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.disabled = false;
        field.style.opacity = '';
        field.style.pointerEvents = '';
      }
    });

    const teamNameInput = document.getElementById('teamName');
    if (teamNameInput && !teamNameInput.disabled) {
      teamNameInput.disabled = false;
      teamNameInput.style.opacity = '';
      teamNameInput.style.pointerEvents = '';
    }

    document.querySelectorAll('#setup .alliance-options input, #setup .alliance-options .option').forEach(el => {
      el.disabled = false;
      el.style.opacity = '';
      el.style.pointerEvents = 'auto';
    });

    document.querySelectorAll('#setup input[name="startPos"], #setup .start-options .option, #startPosImage, #climbPosImage').forEach(el => {
      el.disabled = true;
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';
    });


    document.querySelectorAll('#setup input[name="startPos"], #setup .start-options .option, #startPosImage').forEach(el => {
      el.disabled = true;
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';

      if (el.tagName === 'INPUT' && el.type === 'radio') {
        el.checked = false;
      }

      if (el.classList && el.classList.contains('option')) {
        el.classList.remove('highlight');
      }
    });

    const disableSelectors = [
      '#autonomous input',
      '#autonomous .option',

      '#teleop input',
      '#teleop .option',
      '#climbHoldButton',
      '#climbResetButton',

      '#endcards input',
      '#endcards .option',
      '#endcards textarea'
    ];

    disableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';

        if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
          el.checked = false;
        }

        if (el.classList.contains('option')) {
          el.classList.remove('highlight', 'red', 'blue');
          el.style.pointerEvents = 'none';
        }
      });
    });

    document.querySelectorAll('#endcards textarea').forEach(textarea => {
      textarea.value = '';
    });

    if (climbResetButton) {
      climbResetButton.click();
    }

    if (commentsCounter) {
      commentsCounter.innerText = '150 characters remaining';
      commentsCounter.style.color = '#aaa';
    }

    ['autoFuelCollected', 'autoFuelFerried', 'teleFuelCollected', 'teleFuelFerried'].forEach(id => {
      const display = document.getElementById(id);
      const input = document.getElementById(id + 'Input');
      if (display) display.textContent = '0';
      if (input) input.value = '0';
    });

    document.querySelectorAll('#autonomous .counter-modern button, #teleop .counter-modern button').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    });

  } else {

    const allInputs = document.querySelectorAll('input, textarea, button, .option, #startPosImage');
    allInputs.forEach(el => {
      el.disabled = false;
      el.style.opacity = '';
      el.style.pointerEvents = '';
    });

    const selectedAlliance = document.querySelector('#setup input[name="alliance"]:checked');
    if (selectedAlliance) {
      setStartPosImageForAlliance(selectedAlliance.id);
      setClimbPosImageForAlliance(selectedAlliance.id);
      updateStartPosOrder(selectedAlliance.id);
    }
    document.querySelectorAll('.field').forEach(field => {
      field.style.border = '';
      field.style.boxShadow = '';
      field.style.padding = '';
      field.style.borderRadius = '';
    });
  }
}

if (robotMissingBtn) {
  robotMissingBtn.replaceWith(robotMissingBtn.cloneNode(true));

  const freshRobotMissingBtn = document.getElementById('robotMissingBtn');

  freshRobotMissingBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleRobotMissing();
    return false;
  });

  freshRobotMissingBtn.type = 'button';
}
['matchNumber', 'scouterName', 'teamNumber'].forEach(id => {
  const field = document.getElementById(id);
  if (field) {
    field.addEventListener('input', function () {
      this.style.borderColor = '';
      this.style.boxShadow = '';
    });
  }
});

document.querySelectorAll('#setup .alliance-options .option').forEach(opt => {
  opt.addEventListener('click', function () {
    const allianceContainer = document.querySelector('#setup .alliance-options').parentElement;
    allianceContainer.style.border = '';
    allianceContainer.style.boxShadow = '';
    allianceContainer.style.padding = '';
    allianceContainer.style.borderRadius = '';
  });
});

const setupNextButton = document.querySelector('#setup .next-button-container .next-button');
if (setupNextButton) {
  try { if (setupNextButton.removeAttribute) setupNextButton.removeAttribute('onclick'); } catch (err) { }
  try { setupNextButton.onclick = null; } catch (err) { }

  setupNextButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (robotMissing) {
      const matchNumber = document.getElementById('matchNumber').value.trim();
      const scouterName = document.getElementById('scouterName').value.trim();
      const teamNumber = document.getElementById('teamNumber').value.trim();
      const teamName = document.getElementById('teamName').value.trim();
      const allianceSelected = document.querySelector('#setup input[name="alliance"]:checked');

      let isValid = true;
      let firstInvalidField = null;

      const matchField = document.getElementById('matchNumber');
      if (!matchNumber) {
        matchField.style.borderColor = '#ff4c4c';
        matchField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        matchField.style.outline = '2px solid #ff4c4c';
        isValid = false;
        if (!firstInvalidField) firstInvalidField = matchField;
      } else {
        matchField.style.borderColor = '';
        matchField.style.boxShadow = '';
        matchField.style.outline = '2px solid #2a2d31';
      }

      const scouterField = document.getElementById('scouterName');
      if (!scouterName) {
        scouterField.style.borderColor = '#ff4c4c';
        scouterField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        scouterField.style.outline = '2px solid #ff4c4c';
        isValid = false;
        if (!firstInvalidField) firstInvalidField = scouterField;
      } else {
        scouterField.style.borderColor = '';
        scouterField.style.boxShadow = '';
        scouterField.style.outline = '2px solid #2a2d31';
      }

      const teamField = document.getElementById('teamNumber');
      if (!teamNumber) {
        teamField.style.borderColor = '#ff4c4c';
        teamField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        teamField.style.outline = '2px solid #ff4c4c';
        isValid = false;
        if (!firstInvalidField) firstInvalidField = teamField;
      } else {
        teamField.style.borderColor = '';
        teamField.style.boxShadow = '';
        teamField.style.outline = '2px solid #2a2d31';
      }

      const teamNameField = document.getElementById('teamName');
      const teamCSVUploaded = localStorage.getItem('teamCSV');

      if (teamCSVUploaded && !teamName) {
        teamNameField.style.borderColor = '#ff4c4c';
        teamNameField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        teamNameField.style.outline = '2px solid #ff4c4c';
        isValid = false;
        if (!firstInvalidField) firstInvalidField = teamNameField;
      } else {
        teamNameField.style.borderColor = '';
        teamNameField.style.boxShadow = '';
        teamNameField.style.outline = '2px solid #2a2d31';
      }

      const allianceContainer = document.querySelector('#setup .alliance-options').parentElement;
      if (!allianceSelected) {
        allianceContainer.style.borderRadius = '12px';
        allianceContainer.style.border = '3px solid #ff4c4c';
        allianceContainer.style.padding = '12px';
        allianceContainer.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
        isValid = false;
        if (!firstInvalidField) {
          allianceContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        allianceContainer.style.border = '';
        allianceContainer.style.boxShadow = '';
        allianceContainer.style.padding = '';
        allianceContainer.style.borderRadius = '';
      }
      const startPosField = document.querySelector('#setup .field:nth-of-type(5)');
      if (startPosField) {
        startPosField.style.border = '';
        startPosField.style.boxShadow = '';
        startPosField.style.padding = '';
        startPosField.style.borderRadius = '';
      }

      if (isValid) {
        saveDataToCSV();
        goToSection('qr');
        return false;
      } else if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    } else {
      if (validateSetupForm()) {
        goToSection('match-start');
      } else {
        const invalidTarget = getFirstInvalidSetupField();
        if (invalidTarget) {
          invalidTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    return false;
  }, { passive: false });
}
const originalValidateSetupForm = validateSetupForm;

function validateSetupForRobotMissing() {
  let isValid = true;
  let firstInvalid = null;

  const matchField = document.getElementById('matchNumber');
  const scouterField = document.getElementById('scouterName');
  const teamField = document.getElementById('teamNumber');
  const allianceContainerEl = document.querySelector('#setup .alliance-options');
  const allianceContainer = allianceContainerEl ? allianceContainerEl.parentElement : null;
  const allianceSelected = document.querySelector('#setup input[name="alliance"]:checked');

  [matchField, scouterField, teamField].forEach(f => {
    if (f) {
      f.style.borderColor = '';
      f.style.boxShadow = '';
      f.style.outline = '2px solid #2a2d31';
    }
  });
  if (allianceContainer) {
    allianceContainer.style.border = '';
    allianceContainer.style.boxShadow = '';
    allianceContainer.style.padding = '';
    allianceContainer.style.borderRadius = '';
  }

  if (!matchField || !matchField.value.trim()) {
    if (matchField) {
      matchField.style.borderColor = '#ff4c4c';
      matchField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
      matchField.style.outline = '2px solid #ff4c4c';
    }
    isValid = false;
    if (!firstInvalid && matchField) firstInvalid = matchField;
  }

  if (!scouterField || !scouterField.value.trim()) {
    if (scouterField) {
      scouterField.style.borderColor = '#ff4c4c';
      scouterField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
      scouterField.style.outline = '2px solid #ff4c4c';
    }
    isValid = false;
    if (!firstInvalid && scouterField) firstInvalid = scouterField;
  }

  if (!teamField || !teamField.value.trim()) {
    if (teamField) {
      teamField.style.borderColor = '#ff4c4c';
      teamField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
      teamField.style.outline = '2px solid #ff4c4c';
    }
    isValid = false;
    if (!firstInvalid && teamField) firstInvalid = teamField;
  }

  const teamCSVUploaded = localStorage.getItem('teamCSV');
  const teamNameField = document.getElementById('teamName');
  if (teamCSVUploaded && teamNameField && !teamNameField.value.trim()) {
    teamNameField.style.borderColor = '#ff4c4c';
    teamNameField.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    teamNameField.style.outline = '2px solid #ff4c4c';
    isValid = false;
    if (!firstInvalid && teamNameField) firstInvalid = teamNameField;
  }

  if (!allianceSelected) {
    if (allianceContainer) {
      allianceContainer.style.borderRadius = '12px';
      allianceContainer.style.border = '3px solid #ff4c4c';
      allianceContainer.style.padding = '12px';
      allianceContainer.style.boxShadow = '0 0 10px rgba(255, 76, 76, 0.3)';
    }
    isValid = false;
    if (!firstInvalid && allianceContainer) firstInvalid = allianceContainer;
  }

  if (!isValid && firstInvalid && typeof firstInvalid.scrollIntoView === 'function') {
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

validateSetupForm = function () {
  if (robotMissing) {
    return validateSetupForRobotMissing();
  }
  return originalValidateSetupForm();
};
// ========== MATCH START PAGE ==========

function updateMatchStartButtonColor() {
  const startButton = document.getElementById('matchStartButton');
  if (!startButton) return;

  const selectedAlliance = document.querySelector('#setup input[name="alliance"]:checked');
  if (!selectedAlliance) return;

  startButton.classList.remove('alliance-red', 'alliance-blue');

  if (selectedAlliance.id.startsWith('R')) {
    startButton.classList.add('alliance-red');
  } else if (selectedAlliance.id.startsWith('B')) {
    startButton.classList.add('alliance-blue');
  }
}

function updateTopStatusBar() {
  const allianceRadio = document.querySelector('#setup input[name="alliance"]:checked');
  const allianceValue = document.getElementById('statusAlliance');
  const teamValue = document.getElementById('statusTeam');
  const startPosValue = document.getElementById('statusStartPos');

  let allianceColor = '';

  if (allianceRadio) {
    let allianceText = allianceRadio.id;
    allianceValue.textContent = allianceText;

    if (allianceRadio.id.startsWith('R')) {
      allianceColor = 'alliance-red';
      allianceValue.classList.remove('alliance-blue');
      allianceValue.classList.add('alliance-red');
    } else {
      allianceColor = 'alliance-blue';
      allianceValue.classList.remove('alliance-red');
      allianceValue.classList.add('alliance-blue');
    }
  } else {
    allianceValue.textContent = '—';
    allianceValue.classList.remove('alliance-red', 'alliance-blue');
    allianceColor = '';
  }

  const teamNumber = document.getElementById('teamNumber').value.trim();
  teamValue.textContent = teamNumber || '—';
  teamValue.classList.remove('alliance-red', 'alliance-blue');
  if (allianceColor) {
    teamValue.classList.add(allianceColor);
  }

  const startPosRadio = document.querySelector('#setup input[name="startPos"]:checked');
  if (startPosRadio) {
    const startMap = {
      'outpost': 'Outpost',
      'center': 'Center',
      'depot': 'Depot'
    };
    let startText = startMap[startPosRadio.id] || startPosRadio.id;
    startText = startText.charAt(0).toUpperCase() + startText.slice(1);
    startPosValue.textContent = startText;
  } else {
    startPosValue.textContent = '—';
  }
  startPosValue.classList.remove('alliance-red', 'alliance-blue');
  if (allianceColor) {
    startPosValue.classList.add(allianceColor);
  }
}
function goToMatchStart() {
  goToSection('match-start');
}

function startMatch() {
  const btn = document.getElementById('matchStartButton');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 100);

  goToSection('autonomous');
}

document.addEventListener('keydown', function (e) {
  if (e.code === 'Space' && document.getElementById('match-start').classList.contains('active')) {
    e.preventDefault();
    startMatch();
  }
});

// ========== AUTONOMOUS TIMER ==========
let autonomousTimer = null;
let autonomousTimeLeft = 25;
let timerFlashInterval = null;
let isTimerFlashing = false;

function startAutonomousTimer() {
  stopAutonomousTimer();

  autonomousTimeLeft = 25;
  isTimerFlashing = false;

  createTimerDisplay();

  updateTimerDisplay();

  autonomousTimer = setInterval(() => {
    autonomousTimeLeft -= 1;
    updateTimerDisplay();

    if (autonomousTimeLeft <= 0) {
      stopAutonomousTimer();
      startTimerFlashing();
    }
  }, 1000);
}

function stopAutonomousTimer() {
  if (autonomousTimer) {
    clearInterval(autonomousTimer);
    autonomousTimer = null;
  }
}

function createTimerDisplay() {
  const existingTimer = document.getElementById('autonomousTimer');
  if (existingTimer) {
    existingTimer.remove();
  }

  const timerDiv = document.createElement('div');
  timerDiv.id = 'autonomousTimer';
  timerDiv.className = 'autonomous-timer';
  timerDiv.innerHTML = `
    <div class="timer-label">AUTONOMOUS</div>
    <div class="timer-value">25s</div>
  `;

  document.getElementById('autonomous').appendChild(timerDiv);
}

function updateTimerDisplay() {
  const timerValue = document.querySelector('#autonomousTimer .timer-value');
  const timerBox = document.getElementById('autonomousTimer');

  if (timerValue && timerBox) {
    timerValue.textContent = `${autonomousTimeLeft}s`;

    if (autonomousTimeLeft <= 5 && autonomousTimeLeft > 0) {
      timerValue.style.color = '#ff6600';
      timerBox.style.borderColor = '#ff6600';
    } else if (autonomousTimeLeft <= 10 && autonomousTimeLeft > 5) {
      timerValue.style.color = '#ffaa00';
      timerBox.style.borderColor = '#ffaa00';
    } else {
      timerValue.style.color = '#1e90ff';
      timerBox.style.borderColor = '#1e90ff';
    }
  }
}

let vibrationInterval = null;

function startTimerFlashing() {
  if (isTimerFlashing) return;

  isTimerFlashing = true;
  const timerDiv = document.getElementById('autonomousTimer');
  const timerValue = document.querySelector('#autonomousTimer .timer-value');
  const timerLabel = document.querySelector('#autonomousTimer .timer-label');

  if (timerValue) {
    timerValue.textContent = '0s';
    timerValue.style.color = '#ff4c4c';
  }
  if (timerLabel) {
    timerLabel.style.color = '#ff4c4c';
  }

  if (timerDiv) {
    timerDiv.classList.add('aggressive-timer');
  }

  document.body.classList.add('timer-flashing-aggressive');

  timerFlashInterval = setInterval(() => {
    document.body.classList.toggle('timer-flash-active');
  }, 300);

  if ('vibrate' in navigator) {
    function startVibrationPattern() {
      if (!isTimerFlashing) return;

      navigator.vibrate([60, 100, 80, 100, 60]);

      vibrationInterval = setTimeout(() => {
        if (isTimerFlashing) {
          startVibrationPattern();
        }
      }, 600);
    }

    startVibrationPattern();
  } else {
    console.log("Vibration API not supported on this device");
  }
}

function stopTimerFlashing() {
  if (timerFlashInterval) {
    clearInterval(timerFlashInterval);
    timerFlashInterval = null;
  }

  if (vibrationInterval) {
    clearTimeout(vibrationInterval);
    vibrationInterval = null;
  }

  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }

  isTimerFlashing = false;
  document.body.classList.remove('timer-flashing-aggressive', 'timer-flash-active');

  const timerDiv = document.getElementById('autonomousTimer');
  if (timerDiv) {
    timerDiv.classList.remove('aggressive-timer');
    const timerValue = timerDiv.querySelector('.timer-value');
    const timerLabel = timerDiv.querySelector('.timer-label');
    if (timerValue) timerValue.style.color = '';
    if (timerLabel) timerLabel.style.color = '';
  }

  document.body.style.backgroundColor = '';
}

function startAutonomousTimer() {
  stopAutonomousTimer();
  stopTimerFlashing();

  autonomousTimeLeft = 25;
  isTimerFlashing = false;

  createTimerDisplay();
  updateTimerDisplay();

  autonomousTimer = setInterval(() => {
    autonomousTimeLeft -= 1;
    updateTimerDisplay();

    if (autonomousTimeLeft <= 0) {
      stopAutonomousTimer();
      startTimerFlashing();
    }
  }, 1000);
}

const originalGoToSectionForTimer = window.goToSection;
window.goToSection = function (sectionId) {
  if (sectionId !== 'autonomous') {
    stopAutonomousTimer();
    stopTimerFlashing();

    const timer = document.getElementById('autonomousTimer');
    if (timer) {
      timer.remove();
    }
  }

  if (typeof originalGoToSectionForTimer === 'function') {
    originalGoToSectionForTimer(sectionId);
  } else {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
  }

  if (sectionId === 'teleop') {
    if (typeof updateStuckBarState === 'function') updateStuckBarState();
  }
};

const originalStartMatch = window.startMatch;
window.startMatch = function () {
  stopTimerFlashing();

  const btn = document.getElementById('matchStartButton');
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (btn) btn.style.transform = '';
    }, 100);
  }

  goToSection('autonomous');
  startAutonomousTimer();
};

document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.altKey && e.code === 'KeyS') {
    e.preventDefault();
    if (document.getElementById('autonomous').classList.contains('active')) {
      stopTimerFlashing();
      console.log("Flashing stopped manually");
    }
  }
});

window.addEventListener('beforeunload', function (event) {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
  event.preventDefault();
  event.returnValue = '';
  return '';
});

window.onbeforeunload = function (event) {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
  if (event) {
    event.preventDefault();
    event.returnValue = '';
  }
  return '';
};

window.addEventListener('pagehide', function () {
  saveAppState();
});

window.goToSection = function (sectionId) {
  if (sectionId !== 'autonomous') {
    stopAutonomousTimer();
    stopTimerFlashing();

    const timer = document.getElementById('autonomousTimer');
    if (timer) {
      timer.remove();
    }
  }

  originalGoToSection(sectionId);

  if (sectionId === 'teleop') {
    updateStuckBarState();
  }
  if (sectionId === 'match-start') {
    updateMatchStartButtonColor();
  }
};


document.addEventListener('keydown', function (e) {
  if (e.code === 'KeyS' && e.ctrlKey && document.getElementById('autonomous').classList.contains('active')) {
    e.preventDefault();
    stopTimerFlashing();
  }
});

// ========== SCOUTING SCHEDULE ==========
let scoutingSchedule = [];
let currentScouterInterval = null;

function handleScoutingScheduleUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    console.log("No file selected");
    return;
  }

  console.log("File selected:", file.name, file.type);

  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    updateScoutingScheduleStatus("Invalid file type. Please upload a CSV.", false);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    console.log("CSV content loaded, length:", text.length);
    console.log("First 200 chars:", text.substring(0, 200));
    parseScoutingScheduleCSV(text);
  };
  reader.onerror = function (err) {
    console.error("File read error:", err);
    updateScoutingScheduleStatus("Error reading file.", false);
  };
  reader.readAsText(file);
}

function parseScoutingScheduleCSV(csvText) {
  console.log("Parsing CSV...");

  if (!csvText || csvText.trim().length === 0) {
    updateScoutingScheduleStatus("CSV file is empty.", false);
    return;
  }

  const lines = csvText.trim().split(/\r?\n/);
  console.log("Lines found:", lines.length);

  if (lines.length < 2) {
    updateScoutingScheduleStatus("CSV file has no data rows (need header + at least 1 data row).", false);
    return;
  }

  scoutingSchedule = [];

  let delimiter = ',';
  if (lines[0].includes('\t')) {
    delimiter = '\t';
    console.log("Using tab delimiter");
  } else {
    console.log("Using comma delimiter");
  }

  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
  console.log("Headers found:", headers);

  const timeIndex = headers.findIndex(h => h === 'time' || h === 'shift' || h === 'period');
  const red1Index = headers.findIndex(h => h === 'red 1' || h === 'red1');
  const red2Index = headers.findIndex(h => h === 'red 2' || h === 'red2');
  const red3Index = headers.findIndex(h => h === 'red 3' || h === 'red3');
  const blue1Index = headers.findIndex(h => h === 'blue 1' || h === 'blue1');
  const blue2Index = headers.findIndex(h => h === 'blue 2' || h === 'blue2');
  const blue3Index = headers.findIndex(h => h === 'blue 3' || h === 'blue3');

  console.log("Indices - time:", timeIndex, "red1:", red1Index, "blue1:", blue1Index);

  if (timeIndex === -1) {
    updateScoutingScheduleStatus("Missing 'Time' column in CSV. Found headers: " + headers.join(', '), false);
    return;
  }

  let shiftsLoaded = 0;
  let parseErrors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let columns;
    if (delimiter === ',') {
      columns = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    } else {
      columns = line.split('\t').map(c => c.trim());
    }

    if (columns.length <= timeIndex) {
      console.log(`Row ${i} has insufficient columns: ${columns.length}`);
      continue;
    }

    const timeRange = columns[timeIndex];
    if (!timeRange) {
      console.log(`Row ${i} has no time value`);
      continue;
    }

    console.log(`Processing row ${i}: "${timeRange}"`);

    let timeMatch = timeRange.match(/(\d{1,2}):(\d{2})\s*([ap]m?)\s*[-–]\s*(\d{1,2}):(\d{2})\s*([ap]m?)/i);

    if (!timeMatch) {
      timeMatch = timeRange.match(/(\d{1,2})\s*([ap]m?)\s*[-–]\s*(\d{1,2})\s*([ap]m?)/i);
      if (timeMatch) {
        timeMatch = [timeMatch[0], timeMatch[1], '00', timeMatch[2], timeMatch[3], '00', timeMatch[4]];
      }
    }

    if (!timeMatch) {
      parseErrors.push(`Row ${i}: Could not parse time format "${timeRange}"`);
      console.log(`Failed to parse time: ${timeRange}`);
      continue;
    }

    let startHour = parseInt(timeMatch[1]);
    const startMinute = parseInt(timeMatch[2] || '0');
    let startAmPm = timeMatch[3].toLowerCase().replace('m', ''); 

    if (startAmPm === 'p' && startHour !== 12) startHour += 12;
    if (startAmPm === 'a' && startHour === 12) startHour = 0;

    console.log(`Parsed shift at ${startHour}:${startMinute.toString().padStart(2, '0')} from "${timeRange}"`);

    const scouters = [];

    function addScouterIfExists(index, position, alliance) {
      if (index !== -1 && columns[index] && columns[index] !== '' && columns[index] !== '-') {
        scouters.push({
          name: columns[index],
          position: position,
          alliance: alliance
        });
        console.log(`  Added ${columns[index]} as ${position}`);
      }
    }

    addScouterIfExists(red1Index, 'R1', 'red');
    addScouterIfExists(red2Index, 'R2', 'red');
    addScouterIfExists(red3Index, 'R3', 'red');
    addScouterIfExists(blue1Index, 'B1', 'blue');
    addScouterIfExists(blue2Index, 'B2', 'blue');
    addScouterIfExists(blue3Index, 'B3', 'blue');
    if (scouters.length > 0) {
      scoutingSchedule.push({
        startHour: startHour,
        startMinute: startMinute,
        scouters: scouters,
        timeRange: timeRange,
        rawTime: timeRange
      });
      shiftsLoaded++;
      console.log(`✓ Added shift at ${startHour}:${startMinute} with ${scouters.length} scouters`);
    } else {
      console.log(`Row ${i} had no valid scouter names`);
    }
  }

  scoutingSchedule.sort((a, b) => {
    if (a.startHour !== b.startHour) return a.startHour - b.startHour;
    return a.startMinute - b.startMinute;
  });

  console.log(`Total shifts loaded: ${shiftsLoaded}`);
  console.log("Scouting schedule:", scoutingSchedule);

  if (shiftsLoaded === 0) {
    let errorMsg = "No valid shifts found in CSV. Expected format: '9:18a-10:18a' or '9:30am-10:30am'";
    if (parseErrors.length > 0) {
      errorMsg += "\nErrors: " + parseErrors.slice(0, 3).join('; ');
    }
    updateScoutingScheduleStatus(errorMsg, false);
    return;
  }

  localStorage.setItem('scoutingScheduleCSV', csvText);
  updateScoutingScheduleStatus(`✓ Loaded ${shiftsLoaded} shift${shiftsLoaded !== 1 ? 's' : ''} with scouters`, true);

  startCurrentScouterDetection();
}

function updateScoutingScheduleStatus(message, success) {
  const statusDiv = document.getElementById('scoutingScheduleUploadStatus');
  if (!statusDiv) {
    console.log("Status div not found");
    return;
  }

  console.log("Update status:", message, success);

  if (success) {
    statusDiv.style.background = "#002244";
    statusDiv.style.border = "2px solid #1e90ff";
    statusDiv.style.color = "#1e90ff";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem;">✓ ${message}</p>`;
    statusDiv.classList.add('uploaded');
  } else {
    statusDiv.style.background = "#440000";
    statusDiv.style.border = "2px solid #ff4c4c";
    statusDiv.style.color = "#ff4c4c";
    statusDiv.innerHTML = `<p style="text-align:center; font-size:1rem;">✗ ${message}</p>`;
    statusDiv.classList.remove('uploaded');
  }
}

function deleteScoutingSchedule() {
  if (!localStorage.getItem('scoutingScheduleCSV')) {
    alert("No scouting schedule uploaded.");
    return;
  }
  if (confirm("Are you sure you want to delete the scouting schedule CSV?")) {
    localStorage.removeItem('scoutingScheduleCSV');
    scoutingSchedule = [];

    const statusDiv = document.getElementById('scoutingScheduleUploadStatus');
    if (statusDiv) {
      statusDiv.style.background = "#1a1c1f";
      statusDiv.style.border = "2px solid #2a2d31";
      statusDiv.style.color = "#ffffff";
      statusDiv.innerHTML = `<p style="text-align: center; font-size: 1rem; color: #ccc;">No scouting schedule uploaded.</p>`;
      statusDiv.classList.remove('uploaded');
    }

    const bar = document.getElementById('currentScouterBar');
    if (bar) bar.style.display = 'none';

    if (currentScouterInterval) {
      clearInterval(currentScouterInterval);
      currentScouterInterval = null;
    }

    alert("Scouting schedule deleted successfully!");
  }
}

function getNextScouter() {
  if (!scoutingSchedule || scoutingSchedule.length === 0) {
    console.log("No scouting schedule loaded");
    return null;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

  console.log(`Checking time: ${currentHour}:${currentMinute.toString().padStart(2, '0')} (${currentMinutesSinceMidnight} min since midnight)`);

  for (const shift of scoutingSchedule) {
    const shiftStartMinutes = shift.startHour * 60 + shift.startMinute;

    if (currentMinutesSinceMidnight >= shiftStartMinutes &&
      currentMinutesSinceMidnight < shiftStartMinutes + 10) {

      if (shift.scouters && shift.scouters.length > 0) {
        const minutesAgo = currentMinutesSinceMidnight - shiftStartMinutes;
        const minutesRemaining = 10 - minutesAgo;

        console.log(`Active shift: ${shift.startHour}:${shift.startMinute} (${shift.timeRange}), ${minutesRemaining} min remaining`);
        console.log("Scouters in shift:", shift.scouters.map(s => `${s.name} (${s.position})`).join(', '));

        return {
          scouters: shift.scouters,
          shiftStartTime: shift.timeRange.split('-')[0].trim(),
          minutesRemaining: minutesRemaining,
          shiftInfo: shift
        };
      }
    }
  }

  console.log("No active shift found");
  return null;
}

function updateCurrentScouterDisplay() {
  const bar = document.getElementById('currentScouterBar');
  const nameEl = document.getElementById('currentScouterName');
  const timeEl = document.getElementById('scoutingShiftTime');

  if (!bar || !nameEl) {
    console.log("Display elements not found");
    return;
  }

  const allianceRadio = document.querySelector('#setup input[name="alliance"]:checked');
  if (!allianceRadio) {
    bar.style.display = 'none';
    console.log("No alliance position selected");
    return;
  }

  const currentPosition = allianceRadio.id; 
  console.log("Current robot position:", currentPosition);

  const nextScouterData = getNextScouter();

  if (nextScouterData && nextScouterData.scouters && nextScouterData.scouters.length > 0) {
    const matchingScouter = nextScouterData.scouters.find(s => s.position === currentPosition);

    if (matchingScouter) {
      bar.style.display = 'block';
      nameEl.textContent = matchingScouter.name;

      const minutesText = nextScouterData.minutesRemaining === 1 ? 'minute' : 'minutes';

      if (currentPosition.startsWith('R')) {
        bar.style.background = "linear-gradient(135deg, #ff4c4c, #cc0000)";
      } else {
        bar.style.background = "linear-gradient(135deg, #1e90ff, #0066cc)";
      }

      console.log(`Displaying scouter for ${currentPosition}: ${matchingScouter.name}`);
    } else {
      bar.style.display = 'none';
      console.log(`No scouter found for position ${currentPosition} in current shift`);
    }
  } else {
    bar.style.display = 'none';
    console.log("No active scouter to display");
  }
}
function startCurrentScouterDetection() {
  if (currentScouterInterval) {
    clearInterval(currentScouterInterval);
  }

  updateCurrentScouterDisplay();

  currentScouterInterval = setInterval(updateCurrentScouterDisplay, 10000);
  console.log("Started scouter detection interval");
}

function loadSavedScoutingSchedule() {
  const savedCSV = localStorage.getItem('scoutingScheduleCSV');
  console.log("Saved scouting schedule exists:", !!savedCSV);
  if (savedCSV) {
    parseScoutingScheduleCSV(savedCSV);
    startCurrentScouterDetection();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, loading scouting schedule...");
    loadSavedScoutingSchedule();
  });
} else {
  console.log("DOM already loaded, loading scouting schedule...");
  loadSavedScoutingSchedule();
}