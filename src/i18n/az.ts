/**
 * Azerbaijani — default locale and source of truth for the key set.
 * en.ts / ru.ts are typed against `TranslationKey`, so a missing key is a
 * compile error. (FAQ content itself is Azerbaijani-only, from the backend;
 * only the UI chrome is localized.)
 */
export const az = {
  // App / brand
  "app.name": "BDU Abituriyent",
  "app.full": "BDU Abituriyent Köməkçisi",
  "app.tagline": "Qəbul üzrə sual-cavab",
  "app.disclaimer": "Cavablar universitetin məlumat bazasından götürülür.",

  // Sidebar
  "sidebar.new": "Yeni söhbət",
  "sidebar.sections": "Bölmələr",
  "sidebar.collapse": "Paneli yığcamlaşdır",
  "sidebar.expand": "Paneli genişləndir",
  "sidebar.open": "Paneli aç",
  "sidebar.close": "Paneli bağla",

  // Top bar
  "topbar.title": "Abituriyent Köməkçisi",
  "topbar.restart": "Söhbəti yenilə",

  // Composer
  "composer.placeholder": "Sualınızı yazın…",
  "composer.send": "Göndər",
  "composer.hint": "Enter — göndər · Shift+Enter — yeni sətir",

  // Chat
  "chat.you": "Siz",
  "chat.assistant": "BDU Abituriyent",
  "chat.loading": "Cavab hazırlanır…",
  "chat.scrollToBottom": "Aşağı keç",
  "chat.error": "Bağlantı xətası baş verdi.",
  "chat.retry": "Yenidən cəhd et",
  "chat.copy": "Kopyala",
  "chat.copied": "Kopyalandı",

  // Menu navigation
  "nav.home": "Əsas menyu",
  "nav.back": "Geri",
  "nav.prev": "Əvvəlki",
  "nav.next": "Növbəti",
  "nav.page": "{page} / {total}",

  // Common
  "common.cancel": "Ləğv et",
  "common.save": "Yadda saxla",
  "common.close": "Bağla",
  "common.settings": "Tənzimləmələr",
  "common.help": "Kömək",
  "common.signOut": "Çıxış",
  "common.language": "Dil",
  "common.theme": "Görünüş",

  // Settings
  "settings.title": "Tənzimləmələr",
  "settings.tab.general": "Ümumi",
  "settings.tab.chat": "Söhbət",
  "settings.tab.about": "Haqqında",
  "settings.theme": "Görünüş",
  "settings.theme.light": "İşıqlı",
  "settings.theme.dark": "Qaranlıq",
  "settings.theme.system": "Sistem",
  "settings.language": "Dil",
  "settings.fontSize": "Şrift ölçüsü",
  "settings.fontSize.small": "Kiçik",
  "settings.fontSize.medium": "Orta",
  "settings.fontSize.large": "Böyük",
  "settings.sendOnEnter": "Enter ilə göndərmə",
  "settings.sendOnEnter.desc":
    "Aktiv olduqda Enter mesajı göndərir, Shift+Enter yeni sətir əlavə edir.",
  "settings.about.description":
    "BDU Abituriyent Köməkçisi — Bakı Dövlət Universitetinə qəbul, sənədlər, təqaüd və digər mövzular üzrə tez-tez verilən sualların cavablarını təqdim edir. Cavablar rəsmi məlumat bazasından götürülür; süni intellekt istifadə olunmur.",
  "settings.about.version": "Versiya",

  // User (demo persona)
  "user.name": "Abituriyent",
  "user.role": "Qonaq",
  "user.menu": "İstifadəçi menyusu",

  // System states
  "offline.banner": "İnternet bağlantısı yoxdur — bağlantı bərpa olunanda davam edin.",
  "toast.copied": "Mətn kopyalandı",
  "toast.reset": "Söhbət yeniləndi",

  // Languages (each in its own tongue)
  "lang.az": "Azərbaycan dili",
  "lang.en": "English",
  "lang.ru": "Русский",

  // ARIA
  "aria.chatLog": "Söhbət mesajları",
  "aria.sidebar": "Naviqasiya paneli",
  "aria.main": "Əsas məzmun",
  "aria.menuOptions": "Menyu seçimləri",
} as const;

export type TranslationKey = keyof typeof az;
