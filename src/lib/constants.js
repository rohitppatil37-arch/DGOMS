export const BACKEND_URL =
  'https://script.google.com/macros/s/AKfycbwbdtw2Hjx4qOszBKcrM_BVvkFoppUc040WSmOsejv3noMRcoGQVZO0tCgDrvEJCopLDQ/exec';

export const ROLE_LABELS = {
  superadmin:  { en: 'Super Admin',          mr: 'सुपर प्रशासन' },
  division:    { en: 'Division Officer',      mr: 'विभाग अधिकारी' },
  subdivision: { en: 'Sub-Division Officer',  mr: 'उपविभाग अधिकारी' },
  field:       { en: 'Field Officer',         mr: 'क्षेत्र अधिकारी' },
};

export const DEPT_LABELS = {
  civil:      { en: 'Civil',      mr: 'सिव्हिल'  },
  mechanical: { en: 'Mechanical', mr: 'यांत्रिक' },
  electrical: { en: 'Electrical', mr: 'विद्युत'  },
};

export const PERMS = {
  superadmin:  { cmd: true,  accept: true,  exec: true,  admin: true  },
  division:    { cmd: true,  accept: false, exec: false, admin: false },
  subdivision: { cmd: false, accept: true,  exec: false, admin: false },
  field:       { cmd: false, accept: false, exec: true,  admin: false },
};

export const PROTECTED_ROUTES = ['dash', 'cmd', 'exec', 'log', 'notif', 'admin'];

export const DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
];

export const DISTRICT_MR = {
  Ahmednagar: 'अहमदनगर', Akola: 'अकोला', Amravati: 'अमरावती',
  Aurangabad: 'औरंगाबाद', Beed: 'बीड', Bhandara: 'भंडारा',
  Buldhana: 'बुलढाणा', Chandrapur: 'चंद्रपूर', Dhule: 'धुळे',
  Gadchiroli: 'गडचिरोली', Gondia: 'गोंदिया', Hingoli: 'हिंगोली',
  Jalgaon: 'जळगाव', Jalna: 'जालना', Kolhapur: 'कोल्हापूर',
  Latur: 'लातूर', 'Mumbai City': 'मुंबई शहर', 'Mumbai Suburban': 'मुंबई उपनगर',
  Nagpur: 'नागपूर', Nanded: 'नांदेड', Nandurbar: 'नंदुरबार',
  Nashik: 'नाशिक', Osmanabad: 'उस्मानाबाद', Palghar: 'पालघर',
  Parbhani: 'परभणी', Pune: 'पुणे', Raigad: 'रायगड',
  Ratnagiri: 'रत्नागिरी', Sangli: 'सांगली', Satara: 'सातारा',
  Sindhudurg: 'सिंधुदुर्ग', Solapur: 'सोलापूर', Thane: 'ठाणे',
  Wardha: 'वर्धा', Washim: 'वाशिम', Yavatmal: 'यवतमाळ',
};
