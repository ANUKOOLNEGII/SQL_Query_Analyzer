const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', { email: 'test@example.com', password: 'password123' });
    const token = loginRes.data.data.accessToken;
    console.log("Token:", token.substring(0, 10));
    
    const dRes = await axios.get('http://localhost:5001/api/v1/dataset', { headers: { Authorization: 'Bearer ' + token }});
    console.log("Datasets:", JSON.stringify(dRes.data.data, null, 2));

    const dbRes = await axios.get('http://localhost:5001/api/v1/database', { headers: { Authorization: 'Bearer ' + token }});
    console.log("Databases:", JSON.stringify(dbRes.data.data, null, 2));
  } catch (e) {
    console.log("Error:", e.response ? e.response.data : e.message);
  }
}
test();
