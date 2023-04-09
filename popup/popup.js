// Saves options to chrome.storage
const saveOptions = () => {
  const color = document.getElementById('color-picker').value;
  const font = document.getElementById('font-picker').value;
  const speed = document.getElementById('speed-picker').value;
  const transparency = document.getElementById('transparency-picker').value;

  let val = parseInt(font, 10);
  if (val == NaN || val < 5 || val > 100) {
    alert(`Invalid font ${font} must be an integer between 5 and 100.`); return;
  }
  val = parseInt(speed, 10);
  if (val == NaN || val < 1 || val > 50) {
    alert(`Invalid frame rate ${speed} must be an integer between 1 and 50.`); return;
  }
  val = parseFloat(transparency);
  if (val == NaN || val < 0 || val > 1) {
    alert(`Invalid opacity ${transparency} must be an float between 0 and 1.`); return;
  }

  items = { colorChoice: color, 
    fontChoice: font,
    speedChoice: speed, 
    transparencyChoice: transparency
  };

  // console.log(items);
  chrome.storage.local.set(
    items,
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get(
    ["colorChoice", "fontChoice", "speedChoice", "transparencyChoice"],
    (items) => {
      // only restore options if some options are saved
      if (items.colorChoice) {        
        document.getElementById('color-picker').value = items.colorChoice;
        document.getElementById('font-picker').value = items.fontChoice;
        document.getElementById('speed-picker').value = items.speedChoice;
        document.getElementById('transparency-picker').value = items.transparencyChoice;
      }
    }
  );
};


document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
