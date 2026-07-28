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
  "chat.imageOpen": "Şəkli tam ölçüdə aç",
  "chat.imageFailed": "Şəkil yüklənmədi",

  // Long menus
  "menu.searchPlaceholder": "Siyahıda axtarın…",
  "menu.noMatches": "Uyğun nəticə tapılmadı.",
  "menu.showAll": "Daha {count} variant göstər",
  "menu.showLess": "Siyahını yığcamlaşdır",

  // Operator hand-off
  "operator.contact": "Operatorla əlaqə",
  "operator.askPhone":
    "Operatorla əlaqə üçün zəhmət olmasa əlaqə nömrənizi yazın (məs. +994501234567).",
  "operator.askMessage": "İndi sualınızı yazın — operator sizinlə əlaqə saxlayacaq.",
  "operator.phonePlaceholder": "+994 50 123 45 67",
  "operator.messagePlaceholder": "Sualınızı yazın…",
  "operator.send": "Göndər",
  "operator.next": "Davam et",
  "operator.cancel": "Ləğv et",
  "operator.cancelled": "Operatorla əlaqə sorğusu ləğv edildi.",
  "operator.sending": "Göndərilir…",
  "operator.phoneInvalid":
    "Zəhmət olmasa əlaqə nömrənizi düzgün formatda yazın (məs. +994501234567).",

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
  "settings.fontSize": "Şrift ölçüsü",
  "settings.fontSize.small": "Kiçik",
  "settings.fontSize.medium": "Orta",
  "settings.fontSize.large": "Böyük",
  "settings.about.description":
    "Bakı Dövlət Universiteti abituriyent məlumat xidmətinə xoş gəlmisiniz.",

  // User (demo persona)
  "user.name": "Abituriyent",
  "user.role": "Qonaq",
  "user.menu": "İstifadəçi menyusu",

  // System states
  "offline.banner": "İnternet bağlantısı yoxdur — bağlantı bərpa olunanda davam edin.",
  "toast.copied": "Mətn kopyalandı",
  "toast.reset": "Söhbət yeniləndi",

  // ARIA
  "aria.chatLog": "Söhbət mesajları",
  "aria.sidebar": "Naviqasiya paneli",
  "aria.main": "Əsas məzmun",
  "aria.menuOptions": "Menyu seçimləri",
} as const;

export type TranslationKey = keyof typeof az;
