var clickOrder = [];

function getNextQuarterHour() {
  var now = new Date();
  var mins = now.getMinutes();
  var roundedMins = Math.ceil(mins / 15) * 15;
  if (roundedMins === mins) roundedMins += 15;
  var result = new Date(now);
  result.setMinutes(roundedMins, 0, 0);

  var hours = result.getHours();
  var m = result.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return (hours < 10 ? "0" + hours : hours) + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
}

function normalizeTime(str) {
  str = str.trim().toUpperCase().replace(/\s+/g, "");
  var hours, mins, ampm;

  var matchCompactAmPm = str.match(/^(\d{1,2})(\d{2})(AM|PM)$/);
  if (matchCompactAmPm) {
    hours = parseInt(matchCompactAmPm[1]);
    mins = parseInt(matchCompactAmPm[2]);
    ampm = matchCompactAmPm[3];
    if (hours < 1 || hours > 12 || mins > 59) return null;
    return (hours < 10 ? "0" + hours : hours) + ":" + (mins < 10 ? "0" + mins : mins) + " " + ampm;
  }

  var match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    hours = parseInt(match24[1]);
    mins = parseInt(match24[2]);
    if (hours > 23 || mins > 59) return null;
    ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return (hours < 10 ? "0" + hours : hours) + ":" + (mins < 10 ? "0" + mins : mins) + " " + ampm;
  }

  var match24compact = str.match(/^(\d{2})(\d{2})$/);
  if (match24compact) {
    hours = parseInt(match24compact[1]);
    mins = parseInt(match24compact[2]);
    if (hours > 23 || mins > 59) return null;
    ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return (hours < 10 ? "0" + hours : hours) + ":" + (mins < 10 ? "0" + mins : mins) + " " + ampm;
  }

  var match12 = str.match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)$/);
  if (match12) {
    hours = parseInt(match12[1]);
    mins = match12[2] ? parseInt(match12[2]) : 0;
    ampm = match12[3];
    if (hours < 1 || hours > 12 || mins > 59) return null;
    return (hours < 10 ? "0" + hours : hours) + ":" + (mins < 10 ? "0" + mins : mins) + " " + ampm;
  }

  return null;
}

function parseTime(str) {
  var normalized = normalizeTime(str);
  if (!normalized) return null;

  var match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  var hours = parseInt(match[1]);
  var mins = parseInt(match[2]);
  var ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  var date = new Date();
  date.setHours(hours, mins, 0, 0);
  return date;
}

function getSavedIncrement() {
  try { return parseInt(localStorage.getItem("snooze-increment")) || 15; }
  catch(e) { return 15; }
}

function saveIncrement(val) {
  try { localStorage.setItem("snooze-increment", val); }
  catch(e) {}
}

function injectSidebar() {
  if (document.getElementById("snooze-sidebar")) return;

  var sidebar = document.createElement("div");
  sidebar.id = "snooze-sidebar";
  sidebar.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; font-family:sans-serif;";

  sidebar.innerHTML =
    '<div id="snooze-collapsed" style="background:#1a73e8; border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.3); font-size:20px;" title="Stagger Snooze">💤</div>' +

    '<div id="snooze-panel" style="display:none; background:white; border:1px solid #ccc; border-radius:8px; padding:12px; box-shadow:0 2px 10px rgba(0,0,0,0.2); width:210px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
        '<h4 style="margin:0; font-size:14px;">Stagger Snooze</h4>' +
        '<div style="display:flex; gap:8px; align-items:center;">' +
          '<span id="snooze-help-btn" style="cursor:pointer; font-size:14px; color:#1a73e8; font-weight:bold;" title="Help">❓</span>' +
          '<span id="snooze-collapse-btn" style="cursor:pointer; font-size:16px; color:#666;" title="Collapse">✕</span>' +
        '</div>' +
      '</div>' +

      '<div id="snooze-help-panel" style="display:none; background:#f8f9fa; border-radius:6px; padding:10px; margin-bottom:10px; font-size:11px; color:#333; line-height:1.8;">' +
        '<strong>How to use:</strong><br>' +
        '1. Check emails in the order you want them snoozed<br>' +
        '2. Change start time and increment, if desired<br>' +
        '3. Click Snooze Selected<br>' +
        '4.* Refresh in between attempts' +
      '</div>' +

      '<label style="font-size:12px;">Start time:</label>' +
      '<input id="snooze-start-time" type="text" placeholder="e.g. 7pm, 645pm, 9:30am" style="width:100%; margin:4px 0 8px 0; display:block; box-sizing:border-box; padding:4px;">' +
      '<label style="font-size:12px;">Minutes per increment:</label>' +
      '<select id="snooze-minutes" style="width:100%; margin:4px 0 8px 0; display:block; padding:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; font-size:13px;">' +
        '<option value="5">5 minutes</option>' +
        '<option value="15">15 minutes</option>' +
        '<option value="30">30 minutes</option>' +
        '<option value="60">1 hour</option>' +
        '<option value="custom">Custom...</option>' +
      '</select>' +
      '<input id="snooze-custom" type="number" min="1" placeholder="Enter minutes" style="width:100%; margin:0 0 8px 0; display:none; box-sizing:border-box; padding:4px;">' +
      '<button id="snooze-trigger" style="width:100%; padding:6px; background:#1a73e8; color:white; border:none; border-radius:4px; cursor:pointer; font-size:13px;">Snooze Selected</button>' +
      '<p id="snooze-status" style="font-size:11px; color:gray; margin:6px 0 0 0;"></p>' +
    '</div>';

  document.body.appendChild(sidebar);

  var savedIncrement = getSavedIncrement();
  var select = document.getElementById("snooze-minutes");
  var customInput = document.getElementById("snooze-custom");
  var validOptions = ["5", "15", "30", "60"];

  if (validOptions.indexOf(String(savedIncrement)) !== -1) {
    select.value = String(savedIncrement);
  } else {
    select.value = "custom";
    customInput.value = savedIncrement;
    customInput.style.display = "block";
  }

  document.getElementById("snooze-collapsed").addEventListener("click", function() {
    document.getElementById("snooze-panel").style.display = "block";
    document.getElementById("snooze-collapsed").style.display = "none";
    document.getElementById("snooze-start-time").value = getNextQuarterHour();
  });

  document.getElementById("snooze-collapse-btn").addEventListener("click", function() {
    document.getElementById("snooze-panel").style.display = "none";
    document.getElementById("snooze-collapsed").style.display = "flex";
  });

  document.getElementById("snooze-help-btn").addEventListener("click", function() {
    var helpPanel = document.getElementById("snooze-help-panel");
    helpPanel.style.display = helpPanel.style.display === "none" ? "block" : "none";
  });

  select.addEventListener("change", function() {
    if (this.value === "custom") {
      customInput.style.display = "block";
      customInput.focus();
    } else {
      customInput.style.display = "none";
      saveIncrement(parseInt(this.value));
    }
  });

  customInput.addEventListener("change", function() {
    var val = parseInt(this.value);
    if (val > 0) saveIncrement(val);
  });

  document.getElementById("snooze-start-time").addEventListener("blur", function() {
    var normalized = normalizeTime(this.value);
    if (normalized) {
      this.value = normalized;
      this.style.borderColor = "";
      document.getElementById("snooze-status").textContent = "";
    } else {
      this.style.borderColor = "red";
      document.getElementById("snooze-status").textContent = "Invalid time! Try: 7pm, 645pm, 9:30am";
    }
  });

  document.getElementById("snooze-trigger").addEventListener("click", function() {
    var minutes;
    if (select.value === "custom") {
      minutes = parseInt(customInput.value);
    } else {
      minutes = parseInt(select.value);
    }
    if (!minutes || minutes < 1) {
      document.getElementById("snooze-status").textContent = "Enter a valid number.";
      return;
    }
    var startTimeStr = document.getElementById("snooze-start-time").value.trim();
    var startTime = parseTime(startTimeStr);
    if (!startTime) {
      document.getElementById("snooze-status").textContent = "Invalid time! Try: 7pm, 645pm, 9:30am";
      return;
    }
    saveIncrement(minutes);
    staggerSnooze(minutes, startTime);
  });

  document.addEventListener("click", function(e) {
    var cb = e.target.closest('div[role="checkbox"]');
    if (!cb) return;
    setTimeout(function() {
      var id = cb.id;
      if (!id) return;
      if (cb.getAttribute("aria-checked") === "true") {
        if (clickOrder.indexOf(id) === -1) clickOrder.push(id);
      } else {
        clickOrder = clickOrder.filter(function(i) { return i !== id; });
      }
    }, 100);
  });
}

function clickElement(el) {
  el.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
  el.dispatchEvent(new MouseEvent("mouseup", {bubbles: true}));
  el.dispatchEvent(new MouseEvent("click", {bubbles: true}));
}

function setInputValue(input, value) {
  input.focus();
  input.select();
  document.execCommand("selectAll");
  document.execCommand("insertText", false, value);
}

function getSnoozeTime(index, minuteIncrement, startTime) {
  var t = new Date(startTime.getTime());
  t.setMinutes(t.getMinutes() + minuteIncrement * (index + 1));

  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var dateStr = months[t.getMonth()] + " " + t.getDate() + ", " + t.getFullYear();

  var hours = t.getHours();
  var mins = t.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  var timeStr = hours + ":" + (mins < 10 ? "0" + mins : mins) + " " + ampm;

  return {date: dateStr, time: timeStr};
}

function staggerSnooze(minuteIncrement, startTime) {
  var checkboxIds = clickOrder.slice();

  if (checkboxIds.length === 0) {
    var checkboxes = document.querySelectorAll('div[role="checkbox"][aria-checked="true"]');
    checkboxes.forEach(function(cb) { checkboxIds.push(cb.id); });
  }

  var totalCount = checkboxIds.length;
  if (totalCount === 0) {
    document.getElementById("snooze-status").textContent = "No emails selected!";
    return;
  }

  document.getElementById("snooze-status").textContent = "Snoozing " + totalCount + " emails...";
  document.getElementById("snooze-trigger").disabled = true;
  clickOrder = [];

  var allCheckboxes = document.querySelectorAll('div[role="checkbox"][aria-checked="true"]');
  allCheckboxes.forEach(function(cb) {
    if (cb.id !== checkboxIds[0]) cb.click();
  });

  function snoozeNext(index) {
    if (index >= totalCount) {
      document.getElementById("snooze-status").textContent = "Done!";
      document.getElementById("snooze-trigger").disabled = false;
      return;
    }

    setTimeout(function() {
      var snoozeBtn = document.querySelector('[data-tooltip="Snooze"][aria-label="Snooze"]');
      if (!snoozeBtn) {
        document.getElementById("snooze-status").textContent = "Snooze button not found!";
        document.getElementById("snooze-trigger").disabled = false;
        return;
      }
      clickElement(snoozeBtn);

      setTimeout(function() {
        var pickDate = null;
        document.querySelectorAll('[role="menuitem"]').forEach(function(el) {
          if (el.textContent.trim().includes("Pick date")) pickDate = el;
        });
        if (!pickDate) return;
        clickElement(pickDate);

        setTimeout(function() {
          var dateInput = document.querySelector('input[aria-label="Date"]');
          var timeInput = document.querySelector('input[aria-label="Time"]');
          if (!dateInput || !timeInput) return;

          var snoozeTime = getSnoozeTime(index, minuteIncrement, startTime);
          setInputValue(dateInput, snoozeTime.date);
          setInputValue(timeInput, snoozeTime.time);

          setTimeout(function() {
            var btns = document.querySelectorAll('button');
            btns.forEach(function(btn) {
              if (btn.textContent.trim() === "Save") btn.click();
            });

            setTimeout(function() {
              if (index + 1 < totalCount) {
                var nextId = checkboxIds[index + 1];
                var nextCb = document.getElementById(nextId);
                if (nextCb) {
                  nextCb.click();
                  setTimeout(function() { snoozeNext(index + 1); }, 100);
                } else {
                  var unchecked = document.querySelectorAll('div[role="checkbox"][aria-checked="false"]');
                  if (unchecked.length > 0) {
                    unchecked[0].click();
                    setTimeout(function() { snoozeNext(index + 1); }, 100);
                  }
                }
              } else {
                snoozeNext(index + 1);
              }
            }, 100);
          }, 300);
        }, 300);
      }, 100);
    }, 100);
  }

  snoozeNext(0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSidebar);
} else {
  injectSidebar();
}