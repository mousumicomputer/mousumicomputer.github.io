/**
 * Mousumi Computer - Automated Date, Time & Weather Ribbon Bar (Fixed Version)
 */

(function () {
  // ১. প্রয়োজনীয় CSS হেডারে যোগ করা
  const style = document.createElement('style');
  style.textContent = `
    .header-datetime-bar {
      background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #cbd5e1;
      padding: 9px 35px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #334155;
      font-weight: 600;
      font-family: 'Tiro Bangla', serif !important;
    }
    .dt-item {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      white-space: nowrap;
      cursor: default;
    }
    .dt-item i { font-size: 14px; }
    .dt-time i { color: #f59e0b; }
    .dt-eng i { color: #2176ff; }
    .dt-bng i { color: #10b981; }
    .dt-hij i { color: #8b5cf6; }
    .dt-weather i { color: #0284c7; }
    .dt-divider { width: 1px; height: 16px; background-color: #cbd5e1; }
    .dt-tag {
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 20px;
      font-weight: 700;
      display: inline-block;
    }
    .tag-season { background: #dcfce7; color: #166534; }
    .tag-loc { background: #e0f2fe; color: #0369a1; }
    .dt-sub-text { font-size: 12px; color: #64748b; font-weight: 500; }
    @media (max-width: 991px) {
      .header-datetime-bar { flex-direction: column; gap: 8px; text-align: center; padding: 12px 15px; }
      .dt-divider { display: none; }
    }
  `;
  document.head.appendChild(style);

  // ২. রিবন বারের HTML স্ট্রাকচার
  const bar = document.createElement('div');
  bar.className = 'header-datetime-bar tiro-text';
  bar.innerHTML = `
    <div class="dt-item dt-time">
      <i class="fa-solid fa-clock"></i>
      <span id="navLiveClock">সময় লোড হচ্ছে...</span>
    </div>
    <div class="dt-divider"></div>
    <div class="dt-item dt-eng">
      <i class="fa-solid fa-calendar-day"></i>
      <span id="navEngDate">--</span>
      <span class="dt-sub-text" id="navEngDay">(--)</span>
    </div>
    <div class="dt-divider"></div>
    <div class="dt-item dt-bng">
      <i class="fa-solid fa-seedling"></i>
      <span id="navBngDate">--</span>
      <span class="dt-tag tag-season" id="navBngSeason">ঋতু</span>
    </div>
    <div class="dt-divider"></div>
    <div class="dt-item dt-hij">
      <i class="fa-solid fa-moon"></i>
      <span id="navHijDate">--</span>
    </div>
    <div class="dt-divider"></div>
    <div class="dt-item dt-weather">
      <i id="weatherIcon" class="fa-solid fa-cloud-sun"></i>
      <span id="navTemp">৩১°সে</span>
      <span class="dt-tag tag-loc">লালমনিরহাট</span>
    </div>
  `;

  // ৩. বাংলা সংখ্যা কনভার্টার
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  function toBanglaNum(num) {
    return num.toString().replace(/\d/g, d => bnDigits[d]);
  }

  // ৪. লাইভ ঘড়ি (খাঁটি বাংলা)
  function updateNavClock() {
    const clockEl = document.getElementById('navLiveClock');
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let period = "রাত";
    if (hours >= 4 && hours < 6) period = "ভোর";
    else if (hours >= 6 && hours < 12) period = "সকাল";
    else if (hours >= 12 && hours < 16) period = "দুপুর";
    else if (hours >= 16 && hours < 18) period = "বিকাল";
    else if (hours >= 18 && hours < 20) period = "সন্ধ্যা";
    else period = "রাত";

    let displayH = hours % 12 || 12;
    let sH = displayH < 10 ? "0" + displayH : displayH;
    let sM = minutes < 10 ? "0" + minutes : minutes;
    let sS = seconds < 10 ? "0" + seconds : seconds;

    clockEl.textContent = `${period} ${toBanglaNum(sH)}:${toBanglaNum(sM)}:${toBanglaNum(sS)}`;
  }

  // ৫. ইংরেজি তারিখ
  const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  function updateNavEnglishDate() {
    const engDateEl = document.getElementById('navEngDate');
    const engDayEl = document.getElementById('navEngDay');
    if (!engDateEl || !engDayEl) return;

    const now = new Date();
    engDateEl.textContent = `${toBanglaNum(now.getDate())} ${bnMonths[now.getMonth()]}, ${toBanglaNum(now.getFullYear())}`;
    engDayEl.textContent = `(${bnDays[now.getDay()]})`;
  }

  // ৬. বাংলা একাডেমি সংশোধিত বাংলা পঞ্জিকা
  function updateNavBanglaDate() {
    const bngDateEl = document.getElementById('navBngDate');
    const bngSeasonEl = document.getElementById('navBngSeason');
    if (!bngDateEl || !bngSeasonEl) return;

    const now = new Date();
    const banglaMonths = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
    const seasons = ['গ্রীষ্মকাল', 'বর্ষাকাল', 'শরৎকাল', 'হেমন্তকাল', 'শীতকাল', 'বসন্তকাল'];

    const gYear = now.getFullYear();
    const isLeapYear = (gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0);
    const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear ? 30 : 29, 30];

    let bYear = (now.getMonth() < 3 || (now.getMonth() === 3 && now.getDate() < 14)) ? gYear - 594 : gYear - 593;
    
    const today = new Date(gYear, now.getMonth(), now.getDate());
    const bNewYearDate = new Date(gYear, 3, 14);

    let diffDays;
    if (today >= bNewYearDate) {
      diffDays = Math.round((today - bNewYearDate) / (1000 * 60 * 60 * 24));
    } else {
      const prevNewYear = new Date(gYear - 1, 3, 14);
      diffDays = Math.round((today - prevNewYear) / (1000 * 60 * 60 * 24));
    }

    let bMonthIdx = 0;
    let bDay = diffDays + 1;
    for (let i = 0; i < 12; i++) {
      if (bDay <= monthDays[i]) {
        bMonthIdx = i;
        break;
      }
      bDay -= monthDays[i];
    }

    bngDateEl.textContent = `${toBanglaNum(bDay)} ${banglaMonths[bMonthIdx]}, ${toBanglaNum(bYear)} বঙ্গাব্দ`;
    bngSeasonEl.textContent = seasons[Math.floor(bMonthIdx / 2)];
  }

  // ৭. হিজরি তারিখ
  const arabicMonthsBn = ['মহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'];
  function updateNavHijriDate() {
    const hijDateEl = document.getElementById('navHijDate');
    if (!hijDateEl) return;
    const now = new Date();
    try {
      let formatter;
      try {
        formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
      } catch (err) {
        formatter = new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric', month: 'numeric', year: 'numeric' });
      }
      const parts = formatter.formatToParts(now);
      let hDay = 1, hMonth = 1, hYear = 1448;
      parts.forEach(p => {
        if (p.type === 'day') hDay = parseInt(p.value, 10);
        if (p.type === 'month') hMonth = parseInt(p.value, 10);
        if (p.type === 'year') hYear = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
      });
      hijDateEl.textContent = `${toBanglaNum(hDay)} ${arabicMonthsBn[hMonth - 1] || 'হিজরি মাস'}, ${toBanglaNum(hYear)} হিজরি`;
    } catch (e) {
      hijDateEl.textContent = "হিজরি উপলব্ধ নয়";
    }
  }

  // ৮. লালমনিরহাটের লাইভ আবহাওয়া (Open-Meteo API)
  async function fetchLiveWeather() {
    const tempEl = document.getElementById('navTemp');
    const iconEl = document.getElementById('weatherIcon');
    if (!tempEl || !iconEl) return;

    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.9167&longitude=89.4500&current_weather=true');
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      const temp = Math.round(data.current_weather.temperature);
      const wCode = data.current_weather.weathercode;
      
      tempEl.textContent = `${toBanglaNum(temp)}°সে`;
      
      if (wCode === 0) {
        iconEl.className = "fa-solid fa-sun"; iconEl.style.color = "#f59e0b";
      } else if (wCode >= 1 && wCode <= 3) {
        iconEl.className = "fa-solid fa-cloud-sun"; iconEl.style.color = "#0284c7";
      } else if (wCode >= 51 && wCode <= 67) {
        iconEl.className = "fa-solid fa-cloud-showers-heavy"; iconEl.style.color = "#3b82f6";
      } else if (wCode >= 95) {
        iconEl.className = "fa-solid fa-bolt"; iconEl.style.color = "#eab308";
      } else {
        iconEl.className = "fa-solid fa-cloud"; iconEl.style.color = "#64748b";
      }
    } catch (e) {
      tempEl.textContent = "৩১°সে";
    }
  }

  // ৯. প্রধান ইনিশিয়ালাইজেশন ফাংশন (বার যুক্ত করার সাথে সাথেই সব ডেটা লোড করবে)
  function initDateTimeRibbon() {
    const middleHeader = document.querySelector('.middle-header');
    if (middleHeader && !document.getElementById('navLiveClock')) {
      middleHeader.insertAdjacentElement('afterend', bar);
      
      // বার ইনজেক্ট হওয়ার সাথে সাথেই সবগুলো ফাংশন কল হবে
      updateNavClock();
      updateNavEnglishDate();
      updateNavBanglaDate();
      updateNavHijriDate();
      fetchLiveWeather();

      // লাইভ ক্লক ও আবহাওয়ার ইন্টারভাল
      setInterval(updateNavClock, 1000);
      setInterval(fetchLiveWeather, 30 * 60 * 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDateTimeRibbon);
  } else {
    initDateTimeRibbon();
  }
})();
