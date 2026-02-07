// const Config = {
//   API_BASE_URL: `https://uat.coiffeurr.com/auth`,
//   API_Customers: `https://uat.coiffeurr.com/api/v1`,
//   API_Salon_owner: `https://uat.coiffeurr.com/api/v2`,
// };
const Config = {
  API_BASE_URL: `${import.meta.env.VITE_BASE_URL}/auth`,
  API_Customers: `${import.meta.env.VITE_BASE_URL}/api/v1`,
  API_Salon_owner: `${import.meta.env.VITE_BASE_URL}/api/v2`,
};

export default Config;
