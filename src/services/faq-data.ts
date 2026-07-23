/**
 * Sample Abituriyent (applicant) FAQ tree for the OFFLINE MOCK engine only.
 *
 * When the app is pointed at a real AbituriBack deployment (VITE_API_BASE set),
 * this data is unused — answers come from the backend's data/faq.json. It mirrors
 * that shape: category → (optional) sub-category → question → verbatim answer.
 * All content is Azerbaijani, matching the backend.
 */

export interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSubcategory {
  id: string;
  label: string;
  questions: FaqQuestion[];
}

export interface FaqCategory {
  id: string;
  label: string;
  /** A category is EITHER split into sub-categories OR holds questions directly. */
  subcategories?: FaqSubcategory[];
  questions?: FaqQuestion[];
}

export const FAQ_GREETING =
  "Salam! Bakı Dövlət Universitetinin abituriyent köməkçisiyəm.\n\n" +
  "Sizi maraqlandıran mövzunu aşağıdakı bölmələrdən seçin və ya sualınızı birbaşa yazın.";

export const FAQ_TREE: readonly FaqCategory[] = [
  {
    id: "qebul-prosesi",
    label: "Qəbul prosesi",
    questions: [
      {
        id: "qebul-ne-vaxt-baslayir",
        question: "Qəbul nə vaxt başlayır?",
        answer:
          "Ali təhsil müəssisələrinə qəbul imtahanları hər il DİM (Dövlət İmtahan Mərkəzi) tərəfindən iyun ayında keçirilir. Sənəd qəbulu adətən avqust ayının ortalarında başlayır. Dəqiq tarixlər üçün dim.gov.az saytını izləyin.",
      },
      {
        id: "ixtisas-secimi-nece-olur",
        question: "İxtisas seçimi necə aparılır?",
        answer:
          "İmtahan nəticələri elan olunduqdan sonra abituriyentlər DİM-in elektron sistemi vasitəsilə ixtisaslar üzrə seçim (ərizə) verirlər. Seçim zamanı ixtisasları üstünlük sırasına görə düzün — sistem topladığınız bala uyğun ən yüksək prioritetli ixtisasa yerləşdirir.",
      },
      {
        id: "kecid-bali-nedir",
        question: "Keçid balı nədir?",
        answer:
          "Keçid balı hər ixtisas üzrə qəbul olan sonuncu abituriyentin topladığı baldır və hər il müraciət sayına görə dəyişir. Keçən illərin keçid balları BDU-nun rəsmi saytında “Abituriyent” bölməsində yerləşdirilir.",
      },
      {
        id: "hansi-fenler-teleb-olunur",
        question: "İxtisas üçün hansı fənlər tələb olunur?",
        answer:
          "Hər ixtisas müəyyən ixtisas qrupuna (I–V) aiddir və o qrupa uyğun fənlərdən imtahan verilir. İxtisas qruplarının fən tərkibi DİM-in “İxtisaslar toplusu” bülletenində göstərilir.",
      },
    ],
  },
  {
    id: "senedler",
    label: "Sənədlər",
    questions: [
      {
        id: "hansi-senedler-lazimdir",
        question: "Qəbul üçün hansı sənədlər lazımdır?",
        answer:
          "Sənəd qəbulu zamanı tələb olunan əsas sənədlər:\n" +
          "• Şəxsiyyət vəsiqəsi (əsli və surəti)\n" +
          "• Tam orta təhsil haqqında attestat\n" +
          "• DİM tərəfindən verilən qəbul kartı / nəticə vərəqəsi\n" +
          "• 3×4 ölçüdə 6 ədəd fotoşəkil\n" +
          "• Tibbi arayış (forma 086/U)\n" +
          "• Hərbi biletin surəti (oğlanlar üçün)",
      },
      {
        id: "senedler-onlayn-verilir-mi",
        question: "Sənədləri onlayn təqdim etmək olar?",
        answer:
          "Bəzi mərhələlər (ərizə, ixtisas seçimi) DİM-in elektron sistemi üzərindən aparılır. Lakin sənədlərin əsli qeydiyyat zamanı fakültə dekanlığına şəxsən təqdim edilməlidir.",
      },
      {
        id: "attestat-itibse-ne-etmeli",
        question: "Attestatı itirmişəmsə nə etməliyəm?",
        answer:
          "Attestat itirildikdə təhsil aldığınız məktəbə müraciət edərək dublikat (əvəzedici sənəd) almalısınız. Dublikat rəsmi qüvvəyə malikdir və qəbul üçün qəbul edilir.",
      },
    ],
  },
  {
    id: "teqaud",
    label: "Təqaüd",
    questions: [
      {
        id: "teqaud-kimlere-verilir",
        question: "Təqaüd kimlərə verilir?",
        answer:
          "Təqaüd dövlət hesabına (ödənişsiz) təhsil alan və imtahan sessiyasını yüksək qiymətlərlə bağlayan tələbələrə verilir. Ödənişli əsaslarla təhsil alan tələbələr adi halda təqaüd almırlar.",
      },
      {
        id: "teqaud-meblegi-nece",
        question: "Təqaüdün məbləği nə qədərdir?",
        answer:
          "Təqaüdün məbləği tələbənin akademik göstəricilərindən və ixtisasından asılıdır. Yüksək nəticə göstərən tələbələr üçün artırılmış (fərqlənmə) təqaüdləri nəzərdə tutulur. Dəqiq məbləğlər hər tədris ili üçün yenilənir.",
      },
      {
        id: "prezident-teqaudu",
        question: "Prezident təqaüdünü necə almaq olar?",
        answer:
          "Prezident təqaüdü xüsusi olaraq fərqlənən, elmi və ictimai fəaliyyətdə uğur qazanan tələbələrə verilir. Namizədlər fakültə tərəfindən irəli sürülür və müvafiq qaydada seçilir.",
      },
    ],
  },
  {
    id: "yataqxana",
    label: "Yataqxana",
    questions: [
      {
        id: "yataqxana-kimlere-verilir",
        question: "Yataqxana kimlərə verilir?",
        answer:
          "Yataqxana ilk növbədə Bakı şəhərindən kənarda daimi qeydiyyatda olan (bölgə) tələbələrə verilir. Yer sayı məhdud olduğundan üstünlük sosial vəziyyət və akademik göstəricilərə görə müəyyən edilir.",
      },
      {
        id: "yataqxana-muracieti-nece",
        question: "Yataqxana üçün necə müraciət etməliyəm?",
        answer:
          "Qəbul olduqdan sonra fakültə dekanlığına və ya universitetin sosial məsələlər şöbəsinə ərizə ilə müraciət edin. Ərizəyə ailə tərkibi və gəlir haqqında arayışlar əlavə olunur.",
      },
    ],
  },
  {
    id: "kitabxana",
    label: "Kitabxana",
    subcategories: [
      {
        id: "kitabxana-abonement",
        label: "Abonement",
        questions: [
          {
            id: "kitab-nece-gune-oturler",
            question: "Kitab neçə günə oturulur?",
            answer:
              "Kitablar adətən 14 gün müddətinə verilir. Müddəti başqa oxucu növbədə deyilsə, kitabxanaya müraciət edərək uzatmaq mümkündür.",
          },
          {
            id: "abonemente-nece-yazilmaq",
            question: "Abonementə necə yazılmaq olar?",
            answer:
              "Abonementə yazılmaq üçün tələbə bileti və şəxsiyyət vəsiqəsi ilə kitabxananın qeydiyyat masasına yaxınlaşın. Qeydiyyat pulsuzdur.",
          },
        ],
      },
      {
        id: "kitabxana-elektron",
        label: "Elektron kitabxana",
        questions: [
          {
            id: "elektron-kitabxana-nece-giris",
            question: "Elektron kitabxanaya necə giriş etmək olar?",
            answer:
              "Elektron kitabxanaya universitetin veb saytındakı “E-Kitabxana” bölməsindən tələbə hesabınızla giriş edə bilərsiniz. Giriş məlumatlarını fakültə kitabxanaçısından ala bilərsiniz.",
          },
          {
            id: "elektron-resurslar-pulsuzdur-mi",
            question: "Elektron resurslar pulsuzdurmu?",
            answer:
              "Bəli, universitetin abunə olduğu elektron bazalar və rəqəmsal kitablar tələbələr üçün pulsuzdur. İstifadə universitet şəbəkəsi və ya tələbə hesabı vasitəsilə mümkündür.",
          },
        ],
      },
    ],
  },
  {
    id: "elaqe",
    label: "Əlaqə",
    questions: [
      {
        id: "qebul-komissiyasi-elaqe",
        question: "Qəbul komissiyası ilə necə əlaqə saxlaya bilərəm?",
        answer:
          "Qəbul dövründə universitetin qəbul komissiyası ilə rəsmi telefon nömrələri və e-poçt vasitəsilə əlaqə saxlaya bilərsiniz. Əlaqə məlumatları bsu.edu.az saytının “Əlaqə” bölməsində yerləşdirilir.",
      },
      {
        id: "unvan-haradadir",
        question: "Universitetin ünvanı haradadır?",
        answer:
          "Bakı Dövlət Universiteti Bakı şəhəri, Akademik Zahid Xəlilov küçəsi 33 ünvanında yerləşir.",
      },
    ],
  },
] as const;
