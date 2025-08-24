export const courses = [
    { value: "BCA", label: "Bachelor of Computer Applications (BCA)" },
    { value: "MCA", label: "Master of Computer Applications (MCA)" },
    { value: "BCA_INT", label: "BCA Integrated" },
    { value: "MSC_INT_CS", label: "M.Sc. Integrated (Cyber Security)" },
    { value: "MTECH_CS", label: "M.Tech(CS)" },
    { value: "MTECH_CS_EXEC", label: "M.Tech(CS) Executive" },
    { value: "MTECH_NM_IS", label: "M.Tech(NM & IS)" },
    { value: "MTECH_IA_SE", label: "M.Tech(IA & SE)" },
    { value: "PHD", label: "Doctor of Philosophy (PhD)" },
    { value: "MSC_CS", label: "Master of Science (CS)" },
    { value: "MSC_IT", label: "Master of Science (IT)" },
    { value: "MBA_CM", label: "MBA (Computer Management)" },
    { value: "PGDCA", label: "PG Diploma in Computer Applications (PGDCA)" },
]

export const semestersByCourse = {
    "BCA": ["0", "1", "2", "3", "4", "5", "6"],
    "MCA": ["0", "1", "2", "3", "4"],
    "BCA_INT": ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
    "MSC_INT_CS": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "MTECH_CS": ["0", "1", "2", "3", "4"],
    "MTECH_CS_EXEC": ["0", "1", "2", "3", "4"],
    "MTECH_NM_IS": ["0", "1", "2", "3", "4"],
    "MTECH_IA_SE": ["0", "1", "2", "3", "4"],
    "PHD": ["0", "1", "2", "3", "4", "5", "6"],
    "MSC_CS": ["0", "1", "2", "3", "4"],
    "MSC_IT": ["0", "1", "2", "3", "4"],
    "MBA_CM": ["0", "1", "2", "3", "4"],
    "PGDCA": ["0", "1", "2"],
}

export const staticSemesterData = {
        "1": ["Whole Semester", "Computer Organisation and Architecture", "Mathematical Foundation for Computer Application", "Data Structures Using C++", "Operating System", "Communication Skills and Report Writing"],
        "2": ["Whole Semester", "Software Engineering", "Database Management System", "Design and Analysis of Algorithms", "Computer Networks", "Internet and Web Technology"],
        "3": ["Whole Semester", "Information Security", "Automata Theory and Compiler Constructions", "Artificial Intelligence and Machine Learning", "Cloud Computing", "Information Technology Project Management"],
        "4": ["Whole Semester", "Project Work"],
    };

export const subjectsByCourseAndSemester = {
    "BCA": {
        "1": ["Whole Semester", "Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills", "Computer Organization"],
        "2": ["Whole Semester", "Data Structures", "Discrete Mathematics", "Web Development", "Object Oriented Programming", "Database Management Systems"],
        "3": ["Whole Semester", "Operating Systems", "Computer Networks", "Java Programming", "Software Engineering", "Computer Graphics"],
        "4": ["Whole Semester", "Advanced Database Systems", "Web Technologies", "Project Work"],
        "5": ["Whole Semester", "Artificial Intelligence", "Cyber Security", "Mobile Application Development"],
        "6": ["Whole Semester", "Cloud Computing", "Big Data Analytics", "Project Work"],
    },
    "MCA": staticSemesterData,
    "BCA_INT": {
        "1": ["Whole Semester", "Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills"],
        "2": ["Whole Semester", "Data Structures", "Discrete Mathematics", "Web Development", "Computer Organization"],
        "3": ["Whole Semester", "Operating Systems", "Object Oriented Programming", "Database Management Systems"],
        "4": ["Whole Semester", "Computer Networks", "Java Programming", "Software Engineering"],
        "5": ["Whole Semester", "Computer Graphics", "Web Technologies", "Advanced Database Systems"],
        "6": ["Whole Semester", "Artificial Intelligence", "Cloud Computing", "Project Work"],
        "7": ["Whole Semester", "Big Data Analytics", "Cyber Security", "Mobile Application Development"],
        "8": ["Whole Semester", "Advanced Web Technologies", "Project Work"],
    },
    "MSC_INT_CS": {
        "1": ["Whole Semester", "Fundamentals of IT & Programming", "Digital Logic", "Mathematics-I", "Communication Skills"],
        "2": ["Whole Semester", "Data Structures", "Computer Organization", "Mathematics-II", "Intro to Cyber Security"],
        "3": ["Whole Semester", "Object-Oriented Programming", "Operating Systems", "Database Management Systems", "Network Fundamentals"],
        "4": ["Whole Semester", "Web Technologies", "Software Engineering", "Principles of Information Security", "Python for Security"],
        "5": ["Whole Semester", "Computer Networks & Security", "Cryptography Basics", "Ethical Hacking Fundamentals", "Cyber Law & Ethics"],
        "6": ["Whole Semester", "Secure Coding Practices", "Web Application Security", "Digital Forensics-I", "Minor Project-I"],
        "7": ["Whole Semester", "Network Security & Firewalls", "Malware Analysis", "Intrusion Detection Systems", "Elective-I"],
        "8": ["Whole Semester", "Cloud Security", "Mobile & Wireless Security", "Digital Forensics-II", "Elective-II"],
        "9": ["Whole Semester", "Advanced Cryptography", "IoT Security", "Cyber Threat Intelligence", "Minor Project-II"],
        "10": ["Whole Semester", "Major Project / Internship"],
    },
    "MTECH_CS": {
        "1": ["Whole Semester", "Advanced Data Structures", "Theory of Computation", "Modern Computer Architecture", "Advanced Algorithms"],
        "2": ["Whole Semester", "Machine Learning", "Advanced Database Systems", "Compiler Design", "Research Methodology"],
        "3": ["Whole Semester", "Deep Learning", "Cloud Computing", "Minor Project"],
        "4": ["Whole Semester", "Dissertation / Major Project"],
    },
    "MTECH_CS_EXEC": {
        "1": ["Whole Semester", "Software Project Management", "Advanced Operating Systems", "Data Warehousing & Mining", "IT Strategy"],
        "2": ["Whole Semester", "Agile Methodologies", "Information Systems Security", "Business Intelligence", "Cloud Services"],
        "3": ["Whole Semester", "Big Data Analytics", "DevOps", "Case Studies Project"],
        "4": ["Whole Semester", "Dissertation / Major Project"],
    },
    "MTECH_NM_IS": {
        "1": ["Whole Semester", "Advanced Computer Networks", "Cryptography & Network Security", "Network Programming", "Wireless & Mobile Networks"],
        "2": ["Whole Semester", "Information & System Security", "Network Management & Operations", "Ethical Hacking", "Research Methodology"],
        "3": ["Whole Semester", "Cloud & Data Center Networking", "Intrusion Detection & Prevention Systems", "Digital Forensics", "Minor Project"],
        "4": ["Whole Semester", "Dissertation / Major Project"],
    },
    "MTECH_IA_SE": {
        "1": ["Whole Semester", "Advanced Software Engineering", "Information Architecture & Design", "Software Metrics & Quality Assurance", "Object-Oriented Analysis & Design"],
        "2": ["Whole Semester", "Software Architecture & Patterns", "Component-Based Software Engineering", "User Experience (UX) Design", "Research Methodology"],
        "3": ["Whole Semester", "Software Project & Risk Management", "Agile Software Development", "Service-Oriented Architecture", "Minor Project"],
        "4": ["Whole Semester", "Dissertation / Major Project"],
    },
    "PHD": {
        "1": ["Whole Semester", "Research Methodology", "Advanced Computing", "Statistical Methods"],
        "2": ["Whole Semester", "Machine Learning", "Data Science", "Literature Review"],
        "3": ["Whole Semester", "Artificial Intelligence", "Advanced Algorithms", "Big Data Analytics"],
        "4": ["Whole Semester", "Cyber Security", "Cloud Computing", "Thesis Work"],
        "5": ["Whole Semester", "Advanced Topics in Computing", "Research Seminar"],
        "6": ["Whole Semester", "Thesis Work"],
    },
    "MSC_CS": {
        "1": ["Whole Semester", "Advanced Data Structures", "Theory of Computation", "Advanced Algorithms", "Computer Systems and Networks"],
        "2": ["Whole Semester", "Artificial Intelligence", "Compiler Design", "Advanced Database Systems", "Software Project Management"],
        "3": ["Whole Semester", "Machine Learning", "Cryptography and Network Security", "Cloud Computing", "Elective I"],
        "4": ["Whole Semester", "Major Project"],
    },
    "MSC_IT": {
        "1": ["Whole Semester", "IT Fundamentals", "Web Technologies", "Object-Oriented Programming", "Network Essentials"],
        "2": ["Whole Semester", "Data Warehousing and Mining", "Mobile Computing", "Information Security", "E-Commerce"],
        "3": ["Whole Semester", "Big Data Technologies", "Internet of Things (IoT)", "Digital Image Processing", "Elective II"],
        "4": ["Whole Semester", "Major Project"],
    },
    "MBA_CM": {
        "1": ["Whole Semester", "Principles of Management", "Managerial Economics", "IT for Managers", "Accounting for Managers"],
        "2": ["Whole Semester", "Marketing Management", "Human Resource Management", "Database Management Systems", "Business Communication"],
        "3": ["Whole Semester", "Software Project Management", "E-Business Strategies", "Information Systems Security", "Strategic Management"],
        "4": ["Whole Semester", "Internship and Project Report"],
    },
    "PGDCA": {
        "1": ["Whole Semester", "Computer Fundamentals & PC Software", "Programming in 'C'", "Database Management using FoxPro", "System Analysis and Design"],
        "2": ["Whole Semester", "GUI Programming with Visual Basic", "Web Design and Internet", "Object-Oriented Programming with C++", "Project Work"],
    },
}

export const ResourceTypes = {
    "endsem": { value: "endsem", label: "End Semester" },
    "test1": { value: "test1", label: "Test 1" },
    "test2": { value: "test2", label: "Test 2" },
    "test3": { value: "test3", label: "Test 3" },
    "practical": { value: "practical", label: "Practical" },
    "quiz": { value: "quiz", label: "Quiz" },
}

export const NotesResourceTypes = {
    "written": { value: "written", label: "Hand Written" },
    "teacher": { value: "teacher", label: "Teacher Provided" },
    "sourced": { value: "sourced", label: "Internet Sourced" },
    "mindmap": { value: "mindmap", label: "Mind Map" },
    "testanswers": { value: "testanswers", label: "Test Answers" },
}