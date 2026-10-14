// Central Songs Database for Lior Porat Music & Shows
(function (root) {
  'use strict';

  const SONGS = [
    { name: "אי אפשר", slug: "impossible", genre: "רוק", bpm: 89 },
    { name: "אין כבר דרך חזרה", slug: "no-turning-back", genre: "רוק", bpm: 92 },
    { name: "אני בוחר", slug: "choose", genre: "גרוב", bpm: 123, inShow: true },
    { name: "אסיר 1376", slug: "1376", genre: "שקט", bpm: 123, inShow: true },
    { name: "בארץ דמיונית", slug: "land", genre: "שקט", bpm: 81 },
    { name: "בוקר טוב לך שמש", slug: "sun", genre: "רוק", bpm: 103 },
    { name: "בלוז לחילוני", slug: "secular", genre: "בלוז", bpm: 115, inShow: true },
    { name: "בלוז לנפטר", slug: "deceased", genre: "בלוז", bpm: 89, inShow: true },
    { name: "בלוז לשבת", slug: "shabbat", genre: "בלוז", bpm: 70, inShow: true },
    { name: "בלוז לשירלי", slug: "shirley", genre: "בלוז", bpm: 56, inShow: true },
    { name: "במקום שבו נולדתי", slug: "born", genre: "בלוז", bpm: 52 },
    { name: "בפינת החדר", slug: "room", genre: "שקט", bpm: 85 },
    { name: "בשורה תחתונה (קלישאות)", showName: "קלישאות", slug: "cliches", genre: "גרוב", bpm: 136, inShow: true },
    { name: "גרשון רוזנצוויג", slug: "gershon", genre: "גרוב", bpm: 100, inShow: true },
    { name: "דמייני שאת בסרט", slug: "imagine", genre: "גרוב", bpm: 98, inShow: true },
    { name: "הביתה לחזור", slug: "home", genre: "גרוב", bpm: 96 },
    { name: "הדברים הפשוטים שבחיים", slug: "simple", genre: "שקט", bpm: 156, inShow: true },
    { name: "הוא ידע", slug: "he", genre: "בלוז", bpm: 127 },
    { name: "היא זרה לי", slug: "stranger", genre: "שקט", bpm: 73 },
    { name: "היא לא מוצאת", slug: "find", genre: "בלוז", bpm: 76, inShow: true },
    { name: "הים נחצה לשניים", slug: "sea", genre: "רוק", bpm: 92, inShow: true },
    { name: "הכל מושלם", slug: "perfect", genre: "רוק", bpm: 82 },
    { name: "המוזרה הזאת", slug: "girl", genre: "שקט", bpm: 190 },
    { name: "הצעירות הללו", slug: "girls", genre: "רוק", bpm: 85 },
    { name: "הרשימה", slug: "list", genre: "שקט", bpm: 144, inShow: true },
    { name: "טלי שוב ממתינה", slug: "tali", genre: "גרוב", bpm: 999 },
    { name: "כל כך לחוץ", slug: "stressed", genre: "בלוז", bpm: 165, inShow: true },
    { name: "כמו שני מגדלים", slug: "towers", genre: "שקט", bpm: 130 },
    { name: "לאון השען", slug: "leon", genre: "בלוז", bpm: 71, inShow: true },
    { name: "להיות ישראלי", slug: "israeli", genre: "רוק", bpm: 96, inShow: true },
    { name: "לו ראית אותי הערב", slug: "saw-me", genre: "רוק", bpm: 115 },
    { name: "מדריך געגוע", slug: "guide", genre: "שקט", bpm: 68, inShow: true },
    { name: "מה נשמע הבוקר", slug: "morning", genre: "בלוז", bpm: 129 },
    { name: "מה עוד צריך לקרות", slug: "what-else", genre: "רוק", bpm: 75, inShow: true },
    { name: "מחשבות", slug: "thoughts", genre: "שקט", bpm: 75 },
    { name: "נוסע", slug: "traveler", genre: "רוק", bpm: 62 },
    { name: "נחתכתי בגילוח", slug: "shaving", genre: "גרוב", bpm: 98 },
    { name: "ניפגש שוב בקרוב", slug: "see-you", genre: "גרוב", bpm: 191, inShow: true },
    { name: "נמאס לי", slug: "fed-up", genre: "בלוז", bpm: 167, inShow: true },
    { name: "עשרים דקות לתשע", slug: "20-9", genre: "בלוז", bpm: 70 },
    { name: "צוף לעמק האסור", slug: "valley", genre: "רוק", bpm: 88, inShow: true },
    { name: "קונספירציה", slug: "conspiracy", genre: "בלוז", bpm: 75, inShow: true },
    { name: "קיץ משוגע", slug: "summer", genre: "בלוז", bpm: 80 },
    { name: "שלושים שנה וחלום", slug: "30years", genre: "בלוז", bpm: 74, inShow: true },
    { name: "שתיים כוסות של תה אדום", slug: "2cups", genre: "רוק", bpm: 162, inShow: true },
    { name: "תופסים ראש קטן", slug: "rosh", genre: "רוק", bpm: 96, inShow: true },
    { name: "תל אביבי", slug: "tel-avivi", genre: "רוק", bpm: 144, inShow: true },
    { name: "תנו לי שקט", slug: "quiet", genre: "שקט", bpm: 87 },
    { name: "תנסו להשתחרר", slug: "let-go", genre: "רוק", bpm: 129, inShow: true },
    { name: "תקוע באדום", slug: "red", genre: "שקט", bpm: 64, inShow: true },
    { name: "תקשיב אחי", slug: "brother", genre: "שקט", bpm: 148 },

    // שירי קאבר למופע (לא נכתבו ע"י ליאור)
    { name: "בדד", slug: "boded", inShow: true, isCover: true },
    { name: "לוח וגיר", slug: "board", inShow: true, isCover: true },
    { name: "ערב אבוד", slug: "evening", inShow: true, isCover: true },
    { name: "צל עץ תמר", slug: "tree", inShow: true, isCover: true },
    { name: "שלל שרב", slug: "sharav", inShow: true, isCover: true }
  ];

  const hebrewCollator = typeof Intl !== 'undefined' && Intl.Collator
    ? new Intl.Collator('he', { sensitivity: 'base', numeric: true })
    : null;

  function compareHebrew(a, b) {
    if (hebrewCollator) return hebrewCollator.compare(a, b);
    return a.localeCompare(b, 'he');
  }

  function getShowSongs() {
    return SONGS
      .filter(s => Boolean(s.inShow))
      .map(s => ({
        name: s.showName || s.name,
        file: s.slug,
        slug: s.slug,
        isCover: Boolean(s.isCover),
        genre: s.genre,
        bpm: s.bpm
      }))
      .sort((a, b) => compareHebrew(a.name, b.name));
  }

  function getOriginalSongs() {
    return SONGS
      .filter(s => !s.isCover)
      .map(s => ({
        name: s.name,
        file: s.slug,
        slug: s.slug,
        genre: s.genre,
        bpm: s.bpm,
        inShow: Boolean(s.inShow)
      }))
      .sort((a, b) => compareHebrew(a.name, b.name));
  }

  function getSongBySlug(slug) {
    if (!slug) return null;
    const clean = String(slug).toLowerCase().trim();
    return SONGS.find(s => (s.slug && s.slug.toLowerCase() === clean) || (s.name === slug)) || null;
  }

  function getSongByName(name) {
    if (!name) return null;
    return SONGS.find(s => s.name === name || s.showName === name || s.slug === name) || null;
  }

  root.ALL_SONGS = SONGS;
  root.getShowSongs = getShowSongs;
  root.getOriginalSongs = getOriginalSongs;
  root.getSongBySlug = getSongBySlug;
  root.getSongByName = getSongByName;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ALL_SONGS: SONGS,
      getShowSongs: getShowSongs,
      getOriginalSongs: getOriginalSongs,
      getSongBySlug: getSongBySlug,
      getSongByName: getSongByName
    };
  }

})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)));
