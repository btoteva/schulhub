export interface DictionaryWord {
  word: string;
  translation: string;
  example: string;
  example_translation: string;
}

export interface DictionarySection {
  id: string;
  headingId: string;
  title: string;
  words: DictionaryWord[];
}

export interface LessonSentence {
  text: string;
  translation: string;
}

export interface LessonContent {
  id: string;
  courseId: number;
  title: string;
  subtitle: string;
  dictionary: DictionarySection[];
  sentences?: LessonSentence[];
  content?: string;
}

export const lessonsData: LessonContent[] = [
  {
    id: "2-1",
    courseId: 2,
    title: "5.3 HERZTÄTIGKEIT. BLUTKREISLAUF",
    subtitle: "HERZ-KREISLAUF-SYSTEM. HERZTÄTIGKEIT. BLUTKREISLAUF",
    content: `Wie vollzieht sich der Herzzyklus und wie wird er geregelt?

Wie gelangt das Blut zu allen Zellen im Körper?

📘 Herztätigkeit.

Die Herztätigkeit erfolgt durch eine rhythmische Abfolge von Anspannung und Entspannung der Herzmuskelzellen.

Die Anspannung der Vorhöfe und der Kammern wird Systole und die Entspannung Diastole genannt.

Die Systole und die Diastole der Herzvorhöfe und der Herzkammern sind aufeinander abgestimmt und bilden den Herzzyklus (Abb. 1).

Im Ruhezustand durchläuft das Herz 70-75 Zyklen in der Minute.

Durch seine Tätigkeit wird der Blutdruck erzeugt, der den Fluss des Blutes in den Blutgefäßen sichert.

Grundfunktion des Herzens ist das Hineinpumpen des Blutes in die Blutgefäße.

Die Menge des aus den Herzkammern hinausgepumpten Blutes bei einer Systole ist ein Richtwert für seinen funktionalen Zustand und wird Schlagvolumen genannt.

Diese Menge hängt von den Bedingungen ab, in denen sich der Organismus befindet und von der Arbeit, die er verrichtet.

Bei schwerer körperlicher Arbeit erhöht sich dieses Volumen 4-5 Mal.

Die Herzkontraktionen kommen durch Impulse zustande, die in speziellen Herzmuskelzellen in der Wand des rechten Vorhofs entstehen.

Sie sind Teil des Erregungsleitungssystems des Herzens (Abb. 2).

Diese Zellen senden in regelmäßigen Zeitabständen Impulse an die Herzmuskulatur und bewirken dadurch ihre Kontraktion.

Die Eigenschaft des Myokards, unter Einwirkung von Impulsen, die im Herzen selbst entstehen, rhythmisch zu kontrahieren, wird als Automatismus bezeichnet.

Der Automatismus des Herzens sichert den ununterbrochenen Blutfluss zu allen Teilen des Körpers.

Die Frequenz der automatischen Impulse (der Herzrhythmus) verändert sich in Abhängigkeit von den Bedürfnissen des Organismus.

Bei physischer Belastung, bei emotionaler Aufregung oder erhöhter Körpertemperatur steigt die Frequenz des Herzrhythmus (bis 200 und mehr Systolen in der Minute).

💡 Der Blutkreislauf

Die ununterbrochene Bewegung des Blutes im Organismus, die vom Herzen und den Blutgefäßen gewährleistet wird, heißt Blutkreislauf.

Auf diese Weise versorgt das Blut nicht nur alle Zellen im Organismus mit den notwendigen Nährstoffen, Sauerstoff, Hormonen, sondern es führt auch die nicht notwendigen Abfallstoffe ab.

Bei seiner Bewegung im Organismus durchläuft das Blut einen komplizierten Weg - den großen und den kleinen Kreislauf (Abb. 3).

Der große Blutkreislauf umfasst den ganzen Körper er beginnt von der linken Herzkammer und der Aorta und endet mit den beiden Hohlvenen (oberen und unteren), die in den rechten Vorhof münden.

Der kleine Blutkreislauf ist mit dem Sauerstoff- und Kohlendioxyd-Austausch in der Lunge verbunden.

Er beginnt von der rechten Herzkammer und der Lungenarterie und endet mit den Lungenvenen, die in den linken Vorhof münden.

Die Nieren, das Gehirn und das Herz sind die mit Blut am besten versorgten Organe, weil sie eine große Menge Energie brauchen (bzw. O₂ und Nährstoffe), damit sie ihre Funktionen vollziehen.

Bei einem Menschen in Ruhezustand befindet sich etwa die Hälfte des Blutes in Blutdepots - in der Milz, Leber, Haut und Lunge.

Bei Bedarf schaltet sich dieses Blut in den Kreislauf ein.

Das Venenblut, das von den meisten Organen des Verdauungssystems kommt, fließt in die Leber (Abb. 3).

Dort wird das Blut von schädlichen Stoffen gereinigt, bevor es über die untere Hohlvene ins Herz hineinströmt.

📘 Der Blutdruck.

Der Druck, den das Blut auf die Wände der Blutgefäße ausübt, bezeichnet man als Blutdruck.

Er ist in der Aorta am höchsten und sinkt allmählich in den Arterien, Kapillaren und Venen, wo er am niedrigsten ist.

Das Blut fließt in den Blutgefäßen von Stellen mit höherem zu Stellen mit niedrigerem Druck.

Der Blutdruck hängt von der Tätigkeit des Herzens und vom Widerstand der Blutgefäße ab.

Der Widerstand der Blutgefäße (Arterien) verändert sich bei der An- und Entspannung ihrer Muskelschicht.

Je aktiver das Herz arbeitet und je enger die Arterien sind, desto höher ist der Blutdruck.

Der Druck in den großen Arterien verändert sich in Abhängigkeit von der Herztätigkeit, weshalb sie pulsieren.

Bei einem gesunden Menschen mittleren Alters im Ruhezustand ist der Blutdruck während der Systole am höchsten (120 mm Hg Quecksilbersäule) und während der Diastole am niedrigsten (80 mm Hg Quecksilbersäule).

Der Blutdruck erhöht sich bei physischer Belastung, starken Emotionen u.a.

Die aktiven Körperbewegungen fördern den Blutfluss in den Venen und die Bewegungslosigkeit verlangsamt ihn.

Die Venenklappen lassen die Bewegung des Blutes nur in eine Richtung zu - zum Herzen.

📘 Regelung des Blutkreislaufes.

Der Blutkreislauf wird je nach den Bedürfnissen des Organismus geregelt.

Durch Reflexe (neuronale Regelung) und durch Hormone (humorale Regelung) werden die Herztätigkeit und die Kontraktion der Muskel in der Arterienwand beeinflusst.

📘 Lymphkreislauf.

Die Lymphe entsteht, indem Gewebeflüssigkeit in die Lymphkapillaren fließt, die ein Filtrat des Blutplasmas ist.

Die Grundfunktion der Lymphe besteht darin, schädliche Stoffe, Infektionserreger u.a. von den Geweben zu beseitigen.

Von den Lymphkapillaren, mit denen alle Gewebe durchdrungen sind, fließt sie langsam in größere Lymphgefäße und von da in die Lymphknoten.

Dort werden krankheitserregende Mikroorganismen vernichtet, die in den Organismus eingedrungen sind.

Die Lymphe vom ganzen Körper mündet in die obere Hohlvene und so gelangt sie wieder in die Blutbahn zurück.`,
    sentences: [
      { text: "Wie vollzieht sich der Herzzyklus und wie wird er geregelt?", translation: "Как се осъществява сърдечният цикъл и как се регулира?" },
      { text: "Wie gelangt das Blut zu allen Zellen im Körper?", translation: "Как кръвта достига до всички клетки на тялото?" },
      { text: "Die Herztätigkeit erfolgt durch eine rhythmische Abfolge von Anspannung und Entspannung der Herzmuskelzellen.", translation: "Сърдечната дейност се осъществява чрез ритмична последователност на напрежение и разслабване на сърдечните мускулни клетки." },
      { text: "Die Anspannung der Vorhöfe und der Kammern wird Systole und die Entspannung Diastole genannt.", translation: "Напрежението на предсърдията и камерите се нарича систола, а разслабването - диастола." },
      { text: "Die Systole und die Diastole der Herzvorhöfe und der Herzkammern sind aufeinander abgestimmt und bilden den Herzzyklus.", translation: "Систолата и диастолата на сърдечните предсърдия и камери са съгласувани помежду си и образуват сърдечния цикъл." },
      { text: "Im Ruhezustand durchläuft das Herz 70-75 Zyklen in der Minute.", translation: "В покой сърцето преминава 70-75 цикъла в минута." },
      { text: "Durch seine Tätigkeit wird der Blutdruck erzeugt, der den Fluss des Blutes in den Blutgefäßen sichert.", translation: "Чрез своята дейност се генерира кръвното налягане, което осигурява потока на кръвта в кръвоносните съдове." },
      { text: "Grundfunktion des Herzens ist das Hineinpumpen des Blutes in die Blutgefäße.", translation: "Основната функция на сърцето е помпирането на кръвта в кръвоносните съдове." },
      { text: "Die Menge des aus den Herzkammern hinausgepumpten Blutes bei einer Systole ist ein Richtwert für seinen funktionalen Zustand und wird Schlagvolumen genannt.", translation: "Количеството на кръвта, която се изпомпва от сърдечните камери при систола, е показател за функционалното й състояние и се нарича удар обем." },
      { text: "Diese Menge hängt von den Bedingungen ab, in denen sich der Organismus befindet und von der Arbeit, die er verrichtet.", translation: "Това количество зависи от условията, в които се находи организмът и от работата, която той извършва." },
      { text: "Bei schwerer körperlicher Arbeit erhöht sich dieses Volumen 4-5 Mal.", translation: "При тежка физическа работа това количество се увеличава 4-5 пъти." },
      { text: "Die Herzkontraktionen kommen durch Impulse zustande, die in speziellen Herzmuskelzellen in der Wand des rechten Vorhofs entstehen.", translation: "Сърдечните свиване възникват чрез импулси, които се образуват в специални сърдечни мускулни клетки в стената на дясното предсърдие." },
      { text: "Sie sind Teil des Erregungsleitungssystems des Herzens.", translation: "Те са част от системата на провеждане на възбудимостта на сърцето." },
      { text: "Diese Zellen senden in regelmäßigen Zeitabständen Impulse an die Herzmuskulatur und bewirken dadurch ihre Kontraktion.", translation: "Тези клетки изпращат импулси на регулярни интервали към сърдечната мускулатура и причиняват нейното свиване." },
      { text: "Die Eigenschaft des Myokards, unter Einwirkung von Impulsen, die im Herzen selbst entstehen, rhythmisch zu kontrahieren, wird als Automatismus bezeichnet.", translation: "Свойството на миокарда да се съкращава ритмично под влияние на импулси, които възникват в самото сърце, се называ автоматизъм." },
      { text: "Der Automatismus des Herzens sichert den ununterbrochenen Blutfluss zu allen Teilen des Körpers.", translation: "Автоматизмът на сърцето осигурява безпрекъснат кръвоток до всички части на тялото." },
      { text: "Die Frequenz der automatischen Impulse (der Herzrhythmus) verändert sich in Abhängigkeit von den Bedürfnissen des Organismus.", translation: "Честотата на автоматичните импулси (сърдечният ритъм) се изменя в зависимост от потребностите на организма." },
      { text: "Bei physischer Belastung, bei emotionaler Aufregung oder erhöhter Körpertemperatur steigt die Frequenz des Herzrhythmus (bis 200 und mehr Systolen in der Minute).", translation: "При физическо натоварване, емоционално вълнение или повишена телесна температура честотата на сърдечния ритъм се повишава (до 200 и повече систола в минута)." },
      { text: "Die ununterbrochene Bewegung des Blutes im Organismus, die vom Herzen und den Blutgefäßen gewährleistet wird, heißt Blutkreislauf.", translation: "Безпрекъснатото движение на кръвта в организма, което се осигурява от сърцето и кръвоносните съдове, се називает кръвообращение." },
      { text: "Auf diese Weise versorgt das Blut nicht nur alle Zellen im Organismus mit den notwendigen Nährstoffen, Sauerstoff, Hormonen, sondern es führt auch die nicht notwendigen Abfallstoffe ab.", translation: "По този начин кръвта не само снабдява всички клетки в организма с необходимите хранителни вещества, кислород, хормони, но и отвежда ненужните отпадни вещества." },
      { text: "Bei seiner Bewegung im Organismus durchläuft das Blut einen komplizierten Weg - den großen und den kleinen Kreislauf.", translation: "При движението си в организма кръвта преминава сложен път - голям и малък кръвообращение." },
      { text: "Der große Blutkreislauf umfasst den ganzen Körper er beginnt von der linken Herzkammer und der Aorta und endet mit den beiden Hohlvenen (oberen und unteren), die in den rechten Vorhof münden.", translation: "Голямото кръвообращение обхваща цялото тяло, начина от лявата камера на сърцето и аортата и завършва с двете кухи вени (горни и долни), които се отварят в дясното предсърдие." },
      { text: "Der kleine Blutkreislauf ist mit dem Sauerstoff- und Kohlendioxyd-Austausch in der Lunge verbunden.", translation: "Малкото кръвообращение е свързано с обмена на кислород и въглероден двуокис в белите дробове." },
      { text: "Er beginnt von der rechten Herzkammer und der Lungenarterie und endet mit den Lungenvenen, die in den linken Vorhof münden.", translation: "Тя начина от дясната камера на сърцето и белодробната артерия и завършва с белодробните вени, които се отварят в лявото предсърдие." },
      { text: "Die Nieren, das Gehirn und das Herz sind die mit Blut am besten versorgten Organe, weil sie eine große Menge Energie brauchen (bzw. O₂ und Nährstoffe), damit sie ihre Funktionen vollziehen.", translation: "Бъбреците, мозъкът и сърцето са органите, които са най-добре снабдени с кръв, защото се нуждаят от голямо количество енергия (т.е. O₂ и хранителни вещества), за да изпълнят своите функции." },
      { text: "Bei einem Menschen in Ruhezustand befindet sich etwa die Hälfte des Blutes in Blutdepots - in der Milz, Leber, Haut und Lunge.", translation: "При човек в покой около половината от кръвта се намира в кръвни депа - в слезката, черния дроб, кожата и белите дробове." },
      { text: "Bei Bedarf schaltet sich dieses Blut in den Kreislauf ein.", translation: "При необходимост тази кръв се включва в кръвообращението." },
      { text: "Das Venenblut, das von den meisten Organen des Verdauungssystems kommt, fließt in die Leber.", translation: "Венозната кръв, която идва от повечето органи на храносмилателната система, тече в черния дроб." },
      { text: "Dort wird das Blut von schädlichen Stoffen gereinigt, bevor es über die untere Hohlvene ins Herz hineinströmt.", translation: "Там кръвта се пречиства от вредни вещества, преди да тече в сърцето през долната кухина вена." },
      { text: "Der Druck, den das Blut auf die Wände der Blutgefäße ausübt, bezeichnet man als Blutdruck.", translation: "Налягането, което кръвта упражнява на стените на кръвоносните съдове, се називает кръвно налягане." },
      { text: "Er ist in der Aorta am höchsten und sinkt allmählich in den Arterien, Kapillaren und Venen, wo er am niedrigsten ist.", translation: "То е най-високо в аортата и постепенно намалява в артериите, капилярите и венам, където е най-ниско." },
      { text: "Das Blut fließt in den Blutgefäßen von Stellen mit höherem zu Stellen mit niedrigerem Druck.", translation: "Кръвта тече в кръвоносните съдове от места с по-високо налягане към места с по-ниско налягане." },
      { text: "Der Blutdruck hängt von der Tätigkeit des Herzens und vom Widerstand der Blutgefäße ab.", translation: "Кръвното налягане зависи от дейност на сърцето и от съпротивлението на кръвоносните съдове." },
      { text: "Der Widerstand der Blutgefäße (Arterien) verändert sich bei der An- und Entspannung ihrer Muskelschicht.", translation: "Съпротивлението на кръвоносните съдове (артериите) се изменя при напрежението и разслабването на техния мускулен слой." },
      { text: "Je aktiver das Herz arbeitet und je enger die Arterien sind, desto höher ist der Blutdruck.", translation: "Колкото по-активно работи сърцето и колкото по-тесни са артериите, толкова по-високо е кръвното налягане." },
      { text: "Der Druck in den großen Arterien verändert sich in Abhängigkeit von der Herztätigkeit, weshalb sie pulsieren.", translation: "Налягането в големите артерии се изменя в зависимост от дейност на сърцето, поради което те пулсират." },
      { text: "Bei einem gesunden Menschen mittleren Alters im Ruhezustand ist der Blutdruck während der Systole am höchsten (120 mm Hg Quecksilbersäule) und während der Diastole am niedrigsten (80 mm Hg Quecksilbersäule).", translation: "При здрав човек средна възраст в покой кръвното налягане е най-високо при систолата (120 mm Hg живачна колона) и най-ниско при диастолата (80 mm Hg живачна колона)." },
      { text: "Der Blutdruck erhöht sich bei physischer Belastung, starken Emotionen u.a.", translation: "Кръвното налягане се повишава при физическо натоварване, силни емоции и т.н." },
      { text: "Die aktiven Körperbewegungen fördern den Blutfluss in den Venen und die Bewegungslosigkeit verlangsamt ihn.", translation: "Активните движения на тялото подпомагат кръвния поток в венам, а неподвижността го замедлява." },
      { text: "Die Venenklappen lassen die Bewegung des Blutes nur in eine Richtung zu - zum Herzen.", translation: "Венозните клапи позволяват движението на кръвта само в една посока - към сърцето." },
      { text: "Der Blutkreislauf wird je nach den Bedürfnissen des Organismus geregelt.", translation: "Кръвообращението се регулира според потребностите на организма." },
      { text: "Durch Reflexe (neuronale Regelung) und durch Hormone (humorale Regelung) werden die Herztätigkeit und die Kontraktion der Muskel in der Arterienwand beeinflusst.", translation: "Чрез рефлекси (невронна регулация) и чрез хормони (уморална регулация) се влияят сърдечната дейност и съкращението на мускулите в артериалната стена." },
      { text: "Die Lymphe entsteht, indem Gewebeflüssigkeit in die Lymphkapillaren fließt, die ein Filtrat des Blutplasmas ist.", translation: "Лимфата се образува, когато тъканната течност тече в лимфните капиляри, които са филтрат на кръвната плазма." },
      { text: "Die Grundfunktion der Lymphe besteht darin, schädliche Stoffe, Infektionserreger u.a. von den Geweben zu beseitigen.", translation: "Основната функция на лимфата е да отстрани вредни вещества, инфекциозни агенти и т.н. от тъканите." },
      { text: "Von den Lymphkapillaren, mit denen alle Gewebe durchdrungen sind, fließt sie langsam in größere Lymphgefäße und von da in die Lymphknoten.", translation: "От лимфните капиляри, през които преминават всички тъкани, тя течи бавно в по-големи лимфни съдове и оттам в лимфни възли." },
      { text: "Dort werden krankheitserregende Mikroorganismen vernichtet, die in den Organismus eingedrungen sind.", translation: "Там се унищожават патогенни микроорганизми, които са проникнали в организма." },
      { text: "Die Lymphe vom ganzen Körper mündet in die obere Hohlvene und so gelangt sie wieder in die Blutbahn zurück.", translation: "Лимфата от цялото тяло се влива в горната кухина вена и така се връща в кръвната циркулация." }
    ],
    dictionary: [
      {
        id: "nomen",
        headingId: "nomen-heading",
        title: "🟩 Съществителни (Nomen)",
        words: [
          { word: "die Pumpe, -n", translation: "помпа", example: "Das Herz erfüllt die Funktion einer 'Pumpe'...", example_translation: "Сърцето изпълнява функцията на 'помпа'..." },
          { word: "das Leben, -", translation: "живот", example: "...während des ganzen Lebens des Menschen...", example_translation: "...през целия живот на човека..." },
          { word: "der Mensch, -en", translation: "човек", example: "...des ganzen Lebens des Menschen...", example_translation: "...на целия живот на човека..." },
          { word: "das Herz-Kreislauf-System, -e", translation: "сърдечно-съдова система", example: "Das Herz-Kreislauf-System ist eine Verbindung von Organen...", example_translation: "Сърдечно-съдовата система е съвкупност от органи..." },
          { word: "das Organ, -e", translation: "орган", example: "...eine Verbindung von Organen...", example_translation: "...съвкупност от органи..." },
          { word: "der Fluss, Flüsse", translation: "поток", example: "...die den Fluss des Bluts gewährleisten.", example_translation: "...които осигуряват потока на кръв." },
          { word: "die Lymphe", translation: "лимфа", example: "...den Fluss des Bluts und der Lymphe...", example_translation: "...потока на кръв и лимфа..." },
          { word: "der Organismus, -men", translation: "организъм", example: "...im Organismus gewährleisten.", example_translation: "...осигуряват в организма." },
          { word: "das Blutgefäß, -e", translation: "кръвоносен съд", example: "...aus Blut- und Lymphgefäßen...", example_translation: "...от кръвоносни и лимфни съдове..." },
          { word: "die Arterie, -n", translation: "артерия", example: "Das Blutkreislaufsystem besteht aus Herz, Arterien...", example_translation: "Кръвоносната система се състои от сърце, артерии..." },
          { word: "die Kapillare, -n", translation: "капиляр", example: "...besteht aus Herz, Arterien, Kapillaren und Venen.", example_translation: "...състои се от сърце, артерии, капиляри и вени." },
          { word: "die Vene, -n", translation: "вена", example: "...besteht aus Herz, Arterien, Kapillaren und Venen.", example_translation: "...състои се от сърце, артерии, капиляри и вени." },
          { word: "das Herz, -en", translation: "сърце", example: "Das Herz ist ein muskuläres Hohlorgan...", example_translation: "Сърцето е мускулест кух орган..." },
          { word: "der Vorhof, Vorhöfe", translation: "предсърдие", example: "...zwei Vorhöfen und zwei Kammern.", example_translation: "...две предсърдия и две камери." },
          { word: "die Kammer, -n", translation: "камера (на сърцето)", example: "...zwei Vorhöfen und zwei Kammern.", example_translation: "...две предсърдия и две камери." },
          { word: "die Aorta", translation: "аорта", example: "...das größte Blutgefäß ab die Aorta.", example_translation: "...най-големият кръвоносен съд - аортата." }
        ]
      },
      {
        id: "verben",
        headingId: "verben-heading",
        title: "🟦 Глаголи (Verben)",
        words: [
          { word: "arbeiten", translation: "работя", example: "...die während des ganzen Lebens... arbeitet?", example_translation: "...която работи през целия живот...?" },
          { word: "aufhören", translation: "спирам, преставам", example: "...ohne aufzuhören arbeitet?", example_translation: "...работи без да спира?" },
          { word: "pumpen", translation: "помпам", example: "...die das Blut... hinein-pumpt...", example_translation: "...която изпомпва кръвта..." },
          { word: "fließen", translation: "тека", example: "Durch die linke Herzhälfte fließt Arterienblut...", example_translation: "През лявата половина на сърцето тече артериална кръв..." },
          { word: "verhindern", translation: "предотвратявам", example: "...und den Rückfluss zu den Kammern verhindern.", example_translation: "...и предотвратяват връщането в камерите." },
          { word: "erfolgen", translation: "осъществявам се, протичам", example: "Die Herztätigkeit erfolgt durch eine rhythmische Abfolge...", example_translation: "Сърдечната дейност се осъществява чрез ритмична последователност..." },
          { word: "erregen", translation: "възбуждам, раздразнявам", example: "...die Impulse, die im Herzen entstehen...", example_translation: "...импулсите, които възникват в сърцето..." },
          { word: "regeln", translation: "регулирам, управлявам", example: "Wie wird der Herzzyklus geregelt?", example_translation: "Как се регулира сърдечният цикъл?" },
          { word: "sichern", translation: "осигурявам", example: "...der den Fluss des Blutes sichert.", example_translation: "...който осигурява потока на кръвта." },
          { word: "erzeugen", translation: "произвеждам", example: "Durch seine Tätigkeit wird der Blutdruck erzeugt...", example_translation: "Чрез своята дейност се произвежда кръвното налягане..." },
          { word: "bilden", translation: "образувам, формирам", example: "...bilden den Herzzyklus.", example_translation: "...образуват сърдечния цикъл." }
        ]
      },
      {
        id: "adj",
        headingId: "adj-heading",
        title: "🟨 Прилагателни / наречия (Adjektive & Adverbien)",
        words: [
          { word: "muskulär", translation: "мускулен", example: "Das Herz ist ein muskuläres Hohlorgan...", example_translation: "Сърцето е мускулест кух орган..." },
          { word: "rhythmisch", translation: "ритмичен", example: "...das rhythmisch kontrahiert...", example_translation: "...който се съкращава ритмично..." },
          { word: "menschlich", translation: "човешки", example: "Das menschliche Herz besteht aus vier Teilen...", example_translation: "Човешкото сърце се състои от четири части..." },
          { word: "aufeinander", translation: "един с друг, взаимно", example: "Die Systole und Diastole sind aufeinander abgestimmt...", example_translation: "Систолата и диастолата са съгласувани помежду си..." },
          { word: "regelmäßig", translation: "редовен, правилен", example: "Diese Zellen senden in regelmäßigen Zeitabständen Impulse...", example_translation: "Тези клетки изпращат импулси на регулярни интервали..." },
          { word: "spezielle", translation: "специален", example: "...in speziellen Herzmuskelzellen...", example_translation: "...в специални сърдечни мускулни клетки..." },
          { word: "ununterbrochen", translation: "безпрекъсен", example: "...der ununterbrochenen Blutfluss...", example_translation: "...безпрекъснатия кръвоток..." },
          { word: "automatisch", translation: "автоматичен", example: "Die Frequenz der automatischen Impulse...", example_translation: "Честотата на автоматичните импулси..." }
        ]
      },
      {
        id: "nomen-additional",
        headingId: "nomen-additional-heading",
        title: "🟩 Допълнителни съществителни",
        words: [
          { word: "die Abfolge, -n", translation: "последователност", example: "Eine rhythmische Abfolge von Anspannung...", example_translation: "Ритмична последователност на напрежение..." },
          { word: "die Anspannung, -en", translation: "напрежение, свиване", example: "Die Anspannung der Vorhöfe...", example_translation: "Напрежението на предсърдията..." },
          { word: "die Entspannung, -en", translation: "разслабване", example: "...und Entspannung der Herzmuskelzellen.", example_translation: "...и разслабване на сърдечните мускулни клетки." },
          { word: "die Systole, -n", translation: "систола", example: "Die Anspannung wird Systole genannt.", example_translation: "Напрежението се нарича систола." },
          { word: "die Diastole, -n", translation: "диастола", example: "Die Entspannung Diastole genannt.", example_translation: "Разслабването се нарича диастола." },
          { word: "der Zyklus, -", translation: "цикъл", example: "...bilden den Herzzyklus.", example_translation: "...образуват сърдечния цикъл." },
          { word: "der Ruhezustand, -", translation: "покой", example: "Im Ruhezustand durchläuft das Herz 70-75 Zyklen...", example_translation: "В покой сърцето преминава 70-75 цикъла..." },
          { word: "die Minute, -n", translation: "минута", example: "...70-75 Zyklen in der Minute.", example_translation: "...70-75 цикъла в минута." },
          { word: "der Impuls, -e", translation: "импулс", example: "Die Herzkontraktionen kommen durch Impulse zustande...", example_translation: "Сърдечните свивания възникват чрез импулси..." },
          { word: "das Erregungsleitungssystem, -e", translation: "система на провеждане на възбудимостта", example: "Sie sind Teil des Erregungsleitungssystems...", example_translation: "Те са част от системата на провеждане на възбудимостта..." },
          { word: "die Herzmuskulatur, -", translation: "сърдечна мускулатура", example: "...Impulse an die Herzmuskulatur...", example_translation: "...импулси към сърдечната мускулатура..." },
          { word: "die Kontraktion, -en", translation: "свиване, съкращение", example: "...und bewirken dadurch ihre Kontraktion.", example_translation: "...и причиняват нейното свиване." },
          { word: "das Myokard, -", translation: "миокард", example: "Die Eigenschaft des Myokards...", example_translation: "Свойството на миокарда..." },
          { word: "der Automatismus, -", translation: "автоматизъм", example: "...wird als Automatismus bezeichnet.", example_translation: "...се нарича автоматизъм." },
          { word: "die Frequenz, -en", translation: "честота", example: "Die Frequenz der automatischen Impulse...", example_translation: "Честотата на автоматичните импулси..." },
          { word: "die Belastung, -en", translation: "натоварване, преживяване", example: "Bei physischer Belastung...", example_translation: "При физическо натоварване..." }
        ]
      }
    ]
  },
  // Биология - Урок 2 (ID в Lessons.tsx е 2)
  {
    id: "2-2",
    courseId: 2,
    title: "ТЪКАНИ И ОРГАНИ",
    subtitle: "Структура и функции на тъканите и органите",
    dictionary: [
      {
        id: "nomen",
        headingId: "nomen-heading",
        title: "🟩 Съществителни (Nomen)",
        words: [
          {
            word: "das Gewebe, -",
            translation: "тъкан",
            example: "Das Gewebe besteht aus ähnlichen Zellen.",
            example_translation: "Тъканта се състои от подобни клетки."
          },
          {
            word: "die Zelle, -n",
            translation: "клетка",
            example: "Die Zelle ist die kleinste Einheit des Lebens.",
            example_translation: "Клетката е най-малката единица на живота."
          },
          {
            word: "das Organ, -e",
            translation: "орган",
            example: "Ein Organ erfüllt eine bestimmte Funktion.",
            example_translation: "Органът изпълнява определена функция."
          }
        ]
      },
      {
        id: "verben",
        headingId: "verben-heading",
        title: "🟦 Глаголи (Verben)",
        words: [
          {
            word: "bestehen aus",
            translation: "състоя се от",
            example: "Der Körper besteht aus verschiedenen Geweben.",
            example_translation: "Тялото се състои от различни тъкани."
          },
          {
            word: "erfüllen",
            translation: "изпълнявам",
            example: "Organe erfüllen lebenswichtige Funktionen.",
            example_translation: "Органите изпълняват жизненоважни функции."
          }
        ]
      }
    ]
  },
  // Биология - Урок 3 (ID в Lessons.tsx е 3)
  {
    id: "2-3",
    courseId: 2,
    title: "ХРАНОСМИЛАТЕЛНА СИСТЕМА",
    subtitle: "Структура и функции на храносмилателния апарат",
    dictionary: [
      {
        id: "nomen",
        headingId: "nomen-heading",
        title: "🟩 Съществителни (Nomen)",
        words: [
          {
            word: "das Verdauungssystem, -e",
            translation: "храносмилателна система",
            example: "Das Verdauungssystem verarbeitet die Nahrung.",
            example_translation: "Храносмилателната система преработва храната."
          },
          {
            word: "der Magen, Mägen",
            translation: "стомах",
            example: "Der Magen produziert Magensäure.",
            example_translation: "Стомахът произвежда стомашна киселина."
          },
          {
            word: "der Darm, Därme",
            translation: "черво",
            example: "Der Darm nimmt Nährstoffe auf.",
            example_translation: "Червото поема хранителни вещества."
          }
        ]
      }
    ]
  }
];

export const getLessonById = (courseId: number, lessonId: string): LessonContent | undefined => {
  const lessonKey = `${courseId}-${lessonId}`;
  return lessonsData.find(lesson => lesson.id === lessonKey);
};
