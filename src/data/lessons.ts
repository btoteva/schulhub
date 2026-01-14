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

export interface LessonContent {
  id: string;
  courseId: number;
  title: string;
  subtitle: string;
  dictionary: DictionarySection[];
  content?: string; // German text content of the lesson
}

export const lessonsData: LessonContent[] = [
  // Биология - Урок 1 (ID в Lessons.tsx е 1)
  {
    id: "2-1",
    courseId: 2,
    title: "5.3 BLUTKREISLAUF",
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
          { word: "verhindern", translation: "предотвратявам", example: "...und den Rückfluss zu den Kammern verhindern.", example_translation: "...и предотвратяват връщането в камерите." }
        ]
      },
      {
        id: "adj",
        headingId: "adj-heading",
        title: "🟨 Прилагателни / наречия (Adjektive & Adverbien)",
        words: [
          { word: "muskulär", translation: "мускулен", example: "Das Herz ist ein muskuläres Hohlorgan...", example_translation: "Сърцето е мускулест кух орган..." },
          { word: "rhythmisch", translation: "ритмичен", example: "...das rhythmisch kontrahiert...", example_translation: "...който се съкращава ритмично..." },
          { word: "menschlich", translation: "човешки", example: "Das menschliche Herz besteht aus vier Teilen...", example_translation: "Човешкото сърце се състои от четири части..." }
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
