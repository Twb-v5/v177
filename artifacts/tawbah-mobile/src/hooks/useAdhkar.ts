import { useState, useCallback } from "react";

export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  category: "morning" | "evening" | "sleep" | "general";
}

const MORNING_ADHKAR: Dhikr[] = [
  {
    id: "m1",
    arabic: "Allahumma bika ahbarna, wa bika amsaktu, wa bika ahya wa bika amoot, wa ilayka al-nushur",
    transliteration: "Allahumma bika ahbarna, wa bika amsaktu, wa bika ahya wa bika amoot, wa ilayka al-nushur",
    translation: "O Allah, by You we have lived, by You we die, and to You is the return",
    count: 1,
    category: "morning",
  },
  {
    id: "m2",
    arabic: "Hasbiyallaahu la ilaaha illa huwa, alayhi tawakkaltu wa huwa rabbul-arshil-adheem",
    transliteration: "Hasbiyallaahu la ilaaha illa huwa, alayhi tawakkaltu wa huwa rabbul-arshil-adheem",
    translation: "Sufficient for me is Allah; there is no deity except Him. Upon Him I rely and He is the Lord of the Great Throne",
    count: 1,
    category: "morning",
  },
  {
    id: "m3",
    arabic: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwa as-sami'ul-'aleem",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwa as-sami'ul-'aleem",
    translation: "In the Name of Allah who cannot harm with His Name anything in the earth or in the heaven, and He is the Hearing, the Knowing",
    count: 1,
    category: "morning",
  },
  {
    id: "m4",
    arabic: "SubhanAllah wa bi-hamdihi, subhanAllahil-adheem",
    transliteration: "SubhanAllah wa bi-hamdihi, subhanAllahil-adheem",
    translation: "Glory and praise be to Allah, the Great",
    count: 100,
    category: "morning",
  },
  {
    id: "m5",
    arabic: "La ilaaha illa Allah wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    transliteration: "La ilaaha illa Allah wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is over all things capable",
    count: 100,
    category: "morning",
  },
];

const EVENING_ADHKAR: Dhikr[] = [
  {
    id: "e1",
    arabic: "A'oodhu bi kalimatil-laahi at-taammati min sharri ma khalaq",
    transliteration: "A'oodhu bi kalimatil-laahi at-taammati min sharri ma khalaq",
    translation: "I seek refuge in the perfect Words of Allah from the evil of what He has created",
    count: 3,
    category: "evening",
  },
  {
    id: "e2",
    arabic: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwa as-sami'ul-'aleem",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwa as-sami'ul-'aleem",
    translation: "In the Name of Allah who cannot harm with His Name anything in the earth or in the heaven",
    count: 1,
    category: "evening",
  },
  {
    id: "e3",
    arabic: "Allahumma inni as'aluka min khayrika wa a'oodhu bika min sharrika",
    transliteration: "Allahumma inni as'aluka min khayrika wa a'oodhu bika min sharrika",
    translation: "O Allah, I ask You for Your good and seek refuge in You from Your evil",
    count: 3,
    category: "evening",
  },
  {
    id: "e4",
    arabic: "SubhanAllah wa bi-hamdihi, subhanAllahil-adheem",
    transliteration: "SubhanAllah wa bi-hamdihi, subhanAllahil-adheem",
    translation: "Glory and praise be to Allah, the Great",
    count: 100,
    category: "evening",
  },
];

const SLEEP_ADHKAR: Dhikr[] = [
  {
    id: "s1",
    arabic: "Bismika Allahumma amootu wa ahya",
    transliteration: "Bismika Allahumma amootu wa ahya",
    translation: "In Your Name, O Allah, I die and I live",
    count: 1,
    category: "sleep",
  },
  {
    id: "s2",
    arabic: "Allahumma qini 'adhabaka yawma tab'ath 'ibadaka",
    transliteration: "Allahumma qini 'adhabaka yawma tab'ath 'ibadaka",
    translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants",
    count: 1,
    category: "sleep",
  },
  {
    id: "s3",
    arabic: "SubhanAllah al-ladhi bi-yadihi mulkul-mulk wa huwa 'ala kulli shay'in qadeer",
    transliteration: "SubhanAllah al-ladhi bi-yadihi mulkul-mulk wa huwa 'ala kulli shay'in qadeer",
    translation: "Glory be to Him in whose hand is the dominion of all things, and He is over all things capable",
    count: 1,
    category: "sleep",
  },
  {
    id: "s4",
    arabic: "La ilaaha illa Allah wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    transliteration: "La ilaaha illa Allah wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "There is no god but Allah alone, without partner",
    count: 3,
    category: "sleep",
  },
];

const GENERAL_ADHKAR: Dhikr[] = [
  {
    id: "g1",
    arabic: "SubhanAllah",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    count: 33,
    category: "general",
  },
  {
    id: "g2",
    arabic: "Alhamdu lillah",
    transliteration: "Alhamdu lillah",
    translation: "Praise be to Allah",
    count: 33,
    category: "general",
  },
  {
    id: "g3",
    arabic: "Allahu Akbar",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    count: 34,
    category: "general",
  },
  {
    id: "g4",
    arabic: "La ilaaha illa Allah",
    transliteration: "La ilaaha illa Allah",
    translation: "There is no god but Allah",
    count: 100,
    category: "general",
  },
  {
    id: "g5",
    arabic: "Astaghfirullah",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    count: 100,
    category: "general",
  },
];

export function useAdhkar() {
  const [selectedCategory, setSelectedCategory] = useState<"morning" | "evening" | "sleep" | "general">("general");
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState(0);
  const [counter, setCounter] = useState(0);
  const [completedDhikrIds, setCompletedDhikrIds] = useState<Set<string>>(new Set());

  const getAdhkarByCategory = useCallback((category: string) => {
    switch (category) {
      case "morning":
        return MORNING_ADHKAR;
      case "evening":
        return EVENING_ADHKAR;
      case "sleep":
        return SLEEP_ADHKAR;
      default:
        return GENERAL_ADHKAR;
    }
  }, []);

  const currentDhikr = getAdhkarByCategory(selectedCategory)[currentDhikrIndex];

  const incrementCounter = useCallback(() => {
    if (!currentDhikr) return;
    if (counter >= currentDhikr.count) return;

    const next = counter + 1;
    setCounter(next);

    if (next >= currentDhikr.count) {
      setCompletedDhikrIds((prev) => new Set(prev).add(currentDhikr.id));
    }
  }, [currentDhikr, counter]);

  const resetCounter = useCallback(() => {
    setCounter(0);
  }, []);

  const selectCategory = useCallback((category: "morning" | "evening" | "sleep" | "general") => {
    setSelectedCategory(category);
    setCurrentDhikrIndex(0);
    setCounter(0);
  }, []);

  const selectDhikr = useCallback((index: number) => {
    setCurrentDhikrIndex(index);
    setCounter(0);
  }, []);

  const nextDhikr = useCallback(() => {
    const adhkar = getAdhkarByCategory(selectedCategory);
    if (currentDhikrIndex < adhkar.length - 1) {
      setCurrentDhikrIndex((prev) => prev + 1);
      setCounter(0);
    }
  }, [currentDhikrIndex, selectedCategory, getAdhkarByCategory]);

  const previousDhikr = useCallback(() => {
    if (currentDhikrIndex > 0) {
      setCurrentDhikrIndex((prev) => prev - 1);
      setCounter(0);
    }
  }, [currentDhikrIndex]);

  const markAsCompleted = useCallback(() => {
    if (currentDhikr) {
      setCompletedDhikrIds((prev) => new Set(prev).add(currentDhikr.id));
    }
  }, [currentDhikr]);

  const isCompleted = currentDhikr ? completedDhikrIds.has(currentDhikr.id) : false;
  const progress = currentDhikr ? (counter / currentDhikr.count) * 100 : 0;

  return {
    adhkar: getAdhkarByCategory(selectedCategory),
    currentDhikr,
    selectedCategory,
    counter,
    progress,
    isCompleted,
    selectCategory,
    selectDhikr,
    incrementCounter,
    resetCounter,
    nextDhikr,
    previousDhikr,
    markAsCompleted,
  };
}
