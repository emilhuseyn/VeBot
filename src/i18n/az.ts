/**
 * Azerbaijani — default locale and source of truth for the key set.
 * en.ts / ru.ts are typed against `TranslationKey`, so a missing key is a
 * compile error. (FAQ content itself is Azerbaijani-only, from the backend;
 * only the UI chrome is localized.)
 */
export const az = {
  // App / brand
  "app.full": "BDU Abituriyent Köməkçisi",

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

  // Chat
  "chat.loading": "Cavab hazırlanır…",
  "chat.scrollToBottom": "Aşağı keç",
  "chat.error": "Bağlantı xətası baş verdi.",
  "chat.retry": "Yenidən cəhd et",
  "chat.copy": "Kopyala",
  "chat.copied": "Kopyalandı",
  "chat.openLink": "Keçidi aç",
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
  // Fallbacks for locally-detected outcomes; the backend's own copy (`detail`)
  // is shown verbatim whenever it arrives.
  "operator.submitted":
    "Sorğunuz qeydə alındı, tezliklə sizinlə əlaqə saxlanılacaq.",
  "operator.submitFailed":
    "Sorğunuzu qeydə ala bilmədik. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
  "operator.networkError":
    "Bağlantı xətası baş verdi. Zəhmət olmasa yenidən cəhd edin.",

  // Menu navigation
  "nav.home": "Əsas menyu",
  "nav.back": "Geri",
  "nav.prev": "Əvvəlki",
  "nav.next": "Növbəti",
  "nav.page": "{page} / {total}",

  // Common
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

  // ARIA
  "aria.chatLog": "Söhbət mesajları",
  "aria.sidebar": "Naviqasiya paneli",
  "aria.main": "Əsas məzmun",
  "aria.menuOptions": "Menyu seçimləri",
  "aria.menuNav": "Menyu naviqasiyası",
} as const;

export type TranslationKey = keyof typeof az;
