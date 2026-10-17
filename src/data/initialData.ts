import { Faculty, Room, Subject, ScheduleEntry, Exam, NotificationItem } from '../types';

export const INITIAL_ROOMS: Room[] = [
  // E-Block Lecture Halls
  { id: 'room-e212', name: 'E-212 (Smart Lecture Hall)', block: 'E-Block', type: 'Lecture Hall', capacity: 75, floor: 2, features: ['Interactive Projector', 'AC', 'Mic System'] },
  { id: 'room-e315', name: 'E-315 (Gallery Classroom)', block: 'E-Block', type: 'Lecture Hall', capacity: 80, floor: 3, features: ['Tiered Seating', 'AC', 'Dual Displays'] },
  { id: 'room-e109', name: 'E-109 (Seminar Room)', block: 'E-Block', type: 'Lecture Hall', capacity: 60, floor: 1, features: ['Podium Mic', 'Sound System'] },
  { id: 'room-e414', name: 'E-414 (Lecture Hall)', block: 'E-Block', type: 'Lecture Hall', capacity: 70, floor: 4, features: ['Projector', 'Whiteboard'] },
  
  // C-Block Lecture Halls
  { id: 'room-c301', name: 'C-301 (Academic Hall)', block: 'C-Block', type: 'Lecture Hall', capacity: 75, floor: 3, features: ['AC', 'Smart Screen'] },
  { id: 'room-c412', name: 'C-412 (Lecture Hall)', block: 'C-Block', type: 'Lecture Hall', capacity: 65, floor: 4, features: ['Projector', 'Wi-Fi 6'] },
  { id: 'room-c502', name: 'C-502 (Multipurpose Room)', block: 'C-Block', type: 'Lecture Hall', capacity: 60, floor: 5, features: ['Whiteboards', 'AC'] },

  // Computer Labs (USICT E-Block / C-Block Labs)
  { id: 'lab-1', name: 'Lab-1 (Advanced Computing)', block: 'E-Block', type: 'Lab', capacity: 40, floor: 1, features: ['40 High-end i7 PCs', 'Linux/Windows Dual-boot', 'Gigabit LAN'] },
  { id: 'lab-2', name: 'Lab-2 (Software Engineering)', block: 'E-Block', type: 'Lab', capacity: 40, floor: 1, features: ['40 Workstations', 'IDEs & Case Tools', 'UPS Backup'] },
  { id: 'lab-3', name: 'Lab-3 (AI & Machine Learning)', block: 'E-Block', type: 'Lab', capacity: 45, floor: 2, features: ['RTX 4090 GPUs', 'Python/CUDA Suite', 'Jupyter Hub'] },
  { id: 'lab-4', name: 'Lab-4 (Network & Security)', block: 'E-Block', type: 'Lab', capacity: 35, floor: 2, features: ['Cisco Routers/Switches', 'Wireshark Server', 'Firewall Hardware'] },
  { id: 'lab-5', name: 'Lab-5 (IoT & Embedded Systems)', block: 'C-Block', type: 'Lab', capacity: 35, floor: 1, features: ['Raspberry Pi & ESP32 Kits', 'Oscilloscopes', 'Soldering Stations'] },
  { id: 'lab-6', name: 'Lab-6 (Data Science & Analytics)', block: 'C-Block', type: 'Lab', capacity: 40, floor: 2, features: ['Spark & Hadoop Clusters', 'Tableau/R Environment'] },

  // Central Exam Halls
  { id: 'hall-central-a', name: 'Central Exam Hall A (Auditorium Wing)', block: 'Central', type: 'Central Exam Hall', capacity: 160, floor: 0, features: ['CCTV Monitored', 'Signal Jammers', 'Air Conditioned'] },
  { id: 'hall-central-b', name: 'Central Exam Hall B (E-Block Ground)', block: 'Central', type: 'Central Exam Hall', capacity: 120, floor: 0, features: ['CCTV Monitored', 'Soundproofed', 'Anti-Cheating Desks'] }
];

export const INITIAL_FACULTY: Faculty[] = [
  { 
    id: 'fac-pravin', 
    name: 'Prof. Pravin Chandra', 
    designation: 'Professor', 
    department: 'Computer Science', 
    email: 'pravin.chandra@ipu.ac.in', 
    maxHoursPerWeek: 14, 
    assignedHours: 10, 
    specialization: 'Theoretical Computer Science & Algorithms', 
    avatarColor: 'from-blue-600 to-indigo-700',
    officeHours: [
      { id: 'oh-pravin-1', day: 'Tuesday', startTime: '15:00', endTime: '17:00', location: 'Dean Office / Room E-312', mode: 'In-Person', maxStudents: 4, availableFor: ['Algorithms Doubt Clearing', 'PhD & MTech Research'], status: 'Open' },
      { id: 'oh-pravin-2', day: 'Thursday', startTime: '11:00', endTime: '13:00', location: 'Google Meet (Virtual)', mode: 'Virtual (Meet)', meetLink: 'https://meet.google.com/usi-ctpc-ipu', maxStudents: 6, availableFor: ['Online Office Hours', 'Syllabus Review'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-amit', 
    name: 'Prof. Amit Prakash Singh', 
    designation: 'Dean / HOD', 
    department: 'Information Technology', 
    email: 'amit@ipu.ac.in', 
    maxHoursPerWeek: 12, 
    assignedHours: 8, 
    specialization: 'Software Engineering & Cloud Computing', 
    avatarColor: 'from-purple-600 to-violet-800',
    officeHours: [
      { id: 'oh-amit-1', day: 'Wednesday', startTime: '14:00', endTime: '16:00', location: 'Dean Office, E-Block', mode: 'In-Person', maxStudents: 5, availableFor: ['Academic Grievances', 'Project Guidance'], status: 'Open' },
      { id: 'oh-amit-2', day: 'Friday', startTime: '15:00', endTime: '16:30', location: 'Virtual Consultation', mode: 'Virtual (Meet)', meetLink: 'https://meet.google.com/usi-ctap-hod', maxStudents: 8, availableFor: ['Software Engineering Consultation'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-arvinder', 
    name: 'Prof. Arvinder Kaur', 
    designation: 'Professor', 
    department: 'Computer Science', 
    email: 'arvinder@ipu.ac.in', 
    maxHoursPerWeek: 14, 
    assignedHours: 11, 
    specialization: 'Data Mining & Software Quality', 
    avatarColor: 'from-pink-600 to-rose-700',
    officeHours: [
      { id: 'oh-arvinder-1', day: 'Monday', startTime: '14:00', endTime: '16:00', location: 'Room E-314', mode: 'In-Person', maxStudents: 4, availableFor: ['Software Testing Queries', 'Major Project Reviews'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-ramana', 
    name: 'Prof. B. V. Ramana Reddy', 
    designation: 'Professor', 
    department: 'Electronics & Comm.', 
    email: 'bvrr@ipu.ac.in', 
    maxHoursPerWeek: 14, 
    assignedHours: 9, 
    specialization: 'VLSI & Wireless Communications', 
    avatarColor: 'from-emerald-600 to-teal-700',
    officeHours: [
      { id: 'oh-ramana-1', day: 'Thursday', startTime: '14:00', endTime: '16:00', location: 'C-Block VLSI Lab 5', mode: 'In-Person', maxStudents: 4, availableFor: ['Hardware & Circuit Review', 'Research Consultation'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-navin', 
    name: 'Prof. Navin Rajpal', 
    designation: 'Professor', 
    department: 'Computer Science', 
    email: 'navin@ipu.ac.in', 
    maxHoursPerWeek: 14, 
    assignedHours: 10, 
    specialization: 'Computer Vision & Image Processing', 
    avatarColor: 'from-amber-600 to-orange-700',
    officeHours: [
      { id: 'oh-navin-1', day: 'Wednesday', startTime: '11:00', endTime: '13:00', location: 'AI Lab-3 / Room E-205', mode: 'In-Person', maxStudents: 4, availableFor: ['Computer Vision Lab Guidance'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-anuradha', 
    name: 'Dr. Anuradha Chug', 
    designation: 'Associate Professor', 
    department: 'Information Technology', 
    email: 'anuradha.chug@ipu.ac.in', 
    maxHoursPerWeek: 16, 
    assignedHours: 13, 
    specialization: 'Artificial Intelligence & Predictive Modeling', 
    avatarColor: 'from-cyan-600 to-blue-700',
    officeHours: [
      { id: 'oh-anuradha-1', day: 'Monday', startTime: '11:00', endTime: '13:00', location: 'Room E-208', mode: 'In-Person', maxStudents: 5, availableFor: ['Machine Learning Doubts', 'Dataset Consultation'], status: 'Open' },
      { id: 'oh-anuradha-2', day: 'Friday', startTime: '16:00', endTime: '17:00', location: 'Virtual Meet Room', mode: 'Virtual (Meet)', meetLink: 'https://meet.google.com/usi-ctac-ai', maxStudents: 8, availableFor: ['Capstone Project Mentorship'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-sartaj', 
    name: 'Dr. Sartaj Singh Sodhi', 
    designation: 'Associate Professor', 
    department: 'Information Technology', 
    email: 'sartaj@ipu.ac.in', 
    maxHoursPerWeek: 16, 
    assignedHours: 12, 
    specialization: 'Computer Networks & Network Security', 
    avatarColor: 'from-indigo-600 to-blue-800',
    officeHours: [
      { id: 'oh-sartaj-1', day: 'Tuesday', startTime: '14:00', endTime: '16:00', location: 'Network Lab-4, E-Block', mode: 'In-Person', maxStudents: 5, availableFor: ['OOP Java & Network Protocols'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-rahul', 
    name: 'Dr. Rahul Johari', 
    designation: 'Associate Professor', 
    department: 'Information Technology', 
    email: 'rahul@ipu.ac.in', 
    maxHoursPerWeek: 16, 
    assignedHours: 12, 
    specialization: 'Cyber Security & Cryptography', 
    avatarColor: 'from-red-600 to-orange-700',
    officeHours: [
      { id: 'oh-rahul-1', day: 'Thursday', startTime: '15:00', endTime: '17:00', location: 'Room E-210', mode: 'In-Person', maxStudents: 4, availableFor: ['Cryptography & InfoSec Projects'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-kamaldeep', 
    name: 'Dr. Kamaldeep Kaur', 
    designation: 'Assistant Professor', 
    department: 'Computer Science', 
    email: 'kamaldeep@ipu.ac.in', 
    maxHoursPerWeek: 18, 
    assignedHours: 14, 
    specialization: 'Database Management Systems & Big Data', 
    avatarColor: 'from-green-600 to-emerald-800',
    officeHours: [
      { id: 'oh-kamal-1', day: 'Wednesday', startTime: '15:00', endTime: '17:00', location: 'Room E-316', mode: 'In-Person', maxStudents: 5, availableFor: ['DBMS SQL/NoSQL Queries'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-rinkaj', 
    name: 'Dr. Rinkaj Goyal', 
    designation: 'Associate Professor', 
    department: 'Computer Science', 
    email: 'rinkaj@ipu.ac.in', 
    maxHoursPerWeek: 16, 
    assignedHours: 12, 
    specialization: 'Operating Systems & Distributed Systems', 
    avatarColor: 'from-teal-600 to-cyan-800',
    officeHours: [
      { id: 'oh-rinkaj-1', day: 'Tuesday', startTime: '11:00', endTime: '13:00', location: 'Room E-311', mode: 'In-Person', maxStudents: 5, availableFor: ['OS Kernels & Concurrency Doubts'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-jaspreeti', 
    name: 'Dr. Jaspreeti Singh', 
    designation: 'Assistant Professor', 
    department: 'Information Technology', 
    email: 'jaspreeti@ipu.ac.in', 
    maxHoursPerWeek: 18, 
    assignedHours: 15, 
    specialization: 'Data Structures & Python Programming', 
    avatarColor: 'from-violet-600 to-purple-800',
    officeHours: [
      { id: 'oh-jaspreeti-1', day: 'Monday', startTime: '15:00', endTime: '17:00', location: 'Room E-214', mode: 'In-Person', maxStudents: 6, availableFor: ['DSA Problem Solving & Coding Help'], status: 'Open' },
      { id: 'oh-jaspreeti-2', day: 'Thursday', startTime: '16:00', endTime: '17:30', location: 'Virtual Meet Room', mode: 'Virtual (Meet)', meetLink: 'https://meet.google.com/usi-ctjs-dsa', maxStudents: 8, availableFor: ['Python & Algorithms Mentorship'], status: 'Open' }
    ]
  },
  { 
    id: 'fac-pushpendra', 
    name: 'Dr. Pushpendra Singh Bharati', 
    designation: 'Assistant Professor', 
    department: 'Electronics & Comm.', 
    email: 'pushpendra@ipu.ac.in', 
    maxHoursPerWeek: 18, 
    assignedHours: 13, 
    specialization: 'Digital Signal Processing & Microprocessors', 
    avatarColor: 'from-yellow-600 to-amber-800',
    officeHours: [
      { id: 'oh-pushpendra-1', day: 'Wednesday', startTime: '14:00', endTime: '16:00', location: 'Room C-202 (ECE Wing)', mode: 'In-Person', maxStudents: 4, availableFor: ['Digital Electronics & Microprocessor Lab'], status: 'Open' }
    ]
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // --- B.Tech 1st Semester Common / CSE Core ---
  { id: 'sub-am101', code: 'AM-101', name: 'Applied Mathematics - I', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-pravin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-200' },
  { id: 'sub-ap103', code: 'AP-103', name: 'Applied Physics - I', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-navin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-violet-500 bg-violet-500/10 text-violet-800 dark:text-violet-200' },
  { id: 'sub-cs105', code: 'CS-105', name: 'Programming in C & Problem Solving', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-jaspreeti', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' },
  { id: 'sub-es107', code: 'ES-107', name: 'Electrical Science & Circuits', credits: 4, ltp: '3-1-0', type: 'Theory', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-pushpendra', defaultRoomType: 'Lecture Hall', difficulty: 'Medium', colorTag: 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200' },
  { id: 'sub-hs109', code: 'HS-109', name: 'Communication Skills & Ethics', credits: 3, ltp: '2-1-0', type: 'Theory', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-amit', defaultRoomType: 'Lecture Hall', difficulty: 'Foundational', colorTag: 'border-pink-500 bg-pink-500/10 text-pink-800 dark:text-pink-200' },
  { id: 'sub-cs155', code: 'CS-155', name: 'Programming in C Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-jaspreeti', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-emerald-600 bg-emerald-600/10 text-emerald-900 dark:text-emerald-100' },
  { id: 'sub-ap153', code: 'AP-153', name: 'Applied Physics Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-navin', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-violet-600 bg-violet-600/10 text-violet-900 dark:text-violet-100' },
  { id: 'sub-es157', code: 'ES-157', name: 'Electrical Science Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-pushpendra', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-amber-600 bg-amber-600/10 text-amber-900 dark:text-amber-100' },
  { id: 'sub-me159', code: 'ME-159', name: 'Engineering Graphics & CAD Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 1, defaultFacultyId: 'fac-rinkaj', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-teal-600 bg-teal-600/10 text-teal-900 dark:text-teal-100' },

  // --- IT 1st Semester ---
  { id: 'sub-it-am101', code: 'AM-101', name: 'Applied Mathematics - I', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'IT', semester: 1, defaultFacultyId: 'fac-pravin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-200' },
  { id: 'sub-it-cs105', code: 'CS-105', name: 'Programming in C', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'IT', semester: 1, defaultFacultyId: 'fac-sartaj', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' },
  { id: 'sub-it-ap103', code: 'AP-103', name: 'Applied Physics - I', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'IT', semester: 1, defaultFacultyId: 'fac-navin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-violet-500 bg-violet-500/10 text-violet-800 dark:text-violet-200' },
  { id: 'sub-it-es107', code: 'ES-107', name: 'Electrical Science & Circuits', credits: 4, ltp: '3-1-0', type: 'Theory', branch: 'IT', semester: 1, defaultFacultyId: 'fac-pushpendra', defaultRoomType: 'Lecture Hall', difficulty: 'Medium', colorTag: 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200' },
  { id: 'sub-it-cs155', code: 'CS-155', name: 'C Programming Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'IT', semester: 1, defaultFacultyId: 'fac-sartaj', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-emerald-600 bg-emerald-600/10 text-emerald-900 dark:text-emerald-100' },

  // --- ECE 1st Semester ---
  { id: 'sub-ece-am101', code: 'AM-101', name: 'Applied Mathematics - I', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'ECE', semester: 1, defaultFacultyId: 'fac-pravin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-200' },
  { id: 'sub-ece-es107', code: 'ES-107', name: 'Electrical Science & Circuits', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'ECE', semester: 1, defaultFacultyId: 'fac-ramana', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-sky-500 bg-sky-500/10 text-sky-800 dark:text-sky-200' },
  { id: 'sub-ece-ap103', code: 'AP-103', name: 'Applied Physics - I', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'ECE', semester: 1, defaultFacultyId: 'fac-navin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-violet-500 bg-violet-500/10 text-violet-800 dark:text-violet-200' },
  { id: 'sub-ece-es157', code: 'ES-157', name: 'Electrical Science Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'ECE', semester: 1, defaultFacultyId: 'fac-ramana', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-sky-600 bg-sky-600/10 text-sky-900 dark:text-sky-100' },

  // --- CSE 3rd Sem ---
  { id: 'sub-it201', code: 'IT-201', name: 'Data Structures & Algorithms', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 3, defaultFacultyId: 'fac-jaspreeti', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-200' },
  { id: 'sub-cs203', code: 'CS-203', name: 'Computer Architecture', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 3, defaultFacultyId: 'fac-pravin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-indigo-500 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200' },
  { id: 'sub-ec207', code: 'EC-207', name: 'Digital Electronics', credits: 4, ltp: '3-1-0', type: 'Theory', branch: 'CSE', semester: 3, defaultFacultyId: 'fac-pushpendra', defaultRoomType: 'Lecture Hall', difficulty: 'Medium', colorTag: 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200' },
  { id: 'sub-cs251', code: 'CS-251', name: 'Data Structures Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 3, defaultFacultyId: 'fac-jaspreeti', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' },
  { id: 'sub-ec257', code: 'EC-257', name: 'Digital Electronics Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 3, defaultFacultyId: 'fac-pushpendra', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200' },
  
  // --- CSE 5th Sem ---
  { id: 'sub-cs301', code: 'CS-301', name: 'Operating Systems & System Prog.', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 5, defaultFacultyId: 'fac-rinkaj', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-200' },
  { id: 'sub-it305', code: 'IT-305', name: 'Database Management Systems', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'CSE', semester: 5, defaultFacultyId: 'fac-kamaldeep', defaultRoomType: 'Lecture Hall', difficulty: 'Medium', colorTag: 'border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200' },
  { id: 'sub-cs351', code: 'CS-351', name: 'Operating Systems Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 5, defaultFacultyId: 'fac-rinkaj', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-teal-600 bg-teal-600/10 text-teal-900 dark:text-teal-100' },
  { id: 'sub-it355', code: 'IT-355', name: 'DBMS Lab (SQL/NoSQL)', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'CSE', semester: 5, defaultFacultyId: 'fac-kamaldeep', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-cyan-600 bg-cyan-600/10 text-cyan-900 dark:text-cyan-100' },
  
  // --- IT 3rd Sem & 5th Sem ---
  { id: 'sub-it205', code: 'IT-205', name: 'Object Oriented Programming (Java)', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'IT', semester: 3, defaultFacultyId: 'fac-sartaj', defaultRoomType: 'Lecture Hall', difficulty: 'Medium', colorTag: 'border-orange-500 bg-orange-500/10 text-orange-800 dark:text-orange-200' },
  { id: 'sub-it255', code: 'IT-255', name: 'OOP Java Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'IT', semester: 3, defaultFacultyId: 'fac-sartaj', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-orange-600 bg-orange-600/10 text-orange-900 dark:text-orange-100' },
  { id: 'sub-it307', code: 'IT-307', name: 'Computer Networks & Security', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'IT', semester: 5, defaultFacultyId: 'fac-rahul', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-purple-500 bg-purple-500/10 text-purple-800 dark:text-purple-200' },
  { id: 'sub-it357', code: 'IT-357', name: 'Networking & Cisco Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'IT', semester: 5, defaultFacultyId: 'fac-rahul', defaultRoomType: 'Lab', difficulty: 'Medium', colorTag: 'border-purple-600 bg-purple-600/10 text-purple-900 dark:text-purple-100' },

  // --- AI-DS / AI-ML 3rd & 5th Sem ---
  { id: 'sub-ai301', code: 'AI-301', name: 'Applied Machine Learning', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'AI-DS', semester: 5, defaultFacultyId: 'fac-anuradha', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-violet-500 bg-violet-500/10 text-violet-800 dark:text-violet-200' },
  { id: 'sub-ai351', code: 'AI-351', name: 'Machine Learning & PyTorch Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'AI-DS', semester: 5, defaultFacultyId: 'fac-anuradha', defaultRoomType: 'Lab', difficulty: 'High', colorTag: 'border-violet-600 bg-violet-600/10 text-violet-900 dark:text-violet-100' },
  { id: 'sub-ai201', code: 'AI-201', name: 'Foundations of Artificial Intelligence', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'AI-ML', semester: 3, defaultFacultyId: 'fac-navin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-800 dark:text-fuchsia-200' },
  
  // --- ECE ---
  { id: 'sub-ec303', code: 'EC-303', name: 'Microprocessors & Microcontrollers', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'ECE', semester: 5, defaultFacultyId: 'fac-ramana', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-sky-500 bg-sky-500/10 text-sky-800 dark:text-sky-200' },
  { id: 'sub-ec353', code: 'EC-353', name: 'Microcontroller Lab', credits: 2, ltp: '0-0-2', type: 'Practical', branch: 'ECE', semester: 5, defaultFacultyId: 'fac-ramana', defaultRoomType: 'Lab', difficulty: 'High', colorTag: 'border-sky-600 bg-sky-600/10 text-sky-900 dark:text-sky-100' },

  // --- MCA ---
  { id: 'sub-mca101', code: 'MCA-101', name: 'Discrete Mathematics & Optimization', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'MCA', semester: 1, defaultFacultyId: 'fac-pravin', defaultRoomType: 'Lecture Hall', difficulty: 'High', colorTag: 'border-lime-600 bg-lime-600/10 text-lime-900 dark:text-lime-200' },
  { id: 'sub-mca103', code: 'MCA-103', name: 'Software Engineering Principles', credits: 4, ltp: '3-1-0', type: 'Core', branch: 'MCA', semester: 1, defaultFacultyId: 'fac-amit', defaultRoomType: 'Lecture Hall', difficulty: 'Medium', colorTag: 'border-pink-500 bg-pink-500/10 text-pink-800 dark:text-pink-200' },
];

export const INITIAL_SCHEDULE: ScheduleEntry[] = [
  // =========================================================================
  // --- B.TECH CSE 1ST SEMESTER SEC-A (FULL 5-DAY ACADEMIC TIMETABLE) ---
  // =========================================================================
  // Monday (CSE 1st Sem)
  { id: 'sch-c1-mon-1', subjectId: 'sub-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I (Calculus)', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e109', roomName: 'E-109', day: 'Monday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-c1-mon-2', subjectId: 'sub-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I (Optics & Quantum)', facultyId: 'fac-navin', facultyName: 'Prof. Navin Rajpal', roomId: 'room-e109', roomName: 'E-109', day: 'Monday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'violet' },
  { id: 'sch-c1-mon-3', subjectId: 'sub-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C & Logic', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Monday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'emerald' },
  { id: 'sch-c1-mon-4', subjectId: 'sub-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science & Circuits', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e109', roomName: 'E-109', day: 'Monday', slotIndex: 3, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },
  { id: 'sch-c1-mon-5', subjectId: 'sub-cs155', subjectCode: 'CS-155', subjectName: 'C Programming Lab (Batch A1/A2)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'lab-1', roomName: 'Lab-1', day: 'Monday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lab', colorTag: 'emerald' },

  // Tuesday (CSE 1st Sem)
  { id: 'sch-c1-tue-1', subjectId: 'sub-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C (Arrays & Pointers)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Tuesday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'emerald' },
  { id: 'sch-c1-tue-2', subjectId: 'sub-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science (AC Circuit Analysis)', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e109', roomName: 'E-109', day: 'Tuesday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },
  { id: 'sch-c1-tue-3', subjectId: 'sub-hs109', subjectCode: 'HS-109', subjectName: 'Communication Skills & Ethics', facultyId: 'fac-amit', facultyName: 'Prof. Amit Prakash Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Tuesday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'pink' },
  { id: 'sch-c1-tue-4', subjectId: 'sub-ap153', subjectCode: 'AP-153', subjectName: 'Applied Physics Lab (Lasers & Optics)', facultyId: 'fac-navin', facultyName: 'Prof. Navin Rajpal', roomId: 'lab-5', roomName: 'Lab-5', day: 'Tuesday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lab', colorTag: 'violet' },

  // Wednesday (CSE 1st Sem)
  { id: 'sch-c1-wed-1', subjectId: 'sub-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I (Tutorial)', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e109', roomName: 'E-109', day: 'Wednesday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Tutorial', colorTag: 'blue' },
  { id: 'sch-c1-wed-2', subjectId: 'sub-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I (Electromagnetics)', facultyId: 'fac-navin', facultyName: 'Prof. Navin Rajpal', roomId: 'room-e109', roomName: 'E-109', day: 'Wednesday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'violet' },
  { id: 'sch-c1-wed-3', subjectId: 'sub-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C (Functions & Recursion)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Wednesday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'emerald' },
  { id: 'sch-c1-wed-4', subjectId: 'sub-hs109', subjectCode: 'HS-109', subjectName: 'Technical Writing & Presentation', facultyId: 'fac-amit', facultyName: 'Prof. Amit Prakash Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Wednesday', slotIndex: 3, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'pink' },
  { id: 'sch-c1-wed-5', subjectId: 'sub-es157', subjectCode: 'ES-157', subjectName: 'Electrical Science Lab (Circuits)', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'lab-5', roomName: 'Lab-5', day: 'Wednesday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lab', colorTag: 'amber' },

  // Thursday (CSE 1st Sem)
  { id: 'sch-c1-thu-1', subjectId: 'sub-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science (Transformers & Machines)', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e109', roomName: 'E-109', day: 'Thursday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },
  { id: 'sch-c1-thu-2', subjectId: 'sub-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I (Linear Algebra)', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e109', roomName: 'E-109', day: 'Thursday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-c1-thu-3', subjectId: 'sub-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I (Semiconductors)', facultyId: 'fac-navin', facultyName: 'Prof. Navin Rajpal', roomId: 'room-e109', roomName: 'E-109', day: 'Thursday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'violet' },
  { id: 'sch-c1-thu-4', subjectId: 'sub-me159', subjectCode: 'ME-159', subjectName: 'Engineering Graphics & CAD Lab', facultyId: 'fac-rinkaj', facultyName: 'Dr. Rinkaj Goyal', roomId: 'lab-2', roomName: 'Lab-2', day: 'Thursday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lab', colorTag: 'teal' },

  // Friday (CSE 1st Sem)
  { id: 'sch-c1-fri-1', subjectId: 'sub-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C (Dynamic Memory & Files)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Friday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'emerald' },
  { id: 'sch-c1-fri-2', subjectId: 'sub-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I (Differential Equations)', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e109', roomName: 'E-109', day: 'Friday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-c1-fri-3', subjectId: 'sub-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science (Tutorial / Problem Solving)', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e109', roomName: 'E-109', day: 'Friday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Tutorial', colorTag: 'amber' },
  { id: 'sch-c1-fri-4', subjectId: 'sub-hs109', subjectCode: 'HS-109', subjectName: 'Professional Ethics Case Studies', facultyId: 'fac-amit', facultyName: 'Prof. Amit Prakash Singh', roomId: 'room-e109', roomName: 'E-109', day: 'Friday', slotIndex: 3, durationHours: 1, branch: 'CSE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'pink' },

  // =========================================================================
  // --- B.TECH IT 1ST SEMESTER SEC-A ---
  // =========================================================================
  { id: 'sch-it1-mon-1', subjectId: 'sub-it-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-c412', roomName: 'C-412', day: 'Monday', slotIndex: 1, durationHours: 1, branch: 'IT', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-it1-mon-2', subjectId: 'sub-it-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C', facultyId: 'fac-sartaj', facultyName: 'Dr. Sartaj Singh Sodhi', roomId: 'room-c412', roomName: 'C-412', day: 'Monday', slotIndex: 2, durationHours: 1, branch: 'IT', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'emerald' },
  { id: 'sch-it1-mon-3', subjectId: 'sub-it-cs155', subjectCode: 'CS-155', subjectName: 'C Programming Lab', facultyId: 'fac-sartaj', facultyName: 'Dr. Sartaj Singh Sodhi', roomId: 'lab-2', roomName: 'Lab-2', day: 'Monday', slotIndex: 5, durationHours: 2, branch: 'IT', semester: 1, section: 'Sec-A', slotType: 'Lab', colorTag: 'emerald' },
  { id: 'sch-it1-tue-1', subjectId: 'sub-it-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I', facultyId: 'fac-navin', facultyName: 'Prof. Navin Rajpal', roomId: 'room-c412', roomName: 'C-412', day: 'Tuesday', slotIndex: 1, durationHours: 1, branch: 'IT', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'violet' },
  { id: 'sch-it1-wed-1', subjectId: 'sub-it-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science & Circuits', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-c412', roomName: 'C-412', day: 'Wednesday', slotIndex: 2, durationHours: 1, branch: 'IT', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },

  // =========================================================================
  // --- B.TECH ECE 1ST SEMESTER SEC-A ---
  // =========================================================================
  { id: 'sch-ece1-mon-1', subjectId: 'sub-ece-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science & Network Analysis', facultyId: 'fac-ramana', facultyName: 'Prof. B. V. Ramana Reddy', roomId: 'room-c502', roomName: 'C-502', day: 'Monday', slotIndex: 0, durationHours: 1, branch: 'ECE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'sky' },
  { id: 'sch-ece1-mon-2', subjectId: 'sub-ece-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-c502', roomName: 'C-502', day: 'Monday', slotIndex: 2, durationHours: 1, branch: 'ECE', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-ece1-tue-1', subjectId: 'sub-ece-es157', subjectCode: 'ES-157', subjectName: 'Electrical Science & Hardware Lab', facultyId: 'fac-ramana', facultyName: 'Prof. B. V. Ramana Reddy', roomId: 'lab-5', roomName: 'Lab-5', day: 'Tuesday', slotIndex: 2, durationHours: 2, branch: 'ECE', semester: 1, section: 'Sec-A', slotType: 'Lab', colorTag: 'sky' },

  // =========================================================================
  // --- MCA 1ST SEMESTER SEC-A ---
  // =========================================================================
  { id: 'sch-mca1-mon-1', subjectId: 'sub-mca101', subjectCode: 'MCA-101', subjectName: 'Discrete Mathematics & Optimization', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e414', roomName: 'E-414', day: 'Monday', slotIndex: 3, durationHours: 1, branch: 'MCA', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'lime' },
  { id: 'sch-mca1-wed-1', subjectId: 'sub-mca103', subjectCode: 'MCA-103', subjectName: 'Software Engineering Principles', facultyId: 'fac-amit', facultyName: 'Prof. Amit Prakash Singh', roomId: 'room-e414', roomName: 'E-414', day: 'Wednesday', slotIndex: 1, durationHours: 1, branch: 'MCA', semester: 1, section: 'Sec-A', slotType: 'Lecture', colorTag: 'pink' },

  // =========================================================================
  // --- CSE 3rd Sem Sec-A ---
  // =========================================================================
  // Monday
  { id: 'sch-1', subjectId: 'sub-it201', subjectCode: 'IT-201', subjectName: 'Data Structures & Algorithms', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e212', roomName: 'E-212', day: 'Monday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-2', subjectId: 'sub-cs203', subjectCode: 'CS-203', subjectName: 'Computer Architecture', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e212', roomName: 'E-212', day: 'Monday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'indigo' },
  { id: 'sch-3', subjectId: 'sub-ec207', subjectCode: 'EC-207', subjectName: 'Digital Electronics', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e212', roomName: 'E-212', day: 'Monday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },
  { id: 'sch-4', subjectId: 'sub-cs251', subjectCode: 'CS-251', subjectName: 'Data Structures Lab (Batch A1/A2)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'lab-1', roomName: 'Lab-1', day: 'Monday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lab', colorTag: 'emerald' },

  // Tuesday
  { id: 'sch-5', subjectId: 'sub-ec207', subjectCode: 'EC-207', subjectName: 'Digital Electronics', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e212', roomName: 'E-212', day: 'Tuesday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },
  { id: 'sch-6', subjectId: 'sub-it201', subjectCode: 'IT-201', subjectName: 'Data Structures & Algorithms', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e212', roomName: 'E-212', day: 'Tuesday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-7', subjectId: 'sub-cs203', subjectCode: 'CS-203', subjectName: 'Computer Architecture', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e212', roomName: 'E-212', day: 'Tuesday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'indigo' },
  { id: 'sch-8', subjectId: 'sub-ec257', subjectCode: 'EC-257', subjectName: 'Digital Electronics Lab', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'lab-5', roomName: 'Lab-5', day: 'Tuesday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lab', colorTag: 'rose' },

  // Wednesday
  { id: 'sch-9', subjectId: 'sub-it201', subjectCode: 'IT-201', subjectName: 'Data Structures (Tutorial)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e212', roomName: 'E-212', day: 'Wednesday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Tutorial', colorTag: 'blue' },
  { id: 'sch-10', subjectId: 'sub-cs203', subjectCode: 'CS-203', subjectName: 'Computer Architecture', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e212', roomName: 'E-212', day: 'Wednesday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'indigo' },
  { id: 'sch-11', subjectId: 'sub-ec207', subjectCode: 'EC-207', subjectName: 'Digital Electronics', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e212', roomName: 'E-212', day: 'Wednesday', slotIndex: 3, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'amber' },

  // Thursday
  { id: 'sch-12', subjectId: 'sub-cs203', subjectCode: 'CS-203', subjectName: 'Computer Architecture (Tutorial)', facultyId: 'fac-pravin', facultyName: 'Prof. Pravin Chandra', roomId: 'room-e212', roomName: 'E-212', day: 'Thursday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Tutorial', colorTag: 'indigo' },
  { id: 'sch-13', subjectId: 'sub-it201', subjectCode: 'IT-201', subjectName: 'Data Structures & Algorithms', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e212', roomName: 'E-212', day: 'Thursday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },
  { id: 'sch-14', subjectId: 'sub-cs251', subjectCode: 'CS-251', subjectName: 'Advanced Algo Lab (Competitive Code)', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'lab-1', roomName: 'Lab-1', day: 'Thursday', slotIndex: 2, durationHours: 2, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lab', colorTag: 'emerald' },

  // Friday
  { id: 'sch-15', subjectId: 'sub-ec207', subjectCode: 'EC-207', subjectName: 'Digital Electronics (Problem Solving)', facultyId: 'fac-pushpendra', facultyName: 'Dr. Pushpendra Singh Bharati', roomId: 'room-e212', roomName: 'E-212', day: 'Friday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Tutorial', colorTag: 'amber' },
  { id: 'sch-16', subjectId: 'sub-it201', subjectCode: 'IT-201', subjectName: 'Data Structures Case Studies', facultyId: 'fac-jaspreeti', facultyName: 'Dr. Jaspreeti Singh', roomId: 'room-e212', roomName: 'E-212', day: 'Friday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 3, section: 'Sec-A', slotType: 'Lecture', colorTag: 'blue' },

  // =========================================================================
  // --- CSE 5th Sem Sec-A ---
  // =========================================================================
  // Monday
  { id: 'sch-20', subjectId: 'sub-cs301', subjectCode: 'CS-301', subjectName: 'Operating Systems & System Prog.', facultyId: 'fac-rinkaj', facultyName: 'Dr. Rinkaj Goyal', roomId: 'room-e315', roomName: 'E-315', day: 'Monday', slotIndex: 0, durationHours: 1, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'teal' },
  { id: 'sch-21', subjectId: 'sub-it305', subjectCode: 'IT-305', subjectName: 'Database Management Systems', facultyId: 'fac-kamaldeep', facultyName: 'Dr. Kamaldeep Kaur', roomId: 'room-e315', roomName: 'E-315', day: 'Monday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'cyan' },
  { id: 'sch-22', subjectId: 'sub-cs351', subjectCode: 'CS-351', subjectName: 'Operating Systems Kernel Lab', facultyId: 'fac-rinkaj', facultyName: 'Dr. Rinkaj Goyal', roomId: 'lab-2', roomName: 'Lab-2', day: 'Monday', slotIndex: 2, durationHours: 2, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Lab', colorTag: 'teal' },

  // Tuesday
  { id: 'sch-23', subjectId: 'sub-it305', subjectCode: 'IT-305', subjectName: 'Database Management Systems', facultyId: 'fac-kamaldeep', facultyName: 'Dr. Kamaldeep Kaur', roomId: 'room-e315', roomName: 'E-315', day: 'Tuesday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'cyan' },
  { id: 'sch-24', subjectId: 'sub-it355', subjectCode: 'IT-355', subjectName: 'DBMS Lab (SQL/Query Opt)', facultyId: 'fac-kamaldeep', facultyName: 'Dr. Kamaldeep Kaur', roomId: 'lab-2', roomName: 'Lab-2', day: 'Tuesday', slotIndex: 5, durationHours: 2, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Lab', colorTag: 'cyan' },

  // Wednesday
  { id: 'sch-25', subjectId: 'sub-cs301', subjectCode: 'CS-301', subjectName: 'Operating Systems & System Prog.', facultyId: 'fac-rinkaj', facultyName: 'Dr. Rinkaj Goyal', roomId: 'room-e315', roomName: 'E-315', day: 'Wednesday', slotIndex: 1, durationHours: 1, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'teal' },
  { id: 'sch-26', subjectId: 'sub-it305', subjectCode: 'IT-305', subjectName: 'Database Systems (Tutorial)', facultyId: 'fac-kamaldeep', facultyName: 'Dr. Kamaldeep Kaur', roomId: 'room-e315', roomName: 'E-315', day: 'Wednesday', slotIndex: 2, durationHours: 1, branch: 'CSE', semester: 5, section: 'Sec-A', slotType: 'Tutorial', colorTag: 'cyan' },

  // =========================================================================
  // --- AI-DS 5th Sem Sec-A ---
  // =========================================================================
  // Monday
  { id: 'sch-30', subjectId: 'sub-ai301', subjectCode: 'AI-301', subjectName: 'Applied Machine Learning', facultyId: 'fac-anuradha', facultyName: 'Dr. Anuradha Chug', roomId: 'room-c301', roomName: 'C-301', day: 'Monday', slotIndex: 1, durationHours: 1, branch: 'AI-DS', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'violet' },
  { id: 'sch-31', subjectId: 'sub-ai351', subjectCode: 'AI-351', subjectName: 'Machine Learning & PyTorch Lab', facultyId: 'fac-anuradha', facultyName: 'Dr. Anuradha Chug', roomId: 'lab-3', roomName: 'Lab-3', day: 'Monday', slotIndex: 5, durationHours: 2, branch: 'AI-DS', semester: 5, section: 'Sec-A', slotType: 'Lab', colorTag: 'violet' },

  // Tuesday
  { id: 'sch-32', subjectId: 'sub-ai301', subjectCode: 'AI-301', subjectName: 'Applied Machine Learning (Math & Convex Opt)', facultyId: 'fac-anuradha', facultyName: 'Dr. Anuradha Chug', roomId: 'room-c301', roomName: 'C-301', day: 'Tuesday', slotIndex: 0, durationHours: 1, branch: 'AI-DS', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'violet' },

  // =========================================================================
  // --- IT 5th Sem Sec-A ---
  // =========================================================================
  // Monday
  { id: 'sch-40', subjectId: 'sub-it307', subjectCode: 'IT-307', subjectName: 'Computer Networks & Security', facultyId: 'fac-rahul', facultyName: 'Dr. Rahul Johari', roomId: 'room-e109', roomName: 'E-109', day: 'Monday', slotIndex: 0, durationHours: 1, branch: 'IT', semester: 5, section: 'Sec-A', slotType: 'Lecture', colorTag: 'purple' },
  { id: 'sch-41', subjectId: 'sub-it357', subjectCode: 'IT-357', subjectName: 'Networking & Cisco Lab', facultyId: 'fac-rahul', facultyName: 'Dr. Rahul Johari', roomId: 'lab-4', roomName: 'Lab-4', day: 'Monday', slotIndex: 2, durationHours: 2, branch: 'IT', semester: 5, section: 'Sec-A', slotType: 'Lab', colorTag: 'purple' },
];

export const INITIAL_EXAMS: Exam[] = [
  // --- 1st Semester: Minor 1 (Mid-Term 1) ---
  { id: 'exam-1st-m1-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I', branch: 'CSE', semester: 1, date: '2026-02-16', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-pravin', cycle: 'Minor 1', maxMarks: 30, syllabusScope: 'Unit 1 (Calculus & Functions) & Unit 2 (Linear Algebra)' },
  { id: 'exam-1st-m1-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I', branch: 'CSE', semester: 1, date: '2026-02-17', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-navin', cycle: 'Minor 1', maxMarks: 30, syllabusScope: 'Unit 1 (Interference & Diffraction) & Unit 2 (Polarization)' },
  { id: 'exam-1st-m1-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C & Logic', branch: 'CSE', semester: 1, date: '2026-02-18', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-jaspreeti', cycle: 'Minor 1', maxMarks: 30, syllabusScope: 'Unit 1 (C Syntax, Conditionals & Loops) & Unit 2 (Arrays & Strings)' },
  { id: 'exam-1st-m1-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science & Circuits', branch: 'CSE', semester: 1, date: '2026-02-19', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-pushpendra', cycle: 'Minor 1', maxMarks: 30, syllabusScope: 'Unit 1 (DC Circuits, Thevenin & Norton) & Unit 2 (AC Single Phase)' },
  { id: 'exam-1st-m1-hs109', subjectCode: 'HS-109', subjectName: 'Communication Skills & Ethics', branch: 'CSE', semester: 1, date: '2026-02-20', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-amit', cycle: 'Minor 1', maxMarks: 30, syllabusScope: 'Unit 1 (Phonetics & Technical Reading) & Unit 2 (Presentation Skills)' },

  // --- 1st Semester: Minor 2 (Mid-Term 2) ---
  { id: 'exam-1st-m2-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I', branch: 'CSE', semester: 1, date: '2026-04-06', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-pravin', cycle: 'Minor 2', maxMarks: 30, syllabusScope: 'Unit 3 (Differential Equations) & Unit 4 (Partial Differentiation)' },
  { id: 'exam-1st-m2-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I', branch: 'CSE', semester: 1, date: '2026-04-07', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-navin', cycle: 'Minor 2', maxMarks: 30, syllabusScope: 'Unit 3 (Laser & Fiber Optics) & Unit 4 (Quantum Mechanics)' },
  { id: 'exam-1st-m2-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C & Logic', branch: 'CSE', semester: 1, date: '2026-04-08', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-jaspreeti', cycle: 'Minor 2', maxMarks: 30, syllabusScope: 'Unit 3 (Pointers & Dynamic Memory) & Unit 4 (Structures & File I/O)' },
  { id: 'exam-1st-m2-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science & Circuits', branch: 'CSE', semester: 1, date: '2026-04-09', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-pushpendra', cycle: 'Minor 2', maxMarks: 30, syllabusScope: 'Unit 3 (Three Phase Circuits) & Unit 4 (Magnetic Circuits & Transformers)' },
  { id: 'exam-1st-m2-hs109', subjectCode: 'HS-109', subjectName: 'Communication Skills & Ethics', branch: 'CSE', semester: 1, date: '2026-04-10', timeRange: '10:00 AM - 11:30 AM', session: 'Morning (10:00 - 11:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-amit', cycle: 'Minor 2', maxMarks: 30, syllabusScope: 'Unit 3 (Technical Proposals & Reports) & Unit 4 (Corporate Ethics)' },

  // --- 1st Semester: End Sem (Comprehensive University Examination) ---
  { id: 'exam-1st-end-am101', subjectCode: 'AM-101', subjectName: 'Applied Mathematics - I', branch: 'CSE', semester: 1, date: '2026-05-18', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-pravin', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Comprehensive Full Syllabus (Units 1 - 4)' },
  { id: 'exam-1st-end-ap103', subjectCode: 'AP-103', subjectName: 'Applied Physics - I', branch: 'CSE', semester: 1, date: '2026-05-21', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-navin', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Comprehensive Full Syllabus (Units 1 - 4)' },
  { id: 'exam-1st-end-cs105', subjectCode: 'CS-105', subjectName: 'Programming in C & Logic', branch: 'CSE', semester: 1, date: '2026-05-25', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-jaspreeti', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Comprehensive Full Syllabus (Units 1 - 4)' },
  { id: 'exam-1st-end-es107', subjectCode: 'ES-107', subjectName: 'Electrical Science & Circuits', branch: 'CSE', semester: 1, date: '2026-05-28', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-pushpendra', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Comprehensive Full Syllabus (Units 1 - 4)' },
  { id: 'exam-1st-end-hs109', subjectCode: 'HS-109', subjectName: 'Communication Skills & Ethics', branch: 'CSE', semester: 1, date: '2026-06-01', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 130, hallIds: ['hall-central-a', 'room-e109'], paperSetterFacultyId: 'fac-amit', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Comprehensive Full Syllabus (Units 1 - 4)' },
  { id: 'exam-1st-end-cs155', subjectCode: 'CS-155', subjectName: 'Programming in C Lab (Practical Viva)', branch: 'CSE', semester: 1, date: '2026-06-03', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 130, hallIds: ['lab-1'], paperSetterFacultyId: 'fac-jaspreeti', cycle: 'End Sem', maxMarks: 40, syllabusScope: 'Lab Experiments & External Viva Voce' },

  // --- 3rd & 5th Sem Exams ---
  { id: 'exam-3rd-1', subjectCode: 'IT-201', subjectName: 'Data Structures & Algorithms', branch: 'CSE', semester: 3, date: '2026-05-19', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 120, hallIds: ['hall-central-a'], paperSetterFacultyId: 'fac-jaspreeti', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Full Syllabus' },
  { id: 'exam-5th-1', subjectCode: 'EC-303', subjectName: 'Microprocessors & Microcontrollers', branch: 'ECE', semester: 5, date: '2026-05-19', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 80, hallIds: ['hall-central-b'], paperSetterFacultyId: 'fac-ramana', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Full Syllabus' },
  { id: 'exam-5th-2', subjectCode: 'IT-307', subjectName: 'Computer Networks & Security', branch: 'IT', semester: 5, date: '2026-05-22', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 90, hallIds: ['hall-central-a'], paperSetterFacultyId: 'fac-rahul', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Full Syllabus' },
  { id: 'exam-3rd-2', subjectCode: 'CS-203', subjectName: 'Computer Architecture', branch: 'CSE', semester: 3, date: '2026-05-26', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 120, hallIds: ['hall-central-a'], paperSetterFacultyId: 'fac-pravin', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Full Syllabus' },
  { id: 'exam-5th-3', subjectCode: 'AI-301', subjectName: 'Applied Machine Learning', branch: 'AI-DS', semester: 5, date: '2026-05-26', timeRange: '09:30 AM - 12:30 PM', session: 'Morning (09:30 - 12:30)', totalEnrolled: 75, hallIds: ['hall-central-b'], paperSetterFacultyId: 'fac-anuradha', cycle: 'End Sem', maxMarks: 75, syllabusScope: 'Full Syllabus' },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif-1', title: 'Mid-Term Exam Date Sheet Approved', message: 'Dean Academics office has published the GGSIPU Mid-Term Exam schedule for USICT B.Tech & MCA programs.', timestamp: '10 mins ago', type: 'EXAM_NOTICE', read: false, targetRole: 'ALL' },
  { id: 'notif-2', title: 'Lab-1 GPU Upgrade Maintenance', message: 'Lab-1 systems will undergo CUDA suite upgrades on Wednesday 04:00 PM. Practical slots adjusted.', timestamp: '1 hour ago', type: 'ROOM_CHANGE', read: false, targetRole: 'FACULTY' },
  { id: 'notif-3', title: 'Room Allocation Alert', message: 'CSE 3rd Sem Data Structures tutorial shifted to Room E-212 with smart projector enabled.', timestamp: '2 hours ago', type: 'SWAP_ALERT', read: true, targetRole: 'STUDENT' },
];
