import {useState} from "react";
import axios from "axios";
import {LOGIN_URL} from "../utils/urls.js";

export default function useLogin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const login = async (username, password) => {
    setLoading(true);
    axios.post(LOGIN_URL, { username, password }).then((res) => {
      if (res.status === 200) {
        localStorage.setItem('loginUser', username);
        localStorage.setItem('loginPass', password);

        const expiry = new Date(res.data.expiry);
        const token = res.data.token;
        document.cookie = `authtoken=${token}; expires=${expiry.toUTCString()}`;

        setLoggedIn(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }
  return [{ login, loggedIn, loading }];
}