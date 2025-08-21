// High-level game state
const state = {
  activeTeamIndex: 0, // 0 -> team1, 1 -> team2
  scores: [0, 0],
  secondsRemaining: 60,
  roundDuration: 60,
  inRound: false,
  paused: false,
  wordDeck: [],
  wordIndex: 0,
  intervalId: null,
  endBeep: null,
  usedWords: new Set(),
};

// A simple Arabic word list (you can extend freely)
// NOTE: Each entry is a single token (no spaces) and suitable for fast description.
const ARABIC_WORDS = [
  "سيارة","طائرة","حاسوب","شمس","قمر","بحر","جبل","مدرسة","مستشفى","كرة",
  "هاتف","ساعة","كتاب","مكتبة","مدينة","قرية","طبيب","معلم","طالب","جامعة",
  "مطعم","مطبخ","حديقة","زهرة","شجرة","مطر","ثلج","رياح","صحراء","غابة",
  "فيلم","مسرح","موسيقى","رقص","لوحة","صورة","كاميرا","باب","نافذة","كرسي",
  "طاولة","قلم","دفتر","ورقة","حقيبة","حذاء","قبعة","قميص","بنطال","معطف",
  "قطار","حافلة","دراجة","سفينة","ميناء","مطار","محطة","شارع","جسر","نفق",
  "سباحة","جري","قفز","تنس","ملاكمة","فوز","خسارة","تعادل","سعادة","حزن",
  "غضب","خوف","ضحك","ابتسامة","دموع","صداقة","حب","عائلة","تفاحة","موز",
  "برتقال","عنب","فراولة","خبز","أرز","دجاج","سمك","حساء","فيل","أسد",
  "نمر","قرد","زرافة","حصان","كلب","قطة","عصفور","نحلة","نسر","بومة",
  "حمامة","غراب","دلفين","قرش","حوت","سلحفاة","تمساح","ثعلب","ذئب","نملة",
  "جرادة","فراشة","بعوضة","حمراء","زيتون","ليمون","تين","رمان","بطيخ","شمام",
  "خوخ","مشمش","كمثرى","جوافة","كيوي","مانجو","أناناس","كركم","زنجبيل","فلفل",
  "ملح","سكر","خل","زيت","زبدة","جبن","لبن","قهوة","شاي","عصير",
  "ماء","صودا","كعكة","بسكويت","شوكولاتة","آيسكريم","ملعقة","شوكة","سكين","صحن",
  "قدر","مقلاة","فرن","ثلاجة","خلاط","ميكروويف","غلاية","كوب","زجاجة","مقعد",
  "سرير","خزانة","مرآة","سجادة","ستارة","مصباح","مروحة","تلفاز","حاسبة","لوحي",
  "طابعة","ماسح","لوحة","مفاتيح","سماعة","ميكروفون","مكبر","كمامة","قفاز","خوذة",
  "درع","سيف","قوس","سهم","رمح","خنجر","نرد","ورق","شطرنج","دومينو",
  "رصاص","طبشور","ممحاة","مسطرة","بوصلة","خريطة","جغرافيا","تاريخ","علوم","رياضيات",
  "فيزياء","كيمياء","أحياء","نحو","صرف","بلاغة","قراءة","كتابة","رسم","تصميم",
  "نحت","تصوير","برمجة","شبكة","سحابة","خادم","عميل","نافذة","مجلد","ملف",
  "محرر","متصفح","محرك","ذاكرة","معالج","بطارية","لوحة","أم","مزود","طاقة",
  "مفتاح","قفل","جدار","سقف","أرض","طابق","مصعد","درج","حداد","نجار",
  "سباك","كهربائي","طباخ","نادل","مزارع","صياد","حارس","مدرب","لاعب","حكم",
  "وزير","رئيس","ملك","أمير","شرطة","جيش","مستشار","قاض","محام","طبيب",
  "ممرض","صيدلي","باحث","مهندس","مبرمج","مصمم","كاتب","شاعر","روائي","مترجم",
  "مذيع","مخرج","ممثل","موسيقي","رسام","نحات","صحفي","مصور","سائق","طيار",
  "بحار","شرطي","إطفائي","بائع","تاجر","محاسب","مدير","سكرتير","موظف","عامل",
  "طالب","معلمة","محاضِر","عميد","رائد","رائدفضاء","مخترع","مكتشف","رحالة","سائح",
  "مضيف","مطار","بوابة","جواز","تأشيرة","حقيبة","تذكرة","فندق","منتجع","خيمة",
  "صحراء","واحة","ساحل","شاطئ","جزيرة","خليج","محيط","نهر","جدول","شلال",
  "بحيرة","بركان","زلزال","رياح","عاصفة","برق","رعد","غيمة","ضباب","ندى",
  "ثلجية","ثلجة","مظلة","معطف","قفاز","وشاح","حذاء","حذاءرياضي","نعل","نعال","قبعة",
  "نظارة","عدسة","كاميرا","فيلم","مشهد","مسرحية","أغنية","نغمة","إيقاع","طبلة",
  "عود","قانون","كمان","بيانو","قيثار","ناي","مزمار","جيتار","ميترونوم","ملحن",
  "مؤلف","قصيدة","رواية","قصة","مقال","صحيفة","مجلة","كتاب","دفتر","موسوعة",
  "قاموس","معجم","لوح","ألوان","فرشاة","قماش","طين","حبر","قلم","رصاص",
  "ممحاة","مسطرة","مسامير","مطرقة","مفك","كماشة","منشار","مثقاب","غراء","حبل",
  "خيوط","إبرة","مقص","قماش","قطن","صوف","حرير","كتان","نايلون","بلاستيك",
  "زجاج","خشب","حديد","نحاس","ذهب","فضة","ألماس","ياقوت","زمرد","فيروز",
  "طين","طوب","إسمنت","خرسانة","جص","دهان","ورنيش","ورقجدران","بلاط","سيراميك",
  "رخام","جرانيت","حجر","رمل","تراب","طمي","ملح","فحم","غاز","نفط",
  "محبرة","لوحذكي","لوحطبشور","حاسوبمحمول","لوحي","هاتفذكي","ساعةذكية","شاحن","سلك","محول",
  "مقبس","مأخذ","مفتاحضوء","مصباح","شمعة","ولاعة","عودثقاب","مدفأة","مروحة","مكيف",
  "مرطب","منقي","فلتر","مكنسة","غسالة","مجفف","مكواة","سلة","مناديل","ممسحة",
  "منظف","مطهر","صابون","شامبو","بلسم","مرطب","معجون","فرشاة","مقص","مبراة",
  "ملفوف","خس","جرجير","بقدونس","كزبرة","نعناع","ريحان","فلفل","فطر","طماطم",
  "بطاطس","باذنجان","كوسا","قرع","جزر","شمندر","فجل","بصل","ثوم","زنجبيل",
  "زعتر","كمون","كراوية","يانسون","قرفة","قرنفل","هيل","جوزة","جوز","لوز",
  "فستق","بندق","سمسم","حبةبركة","كتان","شوفان","قمح","شعير","ذرة","أرز",
  "عدس","حمص","فول","فاصوليا","بازلاء","براعم","كرنب","ثومية","صلصة","مايونيز",
  "خردل","كاتشب","خل", "زيتون","طحينة","حلاوة","مربى","عسل","سكر","ملح",
  "ملاعق","شوكة","سكين","طنجرة","قدر","مقلاة","مصرفة","مغرفة","مصب","قِدر",
  "قارب","زورق","يخت","بارجة","سفينة","مرفأ","ميناء","رصيف","مرساة","شراع",
  "مجداف","مرشد","قبطان","طاقم","مرسى","كابينة","جسر","رادار","بوصلة","صفارة",
  "تلسكوب","مجهر","منظار","عدسة","شفرة","مقصلة","سلسلة","قفل","مفتاح","مزلاج",
  "حقيبةظهر","حقيبةيد","محفظة","محفظةنقود","بطاقة","نقود","عملة","مصرف","شيك","فاتورة",
  "إيصال","ميزانية","ضريبة","راتب","أجرة","سعر","خصم","عرض","قسيمة","هدية",
  "عيد","رمضان","عيدفطر","عيدأضحى","مسجد","منبر","محراب","قبلة","تسبيح","مصحف",
  "وضوء","غسل","صلاة","زكاة","حج","عمرة","دعاء","ذكر","صوم","إفطار",
  "سحور","مدفع","هلال","كعبة","مقام","مئذنة","قبلة","سبحة","مسواك","محراب",
  "طبيبأسنان","مبضع","مشرط","حقنة","إبرة","شاشة","مقياس","ميزان","سماعة","ضماد",
  "شريط","لاصق","قطن","مطهر","كحول","عكاز","كرسي","نقالة","سرير","كمامة",
  "فيتامين","مضاد","مسكن","مرهم","شراب","حبوب","دواء","صيدلية","مستوصف","عيادة",
  "مطبعة","مكتبة","وراقة","قرطاسية","ألواح","دفاتر","ملفات","مجلد","أرشيف","ختم",
  "طابع","طرد","بريد","ظرف","عنوان","مرسل","مستلم","شحنة","ناقلة","بريدجوي",
  "ملعب","صالة","حلبة","مدرج","مدرب","مساعد","منافس","خصم","مشجع","جماهير",
  "بطولة","كأس","ميدالية","ذهبية","فضية","برونزية","تحكيم","صافرة","ركنية","جزاء",
  "تسلل","رماية","قفز","سباحة","جمباز","مصارعة","ملاكمة","تايكواندو","كاراتيه","جودو",
  "يوغا","زومبا","إحماء","تمرين","جري","سباق","ماراثون","دراجات","تزلج","تسلق",
  "كهف","نفق","قمة","سفح","وادي","هضبة","سهل","صخرة","حصاة","رملية",
  "واحدة","ثانية","دقيقة","ساعة","يوم","أسبوع","شهر","سنة","قرن","عصر",
  "صباح","ظهر","عصر","مغرب","عشاء","ليل","نهار","فجر","شروق","غروب",
  "شرق","غرب","شمال","جنوب","وسط","دائرة","مربع","مثلث","مستطيل","بيضاوي",
  "نجمة","كوكب","مجرة","شهاب","قمر","شمس","كسوف","خسوف","مدار","محطة",
  "قمرصناعي","صاروخ","مسبار","مكوك","بدلة","خوذة","مِرقاب","ملاحة","مدار","مسار",
  "منزل","بيت","شقة","قصر","كوخ","خيمة","فناء","حديقة","شرفة","سطح",
  "مطبخ","حمام","غرفة","صالون","ممر","قاعة","مكتب","مخزن","قبو","علية",
  "مطار","محطة","رصيف","موقف","مركبة","سيارة","دراجة","حافلة","قطار","مترو",
  "تاكسي","منبه","إشارة","لوحة","رخصة","غرامة","دوران","دوار","فاصل","جسر",
  "نفق","مخرج","مدخل","بوابة","سياج","سور","ثكنة","مخفر","سجن","محكمة",
  "حديقة","متنزه","متحف","معرض","مكتبة","مسارح","سينما","مطعم","مقهى","متجر",
  "سوق","مول","صيدلية","مخبز","جزارة","خياطة","خياطة","حلاقة","كوافير","مصبغة",
  "مشغل","ورشة","مصنع","مزرعة","مخزن","مستودع","مصفاة","منجم","محجر","مفرمة",
  "مطحنة","مخبز","مذبح","مسلخ","مرآب","كراج","مغسلة","كواشف","مخبر","مختبر",
  "جامعة","كلية","مدرسة","معهد","روضة","حضانة","صف","درس","منهج","اختبار",
  "واجب","وظيفة","مشروع","بحث","تقرير","عرض","مناظرة","منحة","قبول","تخرج",
  "توظيف","مقابلة","سيرة","خبرة","مهارة","راتب","مكافأة","ترقية","إجازة","استقالة",
  "تقاعد","تأمين","قرض","استثمار","أسهم","سندات","محفظة","تداول","بورصة","مصرف",
  "شركة","مؤسسة","منظمة","جمعية","نقابة","حزب","حكومة","وزارة","هيئة","مجلس",
  "لجنة","مركز","معرض","مؤتمر","ندوة","ورشة","دورة","محفل","مهرجان","احتفال",
  "حفلة","زفاف","خطوبة","عيدميلاد","ذكرى","تعزية","مأتم","جنازة","عزاء","مولد",
  "طفولة","مراهقة","شباب","شيخوخة","صحة","مرض","عافية","نشاط","كسل","قوة",
  "ضعف","طاقة","حماس","ملل","نعاس","يقظة","راحة","تعب","ألم","فرح",
  "مزاج","شهية","عطش","جوع","شبع","حر","برد","دافئ","رطب","جاف",
  "غريب","طريف","ممتع","مضحك","محزن","رائع","مذهل","مثير","عادي","بسيط",
  "سريع","بطيء","خفيف","ثقيل","قوي","ضعيف","قريب","بعيد","قديم","حديث",
  "قصير","طويل","عريض","ضيق","عميق","سطحي","صعب","سهل","معقد","بسيط",
  "باهظ","رخيص","جميل","قبيح","نظيف","متسخ","مرتب","فوضوي","ناعم","خشن",
  "دائري","مربع","مثلث","مستطيل","حلو","مر","حامض","مالح","حاد","باهت",
  "لامع","داكن","فاتح","مضيء","معتم","ساخن","بارد","فاتر","عطر","رائحة",
  "مذاق","مسموع","مرئي","ملموس","مفهوم","غامض","واضح","دقيق","عام","خاص",
  "محلي","عالمي","شعبي","رسمي","تقليدي","حديث","تراث","ثقافة","لغة","لهجة",
  "قواعد","مفردات","ترجمة","تعبير","استماع","محادثة","قراءة","كتابة","إملاء","خط",
  "حدوة","سلسلة","حلزون","رماد","شظية","شرارة","جمر","لهب","دخان","رماد",
  "قلادة","خاتم","سوار","تاج","مشط","مرآة","حقيبة","محفظة","حذاء","نعل",
  "وردة","زهرة","نرجس","ياسمين","فل","ورد","قرنفل","جوري","لافندر","ريحان",
  "سوسن","زنبق","نيلوفر","خزامى","أقحوان","دوار","عباد","شقائق","نعناع","زعفران"
  // ... القائمة ممتدة وتصل إلى ~1000 كلمة. يمكنك إضافة المزيد لاحقًا بسهولة.
];

// Unique words (to avoid duplicates and to compute accurate remaining count)
const UNIQUE_WORDS = Array.from(new Set(ARABIC_WORDS));
const TOTAL_UNIQUE_WORDS = UNIQUE_WORDS.length;

// DOM elements
const wordEl = document.getElementById('word');
const correctBtn = document.getElementById('correctBtn');
const skipBtn = document.getElementById('skipBtn');
const startRoundBtn = document.getElementById('startRoundBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const reloadWordsBtn = document.getElementById('reloadWordsBtn');
const softResetBtn = document.getElementById('softResetBtn');
const fullResetBtn = document.getElementById('fullResetBtn');
const pauseBtn = document.getElementById('pauseBtn');
const wordsLeftEl = document.getElementById('wordsLeft');
const settingsModal = document.getElementById('settingsModal');
const laptopModeInput = document.getElementById('laptopMode');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeSettingsBackdrop = document.getElementById('closeSettingsBackdrop');

const timerDisplay = document.getElementById('timerDisplay');
const team1ScoreEl = document.getElementById('team1Score');
const team2ScoreEl = document.getElementById('team2Score');
const team1Card = document.getElementById('team1Card');
const team2Card = document.getElementById('team2Card');
const team1Label = document.getElementById('team1Label');
const team2Label = document.getElementById('team2Label');
const controlsSection = null; // controls moved into settings modal
const team1NameInput = document.getElementById('team1Name');
const team2NameInput = document.getElementById('team2Name');
const roundSecondsInput = document.getElementById('roundSeconds');
const startingTeamSelect = document.getElementById('startingTeam');

// Audio (end beep) - short, generated via WebAudio
function playEndBeep() {
  const durationMs = 900;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  setTimeout(() => {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    oscillator.stop(audioCtx.currentTime + 0.21);
    audioCtx.close();
  }, durationMs);
}

// Utils
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatSeconds(total) {
  const mm = Math.floor(total / 60).toString().padStart(2, '0');
  const ss = (total % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function setButtonsEnabled(enabled) {
  correctBtn.disabled = !enabled;
  skipBtn.disabled = !enabled;
}

function updateActiveTeamStyles() {
  if (state.activeTeamIndex === 0) {
    team1Card.classList.add('team-card--active');
    team2Card.classList.remove('team-card--active');
  } else {
    team2Card.classList.add('team-card--active');
    team1Card.classList.remove('team-card--active');
  }
}

function updateScoresUI() {
  team1ScoreEl.textContent = state.scores[0];
  team2ScoreEl.textContent = state.scores[1];
}

function setWord(text) {
  wordEl.textContent = text;
}

function updateTeamNames() {
  const t1 = (team1NameInput.value || 'الفريق 1').trim();
  const t2 = (team2NameInput.value || 'الفريق 2').trim();
  team1Label.textContent = t1 || 'الفريق 1';
  team2Label.textContent = t2 || 'الفريق 2';
}

function buildDeckFromUnused() {
  const unused = UNIQUE_WORDS.filter(w => !state.usedWords.has(w));
  state.wordDeck = shuffle(unused);
  state.wordIndex = 0;
  updateWordsLeft();
}

function nextWord() {
  if (state.wordDeck.length === 0 || state.wordIndex >= state.wordDeck.length) {
    // No more words available without repeats
    endRound();
    setWord('نفدت الكلمات! اضغط "إعادة الكلمات" لإعادة الترتيب والسماح بالتكرار.');
    return;
  }
  const word = state.wordDeck[state.wordIndex++];
  state.usedWords.add(word);
  persist();
  setWord(word);
  updateWordsLeft();
}

function startRound() {
  if (state.inRound) return;
  const seconds = Math.max(5, Math.min(600, parseInt(roundSecondsInput.value || '60', 10)));
  state.roundDuration = seconds;
  state.secondsRemaining = seconds;
  persist();
  timerDisplay.textContent = formatSeconds(state.secondsRemaining);
  updateWordsLeft();

  // adopt team names from inputs
  updateTeamNames();

  // Prepare deck from unused words
  buildDeckFromUnused();
  if (state.wordDeck.length === 0) {
    setButtonsEnabled(false);
    setWord('لا توجد كلمات متبقية. اضغط "إعادة الكلمات" للمتابعة.');
    return;
  }

  state.inRound = true;
  state.paused = false;
  setButtonsEnabled(true);
  updateActiveTeamStyles();
  if (settingsModal) settingsModal.classList.add('hidden');
  if (pauseBtn) {
    pauseBtn.classList.remove('hidden');
    pauseBtn.textContent = 'إيقاف مؤقت';
  }
  nextWord();

  state.intervalId = setInterval(() => {
    state.secondsRemaining -= 1;
    timerDisplay.textContent = formatSeconds(state.secondsRemaining);
    if (state.secondsRemaining <= 0) {
      endRound();
    }
  }, 1000);
}

function endRound() {
  if (!state.inRound) return;
  state.inRound = false;
  setButtonsEnabled(false);
  clearInterval(state.intervalId);
  state.intervalId = null;
  timerDisplay.textContent = '00:00';
  playEndBeep();

  // Switch team for next round
  state.activeTeamIndex = state.activeTeamIndex === 0 ? 1 : 0;
  updateActiveTeamStyles();
  persist();
  if (state.wordDeck.length === 0 || state.wordIndex >= state.wordDeck.length) {
    setWord('انتهت الجولة! نفدت الكلمات. اضغط "إعادة الكلمات" ثم "ابدأ الجولة".');
  } else {
    setWord('انتهت الجولة! اضغط "ابدأ الجولة" لدور الفريق التالي.');
  }
  // Keep settings modal hidden after round ends
  if (settingsModal) settingsModal.classList.add('hidden');
  if (pauseBtn) pauseBtn.classList.add('hidden');
  updateWordsLeft();
}

// Handlers
correctBtn.addEventListener('click', () => {
  if (!state.inRound || state.paused) return;
  state.scores[state.activeTeamIndex] += 1;
  updateScoresUI();
  persist();
  nextWord();
});

skipBtn.addEventListener('click', () => {
  if (!state.inRound || state.paused) return;
  state.scores[state.activeTeamIndex] -= 1;
  updateScoresUI();
  persist();
  nextWord();
});

startRoundBtn.addEventListener('click', startRound);

resetScoresBtn.addEventListener('click', () => {
  state.scores = [0, 0];
  updateScoresUI();
  persist();
});

fullscreenBtn.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (e) {
    // ignore
  }
});

reloadWordsBtn.addEventListener('click', () => {
  state.usedWords = new Set();
  buildDeckFromUnused();
  setWord('تمت إعادة الكلمات. يمكنك البدء الآن.');
  persist();
  updateWordsLeft();
});

softResetBtn.addEventListener('click', () => {
  // End round if running, but do not touch used words
  if (state.inRound) {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.inRound = false;
  }
  state.paused = false;
  setButtonsEnabled(false);
  state.secondsRemaining = Math.max(5, Math.min(600, parseInt(roundSecondsInput.value || '60', 10)));
  timerDisplay.textContent = formatSeconds(state.secondsRemaining);
  setWord('تمت إعادة الجولة دون إعادة الكلمات. اضغط "ابدأ الجولة" للمتابعة.');
  persist();
  if (pauseBtn) pauseBtn.classList.add('hidden');
  updateWordsLeft();
});

// Keyboard shortcuts for convenience
document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowRight') {
    if (state.inRound && !state.paused) correctBtn.click();
  } else if (e.code === 'ArrowLeft') {
    if (state.inRound && !state.paused) skipBtn.click();
  } else if (
    e.code === 'Numpad1' ||
    (e.key === '1' && !e.ctrlKey && !e.altKey && !e.metaKey)
  ) {
    if (state.inRound && !state.paused) {
      e.preventDefault();
      correctBtn.click();
    }
  } else if (
    e.code === 'Numpad3' ||
    (e.key === '3' && !e.ctrlKey && !e.altKey && !e.metaKey)
  ) {
    if (state.inRound && !state.paused) {
      e.preventDefault();
      skipBtn.click();
    }
  }
});

// Persistence
const STORAGE_KEY = 'guess_game_state_v1';
function persist() {
  try {
    const payload = {
      activeTeamIndex: state.activeTeamIndex,
      scores: state.scores,
      usedWords: Array.from(state.usedWords),
      team1Name: (team1NameInput.value || 'الفريق 1').trim(),
      team2Name: (team2NameInput.value || 'الفريق 2').trim(),
      roundDuration: Math.max(5, Math.min(600, parseInt(roundSecondsInput.value || '60', 10))),
      startingTeam: startingTeamSelect ? parseInt(startingTeamSelect.value, 10) : 0,
      laptopMode: !!(laptopModeInput && laptopModeInput.checked)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) { /* ignore */ }
}

function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.activeTeamIndex === 'number') state.activeTeamIndex = data.activeTeamIndex;
    if (Array.isArray(data.scores) && data.scores.length === 2) state.scores = data.scores.map(n => parseInt(n, 10) || 0);
    if (Array.isArray(data.usedWords)) state.usedWords = new Set(data.usedWords);
    if (typeof data.team1Name === 'string') team1NameInput.value = data.team1Name;
    if (typeof data.team2Name === 'string') team2NameInput.value = data.team2Name;
    if (typeof data.roundDuration === 'number') roundSecondsInput.value = String(data.roundDuration);
    if (typeof data.startingTeam === 'number' && startingTeamSelect) startingTeamSelect.value = String(data.startingTeam);
    if (typeof data.laptopMode === 'boolean' && laptopModeInput) laptopModeInput.checked = data.laptopMode;
  } catch (_) { /* ignore */ }
}

fullResetBtn.addEventListener('click', () => {
  // Stop any running timer/round
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.inRound = false;
  state.paused = false;
  setButtonsEnabled(false);

  // Reset game state
  state.activeTeamIndex = startingTeamSelect ? parseInt(startingTeamSelect.value, 10) || 0 : 0;
  state.scores = [0, 0];
  state.usedWords = new Set();
  state.wordDeck = [];
  state.wordIndex = 0;
  state.roundDuration = 60;
  state.secondsRemaining = 60;

  // Reset UI inputs and labels (preserve team names)
  roundSecondsInput.value = '60';
  updateTeamNames();
  updateScoresUI();
  updateActiveTeamStyles();
  timerDisplay.textContent = formatSeconds(state.secondsRemaining);
  setWord('تمت إعادة ضبط اللعبة بالكامل.');
  controlsSection.classList.remove('hidden');
  if (pauseBtn) pauseBtn.classList.add('hidden');

  // Clear and reinitialize persistence
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  persist();
  updateWordsLeft();
});

// Initial UI state
restore();
setButtonsEnabled(false);
updateScoresUI();
updateActiveTeamStyles();
updateTeamNames();
timerDisplay.textContent = formatSeconds(Math.max(5, Math.min(600, parseInt(roundSecondsInput.value || '60', 10))));
function updateWordsLeft() {
  if (!wordsLeftEl) return;
  const left = TOTAL_UNIQUE_WORDS - state.usedWords.size;
  wordsLeftEl.textContent = `متبقي: ${left}`;
}
updateWordsLeft();

// Live team name updates
team1NameInput.addEventListener('input', updateTeamNames);
team2NameInput.addEventListener('input', updateTeamNames);
team1NameInput.addEventListener('change', persist);
team2NameInput.addEventListener('change', persist);
roundSecondsInput.addEventListener('change', persist);
if (startingTeamSelect) startingTeamSelect.addEventListener('change', () => {
  if (!state.inRound) {
    state.activeTeamIndex = parseInt(startingTeamSelect.value, 10) || 0;
    updateActiveTeamStyles();
  }
  persist();
});

// Pause/Resume logic
if (typeof pauseBtn !== 'undefined' && pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    if (!state.inRound) return;
    if (!state.paused) {
      // Pause
      state.paused = true;
      clearInterval(state.intervalId);
      state.intervalId = null;
      setButtonsEnabled(false);
      if (settingsModal) settingsModal.classList.remove('hidden');
      pauseBtn.textContent = 'متابعة';
    } else {
      // Resume
      state.paused = false;
      setButtonsEnabled(true);
      if (settingsModal) settingsModal.classList.add('hidden');
      pauseBtn.textContent = 'إيقاف مؤقت';
      state.intervalId = setInterval(() => {
        state.secondsRemaining -= 1;
        timerDisplay.textContent = formatSeconds(state.secondsRemaining);
        if (state.secondsRemaining <= 0) {
          endRound();
        }
      }, 1000);
    }
  });
}

// Settings modal open/close
if (openSettingsBtn && settingsModal) {
  openSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
}
if (closeSettingsBtn && settingsModal) {
  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
}
if (closeSettingsBackdrop && settingsModal) {
  closeSettingsBackdrop.addEventListener('click', () => settingsModal.classList.add('hidden'));
}

// Laptop mode toggle
function applyLaptopModeClass() {
  const enabled = !!(laptopModeInput && laptopModeInput.checked);
  document.body.classList.toggle('laptop-mode', enabled);
}
if (laptopModeInput) {
  laptopModeInput.addEventListener('change', () => {
    applyLaptopModeClass();
    persist();
  });
}
// Apply on load after restore
applyLaptopModeClass();


