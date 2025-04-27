import axios from "axios";

const BASE_URL = 'https://thanhduong.pythonanywhere.com/';

export default axios.create({
    baseURL: BASE_URL
})