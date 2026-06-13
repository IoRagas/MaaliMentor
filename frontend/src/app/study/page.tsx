"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import { BookOpen, Mic, Award, ArrowLeft, Loader2 } from "lucide-react";

interface StudyGuide {
  title: string;
  urduTitle: string;
  content: string[];
}

const studyMaterials: Record<number, StudyGuide> = {
  1: {
    title: "Budgeting Basics",
    urduTitle: "بجٹ بنانے کے بنیادی اصول",
    content: [
      "**Budget ka Maqsad & Bunyadi Usool:** Budgeting ka sab se pehla aur ahem usool apni amdani (Income) aur akhrajaat (Expenses) ka mukammal aur baqaida hisab rakhna hai, taake maloom ho sake ke paisa kahan ja raha hai. Rozana ke kharchon ko diary ya mobile application mein likhna sab se moassar tareeqa hai.",
      "**50-30-20 Rule:** Apni monthly income ko teen hisson mein taqseem karein: **50% Zarooriyat (Needs)** jo ke bunyadi aur lazmi akhrajaat hain jin ke baghair guzara mumkin nahi (jaise rent, utility bills, school fees, khana, ilaj); **30% Khwahishat (Wants / Discretionary)** yaani ghair-zaroori shauq aur entertainment (jaise luxury shopping, hoteling, Netflix/gaming subscriptions); aur **20% Bachat (Savings & Investments)** yaani emergency fund banana aur future ke liye sarmayakari karna.",
      "**Fixed vs Variable Expenses:** Expenses do tarah ke hote hain: **Fixed Expenses** jo har mahine lagbhag barabar hote hain (jaise house rent, school fees, bank mortgage payment) aur **Variable Expenses** jo har mahine badalte rehte hain (jaise utility bills, petrol, grocery, medical bills).",
      "**Surplus vs Deficit:** Jab aap ki income kharchon se zyada ho aur kharch karne ke baad paise bach jayein, toh use **Budget Surplus** kehte hain. Aur jab kharcha amdani se barh jaye, toh use **Budget Deficit (Nuqsan)** kehte hain, jise poora karne ke liye udhar lena parta hai. Is ko control karne ka behtareen tareeqa wants (ghair-zaroori kharchay) kam karna hai.",
      "**Smart Habits (Envelope System & 24-Hour Rule):** Budgeting ko asaan banane ke liye **Envelope System** ka istemal kiya jata hai jahan har expense category ke liye cash alag lifafay mein rakha jata hai. Isi tarah **24-Hour Rule** impulsive buying (bina soche samjhe khareedari) ko rokta hai, jahan koi bhi bari purchase karne se pehle 24 ghante sochna parta hai.",
      "**Income ki Aqsaam (Active vs Passive):** Amdani do tarah ki hoti hai: **Active Income** jo physical kaam ya naukri (salary, wages) kar ke milti hai, aur **Passive Income** jo bina rozana physical kaam kiye milti hai (jaise rental property se rent ya shares se dividend).",
      "**Pay Yourself First & Bachat ka Asal Faida:** Kamyab budgeting ke liye tankha aate hi sab se pehle apni savings ka 10-20% alag karein, phir baqi paise kharach karein. Monthly rashan ka estimate pehle se banana aur bulk (thok) mein khareedari karna kharchay kam karne ka behtar tarika hai. Weekly budget review se aap ko waqt par pata chal jata hai ke aap limit se bahar ja rahe hain ya nahi, taake mahine ke aakhir mein koi pareshani na ho. Bachat mushkil waqt mein sukoon aur behtar kal ki sarmayakari ki bunyaad banti hai."
    ]
  },
  2: {
    title: "Saving Habits",
    urduTitle: "بچت کی عادات اور فائدے",
    content: [
      "**Saving vs Investing:** Saving ka maqsad paise ko mehfooz aur asani se dastiyab rakhna hai. Investing ka maqsad return/profit hasil kar ke wealth barhana hai, jis mein risk bhi shamil hota hai. Bachat shuru karne ka sab se behtar waqt pehli kamai ya tankha milne par foran hota hai.",
      "**Ghar ka Cash vs Bank Accounts:** Ghar mein cash rakhna (**under the mattress**) mehnga parta hai kyunke chori ke khatre ke sath zero return ki wajah se inflation (mehngai) paise ki real value kha jati hai. Bank mein **Savings Account** kholne se paisa mehfooz rehta hai aur munasib profit/interest milta hai.",
      "**Compound Interest (Murakkab Munafa):** Apne munafa par mazeed munafa kamane ko Compound Interest kehte hain. Yeh aap ke paise ko waqt ke sath tezi se (exponentially) barhata hai.",
      "**Committee (ROSCA) System:** Pakistan mein saving ke liye **Committee** system bohot mashhoor hai, jo discipline aur community trust ke zariye save karne ka aam tareeqa hai. Lekin is ka sab se bara nuqsan yeh hai ke is par koi profit nahi milta aur inflation ki wajah se saal ke aakhir tak paise ki value (purchasing power) gir jati hai.",
      "**Invisible Leaks & Habits:** Rozana ka ek chota ghair-zaroori kharcha (jaise Rs. 100 ki chaye ya snacks) saal ke aakhir mein **Rs. 36,500** se zyada ban jata hai. Bachat barhane ke liye **Automated Savings** (bank account se automatic transfers) set karein aur **Lifestyle Creep** (salary barhne par kharche barhana) ko rokein. Ghar ka khana khane se monthly expenses 30% tak kam ho sakte hain.",
      "**Matching Savings & Target Setting:** Jitna paisa wants (luxuries) par kharach karein, utna hi savings account mein daalna **Matching Savings** kehlaata hai. Kamyab saving ke liye target setting (jaise emergency fund banana) zaroori hai taake bachat karne ka hosla rahay.",
      "**National Savings & TDR:** Hukoomat-e-Pakistan ke backed schemes jaise **National Savings** mehfooz returns dete hain. **TDR (Term Deposit Receipt) ya Fixed Deposit** mein ek makhsoos waqt ke liye raqam lock ki jati hai jis par high profit milta hai. Lekin waqt se pehle raqam nikalne (**premature encashment**) par bank profit reduction penalty lagata hai.",
      "**Micro-Savings & PLS Account:** **Micro-savings apps** choti transactions par rounds-up kar ke automatic save karti hain. Bank ke **PLS (Profit and Loss Sharing) savings account** mein profit halal karobar ke munafay aur losses ki partnership se milta hai."
    ]
  },
  3: {
    title: "Emergency Funds",
    urduTitle: "ایمرجنسی فنڈ کی اہمیت",
    content: [
      "**Emergency Fund Kya Hai:** Ghair-yakeeni aur achanak mushkil halat (medical emergency, job loss, accident, unexpected repairs) ke liye alag rakhi gayi raqam. Eid shopping, naya mobile, ya sales emergency fund ke scope se bahar hain.",
      "**Kitna Paisa Hona Chahiye:** Kam az kam **3 se 6 mahine** ke essential monthly kharchon (Needs - rent, utility bills, food) ke barabar raqam emergency fund mein honi chahiye, na ke poori monthly salary ke barabar, kyunke emergency mein ghair-zaroori kharche band ho jate hain.",
      "**Liquidity (Aasani se nikalna):** Emergency fund highly liquid hona chahiye jaise savings account ya **Money Market Mutual Funds** (jahan se 1-2 din mein cash mil sake). Zameen/property (Real Estate) ya committees liquid nahi hain aur unhein emergency mein foran bechna bohot mushkil hota hai.",
      "**Fund Replenishment & Safety:** Emergency fund safety aur liquidity ke liye hota hai, is par high-risk investments (stocks/crypto) bilkul nahi karni chahiye. Agar fund se paise kharach ho jayein, toh agli savings se sab se pehle is fund ko dobara poora (**replenish**) karna chahiye.",
      "**Single Earner & Self-Employed (Freelancers):** Jis ghar mein akela kamane wala (**single earning member**) ho, wahan risk zyada hota hai, is liye un ka emergency fund **6 se 9 mahine** ke kharchon ke barabar hona chahiye. Karobar ya freelancing karne walon ki monthly income fix nahi hoti, is liye un ke liye bhi bara fund zaroori hai.",
      "**Emergency Fund vs Sinking Fund:** Emergency fund unplanned, achanak events ke liye hota hai (jaise job loss). **Sinking Fund** planned future kharchon ke liye hota hai (jaise har mahine Rs. 5,000 bachana naye laptop, shadi, ya gari ki repair ke liye).",
      "**Anxiety & Debt Reduction:** Backup cash hone se financial anxiety aur stress kam hota hai aur mental peace milta hai. Emergency fund na ho toh mushkil waqt mein soodi karz (debt) lena parta hai ya zewar/assets saste mein bechne parte hain. Apne emergency fund ko spend account se separate rakhna zaroori hai."
    ]
  },
  4: {
    title: "Inflation & Purchasing Power",
    urduTitle: "مہنگائی اور خریدنے کی طاقت",
    content: [
      "**Inflation (Mehngai) & Purchasing Power:** Inflation ka matlab hai cheezon ki qeemton ka musalsal barhna aur paise ki **Quwwat-e-Khareed (Purchasing Power)** ka kam hona. Ise silent money thief bhi kehte hain jo bank ya ghar mein pare cash ki value khata rehta hai.",
      "**Inflation Example & Purchasing Power:** Agar inflation rate **15%** ho, toh aaj ka Rs. 10,000 agle saal nominal value mein Rs. 10,000 hi rahega par us ki purchasing power Rs. 8,500 ke barabar ho jayegi, yani aap 15% kam cheezein khareed sakenge. Agar pehle Rs. 1000 mein 10 kg aata aata tha aur ab sirf 5 kg aata hai, toh purchasing power aadhi ho gayi hai.",
      "**Real Rate of Return:** Asal munafa nominal return mein se inflation rate nikal kar aata hai: **Real Return = Nominal Return - Inflation Rate**. Agar bank account 10% return de aur inflation 15% ho, toh aap ka real rate of return **-5% (loss)** hai.",
      "**Inflation Hedging:** Inflation se bachne ke liye apne paise ko paper cash ke bajaye **Real Estate, Gold, aur Stocks/Mutual Funds** mein invest karna chahiye, jo waqt ke sath inflation se zyada return dete hain.",
      "**Types of Inflation & Measurements:** Pakistan mein inflation ko measure karne ke liye **CPI (Consumer Price Index)** ka istemal kiya jata hai. **Demand-Pull Inflation** tab hoti hai jab demand barh jaye par supply kam ho ('too much money chasing too few goods'). **Cost-Push Inflation** raw material, fuel, aur electricity mehngi hone se manufacturing cost barhne ki wajah se hoti hai.",
      "**Currency Devaluation & SBP Actions:** Rupay ki qadar girne (**currency devaluation**) se imported fuel aur raw material mehngay ho jate hain jo localized inflation late hain. State Bank of Pakistan (SBP) inflation ko control karne ke liye **Interest Rate (Policy Rate)** barha deta hai taake log spending kam karein aur bachat barhaein.",
      "**Stagflation, Deflation & Money Printing:** **Stagflation** mein economic growth stagnant hoti hai aur inflation & unemployment dono high hote hain. **Deflation** mein qeematein musalsal girti hain jo economic slowdown lati hai. Government agar bina production barhaye naye notes print kare (**money printing**), toh currency devalue ho kar inflation lati hai. **Wage-Price Spiral** price barhne aur wages barhne ke cycle ko kehte hain.",
      "**Shrinkflation & Indexation:** **Shrinkflation** mein companies product ki price wahi rakhti hain par us ka size or weight kam kar deti hain (jaise chips packet size reduction). **Inflation Indexation** ka matlab hai salary ya returns ko inflation rate ke mutabiq adjust karna taake purchasing power safe rahay. Fixed income wale tabqay (salary/pension) ko inflation se sab se zyada nuqsan hota hai."
    ]
  },
  5: {
    title: "Investing Principles",
    urduTitle: "سرمایہ کاری کے بنیادی اصول",
    content: [
      "**Investing Purpose & Asset vs Liability:** Investing ka maqsad assets khareed kar apne paise ko kaam par lagana hai taake return mile. **Asset** aap ko paisa kama kar deta hai (jaise property, stocks, mutual funds), jabke **Liability** aap ka paisa kharach karwati hai (jaise car loan, debt).",
      "**Risk vs Return:** Finance ka sunehri usool hai ke high risk par zyada potential return ka chance hota hai par potential loss ka khatra bhi zyada hota hai. **National Savings** (government backed) sab se safe samjhi jati hain kyunke default risk na hone ke barabar hota hai.",
      "**Rule of 72 & CAGR:** **Rule of 72** ke mutabiq agar aap ka return rate 12% ho, toh **72/12 = 6 saal** mein aap ka paisa double ho jayegi. **CAGR (Compound Annual Growth Rate)** long term investment ki annual average growth rate compounding ke sath measure karta hai.",
      "**Compound Return (Murakkab Munafa):** Compounding ko **8th Wonder of the World** kaha jata hai kyunke is mein aap ke profit par bhi mazeed profit milta hai aur paisa exponentially grow karta hai.",
      "**Bulls, Bears & Volatility:** Stock market mein **Bull Market** barhti hui (rising) market ko kehte hain, aur **Bear Market** girti hui (falling) market ko kehte hain. **Volatility** ka matlab hai price ka tezi se up-down hona (Crypto/Stocks are highly volatile).",
      "**Paper Loss vs Realized Loss:** Agar asset ki price gir jaye par aap ne becha nahi, toh woh **Paper Loss** hai. Bech dene par loss confirm ho jata hai jise **Realized Loss** kehte hain.",
      "**DCA, Stop-Loss & Speculation:** **Dollar-Cost Averaging (DCA)** market price dekhe baghair har mahine fix raqam invest karna hai, jo cost average karti hai. **Stop-Loss** price niche girne par automatic loss block sale order hai. **Speculation (Satta/Tukkay-bazi)** bina research ke short term luck par khelna hai, jabke real investing long term value holding hai.",
      "**Pehli Priority & Emotional Control:** Investing shuru karne ki pehli shart high-interest debts (jaise credit cards) se azaad hona aur basic emergency fund banana hai, kyunke debt markup (20-30%) return se zyada hota hai. Market fluctuations mein panic selling se bachne ke liye **Emotional Control** zaroori hai. **Liquidity Risk** zaroorat ke waqt asset ko jaldi cash na kar paana hai."
    ]
  },
  6: {
    title: "Mutual Funds",
    urduTitle: "میوچل فنڈز کی تفصیل",
    content: [
      "**Mutual Fund & AMC:** Mutual Fund investors se paisa jama kar ke professional **Fund Manager** ke zariye invest karta hai. In funds ko chalane wali company ko **AMC (Asset Management Company)** kehte hain (jaise Al Meezan, HBL Funds).",
      "**SECP & Trustee CDC:** Pakistan mein mutual funds ko **SECP (Securities and Exchange Commission of Pakistan)** regulate karta hai. CDC (Central Depository Company) as a **Trustee** fund ke assets ko safe custody mein rakhti hai taake AMC fraud na kar sake.",
      "**NAV (Net Asset Value):** Kisi mutual fund ke ek unit (share) ki price ko **NAV** kehte hain, jo market band hone par daily basis par calculate hoti hai.",
      "**Types of Mutual Funds:** **Equity Funds** stock exchange (PSX) par listed companies ke shares mein lagate hain (high risk/long-term returns). **Debt/Income Funds** government/corporate bonds mein lagate hain (medium-low risk). **Money Market Funds** bank deposits/T-bills mein lagate hain (lowest risk, high liquidity). **Balanced Funds** risk kam karne ke liye shares aur bonds dono ka mix banate hain.",
      "**Fees (Loads & Expense Ratio):** **Front-End Load** mutual fund khareedte waqt lagne wali sales charge fee hai (aam tor par 1-2%). **Expense Ratio** fund chalane ke saalana operating expenses hain jo portfolio value se percentage ke tor par kaatay jate hain (aam tor par 1.5-2%).",
      "**SIP, ETF & Open-End vs Close-End:** **SIP (Systematic Investment Plan)** har mahine ek makhsoos din fix raqam mutual fund mein invest karna hai. **ETF (Exchange Traded Fund)** direct stock exchange par stocks ki tarah realtime trade hota hai. **Open-End Funds** mein units unlimited hote hain jo direct AMC se redemption (buy/sell) hote hain. **Close-End Funds** ke units exchange par trade hote hain.",
      "**Mutual Fund Advantages:** Direct stocks ke muqable mutual fund mein professional management aur choti raqam (jaise Rs. 5000) se auto-diversification milti hai, jis se single company default ka risk kam ho jata hai. Invest karne se pehle fund **Prospectus** (rules book) zaroori read karna chahiye. **Growth Funds** capital appreciation (reinvestment) dete hain aur **Income Funds** periodic payouts dete hain."
    ]
  },
  7: {
    title: "Islamic Banking & Finance",
    urduTitle: "اسلامی بینکاری کے اصول",
    content: [
      "**Islami Banking & Riba:** Islami banking **Sood (Riba)** se mukammal pak hoti hai aur Shariah rules par chalti hai. Riba ka matlab hai karz par ya bina kisi business risk ke fixed and guaranteed profit lena, jo Islam mein Haram hai.",
      "**Mudarabah vs Musharakah:** **Mudarabah** mein ek partner capital deta hai (**Rabb-ul-Maal**) aur dusra management/mehnat karta hai (**Mudarib**). Profit agreed ratio par share hota hai par financial loss sirf investor/Rabb-ul-Maal ka hota hai. **Musharakah** partnership mein tamam partners investment aur management share karte hain, aur loss capital ratio ke mutabiq share hota hai.",
      "**Murabahah, Ijarah & Sukuk:** **Murabahah** cost-plus trade contract hai jahan bank customer ko cash loan dene ke bajaye asset khareed kar profit margin ke sath installment par bechta hai. **Ijarah** renting/leasing contract hai (jaise Meezan Car Ijarah) jahan bank car ka owner rehta hai aur user se monthly rent leta hai. **Sukuk** conventional bonds ke muqable debt instrument nahi balke real asset ownership certificates hote hain.",
      "**Halal Stock Screening & Purification:** Halal stocks mein invest karne ke liye companies ko screen kiya jata hai: un ka main business halal ho aur total interest-bearing debt total assets ke **37% (ya 33%)** se kam hona chahiye. Shariah-non-compliant income percentage ko alag nikal kar bina thawab ki niyat ke charity mein dena **Purification (طہارت)** kehlayega. Islamic Mutual Funds soodi banks, alcohol, tobacco, gambling, aur conventional insurance sectors ke shares mein invest nahi kar sakte.",
      "**Takaful, Gharar & Maysir:** **Takaful** conventional insurance ke ulat Shariah-compliant mutual support system hai jo members ke **Tabarru (donation pool)** par chalta hai. **Gharar** contract mein be-yakeeni, dhoka, ya ambiguity hona hai (prohibited). **Maysir** juaa, speculation aur gambling ko kehte hain (prohibited).",
      "**Shariah Board & Profit Rates:** Islamic banking savings accounts par profit rate guaranteed ya fixed nahi hota balke floating/variable rate hota hai jo investment pool ki business performance par depend karta hai. **Shariah Board** Islamic scholars ki team hoti hai jo tamam products ki compliance audit karti hai.",
      "**Micro-Finance & Zakat:** **Akhuwat** model behtareen Islamic micro-finance hai jo Qarz-e-Hasna (interest-free loan with zero markup) deta hai. **Zakat** sarmaye par **2.5% saalana wajib tax** hai jo poor log ki welfare aur circulation of wealth ke liye wajib hai. **Riba al-Fadl** same category commodities ke barter exchange mein extra quantity lena hai."
    ]
  },
  8: {
    title: "Stock Market & Shares",
    urduTitle: "اسٹاک مارکیٹ اور حصص",
    content: [
      "**Stock Market & Shares:** Stock market (jaise **PSX - Pakistan Stock Exchange**, jiska hub Karachi mein hai) listed companies ke shares ki trade ka platform hai. **Share** khareedne ka matlab kisi company mein fractional ownership (hissa-dari) hasil karna aur company ke profits ke hissa-dar banna hai.",
      "**KSE-100 Index & IPO:** **KSE-100 Index** PSX ki top 100 companies ki performance ka trend batata hai. **IPO (Initial Public Offering)** tab hota hai jab company pehli baar public se capital lene ke liye stock exchange par list hoti hai aur shares bechti hai.",
      "**Accounts & Trading Requirements:** Direct stock trading ke liye SECP licensed broker ke paas **Trading Account** aur CDC (Central Depository Company) Sub-Account kholna zaroori hai. Transactions par broker commission, SECP levy, CDC charges, Laga, aur Capital Gains Tax (CGT) lagte hain.",
      "**Market Capitalization & symbols:** **Market Cap** company ke outstanding shares ki current market value hoti hai (**Share Price * Total Shares**). **Ticker Symbol** company ka short code name hota hai (jaise ENGRO or LUCK). **Blue Chip Stocks** stable, financially strong, and profitable records wali safe companies hoti hain (FFC, HBL). **Penny Stocks** bohot saste (choti companies) shares hote hain jo highly volatile aur risky hote hain.",
      "**Returns (Dividend vs Capital Gain):** Shareholders do tarah se kamate hain: **Dividend** jo company munafay ka hissa cash ki surat mein baati hai, aur **Capital Gain** jo share price barhne par sasta khareed kar mehnga bechne par hota hai.",
      "**Orders & Risk Management:** **Limit Order** aap ki apni pasandeeda price par lagta hai, jabke **Market Order** current dastiab price par foran execute hota hai. Loss se bachne ke liye **Stop-Loss Order** set kiya jata hai jisse price girne par shares automatic sell ho kar loss lock ho jata hai.",
      "**Fundamental vs Technical Analysis:** **Fundamental Analysis** company ke financial statements, sales, debt, management aur business scope ki study hai (long term value). **Technical Analysis** price charts, trends aur volume movements se future predictions karta hai (short term).",
      "**Prohibitions & Advice:** **Insider Trading** company ki non-public secret information par trade karna hai jo strictly illegal hai. **Short Selling** stocks borrow kar ke pehle bechna aur sasta hone par buy kar ke return karna hai. New users ko advice hai ke direct speculative trade ke bajaye research karein, blue chips ya index funds se start karein aur patience rakhein."
    ]
  },
  9: {
    title: "Diversification & Risk",
    urduTitle: "تنوع اور رسک مینجمنٹ",
    content: [
      "**Diversification Concept:** Sarmayakari ka standard rule hai ke **'Don't put all eggs in one basket'** (apnay saaray anday ek hi tokri mein mat rakhein). Apne capital ko mukhtalif stocks, sectors, aur asset classes mein divide karna taake total risk kam ho.",
      "**Asset Allocation & Age:** Apni total savings ko age aur goals ke mutabiq classes (jaise stocks, bonds, gold, cash) mein divide karna. Young investors high risk equity le sakte hain kyunke recovery time zyada hota hai, seniors ko principal safety ke liye fixed income debt resources rakhne chahiye.",
      "**Sectors Diversification:** Direct stock portfolio mein **Sector Diversification** zaroori hai. Ek hi cement sector ke bajaye Tech, Oil, Cement, aur Fertilizer sectors ke mukhtalif companies ke shares lene chahiye.",
      "**Systematic vs Unsystematic Risk:** **Unsystematic Risk** company specific risk hota hai (jaise strike) jise proper diversification (20-30 different stocks) se khatam kiya ja sakta hai. **Systematic Risk (Market Risk)** mulk ke overall halat, currency devaluation, ya interest rate barhne ka risk hai jo poori market ko girata hai, aur ise simple diversification se khatam nahi kiya ja sakta.",
      "**Correlation & Gold Safe Haven:** **Correlation** assets ki price movements ka aapas mein relation hai. Negative correlation assets (jaise stocks aur gold) portfolio ko balance rakhte hain. **Gold (Sona)** crisis aur inflation ke waqt **Safe Haven** asset ka role play karta hai, kyunke market girne par gold barhta hai.",
      "**Rebalancing vs Over-diversification:** **Rebalancing** ratios badalne par assets ko dobara original allocations (jaise 50/50 stock/bond) par lane ke liye adjust karna hai. **Over-diversification** mein itne zyada assets (jaise 100+ stocks) le liye jate hain ke return dilute ho kar market average se bhi kam ho jata hai aur transaction charges barh jate hain.",
      "**Risk appetite & Beta:** **Risk Appetite** investor ki loss absorb karne ki capacity hai. **Beta ($\beta$)** share price sensitivity ko measure karta hai: Beta > 1 market se zyada volatile hai, Beta < 1 stable share hai. **Capital Preservation** target original investment capital raqam ko loss se har haal mein mehfooz rakhna hai.",
      "**Index Funds & Real Estate Risks:** **Index Funds** pure market index (jaise KSE-100) ko replicate kar ke passive low-cost auto-diversification provide karte hain. **Real Estate** safe return deta hai par high ticket size, low liquidity, aur management issues hote hain. Interest rates barhne se bond prices girti hain. Risk profile assessment investment shuru karne se pehle zaroori hai."
    ]
  },
  10: {
    title: "Advanced Planning & Filer System",
    urduTitle: "ٹیکس فائلنگ اور فائلر بننے کے فائدے",
    content: [
      "**Filer vs Non-Filer & ATL:** **Filer** woh shakhs hai jo FBR mein tax returns file karta hai aur FBR ki ATL (Active Taxpayer List) mein shamil hota hai. ATL list active taxpayers ko dynamic tax discounts deti hai. Non-Filer ATL mein nahi hote aur un par heavy penalty rates lagte hain.",
      "**Filer Banking Benefits:** **Bank Cash Withdrawal** par Filer ko zero withholding tax dena parta hai, jabke non-filer par Rs. 50,000 daily se zyada withdrawal par **0.6% tax** kaata jata hai. **PLS Bank Profit** par Filer par **15% tax** lagta hai, jabke non-filer par double **30% tax** lagta hai.",
      "**Assets & Stocks Tax Relief:** Stock market profits (CGT) par active filer par **15% CGT** lagta hai, non-filer par double **30% CGT** lagta hai. Gari purchase ya transfer par non-filer par double-triple tax rates lagte hain, jabke filer par substantial low discount rate lagta hai. Property (zameen/makaan) transfer par Filer par **3% WHT** lagta hai, non-filer par **10% ya zyada** lagta hai.",
      "**FBR online systems & Deadlines:** **FBR (Federal Board of Revenue)** tax policies aur collection ka zimmadar sarkari idara hai. Online filing ke liye FBR ka **IRIS online portal** use hota hai. Salana individual tax return file karne ki aam deadline **30th September** hoti hai. Late filing par penalty surcharge de kar ATL mein enter hua ja sakta hai.",
      "**Wealth Statement & Withholding Tax:** **Wealth Statement (FBR Form 116)** assets, liabilities, and expenses declaration aur saalana wealth change reconcile karne ka transparent form hai. **Withholding Tax (WHT)** payment source par auto-kaata jane wala advance tax hai (jaise cellular card load ya electricity bill). Active filer return mein in certificates ko upload kar ke tax liability adjust/refund kara sakta hai.",
      "**Tax Credit & Tax Planning:** certified mutual funds (jaise Voluntary Pension Scheme) ya health insurance mein invest kar ke FBR se tax relief/liability reduction claim karna **Tax Credit** kehlaata hai. Legal tareeqay se tax liability ko kam karna **Tax Planning** (legal) hai, jabke tax chori karna **Tax Evasion** (illegal/sazaa-yab) hai.",
      "**Direct vs Indirect Taxes & GST:** **Direct Tax** personal income par lagta hai (jaise Income Tax). **Indirect Tax** products aur service invoice par automatic lagta hai (jaise GST). Pakistan mein GST ka standard rate **18%** chal raha hai. Salaried individuals ke liye agar saalana tankha **Rs. 6,00,000 (Rs. 50k monthly)** tak ho, toh tax absolute zero hota hai."
    ]
  }
};

const conceptToLevel: Record<string, number> = {
  budgeting: 1,
  saving: 2,
  emergency_funds: 3,
  inflation: 4,
  investing: 5,
  mutual_funds: 6,
  islamic_banking: 7,
  stock_market: 8,
  diversification: 9,
  tax_filer: 10,
};

const levelToConcept: Record<number, string> = {
  1: "budgeting",
  2: "saving",
  3: "emergency_funds",
  4: "inflation",
  5: "investing",
  6: "mutual_funds",
  7: "islamic_banking",
  8: "stock_market",
  9: "diversification",
  10: "tax_filer",
};

export default function StudyPage() {
  const [level, setLevel] = useState<number>(1);
  const [concept, setConcept] = useState<string>("budgeting");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const conceptParam = params.get("concept");
      const levelParam = params.get("level");

      if (conceptParam && conceptToLevel[conceptParam]) {
        setConcept(conceptParam);
        setLevel(conceptToLevel[conceptParam]);
      } else if (levelParam) {
        const lvl = parseInt(levelParam);
        if (lvl >= 1 && lvl <= 10) {
          setLevel(lvl);
          setConcept(levelToConcept[lvl] || "budgeting");
        }
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <p className="text-lg animate-pulse">Sabaq load ho raha hai...</p>
        </div>
      </div>
    );
  }

  const guide = studyMaterials[level];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-emerald-400" size={20} />
              Level {level} Study Guide
            </h1>
            <p className="text-xs md:text-sm text-slate-400">{guide?.title || "Financial Literacy"}</p>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={14} /> Wapis Dashboard
          </a>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
          {guide ? (
            <>
              {/* Study Material Main Panel */}
              <GlassCard className="p-8 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden" hover={false}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-emerald-400 font-urdu mt-1" dir="rtl">
                      {guide.urduTitle}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Sabaq ke Ahem Nukaat (سبق کے اہم نکات)
                  </p>
                  <ul className="space-y-4">
                    {guide.content.map((point, index) => {
                      const parts = point.split("**");
                      return (
                        <li key={index} className="text-sm sm:text-base text-slate-200 flex items-start gap-3.5 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                          <span className="flex-1">
                            {parts.map((part, i) => (
                              i % 2 === 1 ? <strong key={i} className="text-emerald-400 font-bold">{part}</strong> : part
                            ))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 mt-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    💡 <strong>Tip:</strong> Is sabaq ko dhyan se parhein aur zehen-nasheen karlein. Agar aap in nukaat ko samajh lete hain, to aap Level {level} ke quiz mein aasaani se 16/20 ya is se zyada score kar sakte hain!
                  </div>
                </div>
              </GlassCard>

              {/* Next Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Voice Tutor Action */}
                <GlassCard className="p-6 border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between" onClick={() => window.location.href = `/tutor?concept=${concept}`}>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Mic size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white">Ask AI Tutor (Urdu Voice)</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Agar koi concept samajh nahi aaya, to AI voice coach se Urdu mein baat karein aur sawal poochein.
                    </p>
                  </div>
                  <div className="mt-6 text-xs font-semibold text-emerald-400">
                    AI Tutor Launch Karein &rarr;
                  </div>
                </GlassCard>

                {/* Take Quiz Action */}
                <GlassCard className="p-6 border border-white/5 hover:border-yellow-500/20 transition-all flex flex-col justify-between" onClick={() => window.location.href = `/quiz?level=${level}`}>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                      <Award size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white">Take Level {level} Quiz</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Kya aap tayyar hain? 20 MCQs ka test dein, 75% score kar ke rank ascend karein.
                    </p>
                  </div>
                  <div className="mt-6 text-xs font-semibold text-yellow-400">
                    Level Quiz Shuru Karein &rarr;
                  </div>
                </GlassCard>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Sabaq ka data dastiyab nahi hai.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
