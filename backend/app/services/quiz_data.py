from pydantic import BaseModel

class Question(BaseModel):
    id: int
    level: int
    question: str
    options: dict[str, str]
    correct_option: str
    explanation: str

# ═══════════════════════════════════════════════════════════════
# 200 HARDCODED MULTIPLE-CHOICE QUESTIONS (20 per Level, 10 Levels)
# ═══════════════════════════════════════════════════════════════

QUIZ_QUESTIONS: list[dict] = [
    # ─── LEVEL 1: BUDGETING BASICS (1-20) ───
    {
        "id": 1,
        "level": 1,
        "question": "Budget banane ka sabse pehla usool kya hai?",
        "options": {
            "a": "Saare paise kharach kar dena",
            "b": "Income aur expenses ka hisaab rakhna",
            "c": "Doston se udhar lena",
            "d": "Sarmayakari na karna"
        },
        "correct_option": "b",
        "explanation": "Budgeting ka pehla usool apni amdani aur kharchon ka track rakhna hai taake aap ko pata chale paisa kahan ja raha hai."
    },
    {
        "id": 2,
        "level": 1,
        "question": "50-30-20 rule mein 50% hissa kis cheez ke liye hota hai?",
        "options": {
            "a": "Zarooriyat (Needs) jaise rent, bill aur khana",
            "b": "Khwahishat (Wants) jaise shopping aur ghumna",
            "c": "Bachat (Savings) aur invest karna",
            "d": "Karza wapis karna"
        },
        "correct_option": "a",
        "explanation": "50-30-20 rule ke mutabiq 50% hissa aap ki bunyadi aur lazmi zarooriyat (Needs) ke liye mukhtas hota hai."
    },
    {
        "id": 3,
        "level": 1,
        "question": "50-30-20 rule mein 30% kis cheez ke liye rakha jata hai?",
        "options": {
            "a": "Emergency fund",
            "b": "Ghar ka kiraya",
            "c": "Khwahishat (Wants) aur entertainment",
            "d": "Sarkari tax"
        },
        "correct_option": "c",
        "explanation": "30% hissa aap ki ghair-zaroori khwahishat (Wants) jaise hoteling, shopping aur entertainment ke liye hota hai."
    },
    {
        "id": 4,
        "level": 1,
        "question": "50-30-20 rule ke mutabiq amdani ka kitna hissa bachat (savings) mein jana chahiye?",
        "options": {
            "a": "10%",
            "b": "20%",
            "c": "50%",
            "d": "0%"
        },
        "correct_option": "b",
        "explanation": "Is rule ke mutabiq kam az kam 20% hissa bachat aur sarmayakari ke liye alag karna chahiye."
    },
    {
        "id": 5,
        "level": 1,
        "question": "Ghair-zaroori kharche (Wants) aur Zarooriyat (Needs) mein kya farq hai?",
        "options": {
            "a": "Dono mein koi farq nahi hota",
            "b": "Needs ke baghair zindagi guzarna mushkil hai, Wants ghair-zaroori hain",
            "c": "Wants zyada zaroori hoti hain",
            "d": "Needs sirf rich logon ke liye hoti hain"
        },
        "correct_option": "b",
        "explanation": "Needs woh cheezein hain jin ke baghair guzara mumkin nahi (jaise khana, sehat, ghar). Wants sirf shauq poore karne ke liye hain."
    },
    {
        "id": 6,
        "level": 1,
        "question": "Budgeting track karne ke liye kya cheez sab se asaan aur moassar hai?",
        "options": {
            "a": "Rozana ke kharchon ko note na karna",
            "b": "Mobile app ya diary mein rozana ka kharcha likhna",
            "c": "Tankha aate hi saari kharach kar dena",
            "d": "Sirf baray kharchay yaad rakhna"
        },
        "correct_option": "b",
        "explanation": "Rozana ke chote aur baray kharchon ko diary ya mobile app mein likhne se aap ka budget control mein rehta hai."
    },
    {
        "id": 7,
        "level": 1,
        "question": "Fixed expenses (pakke kharche) ki ek misal kya hai?",
        "options": {
            "a": "Doston ke saath khana khana",
            "b": "Ghar ka monthly kiraya (Rent)",
            "c": "Naye kapray khareedna",
            "d": "Cinema ki ticket"
        },
        "correct_option": "b",
        "explanation": "Fixed expenses woh hote hain jo har mahine lagbhag barabar hote hain aur lazmi dene hote hain, jaise ghar ka kiraya."
    },
    {
        "id": 8,
        "level": 1,
        "question": "Variable expenses (badalte kharche) ki misal kaunsi hai?",
        "options": {
            "a": "Ghar ke utility bills aur grocery",
            "b": "School fees",
            "c": "Ghar ki mortgage payment",
            "d": "Bank ka fixed service charge"
        },
        "correct_option": "a",
        "explanation": "Variable expenses badalte rehte hain. Jaise bijli ka bill garmiyon mein barh jata hai aur grocery ka kharcha bhi updown hota hai."
    },
    {
        "id": 9,
        "level": 1,
        "question": "Agar aap ka monthly kharcha aap ki income se zyada ho jaye, toh ise kya kehte hain?",
        "options": {
            "a": "Budget Surplus",
            "b": "Budget Deficit (Nuqsan)",
            "c": "Balanced Budget",
            "d": "Saving Profit"
        },
        "correct_option": "b",
        "explanation": "Jab kharche amdani se barh jayein toh use Budget Deficit kehte hain, jise poora karne ke liye udhar lena parta hai."
    },
    {
        "id": 10,
        "level": 1,
        "question": "Apna budget deficit control karne ka sab se behtar tarika kya hai?",
        "options": {
            "a": "Ghair-zaroori kharchon (Wants) ko kam karna",
            "b": "Utilities bills dena band kar dena",
            "c": "Credit card se mazeed shopping karna",
            "d": "Khana pina band kar dena"
        },
        "correct_option": "a",
        "explanation": "Wants (entertainment, luxury shopping, bahar ka khana) ko kam kar ke budget deficit ko asani se control kiya ja sakta hai."
    },
    {
        "id": 11,
        "level": 1,
        "question": "Budget Surplus kya hota hai?",
        "options": {
            "a": "Kharche aur amdani barabar hona",
            "b": "Amdani kharchon se zyada hona",
            "c": "Karza barh jana",
            "d": "Bank account block hona"
        },
        "correct_option": "b",
        "explanation": "Jab kharch karne ke baad bhi amdani mein se paise bach jayein, toh use Budget Surplus kehte hain jo bachat banta hai."
    },
    {
        "id": 12,
        "level": 1,
        "question": "Pakistani household mein kharchay control karne ke liye kis cheez ki planning zaroori hai?",
        "options": {
            "a": "Monthly rashan (grocery) ka pehle se estimate banana",
            "b": "Rozana bazaar ja kar shopping karna",
            "c": "Bina soche baray discount dekh kar cheezein lena",
            "d": "Bachat ke bare mein na sochna"
        },
        "correct_option": "a",
        "explanation": "Monthly rashan ki list banana aur thok (bulk) mein khareedari karna kharchay kam karne ka behtar tarika hai."
    },
    {
        "id": 13,
        "level": 1,
        "question": "Kamyab budgeting ke liye 'Pay Yourself First' ka kya matlab hai?",
        "options": {
            "a": "Baki kharchon se pehle bachat ka hissa alag kar lena",
            "b": "Saari tankha khud par udana",
            "c": "Pehle credit card ka bill dena",
            "d": "Tohfe khareedna"
        },
        "correct_option": "a",
        "explanation": "'Pay Yourself First' ka matlab hai ke tankha aate hi sab se pehle apni savings ka 10-20% alag karein, phir baqi paise kharach karein."
    },
    {
        "id": 14,
        "level": 1,
        "question": "Ghair-zaroori subscription (jaise Netflix, gaming passes) kis category mein aate hain?",
        "options": {
            "a": "Fixed Needs",
            "b": "Discretionary Wants (Khwahishat)",
            "c": "Savings",
            "d": "Investment assets"
        },
        "correct_option": "b",
        "explanation": "Subscription bills zaroori nahi hain, yeh Wants hain jinhein zaroorat parne par band kar ke paise bachaye ja sakte hain."
    },
    {
        "id": 15,
        "level": 1,
        "question": "Kharche kam karne ke liye 24-hour rule kya hai?",
        "options": {
            "a": "24 ghante khana na khana",
            "b": "Koi bhi bari ghair-zaroori cheez khareedne se pehle 24 ghante sochna",
            "c": "24 ghante mein saari tankha kharach karna",
            "d": "24 ghante bank transaction na karna"
        },
        "correct_option": "b",
        "explanation": "24-hour rule impulsive buying (bina soche samjhe khareedari) ko rokta hai, jis se aap ka fizool kharch bach jata hai."
    },
    {
        "id": 16,
        "level": 1,
        "question": "Envelope system (lifafay ka tareeqa) budgeting mein kya karta hai?",
        "options": {
            "a": "Har kharche ki category ke liye cash alag lifafay mein rakhna",
            "b": "Lifafon mein khat likhna",
            "c": "Sari savings bank se nikal kar ghar chupati hai",
            "d": "Ghair-zaroori khatoot phenkna"
        },
        "correct_option": "a",
        "explanation": "Envelope system ke mutabiq aap har mahine har category (jaise rashan, bills, fuel) ke liye cash lifafay mein rakhte hain aur usi had tak kharch karte hain."
    },
    {
        "id": 17,
        "level": 1,
        "question": "Kya impulse buying (bina plan kiye cheezein lena) budget ke liye acha hai?",
        "options": {
            "a": "Haan, is se dil khush hota hai",
            "b": "Nahi, is se budget kharab hota hai aur deficit hota hai",
            "c": "Haan, is se savings barhti hain",
            "d": "Is ka budget par koi asar nahi hota"
        },
        "correct_option": "b",
        "explanation": "Impulse buying budget ko foran kharab karti hai kyunke yeh kharche pehle se planned nahi hote."
    },
    {
        "id": 18,
        "level": 1,
        "question": "Weekly budget review ka kya faida hai?",
        "options": {
            "a": "Haftay ke aakhir mein party karna",
            "b": "Apne kharchon par nazar rakhna taake mahine ke aakhir mein deficiency na ho",
            "c": "Apni salary barhana",
            "d": "Bank transfer check karna"
        },
        "correct_option": "b",
        "explanation": "Weekly review se aap ko waqt par pata chal jata hai ke aap limit se bahar ja rahe hain ya nahi."
    },
    {
        "id": 19,
        "level": 1,
        "question": "Amdani (Income) ki kitni aqsaam ho sakti hain?",
        "options": {
            "a": "Sirf aik (Job)",
            "b": "Dono: Active (kaam kar ke) aur Passive (bina rozana kaam kiye)",
            "c": "Sirf Passive",
            "d": "Sirf gift mein milne wala paisa"
        },
        "correct_option": "b",
        "explanation": "Amdani do tarah ki hoti hai: Active (Salary, wages) aur Passive (Rent, business profit, dividends)."
    },
    {
        "id": 20,
        "level": 1,
        "question": "Bachat karne ka asal faida kya hai?",
        "options": {
            "a": "Ghar mein cash jama karna",
            "b": "Mushkil waqt mein sukoon aur behtar kal ki sarmayakari ki bunyaad",
            "c": "Fizool kharchi barhana",
            "d": "Inflation barhana"
        },
        "correct_option": "b",
        "explanation": "Bachat aap ko mushkil waqt mein financial security deti hai aur sarmayakari kar ke mazeed wealth barhane ka moqa deti hai."
    },

    # ─── LEVEL 2: SAVING HABITS (21-40) ───
    {
        "id": 21,
        "level": 2,
        "question": "Saving (Bachat) aur Investing (Sarmayakari) mein kya farq hai?",
        "options": {
            "a": "Saving mein paisa barhta hai, investing mein waisa hi rehta hai",
            "b": "Saving mein paisa mehfooz rakhte hain, investing mein grow karne ke liye risk lete hain",
            "c": "Dono bilkul aik hi cheez hain",
            "d": "Saving rich log karte hain, investing poor log"
        },
        "correct_option": "b",
        "explanation": "Saving ka maqsad paise ko mehfooz aur asani se dastiyab rakhna hai, jabke investing ka maqsad return hasil kar ke wealth barhana hai."
    },
    {
        "id": 22,
        "level": 2,
        "question": "Bank mein 'Savings Account' kholne ka kya faida hai?",
        "options": {
            "a": "Paisa chori hone ka dar khatam aur thora bohat interest/profit milta hai",
            "b": "Bank wale aap ka paisa kha jate hain",
            "c": "Sari transaction free ho jati hain",
            "d": "Ghar se zyada cash dastiab hota hai"
        },
        "correct_option": "a",
        "explanation": "Savings account bank mein security deta hai aur aap ko aap ke balance par saalana bunyaad par profit/interest deta hai."
    },
    {
        "id": 23,
        "level": 2,
        "question": "Committee (ROSCA) system Pakistan mein saving ke liye kyun mashhoor hai?",
        "options": {
            "a": "Is mein har mahine lottery lagti hai",
            "b": "Yeh discipline aur community trust ke zariye save karne ka aam tareeqa hai",
            "c": "Is par bank interest milta hai",
            "d": "Yeh illegal hoti hai"
        },
        "correct_option": "b",
        "explanation": "Committee (Rotating Saving and Credit Association) mein trust ki bunyaad par log har mahine paise jama karte hain aur baari baari poori raqam milti hai."
    },
    {
        "id": 24,
        "level": 2,
        "question": "Committee system ka sab se bara nuqsan kya hai?",
        "options": {
            "a": "Koi interest/profit nahi milta aur inflation ki wajah se paise ki value girti hai",
            "b": "Bank charge lagata hai",
            "c": "Yeh online nahi hoti",
            "d": "Paisa tax filer ho jata hai"
        },
        "correct_option": "a",
        "explanation": "Committee mein jama kiye gaye paise par koi profit nahi milta, lehaza inflation ki wajah se saal ke aakhir tak us raqam ki quwwat-e-khareed kam ho jati hai."
    },
    {
        "id": 25,
        "level": 2,
        "question": "Ghar mein cash (under the mattress) rakhna kyun mehnga parta hai?",
        "options": {
            "a": "Chori hone ka khatra aur zero return ki wajah se inflation paisay ki value kha jati hai",
            "b": "Bank wale ghar aa kar paise cheen lete hain",
            "c": "Ghar ka kiraya barh jata hai",
            "d": "Cash par tax lag jata hai"
        },
        "correct_option": "a",
        "explanation": "Ghar mein cash bilkul safe nahi hota aur bina kisi profit ke inflation ki wajah se waqt ke sath is ki value gir jati hai."
    },
    {
        "id": 26,
        "level": 2,
        "question": "Saving habits ko barhane ke liye 'Automated Savings' kya hai?",
        "options": {
            "a": "Robot se bachat karwana",
            "b": "Bank account se automatic savings account mein paise transfer ki setting lagana",
            "c": "Bina bataye paise gayab kar dena",
            "d": "Automatic gari khareedna"
        },
        "correct_option": "b",
        "explanation": "Automatic transfers set karne se tankha aate hi savings ka hissa khud-ba-khud alag ho jata hai, jis se kharch karne ka moqa nahi milta."
    },
    {
        "id": 27,
        "level": 2,
        "question": "Bachat shuru karne ka behtar waqt kab hota hai?",
        "options": {
            "a": "Bura waqt aane ke baad",
            "b": "Pehli kamai ya tankha milne par foran",
            "c": "Jab aap rich ho jayein",
            "d": "40 saal ki umar ke baad"
        },
        "correct_option": "b",
        "explanation": "Bachat jitni jaldi shuru ki jaye, compounding aur time ki wajah se utna hi zyada financial cushion milta hai."
    },
    {
        "id": 28,
        "level": 2,
        "question": "Hamare kharchon mein 'Invisible leaks' (chote chote ghair-zaroori kharche) budget ko kaise nuqsan pahunchate hain?",
        "options": {
            "a": "Rozana ka aik chota kharcha saal ke aakhir mein bari raqam ban jata hai",
            "b": "Paisa bank account se chori ho jata hai",
            "c": "In ka koi nuqsan nahi hota",
            "d": "Tax barh jata hai"
        },
        "correct_option": "a",
        "explanation": "Jaise rozana Rs. 100 ki chaye ya fizool snacks saal mein Rs. 36,500 se zyada ban jate hain, jo ke aik bari saving ho sakti thi."
    },
    {
        "id": 29,
        "level": 2,
        "question": "Saving increase karne ke liye kya cheez karni chahiye?",
        "options": {
            "a": "Lifestyle creep (khwahishat barhana) ko rokna",
            "b": "Salary barhne par saara kharcha barha dena",
            "c": "Bank jana chhor dena",
            "d": "Sari raqam gold mein daba dena"
        },
        "correct_option": "a",
        "explanation": "Salary barhne ke sath kharchon ko na barhana (Lifestyle Inflation/Creep ko rokna) savings ko tezi se barhata hai."
    },
    {
        "id": 30,
        "level": 2,
        "question": "PLS (Profit and Loss Sharing) savings account mein profit kahan se aata hai?",
        "options": {
            "a": "Bank apnay paas se deta hai",
            "b": "Halal karobar ke munafay aur losses ki partnership se",
            "c": "Sood (Riba) se",
            "d": "Tax collection se"
        },
        "correct_option": "b",
        "explanation": "PLS account mein bank aap ke paise ko invest karta hai aur hone wala profit ya loss aapse share karta hai."
    },
    {
        "id": 31,
        "level": 2,
        "question": "Kaunsi aadat saving ko foran barha sakti hai?",
        "options": {
            "a": "Sale aur discounts dekh kar shopping karna",
            "b": "Ghar ka bana khana khana aur bahar ke kharchon ko kam karna",
            "c": "Credit card ki limit barhana",
            "d": "Doston se borrowing barhana"
        },
        "correct_option": "b",
        "explanation": "Home-cooked meal aur simple lifestyle se monthly kharchay lagbhag 30% tak kam ho sakte hain."
    },
    {
        "id": 32,
        "level": 2,
        "question": "Bachat ka pehla target kya hona chahiye?",
        "options": {
            "a": "Luxury gari khareedna",
            "b": "Aik Emergency Fund banana",
            "c": "Stock market mein paisa lagana",
            "d": "Foreign trip pe jana"
        },
        "correct_option": "b",
        "explanation": "Emergency Fund banana bachat ka pehla aur aham tareen target hota hai jo unexpected halat se bachata hai."
    },
    {
        "id": 33,
        "level": 2,
        "question": "Saving rates barhane ke liye 'Matching Savings' ka kya matlab hai?",
        "options": {
            "a": "Jitna paisa kharach karein, utna hi save karein",
            "b": "Double bank account banana",
            "c": "Kapray matching kar ke shopping karna",
            "d": "Bank ka interest rate match karna"
        },
        "correct_option": "a",
        "explanation": "Jitna aap wants par kharach karte hain, utna hi savings account mein dalna 'matching savings' habit kehlaati hai jo kharchon par kabu rakhti hai."
    },
    {
        "id": 34,
        "level": 2,
        "question": "TDR (Term Deposit Receipt) ya Fixed Deposit kya hai?",
        "options": {
            "a": "Aik makhsoos waqt ke liye bank mein paisa lock karna jis par behtar profit milta hai",
            "b": "Bank ka checking account",
            "c": "Sarkari loan scheme",
            "d": "Chori shuda paisa check karne ka rasta"
        },
        "correct_option": "a",
        "explanation": "Fixed Deposit mein aap 1 saal ya 3 saal ke liye raqam rakhwa dete hain aur bank is par aam account se zyada profit rate deta hai."
    },
    {
        "id": 35,
        "level": 2,
        "question": "Kya TDR/Fixed Deposit mein se waqt se pehle paisa nikalne par penalty hoti hai?",
        "options": {
            "a": "Nahi, asani se nikal sakta hai",
            "b": "Haan, bank profit ka kuch hissa ya fee kaat leta hai",
            "c": "Bank account block kar deta hai",
            "d": "Penalty nahi hoti, balke munafa double ho jata hai"
        },
        "correct_option": "b",
        "explanation": "Waqt se pehle raqam nikalne par (Premature encashment) bank thori penalty ya profit reduction lagata hai."
    },
    {
        "id": 36,
        "level": 2,
        "question": "Kamyab saving ke liye target setting kyun zaroori hai?",
        "options": {
            "a": "Taake aap ko pata ho ke aap kis cheez (jaise taleem, shadi) ke liye save kar rahe hain",
            "b": "Target se bank manager khush hota hai",
            "c": "Is se income barh jati hai",
            "d": "Target setting se tax bach jata hai"
        },
        "correct_option": "a",
        "explanation": "Wazeh targets (Goals) bachat karne ka hosla barhate hain aur fizool kharch ko rokte hain."
    },
    {
        "id": 37,
        "level": 2,
        "question": "National Savings (Bachat Schemes) Pakistan mein kaun chalata hai?",
        "options": {
            "a": "Private Commercial Banks",
            "b": "Hukoomat-e-Pakistan (Government of Pakistan)",
            "c": "Foreign investors",
            "d": "Stock exchange partners"
        },
        "correct_option": "b",
        "explanation": "National Savings government-backed schemes hain jo mehfooz bachat aur munasib returns deti hain."
    },
    {
        "id": 38,
        "level": 2,
        "question": "Bachat karne walon ko kya asan faida milta hai?",
        "options": {
            "a": "Financial independence aur dimag ka sukoon",
            "b": "Bina kaam kiye salary milna",
            "c": "Tax se mukammal chhutkara",
            "d": "Free medical insurance"
        },
        "correct_option": "a",
        "explanation": "Bachat karne se stress kam hota hai aur mushkil waqt mein kisi ke aagay hath nahi phelana parta."
    },
    {
        "id": 39,
        "level": 2,
        "question": "Monthly budgeting ke doran savings ko kis tarah handle karna chahiye?",
        "options": {
            "a": "Kharche ke baad jo bache woh save karein",
            "b": "Tankha aate hi sab se pehle savings nikal lein (Pay yourself first)",
            "c": "Monthly savings na karein, saal ke aakhir mein karein",
            "d": "Savings ko har mahine badalte rahein"
        },
        "correct_option": "b",
        "explanation": "Sab se pehle savings nikalne se bachat guaranteed hoti hai, jabke aakhir mein bachane se aksar kuch nahi bachta."
    },
    {
        "id": 40,
        "level": 2,
        "question": "Micro-savings apps ka kya kaam hota hai?",
        "options": {
            "a": "Bari raqam udhar dena",
            "b": "Choti choti transactions par rounds-up kar ke bachat karna",
            "c": "Currency note print karna",
            "d": "Tax file karna"
        },
        "correct_option": "b",
        "explanation": "Micro-savings apps choti choti khareedari par rehti change ya thore thore paise automatic savings account mein daalti hain."
    },

    # ─── LEVEL 3: EMERGENCY FUNDS (41-60) ───
    {
        "id": 41,
        "level": 3,
        "question": "Emergency Fund (Hangami Fund) kya hota hai?",
        "options": {
            "a": "Naye saal ki party ke liye raqam",
            "b": "Ghair-mutawaqqe haadsaat ya mushkil waqt ke liye alag rakhi gayi raqam",
            "c": "Gari khareedne ke liye loan",
            "d": "Sarmayakari ki schemes"
        },
        "correct_option": "b",
        "explanation": "Emergency fund woh raqam hai jo unexpected events jaise naukri ka jana, beemari, ya emergency repairs ke liye alag rakhi jati hai."
    },
    {
        "id": 42,
        "level": 3,
        "question": "Emergency Fund mein kam az kam kitni raqam honi chahiye?",
        "options": {
            "a": "1 hafte ke kharche ke barabar",
            "b": "3 se 6 mahine ke monthly kharchon ke barabar",
            "c": "10 saal ke kharche ke barabar",
            "d": "Rs. 10,000 fixed"
        },
        "correct_option": "b",
        "explanation": "Maazireen ke mutabiq emergency fund kam az kam 3 se 6 mahine ke zaroori akhrajaat ke barabar hona chahiye taake backup rahay."
    },
    {
        "id": 43,
        "level": 3,
        "question": "Emergency Fund ko kahan rakhna sab se behtar hai?",
        "options": {
            "a": "Stock market mein direct investment mein",
            "b": "Asan pohanch wale savings account ya liquid fund mein",
            "c": "Gold khareed kar dafan karne mein",
            "d": "Kisi committee mein dalne mein"
        },
        "correct_option": "b",
        "explanation": "Emergency fund liquid (foran nikalne ke qabil) hona chahiye, jaise savings account ya money market funds, taake emergency mein foran mil sake."
    },
    {
        "id": 44,
        "level": 3,
        "question": "Kya Emergency Fund ko real estate (zameen/makaan) mein lagana chahiye?",
        "options": {
            "a": "Haan, zameen ki qeemat barhti hai",
            "b": "Nahi, property ko foran bech kar cash hasil karna bohut mushkil aur waqt talab hai",
            "c": "Property safe hoti hai chori se",
            "d": "Property par interest rate milta hai"
        },
        "correct_option": "b",
        "explanation": "Real estate liquid asset nahi hai. Zaroorat ke waqt property bechne mein mahino lag sakte hain, is liye yeh emergency fund ke liye bilkul theek nahi hai."
    },
    {
        "id": 45,
        "level": 3,
        "question": "Kaunsi situation Emergency Fund se paise nikalne ke liye bilkul jaiz hai?",
        "options": {
            "a": "Achanak beemari ke elaj ke liye bank bill pay karna",
            "b": "Eid par naya mobile discount par milna",
            "c": "Friends ke sath trip pe jana",
            "d": "Shopping sale lagna"
        },
        "correct_option": "a",
        "explanation": "Achanak bimari ya unexpected medical expense asal emergency hai, jabke cell phone sale ya shopping koi emergency nahi."
    },
    {
        "id": 46,
        "level": 3,
        "question": "Emergency Fund na hone ka sab se bara nuqsan kya hai?",
        "options": {
            "a": "Bank interest nahi deta",
            "b": "Mushkil waqt mein soodi karz (debt) lena parta hai ya assets saste bechne parte hain",
            "c": "Income tax barh jata hai",
            "d": "Dost naraz ho jate hain"
        },
        "correct_option": "b",
        "explanation": "Agar emergency fund na ho toh achanak zaroorat parne par log bank se soodi karza lete hain ya zewar/property saste mein bechne par majboor hote hain."
    },
    {
        "id": 47,
        "level": 3,
        "question": "Emergency Fund banana kab shuru karna chahiye?",
        "options": {
            "a": "Jab salary Rs. 2,00,000 ho jaye",
            "b": "Bachat ki aadat ke sath hi pehle mahine se hi chota hissa rakh kar",
            "c": "Shadi ke baad",
            "d": "Retirement ke waqt"
        },
        "correct_option": "b",
        "explanation": "Monthly saving ka ek makhsoos hissa regular base par emergency fund mein daal kar thora thora kar ke fund khara kiya jata hai."
    },
    {
        "id": 48,
        "level": 3,
        "question": "Kaunsi cheez Emergency Fund ke daire (Scope) se bahar hai?",
        "options": {
            "a": "Naukri chale jana (Job loss)",
            "b": "Mobile phone ka screen damage hona",
            "c": "Achanak ghar ki chat tapakna (leak)",
            "d": "Bari medical surgery"
        },
        "correct_option": "b",
        "explanation": "Ghair-zaroori gadgets ya un ki repairs emergency fund se nahi balke wants savings se honi chahiye."
    },
    {
        "id": 49,
        "level": 3,
        "question": "Liquidity se kya murad hai?",
        "options": {
            "a": "Paani ki tarah paisa kharach karna",
            "b": "Kisi asset ko bina nuksan ke kitni jaldi cash mein tabdeel kiya ja sakta hai",
            "c": "Foreign currency",
            "d": "Bank ka branch system"
        },
        "correct_option": "b",
        "explanation": "Liquidity ka matlab hai ke aap ka asset kitni asani se cash ban sakta hai. Cash aur savings account sab se zyada liquid hain."
    },
    {
        "id": 50,
        "level": 3,
        "question": "Emergency Fund ko inflation se bachane ke liye safe aur liquid tarika kya hai?",
        "options": {
            "a": "Gold coin khareed kar safe locker mein rakhna",
            "b": "Shariah-compliant Money Market Mutual Funds mein rakhna",
            "c": "National Savings Certificates (10 saal)",
            "d": "Checking Account mein rakhna"
        },
        "correct_option": "b",
        "explanation": "Money market mutual funds mein liquidity bhi hoti hai (1-2 din mein cash mil jata hai) aur PLS bank account se thora behtar return milta hai."
    },
    {
        "id": 51,
        "level": 3,
        "question": "Agar aap ne emergency fund ka kuch hissa kharach kar liya ho toh kya karna chahiye?",
        "options": {
            "a": "Fund ko waisa hi chor dein",
            "b": "Agli bachat se sab se pehle is fund ko dobara poora (replenish) karein",
            "c": "Karza le kar poora karein",
            "d": "Use investment account mein shift kar dein"
        },
        "correct_option": "b",
        "explanation": "Fund ka istemal karne ke baad pehli priority use dobara 3-6 mahine ke target par poora karna honi chahiye."
    },
    {
        "id": 52,
        "level": 3,
        "question": "Emergency Fund build karte waqt kis cheez ka hisaab lagana zaroori hai?",
        "options": {
            "a": "Apni poori salary",
            "b": "Monthly essential expenses (sirf zaroori akhrajaat jaise khana, rent, bills)",
            "c": "Apni net worth",
            "d": "Bahar khane ka kharcha"
        },
        "correct_option": "b",
        "explanation": "Emergency mein aap ghair-zaroori kharche band kar dete hain, is liye fund sirf zaroori expenses (Needs) ki bunyaad par calculate hota hai."
    },
    {
        "id": 53,
        "level": 3,
        "question": "Kya Emergency Fund se investment karni chahiye?",
        "options": {
            "a": "Haan, stock market mein faida ho sakta hai",
            "b": "Nahi, kyunke loss hone ki surat mein emergency ke waqt paisa kam ho sakta hai",
            "c": "Haan, property khareed lein",
            "d": "Haan, cryptocurrency mein daal dein"
        },
        "correct_option": "b",
        "explanation": "Emergency fund safety aur liquidity ke liye hota hai, returns ke liye nahi. Is par high risk investment bilkul nahi karni chahiye."
    },
    {
        "id": 54,
        "level": 3,
        "question": "Single earning member (akela kamane wala) wale ghar ke liye emergency fund kitna hona chahiye?",
        "options": {
            "a": "3 mahine ka kafi hai",
            "b": "Kam az kam 6 se 9 mahine ka, kyunke risk zyada hota hai",
            "c": "Zaroorat nahi hoti",
            "d": "1 saal ki salary ke barabar"
        },
        "correct_option": "b",
        "explanation": "Akela kamane wale par risk zyada hota hai, agar naukri chali jaye toh poora ghar mutasir hota hai, is liye bara fund zaroori hai."
    },
    {
        "id": 55,
        "level": 3,
        "question": "Self-employed (karobar/freelancing) logon ke liye emergency fund kyun bara hona chahiye?",
        "options": {
            "a": "Unhein bank loan nahi deta",
            "b": "Un ki income monthly base par fix nahi hoti aur updown chalta hai",
            "c": "Un par tax zyada hota hai",
            "d": "Unhein business loss ka dar nahi hota"
        },
        "correct_option": "b",
        "explanation": "Freelancer ya karobari hazraat ki monthly income fix nahi hoti, is liye be-yakeeni ki surat mein bara fund sukoon deta hai."
    },
    {
        "id": 56,
        "level": 3,
        "question": "Emergency Fund ka dimag par kya asar hota hai?",
        "options": {
            "a": "Insecurity barhti hai",
            "b": "Financial anxiety aur stress kam hota hai aur sukoon milta hai",
            "c": "Fizool kharchi ki adat barhti hai",
            "d": "Kuch asar nahi hota"
        },
        "correct_option": "b",
        "explanation": "Backup cash hone se achanak pareshaniyon ka dar nahi rehta aur insaan pursukoon rehta hai."
    },
    {
        "id": 57,
        "level": 3,
        "question": "Kaunsi situation Emergency Fund banane mein rukawat banti hai?",
        "options": {
            "a": "Monthly budget follow karna",
            "b": "Karzon (Debt) ka bojh aur minimum card payments",
            "c": "Amdani ka barhna",
            "d": "Low inflation rate"
        },
        "correct_option": "b",
        "explanation": "High interest debt (jaise credit cards) bachat aur emergency fund ko banne nahi dete kyunke monthly paise wahan chale jate hain."
    },
    {
        "id": 58,
        "level": 3,
        "question": "Emergency Fund kis type ke accounts mein separate rakhna behtar hai?",
        "options": {
            "a": "Aap ke daily spend card ke sath linked checking account mein",
            "b": "Aise savings account mein jis ka card aap wallet mein na rakhein",
            "c": "Bhai ke bank account mein",
            "d": "Ghar ki safe locker mein"
        },
        "correct_option": "b",
        "explanation": "Emergency account ko daily expenses se alag rakhna chahiye taake ghalti se ya shopping ke waqt woh paise kharach na ho jayein."
    },
    {
        "id": 59,
        "level": 3,
        "question": "Unexpected job loss (naukri se nikala jana) par emergency fund kya karta hai?",
        "options": {
            "a": "Aap ko naye business ke liye loan deta hai",
            "b": "Nayi job dhoondne tak monthly expenses poore karta hai bina kisi pareshani ke",
            "c": "Company par case karne mein madad karta hai",
            "d": "Salary double kar deta hai"
        },
        "correct_option": "b",
        "explanation": "Emergency fund financial runway deta hai taake aap sakoon se behtar naukri dhoond sakein aur jald-bazi mein buri job na lein."
    },
    {
        "id": 60,
        "level": 3,
        "question": "Emergency Fund aur Sinking Fund mein kya farq hai?",
        "options": {
            "a": "Dono bilkul aik hain",
            "b": "Emergency unexpected hoti hai, sinking fund planned future kharchay (jaise shadi, gari repair) ke liye hota hai",
            "c": "Sinking fund bank lock karta hai",
            "d": "Emergency fund government chalati hai"
        },
        "correct_option": "b",
        "explanation": "Sinking fund planned savings hain (jaise har mahine Rs. 5000 naye laptop ke liye bachana), jabke Emergency fund sirf un-planned achanak events ke liye hai."
    },

    # ─── LEVEL 4: INFLATION & MONEY (61-80) ───
    {
        "id": 61,
        "level": 4,
        "question": "Inflation (Afrao-te-Zar / Mehngai) kya hoti hai?",
        "options": {
            "a": "Bank account block hona",
            "b": "Cheezon ki qeematon ka waqt ke sath barhna aur paise ki quwwat-e-khareed kam hona",
            "c": "Market mein gold ki shortage",
            "d": "Sarkari tax ka khatam hona"
        },
        "correct_option": "b",
        "explanation": "Inflation ka matlab hai ke waqt ke sath cheezein mehngi ho rahi hain, aur ab Rs. 100 mein pehle se kam cheezein aati hain."
    },
    {
        "id": 62,
        "level": 4,
        "question": "Quwwat-e-Khareed (Purchasing Power) se kya murad hai?",
        "options": {
            "a": "Paisa khareedne ki taqat",
            "b": "Aik makhsoos raqam se aap kitni goods/services khareed sakte hain",
            "c": "Bank ki loan limit",
            "d": "Rich logon ki shopping power"
        },
        "correct_option": "b",
        "explanation": "Purchasing power ka matlab hai paise ki asal taqat. Agar pehle Rs. 1000 mein 10 kg aata aata tha aur ab sirf 5 kg aata hai, toh purchasing power aadhi ho gayi hai."
    },
    {
        "id": 63,
        "level": 4,
        "question": "Agar mulk mein inflation rate 15% hai, toh is ka kya asar hoga?",
        "options": {
            "a": "Ghar mein rakha Rs. 10,000 agle saal Rs. 11,500 ban jayega",
            "b": "Ghar mein rakhe Rs. 10,000 ki purchasing power agle saal Rs. 8,500 ke barabar ho jayegi",
            "c": "Bank account freeze ho jayega",
            "d": "Gold sasta ho jayega"
        },
        "correct_option": "b",
        "explanation": "Inflation cash ki value kam karti hai. Nominal rate Rs. 10,000 hi rahega par cheezein 15% mehngi hone se us ki real value Rs. 8,500 ho jayegi."
    },
    {
        "id": 64,
        "level": 4,
        "question": "Kaunsa asset inflation ke khilaf behtar hedge (difa) samjha jata hai?",
        "options": {
            "a": "Ghar mein rakha paper cash",
            "b": "Real estate, Gold aur Stocks/Mutual Funds",
            "c": "Checking Account balance",
            "d": "Bank ka prize bond"
        },
        "correct_option": "b",
        "explanation": "Gold, zameen, aur stocks waqt ke sath inflation ke mutabiq mehngay hote hain, lehaza yeh aap ki savings ko mehngai se bachate hain."
    },
    {
        "id": 65,
        "level": 4,
        "question": "Real Rate of Return (asal munafa) kaise calculate hota hai?",
        "options": {
            "a": "Nominal Return + Inflation Rate",
            "b": "Nominal Return - Inflation Rate",
            "c": "Interest Rate * Salary",
            "d": "Investment / Tax"
        },
        "correct_option": "b",
        "explanation": "Real rate of return nominal return mein se inflation nikal kar aata hai. Agar bank 10% de raha hai aur inflation 15% hai, toh real rate of return -5% (loss) hai."
    },
    {
        "id": 66,
        "level": 4,
        "question": "Hyperinflation kya hoti hai?",
        "options": {
            "a": "Inflation ka khatam hona",
            "b": "Bohat tezi se aur be-qabu tareeqe se qeematon ka barhna (mothly 50% se zyada)",
            "c": "Stock market crash hona",
            "d": "Interest rate zero hona"
        },
        "correct_option": "b",
        "explanation": "Hyperinflation mein mulk ki currency tezi se raddi ban jati hai aur har din qeematein barhti hain, jaise Zimbabwe ya Venezuela mein hua."
    },
    {
        "id": 67,
        "level": 4,
        "question": "Pakistan mein CPI (Consumer Price Index) kis cheez ke liye istemal hota hai?",
        "options": {
            "a": "Consumer taxes calculate karne ke liye",
            "b": "Mulk mein inflation (mehngai) rate ko naapne/measure karne ke liye",
            "c": "Stock rates check karne ke liye",
            "d": "Gold price define karne ke liye"
        },
        "correct_option": "b",
        "explanation": "CPI rozana ki zaroori cheezon (food, fuel, rent) ke rate check kar ke mulk mein chalne wala inflation rate batata hai."
    },
    {
        "id": 68,
        "level": 4,
        "question": "Demand-Pull Inflation kya hoti hai?",
        "options": {
            "a": "Tax barhne se qeemat barhna",
            "b": "Jab market mein cheezon ki demand barh jaye par supply kam ho, toh qeematein barhti hain",
            "c": "Mulk se paisa bahar jana",
            "d": "Currency print hona"
        },
        "correct_option": "b",
        "explanation": "Jab demand (khareedar) zyada hon aur supply (cheezein) kam, toh 'too much money chasing too few goods' ki wajah se mehngai hoti hai."
    },
    {
        "id": 69,
        "level": 4,
        "question": "Cost-Push Inflation kyun hoti hai?",
        "options": {
            "a": "Bank loans barhne se",
            "b": "Kham maal (Raw material) aur wages (mazdoori) mehngi hone se manufacturing cost barhna",
            "c": "Logon ke paas cash khatam hone se",
            "d": "Gold cheap hone se"
        },
        "correct_option": "b",
        "explanation": "Jab fuel, electricity, ya raw materials mehngay hote hain, toh factories production cost barha kar product mehnga kar deti hain (Cost-Push)."
    },
    {
        "id": 70,
        "level": 4,
        "question": "Currency devalution (rupay ki qadar girna) se Pakistan mein inflation kyun barhti hai?",
        "options": {
            "a": "Kyunke dollar mehnga hone se imported fuel aur raw material mehngay ho jate hain",
            "b": "Kyunke log shopping band kar dete hain",
            "c": "Kyunke bank interest rate gira deta hai",
            "d": "Is ka inflation par koi asar nahi hota"
        },
        "correct_option": "a",
        "explanation": "Pakistan imported products aur fuel par depend karta hai. Rupay ki qadar girne se import bil barh jata hai jo localized inflation lata hai."
    },
    {
        "id": 71,
        "level": 4,
        "question": "Inflation ka sab se zyada nuqsan kis tabqay ko hota hai?",
        "options": {
            "a": "Bari business class ko",
            "b": "Fixed monthly income (salary/pension) wale tabqay ko",
            "c": "Investors ko jo property mein invest karte hain",
            "d": "Gold traders ko"
        },
        "correct_option": "b",
        "explanation": "Fixed income wale afrad ki salary jaldi nahi barhti, par kharchay foran barh jate hain, jis se un ka guzara mushkil ho jata hai."
    },
    {
        "id": 72,
        "level": 4,
        "question": "Mulk mein inflation ko control karne ke liye State Bank (SBP) kya kadam uthata hai?",
        "options": {
            "a": "Interest rate (Policy Rate) barha deta hai",
            "b": "Interest rate zero kar deta hai",
            "c": "Rupay print karna band kar deta hai",
            "d": "Naye bank branches open karta hai"
        },
        "correct_option": "a",
        "explanation": "SBP interest rate (Policy rate/Discount rate) barhata hai taake commercial bank se loan lena mehnga ho jaye, log spending kam karein aur bachat barhaein."
    },
    {
        "id": 73,
        "level": 4,
        "question": "Deflation kya hoti hai?",
        "options": {
            "a": "Inflation ka bohot barh jana",
            "b": "Market mein qeematon ka musalsal girna (negatve inflation)",
            "c": "Currency note band hona",
            "d": "Taxes ka barhna"
        },
        "correct_option": "b",
        "explanation": "Deflation inflation ka ulat hai. Is mein cheezon ke daam girte hain. Sunne mein acha lagta hai par is se economic slowdown ho jata hai."
    },
    {
        "id": 74,
        "level": 4,
        "question": "Wage-Price Spiral kya hai?",
        "options": {
            "a": "Taxes barhne se salary barhna",
            "b": "Mehngai barhne se workers baray wages mangte hain, aur costs barhne se companies mazeed mehngai karti hain",
            "c": "Stock market mein growth rate",
            "d": "Foreign direct investment flow"
        },
        "correct_option": "b",
        "explanation": "Yeh aik cycle hai: Price barhne se salary demand barhti hai, wages barhne se production cost barhti hai, aur dobara price barh jati hai."
    },
    {
        "id": 75,
        "level": 4,
        "question": "Stagflation kis ajeeb situation ko kehte hain?",
        "options": {
            "a": "Economy grow kar rahi ho aur inflation zero ho",
            "b": "Economy mein growth na ho (stagnant) aur inflation and unemployment dono bohat high hon",
            "c": "Sirf taxes barh rahe hon",
            "d": "Currency bilkul khatam ho gayi ho"
        },
        "correct_option": "b",
        "explanation": "Stagflation dangerous hoti hai kyunke is mein unemployment barh rahi hoti hai aur saath mein zaroori cheezein bhi mehngi ho rahi hoti hain."
    },
    {
        "id": 76,
        "level": 4,
        "question": "Mulk mein zyada money printing (paisa chapna) se inflation kyun barhti hai?",
        "options": {
            "a": "Kyunke logon ke paas zyada note aane se paise ki qadar gir jati hai",
            "b": "Kyunke paper mehnga hota hai",
            "c": "Kyunke bank account lock ho jate hain",
            "d": "Money printing se inflation kam hoti hai"
        },
        "correct_option": "a",
        "explanation": "Agar hukoomat bina production barhaye sirf naye note chapti rahe, toh market mein liquidity barh jati hai aur currency devalue ho kar mehngai lati hai."
    },
    {
        "id": 77,
        "level": 4,
        "question": "Inflation se bachne ka kya hal hai agar aap ke paas savings accounts mein Rs. 1,00,000 hon?",
        "options": {
            "a": "Ghar mein lock kar dein",
            "b": "Aise assets mein invest karein jis ka profit rate inflation rate se zyada ho",
            "c": "Foran sari shopping kar lein",
            "d": "Savings account se checking mein transfer kar dein"
        },
        "correct_option": "b",
        "explanation": "Agara inflation 15% hai aur aap ka asset 18% return de raha hai, toh aap ki real savings barh rahi hain aur mehngai har rahi hai."
    },
    {
        "id": 78,
        "level": 4,
        "question": "Shrinkflation kya chupi hui mehngai hai?",
        "options": {
            "a": "Cheezon ki qeemat wahi rehna par un ka size/weight (khammi) kam kar dena",
            "b": "Shopping bags chote hona",
            "c": "Currency note chote hona",
            "d": "Bank charges barhna"
        },
        "correct_option": "a",
        "explanation": "Companies product ki keemat wahi rakhti hain (jaise chips packet Rs. 50) par us ka weight 100g se kam kar ke 80g kar deti hain (Shrinkflation)."
    },
    {
        "id": 79,
        "level": 4,
        "question": "Inflation indexation ka kya matlab hai?",
        "options": {
            "a": "Inflation ka measurement",
            "b": "Salary ya returns ko inflation rate ke mutabiq automatic adjust karna",
            "c": "Tax rates barhana",
            "d": "Dollar rate set karna"
        },
        "correct_option": "b",
        "explanation": "Indexation se users ki purchasing power safe rehti hai kyunke un ki income inflation ke sath barh jati hai."
    },
    {
        "id": 80,
        "level": 4,
        "question": "Asan lafzon mein: Inflation hamare paisay ka kya hai?",
        "options": {
            "a": "Dost",
            "b": "Chupay rustam chor (jo khamoshi se value chorata hai)",
            "c": "Multiplier",
            "d": "Sarmaya"
        },
        "correct_option": "b",
        "explanation": "Inflation khamoshi se bank mein pare cash ki real value kam karti rehti hai, is liye ise money thief bhi kehte hain."
    },

    # ─── LEVEL 5: INVESTING PRINCIPLES (81-100) ───
    {
        "id": 81,
        "level": 5,
        "question": "Sarmayakari (Investing) ka asal maqsad kya hota hai?",
        "options": {
            "a": "Apna paisa kharach karna",
            "b": "Apne paise par return hasil kar ke use waqt ke sath barhana",
            "c": "Bank manager ko khush rakhna",
            "d": "Karza lena"
        },
        "correct_option": "b",
        "explanation": "Investing ka maqsad assets khareedna hai jo aap ko profit, rent ya capital gains de kar aap ki wealth barhaein."
    },
    {
        "id": 82,
        "level": 5,
        "question": "Asset aur Liability mein kya farq hai?",
        "options": {
            "a": "Asset aap ki pocket se paisa nikalta hai, liability dalti hai",
            "b": "Asset aap ko paisa kama kar deta hai, liability aap ka paisa kharach karwati hai",
            "c": "Dono bilkul aik hi cheez hain",
            "d": "Liability rich log khareedte hain"
        },
        "correct_option": "b",
        "explanation": "Asset (property, stocks, savings certificates) aap ki wealth barhate hain. Liability (luxury car loan, personal debts) aap ka expense barhate hain."
    },
    {
        "id": 83,
        "level": 5,
        "question": "Risk aur Return ka aapas mein kya talluq hai?",
        "options": {
            "a": "Zyada risk par zyada return ka chance hota hai, aur loss ka chance bhi zyada hota hai",
            "b": "Kam risk par zyada return milta hai",
            "c": "Dono ka koi talluq nahi hota",
            "d": "High risk par return guaranteed hota hai"
        },
        "correct_option": "a",
        "explanation": "Finance ka sunehri usool hai: High Risk = High Potential Return (but also high potential loss). Low Risk = Low Return."
    },
    {
        "id": 84,
        "level": 5,
        "question": "Compound Interest/Return (Murakkab Munafa) ko '8th Wonder of the World' kyun kehte hain?",
        "options": {
            "a": "Kyunke yeh asman se girta hai",
            "b": "Kyunke is mein aap ke munafe par bhi munafa milta hai aur paisa exponentially barhta hai",
            "c": "Yeh sirf Pakistan mein hota hai",
            "d": "Yeh tax free hota hai"
        },
        "correct_option": "b",
        "explanation": "Simple return mein sirf original investment par profit milta hai. Compounding mein profit reinvest ho kar mazeed profit kamata hai, jo lambay waqt mein jadu ki tarah wealth barhata hai."
    },
    {
        "id": 85,
        "level": 5,
        "question": "Capital Gain kya hota hai?",
        "options": {
            "a": "Monthly rent milna",
            "b": "Kisi asset ko khareedne ki qeemat se zyada qeemat par bech kar hone wala munafa",
            "c": "Salary barhna",
            "d": "Tax discount milna"
        },
        "correct_option": "b",
        "explanation": "Agar aap ne share Rs. 100 ka liya aur use Rs. 150 mein bech diya, toh Rs. 50 ka munafa Capital Gain kehlayega."
    },
    {
        "id": 86,
        "level": 5,
        "question": "Dividend kya hota hai?",
        "options": {
            "a": "Asset bechne par penalty",
            "b": "Company ke munafay ka woh hissa jo shares rakhne wale investors mein baata jata hai",
            "c": "Bank account block fee",
            "d": "Government tax rate"
        },
        "correct_option": "b",
        "explanation": "Jab companies munafa kamati hain, toh woh apne share-holders ko un ke shares ke mutabiq cash profit deti hain, jise Dividend kehte hain."
    },
    {
        "id": 87,
        "level": 5,
        "question": "Kaunsi investment sab se kam risky (safest) samjhi jati hai?",
        "options": {
            "a": "Direct Stock trading in startup",
            "b": "Government-backed savings schemes (National Savings)",
            "c": "Cryptocurrency assets",
            "d": "Foreign exchange trading"
        },
        "correct_option": "b",
        "explanation": "Government bonds aur certificates safe hote hain kyunke in ki guarantee hukoomat deti hai aur default ka risk na hone ke barabar hota hai."
    },
    {
        "id": 88,
        "level": 5,
        "question": "Sarmayakari mein Time Horizon (waqt ki muddat) ka kya matlab hai?",
        "options": {
            "a": "Aap din mein kitna kaam karte hain",
            "b": "Investment ko kitne waqt (saaloon) ke liye hold karne ka plan hai",
            "c": "Bank ki branch timing",
            "d": "Daily stock market trading duration"
        },
        "correct_option": "b",
        "explanation": "Short-term investments (1-2 saal) low-risk honi chahiye. Long-term (5-10 saal) mein aap equity ya property jaise high-risk/high-return assets le sakte hain."
    },
    {
        "id": 89,
        "level": 5,
        "question": "Inflation-adjusted return kya hota hai?",
        "options": {
            "a": "Nominal returns",
            "b": "Asal munafa jo mehngai ko nikalne ke baad bachta hai (Real return)",
            "c": "Double profit",
            "d": "Tax savings profit"
        },
        "correct_option": "b",
        "explanation": "Agar aap ka mutual fund 15% de aur inflation 15% ho, toh inflation-adjusted return 0% hai — yani aap ki purchasing power barhi nahi, wahi rahi."
    },
    {
        "id": 90,
        "level": 5,
        "question": "Passive Income ki misal kaunsi hai?",
        "options": {
            "a": "Office mein overtime lagana",
            "b": "Rental property se monthly rent aana ya shares se dividend aana",
            "c": "Freelance project complete karna",
            "d": "Uber chalana"
        },
        "correct_option": "b",
        "explanation": "Passive income ke liye aap ko rozana physical labor nahi karna parta. Aap ka lagaya hua paisa aap ke liye kaam karta hai."
    },
    {
        "id": 91,
        "level": 5,
        "question": "Sarmayakari shuru karne ke liye pehli zaroorat kya hai?",
        "options": {
            "a": "Millionaire hona",
            "b": "High-interest karzon (Credit Card loans) se azaad hona aur basic emergency fund rakhna",
            "c": "Stock broker banna",
            "d": "Bank ka director hona"
        },
        "correct_option": "b",
        "explanation": "Karze par aam tor par 20-30% interest hota hai, jabke investment return aam tor par 15% hota hai. Karza pehle utarna behtar investment hai."
    },
    {
        "id": 92,
        "level": 5,
        "question": "Bulls aur Bears markets kya hoti hain?",
        "options": {
            "a": "Zid aur narazi",
            "b": "Bull ka matlab barhti hui (Rising) market, Bear ka matlab girti hui (Falling) market",
            "c": "Forest assets trade",
            "d": "Bank loan schemes"
        },
        "correct_option": "b",
        "explanation": "Stock market mein Bull Market up-trend ko kehte hain jahan qeematein barhti hain. Bear Market down-trend ko kehte hain jahan qeematein girti hain."
    },
    {
        "id": 93,
        "level": 5,
        "question": "Paper Loss aur Realized Loss mein kya farq hai?",
        "options": {
            "a": "Paper loss fake hota hai, realized real hota hai",
            "b": "Paper loss tab tak hai jab tak asset becha na jaye, realized loss tab hota hai jab loss mein asset bech dein",
            "c": "Dono same hain",
            "d": "Realized loss bank cancel kar sakta hai"
        },
        "correct_option": "b",
        "explanation": "Agar share ki keemat Rs. 100 se Rs. 80 ho gayi par aap ne becha nahi, toh woh Paper Loss hai. Bech diya toh loss confirm/Realized ho gaya."
    },
    {
        "id": 94,
        "level": 5,
        "question": "Volatility (utarchadhao) se kya murad hai?",
        "options": {
            "a": "Investment block hona",
            "b": "Asset ki qeemat ka tezi se aur bar bar up-down hona",
            "c": "Stable returns",
            "d": "Interest income rate"
        },
        "correct_option": "b",
        "explanation": "Stocks aur Crypto bohot volatile hote hain (un ke rates har second badalte hain). Gold aur fixed deposits kam volatile hote hain."
    },
    {
        "id": 95,
        "level": 5,
        "question": "Compound Annual Growth Rate (CAGR) kya batata hai?",
        "options": {
            "a": "Monthly expense calculation",
            "b": "Investment ki saalana average growth rate compounding ke sath",
            "c": "Simple average return",
            "d": "Sarkari inflation index"
        },
        "correct_option": "b",
        "explanation": "CAGR se hum kisi investment ki real long-term performance ko naap sakte hain ke is ne har saal average kitna compound munafa diya."
    },
    {
        "id": 96,
        "level": 5,
        "question": "Rule of 72 kya asan calculation batata hai?",
        "options": {
            "a": "Salary calculate karne ka rule",
            "b": "Paisa kitne saaloon mein double hoga (72 ko return rate se divide karein)",
            "c": "Tax rate calculation",
            "d": "Gari ki loan timing"
        },
        "correct_option": "b",
        "explanation": "Rule of 72 ke mutabiq agar aap ka return rate 12% hai, toh 72/12 = 6 saal mein aap ka paisa double ho jayegi."
    },
    {
        "id": 97,
        "level": 5,
        "question": "Dollar-Cost Averaging (DCA) kya investment strategy hai?",
        "options": {
            "a": "Sirf dollars mein invest karna",
            "b": "Market price dekhay baghair har mahine aik makhsoos raqam musalsal invest karna",
            "c": "Saste dollar dhoondna",
            "d": "Stock trading band kar dena"
        },
        "correct_option": "b",
        "explanation": "DCA (jaise har mahine Rs. 5000 mutual fund mein daalna) ke zariye market sasti hone par zyada units aur mehngi hone par kam units milte hain, jo risk average kar deta hai."
    },
    {
        "id": 98,
        "level": 5,
        "question": "Speculation (Satta/Tukkay-bazi) aur Real Investing mein kya farq hai?",
        "options": {
            "a": "Dono same hain",
            "b": "Speculation choti muddat mein bina research ke high risk lena hai, investing research ke sath value hold karna hai",
            "c": "Speculation legal hoti hai, investing illegal",
            "d": "Speculation rich log nahi karte"
        },
        "correct_option": "b",
        "explanation": "Speculation jaldi ameer hone ki koshish hai (jaise trade signal pe blindly paisa lagana). Investing long term growth aur analysis ki bunyaad par hoti hai."
    },
    {
        "id": 99,
        "level": 5,
        "question": "Liquidity risk kya hota hai?",
        "options": {
            "a": "Bank account close hona",
            "b": "Zaroorat ke waqt kisi asset ko sasti qeemat ya jaldi cash mein tabdeel na kar pana",
            "c": "Paisa kharab hona",
            "d": "Tax refund delay"
        },
        "correct_option": "b",
        "explanation": "Property bechne mein time lagta hai, is liye property mein high liquidity risk hota hai. Direct stocks ko bechna asan hai, is liye in mein kam liquidity risk hota hai."
    },
    {
        "id": 100,
        "level": 5,
        "question": "Sarmayakari karte waqt 'Emotional Control' kyun zaroori hai?",
        "options": {
            "a": "Taake aap har roz bank na jayein",
            "b": "Market girne par dar kar saste shares bechne aur barhne par lalach mein aane se bachne ke liye",
            "c": "Taxes bachane ke liye",
            "d": "Is ka koi faida nahi hota"
        },
        "correct_option": "b",
        "explanation": "Aksar investors emotional ho kar (Panic selling) nuqsaan uthate hain. Sabr aur discipline hi sab se bara investing principle hai."
    },

    # ─── LEVEL 6: MUTUAL FUNDS (101-120) ───
    {
        "id": 101,
        "level": 6,
        "question": "Mutual Fund kya hota hai?",
        "options": {
            "a": "Sarkari bank account",
            "b": "Bohut se investors ka paisa ikattha kar ke professional fund manager ke zariye invest karna",
            "c": "Direct stock market trading",
            "d": "Company ka loan system"
        },
        "correct_option": "b",
        "explanation": "Mutual fund logon se paisay leta hai aur ek professional expert (Fund Manager) use diversified stocks aur bonds mein lagata hai."
    },
    {
        "id": 102,
        "level": 6,
        "question": "AMC (Asset Management Company) kya hoti hai?",
        "options": {
            "a": "Government tax department",
            "b": "Mutual funds ko chalane aur manage karne wali company",
            "c": "Stock market broker office",
            "d": "Private bank branch"
        },
        "correct_option": "b",
        "explanation": "AMC woh company hoti hai jo mukhtalif types ke mutual funds launch karti hai (jaise Al Meezan, HBL Funds, UBL Funds)."
    },
    {
        "id": 103,
        "level": 6,
        "question": "NAV (Net Asset Value) kya hoti hai?",
        "options": {
            "a": "Mutual fund ki ek unit (share) ki qeemat",
            "b": "Total bank balance",
            "c": "Government interest rate",
            "d": "Broker tax rate"
        },
        "correct_option": "a",
        "explanation": "NAV mutual fund ki unit price hoti hai. Jaise stock market mein share price hoti hai, waise hi mutual fund mein NAV hoti hai."
    },
    {
        "id": 104,
        "level": 6,
        "question": "Equity Mutual Fund kis cheez mein invest karta hai?",
        "options": {
            "a": "Government savings certificates mein",
            "b": "Stock Exchange (PSX) par listed companies ke shares mein",
            "c": "Direct real estate projects mein",
            "d": "Foreign currencies mein"
        },
        "correct_option": "b",
        "explanation": "Equity funds shares mein invest karte hain. Yeh high risk aur long-term high returns ke liye hote hain."
    },
    {
        "id": 105,
        "level": 6,
        "question": "Income/Debt Mutual Funds kahan invest karte hain?",
        "options": {
            "a": "Direct stocks mein",
            "b": "Bonds, T-Bills, Commercial Papers aur Bank Deposits mein",
            "c": "Gold trading mein",
            "d": "Cryptocurrency assets mein"
        },
        "correct_option": "b",
        "explanation": "Debt ya income funds government aur corporate bonds mein lagate hain jo ke kam risky hote hain aur safe fixed income dete hain."
    },
    {
        "id": 6,
        "level": 6,
        "question": "Money Market Funds kis had tak safe hote hain?",
        "options": {
            "a": "Sab se high risk hote hain",
            "b": "Bohut low risk aur high liquid hote hain (short-term cash deposits)",
            "c": "Sarkari defaults par doob jate hain",
            "d": "In par return zero hota hai"
        },
        "correct_option": "b",
        "explanation": "Money market funds short-term aur high quality bonds/deposits mein lagate hain. Yeh emergency funds ke liye ideal hain."
    },
    {
        "id": 107,
        "level": 6,
        "question": "Balanced Mutual Fund kya karta hai?",
        "options": {
            "a": "Sirf gold mein invest karta hai",
            "b": "Risk kam karne ke liye shares (equity) aur bonds (debt) dono ka mix banata hai",
            "c": "Sari transactions ko balance check karta hai",
            "d": "Zero return deta hai"
        },
        "correct_option": "b",
        "explanation": "Balanced funds portfolio mix banate hain taake stock market g गिरने par bond return unhein support kar sakay."
    },
    {
        "id": 108,
        "level": 6,
        "question": "Front-End Load kya hota hai?",
        "options": {
            "a": "Direct account opening fee",
            "b": "Mutual fund khareedte waqt lagne wali sales charge/fee",
            "c": "Yearly management fee",
            "d": "Profit withdrawal tax"
        },
        "correct_option": "b",
        "explanation": "Front-end load investment shuru karte waqt kaati jane wali sales charge fee hoti hai (aam tor par 1-2%)."
    },
    {
        "id": 109,
        "level": 6,
        "question": "Expense Ratio se kya murad hai?",
        "options": {
            "a": "Sarkari tax calculation ratio",
            "b": "Fund chalane ke salana akhrajaat jo fund value se percentage ke tor par kaatay jate hain",
            "c": "Personal monthly expenses ratio",
            "d": "Inflation adjustment rate"
        },
        "correct_option": "b",
        "explanation": "Expense ratio (jaise 1.5% ya 2% saalana) management fees aur utility charges poora karne ke liye mutual fund assets se kaata jata hai."
    },
    {
        "id": 110,
        "level": 6,
        "question": "Mutual fund mein 'Redemption' ka kya matlab hai?",
        "options": {
            "a": "Guzishta saal ka audit",
            "b": "Apne mutual fund units bech kar cash wapis nikalna",
            "c": "Tax refund file karna",
            "d": "Naye units free milna"
        },
        "correct_option": "b",
        "explanation": "Redemption ka matlab hai investment bechna aur apne paise bank account mein mangwana."
    },
    {
        "id": 111,
        "level": 6,
        "question": "Pakistan mein mutual funds ko kaunsa sarkari idara regulate karta hai?",
        "options": {
            "a": "State Bank of Pakistan (SBP)",
            "b": "Securities and Exchange Commission of Pakistan (SECP)",
            "c": "Federal Board of Revenue (FBR)",
            "d": "Pakistan Stock Exchange (PSX)"
        },
        "correct_option": "b",
        "explanation": "SECP Pakistan mein tamam mutual funds, investment companies aur stock market institutions ko regulate aur check karta hai."
    },
    {
        "id": 112,
        "level": 6,
        "question": "Mutual Fund mein diversification ka kya faida hai?",
        "options": {
            "a": "Is se returns direct double ho jate hain",
            "b": "Kyunke paisa mukhtalif companies ke shares mein laga hota hai, aik company doobne se nuqsan nahi hota",
            "c": "Is se accounts freeze nahi hote",
            "d": "Bina risk ke high return milta hai"
        },
        "correct_option": "b",
        "explanation": "Fund manager aap ka paisa 30-40 companies mein lagata hai. Agar 2 companies doob bhi jayein, toh baqi companies performance bachati hain."
    },
    {
        "id": 113,
        "level": 6,
        "question": "Mutual fund mein 'Systematic Investment Plan (SIP)' kya hai?",
        "options": {
            "a": "Sarkari pension plan",
            "b": "Har mahine aik makhsoos din fix raqam mutual fund mein invest karna",
            "c": "Stock brokerage key account",
            "d": "Direct trading terminal"
        },
        "correct_option": "b",
        "explanation": "SIP monthly investment habit banata hai aur dollar-cost averaging ka faida deta hai."
    },
    {
        "id": 114,
        "level": 6,
        "question": "Open-End Mutual Fund kya hota hai?",
        "options": {
            "a": "Jis mein naye units kisi bhi waqt khareede aur beche ja sakein",
            "b": "Jo stock exchange par trade nahi hota",
            "c": "Jis mein investment time fix hoti hai",
            "d": "Jo free account opening deta hai"
        },
        "correct_option": "a",
        "explanation": "Open-end funds mein units unlimited hote hain, jab chahein naye units khareedein aur redemption karwain."
    },
    {
        "id": 115,
        "level": 6,
        "question": "Close-End Mutual Fund kya hota hai?",
        "options": {
            "a": "Jo band ho chuka ho",
            "b": "Jis ke units fix hote hain aur stock exchange par trade hote hain",
            "c": "Jis par tax nahi lagta",
            "d": "Jis par risk zero hota hai"
        },
        "correct_option": "b",
        "explanation": "Close-end funds IPO ke zariye limited shares issue karte hain aur direct stock market par buy/sell hote hain."
    },
    {
        "id": 116,
        "level": 6,
        "question": "Mutual fund prospectus read karna kyun zaroori hai?",
        "options": {
            "a": "Kyunke is se English seekhne ko milti hai",
            "b": "Is mein fund ke investment rules, charges, risk level aur managers ki detail hoti hai",
            "c": "Is par bank stamp zaroori hai",
            "d": "Is se tax exemption form milta hai"
        },
        "correct_option": "b",
        "explanation": "Prospectus fund ki legal framework aur rules ki book hai jise parhna har bare investor ke liye zaroori hai."
    },
    {
        "id": 117,
        "level": 6,
        "question": "Mutual Fund Trustee (jaise CDC) ka kya kaam hota hai?",
        "options": {
            "a": "Paisa stock market mein trading karna",
            "b": "Fund ke assets ko safe custody mein rakhna taake AMC fraud na kar sakay",
            "c": "Filer status check karna",
            "d": "Taxes collect karna"
        },
        "correct_option": "b",
        "explanation": "Trustee (aam tor par Central Depository Company - CDC) AMC aur fund manager ko paisay chori karne se rokti hai. Paisa Trustee ke custody mein hota hai."
    },
    {
        "id": 118,
        "level": 6,
        "question": "Growth Mutual Fund aur Income Mutual Fund mein kya farq hai?",
        "options": {
            "a": "Dono bilkul same hain",
            "b": "Growth capital appreciation deta hai (reinvesting), income monthly ya quarterly payouts deta hai",
            "c": "Growth par tax nahi hota",
            "d": "Income direct gold deta hai"
        },
        "correct_option": "b",
        "explanation": "Growth fund share value barhane par focus karta hai (long-term wealth). Income fund consistent dividends ya interest payout dene par focus karta hai."
    },
    {
        "id": 119,
        "level": 6,
        "question": "ETF (Exchange Traded Fund) mutual fund se kaise mukhtalif hai?",
        "options": {
            "a": "ETF direct stock market par real-time trade hota hai bilkul ek stock ki tarah",
            "b": "ETF sirf banking sector mein hota hai",
            "c": "ETF par return zero hota hai",
            "d": "ETF mein risk nahi hota"
        },
        "correct_option": "a",
        "explanation": "Mutual fund ka transaction din ke aakhir mein aik NAV rate par hota hai. ETF pure din share bazaar par realtime becha aur khareeda ja sakta hai."
    },
    {
        "id": 120,
        "level": 6,
        "question": "Direct Stocks trading ke muqable mein Mutual Fund ka kya faida hai?",
        "options": {
            "a": "Professional management aur kam capital se auto-diversification",
            "b": "Return double hone ki guarantee",
            "c": "Risk bilkul zero ho jana",
            "d": "No management fee"
        },
        "correct_option": "a",
        "explanation": "Direct stock trading mein bohot time aur research chahiye. Mutual fund mein Rs. 5000 se start kar ke poora diversified portfolio mil jata hai jo professional fund manager chalata hai."
    },

    # ─── LEVEL 7: ISLAMIC BANKING & FINANCE (121-140) ───
    {
        "id": 121,
        "level": 7,
        "question": "Islamic Banking (Islami Banking) ki bunyadi shart kya hai?",
        "options": {
            "a": "Arabic language ka istemal",
            "b": "Sood (Riba) se mukammal pak hona aur Shariah compliance rules par chalna",
            "c": "Sirf musalmano ke liye hona",
            "d": "Taxes na lena"
        },
        "correct_option": "b",
        "explanation": "Islamic banking mein sood (interest) haram hai. Yeh asset-backed transactions aur profit-and-loss sharing par chalti hai."
    },
    {
        "id": 122,
        "level": 7,
        "question": "Riba (Sood) kis cheez ko kehte hain?",
        "options": {
            "a": "Karobar ka halal munafa",
            "b": "Karz par ya bina kisi karobar ke fix aur guaranteed profit lena (Interest)",
            "c": "Government tax collection",
            "d": "Mutual fund management charge"
        },
        "correct_option": "b",
        "explanation": "Kisi ko udhar de kar us par makhsoos muddat ke baad makhsoos izafi raqam guaranteed mangna Riba/Sood hai jo Islam mein sangeen gunah hai."
    },
    {
        "id": 123,
        "level": 7,
        "question": "Mudarabah (مضاربہ) contract mein profit/loss share kaise hota hai?",
        "options": {
            "a": "Aik investor (Rabb-ul-Maal) hota hai aur dusra mehnat (Mudarib) karta hai. Profit share hota hai par loss sirf investor ka hota hai",
            "b": "Dono barabar investment aur barabar mehnat karte hain",
            "c": "Loss sirf manager ka hota hai",
            "d": "Guaranteed 10% return milta hai"
        },
        "correct_option": "a",
        "explanation": "Mudarabah mein investor ka financial risk hota hai, manager (Mudarib) ki mehnat zaya hoti hai (losses are borne by financial backer, unless there is negligence)."
    },
    {
        "id": 124,
        "level": 7,
        "question": "Musharakah (مشارکہ) contract kya hai?",
        "options": {
            "a": "Guaranteed profit sharing scheme",
            "b": "Joint venture jismein tamam partners investment aur management share karte hain aur loss capital ratios ke mutabiq hota hai",
            "c": "Personal loan scheme",
            "d": "Direct gold trading partnership"
        },
        "correct_option": "b",
        "explanation": "Musharakah aik partnership hai jismein partners capital late hain. Munafa un ke agreed ratios par aur loss capital ratio ke mutabiq share hota hai."
    },
    {
        "id": 125,
        "level": 7,
        "question": "Murabahah (مرابحہ) product Islamic bank kaise chalata hai?",
        "options": {
            "a": "Direct cash loan de kar us par profit leta hai",
            "b": "Bank pehle asset khareedta hai aur phir customer ko cost-plus profit margin par udhar bechta hai",
            "c": "Sarkari bonds khareedta hai",
            "d": "Stocks buy/sell karta hai"
        },
        "correct_option": "b",
        "explanation": "Murabahah cost-plus sale contract hai. Bank direct cash nahi deta balke asset (jaise gari ya kham maal) khareed kar customer ko profit marjin ke sath installment par bechta hai."
    },
    {
        "id": 126,
        "level": 7,
        "question": "Ijara (اجارہ) contract kis conventional contract ke barabar hota hai?",
        "options": {
            "a": "Direct Stock buying",
            "b": "Leasing / Rental contract (jaise bank gari lease par deta hai)",
            "c": "Mutual fund unit purchase",
            "d": "Insurance premium"
        },
        "correct_option": "b",
        "explanation": "Ijara mein bank asset ka owner rehta hai aur customer ko lease period ke liye use karne ke liye rent par deta hai."
    },
    {
        "id": 127,
        "level": 7,
        "question": "Conventional bank deposit aur Islamic bank deposit mein kya farq hai?",
        "options": {
            "a": "Conventional fix interest guaranteed karta hai, Islamic business profit/loss share karta hai",
            "b": "Islamic bank default nahi ho sakta",
            "c": "Conventional bank mein taxes kam hote hain",
            "d": "Dono bilkul same hote hain"
        },
        "correct_option": "a",
        "explanation": "Conventional deposits mein loan transactions hoti hain (fixed interest). Islamic bank deposits Mudarabah pools mein lagata hai jo business performance par profit/loss dete hain."
    },
    {
        "id": 128,
        "level": 7,
        "question": "Sukuk (صکوک) conventional bonds se kaise mukhtalif hai?",
        "options": {
            "a": "Conventional bonds debt (loan) hain, Sukuk Shariah-compliant asset ownership certificates hain",
            "b": "Sukuk direct gold backed hain",
            "c": "Sukuk par return zero hota hai",
            "d": "Sukuk stock exchange par trade nahi hote"
        },
        "correct_option": "a",
        "explanation": "Conventional bond paper debt instrument hai. Sukuk real asset (jaise airport, motorway) ki ownership aur rents share karte hain."
    },
    {
        "id": 129,
        "level": 7,
        "question": "Islamic Mutual Fund kis type ke shares mein invest nahi kar sakta?",
        "options": {
            "a": "Technology companies mein",
            "b": "Soodi banks, sharaab (alcohol), gambling, pork, aur conventional insurance sectors ke shares mein",
            "c": "Foreign companies mein",
            "d": "Cement factories ke shares mein"
        },
        "correct_option": "b",
        "explanation": "Islamic funds non-compliant companies (jo shariah-forbidden business karti hon ya sood par chalti hon) mein bilkul invest nahi kar sakte."
    },
    {
        "id": 130,
        "level": 7,
        "question": "Shariah Board Islamic bank mein kya kaam karta hai?",
        "options": {
            "a": "Tax collection control karta hai",
            "b": "Islamic scholars aur experts ki team jo har product aur transaction ki compliance audit karti hai",
            "c": "Accounts security check karta hai",
            "d": "Stocks buy/sell rates set karta hai"
        },
        "correct_option": "b",
        "explanation": "Shariah board products, processes aur agreements ko check kar ke certification (Fatwa) deta hai ke yeh transaction halal tareeqay par hai."
    },
    {
        "id": 131,
        "level": 7,
        "question": "Gharar (غرر) se conventions mein kya murad hai?",
        "options": {
            "a": "Haram khana",
            "b": "Contract mein ajeeb be-yakeeni, dhoka, ya makhsoos risk hona (forbidden in Islamic finance)",
            "c": "Bank account block code",
            "d": "Profit sharing ratio"
        },
        "correct_option": "b",
        "explanation": "Islamic finance mein ambiguous contracts (jaise makhlooq machli darya mein bechna jo dastiab na ho) Gharar ke zumre mein forbidden hain."
    },
    {
        "id": 132,
        "level": 7,
        "question": "Takaful (تکافل) conventional insurance se kaise mukhtalif hai?",
        "options": {
            "a": "Takaful bilkul free hota hai",
            "b": "Mutual cooperation aur Tabarru (donation pool) par mabni mutual support system",
            "c": "Takaful checking account system hai",
            "d": "Takaful par interest rate double milta hai"
        },
        "correct_option": "b",
        "explanation": "Conventional insurance mein risk transfer aur interest/gambling elements hote hain. Takaful mein members pool mein tabarru (donation) daaltay hain aur aapas mein nuqsaan share karte hain."
    },
    {
        "id": 133,
        "level": 7,
        "question": "Halal stock screening mein debt-to-assets ratio ki limit kya hoti hai?",
        "options": {
            "a": "Zero% (no interest debt)",
            "b": "Total interest-bearing debt total assets ke 37% (ya 33%) se kam hona chahiye",
            "c": "100%",
            "d": "Debt limits matter nahi kartin"
        },
        "correct_option": "b",
        "explanation": "Agar company kuch interest-bearing debt rakhti hai par us ki ratio makhsoos limit se kam ho, aur us ka main business halal ho, toh specific parameters par screened share halal samjha jata hai."
    },
    {
        "id": 134,
        "level": 7,
        "question": "Islamic banking savings account par profit rate kya hamesha fix hota hai?",
        "options": {
            "a": "Nahi, yeh floating rate hota hai jo business investment pool ke munafay par depend karta hai",
            "b": "Haan, guaranteed fixed 15% saalana hota hai",
            "c": "Haan, zero% hota hai",
            "d": "Conventional bank ke equal hota hai"
        },
        "correct_option": "a",
        "explanation": "Guaranteed fix return Islamic banking mein haram hai. Profit rates monthly change hote hain aur real earnings par base karte hain."
    },
    {
        "id": 135,
        "level": 7,
        "question": "Islamic micro-finance (jaise Akhuwat) conventional loans se kaise mukhtalif hai?",
        "options": {
            "a": "Akhuwat Qarz-e-Hasna (bina kisi profit/interest ke) loans deti hai",
            "b": "Akhuwat direct commercial banks chalaati hai",
            "c": "Akhuwat par return high hota hai",
            "d": "Akhuwat checking account run karti hai"
        },
        "correct_option": "a",
        "explanation": "Qarz-e-Hasna (Karz-e-Hasna) behtareen Islamic microfinance model hai jo sirf service charges ya zero markup par small businesses chalane ke liye loans deta hai."
    },
    {
        "id": 136,
        "level": 7,
        "question": "Maysir (میسر) conventional finance mein kis prohibited activity ko kehte hain?",
        "options": {
            "a": "Halal munafa",
            "b": "Juaa ya speculation/gambling (paisa lalach mein bina research ke khona/pana)",
            "c": "Bank transaction tax",
            "d": "Sukuk asset rental"
        },
        "correct_option": "b",
        "explanation": "Conventional contracts jismein profit pure luck/chance par ho (like derivatives, direct speculation) Maysir ke zumre mein aakar haram kehlate hain."
    },
    {
        "id": 137,
        "level": 7,
        "question": "Islamic auto-financing (jaise Meezan Car Ijarah) conventional car lease se kaise mukhtalif hai?",
        "options": {
            "a": "Gari bank gift karta hai",
            "b": "Conventional lease mein bank sood charge karta hai, Ijarah mein bank gari rental contract par rent leta hai",
            "c": "Ijarah par maintenance and insurance bank nahi pay karta",
            "d": "Dono identical hain"
        },
        "correct_option": "b",
        "explanation": "Conventional car loan user ko gari ka owner banata hai aur soodi loan leta hai. Ijarah mein bank owner rehta hai aur user se monthly rent leta hai."
    },
    {
        "id": 138,
        "level": 7,
        "question": "Halal stock investment se milne wale non-compliant income ka 'Purification' (طہارت) kaise kiya jata hai?",
        "options": {
            "a": "Use reinvest kar ke",
            "b": "Non-compliant profit percentage ko alag nikal kar bina thawab ki niyat ke charity mein dena",
            "c": "Sood account mein transfer kar ke",
            "d": "Purification ki zaroorat nahi hoti"
        },
        "correct_option": "b",
        "explanation": "Agar company thora soodi profit kamati hai, toh halal screening rules ke mutabiq utne percentage profit ko charity mein dena purification kehlayega."
    },
    {
        "id": 139,
        "level": 7,
        "question": "Riba al-Fadl (ربا الفضل) conventional definition mein kya hai?",
        "options": {
            "a": "Time delay interest",
            "b": "Makhsoos commodities (gold, silver, grains) ke barah-e-rast exchange mein izafi quantity lena/dena",
            "c": "Sukuk tax rate",
            "d": "Private bank service charges"
        },
        "correct_option": "b",
        "explanation": "Same category commodities ke barter exchange mein makhsoos standard conditions mein izafi quantity lena Riba al-Fadl hai jo prohibited hai."
    },
    {
        "id": 140,
        "level": 7,
        "question": "Islamic Wealth Management mein 'Zakat' (زکوۃ) ka kya kirdaar hai?",
        "options": {
            "a": "Investment assets par 2.5% salana wajib tax jo poor logon ki welfare ke liye hota hai",
            "b": "Bank service charges",
            "c": "Private savings return",
            "d": "Stock purchase fee"
        },
        "correct_option": "a",
        "explanation": "Zakat Islamic finance ka main pillar hai jo wealth purification aur circulation of wealth ko ensure karta hai."
    },

    # ─── LEVEL 8: STOCK MARKET & SHARES (141-160) ───
    {
        "id": 141,
        "level": 8,
        "question": "Stock Market (Hissas Bazaar) kya hota hai?",
        "options": {
            "a": "Sarkari loans ki jaga",
            "b": "Bazaar jahan companies ke shares (hisse) khareede aur beche jaate hain",
            "c": "Direct gold trading terminal",
            "d": "Private banking group"
        },
        "correct_option": "b",
        "explanation": "Stock market (jaise Pakistan Stock Exchange - PSX) listed companies ke shares ki trade ka central platforms hai."
    },
    {
        "id": 142,
        "level": 8,
        "question": "Share (حصہ) khareedne ka kya matlab hota hai?",
        "options": {
            "a": "Company ko loan dena",
            "b": "Company mein hissa-dari (fractional ownership) hasil karna",
            "c": "Company ki cheezein free mein milna",
            "d": "Direct cash account upgrade"
        },
        "correct_option": "b",
        "explanation": "Share khareedne se aap company ke assets aur profits ke hissa-dar ban jate hain."
    },
    {
        "id": 143,
        "level": 8,
        "question": "PSX (Pakistan Stock Exchange) kahan waqay hai?",
        "options": {
            "a": "Islamabad",
            "b": "Karachi",
            "c": "Lahore",
            "d": "Faisalabad"
        },
        "correct_option": "b",
        "explanation": "PSX ka main head office Karachi (Financial Hub of Pakistan) mein waqay hai."
    },
    {
        "id": 144,
        "level": 8,
        "question": "Stock Exchange Index (jaise KSE-100) kya dikhata hai?",
        "options": {
            "a": "Total listed companies key names",
            "b": "Top 100 companies ki performance ka consolidated trend aur pure market ka index",
            "c": "Dollar vs Rupee index",
            "d": "FBR tax rate index"
        },
        "correct_option": "b",
        "explanation": "KSE-100 Index top 100 companies ke market capitalization aur performance ko check kar ke pure stock exchange ka trend batata hai."
    },
    {
        "id": 145,
        "level": 8,
        "question": "IPO (Initial Public Offering) kya hota hai?",
        "options": {
            "a": "Stock swap deal",
            "b": "Jab koi company pehli baar public se paisa lenay ke liye stock exchange par list hoti hai aur shares bechti hai",
            "c": "Company ka bankruptcy notice",
            "d": "Bank account status check"
        },
        "correct_option": "b",
        "explanation": "IPO ke zariye company private se public ban jati hai aur capital barhane ke liye stock market par list hoti hai."
    },
    {
        "id": 146,
        "level": 8,
        "question": "Direct Stock khareedne ke liye kis cheez ki zaroorat hoti hai?",
        "options": {
            "a": "Direct factory manager se milna",
            "b": "SECP licensed Broker ke paas Trading Account aur CDC Sub-Account kholna",
            "c": "Credit card ki details dena",
            "d": "Checking bank account"
        },
        "correct_option": "b",
        "explanation": "Bina licensed broker ke aap stock market par trade nahi kar sakte. Broker aap ke order stock exchange bhejta hai."
    },
    {
        "id": 147,
        "level": 8,
        "question": "Market Capitalization (Market Cap) kya hoti hai?",
        "options": {
            "a": "Total bank debt size",
            "b": "Company ke total outstanding shares ki current market value (Share Price * Total Shares)",
            "c": "Monthly profit turnover",
            "d": "Yearly tax liabilities"
        },
        "correct_option": "b",
        "explanation": "Market cap company ki total size hoti hai. Large-cap (jaise OGDC, Engro) stable hoti hain. Small-cap volatile hoti hain."
    },
    {
        "id": 148,
        "level": 8,
        "question": "Stock trading mein 'Ticker Symbol' (jaise ENGRO, LUCK) kya hota hai?",
        "options": {
            "a": "Secret trade pin code",
            "b": "Company ka short code name jo trade trading terminal par buy/sell karne ke liye hota hai",
            "c": "Tax code",
            "d": "Broker registration number"
        },
        "correct_option": "b",
        "explanation": "Ticker symbols short code hain (Lucky Cement ka LUCK, Engro Corp ka ENGRO) jo terminals par stock identify karte hain."
    },
    {
        "id": 149,
        "level": 8,
        "question": "Limit Order aur Market Order mein kya farq hai?",
        "options": {
            "a": "Market order check limit check karta hai",
            "b": "Limit order aap ki apni pasandeeda price par lagta hai, market order current dastiab price par foran execute hota hai",
            "c": "Dono absolute same hain",
            "d": "Limit order tax free hota hai"
        },
        "correct_option": "b",
        "explanation": "Market order foran trade karta hai. Limit order tab tak wait karta hai jab tak share price aap ki fix ki hui keemat par na aa jaye."
    },
    {
        "id": 150,
        "level": 8,
        "question": "Blue Chip stocks kaunse hote hain?",
        "options": {
            "a": "Nayi tech startup stocks",
            "b": "Stable, financially strong, mashhoor aur historical profitable record wali barri companies ke stocks",
            "c": "High volatile mining stocks",
            "d": "Blue color logos wali companies"
        },
        "correct_option": "b",
        "explanation": "Blue chip stocks (jaise Fauji Fertilizer, Habib Bank) safe samjhay jate hain kyunke yeh mushkil waqt mein default nahi hote."
    },
    {
        "id": 151,
        "level": 8,
        "question": "Direct stock market mein investment ka kya risk hai?",
        "options": {
            "a": "Market crash hone par share ki qeemat girne se capital loss ka risk",
            "b": "Bank account block hone ka risk",
            "c": "Currency note band hone ka risk",
            "d": "Interest rate reduction"
        },
        "correct_option": "a",
        "explanation": "Stocks volatile hote hain. Agar company perform na karein ya economic crisis aaye, toh share price gir sakti hai."
    },
    {
        "id": 152,
        "level": 8,
        "question": "Penny Stocks kaunse hote hain?",
        "options": {
            "a": "Bohut high price wale shares",
            "b": "Bohut saste (choti companies) ke shares jo highly volatile aur risky hote hain",
            "c": "Foreign currency trade shares",
            "d": "Islamic screening shares"
        },
        "correct_option": "b",
        "explanation": "Penny stocks (Rs. 1 ya Rs. 5 wale shares) mein manipulation aur volatility zyada hoti hai. In mein paise doobne ka chance zyada hota hai."
    },
    {
        "id": 153,
        "level": 8,
        "question": "P/E (Price-to-Earnings) ratio stock analysis mein kya batati hai?",
        "options": {
            "a": "Monthly cost comparison",
            "b": "Share price company ki per-share earnings ke muqable mein kitni sasti ya mehngi hai",
            "c": "Total dividends payout value",
            "d": "Net profit margin"
        },
        "correct_option": "b",
        "explanation": "P/E ratio valuation measure karti hai. Low P/E (jaise 5) aksar share sasta hone aur high P/E (jaise 30) share mehnga hone ko show karta hai."
    },
    {
        "id": 154,
        "level": 8,
        "question": "Direct stock market mein loss ko bachane ke liye 'Stop-Loss' order kya hai?",
        "options": {
            "a": "Bank transaction lock kar dena",
            "b": "Makhsoos price par share price girne par automatic shares bechne ka system taake zyada nuqsan na ho",
            "c": "Direct trading cancel call",
            "d": "Dividend amount hold karna"
        },
        "correct_option": "b",
        "explanation": "Stop-loss lagane se (jaise Rs. 100 ka share liye aur Rs. 90 par stop-loss lagaya) agar price achanak gire, toh automatic sale ho kar nuqsan Rs. 10 tak hi rehta hai."
    },
    {
        "id": 155,
        "level": 8,
        "question": "Insider Trading conventional rules ke mutabiq kyun illegal hai?",
        "options": {
            "a": "Kyunke is mein tax nahi hota",
            "b": "Kyunke company ki aisi chupi khabron (non-public info) par trade karna baqi public ke sath na-insaafi hai",
            "c": "Kyunke broker account block ho jata hai",
            "d": "Insider trading legal hai"
        },
        "correct_option": "b",
        "explanation": "Insider info par trade kar ke faida lena ghair-qanooni hai. SECP is par bari heavy fine aur saza lagata hai."
    },
    {
        "id": 156,
        "level": 8,
        "question": "Short Selling (Shorting) stock trading mein kya hota hai?",
        "options": {
            "a": "Choti muddat ke liye share hold karna",
            "b": "Bina ownership ke udhar le kar shares pehle bechna aur saste hone par khareed kar wapis karna (profit in falling market)",
            "c": "Tax free shares swap",
            "d": "Investment duration reduce karna"
        },
        "correct_option": "b",
        "explanation": "Short selling tab hoti hai jab aap ko lagay market giregi. Pehle borrow kar ke high rate pe bechein, sasta hone par buy kar ke return karein."
    },
    {
        "id": 157,
        "level": 8,
        "question": "Direct stocks bechne par transaction costs mein kya shamil hota hai?",
        "options": {
            "a": "Sarkari tax and interest rates",
            "b": "Broker commission, SECP levy, CDC charges, Laga, aur Capital Gains Tax (CGT)",
            "c": "Direct check account fee",
            "d": "Commission zero hota hai"
        },
        "correct_option": "b",
        "explanation": "Buy/Sell transactions par makhsoos service charges aur sarkari taxes lagte hain jo total return se deduct hote hain."
    },
    {
        "id": 158,
        "level": 8,
        "question": "Fundamental Analysis stock market mein kis research ko kehte hain?",
        "options": {
            "a": "Sirf price charts dekhna",
            "b": "Company ke financial statements, sales, debt, management aur business scope ka detail study karna",
            "c": "Secrets news collect karna",
            "d": "Market trading timing analyze karna"
        },
        "correct_option": "b",
        "explanation": "Fundamental analysis company ki real health aur profit earning capacity check karta hai taake long-term value share dhoonda ja sake."
    },
    {
        "id": 159,
        "level": 8,
        "question": "Technical Analysis kis research ko kehte hain?",
        "options": {
            "a": "Company financial status check",
            "b": "Historical price movements aur volumes ke charts check kar ke future trends predict karna",
            "c": "Company factory visit",
            "d": "Broker registration verification"
        },
        "correct_option": "b",
        "explanation": "Technical analysis short-term patterns aur trends par focus karta hai (patterns, support, resistance indicators)."
    },
    {
        "id": 160,
        "level": 8,
        "question": "PSX me direct investing ke bare me new users ko key advice kya honi chahiye?",
        "options": {
            "a": "Udhaar le kar stocks mein daal dein",
            "b": "Research karein, blue chip stocks ya low-cost index funds se start karein aur patience rakhein",
            "c": "Sirf penny stocks trading karein for quick profit",
            "d": "Sari savings direct invest kar dein"
        },
        "correct_option": "b",
        "explanation": "Bina research aur financial advice ke direct stocks mein jald-bazi nuqsaan deti hai, slow and steady start safe rehta hai."
    },

    # ─── LEVEL 9: DIVERSIFICATION & RISK (161-180) ───
    {
        "id": 161,
        "level": 9,
        "question": "Diversification (تنوع) ka standard rule kya hai?",
        "options": {
            "a": "Saare paise ek hi bank account mein rakhna",
            "b": "'Apnay saaray anday ek hi tokri mein mat rakhein' (invest in different asset classes)",
            "c": "Returns ko double karna",
            "d": "High risk asset classes buy karna"
        },
        "correct_option": "b",
        "explanation": "Diversification ka matlab hai apna capital stocks, bonds, gold, and real estate jaise mukhtalif assets mein taqseem karna taake risk kam ho sake."
    },
    {
        "id": 162,
        "level": 9,
        "question": "Asset Allocation (اثاثوں کی تقسیم) se kya murad hai?",
        "options": {
            "a": "Property division logic",
            "b": "Apni total savings ko percentage ratios ke mutabiq mukhtalif categories (jaise 40% debt, 30% equity, 30% cash) mein divide karna",
            "c": "Mutual fund index list",
            "d": "Tax files list"
        },
        "correct_option": "b",
        "explanation": "Asset allocation aap ke age, goals, aur risk tolerance ke mutabiq kia jata hai taake safe growth milay."
    },
    {
        "id": 163,
        "level": 9,
        "question": "Direct stock portfolio mein diversification kaise hoti hai?",
        "options": {
            "a": "Sirf ek cement factory ke shares lene se",
            "b": "Mukhtalif sectors (jaise Tech, Oil, Cement, Fertilizer) ke companies ke shares lene se",
            "c": "Sari transactions check karne se",
            "d": "Penny stocks buy karne se"
        },
        "correct_option": "b",
        "explanation": "Sector diversification zaroori hai. Agar oil sector down ho, toh tech sector or fertilizer sector portfolios ko stabilize rakhtay hain."
    },
    {
        "id": 164,
        "level": 9,
        "question": "Unsystematic Risk (Companies specific risk) ko kis cheez se khatam/kam kiya ja sakta hai?",
        "options": {
            "a": "High loans le kar",
            "b": "Proper portfolio diversification ke zariye",
            "c": "Trading band kar ke",
            "d": "Gold buy kar ke"
        },
        "correct_option": "b",
        "explanation": "Unsystematic risk single company ya single sector tak mehdood hota hai, jo 20-30 different stocks lene se mitigate ho jata hai."
    },
    {
        "id": 165,
        "level": 9,
        "question": "Systematic Risk (Market Risk) kya hai?",
        "options": {
            "a": "Company manager ka change hona",
            "b": "Mulk ke overall halat, currency devaluation, ya interest rate barhne ka risk jo poori market ko girata hai",
            "c": "Tax code adjustment",
            "d": "CDC sub-account fee"
        },
        "correct_option": "b",
        "explanation": "Systematic risk pure economy par asar dalta hai (jaise war, economic crisis, global recession). Ise aap simple diversification se khatam nahi kar sakte."
    },
    {
        "id": 166,
        "level": 9,
        "question": "Correlation (باہمی تعلق) portfolio design mein kya dikhata hai?",
        "options": {
            "a": "Double profit",
            "b": "Mukhtalif assets ki price movements ka aapas mein relation (positive or negative)",
            "c": "FBR tax rates comparison",
            "d": "Broker commission rates"
        },
        "correct_option": "b",
        "explanation": "Negative correlation assets portfolio ke liye best hain. Jaise jab stock exchange girta hai, tab aksar gold barhta hai. Dono rakhne se total risk stable hota hai."
    },
    {
        "id": 167,
        "level": 9,
        "question": "Gold (Sona) portfolio mein kya role play karta hai?",
        "options": {
            "a": "High volatility return",
            "b": "Safe haven (crisis aur inflation ke waqt capital value safe rakhna)",
            "c": "Monthly rental yield",
            "d": "Dividends payouts"
        },
        "correct_option": "b",
        "explanation": "Gold safe-haven asset hai. Crisis ya currency devaluation ke waqt gold portfolios ko breakdown hone se bachata hai."
    },
    {
        "id": 168,
        "level": 9,
        "question": "Risk Tolerance (خطرے کی برداشت) check karne mein age factor kya role play karta hai?",
        "options": {
            "a": "Age ka koi role nahi hota",
            "b": "Young investors high risk le sakte hain, seniors ko low risk fixed income assets lene chahiye",
            "c": "Old age log high risk lein",
            "d": "Seniors direct stocks short karein"
        },
        "correct_option": "b",
        "explanation": "Young age mein recovery time bohot hota hai. Jab aap retirement ke kareeb hon, toh aap ko capital safety chahiye hoti hai."
    },
    {
        "id": 169,
        "level": 9,
        "question": "Kaunsi investment highly speculative (bohot zyada risky) mani jati hai?",
        "options": {
            "a": "Blue chip mutual funds",
            "b": "Cryptocurrency assets aur day trading",
            "c": "National Savings certificates",
            "d": "PLS deposits"
        },
        "correct_option": "b",
        "explanation": "Cryptocurrency aur day trading highly volatile hain. In mein capital wipe-out ka risk sab se extreme hota hai."
    },
    {
        "id": 170,
        "level": 9,
        "question": "Over-diversification ka kya nuqsan hota hai?",
        "options": {
            "a": "Risk bilkul zero ho jana",
            "b": "Return itna dil diluted ho jana ke average return index se bhi kam ho jaye",
            "c": "Taxes barh jana",
            "d": "CDC account close hona"
        },
        "correct_option": "b",
        "explanation": "Agar aap 100 different funds ya stocks lein, toh return moderate ho kar benchmark se kam ho jata hai aur fees bhi barh jati hain."
    },
    {
        "id": 171,
        "level": 9,
        "question": "Rebalancing portfolio kya hoti hai?",
        "options": {
            "a": "Naya bank card order karna",
            "b": "Asset ratios change hone par portfolio ko dobara original allocations (jaise 50/50 stock/bond) par lane ke liye buy/sell karna",
            "c": "Income double adjustment",
            "d": "FBR details submit karna"
        },
        "correct_option": "b",
        "explanation": "Saal ke aakhir mein kuch assets barh jate hain aur makhsoos ratio kharab ho jati hai. Rebalancing se risk profile safe rehti hai."
    },
    {
        "id": 172,
        "level": 9,
        "question": "Risk Appetite (خطرے کی بھوک) kya hai?",
        "options": {
            "a": "Investment loss recovery rate",
            "b": "Investor ki financial aur emotional capacity jo loss dekhne ke qabil ho",
            "c": "Interest income collection",
            "d": "Monthly spending limit"
        },
        "correct_option": "b",
        "explanation": "Har insaan ki risk appetite mukhtalif hoti hai. Kuch log price fluctuations par panic kar jate hain, unhein conservative investments lene chahiye."
    },
    {
        "id": 173,
        "level": 9,
        "question": "Bonds ko portfolio mein rakhne ka conventional benefits kya hai?",
        "options": {
            "a": "High growth potential",
            "b": "Stable fixed interest income aur wealth protection",
            "c": "Dividend tax exemption",
            "d": "Real estate investment option"
        },
        "correct_option": "b",
        "explanation": "Bonds stocks ke mukable stable hote hain aur equity downside risk ko buffer karte hain."
    },
    {
        "id": 174,
        "level": 9,
        "question": "Capital Preservation target kya hota hai?",
        "options": {
            "a": "High risk growth",
            "b": "Original investment capital raqam ko loss se har haal mein mehfooz rakhna (principal protection)",
            "c": "Capital gains double karna",
            "d": "Currency trade margin"
        },
        "correct_option": "b",
        "explanation": "Capital preservation investors (jaise pension plan run karne wale) principal balance safe rakhne ko prefer karte hain."
    },
    {
        "id": 175,
        "level": 9,
        "question": "Beta ($\beta$) stock evaluation mein kya naapta hai?",
        "options": {
            "a": "Company profitability margin",
            "b": "Share price ki sensitivity market market fluctuations ke muqable mein (risk scale)",
            "c": "Dividend tax rate",
            "d": "P/E ratio valuation"
        },
        "correct_option": "b",
        "explanation": "Beta > 1 market se zyada volatile hai, Beta < 1 market se kam volatile (stable) stock ko show karta hai."
    },
    {
        "id": 176,
        "level": 9,
        "question": "Direct Real Estate investment ka risk landscape kya hai?",
        "options": {
            "a": "Risk zero hota hai",
            "b": "High ticket size, low liquidity (foran sell na hona), aur management problems",
            "c": "Immediate returns validation",
            "d": "Taxes deduction absolute zero"
        },
        "correct_option": "b",
        "explanation": "Real estate safe asset hai par is mein entry cost bohot high hoti hai aur foran cash ki zaroorat parne par becha nahi ja sakta."
    },
    {
        "id": 177,
        "level": 9,
        "question": "Default Risk kya hota hai?",
        "options": {
            "a": "Bank branch changes",
            "b": "Borrower ya company ka profit/loan interest wapis karne se mukar jana (ya diwaliya hona)",
            "c": "Tax rules change",
            "d": "Stock swap failure"
        },
        "correct_option": "b",
        "explanation": "Default risk corporate debt mein zyada hota hai. Government debt mein default risk na hone ke barabar hota hai."
    },
    {
        "id": 178,
        "level": 9,
        "question": "Mulk ke macro-economic indicators (jaise exchange rates, SBP interest rates) portfolio design ko kaise impact karte hain?",
        "options": {
            "a": "In ka portfolio par koi asar nahi hota",
            "b": "Interest rates barhne se bond prices girti hain par fixed income savings certificates mehngi hoti hain",
            "c": "Direct bank checking limits adjust karte hain",
            "d": "Tax collection levels drop karte hain"
        },
        "correct_option": "b",
        "explanation": "Macro-economic indicators pure asset classes ki prices ko impact karte hain, is liye macro cycles check karna zaroori hai."
    },
    {
        "id": 179,
        "level": 9,
        "question": "Index Fund kya portfolio automation deta hai?",
        "options": {
            "a": "Custom stocks picking options",
            "b": "Pure market index (jaise KSE-100) ko automatic replicate kar ke lower expenses par diversified stocks dena",
            "c": "Fixed interest rates payout",
            "d": "Zero risk profile"
        },
        "correct_option": "b",
        "explanation": "Index funds passive management ki wajah se saste hote hain aur active fund managers se behtar long-term performance records rakhte hain."
    },
    {
        "id": 180,
        "level": 9,
        "question": "Aap ke investment profile ka 'Risk Profile' assessment kyu zaroori hai?",
        "options": {
            "a": "Taake aap ko bank manager loan de",
            "b": "Taake aap ke goals, age aur psychological comfort ke mutabiq sahi allocation ensure ho sakay",
            "c": "FBR tax file approval ke liye",
            "d": "Is ka koi benefit nahi hai"
        },
        "correct_option": "b",
        "explanation": "Bina risk profiling ke galat high-risk assets le kar panic karna or nuqsaan uthana bohot aam hai."
    },

    # ─── LEVEL 10: ADVANCED PLANNING & FILER SYSTEM (181-200) ───
    {
        "id": 181,
        "level": 10,
        "question": "Filer (فائلر) aur Non-Filer mein conventional farq kya hai?",
        "options": {
            "a": "Filer bank account holder hota hai, non-filer nahi",
            "b": "Filer FBR ke active taxpayer list (ATL) mein hota hai jo tax return file karta hai, non-filer is list mein nahi hota",
            "c": "Filer sirf sarkari mulazim hote hain",
            "d": "Filer zero tax pay karta hai"
        },
        "correct_option": "b",
        "explanation": "Filer woh shakhs hai jo har saal FBR ko apni wealth statement aur tax returns submit kar ke taxpayer list mein shamil rehta hai."
    },
    {
        "id": 182,
        "level": 10,
        "question": "Pakistan Active Taxpayer List (ATL) kya show karti hai?",
        "options": {
            "a": "Bank black-list holders",
            "b": "FBR active filer list jo dynamic tax benefits aur low withholding tax paane ke ahel hain",
            "c": "Stock exchange brokers list",
            "d": "Overseas Pakistani details"
        },
        "correct_option": "b",
        "explanation": "ATL list active filers ko identify karti hai jis ke zariye banks aur registry offices user par half-tax withholding rates lagate hain."
    },
    {
        "id": 183,
        "level": 10,
        "question": "Filer hone ka bank cash withdrawal transaction par kya faida hai?",
        "options": {
            "a": "Withdrawal bilkul unlimited and transaction cost zero ho jati hai",
            "b": "Filer par bank cash withdrawal par withholding tax zero hota hai, non-filer par 0.6% lagta hai",
            "c": "Withdrawal limit restrict ho jati hai",
            "d": "Filer ke check book charges zero hote hain"
        },
        "correct_option": "b",
        "explanation": "Non-filer agar bank se daily Rs. 50,000 se zaroor withdraw karein, toh un par 0.6% tax kaata jata hai, jabke filer is se azaad hai."
    },
    {
        "id": 184,
        "level": 10,
        "question": "Filer hone par bank profit (PLS profit) par tax rates conventional farq kya hai?",
        "options": {
            "a": "Filer par PLS profit par 15% tax hota hai, non-filer par 30% tax kaata jata hai (withholding)",
            "b": "Conventional saving free ho jati hai",
            "c": "Filer zero tax pay karta hai bank profit par",
            "d": "Dono par 30% tax lagta hai"
        },
        "correct_option": "a",
        "explanation": "Active filer par bank saving profit par half tax withholding (15%) lagta hai. Non-filer ko 30% double tax dena parta hai."
    },
    {
        "id": 185,
        "level": 10,
        "question": "FBR (Federal Board of Revenue) Pakistan mein kis cheez ka mukhtas idara hai?",
        "options": {
            "a": "Currency printing audit",
            "b": "Mulk ke federal taxes aur customs duties ki collection aur rules implementation",
            "c": "Mulk ke bank accounts manage karna",
            "d": "Foreign imports check karna"
        },
        "correct_option": "b",
        "explanation": "FBR central government agency hai jo income tax, sales tax aur excise/custom duties collect karti hai."
    },
    {
        "id": 186,
        "level": 10,
        "question": "Income Tax Return file karne ki aam saalana deadline kab hoti hai?",
        "options": {
            "a": "31st December",
            "b": "30th September (Financial Year end ke baad FBR key mutabiq dynamic extendable)",
            "c": "1st January",
            "d": "30th June"
        },
        "correct_option": "b",
        "explanation": "FBR ke regular rules ke mutabiq individuals ke liye return file karne ki akhri tareeq 30 September hoti hai."
    },
    {
        "id": 187,
        "level": 10,
        "question": "IRIS portal (FBR online portal) kis cheez ke liye istemal hota hai?",
        "options": {
            "a": "Bank balance checks",
            "b": "Taxes return filling aur wealth statement FBR ko online submit karne ke liye",
            "c": "Direct stock purchase order",
            "d": "Passport verification details"
        },
        "correct_option": "b",
        "explanation": "IRIS FBR ka online portal hai jahan active filers e-filing (online return file) kar sakte hain."
    },
    {
        "id": 188,
        "level": 10,
        "question": "Wealth Statement (FBR Form 116) file karne ka kya maqsad hota hai?",
        "options": {
            "a": "Apni salary conceal karna",
            "b": "Apne assets, liabilities aur expenses ka declaration dena aur saalana wealth change reconcile karna",
            "c": "Company balance sheets check",
            "d": "Direct cash assets print check"
        },
        "correct_option": "b",
        "explanation": "Wealth statement batati hai ke aap ki wealth saal ke aakhir mein kitni hai aur yeh kaise barhi, taake tax audit transparent rahay."
    },
    {
        "id": 189,
        "level": 10,
        "question": "Withholding Tax (WHT) kya hota hai?",
        "options": {
            "a": "Returns file karne ki penalty",
            "b": "Source of payment par automatic kaata jane wala advanced tax (jaise utility bills, bank cash withdrawal)",
            "c": "Direct sales markup",
            "d": "Service commission charge"
        },
        "correct_option": "b",
        "explanation": "WHT source par hi kaata jata hai (withheld). Filer is tax ko saalana return mein adjust kar ke wapis (refund/credit) le sakta hai."
    },
    {
        "id": 190,
        "level": 10,
        "question": "Tax Credit kya hota hai?",
        "options": {
            "a": "Bank se tax ka loan milna",
            "b": "Makhsoos investments (mutual funds, health insurance) par FBR ke mutabiq milne wali tax relief / liability reduction",
            "c": "Filer rating increase indicators",
            "d": "Zero tax invoice"
        },
        "correct_option": "b",
        "explanation": "Agar aap certified mutual funds mein paisa lagayein, toh FBR aap ke total tax liability par discount deta hai, jise Tax Credit kehte hain."
    },
    {
        "id": 191,
        "level": 10,
        "question": "Filer hone par car registration tax conventional discount rates kya hain?",
        "options": {
            "a": "Car transfer tax half ho jata hai aur parameters par substantial low rate lagta hai compared to non-filer",
            "b": "Gari key parts duty free ho jate hain",
            "c": "Non-filer ko gari bechna illegal ho jata hai",
            "d": "Registeration price absolute zero ho jati hai"
        },
        "correct_option": "a",
        "explanation": "Gari khareedte ya transfer karte waqt non-filer par double se triple tax margin hota hai compared to active filer."
    },
    {
        "id": 192,
        "level": 10,
        "question": "Property (Zameen/Makaan) ki khareed-o-ferokht par active filer ko kya relief milti hai?",
        "options": {
            "a": "Property registeration price zero ho jati hai",
            "b": "withholding tax (buying and selling) kafi kam lagta hai (Filer: 3%, Non-Filer: 10% or more)",
            "c": "Property registry free ho jati hai",
            "d": "Non-filer property purchase nahi kar sakta"
        },
        "correct_option": "b",
        "explanation": "Property purchase par active taxpayer ko kafi discount milta hai. Non-filer ko heavy penalty taxes dene parte hain."
    },
    {
        "id": 193,
        "level": 10,
        "question": "Direct Capital Gains Tax (CGT) stocks market par active filer vs non-filer conventional margins kya hain?",
        "options": {
            "a": "Filer par profit par 15% CGT lagta hai, non-filer par 30% standard CGT kaata jata hai",
            "b": "Direct share swapping logic free",
            "c": "Filer par CGT zero hota hai",
            "d": "Non-filer stocks sell nahi kar sakta"
        },
        "correct_option": "a",
        "explanation": "Stock exchange par profits bechne par active filer ko standard 15% tax lagta hai, non-filer ko 30% direct charge lagta hai."
    },
    {
        "id": 194,
        "level": 10,
        "question": "Sales Tax (GST) general standard rate Pakistan mein conventional kya chal raha hai?",
        "options": {
            "a": "5%",
            "b": "18% (General Sales Tax on services and goods)",
            "c": "50%",
            "d": "Zero%"
        },
        "correct_option": "b",
        "explanation": "General Sales Tax (GST) aam tor par products aur service margins par 18% lagta hai jo customer bill mein automatically add hota hai."
    },
    {
        "id": 195,
        "level": 10,
        "question": "Salaried individual (tankha-dar mulazim) ke liye saalana tax slab limits kya hain (lowest slab)?",
        "options": {
            "a": "Rs. 1,00,000 saalana tak zero tax",
            "b": "Rs. 6,00,000 saalana (Rs. 50,000 monthly) tak amdani par zero tax hota hai",
            "c": "Har salary par tax lagta hai",
            "d": "Rs. 12,00,000 saalana tak zero tax"
        },
        "correct_option": "b",
        "explanation": "Salaried individuals ke liye agar saalana tankha Rs. 6 lakh (Rs. 50k monthly) se kam ho, toh un par koi income tax nahi hota."
    },
    {
        "id": 196,
        "level": 10,
        "question": "Direct taxes aur Indirect taxes mein kya farq hai?",
        "options": {
            "a": "Direct taxes bank pay karta hai, indirect customer",
            "b": "Direct tax customer ki personal income par lagta hai (Income tax), indirect products aur service invoices par (Sales tax/GST)",
            "c": "Indirect taxes filer par nahi lagte",
            "d": "Dono barabar hotay hain"
        },
        "correct_option": "b",
        "explanation": "Direct tax user directly government ko deta hai (income tax). Indirect tax consumer shops/manufacturers ko pay karta hai jo aage government ko transfer hote hain."
    },
    {
        "id": 197,
        "level": 10,
        "question": "Filer hone par tax returns file karne ke liye kya self e-filing possible hai?",
        "options": {
            "a": "Nahi, sirf lawyers kar sakte hain",
            "b": "Haan, IRIS portal par simple templates se self e-filing bilkul possible hai",
            "c": "E-filing illegal hoti hai",
            "d": "E-filing bank cash transfer se hoti hai"
        },
        "correct_option": "b",
        "explanation": "FBR ne online portal ko simple banaya hai taake log self-filer ban sakein bina kisi extra legal expense ke."
    },
    {
        "id": 198,
        "level": 10,
        "question": "Non-filer active filer list (ATL) mein kaise enter ho sakta hai?",
        "options": {
            "a": "Bank account balance double kar ke",
            "b": "Guzishta saal ka income tax return file kar ke aur makhsoos surcharge (penalty) de kar",
            "c": "Direct FBR board se call kar ke",
            "d": "National savings purchase certificates check kar ke"
        },
        "correct_option": "b",
        "explanation": "Late filing return file karne ke baad, nominal surcharge fee (sazaa fee) pay karne par, non-filer ATL list mein shamil kar liya jata hai."
    },
    {
        "id": 199,
        "level": 10,
        "question": "Advance tax adjustments (jaise cellular credit cards, electric utility bills tax) return mein kaise adjust hote hain?",
        "options": {
            "a": "Yeh cash bank wapis koodta hai",
            "b": "Filer in taxes certificates ko saalana wealth tax return data mein claim kar ke total tax liability se adjust kara sakta hai",
            "c": "Aise taxes refund nahi ho sakte",
            "d": "Direct mobile company account credit kar deti hai"
        },
        "correct_option": "b",
        "explanation": "Mobile recharge ya utility bills par withholding tax deduct hota hai. Return filing ke waqt active filers is deduction ko adjust kara kar tax liability kam kar sakte hain."
    },
    {
        "id": 200,
        "level": 10,
        "question": "Salana tax planning ka kya faida hai?",
        "options": {
            "a": "Mulk se paisa bahar chorna",
            "b": "Halal aur legal tareeqay (jaise tax credit investments) se apni tax liability ko kam karna aur saving barhana",
            "c": "Taxes evasion (tax chori) karna",
            "d": "Sarkari system block check"
        },
        "correct_option": "b",
        "explanation": "Tax planning legal hai, is mein aap incentives (like mutual fund retirement plans) ke mutabiq investment kar ke apni tax liability ko kam karte hain."
    }
]
