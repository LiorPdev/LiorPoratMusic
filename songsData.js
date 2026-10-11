// Central Songs Database for Lior Porat Music & Shows
(function (root) {
  'use strict';

  const SONGS = [
    { name: "אי אפשר", genre: "רוק", bpm: 89 },
    { name: "אין כבר דרך חזרה", genre: "רוק", bpm: 92 },
    { name: "אני בוחר", genre: "גרוב", bpm: 123, inShow: true },
    { name: "אסיר 1376", genre: "שקט", bpm: 123, inShow: true },
    { name: "בארץ דמיונית", genre: "שקט", bpm: 81 },
    { name: "בוקר טוב לך שמש", genre: "רוק", bpm: 103 },
    { name: "בלוז לחילוני", genre: "בלוז", bpm: 115, inShow: true },
    { name: "בלוז לנפטר", genre: "בלוז", bpm: 89, inShow: true },
    { name: "בלוז לשבת", genre: "בלוז", bpm: 70, inShow: true },
    { name: "בלוז לשירלי", genre: "בלוז", bpm: 56, inShow: true },
    { name: "במקום שבו נולדתי", genre: "בלוז", bpm: 52 },
    { name: "בפינת החדר", genre: "שקט", bpm: 85 },
    { name: "בשורה תחתונה (קלישאות)", showName: "קלישאות", file: "בשורה תחתונה (קלישאות)", genre: "גרוב", bpm: 136, inShow: true },
    { name: "גרשון רוזנצוויג", genre: "גרוב", bpm: 100, inShow: true },
    { name: "דמייני שאת בסרט", genre: "גרוב", bpm: 98, inShow: true },
    { name: "הביתה לחזור", genre: "גרוב", bpm: 96 },
    { name: "הדברים הפשוטים שבחיים", genre: "שקט", bpm: 156, inShow: true },
    { name: "הוא ידע", genre: "בלוז", bpm: 127 },
    { name: "היא זרה לי", genre: "שקט", bpm: 73 },
    { name: "היא לא מוצאת", genre: "בלוז", bpm: 76, inShow: true },
    { name: "הים נחצה לשניים", genre: "רוק", bpm: 92, inShow: true },
    { name: "הכל מושלם", genre: "רוק", bpm: 82 },
    { name: "המוזרה הזאת", genre: "שקט", bpm: 190 },
    { name: "הצעירות הללו", genre: "רוק", bpm: 85 },
    { name: "הרשימה", genre: "שקט", bpm: 144, inShow: true },
    { name: "טלי שוב ממתינה", genre: "גרוב", bpm: 999 },
    { name: "כל כך לחוץ", genre: "בלוז", bpm: 165, inShow: true },
    { name: "כמו שני מגדלים", genre: "שקט", bpm: 130 },
    { name: "לאון השען", genre: "בלוז", bpm: 71, inShow: true },
    { name: "להיות ישראלי", genre: "רוק", bpm: 96, inShow: true },
    { name: "לו ראית אותי הערב", genre: "רוק", bpm: 115 },
    { name: "מדריך געגוע", genre: "שקט", bpm: 68, inShow: true },
    { name: "מה נשמע הבוקר", genre: "בלוז", bpm: 129 },
    { name: "מה עוד צריך לקרות", genre: "רוק", bpm: 75, inShow: true },
    { name: "מחשבות", genre: "שקט", bpm: 75 },
    { name: "נוסע", genre: "רוק", bpm: 62 },
    { name: "נחתכתי בגילוח", genre: "גרוב", bpm: 98 },
    { name: "ניפגש שוב בקרוב", genre: "גרוב", bpm: 191, inShow: true },
    { name: "נמאס לי", genre: "בלוז", bpm: 167, inShow: true },
    { name: "עשרים דקות לתשע", genre: "בלוז", bpm: 70 },
    { name: "צוף לעמק האסור", genre: "רוק", bpm: 88, inShow: true },
    { name: "קונספירציה", genre: "בלוז", bpm: 75, inShow: true },
    { name: "קיץ משוגע", genre: "בלוז", bpm: 80 },
    { name: "שלושים שנה וחלום", genre: "בלוז", bpm: 74, inShow: true },
    { name: "שתיים כוסות של תה אדום", genre: "רוק", bpm: 162, inShow: true },
    { name: "תופסים ראש קטן", genre: "רוק", bpm: 96, inShow: true },
    { name: "תל אביבי", genre: "רוק", bpm: 144, inShow: true },
    { name: "תנו לי שקט", genre: "שקט", bpm: 87 },
    { name: "תנסו להשתחרר", genre: "רוק", bpm: 129, inShow: true },
    { name: "תקוע באדום", genre: "שקט", bpm: 64, inShow: true },
    { name: "תקשיב אחי", genre: "שקט", bpm: 148 },

    // שירי קאבר למופע (לא נכתבו ע"י ליאור)
    { name: "בדד", inShow: true, isCover: true },
    { name: "לוח וגיר", inShow: true, isCover: true },
    { name: "ערב אבוד", inShow: true, isCover: true },
    { name: "צל עץ תמר", inShow: true, isCover: true },
    { name: "שלל שרב", inShow: true, isCover: true }
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
        file: s.file || s.name,
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
        file: s.file || s.name,
        genre: s.genre,
        bpm: s.bpm,
        inShow: Boolean(s.inShow)
      }))
      .sort((a, b) => compareHebrew(a.name, b.name));
  }

  root.ALL_SONGS = SONGS;
  root.getShowSongs = getShowSongs;
  root.getOriginalSongs = getOriginalSongs;

})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this));
