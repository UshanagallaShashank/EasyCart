// Languages: English, Telugu and Hindi. The English sentence itself is the key, so screens write t('Add to cart')
// and anything without a translation simply shows in English.
// The Telugu and Hindi below should be read by a native speaker before release.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLocal, setLocal } from './storage';

export type Language = 'en' | 'te' | 'hi';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' }
];

// [English, Telugu, Hindi]. {name} marks a value that is filled in later.
const WORDS: [string, string, string][] = [
  // Tabs and page titles
  ['Shop', 'షాప్', 'दुकान'],
  ['Cart', 'కార్ట్', 'कार्ट'],
  ['My orders', 'నా ఆర్డర్లు', 'मेरे ऑर्डर'],
  ['Orders', 'ఆర్డర్లు', 'ऑर्डर'],
  ['Account', 'ఖాతా', 'खाता'],
  ['Product', 'ఉత్పత్తి', 'उत्पाद'],
  ['Checkout', 'చెక్అవుట్', 'चेकआउट'],
  ['Order', 'ఆర్డర్', 'ऑर्डर'],
  ['Delivery addresses', 'డెలివరీ చిరునామాలు', 'डिलीवरी पते'],
  ['Request a store', 'స్టోర్ కోసం అభ్యర్థన', 'स्टोर का अनुरोध'],
  ['Shops near you', 'మీ దగ్గరి షాపులు', 'आपके पास की दुकानें'],
  ['Order placed', 'ఆర్డర్ చేయబడింది', 'ऑर्डर हो गया'],

  // Home
  ['Deliver to', 'డెలివరీ చిరునామా', 'यहाँ डिलीवर करें'],
  ['Add a delivery address', 'డెలివరీ చిరునామా జోడించండి', 'डिलीवरी पता जोड़ें'],
  ['Welcome to', 'స్వాగతం', 'स्वागत है'],
  ['Shop now', 'ఇప్పుడే కొనండి', 'अभी खरीदें'],
  ['Categories', 'వర్గాలు', 'श्रेणियाँ'],
  ['See all', 'అన్నీ చూడండి', 'सब देखें'],
  ['All', 'అన్నీ', 'सभी'],
  ['Favourites', 'ఇష్టమైనవి', 'पसंदीदा'],
  ['Price: low to high', 'ధర: తక్కువ నుండి ఎక్కువ', 'कीमत: कम से ज़्यादा'],
  ['Price: high to low', 'ధర: ఎక్కువ నుండి తక్కువ', 'कीमत: ज़्यादा से कम'],
  ['All products', 'అన్ని ఉత్పత్తులు', 'सभी उत्पाद'],
  ['Order again', 'మళ్ళీ ఆర్డర్ చేయండి', 'दोबारा ऑर्डर करें'],
  ['From your past orders', 'మీ గత ఆర్డర్ల నుండి', 'आपके पिछले ऑर्डर से'],
  ['Your favourites', 'మీ ఇష్టమైనవి', 'आपके पसंदीदा'],
  ['Almost gone', 'దాదాపు అయిపోయాయి', 'लगभग खत्म'],
  ['Grab them before they sell out', 'అయిపోయే ముందే తీసుకోండి', 'खत्म होने से पहले ले लें'],
  ['Recently viewed', 'ఇటీవల చూసినవి', 'हाल ही में देखे गए'],
  ['Search products', 'ఉత్పత్తులను వెతకండి', 'उत्पाद खोजें'],
  ['Tap the heart on a product to save it here.', 'ఉత్పత్తిపై హార్ట్ నొక్కితే ఇక్కడ భద్రపరచబడుతుంది.', 'किसी उत्पाद पर दिल दबाएँ, वह यहाँ सेव हो जाएगा।'],
  ['This shop has no products yet.', 'ఈ షాపులో ఇంకా ఉత్పత్తులు లేవు.', 'इस दुकान में अभी कोई उत्पाद नहीं है।'],
  ['Find shops near me', 'నా దగ్గరి షాపులను కనుగొనండి', 'मेरे पास की दुकानें खोजें'],
  ['Delivering to {zip}', '{zip} కు డెలివరీ', '{zip} पर डिलीवरी'],

  // Product card and page
  ['ADD', 'చేర్చు', 'जोड़ें'],
  ['Sold out', 'అయిపోయింది', 'खत्म हो गया'],
  ['From', 'నుండి', 'से'],
  ['Only {n} left', 'కేవలం {n} మిగిలాయి', 'सिर्फ़ {n} बचे हैं'],
  ['{n} option', '{n} ఎంపిక', '{n} विकल्प'],
  ['{n} options', '{n} ఎంపికలు', '{n} विकल्प'],
  ['Add to cart', 'కార్ట్‌లో వేయండి', 'कार्ट में डालें'],
  ['Choose an option', 'ఒక ఎంపికను ఎంచుకోండి', 'एक विकल्प चुनें'],
  ['Out of stock', 'స్టాక్ లేదు', 'स्टॉक में नहीं'],
  ['View cart', 'కార్ట్ చూడండి', 'कार्ट देखें'],
  ['Quantity', 'పరిమాణం', 'मात्रा'],
  ['In Stock', 'స్టాక్‌లో ఉంది', 'स्टॉक में है'],
  ['{name} added to cart', '{name} కార్ట్‌లో చేర్చబడింది', '{name} कार्ट में जोड़ा गया'],

  // Cart
  ['{count} product in your cart', 'మీ కార్ట్‌లో {count} ఉత్పత్తి', 'आपके कार्ट में {count} उत्पाद'],
  ['{count} products in your cart', 'మీ కార్ట్‌లో {count} ఉత్పత్తులు', 'आपके कार्ट में {count} उत्पाद'],
  ['Clear cart', 'కార్ట్ ఖాళీ చేయండి', 'कार्ट खाली करें'],
  ['Subtotal', 'ఉప మొత్తం', 'उप-योग'],
  ['Delivery fee and coupon are added at checkout.', 'డెలివరీ ఛార్జీ మరియు కూపన్ చెక్అవుట్‌లో జోడించబడతాయి.', 'डिलीवरी शुल्क और कूपन चेकआउट पर जुड़ेंगे।'],
  ['Browse products', 'ఉత్పత్తులను చూడండి', 'उत्पाद देखें'],
  ['Max available', 'గరిష్టంగా అందుబాటులో ఉంది', 'अधिकतम उपलब्ध'],
  ['Your cart is empty. Add something you like and it will show up here.', 'మీ కార్ట్ ఖాళీగా ఉంది. మీకు నచ్చినది జోడిస్తే ఇక్కడ కనిపిస్తుంది.', 'आपका कार्ट खाली है। कुछ पसंद का जोड़ें, वह यहाँ दिखेगा।'],

  // Checkout
  ['How do you want it?', 'మీకు ఎలా కావాలి?', 'आपको कैसे चाहिए?'],
  ['Delivery', 'డెలివరీ', 'डिलीवरी'],
  ['Pick up', 'స్వయంగా తీసుకోవడం', 'खुद लेना'],
  ['Free', 'ఉచితం', 'मुफ़्त'],
  ['Change', 'మార్చండి', 'बदलें'],
  ['Add delivery address', 'డెలివరీ చిరునామా జోడించండి', 'डिलीवरी पता जोड़ें'],
  ['Coupon', 'కూపన్', 'कूपन'],
  ['Apply', 'వర్తింపజేయండి', 'लागू करें'],
  ['Bill', 'బిల్లు', 'बिल'],
  ['Items', 'వస్తువులు', 'सामान'],
  ['Delivery fee', 'డెలివరీ ఛార్జీ', 'डिलीवरी शुल्क'],
  ['Total', 'మొత్తం', 'कुल'],
  ['Pay in cash when you receive your order.', 'ఆర్డర్ అందుకున్నప్పుడు నగదు చెల్లించండి.', 'ऑर्डर मिलने पर नकद भुगतान करें।'],
  ['Place order', 'ఆర్డర్ చేయండి', 'ऑर्डर करें'],
  ['Remove', 'తొలగించండి', 'हटाएँ'],

  // Orders and account
  ['Spent', 'ఖర్చు', 'खर्च'],
  ['Saved', 'ఆదా', 'बचत'],
  ['You have not ordered anything yet.', 'మీరు ఇంకా ఏమీ ఆర్డర్ చేయలేదు.', 'आपने अभी तक कुछ ऑर्डर नहीं किया है।'],
  ['Start shopping', 'షాపింగ్ ప్రారంభించండి', 'खरीदारी शुरू करें'],
  ['My orders', 'నా ఆర్డర్లు', 'मेरे ऑर्डर'],
  ['Customer support', 'కస్టమర్ సపోర్ట్', 'ग्राहक सहायता'],
  ['Shops', 'షాపులు', 'दुकानें'],
  ['Log out', 'లాగ్ అవుట్', 'लॉग आउट'],
  ['Open now', 'ఇప్పుడు తెరిచి ఉంది', 'अभी खुला है'],
  ['Open a shop by its code', 'కోడ్‌తో షాపును తెరవండి', 'कोड से दुकान खोलें'],
  ['Language', 'భాష', 'भाषा'],

  // Popups
  ['Log out?', 'లాగ్ అవుట్ చేయాలా?', 'लॉग आउट करें?'],
  ['Stay signed in', 'సైన్ ఇన్‌లో ఉండండి', 'साइन इन रहें'],
  ['You will need to sign in again to use the app.', 'యాప్ వాడటానికి మళ్ళీ సైన్ ఇన్ చేయాలి.', 'ऐप इस्तेमाल करने के लिए दोबारा साइन इन करना होगा।'],
  ['Clear your cart?', 'మీ కార్ట్ ఖాళీ చేయాలా?', 'अपना कार्ट खाली करें?'],
  ['Keep items', 'వస్తువులను ఉంచండి', 'सामान रखें'],
  ['Cancel this order?', 'ఈ ఆర్డర్ రద్దు చేయాలా?', 'यह ऑर्डर रद्द करें?'],
  ['Keep my order', 'నా ఆర్డర్ ఉంచండి', 'मेरा ऑर्डर रखें'],
  ['Yes, cancel order', 'అవును, ఆర్డర్ రద్దు చేయండి', 'हाँ, ऑर्डर रद्द करें'],
  ['Not now', 'ఇప్పుడు కాదు', 'अभी नहीं'],

  // After ordering
  ['Order placed!', 'ఆర్డర్ చేయబడింది!', 'ऑर्डर हो गया!'],
  ['Track my order', 'నా ఆర్డర్‌ను ట్రాక్ చేయండి', 'मेरा ऑर्डर ट्रैक करें'],
  ['Keep shopping', 'షాపింగ్ కొనసాగించండి', 'खरीदारी जारी रखें'],

  // Shops near you
  ['Where are you?', 'మీరు ఎక్కడ ఉన్నారు?', 'आप कहाँ हैं?'],
  ['Use my current location', 'నా ప్రస్తుత లొకేషన్ వాడండి', 'मेरा मौजूदा स्थान इस्तेमाल करें'],
  ['Delivers to you', 'మీకు డెలివరీ చేస్తుంది', 'आप तक डिलीवरी करता है'],
  ['Pickup only', 'తీసుకోవడం మాత్రమే', 'सिर्फ़ खुद लेना'],

  // More words, found by scanning every customer screen
  ["Change delivery address", "డెలివరీ చిరునామా మార్చండి", "डिलीवरी पता बदलें"],
  ["Choose another shop", "మరో షాపును ఎంచుకోండి", "दूसरी दुकान चुनें"],
  ["Try again", "మళ్ళీ ప్రయత్నించండి", "फिर से कोशिश करें"],
  ["More", "మరిన్ని", "ज़्यादा"],
  ["Less", "తక్కువ", "कम"],
  ["Helpline, live assistance & FAQs", "హెల్ప్‌లైన్, లైవ్ సహాయం & తరచుగా అడిగే ప్రశ్నలు", "हेल्पलाइन, लाइव सहायता और सामान्य प्रश्न"],
  ["Home, work and other places you order to", "ఇల్లు, ఆఫీస్ మరియు మీరు ఆర్డర్ చేసే ఇతర చోట్లు", "घर, ऑफिस और दूसरी जगहें जहाँ आप ऑर्डर मँगाते हैं"],
  ["Open", "తెరవండి", "खोलें"],
  ["Track, reorder and see what you saved", "ట్రాక్ చేయండి, మళ్ళీ ఆర్డర్ చేయండి, ఎంత ఆదా చేశారో చూడండి", "ट्रैक करें, दोबारा ऑर्डर करें और देखें कितनी बचत हुई"],
  ["Add a delivery address to continue.", "కొనసాగడానికి డెలివరీ చిరునామా జోడించండి.", "आगे बढ़ने के लिए डिलीवरी पता जोड़ें।"],
  ["Code", "కోడ్", "कोड"],
  ["Could not place the order", "ఆర్డర్ చేయలేకపోయాము", "ऑर्डर नहीं हो सका"],
  ["Coupon applied", "కూపన్ వర్తింపజేయబడింది", "कूपन लागू हो गया"],
  ["Coupon not valid", "కూపన్ చెల్లదు", "कूपन मान्य नहीं है"],
  ["Order placed", "ఆర్డర్ చేయబడింది", "ऑर्डर हो गया"],
  ["Your cart is empty, so there is nothing to check out.", "మీ కార్ట్ ఖాళీగా ఉంది, కాబట్టి చెక్అవుట్ చేయడానికి ఏమీ లేదు.", "आपका कार्ट खाली है, इसलिए चेकआउट के लिए कुछ नहीं है।"],
  ["No shops near this spot yet. Try moving the pin, or ask your local shop to join.", "ఈ ప్రదేశం దగ్గర ఇంకా షాపులు లేవు. పిన్ను కదిపి చూడండి, లేదా మీ స్థానిక షాపును చేరమని అడగండి.", "इस जगह के पास अभी कोई दुकान नहीं है। पिन हिलाकर देखें, या अपनी स्थानीय दुकान से जुड़ने को कहें।"],
  ["Tap the map or drag the pin to choose where you are. Blue dots are shops.", "మీరు ఎక్కడ ఉన్నారో ఎంచుకోవడానికి మ్యాప్‌ను నొక్కండి లేదా పిన్నును లాగండి. నీలం చుక్కలు షాపులు.", "आप कहाँ हैं यह चुनने के लिए नक्शे पर टैप करें या पिन खींचें। नीले बिंदु दुकानें हैं।"],
  ["Using your current location.", "మీ ప్రస్తుత లొకేషన్ వాడుతున్నాము.", "आपका मौजूदा स्थान इस्तेमाल हो रहा है।"],
  ["Using the spot you picked on the map.", "మీరు మ్యాప్‌లో ఎంచుకున్న స్థలాన్ని వాడుతున్నాము.", "आपके नक्शे पर चुने गए स्थान का इस्तेमाल हो रहा है।"],
  ["Share your location to see shops close to you.", "మీ దగ్గరి షాపులు చూడటానికి మీ లొకేషన్ పంచుకోండి.", "अपने पास की दुकानें देखने के लिए अपना स्थान साझा करें।"],
  ["Finding you…", "మిమ్మల్ని వెతుకుతున్నాము…", "आपको ढूँढ रहे हैं…"],
  ["Code ready", "కోడ్ సిద్ధంగా ఉంది", "कोड तैयार है"],
  ["Placed", "ఆర్డర్ చేశారు", "ऑर्डर किया"],
  ["Confirmed", "నిర్ధారించబడింది", "पुष्टि हो गई"],
  ["Completed", "పూర్తయింది", "पूरा हुआ"],
  ["Cancelled", "రద్దు చేయబడింది", "रद्द"],
  ["10-digit mobile number", "10 అంకెల మొబైల్ నంబర్", "10 अंकों का मोबाइल नंबर"],
  ["Active address", "ప్రస్తుత చిరునామా", "चालू पता"],
  ["Add new address", "కొత్త చిరునామా జోడించండి", "नया पता जोड़ें"],
  ["Address removed", "చిరునామా తొలగించబడింది", "पता हटा दिया गया"],
  ["Address type", "చిరునామా రకం", "पते का प्रकार"],
  ["Address updated", "చిరునామా నవీకరించబడింది", "पता अपडेट हो गया"],
  ["Address added and set as active", "చిరునామా జోడించబడి, ప్రస్తుతంగా సెట్ అయింది", "पता जुड़ गया और चालू कर दिया गया"],
  ["Cancel", "రద్దు చేయండి", "रद्द करें"],
  ["City", "నగరం", "शहर"],
  ["Contact phone", "సంప్రదింపు ఫోన్", "संपर्क फ़ोन"],
  ["Contact phone must be exactly 10 digits", "ఫోన్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి", "फ़ोन नंबर ठीक 10 अंकों का होना चाहिए"],
  ["Edit", "సవరించండి", "बदलें"],
  ["Edit delivery address", "డెలివరీ చిరునామా సవరించండి", "डिलीवरी पता बदलें"],
  ["New delivery address", "కొత్త డెలివరీ చిరునామా", "नया डिलीवरी पता"],
  ["Enter the building and street", "భవనం మరియు వీధి నమోదు చేయండి", "इमारत और गली दर्ज करें"],
  ["Enter the city", "నగరం నమోదు చేయండి", "शहर दर्ज करें"],
  ["Enter the state", "రాష్ట్రం నమోదు చేయండి", "राज्य दर्ज करें"],
  ["Finding where to open the map…", "మ్యాప్ ఎక్కడ తెరవాలో వెతుకుతున్నాము…", "नक्शा कहाँ खोलना है यह ढूँढ रहे हैं…"],
  ["Landmark (optional)", "గుర్తు (ఐచ్ఛికం)", "लैंडमार्क (वैकल्पिक)"],
  ["No saved addresses yet. Add one to check out faster.", "ఇంకా సేవ్ చేసిన చిరునామాలు లేవు. త్వరగా చెక్అవుట్ కోసం ఒకటి జోడించండి.", "अभी कोई सेव पता नहीं है। जल्दी चेकआउट के लिए एक जोड़ें।"],
  ["Or type the address by hand below.", "లేదా క్రింద చిరునామాను చేతితో టైప్ చేయండి.", "या नीचे पता हाथ से लिखें।"],
  ["Pincode", "పిన్‌కోడ్", "पिन कोड"],
  ["Pincode must be 6 digits", "పిన్‌కోడ్ 6 అంకెలు ఉండాలి", "पिन कोड 6 अंकों का होना चाहिए"],
  ["Recipient name", "స్వీకర్త పేరు", "पाने वाले का नाम"],
  ["Recipient name must be at least 3 letters", "స్వీకర్త పేరు కనీసం 3 అక్షరాలు ఉండాలి", "पाने वाले का नाम कम से कम 3 अक्षर का हो"],
  ["Saved the spot, but could not read the address. Please type it in.", "స్థలం సేవ్ చేయబడింది, కానీ చిరునామా చదవలేకపోయాము. దయచేసి టైప్ చేయండి.", "जगह सेव हो गई, पर पता पढ़ नहीं सके। कृपया खुद लिखें।"],
  ["Shop / building and street", "షాప్ / భవనం మరియు వీధి", "दुकान / इमारत और गली"],
  ["Spot saved. Check the address below.", "స్థలం సేవ్ చేయబడింది. క్రింది చిరునామాను చూడండి.", "जगह सेव हो गई। नीचे का पता जाँचें।"],
  ["State", "రాష్ట్రం", "राज्य"],
  ["Use this", "దీన్ని వాడండి", "इसे इस्तेमाल करें"],
  ["We could not find your location", "మీ లొకేషన్ కనుగొనలేకపోయాము", "हम आपका स्थान नहीं ढूँढ सके"],
  ["Where should we deliver?", "మేము ఎక్కడ డెలివరీ చేయాలి?", "हम कहाँ डिलीवर करें?"],
  ["Use my location", "నా లొకేషన్ వాడండి", "मेरा स्थान इस्तेमाल करें"],
  ["Pick on map", "మ్యాప్‌లో ఎంచుకోండి", "नक्शे पर चुनें"],
  ["Hide map", "మ్యాప్ దాచండి", "नक्शा छुपाएँ"],
  ["Update address", "చిరునామా నవీకరించండి", "पता अपडेट करें"],
  ["Save and use", "సేవ్ చేసి వాడండి", "सेव करके इस्तेमाल करें"],
  ["Tap again to remove", "తొలగించడానికి మళ్ళీ నొక్కండి", "हटाने के लिए फिर टैप करें"],
  ["Home", "ఇల్లు", "घर"],
  ["Work", "ఆఫీస్", "ऑफिस"],
  ["Other", "ఇతర", "अन्य"],
  ["Cancel order", "ఆర్డర్ రద్దు చేయండి", "ऑर्डर रद्द करें"],
  ["Check the name, photo and number plate match the person at your door.", "మీ తలుపు వద్ద ఉన్న వ్యక్తి పేరు, ఫోటో మరియు నంబర్ ప్లేట్ సరిపోతున్నాయో చూడండి.", "देखें कि आपके दरवाज़े पर खड़े व्यक्ति का नाम, फोटो और नंबर प्लेट मेल खाते हैं।"],
  ["Delivering to", "డెలివరీ చిరునామా", "यहाँ डिलीवरी"],
  ["Order cancelled", "ఆర్డర్ రద్దు చేయబడింది", "ऑर्डर रद्द हो गया"],
  ["Order progress", "ఆర్డర్ పురోగతి", "ऑर्डर की स्थिति"],
  ["Share it only after you have your order in hand. Never share it on a call.", "ఆర్డర్ చేతికి వచ్చాకే చెప్పండి. ఫోన్ కాల్‌లో ఎప్పుడూ చెప్పకండి.", "ऑर्डर हाथ में आने के बाद ही बताएँ। फ़ोन कॉल पर कभी न बताएँ।"],
  ["Summary", "సారాంశం", "सारांश"],
  ["We could not find this order.", "ఈ ఆర్డర్ కనుగొనలేకపోయాము.", "यह ऑर्डर नहीं मिला।"],
  ["Where is my order?", "నా ఆర్డర్ ఎక్కడ ఉంది?", "मेरा ऑर्डर कहाँ है?"],
  ["YOUR DELIVERY CODE", "మీ డెలివరీ కోడ్", "आपका डिलीवरी कोड"],
  ["Your code was entered wrong too many times, so it is locked. The store will give you a new one.", "మీ కోడ్ చాలాసార్లు తప్పుగా నమోదు చేయబడింది, కాబట్టి లాక్ అయింది. షాపు మీకు కొత్తది ఇస్తుంది.", "आपका कोड कई बार गलत डाला गया, इसलिए लॉक हो गया है। दुकान आपको नया कोड देगी।"],
  ["Delivered by", "డెలివరీ చేసినవారు", "डिलीवरी करने वाले"],
  ["Your delivery partner", "మీ డెలివరీ భాగస్వామి", "आपका डिलीवरी पार्टनर"],
  ["Delivering to", "డెలివరీ చిరునామా", "यहाँ डिलीवरी"],
  ["Packing", "ప్యాకింగ్", "पैकिंग"],
  ["Finding a rider", "రైడర్ కోసం వెతుకుతున్నాము", "राइडर ढूँढ रहे हैं"],
  ["Rider picking up", "రైడర్ ఆర్డర్ తీసుకుంటున్నారు", "राइडर ऑर्डर ले रहा है"],
  ["Out for delivery", "డెలివరీకి బయలుదేరింది", "डिलीवरी के लिए निकला"],
  ["Delivered", "డెలివరీ అయింది", "डिलीवर हो गया"],
  ["The store is getting your order ready", "షాపు మీ ఆర్డర్‌ను సిద్ధం చేస్తోంది", "दुकान आपका ऑर्डर तैयार कर रही है"],
  ["Looking for the nearest delivery partner", "దగ్గరలోని డెలివరీ భాగస్వామి కోసం వెతుకుతున్నాము", "सबसे पास के डिलीवरी पार्टनर को ढूँढ रहे हैं"],
  ["Your rider is heading to the store", "మీ రైడర్ షాపుకు వెళ్తున్నారు", "आपका राइडर दुकान की ओर जा रहा है"],
  ["Your order is on its way to you", "మీ ఆర్డర్ మీ వద్దకు వస్తోంది", "आपका ऑर्डर आपके पास आ रहा है"],
  ["Enjoy your order", "మీ ఆర్డర్‌ను ఆస్వాదించండి", "अपने ऑर्डर का आनंद लें"],
  ["Waiting for the store to confirm", "షాపు నిర్ధారించడానికి వేచి ఉంది", "दुकान की पुष्टि का इंतज़ार"],
  ["Being packed", "ప్యాక్ చేస్తున్నారు", "पैक हो रहा है"],
  ["Ready for pickup", "తీసుకోవడానికి సిద్ధం", "लेने के लिए तैयार"],
  ["Collected", "తీసుకున్నారు", "ले लिया गया"],
  ["Go to the store and show your order", "షాపుకు వెళ్లి మీ ఆర్డర్ చూపించండి", "दुकान पर जाकर अपना ऑर्डर दिखाएँ"],
  ["Cash collected by rider:", "రైడర్ వసూలు చేసిన నగదు:", "राइडर द्वारा लिया गया नकद:"],
  ["No delivery photo", "డెలివరీ ఫోటో లేదు", "डिलीवरी की फोटो नहीं है"],
  ["Delivery or in-store pickup at checkout", "చెక్అవుట్‌లో డెలివరీ లేదా షాపులో తీసుకోవడం", "चेकआउट पर डिलीवरी या दुकान से लेना"],
  ["Secure checkout, code-verified handover", "సురక్షిత చెక్అవుట్, కోడ్‌తో ధృవీకరించిన అప్పగింత", "सुरक्षित चेकआउट, कोड से सत्यापित हैंडओवर"],
  ["This product is no longer available.", "ఈ ఉత్పత్తి ఇక అందుబాటులో లేదు.", "यह उत्पाद अब उपलब्ध नहीं है।"],
  ["Become a delivery partner", "డెలివరీ భాగస్వామి అవ్వండి", "डिलीवरी पार्टनर बनें"],
  ["Create an account", "ఖాతా సృష్టించండి", "खाता बनाएँ"],
  ["Email address", "ఇమెయిల్ చిరునామా", "ईमेल पता"],
  ["New here?", "కొత్తవారా?", "नए हैं?"],
  ["Password", "పాస్‌వర్డ్", "पासवर्ड"],
  ["Ride a bike?", "బైక్ నడుపుతారా?", "बाइक चलाते हैं?"],
  ["Sign in", "సైన్ ఇన్", "साइन इन"],
  ["Sign in to Easy Cart", "ఈజీ కార్ట్‌కు సైన్ ఇన్ చేయండి", "ईज़ी कार्ट में साइन इन करें"],
  ["Sign-in failed", "సైన్ ఇన్ విఫలమైంది", "साइन इन नहीं हो सका"],
  ["Your effortless shopping companion.", "మీ సులభమైన షాపింగ్ తోడు.", "आपका आसान खरीदारी साथी।"],
  ["Already have an account?", "ఇప్పటికే ఖాతా ఉందా?", "पहले से खाता है?"],
  ["Create account", "ఖాతా సృష్టించండి", "खाता बनाएँ"],
  ["Create your account", "మీ ఖాతాను సృష్టించండి", "अपना खाता बनाएँ"],
  ["Email", "ఇమెయిల్", "ईमेल"],
  ["Letters, numbers, _", "అక్షరాలు, అంకెలు, _", "अक्षर, अंक, _"],
  ["Log in", "లాగిన్", "लॉग इन"],
  ["Mobile number", "మొబైల్ నంబర్", "मोबाइल नंबर"],
  ["Shop from independent stores near you.", "మీ దగ్గరి స్వతంత్ర షాపుల నుండి కొనండి.", "अपने पास की स्वतंत्र दुकानों से खरीदें।"],
  ["Sign-up failed", "సైన్ అప్ విఫలమైంది", "साइन अप नहीं हो सका"],
  ["Username", "యూజర్‌నేమ్", "यूज़रनेम"],
  ["10 digits", "10 అంకెలు", "10 अंक"],
  ["Call Helpline", "హెల్ప్‌లైన్‌కు కాల్ చేయండి", "हेल्पलाइन पर कॉल करें"],
  ["Close", "మూసివేయండి", "बंद करें"],
  ["Customer Support", "కస్టమర్ సపోర్ట్", "ग्राहक सहायता"],
  ["Email Us", "మాకు ఇమెయిల్ చేయండి", "हमें ईमेल करें"],
  ["Frequently Asked Questions", "తరచుగా అడిగే ప్రశ్నలు", "अक्सर पूछे जाने वाले प्रश्न"],
  ["Quick reply within 15 mins", "15 నిమిషాల్లో త్వరిత సమాధానం", "15 मिनट में जल्दी जवाब"],
  ["Toll-free • Available 24/7", "టోల్-ఫ్రీ • 24/7 అందుబాటులో", "टोल-फ्री • 24/7 उपलब्ध"],
  ["We're always here to help you with your groceries and deliveries.", "మీ సరుకులు మరియు డెలివరీలలో సహాయం చేయడానికి మేము ఎల్లప్పుడూ ఇక్కడ ఉన్నాము.", "आपके किराने और डिलीवरी में मदद के लिए हम हमेशा यहाँ हैं।"],
  ["All caught up!", "అన్నీ చూసేశారు!", "सब देख लिया!"],
  ["Explore fresh groceries and products from your local store with instant delivery.", "మీ స్థానిక షాపు నుండి తాజా సరుకులు మరియు ఉత్పత్తులను తక్షణ డెలివరీతో చూడండి.", "अपनी स्थानीय दुकान से ताज़ा किराना और उत्पाद तुरंत डिलीवरी के साथ देखें।"],
  ["Notifications", "నోటిఫికేషన్లు", "सूचनाएँ"],
  ["Welcome to EasyCart!", "ఈజీకార్ట్‌కు స్వాగతం!", "ईज़ीकार्ट में आपका स्वागत है!"],
  ["You have no pending order alerts.", "మీకు పెండింగ్ ఆర్డర్ అలర్ట్‌లు లేవు.", "आपके कोई लंबित ऑर्डर अलर्ट नहीं हैं।"],
  ["Request to create a store", "స్టోర్ సృష్టించమని అభ్యర్థన", "स्टोर बनाने का अनुरोध"],
  ["View profile", "ప్రొఫైల్ చూడండి", "प्रोफ़ाइल देखें"],
  ["Add a comment (optional)", "వ్యాఖ్య జోడించండి (ఐచ్ఛికం)", "टिप्पणी जोड़ें (वैकल्पिक)"],
  ["How was your order?", "మీ ఆర్డర్ ఎలా ఉంది?", "आपका ऑर्डर कैसा रहा?"],
  ["Submit rating", "రేటింగ్ పంపండి", "रेटिंग भेजें"],
  ["Thanks for rating", "రేటింగ్ ఇచ్చినందుకు ధన్యవాదాలు", "रेटिंग के लिए धन्यवाद"],
  ["Thanks for your feedback.", "మీ అభిప్రాయానికి ధన్యవాదాలు.", "आपकी प्रतिक्रिया के लिए धन्यवाद।"],
  ["The delivery", "డెలివరీ", "डिलीवरी"],
  ["The store", "షాపు", "दुकान"],
  ["Your rating", "మీ రేటింగ్", "आपकी रेटिंग"],
  ["Store", "షాపు", "दुकान"],
  ["Poor", "బాగాలేదు", "खराब"],
  ["Could be better", "ఇంకా బాగుండాలి", "और बेहतर हो सकता है"],
  ["Okay", "పరవాలేదు", "ठीक"],
  ["Good", "బాగుంది", "अच्छा"],
  ["Excellent", "అద్భుతం", "बेहतरीन"],
  ["Each shop keeps its own cart.", "ప్రతి షాపుకు దాని సొంత కార్ట్ ఉంటుంది.", "हर दुकान का अपना कार्ट रहता है।"],
  ["Shops you order from will show up here.", "మీరు ఆర్డర్ చేసే షాపులు ఇక్కడ కనిపిస్తాయి.", "जिन दुकानों से आप ऑर्डर करते हैं वे यहाँ दिखेंगी।"],
  ["Switch shop", "షాపు మార్చండి", "दुकान बदलें"],
  ["Your shops", "మీ షాపులు", "आपकी दुकानें"],
  ["Items added to your cart", "వస్తువులు మీ కార్ట్‌లో చేర్చబడ్డాయి", "सामान आपके कार्ट में जोड़ दिया गया"],
  ["Those items are not available in this shop right now", "ఆ వస్తువులు ఈ షాపులో ప్రస్తుతం అందుబాటులో లేవు", "वह सामान इस दुकान में अभी उपलब्ध नहीं है"],

  // Sentences that mix words with live values, and the support answers
  ["Fresh products from your neighbourhood store.", "మీ పరిసర షాపు నుండి తాజా ఉత్పత్తులు.", "आपके पड़ोस की दुकान से ताज़ा उत्पाद।"],
  ["Local store, delivered", "స్థానిక షాపు, ఇంటికే డెలివరీ", "स्थानीय दुकान, घर तक डिलीवरी"],
  ["{address}. Delivered to your door.", "{address}. మీ ఇంటి వద్దకే డెలివరీ.", "{address}। सीधे आपके दरवाज़े तक डिलीवरी।"],
  ["No products match \"{search}\".", "\"{search}\" కు సరిపోయే ఉత్పత్తులు లేవు.", "\"{search}\" से मेल खाता कोई उत्पाद नहीं।"],
  ["We could not open the shop \"{slug}\". It may be offline, or the shop code is wrong.", "\"{slug}\" షాపును తెరవలేకపోయాము. అది ఆఫ్‌లైన్‌లో ఉండవచ్చు, లేదా షాప్ కోడ్ తప్పు కావచ్చు.", "\"{slug}\" दुकान नहीं खुल सकी। वह ऑफ़लाइन हो सकती है, या दुकान का कोड गलत है।"],
  ["You save {amount} with {code}", "{code} తో మీరు {amount} ఆదా చేస్తున్నారు", "{code} से आप {amount} बचा रहे हैं"],
  ["Coupon {code}", "కూపన్ {code}", "कूपन {code}"],
  ["All {count} product will be removed.", "మొత్తం {count} ఉత్పత్తి తొలగించబడుతుంది.", "सभी {count} उत्पाद हटा दिए जाएँगे।"],
  ["All {count} products will be removed.", "మొత్తం {count} ఉత్పత్తులు తొలగించబడతాయి.", "सभी {count} उत्पाद हटा दिए जाएँगे।"],
  ["Delivery {fee}", "డెలివరీ {fee}", "डिलीवरी {fee}"],
  ["Free delivery", "ఉచిత డెలివరీ", "मुफ़्त डिलीवरी"],
  ["The store will confirm it, then a rider brings it to you.", "షాపు నిర్ధారిస్తుంది, తర్వాత రైడర్ మీ వద్దకు తెస్తారు.", "दुकान पुष्टि करेगी, फिर राइडर इसे आप तक लाएगा।"],
  ["The store will confirm it and tell you when it is ready to collect.", "షాపు నిర్ధారించి, తీసుకోవడానికి సిద్ధమైనప్పుడు మీకు చెబుతుంది.", "दुकान पुष्टि करेगी और लेने के लिए तैयार होने पर आपको बताएगी।"],
  ["1 item", "1 వస్తువు", "1 सामान"],
  ["{n} items", "{n} వస్తువులు", "{n} सामान"],
  ["Pay in cash when it arrives.", "వచ్చినప్పుడు నగదు చెల్లించండి.", "आने पर नकद भुगतान करें।"],
  ["Pay in cash when you collect it.", "తీసుకున్నప్పుడు నగదు చెల్లించండి.", "लेते समय नकद भुगतान करें।"],
  ["Placed {date}", "{date} న ఆర్డర్ చేశారు", "{date} को ऑर्डर किया"],
  ["This order was cancelled. Nothing to pay.", "ఈ ఆర్డర్ రద్దు చేయబడింది. చెల్లించాల్సిన పని లేదు.", "यह ऑर्डर रद्द हो गया। कुछ भुगतान नहीं करना है।"],
  ["Pick up at the store. Pay in cash when you collect it.", "షాపులో తీసుకోండి. తీసుకున్నప్పుడు నగదు చెల్లించండి.", "दुकान से ले लें। लेते समय नकद भुगतान करें।"],
  ["Cash on delivery · Paid", "క్యాష్ ఆన్ డెలివరీ · చెల్లించారు", "कैश ऑन डिलीवरी · भुगतान हो गया"],
  ["Cash on delivery · Nothing to pay", "క్యాష్ ఆన్ డెలివరీ · చెల్లించాల్సిన పని లేదు", "कैश ऑन डिलीवरी · कुछ भुगतान नहीं"],
  ["Cash on delivery · Pay when you receive it", "క్యాష్ ఆన్ డెలివరీ · అందుకున్నప్పుడు చెల్లించండి", "कैश ऑन डिलीवरी · मिलने पर भुगतान करें"],
  ["The store has not started on it yet, so you can still cancel.", "షాపు ఇంకా ప్రారంభించలేదు, కాబట్టి మీరు ఇంకా రద్దు చేయవచ్చు.", "दुकान ने अभी शुरू नहीं किया है, इसलिए आप अभी रद्द कर सकते हैं।"],
  ["Order {id}", "ఆర్డర్ {id}", "ऑर्डर {id}"],
  ["{added} added, {skipped} not available", "{added} చేర్చాము, {skipped} అందుబాటులో లేవు", "{added} जोड़े, {skipped} उपलब्ध नहीं"],
  ["How do cancellations & refunds work?", "రద్దులు మరియు రీఫండ్‌లు ఎలా పనిచేస్తాయి?", "रद्द और रिफंड कैसे काम करते हैं?"],
  ["Damaged or missing items?", "పాడైన లేదా లేని వస్తువులా?", "क्षतिग्रस्त या गायब सामान?"],
  ["You can track live delivery progress directly under My Orders in your account.", "మీ ఖాతాలోని \"నా ఆర్డర్లు\" కింద లైవ్ డెలివరీ పురోగతిని నేరుగా చూడవచ్చు.", "आप अपने खाते में \"मेरे ऑर्डर\" के अंतर्गत लाइव डिलीवरी की स्थिति सीधे देख सकते हैं।"],
  ["Orders can be cancelled before the rider departs. Refunds are processed back to your original payment method in 2–4 hours.", "రైడర్ బయలుదేరే ముందు ఆర్డర్లు రద్దు చేయవచ్చు. రీఫండ్‌లు 2–4 గంటల్లో మీ అసలు చెల్లింపు విధానానికి తిరిగి వస్తాయి.", "राइडर के निकलने से पहले ऑर्डर रद्द हो सकते हैं। रिफंड 2–4 घंटे में आपके मूल भुगतान तरीके में वापस हो जाता है।"],
  ["Call or email us with your order ID and a photo; our support team will issue an instant replacement or refund.", "మీ ఆర్డర్ ID మరియు ఫోటోతో మాకు కాల్ లేదా ఇమెయిల్ చేయండి; మా సపోర్ట్ టీమ్ వెంటనే రీప్లేస్‌మెంట్ లేదా రీఫండ్ ఇస్తుంది.", "अपने ऑर्डर ID और फोटो के साथ हमें कॉल या ईमेल करें; हमारी सहायता टीम तुरंत बदलाव या रिफंड देगी।"],
  ["Customer", "కస్టమర్", "ग्राहक"],

  // Payment, delivery wait and live order messages
  ["Pay online", "ఆన్‌లైన్‌లో చెల్లించండి", "ऑनलाइन भुगतान करें"],
  ["Cash on delivery", "క్యాష్ ఆన్ డెలివరీ", "कैश ऑन डिलीवरी"],
  ["How will you pay?", "మీరు ఎలా చెల్లిస్తారు?", "आप कैसे भुगतान करेंगे?"],
  ["You will pay online right after placing the order.", "ఆర్డర్ చేసిన వెంటనే మీరు ఆన్‌లైన్‌లో చెల్లిస్తారు.", "ऑर्डर करने के तुरंत बाद आप ऑनलाइन भुगतान करेंगे।"],
  ["Place order & pay", "ఆర్డర్ చేసి చెల్లించండి", "ऑर्डर करें और भुगतान करें"],
  ["Paid online", "ఆన్‌లైన్‌లో చెల్లించారు", "ऑनलाइन भुगतान हो गया"],
  ["Online payment · Nothing to pay", "ఆన్‌లైన్ చెల్లింపు · చెల్లించాల్సిన పని లేదు", "ऑनलाइन भुगतान · कुछ भुगतान नहीं"],
  ["Online payment · Waiting for payment", "ఆన్‌లైన్ చెల్లింపు · చెల్లింపు కోసం వేచి ఉంది", "ऑनलाइन भुगतान · भुगतान का इंतज़ार"],
  ["Pay now", "ఇప్పుడే చెల్లించండి", "अभी भुगतान करें"],
  ["Pay later", "తర్వాత చెల్లించండి", "बाद में भुगतान करें"],
  ["Pay", "చెల్లించండి", "भुगतान करें"],
  ["test", "టెస్ట్", "टेस्ट"],
  ["Test payment", "టెస్ట్ చెల్లింపు", "टेस्ट भुगतान"],
  ["The payment was not completed.", "చెల్లింపు పూర్తికాలేదు.", "भुगतान पूरा नहीं हुआ।"],
  ["Estimated delivery", "అంచనా డెలివరీ", "अनुमानित डिलीवरी"],
  ["{low}–{high} min", "{low}–{high} నిమిషాలు", "{low}–{high} मिनट"],
  ["New order · you earn {amount}", "కొత్త ఆర్డర్ · మీరు {amount} సంపాదిస్తారు", "नया ऑर्डर · आप {amount} कमाएँगे"],
  ["New order · {amount}", "కొత్త ఆర్డర్ · {amount}", "नया ऑर्डर · {amount}"],
  ["Your order was confirmed", "మీ ఆర్డర్ నిర్ధారించబడింది", "आपका ऑर्डर पक्का हो गया"],
  ["A delivery partner accepted your order", "ఒక డెలివరీ భాగస్వామి మీ ఆర్డర్‌ను అంగీకరించారు", "एक डिलीवरी पार्टनर ने आपका ऑर्डर स्वीकार किया"],
  ["Your order is out for delivery", "మీ ఆర్డర్ డెలివరీకి బయలుదేరింది", "आपका ऑर्डर डिलीवरी के लिए निकल गया"],
  ["Your order is ready to collect", "మీ ఆర్డర్ తీసుకోవడానికి సిద్ధంగా ఉంది", "आपका ऑर्डर लेने के लिए तैयार है"],
  ["Your order was delivered", "మీ ఆర్డర్ డెలివరీ అయింది", "आपका ऑर्डर डिलीवर हो गया"],
  ["Your order was cancelled", "మీ ఆర్డర్ రద్దు చేయబడింది", "आपका ऑर्डर रद्द हो गया"],
  ["This order is already paid.", "ఈ ఆర్డర్ ఇప్పటికే చెల్లించబడింది.", "यह ऑर्डर पहले ही चुकाया जा चुका है।"],
  ["There is nothing to pay for this order.", "ఈ ఆర్డర్‌కు చెల్లించాల్సినది ఏమీ లేదు.", "इस ऑर्डर के लिए कुछ भुगतान नहीं करना है।"],
  ["View order", "ఆర్డర్ చూడండి", "ऑर्डर देखें"],
  ["This is a test payment. No real money moves. Real payments need the payment provider switched on in the server settings.", "ఇది టెస్ట్ చెల్లింపు. నిజమైన డబ్బు కదలదు. నిజమైన చెల్లింపులకు సర్వర్ సెట్టింగ్స్‌లో పేమెంట్ ప్రొవైడర్‌ను ఆన్ చేయాలి.", "यह एक टेस्ट भुगतान है। असली पैसा नहीं जाता। असली भुगतान के लिए सर्वर सेटिंग में पेमेंट प्रोवाइडर चालू करना होगा।"],
  ["You can also pay later from your order page.", "మీరు మీ ఆర్డర్ పేజీ నుండి తర్వాత కూడా చెల్లించవచ్చు.", "आप अपने ऑर्डर पेज से बाद में भी भुगतान कर सकते हैं।"],
  ["Paid online. Nothing to pay at the door.", "ఆన్‌లైన్‌లో చెల్లించారు. తలుపు వద్ద ఏమీ చెల్లించాల్సిన పని లేదు.", "ऑनलाइन भुगतान हो गया। दरवाज़े पर कुछ नहीं देना है।"]
];

const TRANSLATIONS: Record<Language, Map<string, string>> = {
  en: new Map(),
  te: new Map(WORDS.map(([english, telugu]) => [english, telugu])),
  hi: new Map(WORDS.map(([english, , hindi]) => [english, hindi]))
};

// Fills {name} style gaps. Written with split and join so it is easy to read.
function fill(text: string, values?: Record<string, string | number>): string {
  if (!values) return text;
  let result = text;
  for (const key of Object.keys(values)) {
    result = result.split(`{${key}}`).join(String(values[key]));
  }
  return result;
}

export type Translate = (english: string, values?: Record<string, string | number>) => string;

interface LanguageState {
  language: Language;
  setLanguage(next: Language): void;
  t: Translate;
}

const LANGUAGE_KEY = 'easycart.language';
// Without a provider (should not happen) text simply stays in English instead of crashing.
const LanguageContext = createContext<LanguageState>({ language: 'en', setLanguage: () => undefined, t: (english, values) => fill(english, values) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    getLocal(LANGUAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'te' || saved === 'hi') setLanguageState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    setLocal(LANGUAGE_KEY, next).catch(() => undefined);
  }, []);

  const t = useCallback<Translate>((english, values) => fill(TRANSLATIONS[language].get(english) ?? english, values), [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageState {
  return useContext(LanguageContext);
}

export function useT(): Translate {
  return useLanguage().t;
}
