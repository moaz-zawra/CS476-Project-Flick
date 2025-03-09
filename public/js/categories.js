// Define subcategories for each category
const subcategoriesMap = {
    "0": { // Language
        "Afrikaans": "Afrikaans", "Albanian": "Albanian", "Amharic": "Amharic", "Arabic": "Arabic",
        "Armenian": "Armenian", "Assamese": "Assamese", "Azerbaijani": "Azerbaijani", "Basque": "Basque",
        "Belarusian": "Belarusian", "Bengali": "Bengali", "Bosnian": "Bosnian", "Bulgarian": "Bulgarian",
        "Burmese": "Burmese", "Catalan": "Catalan", "Cebuano": "Cebuano", "Chichewa": "Chichewa",
        "Chinese_Simplified": "Chinese (Simplified)", "Chinese_Traditional": "Chinese (Traditional)",
        "Corsican": "Corsican", "Croatian": "Croatian", "Czech": "Czech", "Danish": "Danish",
        "Dhivehi": "Dhivehi", "Dutch": "Dutch", "English": "English", "Esperanto": "Esperanto",
        "Estonian": "Estonian", "Ewe": "Ewe", "Filipino": "Filipino (Tagalog)", "Finnish": "Finnish",
        "French": "French", "Frisian": "Frisian", "Galician": "Galician", "Georgian": "Georgian",
        "German": "German", "Greek": "Greek", "Gujarati": "Gujarati", "Haitian_Creole": "Haitian Creole",
        "Hausa": "Hausa", "Hawaiian": "Hawaiian", "Hebrew": "Hebrew", "Hindi": "Hindi",
        "Hmong": "Hmong", "Hungarian": "Hungarian", "Icelandic": "Icelandic", "Igbo": "Igbo",
        "Indonesian": "Indonesian", "Irish": "Irish", "Italian": "Italian", "Japanese": "Japanese",
        "Javanese": "Javanese", "Kannada": "Kannada", "Kazakh": "Kazakh", "Khmer": "Khmer",
        "Kinyarwanda": "Kinyarwanda", "Korean": "Korean", "Kurdish_Kurmanji": "Kurdish (Kurmanji)",
        "Kyrgyz": "Kyrgyz", "Lao": "Lao", "Latin": "Latin", "Latvian": "Latvian",
        "Lithuanian": "Lithuanian", "Luxembourgish": "Luxembourgish", "Macedonian": "Macedonian",
        "Malagasy": "Malagasy", "Malay": "Malay", "Malayalam": "Malayalam", "Maltese": "Maltese",
        "Maori": "Maori", "Marathi": "Marathi", "Mongolian": "Mongolian", "Nepali": "Nepali",
        "Norwegian": "Norwegian", "Odia": "Odia (Oriya)", "Pashto": "Pashto", "Persian": "Persian",
        "Polish": "Polish", "Portuguese": "Portuguese", "Punjabi": "Punjabi", "Quechua": "Quechua",
        "Romanian": "Romanian", "Russian": "Russian", "Samoan": "Samoan", "Sanskrit": "Sanskrit",
        "Scottish_Gaelic": "Scottish Gaelic", "Serbian": "Serbian", "Sesotho": "Sesotho",
        "Shona": "Shona", "Sindhi": "Sindhi", "Sinhala": "Sinhala", "Slovak": "Slovak",
        "Slovenian": "Slovenian", "Somali": "Somali", "Spanish": "Spanish", "Sundanese": "Sundanese",
        "Swahili": "Swahili", "Swedish": "Swedish", "Tajik": "Tajik", "Tamil": "Tamil",
        "Tatar": "Tatar", "Telugu": "Telugu", "Thai": "Thai", "Tigrinya": "Tigrinya",
        "Turkish": "Turkish", "Turkmen": "Turkmen", "Ukrainian": "Ukrainian", "Urdu": "Urdu",
        "Uzbek": "Uzbek", "Vietnamese": "Vietnamese", "Welsh": "Welsh", "Xhosa": "Xhosa",
        "Yiddish": "Yiddish", "Yoruba": "Yoruba", "Zulu": "Zulu"
    },
    "1": { // Technology
        "Programming": "Programming", "Cybersecurity": "Cybersecurity", 
        "ArtificialIntelligence": "Artificial Intelligence", "CloudComputing": "Cloud Computing", 
        "Networking": "Networking", "Databases": "Databases", "OperatingSystems": "Operating Systems", 
        "SoftwareDevelopment": "Software Development", "Hardware": "Hardware", "Blockchain": "Blockchain"
    },
    "2": { // Course Subjects
        "Mathematics": "Mathematics", "Physics": "Physics", "Chemistry": "Chemistry", 
        "Biology": "Biology", "History": "History", "Geography": "Geography", 
        "Economics": "Economics", "PoliticalScience": "Political Science", 
        "Psychology": "Psychology", "Philosophy": "Philosophy", "Sociology": "Sociology", 
        "Business": "Business", "Art": "Art", "Music": "Music"
    },
    "3": { // Law
        "CriminalLaw": "Criminal Law", "CivilLaw": "Civil Law", 
        "ConstitutionalLaw": "Constitutional Law", "CorporateLaw": "Corporate Law", 
        "InternationalLaw": "International Law", "IntellectualProperty": "Intellectual Property", 
        "ContractLaw": "Contract Law", "FamilyLaw": "Family Law", 
        "TaxLaw": "Tax Law", "EnvironmentalLaw": "Environmental Law"
    },
    "4": { // Medical
        "Anatomy": "Anatomy", "Physiology": "Physiology", "Pathology": "Pathology", 
        "Pharmacology": "Pharmacology", "Surgery": "Surgery", "Psychiatry": "Psychiatry", 
        "Pediatrics": "Pediatrics", "Radiology": "Radiology", 
        "Nursing": "Nursing", "EmergencyMedicine": "Emergency Medicine"
    },
    "5": { // Military
        "Strategy": "Strategy", "Tactics": "Tactics", "Weapons": "Weapons", 
        "Logistics": "Logistics", "Intelligence": "Intelligence", "NavalWarfare": "Naval Warfare", 
        "AirForce": "Air Force", "SpecialForces": "Special Forces", 
        "MilitaryHistory": "Military History", "CyberWarfare": "Cyber Warfare"
    }
};

// Get category name from category ID
function getCategoryName(categoryId) {
    const categories = {
        '0': 'Language',
        '1': 'Technology',
        '2': 'Course Subjects',
        '3': 'Law',
        '4': 'Medical',
        '5': 'Military'
    };
    return categories[categoryId] || 'Unknown Category';
}

// Function to populate subcategory dropdown based on selected category
function populateSubcategory(categoryId, selectedSubcategory, targetId) {
    const subcategories = {
        '0': ['Arabic', 'Chinese', 'English', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Portuguese', 'Russian', 'Spanish', 'Other'],
        '1': ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Data Science', 'DevOps', 'Mobile Development', 'Programming Languages', 'Web Development', 'Other'],
        '2': ['Art', 'Biology', 'Chemistry', 'Computer Science', 'Economics', 'Engineering', 'History', 'Literature', 'Mathematics', 'Physics', 'Psychology', 'Other'],
        '3': ['Constitutional Law', 'Contract Law', 'Criminal Law', 'Family Law', 'International Law', 'Property Law', 'Tax Law', 'Other'],
        '4': ['Anatomy', 'Dentistry', 'Nursing', 'Pathology', 'Pharmacology', 'Physiology', 'Surgery', 'Other'],
        '5': ['Air Force', 'Army', 'Coast Guard', 'Marines', 'Navy', 'Other']
    };

    const dropdown = document.getElementById(targetId);
    dropdown.innerHTML = '<option value="">All Subcategories</option>';

    if (categoryId && subcategories[categoryId]) {
        subcategories[categoryId].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            if (sub === selectedSubcategory) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    }
} 