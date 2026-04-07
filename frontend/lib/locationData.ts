// Nagpur Region Location Data

export interface LocationData {
  pincode: string;
  villages: string[];
  city: string;
  district: string;
}

// Nagpur Region Pincodes and Villages/Towns
export const NAGPUR_PINCODES: LocationData[] = [
  { pincode: '440001', villages: ['Sitabuldi', 'Dharampeth', 'Civil Lines'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440002', villages: ['Gandhibagh', 'Itwari', 'Mahal'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440003', villages: ['Nehru Nagar', 'Dhantoli', 'Ramdaspeth'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440004', villages: ['Congress Nagar', 'Laxmi Nagar', 'Prakash Nagar'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440008', villages: ['Gokulpeth', 'Laxmi Nagar', 'Shankar Nagar'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440009', villages: ['Shivaji Nagar', 'Lakadganj', 'Mominpura'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440010', villages: ['Nandanvan', 'Kalamna', 'Besa'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440012', villages: ['Manish Nagar', 'Jaripatka', 'Koradi'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440013', villages: ['Bajaj Nagar', 'Hingna', 'Wadi'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440015', villages: ['Kharbi', 'Kamptee Road', 'Kalmeshwar'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440022', villages: ['Sonegaon', 'Airport Area', 'MIHAN'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440024', villages: ['Katol Road', 'Manewada', 'Khapri'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440025', villages: ['Butibori', 'Parseoni', 'Gondkhairi'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440027', villages: ['Umred Road', 'Mouda', 'Saoner'], city: 'Nagpur', district: 'Nagpur' },
  { pincode: '440030', villages: ['Kamptee', 'Kanhan', 'Nara'], city: 'Kamptee', district: 'Nagpur' },
  { pincode: '441101', villages: ['Ramtek', 'Khapa', 'Mansar'], city: 'Ramtek', district: 'Nagpur' },
  { pincode: '441111', villages: ['Kuhi', 'Fetri', 'Chacher'], city: 'Kuhi', district: 'Nagpur' },
  { pincode: '441122', villages: ['Parseoni', 'Mauda', 'Kandri'], city: 'Parseoni', district: 'Nagpur' },
];

export const NAGPUR_CITIES = [
  'Nagpur',
  'Kamptee',
  'Ramtek',
  'Saoner',
  'Katol',
  'Narkhed',
  'Hingna',
  'Umred',
  'Kuhi',
  'Parseoni',
  'Mouda',
  'Kalmeshwar',
];

export const MAHARASHTRA_DISTRICTS = [
  'Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati',
  'Kolhapur', 'Thane', 'Nanded', 'Akola', 'Latur', 'Ahmednagar', 'Dhule',
  'Jalgaon', 'Satara', 'Yavatmal', 'Sangli', 'Beed', 'Buldhana', 'Parbhani',
  'Jalna', 'Osmanabad', 'Wardha', 'Raigad', 'Gondia', 'Washim', 'Gadchiroli',
  'Chandrapur', 'Ratnagiri', 'Sindhudurg', 'Bhandara', 'Hingoli', 'Nandurbar'
];

export const getVillagesByPincode = (pincode: string): string[] => {
  const location = NAGPUR_PINCODES.find(loc => loc.pincode === pincode);
  return location ? location.villages : [];
};

export const getCityByPincode = (pincode: string): string => {
  const location = NAGPUR_PINCODES.find(loc => loc.pincode === pincode);
  return location ? location.city : 'Nagpur';
};

export const getDistrictByPincode = (pincode: string): string => {
  const location = NAGPUR_PINCODES.find(loc => loc.pincode === pincode);
  return location ? location.district : 'Nagpur';
};