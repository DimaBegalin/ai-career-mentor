/* Данные квиза: специальности, уровни, вопросы, фолбэк-база вузов */
const SPECS = {
  business:   { name:"Business Administration", why:["Тебя тянет создавать своё","Умеешь влиять на людей","Мыслишь результатом"], desc:"Управление, стратегия, запуск AI-продуктов. Путь к своей компании или топ-менеджменту.", aiTracks:["AI in Business","Product Management в AI","AI-стартапы"] },
  marketing:  { name:"Marketing", why:["Чувствуешь аудиторию","Креатив + аналитика","Понимаешь соцсети изнутри"], desc:"Бренды, контент, рост продуктов — одна из самых востребованных сфер digital-экономики.", aiTracks:["AI in Marketing","MarTech-аналитика","Генеративный контент"] },
  cs:         { name:"Computer Science & AI Engineering", why:["Аналитический склад ума","Любишь строить системы","Индустрия с самым быстрым ростом"], desc:"Программирование, ИИ, данные. Максимальная гибкость: от AI-стартапов до Big Tech.", aiTracks:["AI Engineer","Machine Learning","Data Science"] },
  medicine:   { name:"Medicine & Health Sciences", why:["Хочешь реально помогать людям","Сильная база в естественных науках","Готов к длинной игре"], desc:"Медицина, биотех, public health — долгий, но самый уважаемый путь.", aiTracks:["AI in Healthcare","Биоинформатика","MedTech"] },
  engineering:{ name:"Engineering", why:["Решаешь нерешаемое","Дружишь с математикой","Любишь, когда вещи работают"], desc:"Аэрокосмос, робототехника, энергетика — профессии, которые строят будущее.", aiTracks:["Робототехника и AI","Автономные системы","Smart Energy"] },
  design:     { name:"Digital Design & Media", why:["Креатив — твой язык","Чувствуешь визуал и тренды","Портфолио важнее оценок"], desc:"Продуктовый дизайн, геймдев, медиа — сфера, которую ИИ заменит последней.", aiTracks:["Генеративный дизайн","UX для AI-продуктов","Геймдев и AI"] },
  education:  { name:"Education, HR & Wellbeing", why:["Влияешь на людей","Умеешь объяснять сложное","Эмпатия + лидерство"], desc:"EdTech, HR и wellbeing — профессии со смыслом, которые AI усиливает, а не заменяет.", aiTracks:["Education in AI","HR-tech","Wellbeing-tech"] },
  science:    { name:"Natural Sciences & Research", why:["Любопытство исследователя","Глубина, а не хайп","Академическая траектория"], desc:"Физика, биология, космос — дорога в науку, PhD и исследовательские центры.", aiTracks:["AI for Science","Computational Research","Data Science в науке"] },
};

const LEVELS = [
  {min:0,name:"Bronze"},{min:70,name:"Silver"},
  {min:130,name:"Gold"},{min:200,name:"Platinum"},{min:260,name:"Ivy League"},
];
const STAT_LABELS = { academic:"Academic", english:"English", leadership:"Leadership", portfolio:"Portfolio" };

/* multi:true — можно выбрать несколько вариантов.
   cond:()=>… — вопрос показывается только при выполнении условия.
   ПРАВИЛО РЕАКЦИЙ: конкретные страны и названия грантов появляются ТОЛЬКО
   в реакциях вопроса geo — по выбору ученика. До и после geo реакции говорят
   о профиле: сильные стороны, баллы, сроки. Дедлайн «~1 ноября» без страны — можно. */
const QUESTIONS = [
  { id:"dream", emoji:"💰", title:"Если деньги вообще не нужны…", sub:"Что бы ты делал каждый день?",
    options:[
      { t:"Создавал бизнес",   tags:{business:3,marketing:1}, stats:{leadership:14}, r:{e:"✨",t:"Интересно…",n:"Ты больше предприниматель, чем исполнитель: свой проект в заявке весит больше оценок. Фиксируй всё, что уже запускал — даты, цифры, результат."} },
      { t:"Учил людей",        tags:{education:3,business:1}, stats:{leadership:10}, r:{e:"⚡",t:"У тебя сильное влияние на людей.",n:"EdTech — рынок на $400 млрд, и людям, которые умеют объяснять, в нём платят всё больше. Влияние на людей — сильнейший материал для эссе."} },
      { t:"Создавал игры",     tags:{cs:2,design:2},          stats:{portfolio:8},   r:{e:"🎮",t:"Хороший вкус.",n:"Геймдев — индустрия на $200 млрд, и в профильные вузы берут по портфолио. 2–3 собственных прототипа часто весят больше, чем SAT."} },
      { t:"Исследовал космос", tags:{science:3,engineering:1},stats:{academic:10},   r:{e:"🔭",t:"Редкий выбор.",n:"Research-программы ценят олимпиады и научные проекты больше оценок. Начни с одного исследования в 10–11 классе — это твой входной билет."} },
      { t:"Программировал",    tags:{cs:3},                   stats:{academic:10},   r:{e:"🤖",t:"Эпоха ИИ.",n:"AI Engineer — самая быстрорастущая профессия: вакансий за год стало больше на 70%+. Пара пет-проектов на GitHub к 11 классу заметно усилит заявку."} },
      { t:"Лечил людей",       tags:{medicine:3},             stats:{academic:10},   r:{e:"🩺",t:"Серьёзный путь.",n:"Медицина — самый длинный, но самый уважаемый маршрут. Качай биологию и химию до олимпиадного уровня уже сейчас — это главный фильтр отбора."} },
    ]},
  { id:"school", emoji:"⚡", title:"Что в школе даётся легче всего?", sub:"Честно — без «надо стараться».", multi:true,
    options:[
      { t:"Математика",            tags:{cs:2,engineering:2,business:1}, stats:{academic:15}, r:{e:"🧠",t:"Отлично.",n:"Математика — вход в CS, инженерию и финансы, где грантов больше всего. На SAT Math 700+ хватает 3–4 месяцев прицельной подготовки."} },
      { t:"Языки",                 tags:{marketing:2,education:2},       stats:{english:15},  r:{e:"🌍",t:"Мощно.",n:"С такой базой IELTS 7.0 реален за 3–6 месяцев, а это порог почти всех топ-программ. Реальный срок подготовки — от 3 до 12 месяцев, всё зависит от энергии и намерения."} },
      { t:"Биология и химия",      tags:{medicine:3,science:1},          stats:{academic:15}, r:{e:"🧬",t:"Сильная база.",n:"Это фундамент медицины и биотеха — направлений с самым стабильным спросом. Добавь 1–2 олимпиады по био или химии — и заявка станет конкурентной."} },
      { t:"Общение и выступления", tags:{business:2,marketing:2},        stats:{leadership:15}, a:"Сильный лидер", r:{e:"⚡",t:"У тебя сильное влияние на людей.",n:"Комиссии оценивают лидерство по конкретике: клуб, проект, команда. Один задокументированный кейс — готовый сильный абзац в эссе."} },
      { t:"Творчество",            tags:{design:3,marketing:1},          stats:{portfolio:10}, r:{e:"🎨",t:"Креатив решает.",n:"Дизайн-программы берут по портфолио: 5–7 работ важнее оценок. Начни собирать его на Behance уже в этом году."} },
    ]},
  { id:"power", emoji:"🦸", title:"Выбери суперсилу", sub:"Одну. Навсегда.",
    options:[
      { t:"Убеждать любого",   tags:{business:2,marketing:2}, stats:{leadership:14}, a:"Сильный лидер",           r:{e:"🔥",t:"Переговорщик.",n:"Убеждение — ядро Business и Product Management в AI, и монетизируется оно быстрее всех. Прокачай его кейс-чемпионатами: одна победа — сильная строчка в заявке."} },
      { t:"Решать нерешаемое", tags:{cs:2,engineering:2},     stats:{academic:12},   a:"Аналитический склад ума", r:{e:"🧠",t:"Инженерное мышление.",n:"За такой профиль research-вузы дают полные гранты. Олимпиада по математике или физике удвоит твои шансы."} },
      { t:"Придумывать новое", tags:{design:2,business:1,marketing:1}, stats:{portfolio:8}, a:"Креативное мышление", r:{e:"💡",t:"Генератор идей.",n:"Вузы ценят идеи, доведённые до продукта: покажи 1–2 реализованных проекта. На один прототип хватает 2–3 месяцев."} },
      { t:"Помогать людям",    tags:{medicine:2,education:2}, stats:{leadership:8},  r:{e:"🤝",t:"Эмпатия — редкий ресурс.",n:"Профессии импакта растут быстрее рынка, а волонтёрство с измеримым результатом — до 30% успеха заявки. Начни с одного проекта на 2–3 месяца."} },
    ]},
  { id:"evening", emoji:"📱", title:"Чем обычно занят твой вечер?", sub:"После уроков и домашки.", multi:true,
    options:[
      { t:"Свой проект или подработка", tags:{business:2}, stats:{portfolio:15,leadership:6}, a:"Предпринимательский потенциал", r:{e:"🔥",t:"Ого.",n:"Только 8% школьников уже что-то запускали — комиссии видят это сразу. Опиши проект цифрами: сколько людей, денег, месяцев."} },
      { t:"Игры и код",                tags:{cs:2},       stats:{portfolio:10}, r:{e:"⌨️",t:"Норм.",n:"2–3 пет-проекта на GitHub — уже портфолио для CS-программ. На один проект достаточно 4–6 недель."} },
      { t:"Контент и соцсети",          tags:{marketing:2,design:1}, stats:{portfolio:10}, r:{e:"📈",t:"Ты понимаешь медиа.",n:"Свой канал с аналитикой роста — готовый кейс для Marketing и Digital Media. Зафиксируй цифры: подписчики, охваты, динамика по месяцам."} },
      { t:"Книги и наука",              tags:{science:2,education:1}, stats:{academic:12}, r:{e:"🤓",t:"Глубина.",n:"Комиссии любят любопытство, но просят доказательств: научный проект или конкурс. Одного research-проекта в год достаточно."} },
      { t:"Спорт и волонтёрство",       tags:{education:1}, stats:{leadership:14}, a:"Командный игрок", meta:{vol:true}, r:{e:"🏅",t:"Командный игрок.",n:"Внеклассная активность — до 30% веса заявки в топ-вуз. Важен измеримый результат: часы, люди, эффект."} },
    ]},
  { id:"english", emoji:"🗣️", title:"Твой английский сейчас?", sub:"Без прикрас — это важно для расчёта.",
    options:[
      { t:"Свободно говорю",          stats:{english:35}, meta:{eng:"C1"}, r:{e:"🇬🇧",t:"Красавчик.",n:"IELTS 7.0+ для тебя — 1–2 месяца на формат и пробники. С таким баллом языковой порог почти любых грантов закрыт."} },
      { t:"Смотрю без субтитров",     stats:{english:25}, meta:{eng:"B2"}, r:{e:"🎬",t:"Хорошая база.",n:"С B2 до IELTS 6.5 обычно доходят за 3–6 месяцев занятий. Реальный срок подготовки — от 3 до 12 месяцев, всё зависит от энергии и намерения."} },
      { t:"Средне, школьный уровень", stats:{english:12}, meta:{eng:"B1"}, r:{e:"📘",t:"Рабочая ситуация.",n:"Со школьного уровня до IELTS 6.0–6.5 доходят за 6–12 месяцев при 4 занятиях в неделю. Дедлайн многих грантов — ~1 ноября, планируй от него."} },
      { t:"Только начинаю",           stats:{english:5},  meta:{eng:"A2"}, r:{e:"🌱",t:"Честно — уже хорошо.",n:"Английский качается быстрее других навыков: реальный срок подготовки — от 3 до 12 месяцев, всё зависит от энергии и намерения. Начни с 30 минут в день."} },
    ]},
  { id:"gpa", emoji:"📊", title:"Твой средний балл?", sub:"Примерно, за последний год.",
    options:[
      { t:"5.0 – 4.5", stats:{academic:25}, meta:{gpa:"5.0-4.5"}, r:{e:"🎓",t:"С таким GPA открыты топ-вузы.",n:"Ты проходишь академический порог большинства грантовых программ. Дальше всё решают IELTS и внеклассная часть заявки."} },
      { t:"4.4 – 4.0", stats:{academic:18}, meta:{gpa:"4.4-4.0"}, r:{e:"👍",t:"Крепкий уровень.",n:"Для большинства программ с грантами этого достаточно. Добавь IELTS 6.5+ — и селективные вузы тоже в игре."} },
      { t:"3.9 – 3.5", stats:{academic:10}, meta:{gpa:"3.9-3.5"}, r:{e:"📚",t:"Подтянем.",n:"Комиссии смотрят динамику: рост оценок за последние 2 года работает на тебя. Именно выпускные классы весят больше всего — поднажми сейчас."} },
      { t:"Ниже",      stats:{academic:5},  meta:{gpa:"<3.5"},    r:{e:"💪",t:"Не приговор.",n:"GPA компенсируют сильное эссе, проекты и IELTS 6.5+ — так поступают каждый год. Выбирай вузы с holistic review и поздними дедлайнами."} },
    ]},
  { id:"exams", emoji:"📝", title:"IELTS и SAT уже сдавал?", sub:"Официальные экзамены, не пробники.",
    options:[
      { t:"Сдал оба — IELTS и SAT", stats:{english:12,academic:10}, meta:{ielts:true,sat:true}, a:"Экзамены в кармане", r:{e:"🚀",t:"Мощная позиция.",n:"Половина заявки готова — теперь баллы определяют список вузов. Сейчас сверим их с порогами конкретных программ."} },
      { t:"Только IELTS",           stats:{english:12},             meta:{ielts:true,sat:false}, r:{e:"📗",t:"Хороший задел.",n:"Многие грантовые программы принимают без SAT — IELTS главный фильтр, и он у тебя уже есть. Сейчас сверим балл с порогами."} },
      { t:"Только SAT",             stats:{academic:10},            meta:{ielts:false,sat:true}, r:{e:"🧮",t:"Редкий случай.",n:"SAT без IELTS двери не откроет — языковой сертификат обязателен почти везде. Реальный срок подготовки к IELTS — от 3 до 12 месяцев, зависит от энергии и намерения."} },
      { t:"Пока ничего не сдавал",  meta:{ielts:false,sat:false},   r:{e:"🗓️",t:"Всё по плану.",n:"Если ты в 8–9 классе — время есть: начинай готовиться с лета после 9 класса. Дедлайн многих грантов — 1 ноября, и чем выше IELTS, тем шире выбор."} },
    ]},
  { id:"ielts_score", emoji:"📗", title:"Какой у тебя балл IELTS?", sub:"Официальный overall score.", cond:()=>S.meta.ielts===true,
    options:[
      { t:"7.5 и выше",   stats:{english:23}, meta:{ieltsScore:"7.5+"},  r:{e:"🏆",t:"Топ-уровень.",n:"Это выше языкового порога практически любого университета мира. Фильтр закрыт полностью — вкладывай время в остальную заявку."} },
      { t:"7.0",          stats:{english:18}, meta:{ieltsScore:"7.0"},   r:{e:"🚀",t:"Сильный балл.",n:"Проходишь языковой порог топ-программ и полных грантов. Пересдача не нужна — займись эссе и портфолио."} },
      { t:"6.5",          stats:{english:13}, meta:{ieltsScore:"6.5"},   r:{e:"👍",t:"Рабочий балл.",n:"Стандартный порог большинства грантовых программ — ты проходишь. Самые селективные просят 7.0 — реши, нужно ли оно тебе."} },
      { t:"6.0",          stats:{english:8},  meta:{ieltsScore:"6.0"},   r:{e:"📘",t:"База есть.",n:"Для части грантовых программ хватает, но топовые просят 6.5+. Пересдача после 2–3 месяцев подготовки обычно даёт +0.5."} },
      { t:"5.5 или ниже", stats:{english:4},  meta:{ieltsScore:"5.5 или ниже"}, r:{e:"💪",t:"Старт есть.",n:"Пересдача после 2–3 месяцев прицельной подготовки обычно даёт +0.5–1.0. Реальный срок до сильного балла — от 3 до 12 месяцев, зависит от энергии и намерения."} },
    ]},
  { id:"sat_score", emoji:"🧮", title:"Какой у тебя балл SAT?", sub:"Суммарный результат.", cond:()=>S.meta.sat===true,
    options:[
      { t:"1450 и выше", stats:{academic:20}, meta:{satScore:"1450+"},     r:{e:"🏆",t:"Максимальный уровень.",n:"Это уровень самых селективных вузов и полных merit-стипендий. Подавай смело — твой SAT конкурентен."} },
      { t:"1350 – 1440", stats:{academic:15}, meta:{satScore:"1350-1440"}, r:{e:"🚀",t:"Сильный результат.",n:"Открыты десятки университетов с грантами 50–100%. Пересдача на 1500+ обычно даёт +100 баллов за 2–3 месяца."} },
      { t:"1200 – 1340", stats:{academic:10}, meta:{satScore:"1200-1340"}, r:{e:"👍",t:"Крепкая база.",n:"Достаточно для многих программ с частичными грантами. Пересдача с подготовкой обычно добавляет 100–200 баллов — реши, куда целишься."} },
      { t:"До 1200",     stats:{academic:5},  meta:{satScore:"до 1200"},   r:{e:"💪",t:"Точка старта.",n:"Пересдача с подготовкой обычно даёт +100–200 баллов за 2–3 месяца. А многие программы принимают вообще без SAT."} },
    ]},
  { id:"grant", emoji:"🎓", title:"Как планируешь оплачивать учёбу?", sub:"От этого зависит список вузов.",
    options:[
      { t:"Только полный грант",      meta:{grant:"полный грант"},    r:{e:"🎓",t:"Принято.",n:"Соберём список только из программ с полным покрытием: учёба, жильё, перелёт. На многие подача до ~1 ноября."} },
      { t:"Частичный грант + семья",  meta:{grant:"частичный грант"}, r:{e:"⚖️",t:"Гибкий вариант.",n:"С частичным финансированием выбор вузов в 3 раза шире: merit-скидки 30–70% дают очень многие университеты. Самая гибкая стратегия."} },
      { t:"Семья оплатит",            meta:{grant:"самофинансирование"}, r:{e:"🌍",t:"Окей.",n:"Тогда смотрим на самые сильные программы без фильтра по грантам. Но merit-стипендию 20–50% всё равно стоит забрать — её дают просто за баллы."} },
      { t:"Пока не думал",            meta:{grant:"не определился"},  r:{e:"💡",t:"Хорошо, что задумался сейчас.",n:"За 12 месяцев реально выйти на полный грант — есть программы, покрывающие всё, включая перелёт. Первый шаг — IELTS."} },
    ]},
  { id:"geo", emoji:"🌍", title:"Где хочешь учиться?", sub:"Первое, что откликается.",
    options:[
      { t:"США",                  meta:{geo:"США"},        r:{e:"🗽",t:"Амбициозно.",n:"Самые большие need-based гранты мира: топ-вузы дают full-ride до 100%. Но и конкурс самый высокий — нужны SAT 1400+ и сильное эссе."} },
      { t:"Европа",               meta:{geo:"Европа"},     r:{e:"🏰",t:"Умный выбор.",n:"Stipendium Hungaricum и DAAD покрывают учёбу полностью, а в Германии обучение почти бесплатное. Сотни программ на английском."} },
      { t:"Азия",                 meta:{geo:"Азия"},       r:{e:"🌏",t:"Тренд десятилетия.",n:"Южная Корея, Гонконг, Китай, Малайзия, Сингапур, Япония — гранты GKS и MEXT раздают активнее всех. На многие подача до 1 ноября."} },
      { t:"Казахстан",            meta:{geo:"Казахстан"},  r:{e:"🇰🇿",t:"База рядом.",n:"Грант NU покрывает обучение полностью, плюс гос. гранты через ЕНТ. И это можно совмещать с подачей за рубеж."} },
      { t:"Всё равно — где грант", meta:{geo:"любая страна с грантом"}, r:{e:"🎯",t:"Прагматично.",n:"Стратегия «сначала грант» срабатывает чаще всего: подберём страну под твои баллы, а не наоборот. Самый рациональный подход."} },
    ]},
  { id:"extra", emoji:"🏆", title:"Что из этого уже есть?", sub:"Отметь всё, что накопилось.", multi:true,
    options:[
      { t:"Олимпиады",    stats:{academic:10,portfolio:10}, a:"Олимпиадник", meta:{extra:"олимпиады"}, r:{e:"🏅",t:"Серьёзный козырь.",n:"Республиканский уровень часто означает +грант, международный открывает топ-вузы почти без конкурса. Впиши в заявку все, даже школьные."} },
      { t:"Волонтёрство", stats:{leadership:10,portfolio:8}, meta:{vol:true,extra:"волонтёрство"}, r:{e:"🤝",t:"Отлично.",n:"Топ-вузы ищут импакт: опиши волонтёрство цифрами — часы, люди, результат. Один измеримый проект сильнее десяти разовых акций."} },
      { t:"Свои проекты", stats:{portfolio:15}, a:"Предпринимательский потенциал", meta:{extra:"свои проекты"}, r:{e:"🛠️",t:"Это золото.",n:"Реальные проекты выделяют заявку из тысяч похожих. Опиши каждый по схеме: проблема — что сделал — результат в цифрах."} },
      { t:"Пока ничего",  stats:{portfolio:2},  meta:{extra:"нет"}, none:true, r:{e:"😌",t:"Честность — тоже скилл.",n:"Портфолио собирается за 3–4 месяца: один проект + волонтёрство + конкурс. Начни этим летом — к дедлайнам ~1 ноября успеешь."} },
    ]},
  { id:"future", emoji:"🔮", title:"Кем видишь себя через 10 лет?", sub:"Последний вопрос. Самый важный.",
    options:[
      { t:"Владелец компании",        tags:{business:3},              stats:{leadership:10}, r:{e:"🚀",t:"Основатель.",n:"Тогда маршрут — Business с AI-фокусом: продукты сейчас строят на нейросетях. Смотри на стартап-экосистему кампуса — нетворк важнее рейтинга."} },
      { t:"Топ-эксперт в своём деле", tags:{cs:1,engineering:1,science:1}, stats:{academic:10}, r:{e:"🧠",t:"Мастерство.",n:"Глубина побеждает на дистанции: выбирай вузы с сильными лабораториями и research-треком. Многие дают его с полным грантом."} },
      { t:"Известный создатель",      tags:{design:2,marketing:2},    stats:{portfolio:10}, r:{e:"🌟",t:"Креатор.",n:"Начни документировать свою работу публично уже сейчас. Портфолио и охваты — аргументы, которые комиссия может проверить."} },
      { t:"Учёный-исследователь",     tags:{science:3},               stats:{academic:10}, r:{e:"🔬",t:"Наука.",n:"Целься в research-университеты: лаборатории с 1 курса и полное финансирование — стандарт сильных программ. Научный проект в школе — твой входной билет."} },
      { t:"Помогаю людям",            tags:{medicine:2,education:2},  stats:{leadership:6}, r:{e:"❤️",t:"Смысл.",n:"Медицина и образование — сферы, где AI усиливает людей, а не заменяет. На эти направления часто дают полные гранты."} },
    ]},
];

/* Фолбэк-база вузов (если веб-поиск недоступен): география × специальность,
   собрана веб-исследованием, программы — реальные официальные названия.
   sel (5–25) — селективность вуза, участвует в расчёте вероятности. */
const FALLBACK_UNIS = {
  "США": {
    business:[
      {country:"США",name:"University of Pennsylvania (Wharton)",program:"BS in Economics, concentration Artificial Intelligence for Business",grant:"Покрывает 100% need иностранцев (need-aware): гранты до полной стоимости",req:"TOEFL 100+/IELTS 7.5, SAT ~1500+, дедлайн 5 янв (ED 1 ноя)",sel:24},
      {country:"США",name:"Minerva University",program:"BS Business",grant:"Need-based aid всем иностранцам, ~80% получают гранты; tuition всего ~$24.5k",req:"SAT не нужен, англ. по заданиям, раунды ~ноя/янв/апр",sel:16},
      {country:"США",name:"Berea College",program:"BA Business Administration",grant:"Tuition Promise: 100% tuition всем студентам + need-гранты на жильё",req:"TOEFL 80/IELTS 6.5, дедлайн для иностранцев 30 ноя",sel:17},
    ],
    marketing:[
      {country:"США",name:"University of Southern California (Marshall)",program:"BS Business Administration (Marketing emphasis)",grant:"Trustee Scholarship (полный tuition) и Presidential (50%) открыты иностранцам",req:"TOEFL 100/IELTS 7, дедлайн 1 дек (для merit), SAT опц.",sel:21},
      {country:"США",name:"University of Alabama",program:"BS in Marketing",grant:"Автоматич. merit $6k–28k/год иностранцам; Presidential — полный tuition",req:"TOEFL 71/IELTS 6.0, rolling, приоритет ~5 дек, SAT для merit",sel:6},
      {country:"США",name:"Arizona State University (W. P. Carey)",program:"BS Marketing (Digital)",grant:"New American University merit-стипендии иностранцам (до ~$15.5k/год)",req:"TOEFL 61/IELTS 6.0, rolling-приём, SAT опц.",sel:5},
    ],
    cs:[
      {country:"США",name:"Massachusetts Institute of Technology",program:"BS Artificial Intelligence and Decision Making (Course 6-4)",grant:"Need-blind для иностранцев, покрывает 100% need — часто полная стоимость",req:"SAT ~1520+, TOEFL 90+/IELTS 7+, дедлайн ~6 янв (EA 1 ноя)",sel:25},
      {country:"США",name:"Minerva University",program:"BS Computational Sciences",grant:"Need-based aid всем иностранцам, ~80% получают гранты; tuition ~$24.5k",req:"SAT не нужен, англ. по заданиям, раунды ~ноя/янв/апр",sel:16},
      {country:"США",name:"Berea College",program:"BA Computer and Information Science",grant:"Tuition Promise: 100% tuition всем студентам + need-гранты на жильё",req:"TOEFL 80/IELTS 6.5, дедлайн для иностранцев 30 ноя",sel:17},
    ],
    medicine:[
      {country:"США",name:"Harvard University",program:"AB Human Developmental and Regenerative Biology (pre-med)",grant:"Need-blind для иностранцев, 100% need; семьи с доходом до $100k платят $0",req:"SAT обязателен (~1520+), дедлайн 1 янв (REA 1 ноя)",sel:25},
      {country:"США",name:"NYU Abu Dhabi",program:"BS Biology (pre-health track)",grant:"Need-blind приём, need-гранты вплоть до полной стоимости (~$90k/год)",req:"Тест-опционально, IELTS 7.0+, дедлайн 5 янв (ED 1 ноя)",sel:21},
      {country:"США",name:"Berea College",program:"BA Biology (pre-med track)",grant:"Tuition Promise: 100% tuition всем студентам + need-гранты на жильё",req:"TOEFL 80/IELTS 6.5, дедлайн для иностранцев 30 ноя",sel:17},
    ],
    engineering:[
      {country:"США",name:"Princeton University",program:"BSE Mechanical and Aerospace Engineering (robotics)",grant:"Need-blind для иностранцев, 100% need без кредитов (грантами)",req:"TOEFL 100+/IELTS 7.5, дедлайн 1 янв (REA 1 ноя)",sel:25},
      {country:"США",name:"Worcester Polytechnic Institute",program:"BS Robotics Engineering",grant:"Merit-стипендии иностранцам $5–25k/год + Robotics Scholars до $25k",req:"Test-blind (без SAT), TOEFL 90/IELTS 7.0, дедлайн ~1 фев",sel:13},
      {country:"США",name:"Michigan Technological University",program:"BS Mechatronics",grant:"International Ambassador Scholarship $11k–14.3k/год автоматически",req:"TOEFL 79/IELTS 6.5, rolling-приём, SAT опц.",sel:6},
    ],
    design:[
      {country:"США",name:"University of Southern California (Cinematic Arts)",program:"BFA Game Development and Interactive Design",grant:"Trustee Scholarship — полный tuition, доступна иностранцам",req:"TOEFL 100/IELTS 7, дедлайн 1 дек, нужно портфолио",sel:22},
      {country:"США",name:"Rochester Institute of Technology",program:"BS Game Design and Development",grant:"Автоматические merit-стипендии $14k–27k/год, включая иностранцев",req:"TOEFL 79/IELTS 6.5, дедлайн RD 15 янв, SAT опц.",sel:11},
      {country:"США",name:"Savannah College of Art and Design (SCAD)",program:"BFA Interactive Design and Game Development",grant:"Академические и портфолио merit-стипендии SCAD для иностранцев",req:"TOEFL 85/IELTS 6.5, rolling, SAT не обязателен",sel:6},
    ],
    education:[
      {country:"США",name:"Vanderbilt University (Peabody College)",program:"BS Human and Organizational Development",grant:"Need-aid иностранцам (100% need) + Cornelius Vanderbilt — полный tuition",req:"TOEFL 100/IELTS 7.5, SAT опц., дедлайн 1 янв (ED 1 ноя)",sel:23},
      {country:"США",name:"Berea College",program:"BA Education Studies",grant:"Tuition Promise: 100% tuition всем студентам + need-гранты на жильё",req:"TOEFL 80/IELTS 6.5, дедлайн для иностранцев 30 ноя",sel:17},
      {country:"США",name:"Minerva University",program:"BA Social Sciences",grant:"Need-based aid всем иностранцам, ~80% получают гранты; tuition ~$24.5k",req:"SAT не нужен, англ. по заданиям, раунды ~ноя/янв/апр",sel:16},
    ],
    science:[
      {country:"США",name:"Yale University",program:"BS Statistics and Data Science",grant:"Need-blind для иностранцев, 100% need; семьи до $75k платят $0",req:"SAT/ACT обязателен, TOEFL 100/IELTS 7.5, дедлайн 2 янв",sel:25},
      {country:"США",name:"NYU Abu Dhabi",program:"BS Physics",grant:"Need-blind приём, need-гранты вплоть до полной стоимости (~$90k/год)",req:"Тест-опционально, IELTS 7.0+, дедлайн 5 янв (ED 1 ноя)",sel:21},
      {country:"США",name:"Minerva University",program:"BS Natural Sciences",grant:"Need-based aid всем иностранцам, ~80% получают гранты; tuition ~$24.5k",req:"SAT не нужен, англ. по заданиям, раунды ~ноя/янв/апр",sel:16},
    ],
  },
  "Европа": {
    business:[
      {country:"Венгрия",name:"Corvinus University of Budapest",program:"Business Administration and Management BSc",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, англ. B2, тест по математике; SH до 15 янв",sel:14},
      {country:"Италия",name:"Bocconi University",program:"Bachelor in Economics, Management and Computer Science",grant:"Bocconi Scholarship (need-based) — полное покрытие платы за обучение",req:"SAT или тест Bocconi, IELTS 6.0+, ранняя подача с осени",sel:21},
      {country:"Нидерланды",name:"Erasmus University Rotterdam (RSM)",program:"BSc International Business Administration",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.5, сильная математика; селекция — до 15 янв",sel:17},
    ],
    marketing:[
      {country:"Венгрия",name:"Budapest Metropolitan University (METU)",program:"Commerce and Marketing BSc",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, англ. B2, собеседование; SH до 15 янв",sel:7},
      {country:"Польша",name:"Kozminski University",program:"Bachelor in Management and Artificial Intelligence",grant:"Merit-стипендии Kozminski (частичная скидка); плата ~25 000 PLN/год",req:"Аттестат, IELTS 6.0/B2, подача до лета 2026",sel:12},
      {country:"Нидерланды",name:"University of Amsterdam",program:"BSc Business Administration",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.0+, математика; дедлайн не-ЕС ~1 февр",sel:15},
    ],
    cs:[
      {country:"Нидерланды",name:"University of Groningen",program:"BSc Artificial Intelligence",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.0+, математика; numerus fixus — до 15 янв",sel:17},
      {country:"Венгрия",name:"Eötvös Loránd University (ELTE)",program:"Computer Science BSc",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, экзамен по математике, англ. B2; SH до 15 янв",sel:13},
      {country:"Германия",name:"Saarland University",program:"Computer Science (B.Sc.), English track",grant:"Бесплатное обучение (только взнос ~€390/сем) + Deutschlandstipendium €300/мес",req:"Аттестат КЗ + Studienkolleg/1 курс вуза, англ. B2; до 15 июля",sel:14},
    ],
    medicine:[
      {country:"Венгрия",name:"University of Debrecen",program:"General Medicine (MD)",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Экзамен биология/химия, англ. B2; SH до 15 янв",sel:18},
      {country:"Венгрия",name:"Semmelweis University",program:"Medicine (single-cycle MD)",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Экзамен биология/химия/англ.; SH до 15 янв",sel:21},
      {country:"Италия",name:"University of Pavia",program:"Medicine and Surgery (English)",grant:"EDiSU Pavia — стипендия + общежитие по доходу, плата снижается почти до 0",req:"Тест IMAT, англ. B2; регистрация на IMAT летом",sel:20},
    ],
    engineering:[
      {country:"Венгрия",name:"Óbuda University",program:"Mechatronical Engineering BSc",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, математика/физика, англ. B2; SH до 15 янв",sel:9},
      {country:"Нидерланды",name:"Eindhoven University of Technology (TU/e)",program:"Bachelor Automotive Technology",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.0+, математика и физика; дедлайн 1 мая",sel:15},
      {country:"Германия",name:"Hamburg University of Technology (TUHH)",program:"Engineering Science (B.Sc.), спец. Mechatronics",grant:"Бесплатное обучение (гос. вуз) + Deutschlandstipendium €300/мес",req:"Аттестат КЗ + Studienkolleg/1 курс вуза, англ. B2; до 15 июля",sel:13},
    ],
    design:[
      {country:"Венгрия",name:"Budapest Metropolitan University (METU)",program:"Animation BA",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Портфолио, англ. B2; SH до 15 янв",sel:10},
      {country:"Нидерланды",name:"Breda University of Applied Sciences (BUas)",program:"BSc Creative Media and Game Technologies",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.0, отбор (портфолио/задания); до 1 мая",sel:14},
      {country:"Финляндия",name:"Aalto University",program:"Digital Systems and Design, BSc (Science and Technology)",grant:"Aalto Excellence Scholarship — до 100% платы за обучение",req:"Аттестат, англ. (IELTS/SAT опц.); подача в янв 2027",sel:15},
    ],
    education:[
      {country:"Венгрия",name:"University of Debrecen",program:"Psychology BA",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, англ. B2, собеседование; SH до 15 янв",sel:12},
      {country:"Нидерланды",name:"University of Twente",program:"BSc Psychology",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.0; дедлайн для не-ЕС 1 мая",sel:13},
      {country:"Венгрия",name:"Eötvös Loránd University (ELTE)",program:"Psychology BA",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, англ. B2, вступит. собеседование; SH до 15 янв",sel:14},
    ],
    science:[
      {country:"Венгрия",name:"Eötvös Loránd University (ELTE)",program:"Mathematics BSc",grant:"Stipendium Hungaricum — полный: обучение + стипендия + общежитие",req:"Аттестат, экзамен по математике, англ. B2; SH до 15 янв",sel:14},
      {country:"Италия",name:"University of Bologna",program:"Genomics (BSc, English)",grant:"ER.GO (DSU) — стипендия + общежитие по доходу, освобождение от платы",req:"Тест TOLC-I EN, англ. B2; 60 мест, подача весной",sel:16},
      {country:"Нидерланды",name:"University of Amsterdam",program:"BSc Computational Social Science",grant:"Holland Scholarship — €5 000 (разово, 1-й год, для не-ЕС)",req:"IELTS 6.0+, математика; дедлайн не-ЕС ~1 февр",sel:15},
    ],
  },
  "Азия": {
    business:[
      {country:"Гонконг",name:"HKU (Университет Гонконга)",program:"Bachelor of Business Administration (Business Analytics)",grant:"Belt and Road Scholarship (для граждан РК) — полное обучение; + стипендии HKU",req:"IELTS 6.5, SAT ~1350+/A-level; дедлайн ~ноябрь-январь",sel:20},
      {country:"Южная Корея",name:"Sungkyunkwan University (SKKU)",program:"Bachelor in Global Business Administration (GBA)",grant:"GKS — полный: обучение + ~₩900 тыс./мес + перелёт + год корейского",req:"GPA 80%+, IELTS не обязателен; GKS ~сентябрь-октябрь",sel:15},
      {country:"Малайзия",name:"Sunway University",program:"Bachelor of Business Analytics (Honours)",grant:"Jeffrey Cheah Entrance Scholarship + Sunway International Scholarship — частично",req:"IELTS 5.5-6.0, аттестат; наборы январь/апрель/август",sel:8},
    ],
    marketing:[
      {country:"Гонконг",name:"HKU (Университет Гонконга)",program:"Bachelor of Science in Marketing Analytics and Technology",grant:"Belt and Road Scholarship — полное обучение; + entrance scholarships HKU",req:"IELTS 6.5, SAT ~1350+; дедлайн ~ноябрь-январь",sel:20},
      {country:"Южная Корея",name:"SolBridge (Woosong University)",program:"Bachelor of Business Administration (BBA)",grant:"SolBridge Admission Scholarship — 30-70% обучения, лучшим до 100%",req:"IELTS ~5.5+, эссе и интервью; наборы март и сентябрь",sel:7},
      {country:"Малайзия",name:"Asia Pacific University (APU)",program:"BA (Hons) in Marketing Management with a specialism in Digital Marketing",grant:"APU International Scholarships & Merit Awards — до 30% обучения",req:"IELTS 5.5, аттестат; приём несколько раз в год",sel:7},
    ],
    cs:[
      {country:"Южная Корея",name:"KAIST",program:"BS in Computer Science (School of Computing)",grant:"KAIST International Student Scholarship — обучение + ₩350 тыс./мес + страховка",req:"IELTS 6.5+, рекомендации; early ~23 окт, regular ~6 янв",sel:21},
      {country:"Сингапур",name:"NTU",program:"Bachelor of Computing (Hons) in Data Science and Artificial Intelligence",grant:"Nanyang Scholarship / Turing AI Scholars — обучение + стипендия + ноутбук",req:"IELTS 6.5+, SAT ~1400+; дедлайн ~середина января",sel:22},
      {country:"Гонконг",name:"CUHK",program:"BEng in Artificial Intelligence: Systems and Technologies",grant:"Belt and Road Scholarship + Admission Scholarships CUHK — до полного",req:"IELTS 6.0, SAT ~1330+; дедлайн ~начало января",sel:18},
    ],
    medicine:[
      {country:"Гонконг",name:"HKU (Университет Гонконга)",program:"Bachelor of Biomedical Sciences",grant:"Belt and Road Scholarship — полное обучение; + стипендии HKUMed",req:"IELTS 6.5, SAT + интервью; дедлайн ~ноябрь-январь",sel:21},
      {country:"Южная Корея",name:"Yonsei University (UIC)",program:"Bio-Convergence, BS (Underwood International College)",grant:"GKS — полный: обучение + стипендия + перелёт (Yonsei — вуз-партнёр)",req:"Высокий GPA, эссе; раунды UIC ~сентябрь-январь",sel:18},
      {country:"Малайзия",name:"Monash University Malaysia",program:"Bachelor of Medical Bioscience",grant:"Monash Malaysia Merit Scholarship — частичное покрытие обучения",req:"IELTS 6.5, сильный аттестат; наборы февраль/июль/октябрь",sel:10},
    ],
    engineering:[
      {country:"Южная Корея",name:"KAIST",program:"BS in Mechanical Engineering",grant:"KAIST International Student Scholarship — обучение + ₩350 тыс./мес",req:"IELTS 6.5+, сильные математика/физика; дедлайн ~октябрь",sel:21},
      {country:"Япония",name:"Nagoya University",program:"G30 Automotive Engineering Program (BEng)",grant:"MEXT — полный: обучение + ~¥117 тыс./мес + перелёт",req:"IELTS 6.0+, SAT/EJU; раунды ноябрь-декабрь и январь",sel:16},
      {country:"Гонконг",name:"CUHK",program:"BEng in Mechanical and Automation Engineering (поток Robotics)",grant:"Belt and Road Scholarship + Admission Scholarships CUHK — до полного",req:"IELTS 6.0, SAT ~1290+; дедлайн ~январь",sel:17},
    ],
    design:[
      {country:"Гонконг",name:"City University of Hong Kong",program:"Bachelor of Arts in Creative Media",grant:"Belt and Road Scholarship + CityU Entrance Scholarship — до полного обучения",req:"IELTS 6.5, желательно портфолио; дедлайн ~январь",sel:15},
      {country:"Китай",name:"NYU Shanghai",program:"Interactive Media Arts (BS)",grant:"Need-based грант NYU Shanghai (CSS Profile) — до полного покрытия",req:"Common App, эссе, IELTS ~7.0; дедлайн ~5 января",sel:18},
      {country:"Малайзия",name:"Asia Pacific University (APU)",program:"BSc (Hons) in Computer Games Development",grant:"APU International Scholarships & Merit Awards — до 30% обучения",req:"IELTS 5.5, математика в аттестате; приём круглый год",sel:7},
    ],
    education:[
      {country:"Гонконг",name:"Education University of Hong Kong (EdUHK)",program:"Bachelor of Education (Honours) (English Language) – Primary",grant:"Belt and Road Scholarship + entrance scholarships EdUHK; общежитие 2 года",req:"IELTS 6.0, интервью; заявки ~октябрь-январь",sel:10},
      {country:"Малайзия",name:"Taylor's University",program:"Bachelor of Education (Honours)",grant:"Стипендии Taylor's за успеваемость — частичное покрытие обучения",req:"IELTS 5.5-6.0, аттестат; наборы январь/март/август",sel:7},
      {country:"Япония",name:"Waseda University",program:"BA in International Liberal Studies (SILS)",grant:"Стипендии Waseda для иностранцев + MEXT Honors — частичное покрытие",req:"Эссе, IELTS ~6.5; AO-набор, дедлайн ~сентябрь-октябрь",sel:15},
    ],
    science:[
      {country:"Южная Корея",name:"KAIST",program:"BS in Physics",grant:"KAIST International Student Scholarship — обучение + ₩350 тыс./мес",req:"IELTS 6.5+, олимпиады — плюс; дедлайн ~октябрь (early)",sel:21},
      {country:"Япония",name:"Institute of Science Tokyo (Tokyo Tech)",program:"Global Scientists and Engineers Program (GSEP), BEng Transdisciplinary Science and Engineering",grant:"MEXT по рекомендации вуза (8 мест) — обучение + ¥120 тыс./мес",req:"IELTS/TOEFL, тесты по матем./физике; дедлайн ~декабрь-январь",sel:18},
      {country:"Сингапур",name:"NUS",program:"Bachelor of Science (Honours) in Data Science and Analytics",grant:"Science & Technology Undergraduate Scholarship — обучение + пособие, бонд 6 лет",req:"IELTS 6.5+, SAT ~1400+; дедлайн ~февраль-март",sel:23},
    ],
  },
  "Казахстан": {
    business:[
      {country:"Казахстан",name:"Nazarbayev University",program:"Bachelor of Business Administration (BBA), NU GSB",grant:"полный грант NU (NUFYP/прямое поступление)",req:"NUET от 120 / SAT, IELTS 6.5+; подача до весны",sel:19},
      {country:"Казахстан",name:"KIMEP University",program:"BSc in Business Administration",grant:"гос. грант по ЕНТ / стипендии и скидки KIMEP до 100%",req:"ЕНТ или внутр. тест KEPT, IELTS 5.5+ (или тест англ.)",sel:15},
      {country:"Казахстан",name:"AITU (Astana IT University)",program:"IT Management",grant:"гос. грант по ЕНТ / платно, гранты акимата",req:"ЕНТ, профиль математика; на грант ~90+",sel:13},
    ],
    marketing:[
      {country:"Казахстан",name:"KIMEP University",program:"BSc in Marketing",grant:"гос. грант по ЕНТ / скидки и стипендии KIMEP",req:"ЕНТ или KEPT, IELTS 5.5+; обучение на английском",sel:15},
      {country:"Казахстан",name:"AlmaU (Алматы Менеджмент Университет)",program:"Маркетинг (трек Digital Marketing)",grant:"гос. грант по ЕНТ / скидки AlmaU",req:"ЕНТ от 50 (платно), ~85+ на грант",sel:11},
      {country:"Казахстан",name:"Narxoz University",program:"Маркетинг",grant:"гос. грант по ЕНТ / скидки по баллам ЕНТ",req:"ЕНТ от 50; скидки при высоких баллах",sel:10},
    ],
    cs:[
      {country:"Казахстан",name:"Nazarbayev University",program:"BSc in Computer Science",grant:"полный грант NU (NUFYP/прямое поступление)",req:"NUET 120+ / SAT, IELTS 6.5+; математика",sel:20},
      {country:"Казахстан",name:"AITU (Astana IT University)",program:"Artificial Intelligence (6B061)",grant:"гос. грант по ЕНТ / платно",req:"ЕНТ: математика+информатика, на грант ~90+",sel:14},
      {country:"Казахстан",name:"KBTU",program:"Information Systems (Информационные системы)",grant:"гос. грант по ЕНТ / скидки KBTU",req:"ЕНТ 65+, профиль математика+информатика/физика",sel:14},
    ],
    medicine:[
      {country:"Казахстан",name:"Nazarbayev University",program:"Bachelor of Medical Sciences (NUSOM)",grant:"полный грант NU (NUFYP/прямое поступление)",req:"NUET 120+ (мин. 50/50), IELTS 6.0+",sel:20},
      {country:"Казахстан",name:"КазНМУ им. Асфендиярова",program:"Общая медицина (General Medicine)",grant:"гос. грант по ЕНТ (мед. направления)",req:"ЕНТ 70+ на грант; биология+химия",sel:13},
      {country:"Казахстан",name:"Медицинский университет Караганды",program:"Общая медицина (General Medicine)",grant:"гос. грант по ЕНТ",req:"ЕНТ от 70; биология+химия",sel:11},
    ],
    engineering:[
      {country:"Казахстан",name:"Nazarbayev University",program:"BEng in Robotics and Mechatronics",grant:"полный грант NU (NUFYP/прямое поступление)",req:"NUET 120+ / SAT, IELTS 6.5+; математика/физика",sel:19},
      {country:"Казахстан",name:"Satbayev University",program:"Нефтегазовое дело (Petroleum Engineering)",grant:"гос. грант по ЕНТ (много технических грантов)",req:"ЕНТ ~65+ на грант; математика+физика",sel:12},
      {country:"Казахстан",name:"KBTU",program:"Автоматизация и управление (Automation and Control)",grant:"гос. грант по ЕНТ / скидки KBTU",req:"ЕНТ 65+; математика+физика",sel:14},
    ],
    design:[
      {country:"Казахстан",name:"AITU (Astana IT University)",program:"Media Technologies (6B06105)",grant:"гос. грант по ЕНТ / платно",req:"ЕНТ + внутренний тест AET, на грант ~85+",sel:13},
      {country:"Казахстан",name:"МУИТ (IITU)",program:"Digital Journalism (6B03202)",grant:"гос. грант по ЕНТ / платно (~973 тыс. тг/год)",req:"ЕНТ + творческий экзамен (журналистика)",sel:12},
      {country:"Казахстан",name:"KazGASA (МОК)",program:"Graphic Design (6B02122)",grant:"гос. грант по ЕНТ (группа B031) / платно",req:"2 творческих экзамена: рисунок + черчение",sel:10},
    ],
    education:[
      {country:"Казахстан",name:"SDU University",program:"Two Foreign Languages (6B01702)",grant:"пед. гос. грант по ЕНТ / скидки SDU до 100%",req:"ЕНТ ~75+ на пед. грант; профиль иностр. язык",sel:12},
      {country:"Казахстан",name:"КазНПУ им. Абая",program:"Педагогика и психология (6B01101)",grant:"пед. гос. грант по ЕНТ",req:"ЕНТ ~70+ на грант",sel:8},
      {country:"Казахстан",name:"КазНУ им. аль-Фараби",program:"Психология (6B03107)",grant:"гос. грант по ЕНТ",req:"ЕНТ ~80+ на грант (биология+география)",sel:10},
    ],
    science:[
      {country:"Казахстан",name:"Nazarbayev University",program:"BSc in Biological Sciences",grant:"полный грант NU (NUFYP/прямое поступление)",req:"NUET 120+ / SAT, IELTS 6.5+",sel:19},
      {country:"Казахстан",name:"КазНУ им. аль-Фараби",program:"Химия (6B05301)",grant:"гос. грант по ЕНТ",req:"ЕНТ ~75+ на грант; профиль химия",sel:11},
      {country:"Казахстан",name:"ЕНУ им. Гумилёва",program:"Физика",grant:"гос. грант по ЕНТ",req:"ЕНТ ~70+ на грант; физика+математика",sel:9},
    ],
  },
};
/* «любая страна с грантом» — по каждой специальности лучший вариант с полным
   покрытием из Азии, Европы и США (иначе первый в списке региона) */
FALLBACK_UNIS["любая страна с грантом"] = Object.fromEntries(Object.keys(SPECS).map(k => {
  const pick = (geo) => FALLBACK_UNIS[geo][k].find(u => /полн|100%/i.test(u.grant)) || FALLBACK_UNIS[geo][k][0];
  return [k, [pick("Азия"), pick("Европа"), pick("США")]];
}));
