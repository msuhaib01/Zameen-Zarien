"use client";

import { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

// Create context
const AppContext = createContext();

// Sample data for demonstration
const sampleCommodities = [
  { id: 1, name: "Apple (Ammre)", name_ur: "سیب (عمری)" },
  { id: 2, name: "Apple (Gatcha)", name_ur: "سیب (گچھا)" },
  { id: 3, name: "Apple (Golden)", name_ur: "سیب (گولڈن)" },
  { id: 4, name: "Apple Kala Kullu (Madani)", name_ur: "سیب کالا کلو (مدنی)" },
  { id: 5, name: "Apple Kala Kullu (Pahari)", name_ur: "سیب کالا کلو (پہاڑی)" },
  { id: 6, name: "Apricot White", name_ur: "خوبانی سفید" },
  { id: 7, name: "Apricot Yellow", name_ur: "خوبانی پیلی" },
  { id: 8, name: "Banana(DOZEN)", name_ur: "کیلا (درجن)" },
  { id: 9, name: "Banola", name_ur: "بنولا" },
  { id: 10, name: "Banola Cake", name_ur: "بنولا کیک" },
  { id: 11, name: "Barley(جو)", name_ur: "جو" },
  { id: 12, name: "Batho", name_ur: "باتھو" },
  { id: 13, name: "Bitter Gourd (کریلا)", name_ur: "کریلا" },
  { id: 14, name: "Bottle Gourd (کدو)", name_ur: "کدو" },
  { id: 15, name: "Brinjal", name_ur: "بینگن" },
  { id: 16, name: "Brown Sugar(شکر)", name_ur: "براؤن شوگر" },
  { id: 17, name: "Cabbage", name_ur: "بند گوبھی" },
  { id: 18, name: "Canola", name_ur: "کینولا" },
  { id: 19, name: "Capsicum (شملی مرچ)", name_ur: "شملہ مرچ" },
  { id: 20, name: "Carrot", name_ur: "گاجر" },
  { id: 21, name: "Carrot China", name_ur: "گاجر چائنا" },
  { id: 22, name: "Cauliflower", name_ur: "پھول گوبھی" },
  { id: 23, name: "Cocoyam(اروی)", name_ur: "اروی" },
  { id: 24, name: "Cocunut", name_ur: "ناریل" },
  { id: 25, name: "Coriander (دھنیا)", name_ur: "دھنیا" },
  { id: 26, name: "Cucumber (Kheera)", name_ur: "کھیرا" },
  { id: 27, name: "Dates (Aseel)", name_ur: "کھجور (اصیل)" },
  { id: 28, name: "Dates(Irani)", name_ur: "کھجور (ایرانی)" },
  { id: 29, name: "Fenugreek(میتھی)", name_ur: "میتھی" },
  { id: 30, name: "feutral early(100 Pcs) فروٹر", name_ur: "فروٹر (100 عدد)" },
  { id: 31, name: "Garlic (China)", name_ur: "لہسن (چائنا)" },
  { id: 32, name: "Garlic (Local)", name_ur: "لہسن (مقامی)" },
  { id: 33, name: "Ginger (Thai)", name_ur: "ادرک (تھائی)" },
  { id: 34, name: "Ginger(China)", name_ur: "ادرک (چائنا)" },
  { id: 35, name: "Gram Black", name_ur: "کالا چنا" },
  { id: 36, name: "Gram Flour (بیسن)", name_ur: "بیسن" },
  { id: 37, name: "Gram Pulse", name_ur: "چنے کی دال" },
  { id: 38, name: "Gram White(Imported)", name_ur: "سفید چنا (درآمد شدہ)" },
  { id: 39, name: "Gram White(local)", name_ur: "سفید چنا (مقامی)" },
  { id: 40, name: "Grapefruit(100Pcs)", name_ur: "گریپ فروٹ (100 عدد)" },
  { id: 41, name: "Grapes (Other)", name_ur: "انگور (دیگر)" },
  { id: 42, name: "Grapes Gola", name_ur: "انگور گولا" },
  { id: 43, name: "Grapes Sundekhani", name_ur: "انگور سندیخانی" },
  { id: 44, name: "green chickpeas(چھولیا)", name_ur: "ہرے چنے (چھولیا)" },
  { id: 45, name: "Green Chilli", name_ur: "ہری مرچ" },
  { id: 46, name: "Green Fodder", name_ur: "ہرا چارہ" },
  { id: 47, name: "Green Onion", name_ur: "ہرا پیاز" },
  { id: 48, name: "Groundnut", name_ur: "مونگ پھلی" },
  { id: 49, name: "Guava", name_ur: "امرود" },
  { id: 50, name: "Jaggery (گڑ)", name_ur: "گڑ" },
  { id: 51, name: "Jaman", name_ur: "جامن" },
  { id: 52, name: "jujube(بیر)", name_ur: "بیر" },
  { id: 53, name: "Kinnow (100Pcs)", name_ur: "کینو (100 عدد)" },
  { id: 54, name: "Lady Finger/Okra (بھنڈی توری)", name_ur: "بھنڈی" },
  { id: 55, name: "Lemon (China)", name_ur: "لیموں (چائنا)" },
  { id: 56, name: "Lemon (Desi)", name_ur: "لیموں (دیسی)" },
  { id: 57, name: "Lemon (Other)", name_ur: "لیموں (دیگر)" },
  { id: 58, name: "Loquat", name_ur: "لوکاٹ" },
  { id: 59, name: "Lychee", name_ur: "لیچی" },
  { id: 60, name: "Maize", name_ur: "مکئی" },
  { id: 61, name: "Mango (Malda)", name_ur: "آم (ملدہ)" },
  { id: 62, name: "Mango Desi", name_ur: "آم دیسی" },
  { id: 63, name: "Mango Saharni", name_ur: "آم سہارنی" },
  { id: 64, name: "Mango(Anwer Ratol)", name_ur: "آم (انور رتول)" },
  { id: 65, name: "Mango(Chounsa)", name_ur: "آم (چونسہ)" },
  { id: 66, name: "Mango(Desahri)", name_ur: "آم (دیسہری)" },
  { id: 67, name: "Mango(Sindhri)", name_ur: "آم (سندھری)" },
  { id: 68, name: "Mash", name_ur: "ماش" },
  { id: 69, name: "Mash Pulse(Imported) washed", name_ur: "ماش دال (درآمد شدہ) دھلی ہوئی" },
  { id: 70, name: "Mash Pulse(local)", name_ur: "ماش دال (مقامی)" },
  { id: 71, name: "Masoor Pulse (Imported)", name_ur: "مسور دال (درآمد شدہ)" },
  { id: 72, name: "Masoor Pulse(local)", name_ur: "مسور دال (مقامی)" },
  { id: 73, name: "Masoor Whole (Imported)", name_ur: "مسور سابت (درآمد شدہ)" },
  { id: 74, name: "Masoor Whole(local)", name_ur: "مسور سابت (مقامی)" },
  { id: 75, name: "Melon", name_ur: "خربوزہ" },
  { id: 76, name: "Millet", name_ur: "باجرہ" },
  { id: 77, name: "Mint(پودینہ)", name_ur: "پودینہ" },
  { id: 78, name: "Mongray", name_ur: "مونگرے" },
  { id: 79, name: "Moong", name_ur: "مونگ" },
  { id: 80, name: "Moong Pulse", name_ur: "مونگ دال" },
  { id: 81, name: "Musambi(100Pcs)", name_ur: "مسمبی (100 عدد)" },
  { id: 82, name: "Mustard Greens(ساگ سرسوں)", name_ur: "سرسوں کا ساگ" },
  { id: 83, name: "Mustard seed", name_ur: "سرسوں" },
  { id: 84, name: "Onion", name_ur: "پیاز" },
  { id: 85, name: "Orange(100Pcs)", name_ur: "مالٹا (100 عدد)" },
  { id: 86, name: "Paddy (IRRI)", name_ur: "دھان (آئی آر آر آئی)" },
  { id: 87, name: "Paddy Basmati", name_ur: "دھان باسمتی" },
  { id: 88, name: "Paddy Kainat", name_ur: "دھان کائنات" },
  { id: 89, name: "Papaya(پپیتا)", name_ur: "پپیتا" },
  { id: 90, name: "Peach", name_ur: "آڑو" },
  { id: 91, name: "Peach Special", name_ur: "آڑو خصوصی" },
  { id: 92, name: "Pear", name_ur: "ناشپاتی" },
  { id: 93, name: "Peas", name_ur: "مٹر" },
  { id: 94, name: "Persimmon(جاپانی پھل)", name_ur: "جاپانی پھل" },
  { id: 95, name: "Plum", name_ur: "آلوبخارا" },
  { id: 96, name: "Pomegranate Desi", name_ur: "انار دیسی" },
  { id: 97, name: "Pomegranate(Badana)", name_ur: "انار (بدانہ)" },
  { id: 98, name: "Pomegranate(Kandhari)", name_ur: "انار (کندھاری)" },
  { id: 99, name: "Potato Fresh", name_ur: "آلو تازہ" },
  { id: 100, name: "Potato Store", name_ur: "آلو اسٹور" },
  { id: 101, name: "Potato Sugar free", name_ur: "آلو شوگر فری" },
  { id: 102, name: "Pumpkin", name_ur: "کدو" },
  { id: 103, name: "Radish", name_ur: "مولی" },
  { id: 104, name: "RapeSeed (Torya)", name_ur: "توریا" },
  { id: 105, name: "Red Chilli Whole (Dry)", name_ur: "لال مرچ سابت (خشک)" },
  { id: 106, name: "Rice (IRRI)", name_ur: "چاول (آئی آر آر آئی)" },
  { id: 107, name: "Rice Basmati (385)", name_ur: "چاول باسمتی (385)" },
  { id: 108, name: "Rice Basmati Super (New)", name_ur: "چاول باسمتی سپر (نیا)" },
  { id: 109, name: "Rice Basmati Super (Old)", name_ur: "چاول باسمتی سپر (پرانا)" },
  { id: 110, name: "Rice Kainat (New)", name_ur: "چاول کائنات (نیا)" },
  { id: 111, name: "Seed Cotton(Phutti)", name_ur: "کپاس (پھٹی)" },
  { id: 112, name: "Sesame(تل)", name_ur: "تل" },
  { id: 113, name: "Sorghum", name_ur: "جوار" },
  { id: 114, name: "Spinach", name_ur: "پالک" },
  { id: 115, name: "Strawberry", name_ur: "اسٹرابیری" },
  { id: 116, name: "Sugar", name_ur: "چینی" },
  { id: 117, name: "sugarcane", name_ur: "گنا" },
  { id: 118, name: "Suger Beet(چقندر)", name_ur: "چقندر" },
  { id: 119, name: "Sunflower", name_ur: "سورج مکھی" },
  { id: 120, name: "Sweet Musk Melon", name_ur: "میٹھا خربوزہ" },
  { id: 121, name: "Sweet Musk Melon (Shireen)", name_ur: "میٹھا خربوزہ (شیریں)" },
  { id: 122, name: "Sweet Potato(شکر قندی)", name_ur: "شکر قندی" },
  { id: 123, name: "Tinda Desi", name_ur: "ٹنڈا دیسی" },
  { id: 124, name: "Tindian", name_ur: "ٹنڈیاں" },
  { id: 125, name: "Tomato", name_ur: "ٹماٹر" },
  { id: 126, name: "Turmeric Whole(ثابت ہلدی)", name_ur: "ہلدی سابت" },
  { id: 127, name: "Turnip", name_ur: "شلجم" },
  { id: 128, name: "Water chestnut(سنگھاڑا)", name_ur: "سنگھاڑا" },
  { id: 129, name: "Watermelon", name_ur: "تربوز" },
  { id: 130, name: "Wheat", name_ur: "گندم" },
  { id: 131, name: "Wheat Straw", name_ur: "گندم کا بھوسہ" },
  { id: 132, name: "Zucchini (گھیا توری)", name_ur: "گھیا توری" },
];

// Add sample locations
const sampleLocations = [
  { id: 1, name: "Abdulhakim", name_ur: "عبدالحکیم" },
  { id: 2, name: "AhmadPurEast", name_ur: "احمدپور ایسٹ" },
  { id: 3, name: "Alipur", name_ur: "علی پور" },
  { id: 4, name: "AliPurChatta", name_ur: "علی پور چٹہ" },
  { id: 5, name: "ArifWala", name_ur: "عارف والا" },
  { id: 6, name: "Badomalhi", name_ur: "بدومالہی" },
  { id: 7, name: "BahawalNagar", name_ur: "بہاولنگر" },
  { id: 8, name: "BahawalPur", name_ur: "بہاولپور" },
  { id: 9, name: "Basirpur", name_ur: "بصیرپور" },
  { id: 10, name: "Bhakhar", name_ur: "بھکر" },
  { id: 11, name: "Bhalwal", name_ur: "بھلوال" },
  { id: 12, name: "Burewala", name_ur: "بوریوالا" },
  { id: 13, name: "ChackJhumra", name_ur: "چک جھمرہ" },
  { id: 14, name: "Chakwal", name_ur: "چکوال" },
  { id: 15, name: "Chichawatni", name_ur: "چیچہ وطنی" },
  { id: 16, name: "Chiniot", name_ur: "چنیوٹ" },
  { id: 17, name: "Chistian", name_ur: "چشتیاں" },
  { id: 18, name: "ChuaSaidanShah", name_ur: "چوآ سیدن شاہ" },
  { id: 19, name: "Chunian", name_ur: "چونیاں" },
  { id: 20, name: "Daska", name_ur: "ڈسکہ" },
  { id: 21, name: "Depalpur", name_ur: "دیپالپور" },
  { id: 22, name: "DGKHAN", name_ur: "ڈی جی خان" },
  { id: 23, name: "Dinga", name_ur: "ڈنگہ" },
  { id: 24, name: "DunyaPur", name_ur: "دنیا پور" },
  { id: 25, name: "Eminabad", name_ur: "ایمن آباد" },
  { id: 26, name: "Faisalabad", name_ur: "فیصل آباد" },
  { id: 27, name: "Farooqabad", name_ur: "فاروق آباد" },
  { id: 28, name: "Fatehpur", name_ur: "فتح پور" },
  { id: 29, name: "Fortabas", name_ur: "فورٹ عباس" },
  { id: 30, name: "Ghakhar", name_ur: "گھکھر" },
  { id: 31, name: "Gojra", name_ur: "گوجرہ" },
  { id: 32, name: "GujarKhan", name_ur: "گجر خان" },
  { id: 33, name: "Gujranwala", name_ur: "گوجرانوالہ" },
  { id: 34, name: "Gujrat", name_ur: "گجرات" },
  { id: 35, name: "Hafizabad", name_ur: "حافظ آباد" },
  { id: 36, name: "HaroonAbad", name_ur: "ہارون آباد" },
  { id: 37, name: "HasalPur", name_ur: "حاصل پور" },
  { id: 38, name: "Hasanabdal", name_ur: "حسن ابدال" },
  { id: 39, name: "Havelilakha", name_ur: "حویلی لکھا" },
  { id: 40, name: "Hazro", name_ur: "ہزرو" },
  { id: 41, name: "HujraShahmuqeem", name_ur: "حجرہ شاہ مقیم" },
  { id: 42, name: "Jahanian", name_ur: "جہانیاں" },
  { id: 43, name: "JalalPurJattan", name_ur: "جلال پور جٹاں" },
  { id: 44, name: "jalalpurpirwala", name_ur: "جلال پور پیروالا" },
  { id: 45, name: "JamPur", name_ur: "جام پور" },
  { id: 46, name: "Jaranwala", name_ur: "جڑانوالہ" },
  { id: 47, name: "Jauharabad", name_ur: "جوہر آباد" },
  { id: 48, name: "Jhang", name_ur: "جھنگ" },
  { id: 49, name: "Jhelum", name_ur: "جہلم" },
  { id: 50, name: "KabirWala", name_ur: "کبیر والا" },
  { id: 51, name: "KachaKhu", name_ur: "کچا کھو" },
  { id: 52, name: "Kahrorpacca", name_ur: "کہروڑ پکا" },
  { id: 53, name: "Kalurkot", name_ur: "کالور کوٹ" },
  { id: 54, name: "Kamalia", name_ur: "کمالیہ" },
  { id: 55, name: "Kamoke", name_ur: "کامونکی" },
  { id: 56, name: "Kanganpur", name_ur: "کنگن پور" },
  { id: 57, name: "Karachi", name_ur: "کراچی" },
  { id: 58, name: "Kassowal", name_ur: "کسووال" },
  { id: 59, name: "Kasur", name_ur: "قصور" },
  { id: 60, name: "KatchaLahore", name_ur: "کچا لاہور" },
  { id: 61, name: "Khairpurtamewali", name_ur: "خیرپور تمیوالی" },
  { id: 62, name: "Khanewal", name_ur: "خانیوال" },
  { id: 63, name: "Khankahdogran", name_ur: "خانقاہ ڈوگراں" },
  { id: 64, name: "Khanpur", name_ur: "خان پور" },
  { id: 65, name: "Khudian", name_ur: "خودیاں" },
  { id: 66, name: "Khushab", name_ur: "خوشاب" },
  { id: 67, name: "KotAdu", name_ur: "کوٹ ادو" },
  { id: 68, name: "KotChutta", name_ur: "کوٹ چھٹہ" },
  { id: 69, name: "kotmoman", name_ur: "کوٹ مومن" },
  { id: 70, name: "Kotradhakishan", name_ur: "کوٹرہ دھکیشن" },
  { id: 71, name: "Lahore", name_ur: "لاہور" },
  { id: 72, name: "Lahore(Singhpura)", name_ur: "لاہور (سنگھ پورہ)" },
  { id: 73, name: "LalaMusa", name_ur: "لالہ موسیٰ" },
  { id: 74, name: "Lalian", name_ur: "لالیاں" },
  { id: 75, name: "Layyah", name_ur: "لیہ" },
  { id: 76, name: "LiaqatPur", name_ur: "لیاقت پور" },
  { id: 77, name: "Lodhran", name_ur: "لودھراں" },
  { id: 78, name: "Mailsi", name_ur: "میلسی" },
  { id: 79, name: "Malakwal", name_ur: "ملکوال" },
  { id: 80, name: "Mamunkanjan", name_ur: "مامون کنجن" },
  { id: 81, name: "Mananwala", name_ur: "منانوالہ" },
  { id: 82, name: "MandiBahaudin", name_ur: "منڈی بہاؤالدین" },
  { id: 83, name: "MianChannu", name_ur: "میاں چنوں" },
  { id: 84, name: "Mianwali", name_ur: "میانوالی" },
  { id: 85, name: "Minchanabad", name_ur: "منچن آباد" },
  { id: 86, name: "Mithatiwana", name_ur: "مٹھاتیوانہ" },
  { id: 87, name: "Multan", name_ur: "ملتان" },
  { id: 88, name: "MultanRoadLahore", name_ur: "ملتان روڈ لاہور" },
  { id: 89, name: "Muridke", name_ur: "مرید کے" },
  { id: 90, name: "MuzafarGhar", name_ur: "مظفر گڑھ" },
  { id: 91, name: "Nankana", name_ur: "ننکانہ" },
  { id: 92, name: "Narangmandi", name_ur: "نارنگ منڈی" },
  { id: 93, name: "Narowal", name_ur: "نارووال" },
  { id: 94, name: "Noshehrawirkan", name_ur: "نوشہرہ وِرکاں" },
  { id: 95, name: "Okara", name_ur: "اوکاڑہ" },
  { id: 96, name: "PakPattan", name_ur: "پاک پتن" },
  { id: 97, name: "Pasroor", name_ur: "پسرور" },
  { id: 98, name: "Patoki", name_ur: "پتوکی" },
  { id: 99, name: "PhoolNagar", name_ur: "پھول نگر" },
  { id: 100, name: "Phularwan", name_ur: "پھلاروان" },
  { id: 101, name: "Pinanwal", name_ur: "پننوال" },
  { id: 102, name: "Pindibhattian", name_ur: "پنڈی بھٹیاں" },
  { id: 103, name: "Piplan", name_ur: "پپلان" },
  { id: 104, name: "PirMahal", name_ur: "پیر محل" },
  { id: 105, name: "Qadirpurrawan", name_ur: "قادرپور راواں" },
  { id: 106, name: "Qiladedarsingh", name_ur: "قلعہ دیدار سنگھ" },
  { id: 107, name: "Quaidabad", name_ur: "قائد آباد" },
  { id: 108, name: "Quetta", name_ur: "کوئٹہ" },
  { id: 109, name: "RahimYarKhan", name_ur: "رحیم یار خان" },
  { id: 110, name: "Raiwind", name_ur: "رائیونڈ" },
  { id: 111, name: "RajanPur", name_ur: "راجن پور" },
  { id: 112, name: "Rawalpindi", name_ur: "راولپنڈی" },
  { id: 113, name: "RenalaKhurd", name_ur: "رینالہ خورد" },
  { id: 114, name: "SadiqAbad", name_ur: "صادق آباد" },
  { id: 115, name: "Safdarabad", name_ur: "صفدر آباد" },
  { id: 116, name: "Sahiwal", name_ur: "ساہیوال" },
  { id: 117, name: "Sambrial", name_ur: "سمبڑیال" },
  { id: 118, name: "Sanglahill", name_ur: "سانگلہ ہل" },
  { id: 119, name: "Sargodha", name_ur: "سرگودھا" },
  { id: 120, name: "Shahjewana", name_ur: "شاہ جیوانہ" },
  { id: 121, name: "ShahrSultan", name_ur: "شہر سلطان" },
  { id: 122, name: "Shakargarh", name_ur: "شکرگڑھ" },
  { id: 123, name: "Sheikhupura", name_ur: "شیخوپورہ" },
  { id: 124, name: "Shorkot", name_ur: "شورکوٹ" },
  { id: 125, name: "ShujaAbad", name_ur: "شجاع آباد" },
  { id: 126, name: "Sialkot", name_ur: "سیالکوٹ" },
  { id: 127, name: "Sillanwali", name_ur: "سلانوالی" },
  { id: 128, name: "Sraialamgir", name_ur: "سرائے عالمگیر" },
  { id: 129, name: "Sukheke", name_ur: "سکھیکی" },
  { id: 130, name: "Summandri", name_ur: "سمندری" },
  { id: 131, name: "TALAGANG", name_ur: "تلہ گنگ" },
  { id: 132, name: "Tandlianwala", name_ur: "ٹانڈلیانوالہ" },
  { id: 133, name: "Taunsasharif", name_ur: "ٹونسہ شریف" },
  { id: 134, name: "TTSingh", name_ur: "ٹی ٹی سنگھ" },
  { id: 135, name: "Vehari", name_ur: "وہاڑی" },
  { id: 136, name: "Warberten", name_ur: "واربرٹن" },
  { id: 137, name: "Wazirabad", name_ur: "وزیر آباد" },
  { id: 138, name: "Yazman", name_ur: "یزمان" },
];

const samplePriceData = {
  1: {
    // Wheat
    current: 200,
    highest: 210,
    lowest: 195,
    average: 202,
    history: [
      { date: "2023-01-01", price: 198 },
      { date: "2023-01-02", price: 200 },
      { date: "2023-01-03", price: 205 },
      { date: "2023-01-04", price: 210 },
      { date: "2023-01-05", price: 208 },
      { date: "2023-01-06", price: 202 },
      { date: "2023-01-07", price: 200 },
      { date: "2023-01-08", price: 195 },
      { date: "2023-01-09", price: 197 },
      { date: "2023-01-10", price: 200 },
    ],
    forecast: [
      { date: "2023-01-11", price: 201, confidence: [198, 204] },
      { date: "2023-01-12", price: 203, confidence: [199, 207] },
      { date: "2023-01-13", price: 205, confidence: [200, 210] },
      { date: "2023-01-14", price: 204, confidence: [198, 210] },
      { date: "2023-01-15", price: 202, confidence: [196, 208] },
      { date: "2023-01-16", price: 200, confidence: [194, 206] },
      { date: "2023-01-17", price: 198, confidence: [192, 204] },
    ],
  },
  2: {
    // Rice
    current: 150,
    highest: 160,
    lowest: 145,
    average: 152,
    history: [
      { date: "2023-01-01", price: 148 },
      { date: "2023-01-02", price: 150 },
      { date: "2023-01-03", price: 155 },
      { date: "2023-01-04", price: 160 },
      { date: "2023-01-05", price: 158 },
      { date: "2023-01-06", price: 152 },
      { date: "2023-01-07", price: 150 },
      { date: "2023-01-08", price: 145 },
      { date: "2023-01-09", price: 147 },
      { date: "2023-01-10", price: 150 },
    ],
    forecast: [
      { date: "2023-01-11", price: 151, confidence: [148, 154] },
      { date: "2023-01-12", price: 153, confidence: [149, 157] },
      { date: "2023-01-13", price: 155, confidence: [150, 160] },
      { date: "2023-01-14", price: 154, confidence: [148, 160] },
      { date: "2023-01-15", price: 152, confidence: [146, 158] },
      { date: "2023-01-16", price: 150, confidence: [144, 156] },
      { date: "2023-01-17", price: 148, confidence: [142, 154] },
    ],
  },
};

// Sample alerts data
const sampleAlerts = [
  {
    id: "1",
    commodityId: 1,
    priceThreshold: 205,
    condition: "above",
    notificationMethods: {
      push: true,
      sms: false,
      email: true,
    },
    isEnabled: true,
    createdAt: "2023-01-05T10:30:00Z",
  },
  {
    id: "2",
    commodityId: 2,
    priceThreshold: 140,
    condition: "below",
    notificationMethods: {
      push: true,
      sms: true,
      email: false,
    },
    isEnabled: false,
    createdAt: "2023-01-07T14:15:00Z",
  },
  {
    id: "3",
    commodityId: 1,
    priceThreshold: 190,
    condition: "below",
    notificationMethods: {
      push: true,
      sms: false,
      email: false,
    },
    triggered: true,
    triggeredAt: "2023-01-09T09:45:00Z",
    triggerPrice: 188,
    createdAt: "2023-01-08T16:20:00Z",
  },
];

// Sample notifications data
const sampleNotifications = [
  {
    id: "1",
    title: "Price Alert Triggered",
    message: "Wheat price has risen above your alert threshold of PKR 205.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    type: "alert",
    commodityId: 1,
  },
  {
    id: "2",
    title: "New Market Report Available",
    message:
      "The monthly market analysis report for agricultural commodities is now available.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    type: "system",
  },
  {
    id: "3",
    title: "Price Alert Triggered",
    message: "Rice price has fallen below your alert threshold of PKR 140.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    read: false,
    type: "alert",
    commodityId: 2,
  },
  {
    id: "4",
    title: "App Update Available",
    message:
      "A new version of Zameen Zarien is available with improved features and bug fixes.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    read: true,
    type: "update",
  },
  {
    id: "5",
    title: "Welcome to Zameen Zarien",
    message:
      "Thank you for joining Zameen Zarien. Start monitoring commodity prices and set up alerts.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    read: true,
    type: "system",
  },
];

// Provider component
export const AppProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(i18n.language);
  const [selectedCommodity, setSelectedCommodity] = useState(1); // Default to Wheat
  const [selectedLocation, setSelectedLocation] = useState(1); // Default to Lahore
  const [timePeriod, setTimePeriod] = useState("week"); // 'day', 'week', 'month', 'year'
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }

        const savedLanguage = await AsyncStorage.getItem("language");
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }

        const savedAlerts = await AsyncStorage.getItem("alerts");
        if (savedAlerts) {
          setAlerts(JSON.parse(savedAlerts));
        }

        const savedNotifications = await AsyncStorage.getItem("notifications");
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }

        const dndStatus = await AsyncStorage.getItem("doNotDisturb");
        if (dndStatus) {
          setDoNotDisturb(JSON.parse(dndStatus));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [i18n]);

  // Save user data to AsyncStorage when it changes
  useEffect(() => {
    if (user) {
      AsyncStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Save language preference when it changes
  useEffect(() => {
    AsyncStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Save alerts when they change
  useEffect(() => {
    AsyncStorage.setItem("alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Save notifications when they change
  useEffect(() => {
    AsyncStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Save Do Not Disturb status when it changes
  useEffect(() => {
    AsyncStorage.setItem("doNotDisturb", JSON.stringify(doNotDisturb));
  }, [doNotDisturb]);

  // Login function
  const login = async (phoneNumber, password) => {
    console.log("Starting login process...");
    console.log("Phone number:", phoneNumber);
    setIsLoading(true);
    try {
      console.log("Making API request to login endpoint...");
      const response = await fetch(
        "http://localhost:8000/auth/password-login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: phoneNumber,
            password: password,
          }),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        console.error("Login failed:", data.error);
        throw new Error(data.error || "Login failed");
      }

      console.log("Login successful, storing token and user data...");
      // Store token and user data
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      console.log("Updating app state with user data...");
      setUser(data.user);
      console.log("Login process completed successfully");
      return { success: true };
    } catch (error) {
      console.error("Error during login:", error);
      return { success: false, error: error.message };
    } finally {
      console.log("Cleaning up loading state...");
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear user data
      await AsyncStorage.removeItem("user");
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Get commodity data
  const getCommodityData = (commodityId) => {
    return samplePriceData[commodityId] || null;
  };

  // Add alert
  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...alert,
    };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    return newAlert;
  };

  // Update alert
  const updateAlert = (alertId, updatedData) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, ...updatedData } : alert
      )
    );
  };

  // Delete alert
  const deleteAlert = (alertId) => {
    setAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== alertId)
    );
  };

  // Toggle Do Not Disturb
  const toggleDoNotDisturb = () => {
    setDoNotDisturb((prev) => !prev);
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  // Context value
  const value = {
    user,
    isLoading,
    language,
    selectedCommodity,
    setSelectedCommodity,
    selectedLocation,
    setSelectedLocation,
    timePeriod,
    setTimePeriod,
    alerts,
    notifications,
    doNotDisturb,
    login,
    logout,
    changeLanguage,
    getCommodityData,
    addAlert,
    updateAlert,
    deleteAlert,
    toggleDoNotDisturb,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    commodities: sampleCommodities,
    locations: sampleLocations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
