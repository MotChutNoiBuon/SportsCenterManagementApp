export const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('client_id', 'YOUR_CLIENT_ID');
    params.append('client_secret', 'YOUR_CLIENT_SECRET');
  
    const response = await axios.post('http://<your-backend>/o/token/', params);
    return response.data; // sẽ có access_token
  };
  