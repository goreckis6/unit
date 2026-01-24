const fs = require('fs');

// Function to insert kwToKva translations before ampToKva
function addKwToKvaTranslation(lang, translation) {
  const filePath = `./i18n/${lang}.json`;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the location before "ampToKva"
  const searchPattern = '    },\n    "ampToKva": {';
  const translationJson = JSON.stringify(translation, null, 2)
    .split('\n')
    .map((line, index) => index === 0 ? '    "kwToKva": ' + line.substring(0) : '    ' + line)
    .join('\n');
  
  const replacement = translationJson + ',\n    "ampToKva": {';
  
  content = content.replace(searchPattern, replacement);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Added kwToKva for ${lang}`);
}

// Translations for remaining languages
const translations = {
  cs: {
    title: "Kalkulačka kW na kVA",
    description: "Převeďte kilowatty (kW) na kilovoltampéry (kVA) okamžitě pomocí účiníku",
    kw: "Kilowatty (kW)",
    powerFactor: "Účiník (0-1)",
    calculate: "Vypočítat",
    reset: "Resetovat",
    result: "Výsledek",
    kva: "Kilovoltampéry (kVA)",
    seo: {
      title: "Kalkulačka kW na kVA - Převod činného výkonu na zdánlivý výkon online",
      description: "Bezplatná kalkulačka převodu kW na kVA. Převeďte kilowatty na kilovoltampéry okamžitě pomocí účiníku. Ideální pro elektrické výpočty, energetické systémy a dimenzování zařízení.",
      keywords: "kalkulačka kw na kva, převodník kilowattů na kilovoltampéry, převod kw kva, kalkulačka činného výkonu na zdánlivý, elektrická kalkulačka, kalkulačka kva, kalkulačka účiníku, zdarma kalkulačka",
      content: {
        heading: "Jak převést kW na kVA",
        paragraph1: "Převod kilowattů (kW) na kilovoltampéry (kVA) je zásadní v elektrotechnice a energetických systémech. Kilowatty představují činný výkon — skutečnou práci vykonanou elektrickou zátěží — zatímco kilovoltampéry představují zdánlivý výkon — celkový výkon dodaný zdrojem, včetně činných a jalových složek. Převod vyžaduje účiník (PF), který je poměrem činného výkonu ke zdánlivému výkonu. Naše bezplatná kalkulačka kW na kVA poskytuje okamžité, přesné převody pro dimenzování zařízení, transformátorů a generátorů.",
        paragraph2: "Vzorec je: kVA = kW / PF, kde kVA je zdánlivý výkon v kilovoltampérech, kW je činný výkon v kilowattech a PF je účiník (hodnota mezi 0 a 1). Například zátěž 5 kW s účiníkem 0,8 vyžaduje 5 / 0,8 = 6,25 kVA zdánlivého výkonu. Nižší účiník znamená, že je potřeba vyšší zdánlivý výkon pro dodání stejného činného výkonu. Účiník udává, jak efektivně elektrický systém přeměňuje zdánlivý výkon na užitečnou práci: PF 1,0 (jednotkový) je 100% účinný; nižší hodnoty znamenají ztráty jalového výkonu.",
        paragraph3: "Tento převod je zásadní v mnoha aplikacích: dimenzování transformátorů a generátorů k zajištění dostatečné kapacity pro činné zátěže, návrh elektrických distribučních systémů a UPS jednotek, výpočet jističů a vodičů, pochopení chování motorů a indukčních zátěží a plánování energetické kapacity pro komerční a průmyslové objekty. Znalost převodu kW na kVA vám pomůže vybrat správně dimenzované zařízení, vyhnout se přetížení a optimalizovat energetickou účinnost.",
        paragraph4: "Naše kalkulačka přijímá kilowatty a účiník jako vstupy, aplikuje vzorec kVA = kW / PF a poskytuje zdánlivý výkon v kilovoltampérech. Ať už pracujete s motory, transformátory, generátory, UPS systémy nebo indukčními či kapacitními zátěžemi — kalkulačka kW na kVA poskytuje přesné, okamžité výsledky pro vaše elektrické návrhy a analýzy.",
        exampleHeading: "Příklad:",
        exampleText: "5 kW při PF 0,8: kVA = 5 / 0,8 = 6,25 kVA. 10 kW při PF 0,9: kVA = 10 / 0,9 = 11,11 kVA. 2 kW při PF 1,0 (odporová zátěž): kVA = 2 / 1,0 = 2 kVA. 3,5 kW při PF 0,85: kVA = 3,5 / 0,85 = 4,12 kVA. Motor 7,5 kW při PF 0,75 vyžaduje 7,5 / 0,75 = 10 kVA zdánlivého výkonu napájení."
      },
      faq: {
        heading: "Často kladené otázky",
        items: [
          { question: "Jaký je vzorec pro převod kW na kVA?", answer: "Vzorec je kVA = kW / PF, kde kVA je zdánlivý výkon v kilovoltampérech, kW je činný výkon v kilowattech a PF je účiník (0 až 1). Činný výkon = zdánlivý výkon × PF, tedy zdánlivý výkon = činný výkon / PF." },
          { question: "Jaký je rozdíl mezi kW a kVA?", answer: "kW (kilowatty) je činný výkon — skutečná práce vykonaná zátěží (např. mechanický výstup, teplo, světlo). kVA (kilovoltampéry) je zdánlivý výkon — celkový výkon dodaný zdrojem, včetně jalového výkonu, který nevykonává užitečnou práci. kVA ≥ kW vždy; jsou si rovny pouze když PF = 1,0 (čistě odporová zátěž)." },
          { question: "Co je účiník a jaké hodnoty jsou typické?", answer: "Účiník (PF) je poměr kW / kVA, v rozmezí od 0 do 1. Měří, jak efektivně je elektrický výkon přeměňován na užitečnou práci. Typické hodnoty: odporové topení ~1,0, zářivky 0,5–0,95, indukční motory 0,7–0,9, zdroje 0,6–0,95. Nižší PF znamená, že je pro stejné kW potřeba vyšší kVA, což zvyšuje rozměry vodičů a transformátorů." },
          { question: "Proč musím převádět kW na kVA?", answer: "Transformátory, generátory, UPS jednotky a jističe jsou klasifikovány v kVA, ne v kW. Zátěž spotřebovávající 10 kW při PF 0,8 vyžaduje 12,5 kVA kapacitu napájení. Dimenzování zařízení pouze podle kW (ignorování PF) může vést k přetížení. Převod kW na kVA zajistí, že vyberete zařízení s dostatečnou kapacitou zdánlivého výkonu." },
          { question: "Je tato kalkulačka zdarma?", answer: "Ano, naše kalkulačka kW na kVA je zdarma. Není vyžadována registrace ani platba. Zadejte výkon v kW a účiník (0–1) pro okamžité, přesné výsledky v kVA." }
        ]
      }
    }
  },
  // Add more languages as needed...
};

// Process files
for (const [lang, translation] of Object.entries(translations)) {
  try {
    addKwToKvaTranslation(lang, translation);
  } catch (error) {
    console.error(`✗ Error processing ${lang}:`, error.message);
  }
}
