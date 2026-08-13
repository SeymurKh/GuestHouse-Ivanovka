// Internationalization - Translations
export type Language = 'ru' | 'az' | 'en'

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'az', name: 'Azərbaycan', flag: '/flags/az.png' },
  { code: 'ru', name: 'Русский', flag: '/flags/ru.svg' },
  { code: 'en', name: 'English', flag: '/flags/en.svg' },
]

export const translations = {
  ru: {
    // Header
    nav: {
      rooms: 'Размещение',
      gallery: 'Галерея',
      contact: 'Контакты',
      call: 'Позвонить',
    },
    // Hero
    hero: {
      location: 'Азербайджан, Исмаиллы',
      title1: 'ROOM',
      title2: 'Guest Houses',
      subtitle: 'Уютные гостевые дома в сердце природы Исмаиллы.',
      description: 'Погрузитесь в атмосферу спокойствия, уюта и загородного отдыха. Здесь природа, приватность и комфорт соединяются в одном пространстве — идеально для семей, друзей и тихих уикендов вдали от города.',
      btnRooms: 'Каталог Домов',
      btnBook: 'Забронировать',
      btnContact: 'Связаться',
      perNight: 'AZN / ночь',
      guests: 'гостей',
    },
    // Rooms
    rooms: {
      badge: 'Размещение',
      title: 'Дома с участком',
      perNight: 'AZN / ночь',
      upTo: 'до',
      guests: 'гостей',
      details: 'Подробнее',
    },
    // Room Modal
    modal: {
      description: 'Описание',
      conditions: 'Условия проживания',
      advantages: 'Преимущества',
      amenities: 'Удобства',
      images: 'Изображения',
      book: 'Забронировать',
      bookPhone: 'Забронировать по телефону',
    },
    // Gallery
    gallery: {
      badge: 'Галерея',
      title: 'Окрестности Ивановки',
      description: 'Горы, леса, водопады — всё это рядом с нами',
      forest: 'Лесные тропы',
      waterfall: 'Горный водопад',
      terrace: 'Отдых на террасе',
      cottage: 'Домик',
      landscape: 'Горный пейзаж',
      mountainView: 'Вид на горы',
    },
    // Contact
    contact: {
      badge: 'Контакты',
      title: 'Свяжитесь с нами',
      description: 'Готовы ответить на все ваши вопросы и помочь с выбором',
      phone: 'Телефон',
      email: 'Email',
      address: 'Адрес',
      addressValue: 'Азербайджан, г. Исмаиллы, посёлок Ивановка',
    },
    // Footer
    footer: {
      rights: 'Все права защищены',
    },
    // Loading
    loading: 'Загрузка...',
    // Admin
    admin: {
      title: 'Админ-панель',
      passwordPrompt: 'Введите пароль для доступа',
      password: 'Пароль',
      login: 'Войти',
      demoPassword: 'Демо пароль: admin123',
      manageTitle: 'Управление домиками',
      manageDesc: 'Редактирование информации (только 2 домика)',
      edit: 'Редактировать',
      save: 'Сохранить',
      cancel: 'Отмена',
      saved: 'Сохранено успешно!',
      name: 'Название',
      price: 'Цена (AZN)',
      capacity: 'Вместимость (гостей)',
      description: 'Описание',
      conditionsLabel: 'Условия проживания',
      advantagesLabel: 'Преимущества (каждое с новой строки)',
      amenitiesLabel: 'Удобства (через запятую)',
      images: 'Изображения',
      addPhoto: 'Добавить фото',
      wrongPassword: 'Неверный пароль',
    },
    // Amenities
    amenities: {
      wifi: 'Wi-Fi',
      ac: 'Кондиционер',
      tv: 'ТВ',
      minibar: 'Мини-бар',
      bath: 'Ванна',
      shower: 'Душ',
      fireplace: 'Камин',
      kitchen: 'Кухня',
      parking: 'Парковка',
      safe: 'Сейф',
    },
  },
  az: {
    // Header
    nav: {
      rooms: 'Yerləşmə',
      gallery: 'Qalereya',
      contact: 'Əlaqə',
      call: 'Zəng et',
    },
    // Hero
    hero: {
      location: 'Azərbaycan, İsmayıllı',
      title1: 'ROOM',
      title2: 'Guest Houses',
      subtitle: 'İsmayıllı təbiətinin ürəyində istirahət üçün qonaq evləri.',
      description: 'Sakitlik, rahatlıq və kənd həyatı atmosferinə dalın. Burada təbiət, məxfilik və rahatlıq bir məkanda birləşir — ailələr, dostlar və şəhərdən uzaq sakit həftəsonları üçün idealdır.',
      btnRooms: 'Evlər Kataloqu',
      btnBook: 'Rezervasiya',
      btnContact: 'Əlaqə',
      perNight: 'AZN / gecə',
      guests: 'qonaq',
    },
    // Rooms
    rooms: {
      badge: 'Qalmaq',
      title: 'Həyətli evlər',
      perNight: 'AZN / gecə',
      upTo: 'ədək',
      guests: 'qonaq',
      details: 'Ətraflı',
    },
    // Room Modal
    modal: {
      description: 'Təsvir',
      conditions: 'Qalma şərtləri',
      advantages: 'Üstünlüklər',
      amenities: 'Rahatlıqlar',
      images: 'Şəkillər',
      book: 'Rezervasiya',
      bookPhone: 'Telefonla rezervasiya',
    },
    // Gallery
    gallery: {
      badge: 'Qalereya',
      title: 'İvanovka ətrafı',
      description: 'Dağlar, meşələr, şəlalələr — hamısı bizim yaxınlığımızda',
      forest: 'Meşə cığırları',
      waterfall: 'Dağ şəlaləsi',
      terrace: 'Terasada istirahət',
      cottage: 'Evik',
      landscape: 'Dağ mənzərəsi',
      mountainView: 'Dağlara baxış',
    },
    // Contact
    contact: {
      badge: 'Əlaqə',
      title: 'Bizimlə əlaqə saxlayın',
      description: 'Bütün suallarınıza cavab verməyə və seçimdə kömək etməyə hazırdıq',
      phone: 'Telefon',
      email: 'Email',
      address: 'Ünvan',
      addressValue: 'Azərbaycan, İsmayıllı şəhəri, İvanovka qəsəbəsi',
    },
    // Footer
    footer: {
      rights: 'Bütün hüquqlar qorunur',
    },
    // Loading
    loading: 'Yüklənir...',
    // Admin
    admin: {
      title: 'Admin panel',
      passwordPrompt: 'Giriş üçün parol daxil edin',
      password: 'Parol',
      login: 'Daxil ol',
      demoPassword: 'Demo parol: admin123',
      manageTitle: 'Eviklərin idarə edilməsi',
      manageDesc: 'Məlumatların redaktə edilməsi (yalnız 2 evik)',
      edit: 'Redaktə et',
      save: 'Yadda saxla',
      cancel: 'Ləğv et',
      saved: 'Uğurla saxlanıldı!',
      name: 'Ad',
      price: 'Qiymət (AZN)',
      capacity: 'Tutum (qonaq)',
      description: 'Təsvir',
      conditionsLabel: 'Qalma şərtləri',
      advantagesLabel: 'Üstünlüklər (hər biri yeni sətirdə)',
      amenitiesLabel: 'Rahatlıqlar (vergül ilə)',
      images: 'Şəkillər',
      addPhoto: 'Şəkil əlavə et',
      wrongPassword: 'Yanlış parol',
    },
    // Amenities
    amenities: {
      wifi: 'Wi-Fi',
      ac: 'Kondisioner',
      tv: 'TV',
      minibar: 'Mini-bar',
      bath: 'Vanna',
      shower: 'Duş',
      fireplace: 'Ocaq',
      kitchen: 'Mətbəx',
      parking: 'Parkovka',
      safe: 'Seyf',
    },
  },
  en: {
    // Header
    nav: {
      rooms: 'Accommodation',
      gallery: 'Gallery',
      contact: 'Contact',
      call: 'Call',
    },
    // Hero
    hero: {
      location: 'Azerbaijan, Ismayilli',
      title1: 'ROOM',
      title2: 'Guest Houses',
      subtitle: 'Cozy guest houses in the heart of Ismayilli nature.',
      description: 'Immerse yourself in tranquility, comfort and countryside living. Here nature, privacy and comfort come together in one space — perfect for families, friends and quiet weekends away from the city.',
      btnRooms: 'Guest Houses Catalog',
      btnBook: 'Book Now',
      btnContact: 'Contact Us',
      perNight: 'AZN / night',
      guests: 'guests',
    },
    // Rooms
    rooms: {
      badge: 'Accommodation',
      title: 'Houses with Grounds',
      perNight: 'AZN / night',
      upTo: 'up to',
      guests: 'guests',
      details: 'Details',
    },
    // Room Modal
    modal: {
      description: 'Description',
      conditions: 'Accommodation Conditions',
      advantages: 'Advantages',
      amenities: 'Amenities',
      images: 'Images',
      book: 'Book Now',
      bookPhone: 'Book by phone',
    },
    // Gallery
    gallery: {
      badge: 'Gallery',
      title: 'Around Ivanovka',
      description: 'Mountains, forests, waterfalls — all nearby',
      forest: 'Forest Trails',
      waterfall: 'Mountain Waterfall',
      terrace: 'Terrace Relaxation',
      cottage: 'Cottage',
      landscape: 'Mountain Landscape',
      mountainView: 'Mountain View',
    },
    // Contact
    contact: {
      badge: 'Contact',
      title: 'Get in Touch',
      description: 'Ready to answer all your questions and help you choose',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      addressValue: 'Azerbaijan, Ismayilli city, Ivanovka settlement',
    },
    // Footer
    footer: {
      rights: 'All rights reserved',
    },
    // Loading
    loading: 'Loading...',
    // Admin
    admin: {
      title: 'Admin Panel',
      passwordPrompt: 'Enter password to access',
      password: 'Password',
      login: 'Login',
      demoPassword: 'Demo password: admin123',
      manageTitle: 'Manage Cottages',
      manageDesc: 'Edit information (only 2 cottages)',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      saved: 'Saved successfully!',
      name: 'Name',
      price: 'Price (AZN)',
      capacity: 'Capacity (guests)',
      description: 'Description',
      conditionsLabel: 'Accommodation Conditions',
      advantagesLabel: 'Advantages (one per line)',
      amenitiesLabel: 'Amenities (comma separated)',
      images: 'Images',
      addPhoto: 'Add Photo',
      wrongPassword: 'Wrong password',
    },
    // Amenities
    amenities: {
      wifi: 'Wi-Fi',
      ac: 'Air Conditioning',
      tv: 'TV',
      minibar: 'Mini-bar',
      bath: 'Bath',
      shower: 'Shower',
      fireplace: 'Fireplace',
      kitchen: 'Kitchen',
      parking: 'Parking',
      safe: 'Safe',
    },
  },
}

export type Translations = typeof translations.ru
